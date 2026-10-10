<?php

namespace App\Services;

use App\Models\ResearchAnswer;
use App\Models\ResearchInstrument;
use App\Models\ResearchItem;
use App\Models\ResearchSubmission;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ResearchSurveyService
{
    public const INSTRUMENT_KEY = 'abx-guard-research';

    public function instrument(): ResearchInstrument
    {
        return ResearchInstrument::where('key', self::INSTRUMENT_KEY)
            ->where('is_active', true)->orderByDesc('version')->with('sections.items')->firstOrFail();
    }

    public function activeInstrumentOrNull(): ?ResearchInstrument
    {
        return ResearchInstrument::where('key', self::INSTRUMENT_KEY)->where('is_active', true)
            ->orderByDesc('version')->first();
    }

    public function submission(User $user, ResearchInstrument $instrument, string $stage): ?ResearchSubmission
    {
        return ResearchSubmission::where('user_id', $user->id)
            ->where('instrument_id', $instrument->id)->where('instrument_version', $instrument->version)
            ->where('stage', $stage)->with('answers.item')->first();
    }

    public function evaluationAvailable(User $user, ResearchInstrument $instrument): bool
    {
        return ResearchSubmission::where('user_id', $user->id)->where('instrument_id', $instrument->id)
            ->where('instrument_version', $instrument->version)->where('stage', 'initial')
            ->where('status', 'submitted')->whereNotNull('evaluation_unlocked_at')->exists();
    }

    public function unlockEvaluation(User $user, ResearchInstrument $instrument): ResearchSubmission
    {
        return DB::transaction(function () use ($user, $instrument) {
            $initial = ResearchSubmission::where('user_id', $user->id)->where('instrument_id', $instrument->id)
                ->where('instrument_version', $instrument->version)->where('stage', 'initial')->lockForUpdate()->first();
            if (! $initial || $initial->status !== 'submitted') {
                throw ValidationException::withMessages(['stage' => 'Selesaikan dan kirim tahap awal terlebih dahulu.']);
            }
            if (! $initial->evaluation_unlocked_at) {
                $initial->forceFill(['evaluation_unlocked_at' => now()])->save();
            }

            return $initial;
        });
    }

    public function dashboardSummary(User $user): array
    {
        $instrument = $this->activeInstrumentOrNull();
        if (! $instrument) return ['available' => false];
        $initial = $this->submission($user, $instrument, 'initial');
        $evaluation = $this->submission($user, $instrument, 'evaluation');

        return [
            'available' => true,
            'initialStatus' => $initial?->status,
            'evaluationStatus' => $evaluation?->status,
        ];
    }

    public function pageData(User $user, ResearchInstrument $instrument, string $stage): array
    {
        $submission = $this->submission($user, $instrument, $stage);
        $sections = $instrument->sections->where('stage', $stage)->values();
        $items = $sections->flatMap->items;
        $answers = [];
        $notApplicable = [];

        foreach ($submission?->answers ?? [] as $answer) {
            if ($answer->answer_status === 'answered') {
                $answers[$answer->item->code] = $this->decodeValue($answer->value, $answer->item->answer_type);
            } elseif ($answer->answer_status === 'not_applicable') {
                $notApplicable[] = $answer->item->code;
            }
        }

        return [
            'instrument' => ['title' => $instrument->title, 'version' => $instrument->version],
            'stage' => $stage,
            'evaluationAvailable' => $this->evaluationAvailable($user, $instrument),
            'submission' => $submission ? ['status' => $submission->status, 'submittedAt' => $submission->submitted_at?->toIso8601String(), 'evaluationUnlockedAt' => $submission->evaluation_unlocked_at?->toIso8601String()] : null,
            'sections' => $sections->map(fn ($section) => [
                'key' => $section->key, 'title' => $section->title, 'instruction' => $section->instruction,
                'items' => $section->items->map(fn ($item) => [
                    'code' => $item->code, 'prompt' => $item->prompt, 'type' => $item->answer_type,
                    'options' => $item->options ?? [], 'required' => $item->required,
                ])->values(),
            ])->values(),
            'itemCount' => $items->count(),
            'answers' => (object) $answers,
            'notApplicable' => $notApplicable,
        ];
    }

    public function saveDraft(User $user, ResearchInstrument $instrument, string $stage, array $answers, array $notApplicable): ResearchSubmission
    {
        if ($stage === 'evaluation' && ! $this->evaluationAvailable($user, $instrument)) {
            throw ValidationException::withMessages(['stage' => 'Selesaikan tahap awal sebelum menyimpan evaluasi platform.']);
        }
        return DB::transaction(function () use ($user, $instrument, $stage, $answers, $notApplicable) {
            $submission = $this->findOrCreate($user, $instrument, $stage);
            if ($submission->status === 'submitted') {
                throw ValidationException::withMessages(['stage' => 'Tahap ini sudah dikirim dan tidak dapat diubah.']);
            }

            $this->persistAnswers($submission, $instrument, $stage, $answers, $notApplicable, false);

            return $submission->refresh();
        });
    }

    public function submit(User $user, ResearchInstrument $instrument, string $stage, array $answers, array $notApplicable): ResearchSubmission
    {
        if ($stage === 'evaluation' && ! $this->evaluationAvailable($user, $instrument)) {
            throw ValidationException::withMessages(['stage' => 'Selesaikan tahap awal sebelum mengirim evaluasi platform.']);
        }

        try {
            return DB::transaction(function () use ($user, $instrument, $stage, $answers, $notApplicable) {
                $submission = $this->findOrCreate($user, $instrument, $stage);
                if ($submission->status === 'submitted') {
                    throw ValidationException::withMessages(['stage' => 'Tahap ini sudah pernah dikirim.']);
                }

                $merged = $submission->answers()->with('item')->get()->filter(fn ($answer) => $answer->answer_status === 'answered')
                    ->mapWithKeys(fn ($answer) => [$answer->item->code => $this->decodeValue($answer->value, $answer->item->answer_type)])->all();
                $merged = array_replace($merged, $answers);
                $notApplicable = array_values(array_unique($notApplicable));
                $required = $instrument->sections->where('stage', $stage)->flatMap->items
                    ->filter(fn ($item) => $item->required)->pluck('code')->all();
                $missing = array_values(array_filter($required, fn ($code) => ! in_array($code, $notApplicable, true) && ! $this->hasValue($merged[$code] ?? null)));

                if ($missing) {
                    throw ValidationException::withMessages(collect($missing)->mapWithKeys(fn ($code) => ["answers.$code" => 'Pertanyaan ini perlu dijawab atau ditandai tidak berlaku jika sesuai.'])->all());
                }

                $this->persistAnswers($submission, $instrument, $stage, $merged, $notApplicable, true);
                $submission->forceFill(['status' => 'submitted', 'submitted_at' => now()])->save();

                return $submission->refresh();
            });
        } catch (QueryException $exception) {
            if ($this->isUniqueViolation($exception) && $this->submission($user, $instrument, $stage)?->status === 'submitted') {
                throw ValidationException::withMessages(['stage' => 'Tahap ini sudah pernah dikirim.']);
            }
            throw $exception;
        }
    }

    private function findOrCreate(User $user, ResearchInstrument $instrument, string $stage): ResearchSubmission
    {
        return ResearchSubmission::firstOrCreate([
            'user_id' => $user->id,
            'instrument_id' => $instrument->id,
            'instrument_version' => $instrument->version,
            'stage' => $stage,
        ], ['status' => 'draft', 'started_at' => now()]);
    }

    private function persistAnswers(ResearchSubmission $submission, ResearchInstrument $instrument, string $stage, array $answers, array $notApplicable, bool $complete): void
    {
        $items = $instrument->sections->where('stage', $stage)->flatMap->items->keyBy('code');
        foreach ($items as $code => $item) {
            if (in_array($code, $notApplicable, true)) {
                $submission->answers()->updateOrCreate(['item_id' => $item->id], ['value' => null, 'answer_status' => 'not_applicable']);
                continue;
            }
            if (! array_key_exists($code, $answers)) {
                if ($complete) {
                    $submission->answers()->updateOrCreate(['item_id' => $item->id], ['value' => null, 'answer_status' => 'not_answered']);
                }
                continue;
            }

            $value = $answers[$code];
            if (! $this->hasValue($value)) {
                if ($complete || $submission->answers()->where('item_id', $item->id)->exists()) {
                    $submission->answers()->updateOrCreate(['item_id' => $item->id], ['value' => null, 'answer_status' => 'not_answered']);
                }
                continue;
            }

            $stored = is_array($value) ? json_encode(array_values($value), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR) : (string) $value;
            $submission->answers()->updateOrCreate(['item_id' => $item->id], ['value' => $stored, 'answer_status' => 'answered']);
        }
    }

    private function decodeValue(?string $value, string $type): mixed
    {
        return $type === 'multiple_choice_exclusive' || $type === 'multiple_choice' ? (json_decode($value ?? '[]', true) ?: []) : $value;
    }

    private function hasValue(mixed $value): bool
    {
        return $value !== null && $value !== '' && $value !== [];
    }

    private function isUniqueViolation(QueryException $exception): bool
    {
        return ($exception->errorInfo[0] ?? null) === '23505'
            || (($exception->errorInfo[0] ?? null) === '23000' && (int) ($exception->errorInfo[1] ?? 0) === 1062)
            || str_contains($exception->getMessage(), 'UNIQUE constraint failed');
    }
}

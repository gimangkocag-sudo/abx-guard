<?php

namespace App\Services;

use App\Models\Survey;
use App\Models\SurveySubmission;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SurveyService
{
    /**
     * Survey yang diisi user. Aturan deterministik: di antara baris `surveys` dengan slug KAP dan is_active = true,
     * dipakai versi TERTINGGI. Jika kelak ada lebih dari satu versi aktif, versi lama tetap tersimpan
     * (untuk riwayat/statistik) tetapi tidak dipakai untuk pengisian baru.
     */
    public function activeSurvey(): Survey
    {
        return Survey::where('slug', config('abx.survey_slug'))
            ->where('is_active', true)
            ->orderByDesc('version')
            ->with('sections.questions')
            ->firstOrFail();
    }

    /** Survey default untuk laporan admin: versi aktif tertinggi; jika tidak ada yang aktif, versi terbaru. */
    public function reportingSurvey(): Survey
    {
        return Survey::where('slug', config('abx.survey_slug'))->where('is_active', true)->orderByDesc('version')->first()
            ?? Survey::orderByDesc('version')->firstOrFail();
    }

    public function submissionFor(User $user, Survey $survey): ?SurveySubmission
    {
        return SurveySubmission::where('user_id', $user->id)->where('survey_id', $survey->id)->first();
    }

    /** Struktur survey untuk frontend (section + opsi skala + pertanyaan). */
    public function formData(Survey $survey): array
    {
        return [
            'version' => $survey->version,
            'title' => $survey->title,
            'description' => $survey->description,
            'sections' => $survey->sections->map(fn ($s) => [
                'key' => $s->key,
                'title' => $s->title,
                'instruction' => $s->instruction,
                'options' => config("abx.scales.{$s->scale}"),
                'questions' => $s->questions->map(fn ($q) => [
                    'id' => $q->id, 'code' => $q->code, 'group' => $q->group, 'text' => $q->text,
                ])->values(),
            ])->values(),
        ];
    }

    /** Aturan validasi dibangun dari pertanyaan di database (semua item wajib, nilai harus sesuai skala). */
    public function rulesFor(Survey $survey): array
    {
        $rules = ['answers' => ['required', 'array']];
        foreach ($survey->sections as $section) {
            $allowed = array_column(config("abx.scales.{$section->scale}"), 'value');
            foreach ($section->questions as $q) {
                $rules["answers.{$q->id}"] = ['required', 'string', Rule::in($allowed)];
            }
        }

        return $rules;
    }

    /** Simpan submission + seluruh jawaban dalam satu transaksi. Satu submission per user per survey. */
    public function submit(User $user, Survey $survey, array $answers): SurveySubmission
    {
        if ($this->submissionFor($user, $survey)) {
            throw ValidationException::withMessages(['answers' => 'Survey sudah pernah diisi.']);
        }

        $questionIds = $survey->sections->flatMap->questions->pluck('id');

        try {
            return DB::transaction(function () use ($user, $survey, $answers, $questionIds) {
                $submission = SurveySubmission::create([
                    'user_id' => $user->id,
                    'survey_id' => $survey->id,
                    'survey_version' => $survey->version,
                    'status' => 'submitted',
                    'submitted_at' => now(),
                ]);
                $submission->answers()->createMany(
                    $questionIds->map(fn ($id) => ['question_id' => $id, 'value' => (string) $answers[$id]])->all()
                );

                return $submission;
            });
        } catch (QueryException $e) {
            // Hanya pelanggaran unique (user_id + survey_id) yang berarti "sudah pernah diisi".
            // Error database lain dilempar ulang agar tercatat oleh exception handler Laravel (HTTP 500).
            if ($this->isDuplicateSubmission($e, $user, $survey)) {
                throw ValidationException::withMessages(['answers' => 'Survey sudah pernah diisi.']);
            }

            throw $e;
        }
    }

    private function isDuplicateSubmission(QueryException $e, User $user, Survey $survey): bool
    {
        return $this->isUniqueViolation($e) && $this->submissionFor($user, $survey) !== null;
    }

    private function isUniqueViolation(QueryException $e): bool
    {
        $sqlState = $e->errorInfo[0] ?? null;
        $driverCode = $e->errorInfo[1] ?? null;

        return $sqlState === '23505'                                   // PostgreSQL unique_violation
            || ($sqlState === '23000' && (int) $driverCode === 1062)   // MySQL/MariaDB duplicate entry
            || str_contains($e->getMessage(), 'UNIQUE constraint failed'); // SQLite (testing)
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResearchFilterRequest;
use App\Models\ResearchAnswer;
use App\Models\ResearchInstrument;
use App\Models\ResearchSubmission;
use App\Support\Pagination;
use Inertia\Inertia;
use Inertia\Response;

class ResearchSurveyController extends Controller
{
    public function index(ResearchFilterRequest $request): Response
    {
        $instruments = ResearchInstrument::where('key', 'abx-guard-research')->orderByDesc('version')->get();
        $filters = $request->filters();
        $instrument = $instruments->firstWhere('version', (int) ($filters['version'] ?? 0)) ?? $instruments->first();
        abort_unless($instrument, 404);
        $query = ResearchSubmission::query()->whereIn('instrument_id', $instruments->pluck('id'))->filtered($filters)
            ->when($filters['version'] ?? null, fn ($q, $version) => $q->where('instrument_version', $version))
            ->with('user:id,name,email')->orderByDesc('created_at')->orderByDesc('id');
        $page = (clone $query)->paginate(20)->withQueryString();
        $submittedQuery = (clone $query)->where('status', 'submitted');
        $versionBase = ResearchSubmission::query()->whereIn('instrument_id', $instruments->pluck('id'))
            ->filtered(array_diff_key($filters, ['status' => true]));
        $sections = $instrument->sections()->with('items')->get();
        $distributionBase = (clone $versionBase)->where('instrument_id', $instrument->id)
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status), fn ($q) => $q->where('status', 'submitted'));
        $distributions = $this->distributions($sections, $distributionBase);

        return Inertia::render('Admin/Research/Index', [
            'title' => 'Survei Penelitian',
            'rows' => $page->getCollection()->map(fn ($submission) => [
                'id' => $submission->id, 'userName' => $submission->user?->name, 'userEmail' => $submission->user?->email,
                'stage' => $submission->stage, 'version' => $submission->instrument_version,
                'status' => $submission->status, 'startedAt' => $submission->started_at?->toIso8601String(),
                'submittedAt' => $submission->submitted_at?->toIso8601String(),
            ])->values(),
            'pagination' => Pagination::meta($page),
            'filters' => $request->raw(),
            'summary' => [
                'respondents' => (clone $submittedQuery)->distinct('user_id')->count('user_id'),
                'submissions' => (clone $submittedQuery)->count(),
                'drafts' => (clone $query)->where('status', 'draft')->count(),
                'initial' => (clone $versionBase)->where('stage', 'initial')->where('status', 'submitted')->count(),
                'evaluation' => (clone $versionBase)->where('stage', 'evaluation')->where('status', 'submitted')->count(),
            ],
            'sections' => $distributions,
            'versions' => $instruments->pluck('version')->values(),
        ]);
    }

    public function show(string $submissionId): Response
    {
        $submission = ResearchSubmission::findOrFail($submissionId);
        abort_unless($submission->instrument?->key === 'abx-guard-research', 404);
        $submission->load(['user:id,name,email', 'instrument.sections.items', 'answers.item.section']);
        $answers = $submission->answers->keyBy('item_id');
        $sections = $submission->instrument->sections->where('stage', $submission->stage)->values();

        return Inertia::render('Admin/Research/Show', [
            'submission' => [
                'id' => $submission->id, 'userId' => $submission->user_id, 'userName' => $submission->user?->name,
                'userEmail' => $submission->user?->email, 'instrument' => $submission->instrument->title,
                'version' => $submission->instrument_version, 'stage' => $submission->stage, 'status' => $submission->status,
                'startedAt' => $submission->started_at?->toIso8601String(), 'submittedAt' => $submission->submitted_at?->toIso8601String(),
                'evaluationUnlockedAt' => $submission->evaluation_unlocked_at?->toIso8601String(),
            ],
            'sections' => $sections->map(fn ($section) => [
                'title' => $section->title,
                'items' => $section->items->map(function ($item) use ($answers) {
                    $answer = $answers->get($item->id);
                    return [
                        'code' => $item->code, 'prompt' => $item->prompt,
                        'value' => $answer?->value, 'status' => $answer?->answer_status ?? 'not_answered',
                        'type' => $item->answer_type, 'options' => $item->options ?? [],
                    ];
                })->values(),
            ])->values(),
        ]);
    }

    private function distributions($sections, $baseQuery): array
    {
        $result = [];
        foreach ($sections as $section) {
            $items = [];
            foreach ($section->items as $item) {
                $textOnly = $item->answer_type === 'long_text';
                $counts = ResearchAnswer::query()->selectRaw($textOnly ? 'answer_status, COUNT(*) as total' : 'answer_status, value, COUNT(*) as total')
                    ->where('item_id', $item->id)
                    ->whereHas('submission', function ($query) use ($baseQuery) {
                        $query->whereIn('id', (clone $baseQuery)->select('id'));
                    })->groupBy($textOnly ? ['answer_status'] : ['answer_status', 'value'])->get();
                $distribution = [];
                foreach ($counts as $count) {
                    if ($textOnly) {
                        $label = $count->answer_status === 'answered' ? 'Jawaban teks' : ($count->answer_status === 'not_applicable' ? 'Tidak berlaku' : 'Tidak dijawab');
                        $distribution[$label] = ($distribution[$label] ?? 0) + (int) $count->total;
                        continue;
                    }
                    if ($count->answer_status !== 'answered') {
                        $label = $count->answer_status === 'not_applicable' ? 'Tidak berlaku' : 'Tidak dijawab';
                        $distribution[$label] = ($distribution[$label] ?? 0) + (int) $count->total;
                        continue;
                    }
                    $values = in_array($item->answer_type, ['multiple_choice', 'multiple_choice_exclusive'], true)
                        ? (json_decode($count->value ?? '[]', true) ?: []) : [$count->value];
                    foreach ($values as $value) {
                        $option = collect($item->options ?? [])->firstWhere('value', (string) $value);
                        $label = $option['label'] ?? (string) $value;
                        $distribution[$label] = ($distribution[$label] ?? 0) + (int) $count->total;
                    }
                }
                $items[] = ['code' => $item->code, 'prompt' => $item->prompt, 'distribution' => $distribution];
            }
            $result[] = ['key' => $section->key, 'stage' => $section->stage, 'title' => $section->title, 'items' => $items];
        }

        return $result;
    }
}

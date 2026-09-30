<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\KapFilterRequest;
use App\Models\SurveySubmission;
use App\Services\KapStatisticsService;
use App\Support\Pagination;
use Inertia\Inertia;
use Inertia\Response;

class SurveyResponseController extends Controller
{
    public function index(KapFilterRequest $request, KapStatisticsService $stats): Response
    {
        $filters = $request->filters();

        $page = SurveySubmission::query()
            ->filtered($filters)
            ->with(['user:id,name,email', 'survey:id,version'])
            ->orderByDesc('submitted_at')->orderByDesc('id')
            ->paginate(15)->withQueryString();

        $exportSurvey = $stats->resolveSurvey($filters['survey_id']);

        return Inertia::render('Admin/Survey/Index', [
            'rows' => $page->getCollection()->map(fn ($s) => [
                'id' => $s->id, 'name' => $s->user?->name, 'email' => $s->user?->email,
                'version' => $s->survey?->version, 'submittedAt' => $s->submitted_at?->toIso8601String(), 'status' => $s->status,
            ])->values(),
            'pagination' => Pagination::meta($page),
            'filters' => $request->raw(),
            'surveys' => $stats->surveyOptions(),
            'exportSurvey' => ['id' => $exportSurvey->id, 'version' => $exportSurvey->version],
        ]);
    }

    public function show(SurveySubmission $submission): Response
    {
        $submission->load(['user:id,name,email', 'survey.sections.questions', 'answers']);
        $values = $submission->answers->pluck('value', 'question_id');

        return Inertia::render('Admin/Survey/Show', [
            'submission' => [
                'id' => $submission->id,
                'name' => $submission->user?->name,
                'email' => $submission->user?->email,
                'version' => $submission->survey_version,
                'surveyTitle' => $submission->survey?->title,
                'submittedAt' => $submission->submitted_at?->toIso8601String(),
                'status' => $submission->status,
            ],
            'sections' => $submission->survey->sections->map(function ($section) use ($values) {
                $labels = collect(config("abx.scales.{$section->scale}"))->pluck('label', 'value');

                return [
                    'key' => $section->key,
                    'title' => $section->title,
                    'questions' => $section->questions->map(fn ($q) => [
                        'id' => $q->id, 'code' => $q->code, 'group' => $q->group, 'text' => $q->text,
                        'value' => $values[$q->id] ?? null,
                        'label' => isset($values[$q->id]) ? ($labels[$values[$q->id]] ?? $values[$q->id]) : null,
                    ])->values(),
                ];
            })->values(),
        ]);
    }
}

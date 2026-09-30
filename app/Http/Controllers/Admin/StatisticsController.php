<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\KapFilterRequest;
use App\Services\KapStatisticsService;
use Inertia\Inertia;
use Inertia\Response;

class StatisticsController extends Controller
{
    public function __invoke(KapFilterRequest $request, KapStatisticsService $stats): Response
    {
        $filters = $request->filters();
        $survey = $stats->resolveSurvey($filters['survey_id']);

        return Inertia::render('Admin/Statistics', [
            'stats' => $stats->forSurvey($survey, $filters['from'], $filters['to']),
            'surveys' => $stats->surveyOptions(),
            // select selalu terisi versi yang sedang dilaporkan; versi tidak pernah digabung.
            'filters' => ['survey' => (string) $survey->id] + $request->raw(),
        ]);
    }
}

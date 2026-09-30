<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\KapFilterRequest;
use App\Services\KapExportService;
use App\Services\KapStatisticsService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function kap(KapFilterRequest $request, KapStatisticsService $stats, KapExportService $export): StreamedResponse
    {
        $filters = $request->filters();

        return $export->download($stats->resolveSurvey($filters['survey_id']), $filters);
    }
}

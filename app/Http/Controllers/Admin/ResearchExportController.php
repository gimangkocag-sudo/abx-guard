<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResearchFilterRequest;
use App\Models\ResearchInstrument;
use App\Services\ResearchExportService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ResearchExportController extends Controller
{
    public function __invoke(ResearchFilterRequest $request, ResearchExportService $export): StreamedResponse
    {
        $instruments = ResearchInstrument::where('key', 'abx-guard-research')->orderByDesc('version')->get();
        $filters = $request->filters();
        if (isset($filters['version'])) {
            $instruments = $instruments->where('version', (int) $filters['version'])->values();
        }
        abort_if($instruments->isEmpty(), 404);

        return $export->download($instruments, $filters);
    }
}

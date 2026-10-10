<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResearchSurveyRequest;
use App\Services\ResearchSurveyService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResearchSurveyController extends Controller
{
    public function __construct(private ResearchSurveyService $service) {}

    public function show(Request $request): Response
    {
        $instrument = $this->service->instrument();
        $stage = $request->query('stage', 'initial');
        abort_unless(in_array($stage, ['initial', 'evaluation'], true), 404);
        if ($stage === 'evaluation' && ! $this->service->evaluationAvailable($request->user(), $instrument)) {
            return Inertia::render('Research/Survey', [
                ...$this->service->pageData($request->user(), $instrument, 'initial'),
                'blockedStage' => true,
            ]);
        }

        return Inertia::render('Research/Survey', [
            ...$this->service->pageData($request->user(), $instrument, $stage),
            'blockedStage' => false,
        ]);
    }

    public function draft(ResearchSurveyRequest $request, string $stage)
    {
        $this->service->saveDraft($request->user(), $this->service->instrument(), $stage,
            $request->validated('answers', []), $request->validated('notApplicable', []));

        return back()->with('draftSaved', true);
    }

    public function submit(ResearchSurveyRequest $request, string $stage)
    {
        $this->service->submit($request->user(), $this->service->instrument(), $stage,
            $request->validated('answers', []), $request->validated('notApplicable', []));

        if ($stage === 'initial') {
            return redirect()->route('research-survey.show', ['stage' => 'initial'])
                ->with('success', 'Tahap awal tersimpan. Setelah mendapat pemaparan atau mencoba platform, konfirmasikan untuk membuka tahap evaluasi.');
        }

        return redirect()->route('research-survey.show', ['stage' => 'evaluation'])
            ->with('success', 'Terima kasih. Jawaban evaluasi dan feedback tersimpan.');
    }

    public function unlockEvaluation(Request $request)
    {
        $this->service->unlockEvaluation($request->user(), $this->service->instrument());

        return redirect()->route('research-survey.show', ['stage' => 'evaluation']);
    }
}

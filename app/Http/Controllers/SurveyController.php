<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitSurveyRequest;
use App\Services\SurveyService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SurveyController extends Controller
{
    public function __construct(private SurveyService $surveys) {}

    public function show(Request $request): Response
    {
        $survey = $this->surveys->activeSurvey();
        $submission = $this->surveys->submissionFor($request->user(), $survey);

        return Inertia::render('Abx/Survey', [
            'survey' => $this->surveys->formData($survey),
            'submittedAt' => $submission?->submitted_at?->toIso8601String(),
        ]);
    }

    public function store(SubmitSurveyRequest $request)
    {
        $survey = $this->surveys->activeSurvey();
        $this->surveys->submit($request->user(), $survey, $request->validated('answers'));

        return redirect()->route('kap.show')->with('success', 'Terima kasih telah mengisi KAP Survey ABX Guard.');
    }
}

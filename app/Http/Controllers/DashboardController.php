<?php

namespace App\Http\Controllers;

use App\Services\ChallengeService;
use App\Services\LearningProgressService;
use App\Services\SurveyService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(
        Request $request,
        SurveyService $surveys,
        ChallengeService $challenge,
        LearningProgressService $progress,
    ): Response {
        $user = $request->user();
        $survey = $surveys->activeSurveyOrNull();
        $submission = $survey ? $surveys->submissionFor($user, $survey) : null;

        return Inertia::render('Dashboard', [
            'surveyDone' => (bool) $submission,
            'surveyAvailable' => $survey !== null,
            'surveySubmittedAt' => $submission?->submitted_at?->toIso8601String(),
            'challenge' => $challenge->summaryFor($user),
            'progress' => $progress->summary($user),
        ]);
    }
}

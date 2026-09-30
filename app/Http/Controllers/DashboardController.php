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
        $submission = $surveys->submissionFor($user, $surveys->activeSurvey());

        return Inertia::render('Dashboard', [
            'surveyDone' => (bool) $submission,
            'surveySubmittedAt' => $submission?->submitted_at?->toIso8601String(),
            'challenge' => $challenge->summaryFor($user),
            'progress' => $progress->summary($user),
        ]);
    }
}

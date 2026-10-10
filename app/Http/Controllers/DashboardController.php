<?php

namespace App\Http\Controllers;

use App\Services\ChallengeService;
use App\Services\LearningProgressService;
use App\Services\ResearchSurveyService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(
        Request $request,
        ChallengeService $challenge,
        LearningProgressService $progress,
        ResearchSurveyService $researchSurvey,
    ): Response {
        $user = $request->user();
        return Inertia::render('Dashboard', [
            'challenge' => $challenge->summaryFor($user),
            'progress' => $progress->summary($user),
            'researchSurvey' => $researchSurvey->dashboardSummary($user),
        ]);
    }
}

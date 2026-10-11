<?php

namespace App\Http\Controllers;

use App\Services\ChallengeService;
use App\Services\LearningProgressService;
use App\Services\MythFactService;
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
        MythFactService $mythFact,
        ResearchSurveyService $researchSurvey,
    ): Response {
        $user = $request->user();
        return Inertia::render('Dashboard', [
            'challenge' => $challenge->summaryFor($user),
            'progress' => $progress->summary($user),
            'mythFact' => $mythFact->summaryFor($user),
            'researchSurvey' => $researchSurvey->dashboardSummary($user),
        ]);
    }
}

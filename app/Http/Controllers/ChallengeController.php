<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitChallengeRequest;
use App\Models\ChallengeAttempt;
use App\Services\ChallengeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ChallengeController extends Controller
{
    public function __construct(private ChallengeService $challenge) {}

    public function show(Request $request): Response
    {
        return Inertia::render('Abx/Challenge', [
            'questions' => $this->challenge->questions(),
            'summary' => $this->challenge->summaryFor($request->user()),
        ]);
    }

    public function submit(SubmitChallengeRequest $request): RedirectResponse
    {
        $attempt = $this->challenge->grade($request->user(), $request->validated('answers'));

        return redirect()->route('challenge.result', $attempt);
    }

    public function result(string $attemptId, Request $request): Response
    {
        $attempt = ChallengeAttempt::where('user_id', $request->user()->id)->findOrFail($attemptId);
        Gate::authorize('view', $attempt);

        return Inertia::render('Abx/ChallengeResult', $this->challenge->result($attempt));
    }
}

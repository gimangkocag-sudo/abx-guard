<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitChallengeRequest;
use App\Models\ChallengeAttempt;
use App\Services\ChallengeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
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

    public function check(Request $request): JsonResponse
    {
        $data = $request->validate([
            'question_id' => ['required', 'integer', 'exists:challenge_questions,id'],
            'answer' => ['required', 'string', Rule::in(ChallengeService::ANSWERS)],
        ]);

        return response()->json($this->challenge->check((int) $data['question_id'], $data['answer']));
    }

    public function submit(SubmitChallengeRequest $request): RedirectResponse
    {
        $attempt = $this->challenge->grade($request->user(), $request->validated('answers'));

        return redirect()->route('challenge.result', $attempt);
    }

    public function result(ChallengeAttempt $attempt): Response
    {
        Gate::authorize('view', $attempt);

        return Inertia::render('Abx/ChallengeResult', $this->challenge->result($attempt));
    }
}

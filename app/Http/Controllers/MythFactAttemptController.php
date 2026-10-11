<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitMythFactAttemptRequest;
use App\Services\MythFactService;
use Illuminate\Http\JsonResponse;

class MythFactAttemptController extends Controller
{
    public function store(SubmitMythFactAttemptRequest $request, MythFactService $mythFact): JsonResponse
    {
        $attempt = $mythFact->complete($request->user(), $request->validated('answers'));

        return response()->json([
            'attempt' => [
                'score' => $attempt->score,
                'total' => $attempt->total,
                'completedAt' => $attempt->completed_at?->toIso8601String(),
            ],
        ], 201);
    }
}

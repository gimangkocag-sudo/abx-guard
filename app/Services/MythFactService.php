<?php

namespace App\Services;

use App\Models\MythFactAttempt;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MythFactService
{
    public const ANSWERS = ['mitos', 'fakta'];

    public function questions(): array
    {
        return config('myth_fact.questions', []);
    }

    public function complete(User $user, array $answers): MythFactAttempt
    {
        $questions = $this->questions();
        $normalizedAnswers = [];
        $score = 0;

        foreach ($questions as $question) {
            $answer = (string) $answers[$question['id']];
            $normalizedAnswers[(string) $question['id']] = $answer;
            $score += $answer === $question['correct_answer'] ? 1 : 0;
        }

        return DB::transaction(fn () => MythFactAttempt::create([
            'user_id' => $user->id,
            'score' => $score,
            'total' => count($questions),
            'answers' => $normalizedAnswers,
            'completed_at' => now(),
        ]));
    }

    public function summaryFor(User $user): array
    {
        $attempts = MythFactAttempt::where('user_id', $user->id);
        $latest = (clone $attempts)
            ->orderByDesc('completed_at')
            ->orderByDesc('id')
            ->first();

        return [
            'attempts' => (clone $attempts)->count(),
            'latest' => $latest ? [
                'score' => $latest->score,
                'total' => $latest->total,
                'completedAt' => $latest->completed_at?->toIso8601String(),
            ] : null,
        ];
    }
}

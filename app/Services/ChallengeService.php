<?php

namespace App\Services;

use App\Models\ChallengeAttempt;
use App\Models\ChallengeQuestion;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ChallengeService
{
    public const ANSWERS = ['mitos', 'fakta'];

    /** Pertanyaan untuk frontend: tanpa kunci jawaban dan penjelasan. */
    public function questions(): array
    {
        return ChallengeQuestion::orderBy('sort')->get(['id', 'statement'])->toArray();
    }

    /** Semua pertanyaan wajib dijawab; nilai hanya mitos/fakta. Skor dari klien tidak pernah dibaca. */
    public function rules(): array
    {
        $rules = ['answers' => ['required', 'array']];
        foreach (ChallengeQuestion::pluck('id') as $id) {
            $rules["answers.{$id}"] = ['required', 'string', Rule::in(self::ANSWERS)];
        }

        return $rules;
    }

    public function grade(User $user, array $answers): ChallengeAttempt
    {
        $questions = ChallengeQuestion::orderBy('sort')->get();

        return DB::transaction(function () use ($user, $answers, $questions) {
            $score = 0;
            $rows = [];
            foreach ($questions as $q) {
                $given = (string) $answers[$q->id];
                $correct = $given === $q->correct_answer;
                $score += $correct ? 1 : 0;
                $rows[] = ['challenge_question_id' => $q->id, 'answer' => $given, 'is_correct' => $correct];
            }

            $attempt = ChallengeAttempt::create([
                'user_id' => $user->id,
                'score' => $score,
                'total' => $questions->count(),
                'completed_at' => now(),
            ]);
            $attempt->answers()->createMany($rows);

            return $attempt;
        });
    }

    public function summaryFor(User $user): array
    {
        $done = ChallengeAttempt::where('user_id', $user->id)->whereNotNull('completed_at');
        $best = (clone $done)->orderByDesc('score')->orderByDesc('completed_at')->first();
        $last = (clone $done)->latest('completed_at')->first();

        return [
            'best' => $best ? ['score' => $best->score, 'total' => $best->total] : null,
            'attempts' => (clone $done)->count(),
            'lastAttemptId' => $last?->id,
        ];
    }

    public function result(ChallengeAttempt $attempt): array
    {
        $attempt->load('answers.question');

        return [
            'attempt' => [
                'id' => $attempt->id,
                'score' => $attempt->score,
                'total' => $attempt->total,
                'completedAt' => $attempt->completed_at?->toIso8601String(),
            ],
            'review' => $attempt->answers->sortBy(fn ($a) => $a->question->sort)->map(fn ($a) => [
                'statement' => $a->question->statement,
                'answer' => $a->answer,
                'correctAnswer' => $a->question->correct_answer,
                'isCorrect' => $a->is_correct,
                'explanation' => $a->question->explanation,
            ])->values()->all(),
        ];
    }
}

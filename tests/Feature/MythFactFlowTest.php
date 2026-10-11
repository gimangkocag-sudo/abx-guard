<?php

namespace Tests\Feature;

use App\Models\ChallengeAttempt;
use App\Models\MythFactAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MythFactFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_opening_the_quiz_does_not_mark_it_completed(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)->get('/belajar/myth-or-fact')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Abx/MythOrFact')
                ->has('questions', 5)
                ->where('questions.0.id', 1));

        $this->assertDatabaseCount('myth_fact_attempts', 0);
        $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('mythFact.attempts', 0)
            ->where('mythFact.latest', null));
    }

    public function test_scores_are_calculated_and_latest_attempt_is_isolated_per_user(): void
    {
        $firstUser = User::factory()->create(['email_verified_at' => now()]);
        $secondUser = User::factory()->create(['email_verified_at' => now()]);
        $questions = config('myth_fact.questions');
        $allCorrect = collect($questions)->mapWithKeys(fn (array $question) => [$question['id'] => $question['correct_answer']])->all();
        $oneWrong = $allCorrect;
        $firstId = $questions[0]['id'];
        $oneWrong[$firstId] = $allCorrect[$firstId] === 'mitos' ? 'fakta' : 'mitos';
        $allWrong = collect($questions)->mapWithKeys(fn (array $question) => [
            $question['id'] => $question['correct_answer'] === 'mitos' ? 'fakta' : 'mitos',
        ])->all();

        $this->actingAs($firstUser)->postJson('/belajar/myth-or-fact/attempts', ['answers' => $allCorrect])
            ->assertCreated()->assertJsonPath('attempt.score', 5)->assertJsonPath('attempt.total', 5);
        $this->postJson('/belajar/myth-or-fact/attempts', ['answers' => $oneWrong])
            ->assertCreated()->assertJsonPath('attempt.score', 4);

        // A higher AMR Challenge score must never be used for the Myth-or-Fact card.
        ChallengeAttempt::create(['user_id' => $secondUser->id, 'score' => 5, 'total' => 5, 'completed_at' => now()]);
        $this->actingAs($secondUser)->postJson('/belajar/myth-or-fact/attempts', ['answers' => $allWrong])
            ->assertCreated()->assertJsonPath('attempt.score', 0);

        $this->assertDatabaseCount('myth_fact_attempts', 3);
        $this->actingAs($firstUser)->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('mythFact.attempts', 2)
            ->where('mythFact.latest.score', 4)
            ->where('mythFact.latest.total', 5));
        $this->actingAs($secondUser)->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('mythFact.attempts', 1)
            ->where('mythFact.latest.score', 0)
            ->where('mythFact.latest.total', 5));

        $this->assertSame(4, MythFactAttempt::where('user_id', $firstUser->id)->latest('id')->firstOrFail()->score);
        $this->assertSame(0, MythFactAttempt::where('user_id', $secondUser->id)->latest('id')->firstOrFail()->score);
    }

    public function test_attempt_submission_requires_authentication_and_all_known_answers(): void
    {
        $answers = collect(config('myth_fact.questions'))
            ->mapWithKeys(fn (array $question) => [$question['id'] => $question['correct_answer']])
            ->all();

        $this->postJson('/belajar/myth-or-fact/attempts', ['answers' => $answers])->assertUnauthorized();

        $user = User::factory()->create(['email_verified_at' => now()]);
        $this->actingAs($user)->postJson('/belajar/myth-or-fact/attempts', ['answers' => [1 => 'mitos']])
            ->assertUnprocessable();

        $answers[99] = 'mitos';
        $this->postJson('/belajar/myth-or-fact/attempts', ['answers' => $answers])->assertUnprocessable();
        $this->assertDatabaseCount('myth_fact_attempts', 0);
    }
}

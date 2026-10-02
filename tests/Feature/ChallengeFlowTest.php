<?php

namespace Tests\Feature;

use App\Models\ChallengeAttempt;
use App\Models\ChallengeQuestion;
use App\Models\User;
use Database\Seeders\ChallengeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ChallengeFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_challenge_hides_answers_scores_and_persists_attempts_server_side(): void
    {
        $this->seed(ChallengeSeeder::class);
        $user = User::factory()->create(['email_verified_at' => now()]);
        $questions = ChallengeQuestion::orderBy('sort')->get();

        $this->actingAs($user)->get('/amr-challenge')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Abx/Challenge')
                ->has('questions', 5)
                ->missing('questions.0.correct_answer')
                ->missing('questions.0.explanation'));

        $this->postJson('/amr-challenge/periksa', [
            'question_id' => $questions[0]->id,
            'answer' => 'mitos',
        ])->assertNotFound();

        $correct = $questions->mapWithKeys(fn ($question) => [$question->id => $question->correct_answer])->all();
        $firstId = $questions[0]->id;
        $incorrect = $correct;
        $incorrect[$firstId] = $correct[$firstId] === 'mitos' ? 'fakta' : 'mitos';

        $this->post('/amr-challenge', ['answers' => $incorrect, 'score' => 5])->assertRedirect();
        $firstAttempt = ChallengeAttempt::where('user_id', $user->id)->latest('id')->firstOrFail();
        $this->assertSame(4, $firstAttempt->score);
        $this->assertSame(5, $firstAttempt->total);
        $this->assertSame(5, $firstAttempt->answers()->count());

        $this->post('/amr-challenge', ['answers' => $correct, 'score' => 0])->assertRedirect();
        $secondAttempt = ChallengeAttempt::where('user_id', $user->id)->latest('id')->firstOrFail();
        $this->assertSame(5, $secondAttempt->score);
        $this->assertDatabaseCount('challenge_attempts', 2);
        $this->assertDatabaseCount('challenge_answers', 10);

        $this->get('/amr-challenge/hasil/'.$secondAttempt->id)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Abx/ChallengeResult')
                ->where('attempt.score', 5)
                ->has('review', 5)
                ->has('review.0.correctAnswer')
                ->has('review.0.explanation'));

        $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('challenge.best.score', 5)
            ->where('challenge.attempts', 2)
            ->where('challenge.lastAttemptId', $secondAttempt->id));
    }
}

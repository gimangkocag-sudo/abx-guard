<?php

namespace Tests\Feature;

use App\Models\Survey;
use App\Models\User;
use Database\Seeders\SurveySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SurveyFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_kap_survey_has_36_items_validates_and_saves_once_per_version(): void
    {
        $this->seed(SurveySeeder::class);
        $user = User::factory()->create(['email_verified_at' => now()]);
        $survey = Survey::where('slug', config('abx.survey_slug'))
            ->where('is_active', true)
            ->with('sections.questions')
            ->firstOrFail();

        $this->actingAs($user)->get('/kap-survey')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Abx/Survey')
                ->has('survey.sections', 4));

        $this->assertSame(36, $survey->sections->sum(fn ($section) => $section->questions->count()));
        $this->assertSame(
            ['Ease of Use', 'Efficiency & Integration', 'User Confidence', 'Acceptance'],
            $survey->sections->firstWhere('key', 'acceptance')->questions->pluck('group')->unique()->values()->all(),
        );

        $this->post('/kap-survey', ['answers' => []])->assertSessionHasErrors();

        $answers = [];
        foreach ($survey->sections as $section) {
            $value = config("abx.scales.{$section->scale}")[0]['value'];
            foreach ($section->questions as $question) {
                $answers[$question->id] = $value;
            }
        }

        $this->post('/kap-survey', ['answers' => $answers])->assertRedirect('/kap-survey');
        $this->assertDatabaseCount('survey_submissions', 1);
        $this->assertDatabaseCount('survey_answers', 36);

        $this->from('/kap-survey')->post('/kap-survey', ['answers' => $answers])->assertSessionHasErrors('answers');
        $this->assertDatabaseCount('survey_submissions', 1);

        $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->where('surveyDone', true)
            ->where('surveyAvailable', true));
    }
}

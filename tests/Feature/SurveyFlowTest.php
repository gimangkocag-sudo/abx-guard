<?php

namespace Tests\Feature;

use App\Models\Survey;
use App\Models\SurveyAnswer;
use App\Models\SurveyQuestion;
use App\Models\SurveySubmission;
use App\Models\User;
use Database\Seeders\ResearchInstrumentSeeder;
use Database\Seeders\SurveySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SurveyFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_instrument_is_the_only_active_user_survey_and_old_responses_remain_historical(): void
    {
        $this->seed([SurveySeeder::class, ResearchInstrumentSeeder::class]);
        $user = User::factory()->create(['email_verified_at' => now()]);
        $legacySurvey = Survey::where('slug', config('abx.survey_slug'))->firstOrFail();
        $legacyQuestion = SurveyQuestion::firstOrFail();
        $legacy = SurveySubmission::create([
            'user_id' => $user->id,
            'survey_id' => $legacySurvey->id,
            'survey_version' => $legacySurvey->version,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
        SurveyAnswer::create(['submission_id' => $legacy->id, 'question_id' => $legacyQuestion->id, 'value' => 'benar']);

        $this->actingAs($user)->get('/kap-survey')->assertRedirect('/survei-penelitian');
        $this->post('/kap-survey', ['answers' => []])->assertRedirect('/survei-penelitian');
        $this->actingAs($user)->get('/survei-penelitian')
            ->assertInertia(fn (Assert $page) => $page->component('Research/Survey')->where('stage', 'initial'));

        $this->assertSame(36, SurveyQuestion::count());
        $this->assertDatabaseHas('survey_answers', ['submission_id' => $legacy->id, 'question_id' => $legacyQuestion->id, 'value' => 'benar']);
        $this->assertDatabaseCount('research_submissions', 0);
        $this->assertDatabaseCount('survey_submissions', 1);
    }
}

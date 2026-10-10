<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Survey;
use App\Models\ResearchInstrument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SurveyRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_survey_urls_require_authentication_then_redirect_to_official_instrument(): void
    {
        $this->get('/survey')->assertRedirect('/login');
        $this->get('/kap-survey')->assertRedirect('/login');

        $this->actingAs(User::factory()->create())
            ->get('/survey')->assertRedirect('/survei-penelitian');
        $this->get('/kap-survey')->assertRedirect('/survei-penelitian');
        $this->post('/kap-survey', ['answers' => []])->assertRedirect('/survei-penelitian');
    }

    public function test_default_seeder_publishes_new_instrument_without_reseeding_legacy_kap(): void
    {
        $this->seed();

        $this->assertSame(0, Survey::count());
        $this->assertDatabaseHas('research_instruments', ['key' => 'abx-guard-research', 'version' => 1, 'is_active' => true]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SurveyRouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_survey_alias_requires_authentication_and_redirects_to_kap_survey(): void
    {
        $this->get('/survey')->assertRedirect('/login');

        $this->actingAs(User::factory()->create())
            ->get('/survey')
            ->assertRedirect('/kap-survey');
    }
}

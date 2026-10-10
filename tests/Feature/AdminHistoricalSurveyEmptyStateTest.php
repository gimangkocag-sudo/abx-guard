<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminHistoricalSurveyEmptyStateTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_admin_pages_render_empty_state_when_no_kap_catalog_exists(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/admin/statistics')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Statistics')
                ->where('stats.survey', null)
                ->where('stats.total', 0)
                ->has('stats.sections', 0)
                ->has('surveys', 0));

        $this->actingAs($admin)->get('/admin/survey')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Survey/Index')
                ->where('exportSurvey', null)
                ->has('rows', 0)
                ->has('surveys', 0));
    }

    public function test_legacy_export_without_a_catalog_returns_only_csv_headers(): void
    {
        $response = $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get('/admin/export/kap');

        $response->assertOk();
        $csv = $response->streamedContent();

        $this->assertStringStartsWith("\xEF\xBB\xBFsubmission_id,user_name,user_email,survey_id,survey_version,submitted_at,status", $csv);
        $this->assertStringNotContainsString('K1', $csv);
    }
}

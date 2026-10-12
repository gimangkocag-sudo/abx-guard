<?php

namespace Tests\Feature;

use App\Models\PharmacistStaff;
use App\Models\ResearchInstrument;
use App\Models\ResearchItem;
use App\Models\ResearchStaffMembership;
use App\Models\ResearchSubmission;
use App\Models\SurveyQuestion;
use App\Models\User;
use App\Services\ResearchSurveyService;
use Database\Seeders\ResearchInstrumentSeeder;
use Database\Seeders\SurveySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ResearchSurveyFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ResearchInstrumentSeeder::class);
    }

    private function instrument(): ResearchInstrument
    {
        return ResearchInstrument::with('sections.items')->where('key', ResearchSurveyService::INSTRUMENT_KEY)->firstOrFail();
    }

    private function answersFor(string $stage): array
    {
        $answers = [];
        foreach ($this->instrument()->sections->where('stage', $stage)->flatMap->items as $item) {
            $answers[$item->code] = match ($item->answer_type) {
                'short_text' => 'QA initials',
                'integer' => '18',
                'multiple_choice' => ['instagram', 'tiktok'],
                'multiple_choice_exclusive' => ['media_sosial'],
                'likert' => '4',
                'true_false_unknown' => 'tidak_tahu',
                'single_choice' => $item->code === 'E01' ? 'lupa_tidak_pernah' : ($item->options[0]['value'] ?? ''),
                default => '',
            };
        }

        return $answers;
    }

    public function test_official_survey_replaces_the_active_kap_form_and_has_all_source_items(): void
    {
        $user = User::factory()->create();
        $this->get('/survei-penelitian')->assertRedirect('/login');

        $this->actingAs($user)->get('/survei-penelitian')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Research/Survey')
                ->where('stage', 'initial')
                ->where('itemCount', 30)
                ->has('sections', 6)
                ->where('sections.0.items.0.code', 'A01')
                ->where('sections.1.items.1.code', 'B02')
                ->where('sections.3.items.5.code', 'D106'));

        $this->actingAs($user)->get('/kap-survey')->assertRedirect('/survei-penelitian');
        $this->actingAs($user)->post('/kap-survey', ['answers' => []])->assertRedirect('/survei-penelitian');

        $this->actingAs($user)->get('/survei-penelitian?stage=evaluation')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Research/Survey')
                ->where('blockedStage', true)
                ->where('stage', 'initial'));

        $instrument = $this->instrument();
        $this->seed(SurveySeeder::class);
        $this->assertSame(47, $instrument->sections->sum(fn ($section) => $section->items->count()));
        $this->assertSame(36, SurveyQuestion::count());
    }

    public function test_admin_can_also_open_the_user_research_survey(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();

        $this->actingAs($admin)->get('/survei-penelitian')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Research/Survey')
                ->where('stage', 'initial')
                ->where('itemCount', 30));
    }

    public function test_rerunning_instrument_seeder_preserves_existing_submissions_and_answers(): void
    {
        $user = User::factory()->create();
        $instrument = $this->instrument();

        app(ResearchSurveyService::class)->saveDraft($user, $instrument, 'initial', ['A01' => 'Inisial tersimpan'], []);

        $this->seed(ResearchInstrumentSeeder::class);

        $this->assertDatabaseHas('research_submissions', [
            'user_id' => $user->id,
            'instrument_id' => $instrument->id,
            'stage' => 'initial',
            'status' => 'draft',
        ]);
        $this->assertDatabaseHas('research_answers', [
            'submission_id' => ResearchSubmission::where('user_id', $user->id)->value('id'),
            'item_id' => ResearchItem::where('code', 'A01')->value('id'),
            'value' => 'Inisial tersimpan',
        ]);
    }

    public function test_frontend_and_backend_limits_social_platforms_and_exclusive_unknown_option(): void
    {
        $user = User::factory()->create();
        $url = '/survei-penelitian/initial/draft';
        $this->actingAs($user)->from('/survei-penelitian')->post($url, ['answers' => ['A05' => ['instagram', 'tiktok', 'youtube']]])
            ->assertSessionHasErrors('answers.A05');

        $this->actingAs($user)->from('/survei-penelitian')->post($url, ['answers' => ['A05' => ['instagram', 'invalid']]])
            ->assertSessionHasErrors('answers.A05.1');

        $this->actingAs($user)->from('/survei-penelitian')->post($url, ['answers' => ['B02' => ['tidak_tahu_tidak_pernah', 'media_sosial']]])
            ->assertSessionHasErrors('answers.B02');

        $this->actingAs($user)->from('/survei-penelitian')->post($url, ['answers' => ['A03' => 'lainnya']])
            ->assertSessionHasErrors('answers.A03');
        $this->actingAs($user)->from('/survei-penelitian')->post($url, ['answers' => ['C01' => '6']])
            ->assertSessionHasErrors('answers.C01');

        $this->assertDatabaseCount('research_submissions', 0);
    }

    public function test_draft_resume_initial_submission_and_evaluation_are_persisted_separately(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->from('/survei-penelitian')->post('/survei-penelitian/initial/draft', [
            'answers' => ['A01' => 'Inisial QA', 'A05' => ['instagram', 'tiktok']],
        ])->assertRedirect();
        $this->assertDatabaseHas('research_answers', ['item_id' => ResearchItem::where('code', 'A01')->value('id'), 'value' => 'Inisial QA']);
        $this->actingAs($user)->get('/survei-penelitian')->assertInertia(fn (Assert $page) => $page
            ->where('submission.status', 'draft')->where('answers.A01', 'Inisial QA'));

        $initial = $this->answersFor('initial');
        unset($initial['E02'], $initial['E06']);
        $this->actingAs($user)->from('/survei-penelitian')->post('/survei-penelitian/initial/submit', [
            'answers' => $initial, 'notApplicable' => ['E02', 'E06'],
        ])->assertRedirect('/survei-penelitian?stage=initial');

        $this->assertDatabaseHas('research_submissions', ['user_id' => $user->id, 'stage' => 'initial', 'status' => 'submitted']);
        $this->assertDatabaseHas('research_answers', ['submission_id' => ResearchSubmission::where('user_id', $user->id)->where('stage', 'initial')->value('id'), 'item_id' => ResearchItem::where('code', 'E02')->value('id'), 'answer_status' => 'not_applicable']);

        $this->actingAs($user)->get('/survei-penelitian?stage=evaluation')->assertInertia(fn (Assert $page) => $page->where('blockedStage', true));
        $this->actingAs($user)->post('/survei-penelitian/evaluation/unlock')
            ->assertRedirect('/survei-penelitian?stage=evaluation');
        $this->assertNotNull(ResearchSubmission::where('user_id', $user->id)->where('stage', 'initial')->value('evaluation_unlocked_at'));
        $this->actingAs($user)->get('/survei-penelitian?stage=evaluation')->assertInertia(fn (Assert $page) => $page
            ->where('stage', 'evaluation')->where('itemCount', 17)->where('blockedStage', false));

        $evaluation = $this->answersFor('evaluation');
        unset($evaluation['H01'], $evaluation['H02'], $evaluation['H03']);
        $this->actingAs($user)->post('/survei-penelitian/evaluation/submit', ['answers' => $evaluation])
            ->assertRedirect('/survei-penelitian?stage=evaluation');
        $this->assertDatabaseHas('research_submissions', ['user_id' => $user->id, 'stage' => 'evaluation', 'status' => 'submitted']);
        $evaluationSubmission = ResearchSubmission::where('user_id', $user->id)->where('stage', 'evaluation')->firstOrFail();
        $this->assertDatabaseHas('research_answers', ['submission_id' => $evaluationSubmission->id, 'item_id' => ResearchItem::where('code', 'H01')->value('id'), 'answer_status' => 'not_answered']);
        $this->assertDatabaseHas('research_answers', ['submission_id' => $evaluationSubmission->id, 'item_id' => ResearchItem::where('code', 'G01')->value('id'), 'value' => '4']);
        $this->assertSame(2, ResearchSubmission::where('user_id', $user->id)->count());

        $this->actingAs($user)->from('/survei-penelitian?stage=evaluation')->post('/survei-penelitian/evaluation/submit', ['answers' => $evaluation])
            ->assertSessionHasErrors('stage');
        $this->assertSame(2, ResearchSubmission::where('user_id', $user->id)->count());
    }

    public function test_evaluation_draft_rejects_stale_initial_answers_and_saves_evaluation_answers(): void
    {
        $user = User::factory()->create();
        $instrument = $this->instrument();
        $initial = $this->answersFor('initial');
        unset($initial['E02'], $initial['E06']);

        app(ResearchSurveyService::class)->submit($user, $instrument, 'initial', $initial, ['E02', 'E06']);
        app(ResearchSurveyService::class)->unlockEvaluation($user, $instrument);

        $this->actingAs($user)
            ->from('/survei-penelitian?stage=evaluation')
            ->post('/survei-penelitian/evaluation/draft', ['answers' => ['A01' => 'stale initial answer', 'F01' => '4']])
            ->assertSessionHasErrors('answers.A01');

        $this->assertDatabaseCount('research_submissions', 1);

        $this->actingAs($user)
            ->from('/survei-penelitian?stage=evaluation')
            ->post('/survei-penelitian/evaluation/draft', ['answers' => ['F01' => '4']])
            ->assertRedirect('/survei-penelitian?stage=evaluation');

        $evaluationSubmission = ResearchSubmission::where('user_id', $user->id)->where('stage', 'evaluation')->firstOrFail();
        $this->assertDatabaseHas('research_answers', [
            'submission_id' => $evaluationSubmission->id,
            'item_id' => ResearchItem::where('code', 'F01')->value('id'),
            'value' => '4',
            'answer_status' => 'answered',
        ]);
        $this->assertDatabaseMissing('research_answers', [
            'submission_id' => $evaluationSubmission->id,
            'item_id' => ResearchItem::where('code', 'A01')->value('id'),
        ]);
    }

    public function test_users_cannot_view_or_export_admin_research_responses(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->get('/admin/research-survey')->assertForbidden();
        $this->actingAs($user)->get('/admin/research-survey/export')->assertForbidden();
    }

    public function test_research_staff_can_view_reports_without_admin_access_and_membership_is_independent(): void
    {
        $staff = User::factory()->create(['role' => 'user']);
        ResearchStaffMembership::create(['user_id' => $staff->id, 'active' => true]);

        $respondent = User::factory()->create();
        $submission = app(ResearchSurveyService::class)->saveDraft(
            $respondent,
            $this->instrument(),
            'initial',
            ['A01' => 'Jawaban tersimpan di database'],
            [],
        );

        $this->actingAs($staff)->get('/admin/research-survey')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Research/Index')
                ->where('rows.0.id', $submission->id)
                ->where('rows.0.userName', $respondent->name)
                ->where('canManageAdmin', false)
                ->where('canViewResearchReports', true));
        $this->actingAs($staff)->get('/admin/research-survey/export')->assertOk();
        $this->actingAs($staff)->get("/admin/research-survey/{$submission->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Research/Show')
                ->where('submission.userId', $respondent->id)
                ->where('sections.0.items.0.value', 'Jawaban tersimpan di database'));
        $this->actingAs($staff)->get('/admin/users')->assertForbidden();
        $this->actingAs($staff)->get('/admin/statistics')->assertForbidden();
        $this->assertSame('user', $staff->fresh()->role);

        $pharmacist = User::factory()->create(['role' => 'user']);
        PharmacistStaff::create(['user_id' => $pharmacist->id, 'active' => true]);
        $this->actingAs($pharmacist)->get('/admin/research-survey')->assertForbidden();
    }

    public function test_research_staff_membership_command_grants_and_revokes_only_report_access(): void
    {
        $staff = User::factory()->create(['role' => 'user']);

        $this->artisan('research:staff', ['email' => $staff->email])->assertExitCode(0);
        $this->assertDatabaseHas('research_staff_memberships', ['user_id' => $staff->id, 'active' => true]);
        $this->assertSame('user', $staff->fresh()->role);

        $this->artisan('research:staff', ['email' => $staff->email, '--revoke' => true])->assertExitCode(0);
        $this->assertDatabaseHas('research_staff_memberships', ['user_id' => $staff->id, 'active' => false]);
        $this->actingAs($staff)->get('/admin/research-survey')->assertForbidden();
    }

    public function test_submit_validation_failure_does_not_mark_submission_complete(): void
    {
        $user = User::factory()->create();
        $answers = $this->answersFor('initial');
        unset($answers['A01'], $answers['E02'], $answers['E06']);

        $this->actingAs($user)->from('/survei-penelitian')->post('/survei-penelitian/initial/submit', [
            'answers' => $answers,
            'notApplicable' => ['E02', 'E06'],
        ])->assertSessionHasErrors('answers.A01');

        $this->assertDatabaseCount('research_submissions', 0);
        $this->assertDatabaseCount('research_answers', 0);
    }

    public function test_admin_export_uses_raw_data_and_escapes_formula_cells(): void
    {
        $user = User::factory()->create();
        $instrument = $this->instrument();
        $answers = $this->answersFor('initial');
        $answers['A01'] = '=SUM(1,2)';
        unset($answers['E02'], $answers['E06']);
        app(ResearchSurveyService::class)->submit($user, $instrument, 'initial', $answers, ['E02', 'E06']);

        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $this->actingAs($admin)->get('/admin/research-survey')
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('Admin/Research/Index')->where('summary.respondents', 1));
        $this->actingAs($admin)->get('/admin')->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')->where('stats.researchSubmissions', 1)->where('stats.initialSubmissions', 1));
        $this->actingAs($admin)->get('/admin/users')->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Users')->has('users', 2)->where('users.1.researchInitialDone', true));
        $researchSubmission = ResearchSubmission::where('user_id', $user->id)->firstOrFail();
        $this->actingAs($admin)->get("/admin/research-survey/{$researchSubmission->id}")
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('Admin/Research/Show')
            ->where('sections.0.items.0.value', '=SUM(1,2)')
            ->where('submission.evaluationUnlockedAt', null));
        $csv = $this->actingAs($admin)->get('/admin/research-survey/export')->assertOk()->streamedContent();
        $this->assertStringContainsString("'=SUM(1,2)", $csv);
        $this->assertStringContainsString('A01_status', $csv);
        $this->assertStringContainsString('not_applicable', $csv);
    }
}

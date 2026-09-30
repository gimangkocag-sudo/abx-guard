<?php

namespace Tests\Feature;

use App\Models\ChallengeAttempt;
use App\Models\Survey;
use App\Models\SurveySubmission;
use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use RuntimeException;
use Tests\TestCase;

/**
 * Ditulis tanpa dapat dijalankan (tidak ada PHP di lingkungan penulis). Jalankan: php artisan test
 * Membutuhkan Breeze (UserFactory) dan migration Fase 1-2. Jika gagal, kirim outputnya.
 */
class AdminPhase3Test extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function admin(): User
    {
        $u = User::factory()->create();
        $u->forceFill(['role' => 'admin'])->save();

        return $u;
    }

    private function submit(User $user, Survey $survey, ?string $at = null): SurveySubmission
    {
        $sub = SurveySubmission::create([
            'user_id' => $user->id, 'survey_id' => $survey->id, 'survey_version' => $survey->version,
            'status' => 'submitted', 'submitted_at' => $at ? Carbon::parse($at) : now(),
        ]);
        foreach ($survey->sections()->with('questions')->get() as $section) {
            $value = config("abx.scales.{$section->scale}")[0]['value'];
            foreach ($section->questions as $q) {
                $sub->answers()->create(['question_id' => $q->id, 'value' => $value]);
            }
        }

        return $sub;
    }

    private function v1(): Survey
    {
        return Survey::where('slug', config('abx.survey_slug'))->firstOrFail();
    }

    public function test_admin_routes_require_admin(): void
    {
        $user = User::factory()->create();
        $sub = $this->submit($user, $this->v1());
        $attempt = ChallengeAttempt::create(['user_id' => $user->id, 'score' => 3, 'total' => 5, 'completed_at' => now()]);
        $urls = ['/admin', '/admin/users', '/admin/survey', "/admin/survey/{$sub->id}", '/admin/statistics', '/admin/export/kap', '/admin/challenge', "/admin/challenge/{$attempt->id}"];

        foreach ($urls as $url) {
            $this->get($url)->assertRedirect('/login');
            $this->actingAs($user)->get($url)->assertForbidden();
            $this->app['auth']->logout();
        }
        $admin = $this->admin();
        foreach ($urls as $url) {
            $this->actingAs($admin)->get($url)->assertOk();
        }
    }

    public function test_user_cannot_open_another_users_challenge_result(): void
    {
        [$a, $b] = [User::factory()->create(), User::factory()->create()];
        $attempt = ChallengeAttempt::create(['user_id' => $a->id, 'score' => 5, 'total' => 5, 'completed_at' => now()]);

        $this->actingAs($b)->get("/amr-challenge/hasil/{$attempt->id}")->assertForbidden();
        $this->actingAs($a)->get("/amr-challenge/hasil/{$attempt->id}")->assertOk();
    }

    public function test_export_respects_filters_and_has_no_password(): void
    {
        $jan = User::factory()->create(['email' => 'jan@example.test']);
        $feb = User::factory()->create(['email' => 'feb@example.test']);
        $this->submit($jan, $this->v1(), '2026-01-10 10:00:00');
        $this->submit($feb, $this->v1(), '2026-02-10 10:00:00');

        $csv = $this->actingAs($this->admin())->get('/admin/export/kap?from=2026-01-01&to=2026-01-31')->streamedContent();

        $this->assertStringContainsString('jan@example.test', $csv);
        $this->assertStringNotContainsString('feb@example.test', $csv);
        $this->assertStringContainsString('submission_id', $csv);
        $this->assertStringContainsString('K1', $csv);
        $this->assertStringContainsString('C20', $csv);
        $this->assertStringNotContainsStringIgnoringCase('password', $csv);
    }

    public function test_statistics_never_mix_survey_versions(): void
    {
        $v1 = $this->v1();
        $v2 = Survey::create(['slug' => 'kap-test-v2', 'title' => 'KAP v2', 'version' => 2, 'is_active' => false]);
        $section = $v2->sections()->create(['key' => 'knowledge', 'title' => 'Knowledge', 'scale' => 'knowledge', 'sort' => 1]);
        $section->questions()->create(['code' => 'Z1', 'text' => 'Uji v2', 'sort' => 1]);

        $this->submit(User::factory()->create(), $v1);
        $this->submit(User::factory()->create(), $v1);
        $this->submit(User::factory()->create(), $v2);
        $admin = $this->admin();

        $this->actingAs($admin)->get('/admin/statistics?survey='.$v1->id)
            ->assertInertia(fn (Assert $p) => $p->component('Admin/Statistics')->where('stats.total', 2)->where('stats.survey.version', 1));
        $this->actingAs($admin)->get('/admin/statistics?survey='.$v2->id)
            ->assertInertia(fn (Assert $p) => $p->where('stats.total', 1)->where('stats.survey.version', 2));
    }

    public function test_admin_seeder_does_not_overwrite_existing_admin_password(): void
    {
        config(['abx.admin.email' => 'existing-admin@example.test', 'abx.admin.password' => 'New-Configured-Pass!']);
        $admin = User::where('role', 'admin')->firstOrFail();
        $storedPassword = $admin->password;
        $adminCount = User::where('role', 'admin')->count();

        (new AdminSeeder)->run();

        $this->assertSame($storedPassword, $admin->fresh()->password);
        $this->assertSame($adminCount, User::where('role', 'admin')->count());
    }
    public function test_admin_seeder_requires_env_credentials_outside_dev(): void
    {
        $this->app->detectEnvironment(fn () => 'production');
        config(['abx.admin.email' => null, 'abx.admin.password' => 'Str0ng-Prod-Pass!']);

        $this->expectException(RuntimeException::class);
        (new AdminSeeder)->run();
    }
}

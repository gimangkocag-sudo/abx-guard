<?php

namespace Tests\Feature;

use App\Models\PharmacistConversation;
use App\Models\PharmacistMessage;
use App\Models\PharmacistStaff;
use App\Models\PharmacistStaffAudit;
use App\Models\User;
use App\Services\PharmacistConnectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminPharmacistStaffManagementTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_grant_staff_access_without_changing_user_role_and_audit_is_recorded(): void
    {
        $admin = $this->admin();
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($admin)->put("/admin/users/{$user->id}/pharmacist-staff", ['role' => 'admin', 'active' => false]);

        $response->assertRedirect();
        $this->assertDatabaseHas('pharmacist_staff', ['user_id' => $user->id, 'active' => true]);
        $this->assertDatabaseHas('pharmacist_staff_audits', [
            'actor_user_id' => $admin->id,
            'target_user_id' => $user->id,
            'action' => PharmacistStaffAudit::ACTION_GRANTED,
            'was_active' => false,
            'is_active' => true,
        ]);
        $this->assertSame('user', $user->fresh()->role);

        $this->actingAs($user)->get('/pharmacist/inbox')->assertOk();
        $this->actingAs($admin)->get('/admin/users')->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Users')
            ->where('activePharmacistStaffCount', 1)
            ->where('users.0.pharmacistStaffStatus', 'active'));
    }

    public function test_admin_can_revoke_staff_access_without_deleting_conversation_or_messages(): void
    {
        $admin = $this->admin();
        $staff = User::factory()->create(['role' => 'user']);
        PharmacistStaff::create(['user_id' => $staff->id, 'active' => true]);
        $owner = User::factory()->create();
        $conversation = $owner->pharmacistConversations()->create([
            'status' => PharmacistConversation::STATUS_OPEN,
            'assigned_staff_id' => $staff->id,
        ]);
        $message = $conversation->messages()->create(['sender_id' => $owner->id, 'body' => 'Riwayat tetap disimpan']);

        $this->actingAs($admin)->delete("/admin/users/{$staff->id}/pharmacist-staff")->assertRedirect();

        $this->assertDatabaseHas('pharmacist_staff', ['user_id' => $staff->id, 'active' => false]);
        $this->assertDatabaseHas('pharmacist_staff_audits', [
            'actor_user_id' => $admin->id,
            'target_user_id' => $staff->id,
            'action' => PharmacistStaffAudit::ACTION_REVOKED,
            'was_active' => true,
            'is_active' => false,
        ]);
        $this->assertNull($conversation->fresh()->assigned_staff_id);
        $this->assertSame('Riwayat tetap disimpan', $message->fresh()->body);
        $this->actingAs($staff)->get('/pharmacist/inbox')->assertForbidden();
        $this->assertSame('user', $staff->fresh()->role);
    }

    public function test_user_cannot_grant_or_revoke_staff_access(): void
    {
        $user = User::factory()->create();
        $target = User::factory()->create();

        $this->actingAs($user)->put("/admin/users/{$target->id}/pharmacist-staff")->assertForbidden();
        $this->delete("/admin/users/{$target->id}/pharmacist-staff")->assertForbidden();

        $this->assertDatabaseMissing('pharmacist_staff', ['user_id' => $target->id]);
        $this->assertDatabaseCount('pharmacist_staff_audits', 0);
    }

    public function test_admin_role_does_not_grant_inbox_access_implicitly_but_can_be_explicitly_assigned(): void
    {
        $admin = $this->admin();
        $targetAdmin = $this->admin();

        $this->actingAs($targetAdmin)->get('/pharmacist/inbox')->assertForbidden();
        $this->actingAs($admin)->put("/admin/users/{$targetAdmin->id}/pharmacist-staff")->assertRedirect();

        $this->assertSame('admin', $targetAdmin->fresh()->role);
        $this->assertDatabaseHas('pharmacist_staff', ['user_id' => $targetAdmin->id, 'active' => true]);
        $this->assertDatabaseHas('pharmacist_staff_audits', [
            'actor_user_id' => $admin->id,
            'target_user_id' => $targetAdmin->id,
            'action' => PharmacistStaffAudit::ACTION_GRANTED,
        ]);
        $this->actingAs($targetAdmin)->get('/pharmacist/inbox')->assertOk();
    }

    public function test_disabling_last_staff_makes_effective_service_unavailable_and_warns_admin(): void
    {
        $admin = $this->admin();
        $staff = User::factory()->create();
        PharmacistStaff::create(['user_id' => $staff->id, 'active' => true]);
        config(['abx.pharmacist_connect.operational' => true]);

        $response = $this->actingAs($admin)->delete("/admin/users/{$staff->id}/pharmacist-staff");

        $response->assertRedirect()->assertSessionHas('warning');
        $this->assertFalse(app(PharmacistConnectService::class)->isOperational());
        $this->assertDatabaseHas('pharmacist_staff', ['user_id' => $staff->id, 'active' => false]);
        $this->actingAs(User::factory()->create())->postJson('/pharmacist-connect/conversations')->assertStatus(503);
    }

    public function test_staff_status_filter_and_status_survive_a_fresh_page_request(): void
    {
        $admin = $this->admin();
        $active = User::factory()->create();
        $inactive = User::factory()->create();
        $unassigned = User::factory()->create();
        PharmacistStaff::create(['user_id' => $active->id, 'active' => true]);
        PharmacistStaff::create(['user_id' => $inactive->id, 'active' => false]);

        $this->actingAs($admin)->get('/admin/users?staff=active')->assertInertia(fn (Assert $page) => $page
            ->where('filters.staff', 'active')
            ->has('users', 1)
            ->where('users.0.id', $active->id)
            ->where('users.0.pharmacistStaffStatus', 'active'));

        $this->get('/admin/users?staff=inactive')->assertInertia(fn (Assert $page) => $page
            ->has('users', 1)
            ->where('users.0.id', $inactive->id)
            ->where('users.0.pharmacistStaffStatus', 'inactive'));

        $this->get('/admin/users?staff=none')->assertInertia(fn (Assert $page) => $page
            ->has('users', 2)
            ->where('users.0.id', $unassigned->id)
            ->where('users.0.pharmacistStaffStatus', 'none')
            ->where('users.1.id', $admin->id));
    }
}

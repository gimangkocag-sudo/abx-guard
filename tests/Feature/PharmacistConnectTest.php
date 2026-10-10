<?php

namespace Tests\Feature;

use App\Events\PharmacistMessageCreated;
use App\Models\PharmacistConversation;
use App\Models\PharmacistStaff;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class PharmacistConnectTest extends TestCase
{
    use RefreshDatabase;

    private function staff(string $role = 'user'): User
    {
        $staff = User::factory()->create();
        $staff->forceFill(['role' => $role])->save();
        PharmacistStaff::create(['user_id' => $staff->id, 'active' => true]);

        return $staff;
    }

    private function enableService(): void
    {
        config(['abx.pharmacist_connect.operational' => true]);
    }

    public function test_user_can_start_send_and_reopen_persisted_conversation(): void
    {
        $this->enableService();
        $this->staff();
        $user = User::factory()->create();

        $created = $this->actingAs($user)->postJson('/pharmacist-connect/conversations');
        $created->assertCreated();
        $conversationId = $created->json('conversation.id');

        $sent = $this->postJson("/pharmacist-connect/conversations/{$conversationId}/messages", ['body' => 'Bagaimana aturan penggunaan obat ini?']);
        $sent->assertCreated()->assertJsonPath('message.body', 'Bagaimana aturan penggunaan obat ini?');
        $stored = PharmacistConversation::findOrFail($conversationId)->messages()->firstOrFail();
        $this->assertSame('Bagaimana aturan penggunaan obat ini?', $stored->body);
        $this->assertStringNotContainsString('Bagaimana aturan penggunaan obat ini?', DB::table('pharmacist_messages')->where('id', $stored->id)->value('body'));
        $this->assertDatabaseHas('pharmacist_messages', [
            'conversation_id' => $conversationId,
            'sender_id' => $user->id,
        ]);

        $this->getJson("/pharmacist-connect/conversations/{$conversationId}")
            ->assertOk()
            ->assertJsonPath('messages.0.body', 'Bagaimana aturan penggunaan obat ini?');
    }

    public function test_users_cannot_access_another_users_conversation(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $conversation = $owner->pharmacistConversations()->create(['status' => PharmacistConversation::STATUS_OPEN]);

        $this->actingAs($other)->getJson("/pharmacist-connect/conversations/{$conversation->id}")->assertForbidden();
        $this->postJson("/pharmacist-connect/conversations/{$conversation->id}/messages", ['body' => 'Tidak berwenang'])->assertForbidden();
    }

    public function test_authorized_staff_can_claim_read_and_reply(): void
    {
        $this->enableService();
        $owner = User::factory()->create();
        $staff = $this->staff();
        $conversation = $owner->pharmacistConversations()->create(['status' => PharmacistConversation::STATUS_OPEN]);
        $ownerMessage = $conversation->messages()->create(['sender_id' => $owner->id, 'body' => 'Saya ingin bertanya.']);

        $this->actingAs($staff)->get('/pharmacist/inbox')->assertOk()->assertInertia(fn ($page) => $page->component('Pharmacist/Inbox'));
        $this->actingAs($staff)->postJson("/pharmacist/inbox/conversations/{$conversation->id}/claim")->assertOk();
        $this->getJson("/pharmacist/inbox/conversations/{$conversation->id}")->assertOk();
        $this->postJson("/pharmacist/inbox/conversations/{$conversation->id}/messages", ['body' => 'Silakan jelaskan informasi pada kemasan obat.'])
            ->assertCreated()
            ->assertJsonPath('message.is_mine', true);

        $storedReply = $conversation->messages()->where('sender_id', $staff->id)->firstOrFail();
        $this->assertSame('Silakan jelaskan informasi pada kemasan obat.', $storedReply->body);
        $this->assertDatabaseHas('pharmacist_messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $staff->id,
        ]);
        $this->assertNotNull($ownerMessage->fresh()->recipient_read_at);
    }

    public function test_admin_without_explicit_staff_permission_and_regular_user_cannot_open_inbox(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $user = User::factory()->create();

        $this->actingAs($admin)->get('/pharmacist/inbox')->assertForbidden();
        $this->actingAs($user)->get('/pharmacist/inbox/conversations')->assertForbidden();
    }

    public function test_staff_cannot_read_or_reply_to_conversation_assigned_to_another_staff_member(): void
    {
        $this->enableService();
        $owner = User::factory()->create();
        $staff = $this->staff();
        $otherStaff = $this->staff();
        $conversation = $owner->pharmacistConversations()->create([
            'status' => PharmacistConversation::STATUS_OPEN,
            'assigned_staff_id' => $otherStaff->id,
        ]);

        $this->actingAs($staff)->getJson("/pharmacist/inbox/conversations/{$conversation->id}")->assertForbidden();
        $this->postJson("/pharmacist/inbox/conversations/{$conversation->id}/messages", ['body' => 'Pesan'])->assertForbidden();
    }

    public function test_message_validation_rejects_html_and_oversized_content(): void
    {
        $this->enableService();
        $this->staff();
        $owner = User::factory()->create();
        $conversation = $owner->pharmacistConversations()->create(['status' => PharmacistConversation::STATUS_OPEN]);

        $this->actingAs($owner)->postJson("/pharmacist-connect/conversations/{$conversation->id}/messages", ['body' => '<strong>konten</strong>'])->assertUnprocessable();
        $this->postJson("/pharmacist-connect/conversations/{$conversation->id}/messages", ['body' => str_repeat('a', 4001)])->assertUnprocessable();
    }

    public function test_message_endpoint_is_rate_limited(): void
    {
        $this->enableService();
        $this->staff();
        $owner = User::factory()->create();
        $conversation = $owner->pharmacistConversations()->create(['status' => PharmacistConversation::STATUS_OPEN]);
        $this->actingAs($owner);

        for ($index = 0; $index < 10; $index++) {
            $this->postJson("/pharmacist-connect/conversations/{$conversation->id}/messages", ['body' => "Pesan {$index}"])->assertCreated();
        }

        $this->postJson("/pharmacist-connect/conversations/{$conversation->id}/messages", ['body' => 'Pesan dibatasi'])->assertTooManyRequests();
    }

    public function test_closed_conversation_cannot_receive_more_messages(): void
    {
        $this->enableService();
        $owner = User::factory()->create();
        $staff = $this->staff();
        $conversation = $owner->pharmacistConversations()->create([
            'status' => PharmacistConversation::STATUS_CLOSED,
            'assigned_staff_id' => $staff->id,
        ]);

        $this->actingAs($owner)->postJson("/pharmacist-connect/conversations/{$conversation->id}/messages", ['body' => 'Pesan baru'])->assertForbidden();
        $this->actingAs($staff)->postJson("/pharmacist/inbox/conversations/{$conversation->id}/messages", ['body' => 'Balasan'])->assertForbidden();
    }

    public function test_polling_is_reported_as_fallback_when_reverb_is_not_configured(): void
    {
        $this->enableService();
        $this->staff();
        $user = User::factory()->create();
        config(['broadcasting.default' => 'null']);

        $this->actingAs($user)->getJson('/pharmacist-connect/conversations')
            ->assertOk()
            ->assertJsonPath('realtime', false)
            ->assertJsonPath('realtime_config', null)
            ->assertJsonPath('poll_interval_ms', 10000);
    }

    public function test_messages_remain_persisted_and_available_when_realtime_is_offline(): void
    {
        $this->enableService();
        $this->staff();
        $owner = User::factory()->create();
        $conversation = $owner->pharmacistConversations()->create(['status' => PharmacistConversation::STATUS_OPEN]);
        config(['broadcasting.default' => 'null']);

        $response = $this->actingAs($owner)->postJson("/pharmacist-connect/conversations/{$conversation->id}/messages", ['body' => 'Pesan melalui fallback']);

        $response->assertCreated()->assertJsonPath('realtime', false);
        $this->getJson("/pharmacist-connect/conversations/{$conversation->id}")
            ->assertOk()->assertJsonPath('messages.0.body', 'Pesan melalui fallback');
    }

    public function test_realtime_events_use_a_private_conversation_channel(): void
    {
        $this->enableService();
        $this->staff();
        $user = User::factory()->create();
        $conversation = $user->pharmacistConversations()->create(['status' => PharmacistConversation::STATUS_OPEN]);
        config([
            'broadcasting.default' => 'reverb',
            'broadcasting.connections.reverb.key' => 'public-test-key',
            'broadcasting.connections.reverb.secret' => 'private-test-secret',
            'broadcasting.connections.reverb.app_id' => 'test-app',
            'broadcasting.connections.reverb.options.host' => 'localhost',
            'broadcasting.connections.reverb.options.port' => 8080,
            'abx.pharmacist_connect.reverb_public_host' => 'localhost',
            'abx.pharmacist_connect.reverb_public_key' => 'public-test-key',
        ]);
        Event::fake([PharmacistMessageCreated::class]);

        $this->actingAs($user)->postJson("/pharmacist-connect/conversations/{$conversation->id}/messages", ['body' => 'Private broadcast payload'])->assertCreated();

        Event::assertDispatched(PharmacistMessageCreated::class, function (PharmacistMessageCreated $event) use ($conversation) {
            $channels = $event->broadcastOn();

            return count($channels) === 1
                && $channels[0] instanceof PrivateChannel
                && (string) $channels[0] === 'private-pharmacist.conversations.'.$conversation->id
                && $event->broadcastWith()['body'] === 'Private broadcast payload';
        });
    }

    public function test_private_channel_auth_allows_owner_and_explicit_staff_but_denies_other_user(): void
    {
        $this->enableService();
        config([
            'broadcasting.default' => 'reverb',
            'broadcasting.connections.reverb.key' => 'public-test-key',
            'broadcasting.connections.reverb.secret' => 'private-test-secret',
            'broadcasting.connections.reverb.app_id' => 'test-app',
            'broadcasting.connections.reverb.options.host' => 'localhost',
            'broadcasting.connections.reverb.options.port' => 8080,
            'abx.pharmacist_connect.reverb_public_host' => 'localhost',
            'abx.pharmacist_connect.reverb_public_key' => 'public-test-key',
        ]);
        require base_path('routes/channels.php');
        $owner = User::factory()->create();
        $staff = $this->staff();
        $other = User::factory()->create();
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $conversation = $owner->pharmacistConversations()->create(['status' => PharmacistConversation::STATUS_OPEN]);
        $payload = ['socket_id' => '123.456', 'channel_name' => "private-pharmacist.conversations.{$conversation->id}"];

        $this->actingAs($owner)->postJson('/broadcasting/auth', $payload)->assertOk();
        $this->actingAs($staff)->postJson('/broadcasting/auth', $payload)->assertOk();
        $this->actingAs($other)->postJson('/broadcasting/auth', $payload)->assertForbidden();
        $this->actingAs($admin)->postJson('/broadcasting/auth', $payload)->assertForbidden();
    }

    public function test_broadcast_auth_never_allows_channels_when_no_driver_is_configured(): void
    {
        $owner = User::factory()->create();
        $conversation = $owner->pharmacistConversations()->create(['status' => PharmacistConversation::STATUS_OPEN]);

        $this->actingAs($owner)->postJson('/broadcasting/auth', [
            'socket_id' => '123.456',
            'channel_name' => "private-pharmacist.conversations.{$conversation->id}",
        ])->assertStatus(503);
    }

    public function test_public_messaging_remains_disabled_until_operations_are_approved(): void
    {
        $this->staff();
        $user = User::factory()->create();
        config(['abx.pharmacist_connect.operational' => false]);

        $this->actingAs($user)->postJson('/pharmacist-connect/conversations')->assertStatus(503);
        $this->assertDatabaseCount('pharmacist_conversations', 0);
    }

    public function test_revoking_staff_access_requeues_conversations_without_deleting_history(): void
    {
        $owner = User::factory()->create();
        $staff = $this->staff('admin');
        $conversation = $owner->pharmacistConversations()->create([
            'status' => PharmacistConversation::STATUS_OPEN,
            'assigned_staff_id' => $staff->id,
        ]);
        $conversation->messages()->create(['sender_id' => $owner->id, 'body' => 'Riwayat tetap ada']);

        $this->artisan('pharmacist:staff', ['email' => $staff->email, '--revoke' => true])->assertExitCode(0);

        $this->assertFalse($staff->fresh()->isActivePharmacistStaff());
        $this->assertNull($conversation->fresh()->assigned_staff_id);
        $this->assertSame('Riwayat tetap ada', $conversation->messages()->firstOrFail()->body);
    }

    public function test_account_deletion_keeps_conversation_and_message_history(): void
    {
        $owner = User::factory()->create();
        $conversation = $owner->pharmacistConversations()->create(['status' => PharmacistConversation::STATUS_OPEN]);
        $message = $conversation->messages()->create(['sender_id' => $owner->id, 'body' => 'Riwayat dipertahankan']);

        $owner->delete();

        $this->assertNull($conversation->fresh()->user_id);
        $this->assertNull($message->fresh()->sender_id);
        $this->assertSame('Riwayat dipertahankan', $message->fresh()->body);
    }
}

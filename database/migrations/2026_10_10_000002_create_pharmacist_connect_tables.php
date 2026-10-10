<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pharmacist_staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('pharmacist_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('assigned_staff_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 24)->default('open')->index();
            $table->timestamp('last_activity_at')->nullable()->index();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
            $table->index(['assigned_staff_id', 'status', 'last_activity_at'], 'pharmacist_conversations_inbox_idx');
        });

        Schema::create('pharmacist_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('pharmacist_conversations')->restrictOnDelete();
            $table->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('body');
            $table->timestamp('recipient_read_at')->nullable();
            $table->timestamps();
            $table->index(['conversation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        foreach (['pharmacist_messages', 'pharmacist_conversations', 'pharmacist_staff'] as $table) {
            if (Schema::hasTable($table) && DB::table($table)->exists()) {
                throw new RuntimeException('Pharmacist Connect tables contain operational or historical data and cannot be rolled back automatically.');
            }
        }

        Schema::dropIfExists('pharmacist_messages');
        Schema::dropIfExists('pharmacist_conversations');
        Schema::dropIfExists('pharmacist_staff');
    }
};

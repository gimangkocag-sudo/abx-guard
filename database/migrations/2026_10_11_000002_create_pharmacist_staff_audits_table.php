<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pharmacist_staff_audits', function (Blueprint $table) {
            $table->id();
            // Keep immutable IDs without foreign keys so audit history survives account deletion.
            $table->unsignedBigInteger('actor_user_id')->index();
            $table->unsignedBigInteger('target_user_id')->index();
            $table->string('action', 16);
            $table->boolean('was_active');
            $table->boolean('is_active');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['target_user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('pharmacist_staff_audits') && DB::table('pharmacist_staff_audits')->exists()) {
            throw new RuntimeException('Pharmacist staff audit history cannot be removed automatically.');
        }

        Schema::dropIfExists('pharmacist_staff_audits');
    }
};

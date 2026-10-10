<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_instruments', function (Blueprint $table) {
            $table->id();
            $table->string('key', 80);
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['key', 'version']);
        });

        Schema::create('research_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instrument_id')->constrained('research_instruments')->restrictOnDelete();
            $table->string('key', 20);
            $table->string('stage', 20);
            $table->string('title');
            $table->text('instruction')->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
            $table->unique(['instrument_id', 'key']);
            $table->index(['instrument_id', 'stage', 'sort']);
        });

        Schema::create('research_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('research_sections')->restrictOnDelete();
            $table->string('code', 20);
            $table->text('prompt');
            $table->string('answer_type', 32);
            $table->json('options')->nullable();
            $table->boolean('required')->default(true);
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
            $table->unique(['section_id', 'code']);
            $table->index(['section_id', 'sort']);
        });

        Schema::create('research_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('instrument_id')->constrained('research_instruments')->restrictOnDelete();
            $table->unsignedInteger('instrument_version');
            $table->string('stage', 20);
            $table->string('status', 20)->default('draft');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('evaluation_unlocked_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'instrument_id', 'instrument_version', 'stage'], 'research_submission_once');
            $table->index(['stage', 'status', 'submitted_at']);
        });

        Schema::create('research_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('research_submissions')->restrictOnDelete();
            $table->foreignId('item_id')->constrained('research_items')->restrictOnDelete();
            $table->longText('value')->nullable();
            $table->string('answer_status', 24)->default('answered'); // answered | not_answered | not_applicable
            $table->timestamps();
            $table->unique(['submission_id', 'item_id']);
            $table->index(['item_id', 'answer_status']);
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('research_submissions') && DB::table('research_submissions')->exists()) {
            throw new \RuntimeException('Research submissions exist; refusing to roll back and delete survey responses.');
        }

        foreach (['research_answers', 'research_submissions', 'research_items', 'research_sections', 'research_instruments'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};

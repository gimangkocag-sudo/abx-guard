<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surveys', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('title');
            $t->text('description')->nullable();
            $t->unsignedInteger('version')->default(1);
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        Schema::create('survey_sections', function (Blueprint $t) {
            $t->id();
            $t->foreignId('survey_id')->constrained()->cascadeOnDelete();
            $t->string('key', 30);
            $t->string('title');
            $t->string('instruction')->nullable();
            $t->string('scale', 30); // knowledge | agreement | frequency
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
            $t->unique(['survey_id', 'key']);
        });

        Schema::create('survey_questions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('section_id')->constrained('survey_sections')->cascadeOnDelete();
            $t->string('code', 20)->unique(); // mis. K1, A3, P2, C15
            $t->string('group')->nullable();  // sub-kelompok Acceptance
            $t->text('text');
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('survey_submissions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('survey_id')->constrained()->cascadeOnDelete();
            $t->unsignedInteger('survey_version');
            $t->string('status', 20)->default('submitted');
            $t->timestamp('submitted_at')->nullable();
            $t->timestamps();
            // Satu submission per user per survey. Versi baru survey = baris `surveys` baru (survey_id baru),
            // jadi constraint ini berarti satu submission per user per VERSI. Lihat README "Keputusan versioning".
            $t->unique(['user_id', 'survey_id']);
            $t->index('submitted_at');
        });

        Schema::create('survey_answers', function (Blueprint $t) {
            $t->id();
            $t->foreignId('submission_id')->constrained('survey_submissions')->cascadeOnDelete();
            $t->foreignId('question_id')->constrained('survey_questions')->cascadeOnDelete();
            $t->string('value', 30);
            $t->timestamps();
            $t->unique(['submission_id', 'question_id']);
        });

        Schema::create('challenge_questions', function (Blueprint $t) {
            $t->id();
            $t->text('statement');
            $t->string('correct_answer', 10); // mitos | fakta
            $t->text('explanation');
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('challenge_attempts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->unsignedSmallInteger('score')->default(0);
            $t->unsignedSmallInteger('total')->default(0);
            $t->timestamp('completed_at')->nullable();
            $t->timestamps();
        });

        Schema::create('challenge_answers', function (Blueprint $t) {
            $t->id();
            $t->foreignId('attempt_id')->constrained('challenge_attempts')->cascadeOnDelete();
            $t->foreignId('challenge_question_id')->constrained()->cascadeOnDelete();
            $t->string('answer', 10);
            $t->boolean('is_correct');
            $t->timestamps();
            $t->unique(['attempt_id', 'challenge_question_id']);
        });
    }

    public function down(): void
    {
        foreach (['challenge_answers', 'challenge_attempts', 'challenge_questions', 'survey_answers', 'survey_submissions', 'survey_questions', 'survey_sections', 'surveys'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};

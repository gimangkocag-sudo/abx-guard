<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_progress', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('module', 50); // slug modul dari config('abx.modules')
            $t->timestamp('last_visited_at')->nullable();
            $t->timestamps();
            $t->unique(['user_id', 'module']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_progress');
    }
};

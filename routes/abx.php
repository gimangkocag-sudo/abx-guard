<?php

use App\Http\Controllers\Admin\ChallengeController as AdminChallengeController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ExportController as AdminExportController;
use App\Http\Controllers\Admin\ResearchExportController;
use App\Http\Controllers\Admin\ResearchSurveyController as AdminResearchSurveyController;
use App\Http\Controllers\Admin\StatisticsController as AdminStatisticsController;
use App\Http\Controllers\Admin\SurveyResponseController as AdminSurveyResponseController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\LearnController;
use App\Http\Controllers\MythFactAttemptController;
use App\Http\Controllers\PharmacistConnectController;
use App\Http\Middleware\EnsurePharmacistStaff;
use App\Http\Controllers\ResearchSurveyController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

// Publik
Route::inertia('/', 'Abx/Home')->name('home');
Route::inertia('/cek-keluhan', 'Abx/SymptomCheck')->name('symptom');
Route::inertia('/smart-abx-alert', 'Abx/SmartAlert')->name('alert');
Route::get('/belajar/{module}', [LearnController::class, 'show'])->name('learn.show');

// Butuh login
Route::middleware('auth')->group(function () {
    Route::post('/belajar/myth-or-fact/attempts', [MythFactAttemptController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('myth-fact.attempts.store');

    Route::get('/pharmacist-connect/conversations', [PharmacistConnectController::class, 'index'])->name('pharmacist.conversations.index');
    Route::post('/pharmacist-connect/conversations', [PharmacistConnectController::class, 'store'])->middleware('throttle:5,1')->name('pharmacist.conversations.store');
    Route::get('/pharmacist-connect/conversations/{conversation}', [PharmacistConnectController::class, 'show'])->can('view', 'conversation')->name('pharmacist.conversations.show');
    Route::post('/pharmacist-connect/conversations/{conversation}/messages', [PharmacistConnectController::class, 'send'])->middleware('throttle:10,1')->name('pharmacist.conversations.messages.store');
});

Route::middleware(['auth', EnsurePharmacistStaff::class])->prefix('pharmacist')->name('pharmacist.')->group(function () {
    Route::get('/inbox', fn () => Inertia\Inertia::render('Pharmacist/Inbox'))->name('staff.inbox');
    Route::get('/inbox/conversations', [PharmacistConnectController::class, 'inbox'])->name('staff.inbox.conversations');
    Route::post('/inbox/conversations/{conversation}/claim', [PharmacistConnectController::class, 'claim'])->middleware('throttle:20,1')->name('staff.conversations.claim');
    Route::post('/inbox/conversations/{conversation}/messages', [PharmacistConnectController::class, 'send'])->middleware(['can:send,conversation', 'throttle:10,1'])->name('staff.conversations.messages.store');
    Route::patch('/inbox/conversations/{conversation}/status', [PharmacistConnectController::class, 'updateStatus'])->middleware('throttle:20,1')->name('staff.conversations.status');
    Route::get('/inbox/conversations/{conversation}', [PharmacistConnectController::class, 'show'])->middleware('can:view,conversation')->name('staff.conversations.show');
});

Route::middleware('auth')->group(function () {
    Route::get('/survei-penelitian', [ResearchSurveyController::class, 'show'])->name('research-survey.show');
    Route::post('/survei-penelitian/evaluation/unlock', [ResearchSurveyController::class, 'unlockEvaluation'])->name('research-survey.unlock');
    Route::post('/survei-penelitian/{stage}/draft', [ResearchSurveyController::class, 'draft'])->middleware('throttle:30,1')->name('research-survey.draft');
    Route::post('/survei-penelitian/{stage}/submit', [ResearchSurveyController::class, 'submit'])->middleware('throttle:10,1')->name('research-survey.submit');
    // Legacy KAP entry points stay available as redirects; responses remain historical.
    Route::redirect('/survey', '/survei-penelitian')->name('survey.redirect');
    Route::redirect('/kap-survey', '/survei-penelitian')->name('kap.show');

    Route::get('/amr-challenge', [ChallengeController::class, 'show'])->name('challenge.show');
    Route::post('/amr-challenge', [ChallengeController::class, 'submit'])->middleware('throttle:10,1')->name('challenge.submit');
    Route::get('/amr-challenge/hasil/{attempt}', [ChallengeController::class, 'result'])->name('challenge.result');
});

// Admin: SEMUA rute /admin/* wajib auth + EnsureUserIsAdmin (403 untuk user biasa)
Route::middleware(['auth', EnsureUserIsAdmin::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/users', [AdminUserController::class, 'index'])->name('users');
    Route::get('/survey', [AdminSurveyResponseController::class, 'index'])->name('survey.index');
    Route::get('/survey/{submission}', [AdminSurveyResponseController::class, 'show'])->name('survey.show');
    Route::get('/statistics', AdminStatisticsController::class)->name('statistics');
    Route::get('/export/kap', [AdminExportController::class, 'kap'])->name('export.kap');
    Route::get('/research-survey', [AdminResearchSurveyController::class, 'index'])->name('research.index');
    Route::get('/research-survey/export', ResearchExportController::class)->name('research.export');
    Route::get('/research-survey/{submission}', [AdminResearchSurveyController::class, 'show'])->name('research.show');
    Route::get('/challenge', [AdminChallengeController::class, 'index'])->name('challenge.index');
    Route::get('/challenge/{attempt}', [AdminChallengeController::class, 'show'])->name('challenge.show');
});

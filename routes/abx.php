<?php

use App\Http\Controllers\Admin\ChallengeController as AdminChallengeController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ExportController as AdminExportController;
use App\Http\Controllers\Admin\StatisticsController as AdminStatisticsController;
use App\Http\Controllers\Admin\SurveyResponseController as AdminSurveyResponseController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\LearnController;
use App\Http\Controllers\SurveyController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

// Publik
Route::inertia('/', 'Abx/Home')->name('home');
Route::inertia('/cek-keluhan', 'Abx/SymptomCheck')->name('symptom');
Route::inertia('/smart-abx-alert', 'Abx/SmartAlert')->name('alert');
Route::get('/belajar/{module}', [LearnController::class, 'show'])->name('learn.show');

// Butuh login
Route::middleware('auth')->group(function () {
    Route::redirect('/survey', '/kap-survey')->name('survey.redirect');
    Route::get('/kap-survey', [SurveyController::class, 'show'])->name('kap.show');
    Route::post('/kap-survey', [SurveyController::class, 'store'])->middleware('throttle:10,1')->name('kap.store');

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
    Route::get('/challenge', [AdminChallengeController::class, 'index'])->name('challenge.index');
    Route::get('/challenge/{attempt}', [AdminChallengeController::class, 'show'])->name('challenge.show');
});

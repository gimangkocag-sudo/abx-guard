<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminDashboardService;
use App\Services\SurveyService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(AdminDashboardService $dashboard, SurveyService $surveys): Response
    {
        return Inertia::render('Admin/Dashboard', $dashboard->dashboard($surveys->activeSurveyOrNull()));
    }
}

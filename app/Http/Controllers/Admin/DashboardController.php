<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AdminDashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(AdminDashboardService $dashboard): Response
    {
        return Inertia::render('Admin/Dashboard', $dashboard->dashboard());
    }
}

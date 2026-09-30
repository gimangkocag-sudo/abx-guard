<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChallengeAttempt;
use App\Services\AdminDashboardService;
use App\Services\ChallengeService;
use App\Support\Pagination;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChallengeController extends Controller
{
    public function index(Request $request, AdminDashboardService $dashboard): Response
    {
        $data = $request->validate(['q' => ['nullable', 'string', 'max:100']]);

        $page = ChallengeAttempt::query()
            ->whereNotNull('completed_at')
            ->with('user:id,name,email')
            ->when($data['q'] ?? null, function ($q, $t) {
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$t}%")->orWhere('email', 'like', "%{$t}%"));
            })
            ->latest('completed_at')->orderByDesc('id')
            ->paginate(15)->withQueryString();

        return Inertia::render('Admin/Challenge/Index', [
            'summary' => $dashboard->challengeSummary(),
            'attempts' => $page->getCollection()->map(fn ($a) => [
                'id' => $a->id, 'name' => $a->user?->name, 'email' => $a->user?->email,
                'score' => $a->score, 'total' => $a->total, 'completedAt' => $a->completed_at?->toIso8601String(),
            ])->values(),
            'pagination' => Pagination::meta($page),
            'filters' => ['q' => $data['q'] ?? ''],
        ]);
    }

    /** Admin boleh melihat detail attempt siapa pun (dijaga middleware admin). Rute user tetap hanya untuk pemilik. */
    public function show(ChallengeAttempt $attempt, ChallengeService $challenge): Response
    {
        $attempt->load('user:id,name,email');

        return Inertia::render('Admin/Challenge/Show', $challenge->result($attempt) + [
            'respondent' => ['name' => $attempt->user?->name, 'email' => $attempt->user?->email],
        ]);
    }
}

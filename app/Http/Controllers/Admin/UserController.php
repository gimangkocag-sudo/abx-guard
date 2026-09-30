<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChallengeAttempt;
use App\Models\SurveySubmission;
use App\Models\User;
use App\Services\SurveyService;
use App\Support\Pagination;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request, SurveyService $surveys): Response
    {
        $data = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', Rule::in(['user', 'admin'])],
        ]);
        $survey = $surveys->reportingSurvey();

        // Kolom dipilih eksplisit: password/remember_token tidak pernah dimuat. Hitungan memakai subquery (tanpa N+1).
        $users = User::query()
            ->select(['users.id', 'users.name', 'users.email', 'users.role', 'users.created_at'])
            ->addSelect([
                'attempts' => ChallengeAttempt::query()->selectRaw('COUNT(*)')
                    ->whereColumn('challenge_attempts.user_id', 'users.id')->whereNotNull('completed_at'),
                'kap_at' => SurveySubmission::query()->select('submitted_at')
                    ->whereColumn('survey_submissions.user_id', 'users.id')->where('survey_id', $survey->id)->limit(1),
            ])
            ->when($data['role'] ?? null, fn ($q, $r) => $q->where('users.role', $r))
            ->when($data['q'] ?? null, fn ($q, $t) => $q->where(fn ($w) => $w->where('users.name', 'like', "%{$t}%")->orWhere('users.email', 'like', "%{$t}%")))
            ->orderByDesc('users.created_at')->orderByDesc('users.id')
            ->paginate(15)->withQueryString();

        return Inertia::render('Admin/Users', [
            'users' => $users->getCollection()->map(fn ($u) => [
                'id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->role,
                'registeredAt' => $u->created_at?->toIso8601String(),
                'kapDone' => $u->kap_at !== null,
                'attempts' => (int) $u->attempts,
            ])->values(),
            'pagination' => Pagination::meta($users),
            'filters' => ['q' => $data['q'] ?? '', 'role' => $data['role'] ?? ''],
            'surveyVersion' => $survey->version,
        ]);
    }
}

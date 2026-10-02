<?php

namespace App\Services;

use App\Models\ChallengeAttempt;
use App\Models\Survey;
use App\Models\SurveySubmission;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminDashboardService
{
    public function dashboard(?Survey $active): array
    {
        $users = User::where('role', 'user')->count();
        $activeSubmissions = $active
            ? SurveySubmission::where('survey_id', $active->id)->whereHas('user', fn ($query) => $query->where('role', 'user'))->count()
            : 0;

        // Completion hanya membandingkan submission versi aktif dengan akun responden non-admin.
        $perDay = SurveySubmission::query()
            ->whereHas('user', fn ($query) => $query->where('role', 'user'))
            ->where('submitted_at', '>=', now()->subDays(13)->startOfDay())
            ->groupBy(DB::raw('DATE(submitted_at)'))
            ->selectRaw('DATE(submitted_at) as d, COUNT(*) as n')
            ->pluck('n', 'd');
        $series = [];
        for ($i = 13; $i >= 0; $i--) {
            $day = now()->subDays($i);
            $series[] = ['label' => $day->format('d/m'), 'value' => (int) ($perDay[$day->toDateString()] ?? 0)];
        }

        return [
            'stats' => [
                'users' => $users,
                'submissions' => SurveySubmission::count(),
                'activeSubmissions' => $activeSubmissions,
                'completion' => $users > 0 ? round($activeSubmissions / $users * 100, 1) : 0,
                'challengeAttempts' => ChallengeAttempt::whereNotNull('completed_at')->count(),
            ],
            'activeSurvey' => $active ? ['id' => $active->id, 'version' => $active->version, 'title' => $active->title] : null,
            'versions' => Survey::withCount('submissions')->orderByDesc('version')->get()
                ->map(fn ($s) => ['id' => $s->id, 'version' => $s->version, 'isActive' => $s->is_active, 'submissions' => $s->submissions_count])->all(),
            'submissionsPerDay' => $series,
            'recent' => SurveySubmission::with(['user:id,name,email', 'survey:id,version'])->latest('submitted_at')->limit(10)->get()
                ->map(fn ($s) => [
                    'id' => $s->id, 'name' => $s->user?->name, 'email' => $s->user?->email,
                    'version' => $s->survey?->version, 'submittedAt' => $s->submitted_at?->toIso8601String(),
                ])->all(),
            'challenge' => $this->challengeSummary(),
        ];
    }

    public function challengeSummary(): array
    {
        $done = ChallengeAttempt::whereNotNull('completed_at');
        $avg = (clone $done)->selectRaw('AVG(score * 100.0 / NULLIF(total, 0)) as avg_pct')->first()?->avg_pct;

        $byScore = (clone $done)->groupBy('score', 'total')->selectRaw('score, total, COUNT(*) as n')->get();
        $max = (int) ($byScore->max('total') ?? 0);
        $counts = $byScore->pluck('n', 'score');
        $distribution = [];
        for ($s = 0; $s <= $max; $s++) {
            $distribution[] = ['label' => "{$s}/{$max}", 'value' => (int) ($counts[$s] ?? 0)];
        }

        return [
            'total' => ChallengeAttempt::count(),
            'completed' => (clone $done)->count(),
            'averagePercent' => $avg !== null ? round((float) $avg, 1) : null,
            'distribution' => $max > 0 ? $distribution : [],
        ];
    }
}

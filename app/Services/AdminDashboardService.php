<?php

namespace App\Services;

use App\Models\ChallengeAttempt;
use App\Models\ResearchInstrument;
use App\Models\ResearchSubmission;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminDashboardService
{
    public function dashboard(): array
    {
        $users = User::where('role', 'user')->count();
        $instrument = ResearchInstrument::where('key', 'abx-guard-research')->where('is_active', true)->orderByDesc('version')->first();
        $base = ResearchSubmission::query()->where('instrument_id', $instrument?->id)
            ->where('instrument_version', $instrument?->version)
            ->whereHas('user', fn ($query) => $query->where('role', 'user'));
        $initialSubmissions = (clone $base)->where('stage', 'initial')->where('status', 'submitted')->count();
        $evaluationSubmissions = (clone $base)->where('stage', 'evaluation')->where('status', 'submitted')->count();

        // Completion hanya membandingkan submission versi aktif dengan akun responden non-admin.
        $perDay = ResearchSubmission::query()
            ->where('instrument_id', $instrument?->id)
            ->where('instrument_version', $instrument?->version)
            ->where('status', 'submitted')
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
                'researchSubmissions' => (clone $base)->where('status', 'submitted')->count(),
                'researchDrafts' => (clone $base)->where('status', 'draft')->count(),
                'initialSubmissions' => $initialSubmissions,
                'evaluationSubmissions' => $evaluationSubmissions,
                'completion' => $users > 0 ? round($initialSubmissions / $users * 100, 1) : 0,
                'challengeAttempts' => ChallengeAttempt::whereNotNull('completed_at')->count(),
            ],
            'activeInstrument' => $instrument ? ['version' => $instrument->version, 'title' => $instrument->title] : null,
            'submissionsPerDay' => $series,
            'recent' => (clone $base)->where('status', 'submitted')->with('user:id,name,email')->latest('submitted_at')->limit(10)->get()
                ->map(fn ($s) => [
                    'id' => $s->id, 'name' => $s->user?->name, 'email' => $s->user?->email,
                    'version' => $s->instrument_version, 'stage' => $s->stage, 'submittedAt' => $s->submitted_at?->toIso8601String(),
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

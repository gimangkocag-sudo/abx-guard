<?php

namespace App\Services;

use App\Models\Survey;
use App\Models\SurveySubmission;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class KapStatisticsService
{
    public function __construct(private SurveyService $surveys) {}

    /** Survey yang dilaporkan: pilihan admin (survey_id) atau default. Statistik selalu untuk SATU survey_id. */
    public function resolveSurvey(?int $surveyId): Survey
    {
        return $surveyId ? Survey::findOrFail($surveyId) : $this->surveys->reportingSurvey();
    }

    /** Opsi dropdown versi survey (terbaru dulu). */
    public function surveyOptions(): array
    {
        return Survey::orderByDesc('version')->get(['id', 'title', 'version', 'is_active'])
            ->map(fn ($s) => ['id' => $s->id, 'label' => "v{$s->version} — {$s->title}".($s->is_active ? ' (aktif)' : '')])->all();
    }

    /**
     * Distribusi jawaban per pertanyaan untuk satu survey (survey_id), dengan filter tanggal opsional.
     * Agregasi dilakukan di database (satu query GROUP BY); PHP hanya menyusun hasil.
     */
    public function forSurvey(Survey $survey, ?Carbon $from = null, ?Carbon $to = null): array
    {
        $survey->loadMissing('sections.questions');

        $total = SurveySubmission::filtered(['survey_id' => $survey->id, 'from' => $from, 'to' => $to])->count();

        $counts = [];
        $rows = DB::table('survey_answers as a')
            ->join('survey_submissions as s', 's.id', '=', 'a.submission_id')
            ->where('s.survey_id', $survey->id)
            ->when($from, fn ($q) => $q->where('s.submitted_at', '>=', $from))
            ->when($to, fn ($q) => $q->where('s.submitted_at', '<=', $to))
            ->groupBy('a.question_id', 'a.value')
            ->selectRaw('a.question_id, a.value, COUNT(*) as n')
            ->get();
        foreach ($rows as $r) {
            $counts[$r->question_id][$r->value] = (int) $r->n;
        }

        $sections = $survey->sections->map(function ($section) use ($counts) {
            $options = config("abx.scales.{$section->scale}");
            $numeric = $section->scale !== 'knowledge';
            $groups = [];

            $questions = $section->questions->map(function ($q) use ($counts, $options, $numeric, &$groups) {
                $qc = $counts[$q->id] ?? [];
                $n = array_sum($qc);
                $sum = 0;
                $dist = [];
                foreach ($options as $o) {
                    $c = $qc[$o['value']] ?? 0;
                    $sum += $numeric ? ((int) $o['value']) * $c : 0;
                    $dist[] = ['value' => $o['value'], 'label' => $o['label'], 'count' => $c, 'percent' => $n > 0 ? round($c / $n * 100, 1) : 0];
                }
                if ($q->group) {
                    $groups[$q->group]['sum'] = ($groups[$q->group]['sum'] ?? 0) + $sum;
                    $groups[$q->group]['n'] = ($groups[$q->group]['n'] ?? 0) + $n;
                }

                return [
                    'id' => $q->id, 'code' => $q->code, 'group' => $q->group, 'text' => $q->text,
                    'responses' => $n, 'distribution' => $dist,
                    'mean' => $numeric && $n > 0 ? round($sum / $n, 2) : null,
                ];
            })->values()->all();

            return [
                'key' => $section->key, 'title' => $section->title, 'scale' => $section->scale, 'numeric' => $numeric,
                'questions' => $questions,
                'groups' => collect($groups)->map(fn ($g, $name) => [
                    'name' => $name, 'responses' => $g['n'], 'mean' => $g['n'] > 0 ? round($g['sum'] / $g['n'], 2) : null,
                ])->values()->all(),
            ];
        })->values()->all();

        return [
            'survey' => ['id' => $survey->id, 'version' => $survey->version, 'title' => $survey->title, 'isActive' => $survey->is_active],
            'total' => $total,
            'sections' => $sections,
        ];
    }
}

<?php

namespace App\Services;

use App\Models\Survey;
use App\Models\SurveySubmission;
use Symfony\Component\HttpFoundation\StreamedResponse;

class KapExportService
{
    private const FIXED = ['submission_id', 'user_name', 'user_email', 'survey_id', 'survey_version', 'submitted_at', 'status'];

    /**
     * CSV untuk SATU survey (kolom = kode pertanyaan survey itu), mengikuti filter admin.
     * Jawaban diekspor sebagai nilai tersimpan (benar/salah/tidak_tahu atau 1–5). Tidak ada password/data sensitif.
     */
    public function download(Survey $survey, array $filters): StreamedResponse
    {
        $survey->loadMissing('sections.questions');
        $questions = $survey->sections->flatMap->questions->values();
        $filters['survey_id'] = $survey->id;
        $filename = sprintf('kap-v%d-%s.csv', $survey->version, now()->format('Ymd_His'));

        return response()->streamDownload(function () use ($questions, $filters) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM agar Excel membaca UTF-8
            $this->row($out, array_merge(self::FIXED, $questions->pluck('code')->all()));

            SurveySubmission::query()
                ->filtered($filters)
                ->with(['user:id,name,email', 'answers:id,submission_id,question_id,value'])
                ->chunkById(500, function ($chunk) use ($out, $questions) {
                    foreach ($chunk as $s) {
                        $byQuestion = $s->answers->pluck('value', 'question_id');
                        $this->row($out, array_merge([
                            $s->id,
                            $this->safe((string) $s->user?->name),
                            $this->safe((string) $s->user?->email),
                            $s->survey_id,
                            $s->survey_version,
                            $s->submitted_at?->toIso8601String(),
                            $s->status,
                        ], $questions->map(fn ($q) => $byQuestion[$q->id] ?? '')->all()));
                    }
                });
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8', 'Cache-Control' => 'no-store']);
    }

    private function row($out, array $values): void
    {
        fputcsv($out, $values, ',', '"', '\\');
    }

    /** Cegah CSV/formula injection pada teks yang berasal dari user (nama/email). */
    private function safe(string $value): string
    {
        return preg_match('/^[=+\-@\t\r]/', $value) ? "'".$value : $value;
    }
}

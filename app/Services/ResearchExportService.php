<?php

namespace App\Services;

use App\Models\ResearchSubmission;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ResearchExportService
{
    public function download(Collection $instruments, array $filters): StreamedResponse
    {
        $items = $instruments->flatMap(fn ($instrument) => $instrument->sections()->with('items')->get()->flatMap->items)
            ->unique('code')->sortBy('code')->values();
        $instrumentIds = $instruments->pluck('id');
        $versionLabel = $filters['version'] ?? 'all';
        $filename = 'abx-guard-research-v'.$versionLabel.'-'.($filters['stage'] ?? 'all').'-'.now()->format('Ymd-His').'.csv';
        $query = ResearchSubmission::query()->whereIn('instrument_id', $instrumentIds)->filtered(array_diff_key($filters, ['version' => true]))
            ->with(['user:id,name,email', 'answers.item'])->orderBy('id');

        return response()->streamDownload(function () use ($query, $items) {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            $headers = ['submission_id', 'respondent_user_id', 'user_name', 'user_email', 'instrument_version', 'stage', 'status', 'started_at', 'submitted_at'];
            foreach ($items as $item) $headers[] = $item->code;
            foreach ($items as $item) $headers[] = $item->code.'_status';
            fputcsv($output, $headers);

            $query->chunkById(250, function ($submissions) use ($output, $items) {
                foreach ($submissions as $submission) {
                    $answers = $submission->answers->keyBy(fn ($answer) => $answer->item->code);
                    $row = [
                        $submission->id, $submission->user_id, $submission->user?->name,
                        $submission->user?->email, $submission->instrument_version, $submission->stage,
                        $submission->status, $submission->started_at?->toIso8601String(), $submission->submitted_at?->toIso8601String(),
                    ];
                    foreach ($items as $item) $row[] = $answers->get($item->code)?->value;
                    foreach ($items as $item) $row[] = $answers->get($item->code)?->answer_status ?? 'not_answered';
                    fputcsv($output, array_map($this->safeCell(...), $row));
                }
            });
            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function safeCell(mixed $value): string
    {
        $text = (string) ($value ?? '');
        if (preg_match('/^[\s\p{C}]*[=+\-@]/u', $text)) return "'".$text;

        return $text;
    }
}

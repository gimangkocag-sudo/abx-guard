<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class KapFilterRequest extends FormRequest
{
    /** Lapisan pertahanan tambahan; route sudah dijaga middleware EnsureUserIsAdmin. */
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'survey' => ['nullable', 'integer', 'exists:surveys,id'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'q' => ['nullable', 'string', 'max:100'],
        ];
    }

    /** Filter ternormalisasi untuk SurveySubmission::filtered() dan service statistik/export. */
    public function filters(): array
    {
        $v = $this->validated();

        return [
            'survey_id' => isset($v['survey']) ? (int) $v['survey'] : null,
            'from' => ! empty($v['from']) ? Carbon::parse($v['from'], config('app.timezone'))->startOfDay() : null,
            'to' => ! empty($v['to']) ? Carbon::parse($v['to'], config('app.timezone'))->endOfDay() : null,
            'q' => isset($v['q']) && $v['q'] !== '' ? $v['q'] : null,
        ];
    }

    /** Nilai filter mentah untuk mengisi ulang form. */
    public function raw(): array
    {
        return [
            'survey' => (string) $this->input('survey', ''),
            'from' => (string) $this->input('from', ''),
            'to' => (string) $this->input('to', ''),
            'q' => (string) $this->input('q', ''),
        ];
    }
}

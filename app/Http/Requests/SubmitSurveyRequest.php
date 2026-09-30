<?php

namespace App\Http\Requests;

use App\Services\SurveyService;
use Illuminate\Foundation\Http\FormRequest;

class SubmitSurveyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return app(SurveyService::class)->rulesFor(app(SurveyService::class)->activeSurvey());
    }

    public function messages(): array
    {
        return [
            'answers.required' => 'Jawaban survey belum lengkap.',
            'answers.*.required' => 'Pertanyaan ini wajib dijawab.',
            'answers.*.in' => 'Pilihan jawaban tidak valid.',
        ];
    }
}

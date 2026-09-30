<?php

namespace App\Http\Requests;

use App\Services\ChallengeService;
use Illuminate\Foundation\Http\FormRequest;

class SubmitChallengeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return app(ChallengeService::class)->rules();
    }

    public function messages(): array
    {
        return [
            'answers.required' => 'Jawaban challenge belum lengkap.',
            'answers.*.required' => 'Semua pertanyaan wajib dijawab.',
            'answers.*.in' => 'Pilihan jawaban tidak valid.',
        ];
    }
}

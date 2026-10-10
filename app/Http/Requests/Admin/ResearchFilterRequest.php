<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ResearchFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'stage' => ['nullable', 'in:initial,evaluation'],
            'status' => ['nullable', 'in:draft,submitted'],
            'version' => ['nullable', 'integer', 'min:1'],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
            'q' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->filled('from') && $this->filled('to') && $this->input('to') < $this->input('from')) {
                $validator->errors()->add('to', 'Tanggal akhir harus sama atau setelah tanggal mulai.');
            }
        });
    }

    public function filters(): array
    {
        return $this->safe()->only(['stage', 'status', 'version', 'from', 'to', 'q']);
    }

    public function raw(): array
    {
        return $this->only(['stage', 'status', 'version', 'from', 'to', 'q']);
    }
}

<?php

namespace App\Http\Requests\Pharmacist;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'min:1', 'max:4000', function (string $attribute, mixed $value, \Closure $fail): void {
                if (! is_string($value) || strip_tags($value) !== $value) {
                    $fail('Pesan tidak boleh berisi HTML.');
                }
            }],
        ];
    }
}

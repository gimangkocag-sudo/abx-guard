<?php

namespace App\Http\Requests;

use App\Services\MythFactService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitMythFactAttemptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(MythFactService $mythFact): array
    {
        $ids = array_map(fn (array $question) => (string) $question['id'], $mythFact->questions());
        $rules = [
            'answers' => ['required', 'array:'.implode(',', $ids), 'size:'.count($ids)],
        ];

        foreach ($ids as $id) {
            $rules["answers.{$id}"] = ['required', 'string', Rule::in(MythFactService::ANSWERS)];
        }

        return $rules;
    }
}

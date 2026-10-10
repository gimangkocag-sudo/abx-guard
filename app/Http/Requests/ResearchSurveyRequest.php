<?php

namespace App\Http\Requests;

use App\Services\ResearchSurveyService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ResearchSurveyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $stage = $this->route('stage');
        abort_unless(in_array($stage, ['initial', 'evaluation'], true), 404);
        $instrument = app(ResearchSurveyService::class)->instrument();
        $items = $instrument->sections->where('stage', $stage)->flatMap->items;
        $itemCodes = $items->pluck('code')->all();
        $rules = [
            'answers' => ['sometimes', 'array'],
            'notApplicable' => ['sometimes', 'array'],
            'notApplicable.*' => ['string', Rule::in($itemCodes), Rule::in(['E02', 'E06'])],
        ];

        foreach ($items as $item) {
            $key = "answers.{$item->code}";
            $options = collect($item->options ?? [])->pluck('value')->all();
            $rules[$key] = match ($item->answer_type) {
                'short_text' => ['sometimes', 'nullable', 'string', 'max:160'],
                'integer' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:120'],
                'long_text' => ['sometimes', 'nullable', 'string', 'max:5000'],
                'multiple_choice' => ['sometimes', 'nullable', 'array', 'max:2'],
                'multiple_choice_exclusive' => ['sometimes', 'nullable', 'array', 'max:6'],
                'likert' => ['sometimes', 'nullable', 'integer', Rule::in(['1', '2', '3', '4', '5'])],
                'single_choice', 'true_false_unknown' => ['sometimes', 'nullable', 'string', Rule::in($options)],
                default => ['prohibited'],
            };
            if (in_array($item->answer_type, ['multiple_choice', 'multiple_choice_exclusive'], true)) {
                $rules["$key.*"] = ['string', 'distinct', Rule::in($options)];
            }
        }

        $inputAnswers = $this->input('answers', []);
        foreach (array_keys(is_array($inputAnswers) ? $inputAnswers : []) as $code) {
            if (! $items->contains('code', $code)) $rules["answers.$code"] = ['prohibited'];
        }

        return $rules;
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $answers = $this->input('answers', []);
            $answers = is_array($answers) ? $answers : [];
            $notApplicable = $this->input('notApplicable', []);
            $notApplicable = is_array($notApplicable) ? $notApplicable : [];
            if (count($notApplicable) !== count(array_unique($notApplicable))) {
                $validator->errors()->add('notApplicable', 'Penanda tidak berlaku duplikat.');
            }
            foreach ($notApplicable as $code) {
                if (array_key_exists($code, $answers) && $answers[$code] !== null && $answers[$code] !== '') {
                    $validator->errors()->add("answers.$code", 'Jawaban tidak dapat sekaligus diisi dan ditandai tidak berlaku.');
                }
            }
            $sources = is_array($answers['B02'] ?? null) ? $answers['B02'] : [];
            if (in_array('tidak_tahu_tidak_pernah', $sources, true) && count($sources) > 1) {
                $validator->errors()->add('answers.B02', '“Tidak tahu / Tidak pernah” tidak dapat dipilih bersama sumber informasi lainnya.');
            }
        });
    }
}

<?php

namespace App\Http\Requests;

use App\Enums\CardPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:5000'],
            'priority' => ['nullable', Rule::enum(CardPriority::class)],
            'due_date' => ['nullable', 'date'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->mergeIfMissing(['priority' => 'medium']);
    }
}

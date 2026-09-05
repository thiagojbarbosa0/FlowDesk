<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttachLabelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['label_id' => ['required', 'integer', 'exists:labels,id']];
    }
}

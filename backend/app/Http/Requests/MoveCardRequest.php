<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MoveCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'column_id' => ['required', 'integer', 'exists:columns,id'],
            // position = índice ordinal (0-based) desejado na coluna de destino.
            'position' => ['required', 'integer', 'min:0'],
        ];
    }
}

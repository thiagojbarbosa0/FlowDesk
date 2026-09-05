<?php

namespace App\Http\Requests;

class UpdateLabelRequest extends StoreLabelRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['name'] = ['sometimes', 'required', 'string', 'max:50'];
        $rules['color'] = ['sometimes', 'nullable', 'string', 'max:20'];

        return $rules;
    }
}

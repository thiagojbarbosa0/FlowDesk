<?php

namespace App\Http\Requests;

class UpdateProjectRequest extends StoreProjectRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['name'] = ['sometimes', 'required', 'string', 'max:120'];

        return $rules;
    }
}

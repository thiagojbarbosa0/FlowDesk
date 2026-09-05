<?php

namespace App\Http\Requests;

use App\Enums\WorkspaceRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            // Owner NUNCA entra por "invite": só por transferência.
            'role' => ['required', Rule::enum(WorkspaceRole::class)->except([WorkspaceRole::Owner])],
        ];
    }
}

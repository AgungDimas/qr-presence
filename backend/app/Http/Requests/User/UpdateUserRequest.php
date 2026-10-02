<?php
namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'name'          => ['sometimes', 'string', 'max:255'],
            'email'         => ['sometimes', 'email', "unique:users,email,{$userId}"],
            'password'      => ['sometimes', 'nullable', 'confirmed', Password::min(6)],
            'role'          => ['sometimes', 'string', 'in:admin,employee,hr,manager'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'avatar'        => ['nullable', 'string', 'max:255'],
        ];
    }
}

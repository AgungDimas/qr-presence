<?php
namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:255'],
            'email'         => ['required', 'email', 'unique:users,email'],
            'password'      => ['required', 'confirmed', Password::min(6)],
            'role'          => ['required', 'string', 'in:admin,employee,hr,manager'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'avatar'        => ['nullable', 'string', 'max:255'],
        ];
    }
}

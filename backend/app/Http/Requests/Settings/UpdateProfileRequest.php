<?php
namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;
        $role = strtolower((string) $this->user()->role);
        $isStaff = in_array($role, ['admin', 'manager'], true);

        $rules = [
            'name'          => ['required', 'string', 'max:255'],
            'email'         => ['required', 'email', "unique:users,email,{$userId}"],
            'avatar'        => ['nullable', 'string', 'max:255'],
        ];

        if ($isStaff) {
            $rules['department_id'] = ['nullable', 'integer', 'exists:departments,id'];
        }

        return $rules;
    }
}

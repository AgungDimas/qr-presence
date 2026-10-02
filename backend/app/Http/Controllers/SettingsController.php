<?php
namespace App\Http\Controllers;

use App\Http\Requests\Settings\ChangePasswordRequest;
use App\Http\Requests\Settings\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());
        $user->load('department');

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user'    => new UserResource($user),
        ]);
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();
        $user->update([
            'password' => Hash::make($request->validated()['password']),
        ]);

        return response()->json([
            'message' => 'Kata sandi berhasil diubah',
        ]);
    }
}

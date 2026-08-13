<?php
namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function login(LoginRequest $request)
    {
        $result = $this->authService->login($request->validated());

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $result['token'],
            'token_type' => 'Bearer',
            'user' => new UserResource($result['user'])
        ]);
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    public function me(Request $request)
    {
        // Mengambil data user yang sedang login
        $user = $request->user()->load('department');

        return response()->json([
            'user' => new UserResource($user)
        ]);
    }
}

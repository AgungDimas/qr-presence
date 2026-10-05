<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $role = $user ? strtolower((string) $user->role) : '';
        $allowed = ['admin', 'manager'];

        if (!in_array($role, $allowed, true)) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya Super Admin dan Manager yang dapat mengakses fitur ini.'
            ], 403);
        }

        return $next($request);
    }
}

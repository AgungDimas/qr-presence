<?php
namespace App\Http\Controllers;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 15);
        $search  = $request->query('search');
        $role    = $request->query('role');

        $query = User::with('department')->latest();

        if ($search) {
            $q = "%{$search}%";
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', $q)
                    ->orWhere('email', 'like', $q);
            });
        }

        if ($role) {
            $query->where('role', $role);
        }

        return UserResource::collection($query->paginate($perPage));
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data)->load('department');

        return response()->json([
            'message' => 'Pegawai berhasil ditambahkan',
            'data'    => new UserResource($user),
        ], 201);
    }

    public function show(int $id)
    {
        $user = User::with('department')->find($id);
        if (!$user) {
            return response()->json(['message' => 'Pegawai tidak ditemukan'], 404);
        }
        return new UserResource($user);
    }

    public function update(UpdateUserRequest $request, int $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Pegawai tidak ditemukan'], 404);
        }

        $data = $request->validated();

        // Password hanya di-update jika dikirim & tidak null
        if (isset($data['password']) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);
        $user->load('department');

        return response()->json([
            'message' => 'Data pegawai berhasil diperbarui',
            'data'    => new UserResource($user),
        ]);
    }

    public function destroy(int $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Pegawai tidak ditemukan'], 404);
        }

        // Jangan izinkan hapus diri sendiri (safety)
        if (auth()->id() === $user->id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Pegawai berhasil dihapus']);
    }
}

<?php
namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        // Default: full list untuk dropdown
        $perPage = $request->query('per_page');
        $query   = Department::withCount('users')->latest();

        if ($perPage) {
            return response()->json([
                'data' => $query->paginate((int) $perPage),
            ]);
        }

        return response()->json([
            'data' => $query->get()->map(fn ($d) => [
                'id'          => $d->id,
                'name'        => $d->name,
                'description' => $d->description,
                'users_count' => $d->users_count,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255', 'unique:departments,name'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $department = Department::create($validated);

        return response()->json([
            'message' => 'Departemen berhasil ditambahkan',
            'data'    => $department,
        ], 201);
    }
}

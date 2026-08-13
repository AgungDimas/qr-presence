<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat 1 Departemen Default
        $dept = Department::create([
            'name' => 'IT & Engineering',
            'description' => 'Software Developer Department'
        ]);

        // 2. Buat Akun Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@qrpresence.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'department_id' => $dept->id,
        ]);
    }
}

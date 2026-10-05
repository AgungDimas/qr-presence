<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AttendanceSessionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\DepartmentController;
use App\Http\Middleware\EnsureUserIsStaff;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum Bearer Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // ===== Auth =====
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // ===== Attendance Scan (SEMUA ROLE: admin, manager, employee) =====
    Route::post('/attendances/scan', [\App\Http\Controllers\AttendanceController::class, 'scan']);

    // ===== Account Settings (current user - SEMUA ROLE) =====
    Route::prefix('settings')->group(function () {
        Route::put('/profile',   [SettingsController::class, 'updateProfile']);
        Route::put('/password',  [SettingsController::class, 'changePassword']);
    });

    // ===== HANYA ADMIN DAN MANAGER (Staff Area) =====
    Route::middleware(EnsureUserIsStaff::class)->group(function () {

        // Attendance Sessions CRUD
        Route::apiResource('/attendance-sessions', AttendanceSessionController::class);

        // Master Data: Departments
        Route::get('/departments', [DepartmentController::class, 'index']);
        Route::post('/departments', [DepartmentController::class, 'store']);

        // Users / Pegawai CRUD
        Route::apiResource('/users', UserController::class);
    });
});

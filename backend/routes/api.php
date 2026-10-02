<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AttendanceSessionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\DepartmentController;

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

    // ===== Attendance Sessions =====
    Route::apiResource('/attendance-sessions', AttendanceSessionController::class);

    // ===== Attendance Scan =====
    Route::post('/attendances/scan', [\App\Http\Controllers\AttendanceController::class, 'scan']);

    // ===== Master Data: Departments (dropdown + CRUD lite) =====
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::post('/departments', [DepartmentController::class, 'store']);

    // ===== Users / Pegawai CRUD =====
    Route::apiResource('/users', UserController::class);

    // ===== Account Settings (current user) =====
    Route::prefix('settings')->group(function () {
        Route::put('/profile',   [SettingsController::class, 'updateProfile']);
        Route::put('/password',  [SettingsController::class, 'changePassword']);
    });
});

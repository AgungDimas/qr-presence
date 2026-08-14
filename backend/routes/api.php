<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AttendanceSessionController;

// Route Public
Route::post('/login', [AuthController::class, 'login']);

// Route Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('/attendance-sessions', AttendanceSessionController::class);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

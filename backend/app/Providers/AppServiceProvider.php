<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\AuthRepositoryInterface;
use App\Repositories\AuthRepository;
use App\Repositories\Contracts\AttendanceSessionRepositoryInterface;
use App\Repositories\AttendanceSessionRepository;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AuthRepositoryInterface::class, AuthRepository::class);
        $this->app->bind(AttendanceSessionRepositoryInterface::class, AttendanceSessionRepository::class);
        $this->app->bind(\App\Repositories\Contracts\AttendanceRepositoryInterface::class, \App\Repositories\AttendanceRepository::class);
    }
    // ... sisanya biarkan
}

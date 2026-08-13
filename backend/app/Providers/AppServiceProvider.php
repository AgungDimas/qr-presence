<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\AuthRepositoryInterface;
use App\Repositories\AuthRepository;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Tambahkan baris ini
        $this->app->bind(AuthRepositoryInterface::class, AuthRepository::class);
    }
    // ... sisanya biarkan
}

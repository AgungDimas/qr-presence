<?php
namespace App\Repositories\Contracts;
use App\Models\AttendanceSession;

interface AttendanceSessionRepositoryInterface
{
    public function getAllPaginated(int $perPage = 10);
    public function findById(int $id): ?AttendanceSession;
    public function create(array $data): AttendanceSession;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}

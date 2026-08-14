<?php
namespace App\Repositories;
use App\Models\AttendanceSession;
use App\Repositories\Contracts\AttendanceSessionRepositoryInterface;

class AttendanceSessionRepository implements AttendanceSessionRepositoryInterface
{
    public function getAllPaginated(int $perPage = 10)
    {
        return AttendanceSession::with('creator')->latest()->paginate($perPage);
    }

    public function findById(int $id): ?AttendanceSession
    {
        return AttendanceSession::with('creator')->find($id);
    }

    public function create(array $data): AttendanceSession
    {
        return AttendanceSession::create($data);
    }

    public function update(int $id, array $data): bool
    {
        return AttendanceSession::where('id', $id)->update($data);
    }

    public function delete(int $id): bool
    {
        return AttendanceSession::destroy($id) > 0;
    }
}

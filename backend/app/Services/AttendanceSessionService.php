<?php
namespace App\Services;

use App\Repositories\Contracts\AttendanceSessionRepositoryInterface;
use Illuminate\Support\Str;

class AttendanceSessionService
{
    public function __construct(
        protected AttendanceSessionRepositoryInterface $sessionRepository
    ) {}

    public function getAllSessions(int $perPage = 10)
    {
        return $this->sessionRepository->getAllPaginated($perPage);
    }

    public function getSessionById(int $id)
    {
        return $this->sessionRepository->findById($id);
    }

    public function createSession(array $data, int $userId)
    {
        // Generate QR Data Unik (UUID)
        $data['qr_code_data'] = Str::uuid()->toString();
        $data['created_by'] = $userId;
        $data['is_active'] = true;

        return $this->sessionRepository->create($data);
    }

    public function updateSession(int $id, array $data)
    {
        return $this->sessionRepository->update($id, $data);
    }

    public function deleteSession(int $id)
    {
        return $this->sessionRepository->delete($id);
    }
}

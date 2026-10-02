<?php
namespace App\Repositories\Contracts;

interface AttendanceRepositoryInterface
{
    public function checkAlreadyAttended(int $userId, int $sessionId): bool;
    public function recordAttendance(array $data);
}

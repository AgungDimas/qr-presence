<?php
namespace App\Repositories;
use App\Models\Attendance;
use App\Repositories\Contracts\AttendanceRepositoryInterface;

class AttendanceRepository implements AttendanceRepositoryInterface
{
    public function checkAlreadyAttended(int $userId, int $sessionId): bool
    {
        return Attendance::where('user_id', $userId)
                         ->where('attendance_session_id', $sessionId)
                         ->exists();
    }

    public function recordAttendance(array $data)
    {
        return Attendance::create($data);
    }
}

<?php
namespace App\Services;

use App\Models\AttendanceSession;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use Illuminate\Validation\ValidationException;

class AttendanceService
{
    public function __construct(
        protected AttendanceRepositoryInterface $attendanceRepository
    ) {}

    public function processScan(array $data, $user)
    {
        // 1. Cari Sesi berdasarkan QR Code
        $session = AttendanceSession::where('qr_code_data', $data['qr_code_data'])->first();

        if (!$session) {
            throw ValidationException::withMessages(['qr' => 'QR Code tidak valid / tidak ditemukan.']);
        }

        // 2. Cek apakah sesi sudah ditutup/kedaluwarsa
        if (!$session->is_active || $session->valid_until < now()) {
            throw ValidationException::withMessages(['qr' => 'Sesi absensi ini sudah kedaluwarsa.']);
        }

        // 3. Cek apakah user sudah absen di sesi ini
        if ($this->attendanceRepository->checkAlreadyAttended($user->id, $session->id)) {
            throw ValidationException::withMessages(['qr' => 'Anda sudah melakukan absensi pada sesi ini.']);
        }

        // 4. Catat Absensi
        return $this->attendanceRepository->recordAttendance([
            'user_id' => $user->id,
            'attendance_session_id' => $session->id,
            'status' => 'present',
            'scanned_at' => now(),
            'location_lat' => $data['latitude'] ?? null,
            'location_lng' => $data['longitude'] ?? null,
            'device_info' => request()->userAgent(),
        ]);
    }
}

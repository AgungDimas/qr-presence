<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\AttendanceService;

class AttendanceController extends Controller
{
    public function __construct(protected AttendanceService $attendanceService) {}

    public function scan(Request $request)
    {
        $request->validate([
            'qr_code_data' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $this->attendanceService->processScan($request->all(), $request->user());

        return response()->json(['message' => 'Absensi berhasil dicatat!']);
    }
}

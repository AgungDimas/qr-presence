<?php
namespace App\Http\Controllers;

use App\Http\Requests\AttendanceSession\StoreSessionRequest;
use App\Http\Requests\AttendanceSession\UpdateSessionRequest;
use App\Http\Resources\AttendanceSessionResource;
use App\Services\AttendanceSessionService;
use Illuminate\Http\Request;

class AttendanceSessionController extends Controller
{
    public function __construct(
        protected AttendanceSessionService $sessionService
    ) {}

    public function index(Request $request)
    {
        $sessions = $this->sessionService->getAllSessions($request->query('per_page', 10));
        return AttendanceSessionResource::collection($sessions);
    }

    public function store(StoreSessionRequest $request)
    {
        $session = $this->sessionService->createSession($request->validated(), $request->user()->id);

        return response()->json([
            'message' => 'Sesi absensi berhasil dibuat',
            'data' => new AttendanceSessionResource($session)
        ], 201);
    }

    public function show($id)
    {
        $session = $this->sessionService->getSessionById($id);
        if (!$session) return response()->json(['message' => 'Sesi tidak ditemukan'], 404);

        return new AttendanceSessionResource($session);
    }

    public function update(UpdateSessionRequest $request, $id)
    {
        $this->sessionService->updateSession($id, $request->validated());
        return response()->json(['message' => 'Sesi berhasil diperbarui']);
    }

    public function destroy($id)
    {
        $this->sessionService->deleteSession($id);
        return response()->json(['message' => 'Sesi berhasil dihapus']);
    }
}

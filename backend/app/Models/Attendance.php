<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'user_id', 'attendance_session_id', 'status',
        'scanned_at', 'location_lat', 'location_lng', 'device_info'
    ];

    protected function casts(): array
    {
        return [
            'scanned_at' => 'datetime',
            'location_lat' => 'decimal:8',
            'location_lng' => 'decimal:8',
        ];
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function session() {
        return $this->belongsTo(AttendanceSession::class, 'attendance_session_id');
    }
}

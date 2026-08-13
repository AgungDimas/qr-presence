<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceSession extends Model
{
    protected $fillable = [
        'title', 'description', 'qr_code_data', 'valid_until',
        'is_active', 'latitude', 'longitude', 'radius', 'created_by'
    ];

    protected function casts(): array
    {
        return [
            'valid_until' => 'datetime',
            'is_active' => 'boolean',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    // Relasi: Siapa admin yang membuat sesi absen ini?
    public function creator() {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relasi: 1 Sesi absen punya banyak data absen dari pegawai
    public function attendances() {
        return $this->hasMany(Attendance::class);
    }
}

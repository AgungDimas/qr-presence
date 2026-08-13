<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name', 'description'];

    // Relasi: 1 Departemen punya banyak User/Pegawai
    public function users() {
        return $this->hasMany(User::class);
    }
}

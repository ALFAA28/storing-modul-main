<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisPerangkat extends Model
{
    protected $table = 'jenis_perangkats';

    protected $fillable = [
        'nama_jenis',
        'kode',
        'keterangan',
    ];

    protected $casts = [
        'id' => 'string',
    ];
}

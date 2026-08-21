<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class catatan_revisi extends Model
{
    protected $guarded = [];

    protected $casts = [
        'id' => 'string',
        'modul_id' => 'string',
        'pengawas_id' => 'string',
    ];
}

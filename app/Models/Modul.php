<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Modul extends Model
{
    // Mengizinkan semua kolom diisi
    protected $guarded = []; 

    protected $casts = [
        'id' => 'string',
        'user_id' => 'string',
        'mapel_id' => 'string',
    ];

    protected $appends = ['mapel', 'jenis', 'file_path'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function mapelRelation() {
        return $this->belongsTo(Mapel::class, 'mapel_id');
    }

    public function catatanRevisis() {
        return $this->hasMany(catatan_revisi::class);
    }

    public function getMapelAttribute()
    {
        return $this->mapelRelation ? $this->mapelRelation->nama_mapel : null;
    }

    public function getJenisAttribute()
    {
        if ($this->jenis_perangkat === 'modul') return 'Modul';
        if ($this->jenis_perangkat === 'prota') return 'Prota';
        if ($this->jenis_perangkat === 'promes') return 'Promes';
        return ucfirst($this->jenis_perangkat);
    }

    public function getFilePathAttribute()
    {
        if (!$this->file_pdf_path) return null;

        // Jika path sudah berupa URL utuh (Cloudinary), langsung kembalikan URL-nya
        if (str_starts_with($this->file_pdf_path, 'http')) {
            return $this->file_pdf_path;
        }

        // Jika path lokal, gabungkan dengan asset storage
        return asset('storage/' . $this->file_pdf_path);
    }

    public function getStatusAttribute($value)
    {
        if ($value === 'acc') return 'ACC';
        return ucfirst($value); // pending -> Pending, revisi -> Revisi
    }

    public function setStatusAttribute($value)
    {
        $this->attributes['status'] = strtolower($value);
    }
}

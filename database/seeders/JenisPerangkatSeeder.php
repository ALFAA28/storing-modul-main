<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\JenisPerangkat;

class JenisPerangkatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            'Rincian Pekan Efektif',
            'Program Tahunan',
            'Program Semester',
            'Capaian Pembelajaran (CP)',
            'Alur Tujuan Pembelajaran (ATP)',
            'Ketentuan KKTP',
            'Modul Ajar',
            'Jurnal Mengajar'
        ];

        foreach ($types as $t) {
            JenisPerangkat::firstOrCreate(['nama_jenis' => $t]);
        }
    }
}

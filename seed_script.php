<?php

$types = [
    'Rincian Pekan Efektif' => 'RPE',
    'Program Tahunan' => 'PROTA',
    'Program Semester' => 'PROMES',
    'Capaian Pembelajaran (CP)' => 'CP',
    'Alur Tujuan Pembelajaran (ATP)' => 'ATP',
    'Ketentuan KKTP' => 'KKTP',
    'Modul Ajar' => 'MA',
    'Jurnal Mengajar' => 'JM'
];

foreach ($types as $t => $k) {
    // Check if exists
    $exists = Illuminate\Support\Facades\DB::table('jenis_perangkats')->where('nama_jenis', $t)->exists();
    if (!$exists) {
        Illuminate\Support\Facades\DB::table('jenis_perangkats')->insert([
            'nama_jenis' => $t,
            'kode' => $k,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
echo "Done!\n";

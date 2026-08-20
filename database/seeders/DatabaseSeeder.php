<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Mapel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Membuat Akun Admin (Waka Kurikulum / Super Admin)
        User::create([
            'name' => 'Bu Ulfa (Waka Kurikulum)',
            'email' => 'admin@sekolah.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // 2. Membuat Akun Pengawas
        User::create([
            'name' => 'Pak Pengawas',
            'email' => 'pengawas@sekolah.com',
            'password' => Hash::make('password123'),
            'role' => 'pengawas',
        ]);

        // 3. Membuat Akun Guru
        User::create([
            'name' => 'Guru Sejarah',
            'email' => 'guru@sekolah.com',
            'password' => Hash::make('password123'),
            'role' => 'guru',
        ]);

        // 4. Membuat Data Mata Pelajaran (Mapel)
        Mapel::create([
            'nama_mapel' => 'Sejarah Indonesia',
            'tingkat_kelas' => '10',
        ]);

        Mapel::create([
            'nama_mapel' => 'Pendidikan Agama Islam',
            'tingkat_kelas' => '11',
        ]);
    }
}
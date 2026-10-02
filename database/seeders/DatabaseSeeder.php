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
        User::create([
            'name' => 'Admin Sekolah',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

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
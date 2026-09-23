<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public $withinTransaction = false;

    /**
     * Ubah kolom jenis_perangkat dari ENUM ke VARCHAR
     * agar bisa menampung ATP, KKTP, dan jenis perangkat lainnya
     * yang ditambahkan secara dinamis dari master data.
     */
    public function up(): void
    {
        // PostgreSQL/CockroachDB: Ubah tipe kolom
        DB::statement("ALTER TABLE moduls ALTER COLUMN jenis_perangkat TYPE VARCHAR(100)");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Kembalikan ke enum (hanya jika data sudah bersih)
        DB::statement("ALTER TABLE moduls ALTER COLUMN jenis_perangkat TYPE VARCHAR(100)");
    }
};

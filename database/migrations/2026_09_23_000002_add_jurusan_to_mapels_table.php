<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    /**
     * Tambah kolom jurusan ke tabel mapels
     * untuk mendukung struktur folder: Mapel → Jurusan → Kelas
     * pada mapel tertentu (B. Indo, B. Ing, MTK).
     */
    public function up(): void
    {
        Schema::table('mapels', function (Blueprint $table) {
            $table->string('jurusan')->nullable()->after('tingkat_kelas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mapels', function (Blueprint $table) {
            $table->dropColumn('jurusan');
        });
    }
};

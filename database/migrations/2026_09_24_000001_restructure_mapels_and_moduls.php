<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public $withinTransaction = false;

    /**
     * Simplifikasi mapels: hapus tingkat_kelas dan jurusan (pindah ke moduls).
     * Tambah tahun_ajaran, kelas, jurusan ke moduls.
     * Truncate data dummy.
     */
    public function up(): void
    {
        // 1. Tambah kolom baru ke moduls
        if (!Schema::hasColumn('moduls', 'tahun_ajaran')) {
            Schema::table('moduls', function (Blueprint $table) {
                $table->string('tahun_ajaran', 20)->nullable()->after('jenis_perangkat');
            });
        }

        if (!Schema::hasColumn('moduls', 'kelas')) {
            Schema::table('moduls', function (Blueprint $table) {
                $table->string('kelas', 10)->nullable()->after('tahun_ajaran');
            });
        }

        if (!Schema::hasColumn('moduls', 'jurusan')) {
            Schema::table('moduls', function (Blueprint $table) {
                $table->string('jurusan', 50)->nullable()->after('kelas');
            });
        }

        // 2. Tambah is_approved ke users (untuk fitur approval akun storing)
        if (!Schema::hasColumn('users', 'is_approved')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_approved')->default(true)->after('role');
            });
        }

        // 3. Truncate data dummy mapels dan jenis_perangkats
        DB::table('mapels')->delete();
        DB::table('jenis_perangkats')->delete();
    }

    public function down(): void
    {
        Schema::table('moduls', function (Blueprint $table) {
            $table->dropColumn(['tahun_ajaran', 'kelas', 'jurusan']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_approved');
        });
    }
};

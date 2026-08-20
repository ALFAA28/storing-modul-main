<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('moduls', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Guru pembuat
        $table->foreignId('mapel_id')->constrained('mapels')->cascadeOnDelete(); // Relasi ke Mapel
        $table->string('judul');
        $table->enum('jenis_perangkat', ['modul', 'prota', 'promes']);
        $table->string('file_pdf_path'); // Tempat menyimpan URL/path dokumen
        $table->enum('status', ['pending', 'revisi', 'acc'])->default('pending');
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('moduls');
    }
};

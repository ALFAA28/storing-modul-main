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
        Schema::create('catatan_revisis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('modul_id')->constrained('moduls')->cascadeOnDelete();
            $table->foreignId('pengawas_id')->constrained('users')->cascadeOnDelete(); // Pengawas yang meriview
            $table->text('catatan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catatan_revisis');
    }
};

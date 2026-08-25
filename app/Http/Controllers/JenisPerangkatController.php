<?php

namespace App\Http\Controllers;

use App\Models\JenisPerangkat;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class JenisPerangkatController extends Controller
{
    /**
     * Pastikan tabel jenis_perangkats ada dan memiliki data default awal
     */
    private function ensureTableAndDefaults()
    {
        try {
            if (!Schema::hasTable('jenis_perangkats')) {
                Schema::create('jenis_perangkats', function (Blueprint $table) {
                    $table->id();
                    $table->string('nama_jenis');
                    $table->string('kode')->unique();
                    $table->text('keterangan')->nullable();
                    $table->timestamps();
                });
            }

            // Seed default types jika masih kosong
            if (JenisPerangkat::count() === 0) {
                JenisPerangkat::insert([
                    [
                        'nama_jenis' => 'Modul Ajar / RPP',
                        'kode' => 'modul',
                        'keterangan' => 'Rencana pelaksanaan pembelajaran atau modul ajar kurikulum merdeka/K13',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'nama_jenis' => 'Program Tahunan (Prota)',
                        'kode' => 'prota',
                        'keterangan' => 'Rencana alokasi waktu pembelajaran selama satu tahun ajaran',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'nama_jenis' => 'Program Semester (Promes)',
                        'kode' => 'promes',
                        'keterangan' => 'Rencana program pembelajaran dan distribusi materi per semester',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                ]);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Error checking jenis_perangkats table: ' . $e->getMessage());
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->ensureTableAndDefaults();

        try {
            $data = JenisPerangkat::orderBy('nama_jenis', 'asc')->get();
        } catch (\Throwable $e) {
            // Fallback default array jika ada kendala query database
            $data = [
                ['id' => '1', 'nama_jenis' => 'Modul Ajar / RPP', 'kode' => 'modul', 'keterangan' => 'Rencana pelaksanaan pembelajaran atau modul ajar kurikulum merdeka/K13'],
                ['id' => '2', 'nama_jenis' => 'Program Tahunan (Prota)', 'kode' => 'prota', 'keterangan' => 'Rencana alokasi waktu pembelajaran selama satu tahun ajaran'],
                ['id' => '3', 'nama_jenis' => 'Program Semester (Promes)', 'kode' => 'promes', 'keterangan' => 'Rencana program pembelajaran dan distribusi materi per semester'],
            ];
        }

        return response()->json([
            'message' => 'Berhasil mengambil daftar jenis perangkat',
            'data' => $data
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->ensureTableAndDefaults();

        $request->validate([
            'nama_jenis' => 'required|string|max:255',
            'kode' => 'nullable|string|max:100',
            'keterangan' => 'nullable|string|max:1000',
        ]);

        $kode = $request->kode ? Str::slug($request->kode, '_') : Str::slug($request->nama_jenis, '_');
        
        // Pastikan kode unik
        $existing = JenisPerangkat::where('kode', $kode)->first();
        if ($existing) {
            $kode = $kode . '_' . time();
        }

        $jenis = JenisPerangkat::create([
            'nama_jenis' => $request->nama_jenis,
            'kode' => $kode,
            'keterangan' => $request->keterangan,
        ]);

        return response()->json([
            'message' => 'Jenis perangkat pembelajaran berhasil ditambahkan!',
            'data' => $jenis
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $this->ensureTableAndDefaults();

        $request->validate([
            'nama_jenis' => 'required|string|max:255',
            'kode' => 'nullable|string|max:100',
            'keterangan' => 'nullable|string|max:1000',
        ]);

        $jenis = JenisPerangkat::findOrFail($id);

        $kode = $request->kode ? Str::slug($request->kode, '_') : ($jenis->kode ?: Str::slug($request->nama_jenis, '_'));

        // Cek jika kode digunakan oleh ID lain
        $duplicate = JenisPerangkat::where('kode', $kode)->where('id', '!=', $id)->first();
        if ($duplicate) {
            $kode = $kode . '_' . time();
        }

        $jenis->update([
            'nama_jenis' => $request->nama_jenis,
            'kode' => $kode,
            'keterangan' => $request->keterangan,
        ]);

        return response()->json([
            'message' => 'Jenis perangkat pembelajaran berhasil diperbarui!',
            'data' => $jenis
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $this->ensureTableAndDefaults();

        $jenis = JenisPerangkat::findOrFail($id);
        $jenis->delete();

        return response()->json([
            'message' => 'Jenis perangkat pembelajaran berhasil dihapus!'
        ], 200);
    }
}

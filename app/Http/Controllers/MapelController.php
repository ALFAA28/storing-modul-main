<?php

namespace App\Http\Controllers;

use App\Models\Mapel;
use Illuminate\Http\Request;

class MapelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Berhasil mengambil daftar mapel',
            'data' => Mapel::orderBy('nama_mapel', 'asc')->get()
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_mapel' => 'required|string|max:255',
            'tingkat_kelas' => 'required|string|max:50',
        ]);

        $mapel = Mapel::create([
            'nama_mapel' => $request->nama_mapel,
            'tingkat_kelas' => $request->tingkat_kelas,
        ]);

        return response()->json([
            'message' => 'Mata pelajaran berhasil ditambahkan!',
            'data' => $mapel
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_mapel' => 'required|string|max:255',
            'tingkat_kelas' => 'required|string|max:50',
        ]);

        $mapel = Mapel::findOrFail($id);
        $mapel->update([
            'nama_mapel' => $request->nama_mapel,
            'tingkat_kelas' => $request->tingkat_kelas,
        ]);

        return response()->json([
            'message' => 'Mata pelajaran berhasil diperbarui!',
            'data' => $mapel
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $mapel = Mapel::findOrFail($id);
        $mapel->delete();

        return response()->json([
            'message' => 'Mata pelajaran berhasil dihapus!'
        ], 200);
    }
}

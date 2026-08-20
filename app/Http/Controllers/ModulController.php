<?php

namespace App\Http\Controllers;

use App\Models\Modul;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ModulController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'guru') {
            $moduls = Modul::with(['user', 'mapelRelation', 'catatanRevisis'])->where('user_id', $user->id)->get();
        } else {
            $moduls = Modul::with(['user', 'mapelRelation', 'catatanRevisis'])->get();
        }

        return response()->json([
            'message' => 'Berhasil mengambil data arsip',
            'data' => $moduls
        ], 200);
    }

    public function review(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:ACC,Revisi,Pending,acc,revisi,pending',
            'catatan_revisi' => 'nullable|string',
        ]);

        $modul = Modul::findOrFail($id);
        $modul->status = $request->status; // automatically lowercased by mutator
        $modul->save();

        if ($request->filled('catatan_revisi')) {
            $modul->catatanRevisis()->create([
                'pengawas_id' => Auth::id(),
                'catatan' => $request->catatan_revisi,
            ]);
        }

        return response()->json([
            'message' => 'Tinjauan dokumen berhasil disimpan!',
            'data' => $modul->load(['user', 'mapelRelation', 'catatanRevisis'])
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'mapel_id' => 'required|exists:mapels,id',
            'jenis_perangkat' => 'required|in:modul,prota,promes',
            'file_pdf' => 'required|mimes:pdf|max:5120', 
        ]);

        $path = $request->file('file_pdf')->store('arsip_dokumen', 'public');

        $modul = Modul::create([
            'user_id' => Auth::id(),
            'mapel_id' => $request->mapel_id,
            'judul' => $request->judul,
            'jenis_perangkat' => $request->jenis_perangkat,
            'file_pdf_path' => $path,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Dokumen berhasil diunggah!',
            'data' => $modul
        ], 201);
    }
}
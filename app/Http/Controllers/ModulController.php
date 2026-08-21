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

        if (in_array($user->role, ['guru', 'guru_mapel', 'wali_kelas'])) {
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
            'file_pdf' => 'required|mimes:pdf|max:10240', 
        ]);

        $file = $request->file('file_pdf');
        $cloudinaryUrl = env('CLOUDINARY_URL');

        if ($cloudinaryUrl) {
            // Upload to Cloudinary using direct REST API
            $parsed = parse_url($cloudinaryUrl);
            $apiKey = $parsed['user'] ?? '';
            $apiSecret = $parsed['pass'] ?? '';
            $cloudName = $parsed['host'] ?? '';

            $timestamp = time();
            $signature = sha1("timestamp=" . $timestamp . $apiSecret);

            $response = \Illuminate\Support\Facades\Http::attach(
                'file', file_get_contents($file->getRealPath()), $file->getClientOriginalName()
            )->post('https://api.cloudinary.com/v1_1/' . $cloudName . '/auto/upload', [
                'api_key' => $apiKey,
                'timestamp' => $timestamp,
                'signature' => $signature
            ]);

            if ($response->successful()) {
                $path = $response->json('secure_url');
            } else {
                return response()->json(['message' => 'Gagal upload file ke Cloudinary.'], 500);
            }
        } else {
            // Fallback to local storage if Cloudinary is not configured
            $path = $file->store('arsip_dokumen', 'public');
        }

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

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $modul = Modul::findOrFail($id);

        $isAdmin = in_array($user->role, ['admin', 'pengawas']);
        $isOwner = (string)$modul->user_id === (string)$user->id;

        if (!$isAdmin && !$isOwner) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengubah perangkat milik pengguna lain.'], 403);
        }

        $request->validate([
            'judul' => 'required|string|max:255',
            'mapel_id' => 'required|exists:mapels,id',
            'jenis_perangkat' => 'required|in:modul,prota,promes',
            'file_pdf' => 'nullable|mimes:pdf|max:10240', 
        ]);

        if ($request->hasFile('file_pdf')) {
            $file = $request->file('file_pdf');
            $cloudinaryUrl = env('CLOUDINARY_URL');

            if ($cloudinaryUrl) {
                $parsed = parse_url($cloudinaryUrl);
                $apiKey = $parsed['user'] ?? '';
                $apiSecret = $parsed['pass'] ?? '';
                $cloudName = $parsed['host'] ?? '';

                $timestamp = time();
                $signature = sha1("timestamp=" . $timestamp . $apiSecret);

                $response = \Illuminate\Support\Facades\Http::attach(
                    'file', file_get_contents($file->getRealPath()), $file->getClientOriginalName()
                )->post('https://api.cloudinary.com/v1_1/' . $cloudName . '/auto/upload', [
                    'api_key' => $apiKey,
                    'timestamp' => $timestamp,
                    'signature' => $signature
                ]);

                if ($response->successful()) {
                    $modul->file_pdf_path = $response->json('secure_url');
                } else {
                    return response()->json(['message' => 'Gagal upload file ke Cloudinary.'], 500);
                }
            } else {
                $modul->file_pdf_path = $file->store('arsip_dokumen', 'public');
            }
        }

        $modul->judul = $request->judul;
        $modul->mapel_id = $request->mapel_id;
        $modul->jenis_perangkat = strtolower($request->jenis_perangkat);
        
        // Return status back to pending if teacher edited
        if (!$isAdmin) {
            $modul->status = 'pending';
        }

        $modul->save();

        return response()->json([
            'message' => 'Data perangkat pembelajaran berhasil diperbarui!',
            'data' => $modul->load(['user', 'mapelRelation', 'catatanRevisis'])
        ], 200);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $modul = Modul::findOrFail($id);

        $isAdmin = in_array($user->role, ['admin', 'pengawas']);
        $isOwner = (string)$modul->user_id === (string)$user->id;

        if (!$isAdmin && !$isOwner) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menghapus perangkat milik pengguna lain.'], 403);
        }

        $modul->catatanRevisis()->delete();
        $modul->delete();

        return response()->json([
            'message' => 'Data perangkat pembelajaran berhasil dihapus!'
        ], 200);
    }
}
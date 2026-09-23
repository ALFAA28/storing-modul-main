<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Mengambil semua user (admin, guru) yang mendaftar via portal Storing Modul
     */
    public function index()
    {
        $users = User::where('app_source', 'storing')
            ->where('id', '!=', auth()->id() ?? 0)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'role', 'status', 'app_source', 'nrg', 'created_at']);

        return response()->json([
            'message' => 'Berhasil mengambil daftar akun Storing Modul.',
            'data' => $users
        ], 200);
    }

    /**
     * Daftar akun guru yang mendaftar via portal Arsip Perangkat Pembelajaran
     * dan statusnya pending (kompatibilitas backward).
     */
    public function pendingUsers()
    {
        $users = User::where('app_source', 'storing')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'role', 'status', 'app_source', 'nrg', 'created_at']);

        return response()->json([
            'message' => 'Berhasil mengambil daftar akun pending.',
            'data' => $users
        ], 200);
    }

    /**
     * Approve akun guru (ubah status jadi active).
     */
    public function approve($id)
    {
        $user = User::findOrFail($id);
        $user->status = 'active';
        $user->save();

        return response()->json([
            'message' => "Akun \"{$user->name}\" berhasil disetujui!",
            'data' => $user
        ], 200);
    }

    /**
     * Update status akun (active, inactive, pending).
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:active,inactive,pending'
        ]);

        $user = User::findOrFail($id);
        
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Status akun Admin tidak dapat diubah.'], 403);
        }

        $user->status = $request->status;
        $user->save();

        return response()->json([
            'message' => 'Status user berhasil diperbarui',
            'user' => $user
        ], 200);
    }

    /**
     * Reset password.
     */
    public function resetPassword($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Tidak dapat mereset sandi sesama Admin.'], 403);
        }

        $defaultPassword = 'password123';
        $user->password = Hash::make($defaultPassword);
        $user->save();

        return response()->json([
            'message' => 'Sandi berhasil direset menjadi: ' . $defaultPassword
        ], 200);
    }

    /**
     * Update Role dan Nrg.
     */
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|string|in:wali_kelas,guru_mapel,admin,sarpras',
            'nrg' => 'nullable|string|max:50'
        ]);

        $user = User::findOrFail($id);
        $user->role = $request->role;
        if ($request->has('nrg')) {
            $user->nrg = $request->nrg;
        }
        $user->save();

        return response()->json([
            'message' => 'Akun berhasil diperbarui',
            'user' => $user
        ], 200);
    }

    /**
     * Tolak / hapus akun guru.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Akun Admin tidak dapat dihapus.'], 403);
        }
        
        $name = $user->name;
        $user->delete();

        return response()->json([
            'message' => "Akun \"{$name}\" berhasil dihapus."
        ], 200);
    }
}

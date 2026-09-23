<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Daftar akun guru yang mendaftar via portal Arsip Perangkat Pembelajaran
     * dan belum di-approve.
     */
    public function pendingUsers()
    {
        $users = User::where('app_source', 'storing')
            ->where('is_approved', false)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'role', 'app_source', 'is_approved', 'created_at']);

        return response()->json([
            'message' => 'Berhasil mengambil daftar akun pending.',
            'data' => $users
        ], 200);
    }

    /**
     * Daftar semua akun guru yang sudah di-approve (untuk referensi Admin).
     */
    public function approvedUsers()
    {
        $users = User::where('app_source', 'storing')
            ->where('is_approved', true)
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'email', 'role', 'app_source', 'is_approved', 'created_at']);

        return response()->json([
            'message' => 'Berhasil mengambil daftar akun aktif.',
            'data' => $users
        ], 200);
    }

    /**
     * Approve akun guru.
     */
    public function approve($id)
    {
        $user = User::findOrFail($id);
        $user->is_approved = true;
        $user->save();

        return response()->json([
            'message' => "Akun \"{$user->name}\" berhasil disetujui!",
            'data' => $user
        ], 200);
    }

    /**
     * Tolak / hapus akun guru.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $name = $user->name;
        $user->delete();

        return response()->json([
            'message' => "Akun \"{$name}\" berhasil dihapus."
        ], 200);
    }
}

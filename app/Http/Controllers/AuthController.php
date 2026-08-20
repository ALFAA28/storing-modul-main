<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validasi input dari React
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Cek kecocokan email dan password di database
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email atau password salah!'
            ], 401); // 401 = Unauthorized
        }

        // 3. Jika cocok, ambil data usernya
        $user = User::where('email', $request->email)->firstOrFail();

        // 4. Buat Token Akses (Sanctum)
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Kirim balasan ke React (Token dan Data User beserta Role-nya)
        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role, // Ini penting untuk React membatasi tampilan Dasbor
            ]
        ], 200);
    }
}
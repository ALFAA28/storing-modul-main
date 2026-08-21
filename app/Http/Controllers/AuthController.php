<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * SSO Login: Forward credentials to Absensi backend,
     * sync user locally, then issue a local Sanctum token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $absensiUrl = rtrim(env('BACKEND_ABSENSI_URL', 'http://localhost:8001'), '/');

        // 1. Forward login request to Absensi backend
        try {
            $response = Http::timeout(15)->post($absensiUrl . '/api/login', [
                'email' => $request->email,
                'password' => $request->password,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Tidak dapat terhubung ke server autentikasi. Silakan coba lagi nanti.'
            ], 503);
        }

        // 2. If Absensi backend rejects login, forward the error
        if (!$response->successful()) {
            $status = $response->status();
            $body = $response->json();
            return response()->json([
                'message' => $body['message'] ?? 'Login gagal.'
            ], $status);
        }

        $absensiData = $response->json();
        $absensiUser = $absensiData['user'] ?? [];

        // 3. Map Absensi role to Storing Modul role
        $absensiRole = $absensiUser['role'] ?? 'guru_mapel';
        $modulRole = $this->mapRole($absensiRole);

        // 4. Block roles that shouldn't access Storing Modul (e.g. sarpras)
        if ($modulRole === null) {
            return response()->json([
                'message' => 'Akun Anda tidak memiliki akses ke sistem Arsip Modul Pembelajaran.'
            ], 403);
        }

        // 5. Fetch local user (since DB is shared, they already exist)
        $localUser = User::where('email', $request->email)->first();

        if (!$localUser) {
            return response()->json(['message' => 'User tidak ditemukan di database lokal.'], 404);
        }

        // 6. Create local Sanctum token
        $token = $localUser->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $localUser->id,
                'name' => $localUser->name,
                'email' => $localUser->email,
                'role' => $modulRole,
                'nrg' => $localUser->nrg,
            ]
        ], 200);
    }

    /**
     * True SSO: Verify token from Absensi frontend.
     */
    public function verifySso(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $absensiUrl = rtrim(env('BACKEND_ABSENSI_URL', 'http://localhost:8001'), '/');

        try {
            // Call Absensi backend to get user details using the provided token
            $response = Http::withToken($request->token)
                ->timeout(15)
                ->get($absensiUrl . '/api/user');
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Tidak dapat memverifikasi token ke server absensi.'
            ], 503);
        }

        if (!$response->successful()) {
            return response()->json([
                'message' => 'Token SSO tidak valid atau sudah kadaluarsa.'
            ], 401);
        }

        $absensiUser = $response->json();

        // 3. Map Absensi role to Storing Modul role
        $absensiRole = $absensiUser['role'] ?? 'guru_mapel';
        $modulRole = $this->mapRole($absensiRole);

        // 4. Block roles that shouldn't access Storing Modul (e.g. sarpras)
        if ($modulRole === null) {
            return response()->json([
                'message' => 'Akun Anda tidak memiliki akses ke sistem Arsip Modul Pembelajaran.'
            ], 403);
        }

        // 5. Fetch local user (since DB is shared, they already exist)
        $localUser = User::where('email', $absensiUser['email'])->first();

        if (!$localUser) {
            return response()->json(['message' => 'User tidak ditemukan di database lokal.'], 404);
        }

        // 6. Create local Sanctum token
        $token = $localUser->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login SSO berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $localUser->id,
                'name' => $localUser->name,
                'email' => $localUser->email,
                'role' => $modulRole,
                'nrg' => $localUser->nrg,
            ]
        ], 200);
    }

    /**
     * Logout: Revoke current token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ], 200);
    }

    /**
     * Map Absensi role to Storing Modul role.
     * Returns null if the role should not have access.
     */
    private function mapRole(string $absensiRole): ?string
    {
        return match ($absensiRole) {
            'admin' => 'admin',
            'wali_kelas', 'guru_mapel', 'guru' => 'guru',
            default => null, // sarpras and other roles are blocked
        };
    }
}
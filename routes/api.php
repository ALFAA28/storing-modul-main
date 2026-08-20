<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ModulController;

// SSO Login (forwards to Absensi backend)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/sso/verify', [AuthController::class, 'verifySso']);

// Protected routes: require Sanctum token
Route::middleware('auth:sanctum')->group(function () {
    
    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Current user info
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
            ]
        ]);
    });

    // API Modul
    Route::get('/moduls', [ModulController::class, 'index']);
    Route::post('/moduls', [ModulController::class, 'store']);
    Route::post('/moduls/{id}/review', [ModulController::class, 'review']);

    // API Mapel
    Route::get('/mapels', function () {
        return response()->json([
            'data' => \App\Models\Mapel::all()
        ]);
    });
});
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
    Route::put('/moduls/{id}', [ModulController::class, 'update']);
    Route::post('/moduls/{id}/update', [ModulController::class, 'update']);
    Route::delete('/moduls/{id}', [ModulController::class, 'destroy']);
    Route::post('/moduls/{id}/delete', [ModulController::class, 'destroy']);
    Route::post('/moduls/{id}/review', [ModulController::class, 'review']);

    // API Mapel
    Route::get('/mapels', [\App\Http\Controllers\MapelController::class, 'index']);
    Route::post('/mapels', [\App\Http\Controllers\MapelController::class, 'store']);
    Route::delete('/mapels/{id}', [\App\Http\Controllers\MapelController::class, 'destroy']);
});
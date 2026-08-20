<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ModulController;

Route::post('/login', [AuthController::class, 'login']);
// Kunci dengan Sanctum: Harus bawa Token hasil login untuk bisa akses ini
Route::middleware('auth:sanctum')->group(function () {
    
    // API untuk melihat siapa yang sedang login
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // API Modul
    Route::get('/moduls', [ModulController::class, 'index']); // Ambil data
    Route::post('/moduls', [ModulController::class, 'store']); // Upload data
    Route::post('/moduls/{id}/review', [ModulController::class, 'review']); // Review data

    // API Mapel
    Route::get('/mapels', function () {
        return response()->json([
            'data' => \App\Models\Mapel::all()
        ]);
    });
});
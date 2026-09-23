<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;

class SettingController extends Controller
{
    public function getActiveTahunAjaran()
    {
        $setting = Setting::where('key', 'tahun_ajaran_aktif')->first();
        return response()->json([
            'tahun_ajaran' => $setting ? $setting->value : '2025/2026'
        ]);
    }

    public function updateActiveTahunAjaran(Request $request)
    {
        $request->validate([
            'tahun_ajaran' => 'required|string|max:20'
        ]);

        $setting = Setting::updateOrCreate(
            ['key' => 'tahun_ajaran_aktif'],
            ['value' => $request->tahun_ajaran]
        );

        return response()->json([
            'message' => 'Tahun Ajaran Aktif berhasil diperbarui!',
            'tahun_ajaran' => $setting->value
        ]);
    }
}

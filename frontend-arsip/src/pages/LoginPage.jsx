import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  useEffect(() => {
    const absensiFrontendUrl = import.meta.env.VITE_ABSENSI_FRONTEND_URL || 'https://absensi-smk-nu-donomulyo.vercel.app';
    // In a real environment you'd use window.location.origin
    const currentUrl = window.location.origin;

    // Terapkan Auto-Redirect (Bypass Interstitial Page)
    // Langsung arahkan ke halaman SSO Absensi
    window.location.href = `${absensiFrontendUrl}/login-storing?redirect=${currentUrl}/sso-callback`;
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
      <h2 className="text-white font-bold">Mengarahkan ke Sistem Otentikasi...</h2>
      <p className="text-slate-400 text-sm mt-2">Mohon tunggu sebentar.</p>
    </div>
  );
}


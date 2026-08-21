import React, { useEffect } from 'react';
import { BookOpen, LogIn, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  
  const absensiFrontendUrl = 'https://absensi-smk-nu-donomulyo.vercel.app';
  // In a real environment you'd use window.location.origin
  const currentUrl = window.location.origin;

  const handleSsoLogin = () => {
    // Redirect to Absensi login with redirect parameter back to SSO callback
    window.location.href = `${absensiFrontendUrl}/login-storing?redirect=${currentUrl}/sso-callback`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Arsip Modul Pembelajaran
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Sistem Manajemen Perangkat Pembelajaran SMK
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
               <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Login Terintegrasi</h2>
          <p className="text-sm text-slate-400 mb-8 px-4 leading-relaxed">
            Sistem Arsip Modul kini terintegrasi penuh dengan <strong>Web Absensi Sekolah</strong>. Anda akan diarahkan ke halaman login Web Absensi untuk verifikasi aman.
          </p>

          <button
            onClick={handleSsoLogin}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all duration-200 cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            <span>Masuk via Web Absensi</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} SMK NU Kota Tegal — Terintegrasi dengan Sistem Absensi
        </p>
      </div>
    </div>
  );
}

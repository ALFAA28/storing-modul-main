import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../services/api';

export default function SSOCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Token otentikasi tidak ditemukan. Harap ulangi proses login.');
      return;
    }

    const verify = async () => {
      try {
        const data = await authService.verifySso(token);
        const role = data.user?.role;
        
        // Login berhasil, token & user sudah disimpan oleh authService
        if (role === 'admin' || role === 'pengawas') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/guru';
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memverifikasi sesi dengan server Absensi.');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full">
        {error ? (
          <>
            <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-500/30 mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Login Gagal</h2>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all w-full"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Kembali ke Halaman Login</span>
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-1">Memverifikasi Sesi...</h2>
            <p className="text-sm text-slate-400">Harap tunggu sebentar, kami sedang menyiapkan workspace Anda.</p>
          </>
        )}
      </div>
    </div>
  );
}

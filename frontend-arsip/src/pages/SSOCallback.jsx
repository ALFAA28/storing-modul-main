import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../services/api';

const LOADING_MESSAGES = [
  'Memverifikasi sesi Anda...',
  'Menyiapkan workspace...',
  'Menyinkronkan data pembelajaran...',
  'Mengecek hak akses...',
  'Memuat konfigurasi...',
  'Hampir selesai...',
];

export default function SSOCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Dynamic loading message rotation
  useEffect(() => {
    if (error) return;

    const msgInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 2200);

    return () => clearInterval(msgInterval);
  }, [error]);

  // Animated progress bar (indeterminate but visually progressing)
  useEffect(() => {
    if (error) return;

    const progInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90; // Cap at 90% until actually done
        // Slow down as it progresses
        const increment = prev < 30 ? 8 : prev < 60 ? 4 : 2;
        return Math.min(prev + increment, 90);
      });
    }, 400);

    return () => clearInterval(progInterval);
  }, [error]);

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
        
        // Complete the progress bar
        setProgress(100);
        
        // Small delay for visual satisfaction
        setTimeout(() => {
          // Login berhasil, token & user sudah disimpan oleh authService
          if (role === 'admin' || role === 'pengawas') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/guru';
          }
        }, 500);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memverifikasi sesi dengan server Absensi.');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full">
        {error ? (
          <>
            <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-500/30 mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Login Gagal</h2>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all w-full cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Kembali ke Halaman Login</span>
            </button>
          </>
        ) : (
          <>
            {/* Animated Spinner */}
            <div className="relative w-16 h-16 mx-auto mb-6">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Dynamic Loading Message with fade animation */}
            <div className="h-14 flex flex-col items-center justify-center">
              <h2 
                key={messageIndex}
                className="text-lg font-bold text-white mb-1 animate-fade-in"
              >
                {LOADING_MESSAGES[messageIndex]}
              </h2>
              <p className="text-sm text-slate-400">
                Harap tunggu sebentar
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 font-medium">{progress}%</p>
          </>
        )}
      </div>

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

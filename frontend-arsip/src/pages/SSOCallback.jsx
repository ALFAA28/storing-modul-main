import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';

export default function SSOCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Token otentikasi tidak ditemukan. Harap ulangi proses login.');
      // Auto-redirect back to login after short delay if no token
      setTimeout(() => navigate('/login', { replace: true }), 2000);
      return;
    }

    const verify = async () => {
      try {
        const data = await authService.verifySso(token);
        const role = data.user?.role;
        
        // Fast, silent redirect. No artificial delays.
        if (role === 'admin' || role === 'pengawas') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/guru', { replace: true });
        }
      } catch (err) {
        setError('Gagal memverifikasi sesi. Mengarahkan kembali ke login...');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    verify();
  }, [searchParams, navigate]);

  // Render a completely blank/minimal background so the user doesn't see a flash of complex UI
  // This acts as a "silent check" from the user's perspective.
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      {error && (
        <div className="text-sm font-medium text-slate-500">
          {error}
        </div>
      )}
    </div>
  );
}

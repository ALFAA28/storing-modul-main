import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import './Login.css';
import { authService } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Mohon isi email dan password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const data = await authService.login(email, password);
      // Determine dashboard based on role
      const user = data.user;
      if (user.role === 'admin' || user.role === 'pengawas') {
        navigate('/admin/dashboard');
      } else {
        navigate('/guru/dashboard');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Gagal terhubung ke server. Pastikan backend berjalan.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-wrapper">
          <img src="/IMG_03611.png" alt="Logo SMK NU Donomulyo" className="overlapping-logo" />
        </div>
        <div className="login-header">
          <h2>Sistem Informasi Storing Modul</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Login khusus untuk akses Arsip Modul</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-icon-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="Masukkan email anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper" style={{ position: 'relative' }}>
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Masukkan password anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  cursor: 'pointer',
                  color: '#94a3b8' 
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn-login"
            style={{ backgroundColor: '#4f46e5' }}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <FaSignInAlt className="btn-icon" /> Login ke Storing Modul
              </>
            )}
          </button>
        </form>

        <div className="login-link" style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Belum punya akun Storing? <Link to="/register-storing" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 'bold' }}>Daftar di sini</Link>
        </div>

        <div className="login-link" style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          <a href="https://absensi-smk-nu-donomulyo.vercel.app/login" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <FaArrowLeft /> Kembali ke Login Absensi
          </a>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0 16px 0' }} />

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
          <strong>SMK NU DONOMULYO MALANG © 2026</strong>
          <div>Malang, Indonesia</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

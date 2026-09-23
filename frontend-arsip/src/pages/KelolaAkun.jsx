import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Trash2, ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react';
import { userService } from '../services/api';

export default function KelolaAkun() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.getPendingUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data akun pending.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = async (id, name) => {
    setProcessingId(id);
    try {
      await userService.approveUser(id);
      showToast('success', `Akun ${name} berhasil disetujui!`);
      fetchUsers();
    } catch (err) {
      showToast('error', `Gagal menyetujui akun ${name}.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus akun ${name}?`)) return;
    
    setProcessingId(id);
    try {
      await userService.deleteUser(id);
      showToast('success', `Akun ${name} berhasil dihapus.`);
      fetchUsers();
    } catch (err) {
      showToast('error', `Gagal menghapus akun ${name}.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border animate-in slide-in-from-top-2 fade-in duration-300 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <p className="text-sm font-bold tracking-wide pr-2">{toastMessage.text}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight sm:text-2xl">
            Kelola Akun (Persetujuan)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Tinjau dan setujui pendaftaran akun guru baru untuk aplikasi Arsip Perangkat Pembelajaran.
          </p>
        </div>
        <div>
          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-premium overflow-hidden">
        
        <div className="p-5 border-b border-slate-150 bg-slate-50/20">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-700">Daftar Akun Menunggu Persetujuan</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-450 text-xs font-medium">Memuat data akun...</p>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <ShieldAlert className="w-12 h-12 text-rose-300 mb-3" />
              <p className="text-rose-600 text-sm font-bold">{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-slate-800 font-bold mb-1">Tidak ada akun pending</h3>
              <p className="text-slate-500 text-xs">Semua pendaftaran akun telah ditinjau.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-6 w-16">No</th>
                  <th className="py-3.5 px-6">Nama Guru</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Tanggal Daftar</th>
                  <th className="py-3.5 px-6 text-center w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {users.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-800">
                      {user.name}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-6 text-slate-450 text-[11px]">
                      {new Date(user.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprove(user.id, user.name)}
                          disabled={processingId === user.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition-all border border-emerald-200 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={processingId === user.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold transition-all border border-rose-200 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

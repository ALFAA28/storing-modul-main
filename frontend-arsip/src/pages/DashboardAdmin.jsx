import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, Search, ShieldAlert, CheckCircle, Clock, Eye, AlertCircle, RefreshCw, Trash2, Edit3, Plus, Layers } from 'lucide-react';
import { modulService, jenisPerangkatService } from '../services/api';

export default function DashboardAdmin({ refreshTrigger, onOpenReview, onOpenEdit, onOpenUpload }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMasterTab = searchParams.get('tab') === 'master';

  const [moduls, setModuls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenis, setSelectedJenis] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [jenisOptions, setJenisOptions] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load modules
  const loadModuls = async () => {
    setLoading(true);
    try {
      const data = await modulService.getAllModuls();
      setModuls(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load jenis list for filter dropdown
  const loadJenis = async () => {
    try {
      const res = await jenisPerangkatService.getAllJenis();
      if (res.data && res.data.length > 0) {
        setJenisOptions(res.data);
      }
    } catch (err) {
      console.warn('Gagal memuat jenis perangkat:', err);
    }
  };

  useEffect(() => {
    loadModuls();
    loadJenis();
  }, [refreshTrigger]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await modulService.deleteModul(deleteTarget.id);
      setDeleteTarget(null);
      loadModuls();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus modul.');
    } finally {
      setDeleting(false);
    }
  };

  // Statistics calculation
  const stats = {
    total: moduls.length,
    pending: moduls.filter(m => m.status === 'Pending').length,
    acc: moduls.filter(m => m.status === 'ACC').length,
    revisi: moduls.filter(m => m.status === 'Revisi').length,
  };

  // Filtered modules
  const filteredModuls = moduls.filter(m => {
    const matchesSearch = (m.judul || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.mapel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Support matching both exact string or lowercased kode
    const mJenis = (m.jenis || m.jenis_perangkat || '').toLowerCase();
    const selJenis = selectedJenis.toLowerCase();
    const matchesJenis = selectedJenis
      ? (mJenis === selJenis || (m.jenis && m.jenis.toLowerCase().includes(selJenis)))
      : true;

    const matchesStatus = selectedStatus ? m.status === selectedStatus : true;
    return matchesSearch && matchesJenis && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  return (
    <div className="space-y-6">

      {!isMasterTab && (
        <>
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight sm:text-2xl">
                Workspace Pengawas & Admin
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Tinjau, verifikasi, dan kelola perangkat pembelajaran yang diunggah oleh seluruh guru.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={loadModuls}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan</span>
              </button>
              <button
                onClick={() => navigate('/admin/master-data')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-indigo-200"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Kelola Mapel & Jenis Perangkat</span>
              </button>
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 cursor-pointer self-start sm:self-center"
              >
                <Plus className="w-4 h-4" />
                <span>Unggah Perangkat Baru</span>
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Total Submission Card */}
            <div className="glass-card shadow-premium p-4 sm:p-5 rounded-2xl flex items-center justify-between group hover:scale-[1.01] transition-all-custom">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-450 uppercase tracking-wider">Total Masuk</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            {/* Needs Review (Pending) Card */}
            <div className="glass-card shadow-premium p-4 sm:p-5 rounded-2xl flex items-center justify-between group hover:scale-[1.01] transition-all-custom">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-450 uppercase tracking-wider">Perlu Tinjauan</p>
                <h3 className="text-2xl font-extrabold text-amber-650 mt-1">{stats.pending}</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
            </div>

            {/* Approved Card */}
            <div className="glass-card shadow-premium p-4 sm:p-5 rounded-2xl flex items-center justify-between group hover:scale-[1.01] transition-all-custom">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-450 uppercase tracking-wider font-bold">Disetujui / ACC</p>
                <h3 className="text-2xl font-extrabold text-emerald-650 mt-1">{stats.acc}</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            {/* Revisions Card */}
            <div className="glass-card shadow-premium p-4 sm:p-5 rounded-2xl flex items-center justify-between group hover:scale-[1.01] transition-all-custom">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-450 uppercase tracking-wider">Perlu Perbaikan</p>
                <h3 className="text-2xl font-extrabold text-rose-650 mt-1">{stats.revisi}</h3>
              </div>
              <div className="p-3 bg-rose-50 text-rose-650 rounded-xl">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

          </div>
        </>
      )}

      {/* Master Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-premium overflow-hidden">

        {/* Table Header Filter Control */}
        <div className="p-5 border-b border-slate-150 bg-slate-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-700">Master Data Perangkat Pembelajaran</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 sm:flex-none">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari guru, judul, atau mapel..."
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Filter Jenis Dinamis */}
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">Semua Perangkat</option>
              {jenisOptions.length > 0 ? (
                jenisOptions.map((j) => (
                  <option key={j.id || j.kode} value={j.kode || j.nama_jenis}>
                    {j.nama_jenis}
                  </option>
                ))
              ) : (
                <>
                  <option value="Modul">Modul / RPP</option>
                  <option value="Prota">Prota</option>
                  <option value="Promes">Promes</option>
                </>
              )}
            </select>

            {/* Filter Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="ACC">ACC</option>
              <option value="Revisi">Revisi</option>
            </select>
          </div>
        </div>

        {/* Master Table Container */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-450 text-xs">Memuat seluruh modul...</p>
            </div>
          ) : filteredModuls.length === 0 ? (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
              <div className="bg-slate-50 p-4 rounded-full text-slate-350 mb-3">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Dokumen tidak ditemukan</h3>
              <p className="text-xs text-slate-450 mt-1 max-w-xs">
                {searchQuery || selectedJenis || selectedStatus
                  ? 'Cobalah ubah kata kunci pencarian atau bersihkan filter Anda.'
                  : 'Belum ada guru yang mengunggah berkas perangkat pembelajaran.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-6">Nama Guru</th>
                  <th className="py-3.5 px-6">Judul Dokumen</th>
                  <th className="py-3.5 px-6">Jenis</th>
                  <th className="py-3.5 px-6">Mata Pelajaran</th>
                  <th className="py-3.5 px-6">Waktu Upload</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredModuls.map((modul) => (
                  <tr key={modul.id} className="hover:bg-slate-50/50 transition-colors">

                    {/* Kolom Nama Guru */}
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border flex items-center justify-center font-bold text-slate-600 text-[10px]">
                          {modul.user?.name ? modul.user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'G'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{modul.user?.name || 'Guru Pengampu'}</p>
                          <p className="text-[9px] text-slate-450 mt-0.5">ID Guru: #{modul.user_id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Judul & Preview */}
                    <td className="py-4 px-6 font-semibold text-slate-800 max-w-xs">
                      <div className="overflow-hidden">
                        <p className="truncate font-bold text-slate-850 hover:underline cursor-pointer" onClick={() => onOpenReview(modul)}>
                          {modul.judul}
                        </p>
                        {modul.catatan_revisi && (
                          <p className={`text-[9px] mt-1 py-0.5 px-2 rounded-md inline-block font-medium border ${modul.status === 'Revisi'
                              ? 'bg-rose-50/40 text-rose-600 border-rose-100/40'
                              : 'bg-emerald-50/40 text-emerald-600 border-emerald-100/30'
                            }`}>
                            Catatan: "{modul.catatan_revisi}"
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Jenis Perangkat */}
                    <td className="py-4 px-6">
                      <span className="inline-flex px-2 py-0.5 rounded-md font-semibold text-[10px] bg-slate-100 text-slate-700">
                        {modul.jenis}
                      </span>
                    </td>

                    {/* Mapel */}
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {modul.mapel}
                    </td>

                    {/* Waktu Upload */}
                    <td className="py-4 px-6 text-slate-450">
                      {formatDate(modul.created_at)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${modul.status === 'ACC'
                          ? 'bg-emerald-100 text-emerald-800'
                          : modul.status === 'Revisi'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${modul.status === 'ACC'
                            ? 'bg-emerald-500'
                            : modul.status === 'Revisi'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`} />
                        {modul.status}
                      </span>
                    </td>

                    {/* Action buttons (Review/Preview & Delete) */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {modul.status === 'Pending' ? (
                          <button
                            onClick={() => onOpenReview(modul)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-extrabold transition-all duration-200 cursor-pointer shadow-sm shadow-indigo-600/15 hover:shadow-indigo-600/30"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenReview(modul)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenEdit && onOpenEdit(modul)}
                          title="Edit Perangkat"
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer border border-indigo-200"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(modul)}
                          title="Hapus Perangkat"
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer border border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-800">Hapus Data Perangkat?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus perangkat <strong>"{deleteTarget.judul}"</strong> yang diunggah oleh <strong>{deleteTarget.user?.name || 'Guru'}</strong>?
              </p>
              <p className="text-[11px] text-rose-600 font-bold pt-1">
                Tindakan ini permanen dan tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

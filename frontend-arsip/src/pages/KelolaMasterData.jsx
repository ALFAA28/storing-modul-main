import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  GraduationCap, 
  FolderCheck, 
  X, 
  Tag, 
  Sparkles,
  Info,
  Filter
} from 'lucide-react';
import { mapelService, jenisPerangkatService } from '../services/api';

export default function KelolaMasterData() {
  const [activeTab, setActiveTab] = useState('mapel'); // 'mapel' | 'jenis'

  // ==========================================
  // STATE: MAPEL
  // ==========================================
  const [mapels, setMapels] = useState([]);
  const [loadingMapel, setLoadingMapel] = useState(true);
  const [searchMapel, setSearchMapel] = useState('');
  const [filterTingkat, setFilterTingkat] = useState('');

  // Mapel Modals
  const [isMapelModalOpen, setIsMapelModalOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState(null);
  const [mapelForm, setMapelForm] = useState({ nama_mapel: '', tingkat_kelas: '10' });
  const [savingMapel, setSavingMapel] = useState(false);
  const [mapelError, setMapelError] = useState('');

  // Mapel Delete
  const [deleteTargetMapel, setDeleteTargetMapel] = useState(null);
  const [deletingMapel, setDeletingMapel] = useState(false);

  // ==========================================
  // STATE: JENIS PERANGKAT
  // ==========================================
  const [jenisList, setJenisList] = useState([]);
  const [loadingJenis, setLoadingJenis] = useState(true);
  const [searchJenis, setSearchJenis] = useState('');

  // Jenis Modals
  const [isJenisModalOpen, setIsJenisModalOpen] = useState(false);
  const [editingJenis, setEditingJenis] = useState(null);
  const [jenisForm, setJenisForm] = useState({ nama_jenis: '', kode: '', keterangan: '' });
  const [savingJenis, setSavingJenis] = useState(false);
  const [jenisError, setJenisError] = useState('');

  // Jenis Delete
  const [deleteTargetJenis, setDeleteTargetJenis] = useState(null);
  const [deletingJenis, setDeletingJenis] = useState(false);

  // Toast / Global Alert
  const [toastMessage, setToastMessage] = useState(null); // { type: 'success'|'error', text: '' }

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchMapels = async () => {
    setLoadingMapel(true);
    try {
      const res = await mapelService.getAllMapels();
      setMapels(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'Gagal memuat data mata pelajaran.');
    } finally {
      setLoadingMapel(false);
    }
  };

  const fetchJenis = async () => {
    setLoadingJenis(true);
    try {
      const res = await jenisPerangkatService.getAllJenis();
      setJenisList(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'Gagal memuat data jenis perangkat.');
    } finally {
      setLoadingJenis(false);
    }
  };

  useEffect(() => {
    fetchMapels();
    fetchJenis();
  }, []);

  // ==========================================
  // HANDLERS: MAPEL
  // ==========================================
  const handleOpenAddMapel = () => {
    setEditingMapel(null);
    setMapelForm({ nama_mapel: '', tingkat_kelas: '10' });
    setMapelError('');
    setIsMapelModalOpen(true);
  };

  const handleOpenEditMapel = (mapel) => {
    setEditingMapel(mapel);
    setMapelForm({
      nama_mapel: mapel.nama_mapel,
      tingkat_kelas: String(mapel.tingkat_kelas),
    });
    setMapelError('');
    setIsMapelModalOpen(true);
  };

  const handleSaveMapel = async (e) => {
    e.preventDefault();
    if (!mapelForm.nama_mapel.trim()) {
      setMapelError('Nama mata pelajaran wajib diisi.');
      return;
    }
    setSavingMapel(true);
    setMapelError('');
    try {
      if (editingMapel) {
        await mapelService.updateMapel(editingMapel.id, {
          nama_mapel: mapelForm.nama_mapel.trim(),
          tingkat_kelas: mapelForm.tingkat_kelas,
        });
        showToast('success', `Mata pelajaran "${mapelForm.nama_mapel}" berhasil diperbarui!`);
      } else {
        await mapelService.createMapel({
          nama_mapel: mapelForm.nama_mapel.trim(),
          tingkat_kelas: mapelForm.tingkat_kelas,
        });
        showToast('success', `Mata pelajaran "${mapelForm.nama_mapel}" berhasil ditambahkan!`);
      }
      setIsMapelModalOpen(false);
      fetchMapels();
    } catch (err) {
      setMapelError(err.response?.data?.message || 'Gagal menyimpan mata pelajaran.');
    } finally {
      setSavingMapel(false);
    }
  };

  const handleDeleteMapel = async () => {
    if (!deleteTargetMapel) return;
    setDeletingMapel(true);
    try {
      await mapelService.deleteMapel(deleteTargetMapel.id);
      showToast('success', `Mata pelajaran "${deleteTargetMapel.nama_mapel}" berhasil dihapus.`);
      setDeleteTargetMapel(null);
      fetchMapels();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menghapus mata pelajaran.');
    } finally {
      setDeletingMapel(false);
    }
  };

  // Filtered Mapels
  const filteredMapels = mapels.filter((m) => {
    const matchesSearch = (m.nama_mapel || '').toLowerCase().includes(searchMapel.toLowerCase());
    const matchesTingkat = filterTingkat ? String(m.tingkat_kelas) === String(filterTingkat) : true;
    return matchesSearch && matchesTingkat;
  });

  // Mapel Stats
  const mapelStats = {
    total: mapels.length,
    k10: mapels.filter((m) => String(m.tingkat_kelas) === '10').length,
    k11: mapels.filter((m) => String(m.tingkat_kelas) === '11').length,
    k12: mapels.filter((m) => String(m.tingkat_kelas) === '12').length,
    umum: mapels.filter((m) => !['10', '11', '12'].includes(String(m.tingkat_kelas))).length,
  };

  // ==========================================
  // HANDLERS: JENIS PERANGKAT
  // ==========================================
  const handleOpenAddJenis = () => {
    setEditingJenis(null);
    setJenisForm({ nama_jenis: '', kode: '', keterangan: '' });
    setJenisError('');
    setIsJenisModalOpen(true);
  };

  const handleOpenEditJenis = (jenis) => {
    setEditingJenis(jenis);
    setJenisForm({
      nama_jenis: jenis.nama_jenis || '',
      kode: jenis.kode || '',
      keterangan: jenis.keterangan || '',
    });
    setJenisError('');
    setIsJenisModalOpen(true);
  };

  const handleSaveJenis = async (e) => {
    e.preventDefault();
    if (!jenisForm.nama_jenis.trim()) {
      setJenisError('Nama jenis perangkat wajib diisi.');
      return;
    }
    setSavingJenis(true);
    setJenisError('');
    try {
      if (editingJenis) {
        await jenisPerangkatService.updateJenis(editingJenis.id, {
          nama_jenis: jenisForm.nama_jenis.trim(),
          kode: jenisForm.kode.trim() || undefined,
          keterangan: jenisForm.keterangan.trim(),
        });
        showToast('success', `Jenis perangkat "${jenisForm.nama_jenis}" berhasil diperbarui!`);
      } else {
        await jenisPerangkatService.createJenis({
          nama_jenis: jenisForm.nama_jenis.trim(),
          kode: jenisForm.kode.trim() || undefined,
          keterangan: jenisForm.keterangan.trim(),
        });
        showToast('success', `Jenis perangkat "${jenisForm.nama_jenis}" berhasil ditambahkan!`);
      }
      setIsJenisModalOpen(false);
      fetchJenis();
    } catch (err) {
      setJenisError(err.response?.data?.message || 'Gagal menyimpan jenis perangkat.');
    } finally {
      setSavingJenis(false);
    }
  };

  const handleDeleteJenis = async () => {
    if (!deleteTargetJenis) return;
    setDeletingJenis(true);
    try {
      await jenisPerangkatService.deleteJenis(deleteTargetJenis.id);
      showToast('success', `Jenis perangkat "${deleteTargetJenis.nama_jenis}" berhasil dihapus.`);
      setDeleteTargetJenis(null);
      fetchJenis();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menghapus jenis perangkat.');
    } finally {
      setDeletingJenis(false);
    }
  };

  // Filtered Jenis
  const filteredJenis = jenisList.filter((j) => {
    const q = searchJenis.toLowerCase();
    return (
      (j.nama_jenis || '').toLowerCase().includes(q) ||
      (j.kode || '').toLowerCase().includes(q) ||
      (j.keterangan || '').toLowerCase().includes(q)
    );
  });

  const getTingkatBadge = (tingkat) => {
    const t = String(tingkat);
    if (t === '10') {
      return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Kelas 10</span>;
    }
    if (t === '11') {
      return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Kelas 11</span>;
    }
    if (t === '12') {
      return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Kelas 12</span>;
    }
    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">{t === 'Umum' ? 'Semua Kelas' : `Kelas ${t}`}</span>;
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-5 duration-200 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight sm:text-2xl">
                Kelola Master Data
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm">
                Manajemen data Mata Pelajaran (Mapel) dan Jenis Perangkat Pembelajaran Sekolah
              </p>
            </div>
          </div>
        </div>

        {/* Global Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchMapels();
              fetchJenis();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-px">
        <button
          onClick={() => setActiveTab('mapel')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
            activeTab === 'mapel'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Mata Pelajaran (Mapel)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'mapel' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {mapels.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('jenis')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
            activeTab === 'jenis'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Jenis Perangkat Pembelajaran</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'jenis' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {jenisList.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT: MATA PELAJARAN (MAPEL) */}
      {/* ========================================================================= */}
      {activeTab === 'mapel' && (
        <div className="space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-premium flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Mapel</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">{mapelStats.total}</h3>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-premium flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Kelas 10</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-0.5">{mapelStats.k10}</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-premium flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Kelas 11</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-indigo-600 mt-0.5">{mapelStats.k11}</h3>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-200 shadow-premium flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Kelas 12</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-purple-600 mt-0.5">{mapelStats.k12}</h3>
              </div>
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Mapel Main Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-premium overflow-hidden">
            
            {/* Header Toolbar */}
            <div className="p-5 border-b border-slate-150 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-700">Daftar Mata Pelajaran</h2>
                <span className="text-xs text-slate-450">({filteredMapels.length} item)</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative min-w-[200px] flex-1 sm:flex-none">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchMapel}
                    onChange={(e) => setSearchMapel(e.target.value)}
                    placeholder="Cari mata pelajaran..."
                    className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Filter Tingkat */}
                <select
                  value={filterTingkat}
                  onChange={(e) => setFilterTingkat(e.target.value)}
                  className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Semua Tingkat</option>
                  <option value="10">Kelas 10</option>
                  <option value="11">Kelas 11</option>
                  <option value="12">Kelas 12</option>
                  <option value="Umum">Umum / Semua</option>
                </select>

                {/* Tambah Button */}
                <button
                  onClick={handleOpenAddMapel}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Mapel</span>
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              {loadingMapel ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-slate-450 text-xs">Memuat mata pelajaran...</p>
                </div>
              ) : filteredMapels.length === 0 ? (
                <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
                  <div className="bg-slate-50 p-4 rounded-full text-slate-350 mb-3">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">Mata Pelajaran Tidak Ditemukan</h3>
                  <p className="text-xs text-slate-450 mt-1 max-w-xs">
                    {searchMapel || filterTingkat 
                      ? 'Tidak ada mapel yang cocok dengan pencarian / filter Anda.'
                      : 'Belum ada data mata pelajaran. Klik tombol "Tambah Mapel" untuk membuat data baru.'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3.5 px-6 w-16">No</th>
                      <th className="py-3.5 px-6">Nama Mata Pelajaran</th>
                      <th className="py-3.5 px-6">Tingkat Kelas</th>
                      <th className="py-3.5 px-6">Tanggal Penambahan</th>
                      <th className="py-3.5 px-6 text-center w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredMapels.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-6 font-bold text-slate-800">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                              {item.nama_mapel ? item.nama_mapel[0].toUpperCase() : 'M'}
                            </div>
                            <span>{item.nama_mapel}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          {getTingkatBadge(item.tingkat_kelas)}
                        </td>
                        <td className="py-3.5 px-6 text-slate-450 text-[11px]">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditMapel(item)}
                              title="Edit Mapel"
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all cursor-pointer border border-indigo-200"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetMapel(item)}
                              title="Hapus Mapel"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200"
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

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: JENIS PERANGKAT */}
      {/* ========================================================================= */}
      {activeTab === 'jenis' && (
        <div className="space-y-6">
          
          {/* Quick Info Box */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed">
              <p className="font-bold">Informasi Jenis Perangkat Pembelajaran:</p>
              <p className="text-indigo-700 mt-0.5">
                Jenis perangkat yang ditambahkan di sini akan secara otomatis muncul sebagai opsi pilihan saat Guru atau Admin mengunggah/mengedit berkas perangkat pembelajaran (misalnya Modul Ajar/RPP, Prota, Promes, ATP, Silabus, LKPD, dll).
              </p>
            </div>
          </div>

          {/* Jenis Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-premium overflow-hidden">
            
            {/* Header Toolbar */}
            <div className="p-5 border-b border-slate-150 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-700">Daftar Jenis Perangkat</h2>
                <span className="text-xs text-slate-450">({filteredJenis.length} jenis)</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative min-w-[220px] flex-1 sm:flex-none">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchJenis}
                    onChange={(e) => setSearchJenis(e.target.value)}
                    placeholder="Cari nama jenis / kode..."
                    className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Tambah Button */}
                <button
                  onClick={handleOpenAddJenis}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Jenis Perangkat</span>
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              {loadingJenis ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-slate-450 text-xs">Memuat jenis perangkat...</p>
                </div>
              ) : filteredJenis.length === 0 ? (
                <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
                  <div className="bg-slate-50 p-4 rounded-full text-slate-350 mb-3">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">Jenis Perangkat Tidak Ditemukan</h3>
                  <p className="text-xs text-slate-450 mt-1 max-w-xs">
                    {searchJenis 
                      ? 'Tidak ada jenis perangkat yang cocok dengan pencarian Anda.'
                      : 'Belum ada jenis perangkat yang terdaftar. Silakan klik tombol "Tambah Jenis Perangkat".'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3.5 px-6 w-16">No</th>
                      <th className="py-3.5 px-6">Nama Jenis Perangkat</th>
                      <th className="py-3.5 px-6">Kode Identifier</th>
                      <th className="py-3.5 px-6">Keterangan / Deskripsi</th>
                      <th className="py-3.5 px-6 text-center w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredJenis.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-6 font-bold text-slate-800">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                              <FolderCheck className="w-4 h-4" />
                            </div>
                            <span>{item.nama_jenis}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center gap-1 font-mono px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {item.kode || item.nama_jenis?.toLowerCase().replace(/\s+/g, '_')}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-500 max-w-sm">
                          <p className="truncate text-xs">{item.keterangan || '-'}</p>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditJenis(item)}
                              title="Edit Jenis Perangkat"
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all cursor-pointer border border-indigo-200"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetJenis(item)}
                              title="Hapus Jenis Perangkat"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200"
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

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT MAPEL */}
      {/* ========================================================================= */}
      {isMapelModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  {editingMapel ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsMapelModalOpen(false)}
                disabled={savingMapel}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMapel} className="p-6 space-y-4">
              {mapelError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{mapelError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nama Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={mapelForm.nama_mapel}
                  onChange={(e) => setMapelForm({ ...mapelForm, nama_mapel: e.target.value })}
                  placeholder="Contoh: Pemrograman Web & Perangkat Bergerak"
                  disabled={savingMapel}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Tingkat Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={mapelForm.tingkat_kelas}
                  onChange={(e) => setMapelForm({ ...mapelForm, tingkat_kelas: e.target.value })}
                  disabled={savingMapel}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="10">Kelas 10 (Fase E)</option>
                  <option value="11">Kelas 11 (Fase F)</option>
                  <option value="12">Kelas 12 (Fase F Lanjutan)</option>
                  <option value="Umum">Semua Kelas / Umum</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMapelModalOpen(false)}
                  disabled={savingMapel}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingMapel}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingMapel ? 'Menyimpan...' : editingMapel ? 'Simpan Perubahan' : 'Tambah Mapel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KONFIRMASI HAPUS MAPEL */}
      {/* ========================================================================= */}
      {deleteTargetMapel && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-800">Hapus Mata Pelajaran?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus mata pelajaran <strong>"{deleteTargetMapel.nama_mapel}"</strong> (Kelas {deleteTargetMapel.tingkat_kelas})?
              </p>
              <p className="text-[11px] text-rose-600 font-bold pt-1">
                Perhatian: Modul yang terhubung dengan mata pelajaran ini mungkin terpengaruh.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetMapel(null)}
                disabled={deletingMapel}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteMapel}
                disabled={deletingMapel}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deletingMapel ? 'Menghapus...' : 'Ya, Hapus Mapel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT JENIS PERANGKAT */}
      {/* ========================================================================= */}
      {isJenisModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  {editingJenis ? 'Edit Jenis Perangkat' : 'Tambah Jenis Perangkat Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsJenisModalOpen(false)}
                disabled={savingJenis}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveJenis} className="p-6 space-y-4">
              {jenisError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{jenisError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nama Jenis Perangkat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={jenisForm.nama_jenis}
                  onChange={(e) => setJenisForm({ ...jenisForm, nama_jenis: e.target.value })}
                  placeholder="Contoh: Alur Tujuan Pembelajaran (ATP)"
                  disabled={savingJenis}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Kode / Identifier <span className="text-[10px] text-slate-400 font-normal">(Opsional - otomatis dibuat jika dikosongkan)</span>
                </label>
                <input
                  type="text"
                  value={jenisForm.kode}
                  onChange={(e) => setJenisForm({ ...jenisForm, kode: e.target.value })}
                  placeholder="Contoh: atp atau modul_ajar"
                  disabled={savingJenis}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-mono focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Keterangan / Deskripsi <span className="text-[10px] text-slate-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  rows="3"
                  value={jenisForm.keterangan}
                  onChange={(e) => setJenisForm({ ...jenisForm, keterangan: e.target.value })}
                  placeholder="Deskripsi singkat jenis perangkat pembelajaran..."
                  disabled={savingJenis}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsJenisModalOpen(false)}
                  disabled={savingJenis}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingJenis}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingJenis ? 'Menyimpan...' : editingJenis ? 'Simpan Perubahan' : 'Tambah Jenis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KONFIRMASI HAPUS JENIS */}
      {/* ========================================================================= */}
      {deleteTargetJenis && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-800">Hapus Jenis Perangkat?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus jenis perangkat <strong>"{deleteTargetJenis.nama_jenis}"</strong>?
              </p>
              <p className="text-[11px] text-rose-600 font-bold pt-1">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetJenis(null)}
                disabled={deletingJenis}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteJenis}
                disabled={deletingJenis}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deletingJenis ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { X, FileText, Upload, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { modulService, mapelService } from '../services/api';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  if (!isOpen) return null;

  const [judul, setJudul] = useState('');
  const [mapelId, setMapelId] = useState('');
  const [jenis, setJenis] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mapels, setMapels] = useState([]);

  // State untuk Tambah Mapel Baru
  const [showAddMapel, setShowAddMapel] = useState(false);
  const [newMapelNama, setNewMapelNama] = useState('');
  const [newMapelTingkat, setNewMapelTingkat] = useState('10');
  const [savingMapel, setSavingMapel] = useState(false);
  const [mapelError, setMapelError] = useState('');

  const fileInputRef = useRef(null);

  const fetchMapels = async () => {
    try {
      const res = await mapelService.getAllMapels();
      setMapels(res.data || []);
    } catch (err) {
      console.warn('Gagal memuat mapel dari backend:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMapels();
    }
  }, [isOpen]);

  const jenisOptions = [
    { value: 'Modul', label: 'Modul Ajar / RPP' },
    { value: 'Prota', label: 'Program Tahunan (Prota)' },
    { value: 'Promes', label: 'Program Semester (Promes)' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Hanya berkas format PDF (.pdf) yang diperbolehkan.');
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB Limit
      setError('Ukuran berkas melebihi batas maksimal 10 MB.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Simpan Mata Pelajaran Baru
  const handleSaveMapel = async (e) => {
    e.preventDefault();
    if (!newMapelNama.trim()) {
      setMapelError('Nama mata pelajaran wajib diisi.');
      return;
    }
    setSavingMapel(true);
    setMapelError('');
    try {
      const res = await mapelService.createMapel({
        nama_mapel: newMapelNama.trim(),
        tingkat_kelas: newMapelTingkat,
      });
      const created = res.data;
      setMapels(prev => [...prev, created]);
      setMapelId(created.id);
      setNewMapelNama('');
      setShowAddMapel(false);
    } catch (err) {
      setMapelError(err.response?.data?.message || 'Gagal menambahkan mata pelajaran.');
    } finally {
      setSavingMapel(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!judul.trim()) {
      setError('Judul dokumen wajib diisi.');
      return;
    }
    if (!mapelId) {
      setError('Silakan pilih Mata Pelajaran.');
      return;
    }
    if (!jenis) {
      setError('Silakan pilih Jenis Perangkat.');
      return;
    }
    if (!file) {
      setError('Wajib mengunggah file perangkat pembelajaran (.pdf).');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('judul', judul.trim());
      formData.append('mapel_id', mapelId);
      formData.append('jenis_perangkat', jenis.toLowerCase());
      formData.append('file_pdf', file);

      await modulService.uploadModul(formData);
      
      setSuccess(true);
      setTimeout(() => {
        // Reset form & close modal
        setJudul('');
        setMapelId('');
        setJenis('');
        setFile(null);
        setSuccess(false);
        onUploadSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengunggah modul. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Unggah Perangkat Pembelajaran</h3>
            <p className="text-xs text-slate-500">Tambahkan modul, prota, atau promes baru</p>
          </div>
          <button 
            onClick={onClose}
            disabled={loading || success}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Notification Messages */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Perangkat pembelajaran berhasil diunggah!</span>
            </div>
          )}

          {/* Judul Dokumen */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Judul Perangkat
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: RPP Matematika Kelas X Aljabar"
              disabled={loading || success}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Dropdowns row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dropdown Mapel */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Mata Pelajaran
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddMapel(!showAddMapel)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  {showAddMapel ? '✕ Tutup' : '+ Tambah Mapel'}
                </button>
              </div>

              {showAddMapel ? (
                <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2 mb-2">
                  <p className="text-[11px] font-bold text-indigo-900">Tambah Mata Pelajaran Baru:</p>
                  {mapelError && <p className="text-[10px] text-rose-600 font-medium">{mapelError}</p>}
                  <input
                    type="text"
                    value={newMapelNama}
                    onChange={(e) => setNewMapelNama(e.target.value)}
                    placeholder="Nama Mapel (misal: Bahasa Jawa)"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={newMapelTingkat}
                      onChange={(e) => setNewMapelTingkat(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="10">Kelas 10</option>
                      <option value="11">Kelas 11</option>
                      <option value="12">Kelas 12</option>
                      <option value="Umum">Semua Kelas</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleSaveMapel}
                      disabled={savingMapel}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {savingMapel ? 'Menyimpan...' : 'Simpan Mapel'}
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  value={mapelId}
                  onChange={(e) => setMapelId(e.target.value)}
                  disabled={loading || success}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Mapel --</option>
                  {mapels.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nama_mapel} (Kelas {opt.tingkat_kelas})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Dropdown Jenis Perangkat */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Jenis Perangkat
              </label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                disabled={loading || success}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Pilih Jenis --</option>
                {jenisOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Berkas Perangkat (Format PDF)
            </label>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50/30' 
                  : file 
                  ? 'border-emerald-500 bg-emerald-50/10' 
                  : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={loading || success}
                className="hidden"
              />

              {file ? (
                <div className="space-y-2">
                  <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 inline-block">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 truncate max-w-xs">{file.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    disabled={loading || success}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-wider underline cursor-pointer"
                  >
                    Ganti Berkas
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full inline-block">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Tarik & lepas file Anda di sini, atau klik untuk mencari</p>
                    <p className="text-[10px] text-slate-400 mt-1">Hanya menerima format PDF (maks. 10MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || success}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Mengunggah...</span>
                </>
              ) : (
                <span>Simpan Perangkat</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

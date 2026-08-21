import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle, AlertTriangle, MessageSquare, ExternalLink, Download, Clock } from 'lucide-react';
import { modulService } from '../services/api';

export default function ReviewModal({ isOpen, document: doc, role, onClose, onReviewSuccess }) {
  if (!isOpen || !doc) return null;

  const isAdmin = role === 'admin' || role === 'pengawas';

  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successStatus, setSuccessStatus] = useState('');

  // Sync initial state if document changes
  useEffect(() => {
    if (doc) {
      setCatatan('');
      setError('');
      setSuccess(false);
    }
  }, [doc]);

  const handleAction = async (status) => {
    if (status === 'Revisi' && !catatan.trim()) {
      setError('Catatan revisi wajib diisi jika Anda mengirim revisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await modulService.reviewModul(doc.id, status, catatan.trim());
      
      setSuccessStatus(status);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        if (onReviewSuccess) onReviewSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan tinjauan dokumen.');
    } finally {
      setLoading(false);
    }
  };

  const pdfUrl = doc.file_path || '';
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('auto'); // 'auto' | 'google' | 'native'

  const isCloudinaryImage = pdfUrl.includes('res.cloudinary.com') && pdfUrl.includes('/image/upload/');
  const cloudPageImageUrl = isCloudinaryImage 
    ? pdfUrl.replace('/image/upload/', `/image/upload/pg_${page}/`).replace(/\.pdf$/i, '.jpg')
    : null;

  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  const directPdfUrl = `${pdfUrl}#toolbar=1&navpanes=0`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 transition-all duration-300">
      
      {/* Container */}
      <div className="bg-white w-full h-full md:h-[90vh] md:max-w-7xl md:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="h-16 px-6 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden max-w-lg md:max-w-xl pr-4">
              <h3 className="text-sm font-bold text-slate-800 truncate">{doc.judul}</h3>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Diajukan oleh: <span className="font-bold text-slate-700">{doc.user?.name || 'Guru'}</span> &bull; Mapel: <span className="font-bold text-slate-700">{doc.mapel || '-'}</span> &bull; Jenis: <span className="font-bold text-slate-700">{doc.jenis}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Split Screen Grid */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* Left Side: PDF Viewer Pane */}
          <div className="flex-1 h-[45vh] md:h-full border-r border-slate-200 flex flex-col bg-slate-900 relative">
            
            {/* Action Bar inside PDF Pane */}
            <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Penampil Berkas PDF
              </span>
              <div className="flex items-center gap-2">
                {isCloudinaryImage && (
                  <button
                    type="button"
                    onClick={() => setViewMode(viewMode === 'auto' ? 'native' : 'auto')}
                    className="text-[10px] font-semibold text-slate-400 hover:text-white transition-colors underline cursor-pointer"
                  >
                    {viewMode === 'auto' ? 'Mode PDF Native' : 'Mode Gambar Halaman'}
                  </button>
                )}
                <a 
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/50"
                >
                  <span>Buka Tab Baru</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Embedded PDF / Image Viewer */}
            <div className="flex-1 bg-slate-800 flex flex-col items-center justify-center relative overflow-hidden p-2">
              {pdfUrl ? (
                isCloudinaryImage && viewMode === 'auto' ? (
                  <div className="w-full h-full flex flex-col items-center justify-between overflow-auto p-3 space-y-2">
                    <div className="flex-1 flex items-center justify-center w-full min-h-0">
                      <img
                        src={cloudPageImageUrl}
                        alt={`Pratinjau Dokumen Halaman ${page}`}
                        onError={() => {
                          if (page > 1) setPage(1);
                        }}
                        className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-slate-700 bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-700 px-4 py-1 rounded-full shrink-0 shadow-lg">
                      <button
                        type="button"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer px-2 py-0.5"
                      >
                        ◀ Prev
                      </button>
                      <span className="text-xs font-bold text-indigo-400">
                        Halaman {page}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage(p => p + 1)}
                        className="text-xs font-bold text-slate-300 hover:text-white cursor-pointer px-2 py-0.5"
                      >
                        Next ▶
                      </button>
                    </div>
                  </div>
                ) : viewMode === 'google' ? (
                  <iframe
                    src={googleViewerUrl}
                    title="Preview PDF via Google Viewer"
                    className="w-full h-full border-none bg-white"
                    loading="lazy"
                  />
                ) : (
                  <object
                    data={directPdfUrl}
                    type="application/pdf"
                    className="w-full h-full border-none bg-slate-800"
                  >
                    <iframe
                      src={directPdfUrl}
                      title="Preview PDF Native"
                      className="w-full h-full border-none bg-slate-800"
                    >
                      <div className="text-center p-6 text-slate-300 space-y-3">
                        <FileText className="w-12 h-12 mx-auto text-indigo-400" />
                        <p className="text-sm font-semibold">Pratinjau PDF tidak dapat dimuat otomatis.</p>
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Buka / Unduh Berkas PDF</span>
                        </a>
                      </div>
                    </iframe>
                  </object>
                )
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Berkas PDF tidak ditemukan.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Notes & Action Buttons Pane */}
          <div className="w-full md:w-96 lg:w-[420px] h-[45vh] md:h-full bg-white flex flex-col shrink-0">
            
            {/* Header Form */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 shrink-0">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isAdmin ? 'Panel Penilaian & Review' : 'Status & Catatan Pengawas'}
              </h4>
            </div>

            {/* Form Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              
              {/* Success Banner */}
              {success && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border animate-pulse ${
                  successStatus === 'ACC' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {successStatus === 'ACC' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <div className="text-sm font-semibold">
                    {successStatus === 'ACC' 
                      ? 'Dokumen BERHASIL disetujui (ACC)!' 
                      : 'Catatan Revisi berhasil dikirim!'}
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                  <div className="text-sm font-medium">{error}</div>
                </div>
              )}

              {/* Info status saat ini */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Status Dokumen:
                </span>
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    doc.status === 'ACC'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : doc.status === 'Revisi'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {doc.status === 'ACC' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    {doc.status === 'Revisi' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                    {doc.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{doc.status === 'Pending' ? 'Menunggu Penilaian' : doc.status}</span>
                  </span>
                </div>
              </div>

              {/* Riwayat Catatan Revisi / Umpan Balik */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Catatan dari Pengawas / Admin
                </label>
                
                {doc.catatan_revisis && doc.catatan_revisis.length > 0 ? (
                  <div className="space-y-2">
                    {doc.catatan_revisis.map((cr, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">"{cr.catatan}"</p>
                        <p className="text-[10px] text-amber-800 font-semibold">
                          {cr.created_at ? new Date(cr.created_at).toLocaleString('id-ID') : '-'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : doc.catatan_revisi ? (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">"{doc.catatan_revisi}"</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-400 text-xs">
                    Belum ada catatan dari pengawas. Dokumen sedang ditinjau.
                  </div>
                )}
              </div>

              {/* Admin ONLY: Input Catatan Baru */}
              {isAdmin && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Beri Catatan / Masukan Baru
                  </label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Ketik catatan revisi jika ditolak, atau masukan/apresiasi jika disetujui..."
                    disabled={loading || success}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    *Catatan wajib diisi apabila Anda memilih "Tolak & Revisi".
                  </p>
                </div>
              )}

            </div>

            {/* Action Bar Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 shrink-0">
              {isAdmin ? (
                /* ADMIN / PENGAWAS ACTIONS */
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAction('Revisi')}
                    disabled={loading || success}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Tolak & Revisi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction('ACC')}
                    disabled={loading || success}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve / ACC</span>
                  </button>
                </div>
              ) : (
                /* GURU ONLY ACTIONS */
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 cursor-pointer text-center transition-colors"
                  >
                    Tutup
                  </button>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh / Buka File</span>
                  </a>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

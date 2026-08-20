import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle, AlertTriangle, MessageSquare, ExternalLink } from 'lucide-react';
import { modulService } from '../services/api';

export default function ReviewModal({ isOpen, document: doc, onClose, onReviewSuccess }) {
  if (!isOpen || !doc) return null;

  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successStatus, setSuccessStatus] = useState('');

  // Sync initial state if document already has notes
  useEffect(() => {
    if (doc) {
      setCatatan(doc.catatan_revisi || '');
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
        onReviewSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan tinjauan dokumen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 transition-all duration-300">
      
      {/* Container */}
      <div className="bg-white w-full h-full md:h-[90vh] md:max-w-7xl md:rounded-2xl shadow-premium border border-slate-200 flex flex-col overflow-hidden animate-all-custom">
        
        {/* Modal Header */}
        <div className="h-16 px-6 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden max-w-lg md:max-w-xl pr-4">
              <h3 className="text-sm font-bold text-slate-800 truncate">{doc.judul}</h3>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Diajukan oleh: <span className="font-bold text-slate-700">{doc.user?.name || 'Guru'}</span> &bull; Mapel: <span className="font-bold text-slate-700">{doc.mapel}</span> &bull; Jenis: <span className="font-bold text-slate-700">{doc.jenis}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Split Screen Grid */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* Left Side: PDF Viewer Pane */}
          <div className="flex-1 h-[45vh] md:h-full border-r border-slate-200 flex flex-col bg-slate-800 relative">
            
            {/* Action Bar inside PDF Pane */}
            <div className="h-10 bg-slate-900/90 flex items-center justify-between px-4 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Penampil PDF
              </span>
              <a 
                href={doc.file_path}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>Buka Tab Baru</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 bg-slate-700 flex items-center justify-center">
              <iframe
                src={`${doc.file_path}#toolbar=0&navpanes=0`}
                title="Preview PDF"
                className="w-full h-full border-none bg-slate-750"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Side: Revision Notes & Action Buttons Pane */}
          <div className="w-full md:w-96 lg:w-[400px] h-[45vh] md:h-full bg-white flex flex-col shrink-0">
            
            {/* Header Form */}
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 shrink-0">
              <MessageSquare className="w-4 h-4 text-indigo-650" />
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Panel Penilaian</h4>
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
                      ? 'Dokumen BERHASIL di-ACC!' 
                      : 'Catatan Revisi dikirim!'}
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
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Status Saat Ini:
                </span>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    doc.status === 'ACC'
                      ? 'bg-emerald-100 text-emerald-800'
                      : doc.status === 'Revisi'
                      ? 'bg-rose-100 text-rose-850'
                      : 'bg-amber-100 text-amber-850'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                {doc.catatan_revisi && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Sebelumnya:</p>
                    <p className="text-xs text-slate-600 italic">"{doc.catatan_revisi}"</p>
                  </div>
                )}
              </div>

              {/* Textarea Catatan Revisi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Catatan Revisi / Umpan Balik
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Ketik catatan revisi secara rinci jika dokumen ditolak, atau berikan apresiasi jika dokumen disetujui..."
                  disabled={loading || success}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-slate-250 bg-slate-50/50 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                />
                <p className="text-[10px] text-slate-450">
                  *Catatan revisi wajib diisi jika Anda memilih "Kirim Revisi".
                </p>
              </div>

            </div>

            {/* Action Bar Footer */}
            <div className="p-6 border-t border-slate-200/80 bg-slate-50/40 grid grid-cols-2 gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleAction('Revisi')}
                disabled={loading || success}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-250 cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span>Tolak & Revisi</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction('ACC')}
                disabled={loading || success}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-750 text-white shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span>Approve / ACC</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

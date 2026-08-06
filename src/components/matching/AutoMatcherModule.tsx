import React, { useState } from 'react';
import { 
  GitCompare, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Building2,
  Landmark
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AutoMatcherModule: React.FC = () => {
  const { records, batchAutoMatch, setMatchingRecord, setIsMatchModalOpen, stats } = useApp();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchResult, setMatchResult] = useState<{ matchedCount: number; message: string } | null>(null);

  const unmatchedRecords = records.filter(r => r.status === 'BELUM_TERINTEGRASI');

  const handleRunBatch = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = batchAutoMatch();
      setMatchResult(res);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mesin Padanan Spasial AI & NIK</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Padankan NIB (BPN) & NOP (Bapenda) Otomatis
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Sistem secara cerdas memadankan bidang tanah yang belum terintegrasi di Kabupaten Cianjur berdasarkan pencocokan NIK, kedekatan spasial koordinat GIS, dan kemiripan nama pemegang hak dengan wajib pajak PBB.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              disabled={isProcessing || unmatchedRecords.length === 0}
              onClick={handleRunBatch}
              className="px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs shadow-lg shadow-blue-500/30 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses AI Matching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Jalankan Auto-Matching Masal ({unmatchedRecords.length} Bidang)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Match Result Banner */}
      {matchResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>{matchResult.message}</span>
          </div>
          <button
            onClick={() => setMatchResult(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Queue of Unmatched Records */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Daftar Antrean Bidang Tanah Belum Punya NOP ({unmatchedRecords.length})
            </h3>
            <p className="text-xs text-slate-500">
              Bidang tanah hasil pengukuran BPN yang memerlukan penerbitan / penyepadanan NOP Bapenda
            </p>
          </div>
        </div>

        {unmatchedRecords.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Seluruh Bidang Tanah Terintegrasi!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Tidak ada antrean bidang tanah tanpa NOP. Semua NIB Kantah BPN Kabupaten Cianjur telah memiliki padanan NOP Bapenda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unmatchedRecords.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-mono font-black text-xs text-blue-600 dark:text-blue-400">
                      NIB: {item.nib}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Kec. {item.kecamatan}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs">
                    <p className="font-extrabold text-slate-900 dark:text-white">{item.namaPemilikBpn}</p>
                    <p className="text-slate-500 text-[11px]">{item.alamatObjek}</p>
                    <div className="pt-2 flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span>Luas Ukur BPN:</span>
                      <span>{item.luasBpn} m²</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMatchingRecord(item);
                    setIsMatchModalOpen(true);
                  }}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Padankan NOP Sekarang</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

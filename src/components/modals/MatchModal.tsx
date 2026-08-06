import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Landmark, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MatchModal: React.FC = () => {
  const { 
    isMatchModalOpen, 
    setIsMatchModalOpen, 
    matchingRecord, 
    matchNibNop,
    currentUser 
  } = useApp();

  const [inputNop, setInputNop] = useState<string>('');
  const [inputWpName, setInputWpName] = useState<string>('');
  const [inputLuasBapenda, setInputLuasBapenda] = useState<number>(0);
  const [catatan, setCatatan] = useState<string>('');

  useEffect(() => {
    if (matchingRecord) {
      setInputNop(matchingRecord.nop === 'BELUM ADA NOP' ? `32.03.${(Math.floor(Math.random() * 80) + 10).toString().padStart(3, '0')}.001.002-${matchingRecord.nib.slice(-6)}.0` : matchingRecord.nop);
      setInputWpName(matchingRecord.namaWajibPajakBapenda === 'BELUM TERDAFTAR BAPENDA' ? matchingRecord.namaPemilikBpn : matchingRecord.namaWajibPajakBapenda);
      setInputLuasBapenda(matchingRecord.luasBapenda || matchingRecord.luasBpn);
      setCatatan(matchingRecord.catatan || `Penyepadanan disetujui oleh ${currentUser.name}`);
    }
  }, [matchingRecord, currentUser]);

  if (!isMatchModalOpen || !matchingRecord) return null;

  const selisih = Math.abs(matchingRecord.luasBpn - Number(inputLuasBapenda));
  const persentase = matchingRecord.luasBpn > 0 ? Math.round((selisih / matchingRecord.luasBpn) * 1000) / 10 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNop || inputNop === 'BELUM ADA NOP') {
      alert('Harap masukkan NOP yang valid!');
      return;
    }

    matchNibNop(
      matchingRecord.id,
      inputNop,
      inputWpName,
      Number(inputLuasBapenda),
      catatan
    );

    setIsMatchModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 custom-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Penyepadanan & Rekonsiliasi NIB - NOP
              </h3>
              <p className="text-xs text-slate-500">
                Singkronisasi Data Spasial Kantor Pertanahan & Database Bapenda Kabupaten Cianjur
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMatchModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-Side Comparison Panels */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Panel: BPN Kantah Data (Readonly Source of Truth for Spatial Boundary) */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <Landmark className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  DATA PERTANAHAN BPN (NIB)
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Nomor Induk Bidang (NIB)</span>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">{matchingRecord.nib}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Subjek Pemegang Hak</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{matchingRecord.namaPemilikBpn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">NIK Pemilik</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{matchingRecord.nik}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Jenis Hak & No. Sertipikat</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{matchingRecord.jenisHak} ({matchingRecord.nomorSertipikat || 'PTSL'})</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                  <span className="text-blue-700 dark:text-blue-300 font-bold block text-[11px]">LUAS UKUR SPASIAL BPN</span>
                  <span className="text-xl font-black text-blue-900 dark:text-blue-100">{matchingRecord.luasBpn} m²</span>
                </div>
              </div>
            </div>

            {/* Right Panel: Bapenda Tax Object Data (Editable / Selectable) */}
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    DATA OBJEK PAJAK BAPENDA (NOP)
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                  Disinkronkan
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Nomor Objek Pajak (NOP)</label>
                  <input
                    type="text"
                    required
                    value={inputNop}
                    onChange={(e) => setInputNop(e.target.value)}
                    placeholder="Contoh: 32.03.010.001.002-0124.0"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-extrabold text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Nama Wajib Pajak di SPPT</label>
                  <input
                    type="text"
                    required
                    value={inputWpName}
                    onChange={(e) => setInputWpName(e.target.value)}
                    placeholder="Nama Wajib Pajak"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Luas Objek Pajak di SPPT (m²)</label>
                  <input
                    type="number"
                    required
                    value={inputLuasBapenda}
                    onChange={(e) => setInputLuasBapenda(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-extrabold text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Variance & Status Banner */}
          <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            selisih === 0 
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}>
            <div className="flex items-center gap-3">
              {selisih === 0 ? <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" /> : <AlertTriangle className="w-6 h-6 shrink-0 text-rose-600" />}
              <div>
                <p className="font-extrabold text-sm">
                  {selisih === 0 ? 'Luas Bidang Cocok 100% (0 m² Selisih)' : `Terdeteksi Selisih Luas ${selisih} m² (${persentase}%)`}
                </p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {selisih === 0 
                    ? 'Data BPN dan Bapenda sinkron. Siap diterbitkan Sertipikat Integrasi NIB-NOP.'
                    : 'Perbedaan luas akan ditandai sebagai status SELISIH_LUAS untuk pemutakhiran SPPT PBB Bapenda.'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase opacity-75">Status Hasil</span>
              <p className="font-black text-sm uppercase">{selisih === 0 ? 'TERINTEGRASI' : 'SELISIH_LUAS'}</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Rekonsiliasi & Berita Acara
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan verifikasi..."
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Verifikator: <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</span> ({currentUser.instansi})
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMatchModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Simpan Penyepadanan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

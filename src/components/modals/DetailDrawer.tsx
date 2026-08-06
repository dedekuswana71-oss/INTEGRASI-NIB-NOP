import React from 'react';
import { 
  X, 
  Landmark, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  GitCompare, 
  Printer, 
  FileCheck2, 
  Calendar,
  UserCheck,
  ShieldCheck,
  Layers,
  Coins,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { latLngToTM3 } from '../../utils/tm3Converter';

export const DetailDrawer: React.FC = () => {
  const { 
    selectedRecord, 
    setSelectedRecord, 
    isDetailOpen, 
    setIsDetailOpen,
    setMatchingRecord,
    setIsMatchModalOpen,
    setActiveTab,
    deleteRecord
  } = useApp();

  if (!isDetailOpen || !selectedRecord) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        onClick={() => setIsDetailOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  {selectedRecord.jenisHak}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Kec. {selectedRecord.kecamatan}
                </span>
              </div>
              <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white font-mono">
                NIB: {selectedRecord.nib}
              </h3>
            </div>

            <button
              onClick={() => setIsDetailOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
            {/* Status Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              selectedRecord.status === 'TERINTEGRASI'
                ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : selectedRecord.status === 'SELISIH_LUAS'
                ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                {selectedRecord.status === 'TERINTEGRASI' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <p className="font-extrabold text-sm uppercase">{selectedRecord.status.replace('_', ' ')}</p>
                  <p className="text-[11px] opacity-90 mt-0.5">{selectedRecord.catatan}</p>
                </div>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* BPN */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-blue-200 dark:border-slate-700">
                  <Landmark className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 dark:text-white uppercase">KANTOR PERTANAHAN</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Pemegang Hak BPN</span>
                  <p className="font-extrabold text-slate-800 dark:text-slate-100">{selectedRecord.namaPemilikBpn}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sertipikat</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedRecord.nomorSertipikat || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Luas Ukur BPN</span>
                  <p className="font-black text-blue-900 dark:text-blue-200 text-sm">{selectedRecord.luasBpn} m²</p>
                </div>
              </div>

              {/* Bapenda */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-amber-200 dark:border-slate-700">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-slate-900 dark:text-white uppercase">BAPENDA CIANJUR</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Wajib Pajak SPPT</span>
                  <p className="font-extrabold text-slate-800 dark:text-slate-100">{selectedRecord.namaWajibPajakBapenda}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Nomor Objek Pajak</span>
                  <p className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedRecord.nop}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Luas Objek Pajak</span>
                  <p className="font-black text-amber-900 dark:text-amber-200 text-sm">{selectedRecord.luasBapenda} m²</p>
                </div>
              </div>
            </div>

            {/* Spatial Location & Bhumi ATR/BPN */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Lokasi Objek & GIS Spasial</span>
                </div>
                <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                  Bhumi ATR/BPN
                </span>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300">{selectedRecord.alamatObjek}</p>
              <p className="text-slate-500 font-medium">Desa {selectedRecord.desa}, Kec. {selectedRecord.kecamatan}, Kab. Cianjur</p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-[11px] text-slate-500 font-bold">
                    WGS84 Lat: {selectedRecord.lat} | Lng: {selectedRecord.lng}
                  </div>
                  <a
                    href={`https://bhumi.atrbpn.go.id/map?lat=${selectedRecord.lat}&lng=${selectedRecord.lng}&zoom=18&q=${encodeURIComponent(selectedRecord.nib)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] transition-all flex items-center gap-1 shadow-xs"
                  >
                    <span>Buka di Bhumi ATR/BPN</span>
                  </a>
                </div>

                {(() => {
                  const tm3 = latLngToTM3(selectedRecord.lat, selectedRecord.lng, '48.2');
                  return (
                    <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-[11px] font-mono">
                      <div className="font-extrabold text-blue-900 dark:text-blue-200 mb-0.5">
                        Sistem Koordinat TM3 BPN (Zona {tm3.zone}):
                      </div>
                      <div className="text-blue-800 dark:text-blue-300">
                        X: <span className="font-bold">{tm3.formattedX}</span> | Y: <span className="font-bold">{tm3.formattedY}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Tax Financials */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Coins className="w-4 h-4 text-emerald-500" />
                <span>Penilaian PBB & Class Pajak</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Class Pajak</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.classPajak}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">NJOP per m²</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah(selectedRecord.njopPerM2)}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">Total NJOP Bapenda</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{formatRupiah(selectedRecord.totalNjopBapenda)}</span>
                </div>
              </div>
            </div>

            {/* Audit Verifier info */}
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/60 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Petugas Verifikator Data</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.petugasVerifikator}</p>
              <p className="text-[11px] text-slate-500">Terakhir Diperbarui: {selectedRecord.tanggalUpdate}</p>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/50">
            <button
              onClick={() => {
                setMatchingRecord(selectedRecord);
                setIsMatchModalOpen(true);
                setIsDetailOpen(false);
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <GitCompare className="w-4 h-4" />
              <span>Padankan NIB-NOP</span>
            </button>

            <button
              onClick={() => {
                setIsDetailOpen(false);
                setActiveTab('berita_acara');
              }}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak BA</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`Apakah Anda yakin ingin menghapus data bidang NIB ${selectedRecord.nib}?`)) {
                  deleteRecord(selectedRecord.id);
                  setIsDetailOpen(false);
                  setSelectedRecord(null);
                }
              }}
              className="py-3 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-bold text-xs transition-colors flex items-center gap-1.5"
              title="Hapus Record Ini"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

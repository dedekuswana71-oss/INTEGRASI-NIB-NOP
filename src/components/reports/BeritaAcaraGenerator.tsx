import React, { useState } from 'react';
import { FileCheck2, Printer, Download, Landmark, Building2, Calendar, ShieldCheck, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ALL_CIANJUR_KECAMATAN } from '../../data/cianjurLocationData';

export const BeritaAcaraGenerator: React.FC = () => {
  const { records, stats, currentUser } = useApp();

  const [nomorBa, setNomorBa] = useState<string>('BA/004/KANTAH-BAPENDA/CJR/VIII/2026');
  const [tanggalBa, setTanggalBa] = useState<string>('05 Agustus 2026');
  const [kepalaBpn, setKepalaBpn] = useState<string>('Ir. Budi Santoso, M.Si.');
  const [nipBpn, setNipBpn] = useState<string>('19780512 200212 1 003');
  const [kepalaBapenda, setKepalaBapenda] = useState<string>('Rina Herlina, S.E., M.M.');
  const [nipBapenda, setNipBapenda] = useState<string>('19820315 200604 2 008');
  const [kecamatanTarget, setKecamatanTarget] = useState<string>('Seluruh Kabupaten Cianjur');

  const filteredBaRecords = kecamatanTarget === 'Seluruh Kabupaten Cianjur' 
    ? records 
    : records.filter(r => r.kecamatan === kecamatanTarget);

  const totalValid = filteredBaRecords.filter(r => r.status === 'TERINTEGRASI').length;
  const totalSelisih = filteredBaRecords.filter(r => r.status === 'SELISIH_LUAS').length;
  const totalTanpaNop = filteredBaRecords.filter(r => r.status === 'BELUM_TERINTEGRASI').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls & Options Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Generator Berita Acara (BA) Rekonsiliasi NIB-NOP
              </h3>
              <p className="text-xs text-slate-500">
                Dokumen Resmi Kerjasama Kantor Pertanahan & Bapenda Kabupaten Cianjur
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Cetak PDF Berita Acara</span>
          </button>
        </div>

        {/* Form Config Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Berita Acara</label>
            <input
              type="text"
              value={nomorBa}
              onChange={(e) => setNomorBa(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Penetapan BA</label>
            <input
              type="text"
              value={tanggalBa}
              onChange={(e) => setTanggalBa(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Wilayah Kecamatan Target</label>
            <select
              value={kecamatanTarget}
              onChange={(e) => setKecamatanTarget(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
            >
              <option value="Seluruh Kabupaten Cianjur">Seluruh Kabupaten Cianjur ({ALL_CIANJUR_KECAMATAN.length} Kecamatan)</option>
              {ALL_CIANJUR_KECAMATAN.map(kec => (
                <option key={kec} value={kec}>Kecamatan {kec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Official Paper Document Preview Area (Styled for A4 Print) */}
      <div className="p-8 sm:p-12 bg-white text-slate-900 rounded-3xl border border-slate-300 shadow-xl max-w-4xl mx-auto space-y-6 font-serif text-sm print:shadow-none print:border-none print:p-0 print:max-w-none">
        {/* Kop Surat Official */}
        <div className="text-center border-b-4 border-double border-slate-900 pb-4 space-y-1">
          <p className="font-extrabold text-base tracking-wider uppercase font-sans">
            PEMERINTAH KABUPATEN CIANJUR
          </p>
          <p className="font-black text-lg tracking-wider uppercase font-sans text-blue-950">
            TIM SINKRONISASI DATA PERTANAHAN DAN PAJAK DAERAH
          </p>
          <p className="text-xs font-sans text-slate-700">
            KANTOR PERTANAHAN KAB. CIANJUR & BADAN PENDAPATAN DAERAH KAB. CIANJUR
          </p>
          <p className="text-[11px] font-sans text-slate-600">
            Jl. Siliwangi No. 120, Kabupaten Cianjur, Jawa Barat 43211 • Telp: (0263) 261234
          </p>
        </div>

        {/* Title */}
        <div className="text-center space-y-1 pt-2">
          <h2 className="font-extrabold text-base uppercase underline tracking-wide font-sans">
            BERITA ACARA REKONSILIASI DAN INTEGRASI NIB - NOP
          </h2>
          <p className="font-mono text-xs font-bold text-slate-700">Nomor: {nomorBa}</p>
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-3 leading-relaxed font-sans text-xs">
          <p>
            Pada hari ini, <strong>{tanggalBa}</strong>, bertempat di Kantor Pertanahan Kabupaten Cianjur, telah dilaksanakan rapat penyepadanan dan validasi silang data spasial pertanahan (NIB) dengan data Nomor Objek Pajak (NOP) PBB-P2 wilayah <strong>{kecamatanTarget}</strong> antara:
          </p>

          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>KANTOR PERTANAHAN KABUPATEN CIANJUR (BPN)</strong>, yang diwakili oleh <strong>{kepalaBpn}</strong> (NIP: {nipBpn}), selanjutnya disebut <strong>PIHAK KESATU</strong>.
            </li>
            <li>
              <strong>BADAN PENDAPATAN DAERAH KABUPATEN CIANJUR (BAPENDA)</strong>, yang diwakili oleh <strong>{kepalaBapenda}</strong> (NIP: {nipBapenda}), selanjutnya disebut <strong>PIHAK KEDUA</strong>.
            </li>
          </ol>

          <p>
            Kedua belah pihak telah menyepakati hasil rekonsiliasi data pertanahan dan objek pajak daerah sebagai berikut:
          </p>
        </div>

        {/* Summary Table */}
        <div className="font-sans text-xs">
          <table className="w-full border-collapse border border-slate-900 text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-900 font-bold">
                <th className="p-2 border border-slate-900">No</th>
                <th className="p-2 border border-slate-900">Uraian Hasil Rekonsiliasi</th>
                <th className="p-2 border border-slate-900 text-right">Jumlah Bidang Tanah</th>
                <th className="p-2 border border-slate-900 text-center">Status Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-900">1</td>
                <td className="p-2 border border-slate-900 font-bold">Bidang Tanah Terintegrasi Valid (NIB-NOP Fit)</td>
                <td className="p-2 border border-slate-900 text-right font-extrabold">{totalValid} Bidang</td>
                <td className="p-2 border border-slate-900 text-center font-bold text-emerald-800">Ditetapkan Valid</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-900">2</td>
                <td className="p-2 border border-slate-900 font-bold">Bidang Tanah Selisih Luas (BPN vs SPPT Bapenda)</td>
                <td className="p-2 border border-slate-900 text-right font-extrabold text-rose-800">{totalSelisih} Bidang</td>
                <td className="p-2 border border-slate-900 text-center font-bold text-rose-800">Pemutakhiran SPPT</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-900">3</td>
                <td className="p-2 border border-slate-900 font-bold">Bidang NIB Belum Memiliki NOP Bapenda</td>
                <td className="p-2 border border-slate-900 text-right font-extrabold text-amber-800">{totalTanpaNop} Bidang</td>
                <td className="p-2 border border-slate-900 text-center font-bold text-amber-800">Pendaftaran NOP Baru</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="p-2 border border-slate-900" colSpan={2}>TOTAL BIDANG DIREKONSILIASI</td>
                <td className="p-2 border border-slate-900 text-right font-extrabold">{filteredBaRecords.length} Bidang</td>
                <td className="p-2 border border-slate-900 text-center">100% Selesai</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Conclusion */}
        <p className="font-sans text-xs leading-relaxed">
          Demikian Berita Acara Rekonsiliasi ini dibuat dengan sebenarnya dan mempunyai kekuatan hukum untuk dipergunakan sebagai dasar penetapan integrasi data spasial pertanahan dan pajak daerah Kabupaten Cianjur.
        </p>

        {/* Signatures */}
        <div className="pt-8 font-sans text-xs grid grid-cols-2 gap-8 text-center">
          <div className="space-y-16">
            <div>
              <p className="font-bold">PIHAK KESATU</p>
              <p className="text-slate-600">Kantor Pertanahan Kab. Cianjur</p>
            </div>
            <div>
              <p className="font-black underline uppercase">{kepalaBpn}</p>
              <p className="text-[11px]">NIP. {nipBpn}</p>
            </div>
          </div>

          <div className="space-y-16">
            <div>
              <p className="font-bold">PIHAK KEDUA</p>
              <p className="text-slate-600">Bapenda Kabupaten Cianjur</p>
            </div>
            <div>
              <p className="font-black underline uppercase">{kepalaBapenda}</p>
              <p className="text-[11px]">NIP. {nipBapenda}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

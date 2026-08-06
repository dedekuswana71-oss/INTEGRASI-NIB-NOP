import React, { useState } from 'react';
import { History, Search, ShieldCheck, UserCheck, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    if (filterAction && log.action !== filterAction) return false;
    if (search) {
      const q = search.toLowerCase();
      return log.nib.toLowerCase().includes(q) ||
             log.nop.toLowerCase().includes(q) ||
             log.userName.toLowerCase().includes(q) ||
             log.keterangan.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Riwayat Audit & Aktivitas Sistem
              </h3>
              <p className="text-xs text-slate-500">
                Jejak Rekam Transaksi & Perubahan Data NIB-NOP Kantah BPN & Bapenda
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Petugas, NIB, NOP, atau Keterangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-transparent focus:outline-none"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold"
          >
            <option value="">Semua Jenis Aksi</option>
            <option value="SINKRONISASI">Sinkronisasi / Match</option>
            <option value="VERIFIKASI">Verifikasi Status</option>
            <option value="TAMBAH">Tambah Bidang Baru</option>
            <option value="EDIT">Edit Record</option>
            <option value="HAPUS">Hapus Record</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Waktu</th>
                <th className="p-4">Petugas / Instansi</th>
                <th className="p-4">Aksi</th>
                <th className="p-4">NIB / NOP</th>
                <th className="p-4">Detail Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{log.userName}</p>
                    <p className="text-[10px] text-slate-400">{log.instansi}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold">
                    <div className="text-slate-900 dark:text-white">NIB: {log.nib}</div>
                    <div className="text-slate-400 text-[10px]">NOP: {log.nop}</div>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">
                    {log.keterangan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

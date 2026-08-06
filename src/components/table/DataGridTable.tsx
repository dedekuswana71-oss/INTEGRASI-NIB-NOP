import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  GitCompare, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  ArrowUpDown,
  PlusCircle,
  FileSpreadsheet,
  FileCheck2,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntegrationRecord, IntegrationStatus } from '../../types';
import { ALL_CIANJUR_KECAMATAN, getDesaListByKecamatan, ALL_CIANJUR_DESA } from '../../data/cianjurLocationData';

export const DataGridTable: React.FC = () => {
  const { 
    filteredRecords, 
    filters, 
    setFilters, 
    resetFilters,
    setSelectedRecord, 
    setIsDetailOpen, 
    setEditingRecord, 
    setIsFormOpen, 
    setMatchingRecord, 
    setIsMatchModalOpen,
    deleteRecord,
    deleteMultipleRecords,
    verifyRecord,
    batchAutoMatch,
    setActiveTab
  } = useApp();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Pagination calculation
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / filters.pageSize) || 1;
  const startIndex = (filters.page - 1) * filters.pageSize;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + filters.pageSize);

  // Multi-select handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedRecords.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Status Badge Renderer
  const renderStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case 'TERINTEGRASI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Terintegrasi</span>
          </span>
        );
      case 'SELISIH_LUAS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Selisih Luas</span>
          </span>
        );
      case 'BELUM_TERINTEGRASI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Belum Ada NOP</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Verifikasi</span>
          </span>
        );
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const recordsToExport = selectedIds.length > 0 
      ? filteredRecords.filter(r => selectedIds.includes(r.id))
      : filteredRecords;

    const headers = ["ID", "NIB", "NOP", "Pemilik BPN", "Wajib Pajak Bapenda", "NIK", "Alamat", "Kecamatan", "Desa", "Luas BPN (m2)", "Luas Bapenda (m2)", "Selisih Luas (m2)", "Jenis Hak", "Status", "Tanggal"];
    const rows = recordsToExport.map(r => [
      r.id, r.nib, r.nop, `"${r.namaPemilikBpn}"`, `"${r.namaWajibPajakBapenda}"`, `'${r.nik}`, `"${r.alamatObjek}"`, r.kecamatan, r.desa, r.luasBpn, r.luasBapenda, r.selisihLuas, r.jenisHak, r.status, r.tanggalUpdate
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Integrasi_NIB_NOP_Cianjur_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Comprehensive Filters Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIB, NOP, Pemilik, NIK, Alamat Desa..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 border border-transparent focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Right quick actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Excel/CSV</span>
            </button>

            <button
              onClick={() => {
                setEditingRecord(null);
                setIsFormOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Data</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Kecamatan Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Kecamatan</label>
            <select
              value={filters.kecamatan}
              onChange={(e) => setFilters(prev => ({ ...prev, kecamatan: e.target.value, desa: '', page: 1 }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="">Semua Kecamatan ({ALL_CIANJUR_KECAMATAN.length})</option>
              {ALL_CIANJUR_KECAMATAN.map(kec => (
                <option key={kec} value={kec}>Kec. {kec}</option>
              ))}
            </select>
          </div>

          {/* Desa Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Desa / Kelurahan</label>
            <select
              value={filters.desa || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, desa: e.target.value, page: 1 }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium"
            >
              <option value="">Semua Desa ({filters.kecamatan ? getDesaListByKecamatan(filters.kecamatan).length : ALL_CIANJUR_DESA.length})</option>
              {(filters.kecamatan ? getDesaListByKecamatan(filters.kecamatan) : ALL_CIANJUR_DESA).map(d => (
                <option key={d} value={d}>Desa/Kel. {d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status Integrasi</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              <option value="">Semua Status</option>
              <option value="TERINTEGRASI">Terintegrasi</option>
              <option value="BELUM_TERINTEGRASI">Belum Ada NOP</option>
              <option value="SELISIH_LUAS">Selisih Luas Tanah</option>
              <option value="PERLU_VERIFIKASI">Perlu Verifikasi</option>
            </select>
          </div>

          {/* Jenis Hak Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Jenis Hak BPN</label>
            <select
              value={filters.jenisHak}
              onChange={(e) => setFilters(prev => ({ ...prev, jenisHak: e.target.value, page: 1 }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              <option value="">Semua Hak</option>
              <option value="Hak Milik (HM)">Hak Milik (HM)</option>
              <option value="Hak Guna Bangunan (HGB)">HGB</option>
              <option value="Hak Pakai (HP)">Hak Pakai (HP)</option>
              <option value="Hak Pengelolaan (HPL)">HPL</option>
            </select>
          </div>

          {/* Selisih Luas Threshold */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Selisih Luas</label>
            <select
              value={filters.selisihLuasFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, selisihLuasFilter: e.target.value as any, page: 1 }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              <option value="ALL">Semua Bidang</option>
              <option value="EXACT_MATCH">0 m² (Cocok 100%)</option>
              <option value="UNDER_10_PERCENT">Selisih &lt; 10%</option>
              <option value="OVER_10_PERCENT">Selisih &gt; 10%</option>
              <option value="UNMATCHED_NOP">Tanpa NOP Bapenda</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Urutkan Berdasar</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            >
              <option value="tanggalUpdate">Tanggal Update</option>
              <option value="nib">NIB (BPN)</option>
              <option value="nop">NOP (Bapenda)</option>
              <option value="selisihLuas">Selisih Luas (m²)</option>
              <option value="luasBpn">Luas Tanah (m²)</option>
            </select>
          </div>

          {/* Reset Filters button */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Selection Bar */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/40 border-b border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
            <span>{selectedIds.length} Data Dipilih</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Dipilih ({selectedIds.length})</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data bidang tanah terpilih?`)) {
                    deleteMultipleRecords(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Dipilih ({selectedIds.length})</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Batal Pilih
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800 tracking-wider">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedRecords.length > 0 && selectedIds.length === paginatedRecords.length}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="p-3.5">NIB / No. Sertipikat</th>
                <th className="p-3.5">NOP (Bapenda)</th>
                <th className="p-3.5">Subjek Hak / Wajib Pajak</th>
                <th className="p-3.5">Lokasi / Kecamatan</th>
                <th className="p-3.5 text-right">Luas BPN (m²)</th>
                <th className="p-3.5 text-right">Luas SPPT (m²)</th>
                <th className="p-3.5 text-right">Selisih (m²)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    Tidak ada data bidang tanah yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((rec) => {
                  const isSelected = selectedIds.includes(rec.id);
                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rec.id)}
                          className="rounded border-slate-300"
                        />
                      </td>

                      {/* NIB & Hak */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900 dark:text-white font-mono">
                          {rec.nib}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {rec.jenisHak} • {rec.nomorSertipikat || 'PTSL'}
                        </div>
                      </td>

                      {/* NOP */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {rec.nop}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Class: {rec.classPajak}
                        </div>
                      </td>

                      {/* Pemilik / WP */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100 max-w-[180px] truncate">
                          {rec.namaPemilikBpn}
                        </div>
                        <div className="text-[10px] text-slate-500 max-w-[180px] truncate">
                          WP: {rec.namaWajibPajakBapenda}
                        </div>
                      </td>

                      {/* Lokasi */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          Desa {rec.desa}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Kec. {rec.kecamatan}
                        </div>
                      </td>

                      {/* Luas BPN */}
                      <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-white">
                        {rec.luasBpn.toLocaleString('id-ID')}
                      </td>

                      {/* Luas Bapenda */}
                      <td className="p-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                        {rec.luasBapenda.toLocaleString('id-ID')}
                      </td>

                      {/* Selisih */}
                      <td className="p-3.5 text-right font-bold">
                        {rec.selisihLuas === 0 ? (
                          <span className="text-slate-400">0 m²</span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400">
                            +{rec.selisihLuas} m² ({rec.persentaseSelisih}%)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        {renderStatusBadge(rec.status)}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center relative">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedRecord(rec);
                              setIsDetailOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setMatchingRecord(rec);
                              setIsMatchModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 text-blue-700 dark:text-blue-300"
                            title="Padankan NIB dengan NOP"
                          >
                            <GitCompare className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingRecord(rec);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                            title="Edit Data"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Hapus record NIB ${rec.nib}?`)) {
                                deleteRecord(rec.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                            title="Hapus Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Menampilkan</span>
            <select
              value={filters.pageSize}
              onChange={(e) => setFilters(prev => ({ ...prev, pageSize: Number(e.target.value), page: 1 }))}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>dari {totalItems} total bidang tanah</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-slate-800 dark:text-slate-200">
              Halaman {filters.page} dari {totalPages}
            </span>
            <button
              disabled={filters.page >= totalPages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

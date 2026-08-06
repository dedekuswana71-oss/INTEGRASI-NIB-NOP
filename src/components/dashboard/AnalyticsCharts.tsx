import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { CIANJUR_KECAMATAN_STATS } from '../../data/initialData';
import { useApp } from '../../context/AppContext';

export const AnalyticsCharts: React.FC = () => {
  const { records, darkMode } = useApp();
  const [kecamatanViewMode, setKecamatanViewMode] = React.useState<'TOP10' | 'ALL'>('TOP10');

  const displayedKecamatanStats = React.useMemo(() => {
    if (kecamatanViewMode === 'TOP10') {
      return [...CIANJUR_KECAMATAN_STATS]
        .sort((a, b) => b.totalBidang - a.totalBidang)
        .slice(0, 10);
    }
    return CIANJUR_KECAMATAN_STATS;
  }, [kecamatanViewMode]);

  // Status Distribution Data
  const statusCounts = {
    TERINTEGRASI: records.filter(r => r.status === 'TERINTEGRASI').length,
    BELUM_TERINTEGRASI: records.filter(r => r.status === 'BELUM_TERINTEGRASI').length,
    SELISIH_LUAS: records.filter(r => r.status === 'SELISIH_LUAS').length,
    PERLU_VERIFIKASI: records.filter(r => r.status === 'PERLU_VERIFIKASI' || r.status === 'DRAFT').length,
  };

  const pieData = [
    { name: 'Terintegrasi (Valid)', value: statusCounts.TERINTEGRASI, color: '#10B981' },
    { name: 'Belum Terintegrasi (Tanpa NOP)', value: statusCounts.BELUM_TERINTEGRASI, color: '#F59E0B' },
    { name: 'Selisih Luas Tanah', value: statusCounts.SELISIH_LUAS, color: '#EF4444' },
    { name: 'Perlu Verifikasi Lapangan', value: statusCounts.PERLU_VERIFIKASI, color: '#3B82F6' },
  ];

  // Monthly Sync Trend Data
  const monthlyTrendData = [
    { bulan: 'Jan 2026', terintegrasi: 1200, selisihKoreksi: 180, baruTerdaftar: 320 },
    { bulan: 'Feb 2026', terintegrasi: 1850, selisihKoreksi: 240, baruTerdaftar: 410 },
    { bulan: 'Mar 2026', terintegrasi: 2400, selisihKoreksi: 310, baruTerdaftar: 520 },
    { bulan: 'Apr 2026', terintegrasi: 3100, selisihKoreksi: 420, baruTerdaftar: 680 },
    { bulan: 'Mei 2026', terintegrasi: 4200, selisihKoreksi: 510, baruTerdaftar: 840 },
    { bulan: 'Jun 2026', terintegrasi: 5600, selisihKoreksi: 690, baruTerdaftar: 950 },
    { bulan: 'Jul 2026', terintegrasi: 7100, selisihKoreksi: 840, baruTerdaftar: 1120 },
    { bulan: 'Ags 2026', terintegrasi: 8900, selisihKoreksi: 980, baruTerdaftar: 1350 },
  ];

  // PBB Potential Area Chart Data
  const pbbPotentialData = [
    { kecamatan: 'Cipanas', potensiPbbMilyar: 22.4, targetPAD: 25.0 },
    { kecamatan: 'Pacet', potensiPbbMilyar: 18.5, targetPAD: 20.0 },
    { kecamatan: 'Cianjur', potensiPbbMilyar: 14.2, targetPAD: 16.0 },
    { kecamatan: 'Karangtengah', potensiPbbMilyar: 11.8, targetPAD: 13.5 },
    { kecamatan: 'Cilaku', potensiPbbMilyar: 8.9, targetPAD: 10.0 },
    { kecamatan: 'Cugenang', potensiPbbMilyar: 7.2, targetPAD: 8.5 },
    { kecamatan: 'Sukaluyu', potensiPbbMilyar: 5.4, targetPAD: 6.5 },
    { kecamatan: 'Sukanagara', potensiPbbMilyar: 3.8, targetPAD: 4.8 },
  ];

  const chartTheme = {
    textColor: darkMode ? '#94A3B8' : '#475569',
    gridColor: darkMode ? '#334155' : '#E2E8F0',
    tooltipBg: darkMode ? '#1E293B' : '#FFFFFF',
    tooltipBorder: darkMode ? '#475569' : '#CBD5E1',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Integrasi per Kecamatan (Bar Chart) */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Cakupan Integrasi NIB-NOP per Kecamatan
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perbandingan bidang terdaftar BPN dengan NOP Bapenda Kabupaten Cianjur
            </p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setKecamatanViewMode('TOP10')}
              className={`px-3 py-1 rounded-lg transition-colors ${kecamatanViewMode === 'TOP10' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500'}`}
            >
              Top 10
            </button>
            <button
              onClick={() => setKecamatanViewMode('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors ${kecamatanViewMode === 'ALL' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500'}`}
            >
              Semua (32 Kec.)
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayedKecamatanStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis dataKey="kecamatan" stroke={chartTheme.textColor} fontSize={10} tickLine={false} interval={0} angle={kecamatanViewMode === 'ALL' ? -45 : 0} textAnchor={kecamatanViewMode === 'ALL' ? 'end' : 'middle'} />
              <YAxis stroke={chartTheme.textColor} fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: any) => [`${Number(value).toLocaleString('id-ID')} Bidang`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="terintegrasi" name="Terintegrasi NOP" fill="#2563EB" radius={[6, 6, 0, 0]} />
              <Bar dataKey="belumTerintegrasi" name="Belum Ada NOP" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              <Bar dataKey="selisihLuas" name="Selisih Luas" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Status Distribution (Donut Chart) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-base text-slate-900 dark:text-white">
            Proporsi Status Sinkronisasi
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Persentase kesesuaian data spasial BPN & pajak Bapenda
          </p>
        </div>

        <div className="h-56 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, borderRadius: '12px', fontSize: '12px' }}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[170px]">
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                {item.value} Bidang
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 3: Monthly Trend (Line Chart) */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Progres Proyeksi Penyepadanan (2026)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Laju integrasi spasial NIB & pemutakhiran SPPT PBB Bapenda
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis dataKey="bulan" stroke={chartTheme.textColor} fontSize={11} />
              <YAxis stroke={chartTheme.textColor} fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="terintegrasi" name="Terintegrasi Valid" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="selisihKoreksi" name="Koreksi SPPT" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="baruTerdaftar" name="NOP Baru Diterbitkan" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Potensi PBB per Kecamatan (Area Chart) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h4 className="font-bold text-base text-slate-900 dark:text-white">
            Potensi Penerimaan PBB-P2 (Milyar Rp)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Estimasi kenaikan PAD pasca penyesuaian luas tanah
          </p>
        </div>

        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pbbPotentialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
              <XAxis dataKey="kecamatan" stroke={chartTheme.textColor} fontSize={10} interval={0} angle={-25} textAnchor="end" />
              <YAxis stroke={chartTheme.textColor} fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, borderRadius: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="potensiPbbMilyar" name="Estimasi PBB (Milyar)" stroke="#8B5CF6" fill="#C4B5FD" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

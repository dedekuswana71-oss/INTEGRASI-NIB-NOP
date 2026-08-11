import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  TrendingUp, 
  Landmark, 
  HelpCircle,
  Coins,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const KPIStatsCard: React.FC = () => {
  const { records, stats, setActiveTab, setFilters } = useApp();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const cards = [
    {
      id: 'total',
      title: 'Total Bidang Terdata (NIB)',
      value: `${stats.total.toLocaleString('id-ID')} Bidang`,
      subtitle: 'Kantor Pertanahan Kab. Cianjur',
      icon: Layers,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-700 dark:text-blue-300',
      onClick: () => {
        setFilters(prev => ({ ...prev, status: '' }));
        setActiveTab('records_table');
      }
    },
    {
      id: 'terintegrasi',
      title: 'Terintegrasi NIB-NOP',
      value: `${stats.terintegrasi.toLocaleString('id-ID')} Bidang`,
      subtitle: `${stats.persentaseTerintegrasi}% Terkait Subjek & Objek`,
      icon: CheckCircle2,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      onClick: () => {
        setFilters(prev => ({ ...prev, status: 'TERINTEGRASI' }));
        setActiveTab('records_table');
      }
    },
    {
      id: 'selisih',
      title: 'Selisih Luas (BPN vs Bapenda)',
      value: `${stats.selisihLuas.toLocaleString('id-ID')} Bidang`,
      subtitle: 'Memerlukan koreksi SPPT / Ukur Ulang',
      icon: AlertTriangle,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-700 dark:text-amber-300',
      onClick: () => {
        setFilters(prev => ({ ...prev, status: 'SELISIH_LUAS' }));
        setActiveTab('records_table');
      }
    },
    {
      id: 'potensi',
      title: 'Potensi Optimalisasi PBB-P2',
      value: formatRupiah(stats.potensiNominalPbb),
      subtitle: 'Est. Penerimaan Asli Daerah (PAD)',
      icon: Coins,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      textColor: 'text-purple-700 dark:text-purple-300',
      onClick: () => {
        setActiveTab('analytics');
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.onClick}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${card.borderColor} shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.textColor} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 inline shrink-0" />
                  <span>{card.subtitle}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aggregate Area Summary Pills */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
          <Building2 className="w-4 h-4 text-amber-500" />
          <span>Akumulasi Luas Objek Pajak & Spasial:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-semibold">
            Total Luas BPN: <span className="font-mono font-black">{records.reduce((s, r) => s + (r.luasBpn || 0), 0).toLocaleString('id-ID')} m²</span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold">
            Total Luas Tanah SPPT: <span className="font-mono font-black">{records.reduce((s, r) => s + (r.luasBapenda || 0), 0).toLocaleString('id-ID')} m²</span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-amber-100/80 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold">
            Total Luas Bangunan SPPT PBB: <span className="font-mono font-black text-amber-800 dark:text-amber-300">{records.reduce((s, r) => s + (r.luasBangunanBapenda || 0), 0).toLocaleString('id-ID')} m²</span>
          </div>
        </div>
      </div>
    </div>
  );
};

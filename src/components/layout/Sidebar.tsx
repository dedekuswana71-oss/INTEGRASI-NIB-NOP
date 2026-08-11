import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  TableProperties, 
  GitCompare, 
  ShieldCheck, 
  FileCheck2, 
  History, 
  Settings, 
  Layers,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Building2,
  PieChart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  setCollapsed,
  mobileOpen,
  setMobileOpen 
}) => {
  const { activeTab, setActiveTab, currentUser, stats } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, badge: null },
    { id: 'gis_map', label: 'Peta GIS Spasial', icon: Map, badge: `${stats.total} Bidang` },
    { id: 'records_table', label: 'Data Pertanahan & Pajak', icon: TableProperties, badge: null },
    { id: 'auto_matching', label: 'Padankan (Matching)', icon: GitCompare, badge: stats.belumTerintegrasi > 0 ? `${stats.belumTerintegrasi}` : null, badgeColor: 'bg-amber-500 text-white' },
    { id: 'verification', label: 'Verifikasi & Validasi', icon: ShieldCheck, badge: stats.perluVerifikasi > 0 ? `${stats.perluVerifikasi}` : null, badgeColor: 'bg-rose-500 text-white' },
    { id: 'analytics', label: 'Analisis & Statistik', icon: PieChart, badge: null },
    { id: 'berita_acara', label: 'Berita Acara & Laporan', icon: FileCheck2, badge: null },
    { id: 'audit_logs', label: 'Riwayat Audit & Log', icon: History, badge: null },
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out border-r border-slate-800 ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-md shadow-blue-900/50">
              <Landmark className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wide text-white leading-tight flex items-center gap-1.5">
                  SI-NIB-NOP
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">2026</span>
                </span>
                <span className="text-[11px] font-medium text-slate-400 truncate">
                  Kantah BPN & Bapenda Cianjur
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title={collapsed ? "Perluas Sidebar" : "Pencilkan Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Agency Badge */}
        {!collapsed && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.instansi}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.jabatan}</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-800 text-slate-500 text-[11px]">
            <p className="font-semibold text-slate-400">Pemerintah Kab. Cianjur</p>
            <p className="mt-0.5">Versi 2.4.0 • BPN & Bapenda Sync</p>
          </div>
        )}
      </aside>
    </>
  );
};

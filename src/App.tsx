import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { KPIStatsCard } from './components/dashboard/KPIStatsCard';
import { AnalyticsCharts } from './components/dashboard/AnalyticsCharts';
import { GISMapViewer } from './components/gis/GISMapViewer';
import { DataGridTable } from './components/table/DataGridTable';
import { AutoMatcherModule } from './components/matching/AutoMatcherModule';
import { BeritaAcaraGenerator } from './components/reports/BeritaAcaraGenerator';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { SettingsModule } from './components/settings/SettingsModule';
import { MatchModal } from './components/modals/MatchModal';
import { FormRecordModal } from './components/modals/FormRecordModal';
import { DetailDrawer } from './components/modals/DetailDrawer';
import { Map, TableProperties, Sparkles, FileCheck2, ArrowRight } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, stats } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        collapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        {/* Topbar */}
        <Topbar setMobileOpen={setMobileOpen} />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* View 1: Dashboard Utama */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              {/* KPI Metrics */}
              <KPIStatsCard />

              {/* Quick Action Navigation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('gis_map')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md hover:shadow-lg transition-all text-left group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Map className="w-5 h-5 text-blue-200" />
                      <span className="font-extrabold text-sm">Peta Spasial NIB-NOP</span>
                    </div>
                    <p className="text-xs text-blue-100 opacity-90">Visualisasi GIS bidang tanah & polygon batas BPN Cianjur</p>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveTab('auto_matching')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md hover:shadow-lg transition-all text-left group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-200" />
                      <span className="font-extrabold text-sm">Padankan NIB-NOP</span>
                    </div>
                    <p className="text-xs text-amber-100 opacity-90">{stats.belumTerintegrasi} bidang siap disepadankan otomatis</p>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveTab('berita_acara')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-md hover:shadow-lg transition-all text-left group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-slate-300" />
                      <span className="font-extrabold text-sm">Berita Acara (BA)</span>
                    </div>
                    <p className="text-xs text-slate-300 opacity-90">Cetak dokumen rekonsiliasi resmi Kantah & Bapenda</p>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Analytics Charts */}
              <AnalyticsCharts />

              {/* GIS Map Canvas Quick Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Pratinjau Peta Spasial Bidang Tanah Cianjur
                  </h3>
                  <button
                    onClick={() => setActiveTab('gis_map')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Buka Peta Penuh</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <GISMapViewer />
              </div>
            </div>
          )}

          {/* View 2: GIS Spatial Map */}
          {activeTab === 'gis_map' && (
            <div className="space-y-4 animate-in fade-in">
              <GISMapViewer />
            </div>
          )}

          {/* View 3: Data Table */}
          {(activeTab === 'records_table' || activeTab === 'verification') && (
            <div className="space-y-4 animate-in fade-in">
              <DataGridTable />
            </div>
          )}

          {/* View 4: Auto-Matching */}
          {activeTab === 'auto_matching' && (
            <div className="space-y-4 animate-in fade-in">
              <AutoMatcherModule />
            </div>
          )}

          {/* View 5: Analytics & Charts */}
          {activeTab === 'analytics' && (
            <div className="space-y-4 animate-in fade-in">
              <AnalyticsCharts />
            </div>
          )}

          {/* View 6: Berita Acara Generator */}
          {activeTab === 'berita_acara' && (
            <div className="space-y-4 animate-in fade-in">
              <BeritaAcaraGenerator />
            </div>
          )}

          {/* View 7: Audit Logs */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-4 animate-in fade-in">
              <AuditLogViewer />
            </div>
          )}

          {/* View 8: Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-in fade-in">
              <SettingsModule />
            </div>
          )}
        </main>
      </div>

      {/* Modals & Slide-over Drawers */}
      <MatchModal />
      <FormRecordModal />
      <DetailDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

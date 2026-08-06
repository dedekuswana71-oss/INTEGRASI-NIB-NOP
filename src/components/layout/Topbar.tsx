import React, { useState } from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  Menu, 
  UserCheck, 
  RefreshCw, 
  Building2, 
  ShieldAlert,
  SlidersHorizontal,
  PlusCircle,
  Download,
  UserPlus,
  Settings,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole } from '../../types';
import { UserFormModal } from '../modals/UserFormModal';

interface TopbarProps {
  setMobileOpen: (open: boolean) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ setMobileOpen }) => {
  const { 
    filters, 
    setFilters, 
    currentUser, 
    userProfiles,
    activeUserId,
    setActiveUserId,
    darkMode, 
    setDarkMode,
    stats,
    resetAllData,
    setIsFormOpen,
    setEditingRecord,
    setActiveTab
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // User form modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserForModal, setEditingUserForModal] = useState<UserProfile | null>(null);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left section: Hamburger & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari NIB, NOP, Nama Pemilik/WP, NIK, Alamat..."
            value={filters.searchQuery}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
              if (filters.searchQuery !== e.target.value) {
                // If on dashboard, jump to records table or map
              }
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-sm placeholder:text-slate-400 transition-all focus:outline-none"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Section: Quick Action + Role Switcher + Notifs + DarkMode + User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Button */}
        <button
          onClick={() => {
            setEditingRecord(null);
            setIsFormOpen(true);
          }}
          className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-600/30 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Data Bidang</span>
        </button>

        {/* Role Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            title="Ganti Peran Pengguna"
          >
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline-block max-w-[130px] truncate">
              {currentUser.role}
            </span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Pilih Peran Pengguna</p>
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    setActiveTab('settings');
                  }}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Users className="w-3 h-3" />
                  <span>Kelola Semua</span>
                </button>
              </div>

              <div className="py-1 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                {userProfiles.map((user) => {
                  const isSelected = user.id === activeUserId;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        setActiveUserId(user.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start gap-2.5 ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-xl object-cover shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-extrabold truncate">{user.name}</p>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold shrink-0">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.instansi}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 mt-1">
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    setEditingUserForModal(null);
                    setIsUserModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-extrabold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Peran / Pengguna Baru</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifikasi Sistem"
          >
            <Bell className="w-5 h-5" />
            {stats.selisihLuas + stats.belumTerintegrasi > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-800 dark:text-white">Pemberitahuan Integrasi</p>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 rounded-full">
                  {stats.selisihLuas + stats.belumTerintegrasi} Perlu Atensi
                </span>
              </div>
              <div className="py-2 space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                <div 
                  onClick={() => { setActiveTab('auto_matching'); setShowNotifMenu(false); }}
                  className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 cursor-pointer hover:opacity-90"
                >
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{stats.belumTerintegrasi} NIB Belum Punya NOP</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                    Bidang tanah hasil PTSL BPN memerlukan pendaftaran NOP di Bapenda Cianjur.
                  </p>
                </div>

                <div 
                  onClick={() => { setActiveTab('records_table'); setShowNotifMenu(false); }}
                  className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 cursor-pointer hover:opacity-90"
                >
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{stats.selisihLuas} Bidang Selisih Luas</span>
                  </div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-1">
                    Terdapat perbedaan luas m² signifikan antara Sertipikat Kantah & SPPT PBB Bapenda.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Reset Data Button */}
        <button
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data ke sampel awal Kabupaten Cianjur?')) {
              resetAllData();
            }
          }}
          className="hidden lg:flex p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Reset Data Sampel Cianjur"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* User Profile Avatar & Edit Quick Trigger */}
        <div 
          onClick={() => {
            setEditingUserForModal(currentUser);
            setIsUserModalOpen(true);
          }}
          className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-80 transition-opacity"
          title="Klik untuk Edit Profil & Peran Aktif"
        >
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-600/30"
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              NIP: {currentUser.nip.split(' ')[0]}...
            </p>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        editingUser={editingUserForModal}
      />
    </header>
  );
};

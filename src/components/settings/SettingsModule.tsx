import React, { useState } from 'react';
import { 
  Settings, 
  RefreshCw, 
  Save, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  UserPlus, 
  Edit3, 
  Trash2, 
  UserCheck, 
  ShieldAlert,
  Users,
  KeyRound,
  BadgeCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { UserFormModal } from '../modals/UserFormModal';

export const SettingsModule: React.FC = () => {
  const { 
    currentUser, 
    userProfiles, 
    activeUserId, 
    setActiveUserId, 
    deleteUserProfile, 
    resetAllData, 
    darkMode, 
    setDarkMode 
  } = useApp();

  const [tolerancePct, setTolerancePct] = useState<number>(5);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // User form modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [editingUserProfile, setEditingUserProfile] = useState<UserProfile | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getRoleBadgeStyle = (roleStr: string) => {
    switch (roleStr) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'ADMIN_KANTAH':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'ADMIN_BAPENDA':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'PETUGAS_LAPANGAN':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* SECTION 1: Manajemen Pengguna & Peran (User & Role Management) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Manajemen Pengguna & Peran (User Roles)
              </h3>
              <p className="text-xs text-slate-500">
                Tambah, edit, dan atur peran aparatur BPN & Bapenda Cianjur
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingUserProfile(null);
              setIsUserModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Peran / Pengguna Baru</span>
          </button>
        </div>

        {/* User Profiles Grid / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userProfiles.map((user) => {
            const isActive = user.id === activeUserId;
            return (
              <div
                key={user.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 ring-2 ring-blue-500/30 shadow-md'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                            {user.name}
                          </h4>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-extrabold text-[9px] flex items-center gap-0.5">
                              <BadgeCheck className="w-2.5 h-2.5" />
                              <span>Aktif</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          NIP: {user.nip}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold border ${getRoleBadgeStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-400">Instansi: </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{user.instansi}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400">Jabatan: </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{user.jabatan}</span>
                    </div>
                    {user.hakAkses && user.hakAkses.length > 0 && (
                      <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
                        {user.hakAkses.map((hak, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                            {hak}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  {!isActive ? (
                    <button
                      onClick={() => setActiveUserId(user.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] transition-all flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Gunakan Peran Ini</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Peran Sedang Digunakan</span>
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingUserProfile(user);
                        setIsUserModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      title="Edit Peran & Profil Pengguna"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {userProfiles.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus profil pengguna "${user.name}"?`)) {
                            deleteUserProfile(user.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                        title="Hapus Pengguna"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Pengaturan Sistem Integrasi */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Pengaturan Sistem SI-NIB-NOP
            </h3>
            <p className="text-xs text-slate-500">
              Konfigurasi Integrasi Data Pertanahan BPN & Pajak Daerah Kabupaten Cianjur
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan sistem berhasil disimpan!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
          {/* Tolerance Rules */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Aturan Rekonsiliasi & Toleransi Luas</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batas Toleransi Selisih Luas Otomatis (%)
                </label>
                <input
                  type="number"
                  value={tolerancePct}
                  onChange={(e) => setTolerancePct(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Selisih m² di bawah persen ini dianggap terintegrasi otomatis.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="autoSync"
                  checked={autoSyncEnabled}
                  onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="autoSync" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Aktifkan Auto-Match Spasial NIK & Koordinat AI
                </label>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Tema Tampilan Interface</h4>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                className={`px-4 py-2 rounded-xl font-bold text-xs ${!darkMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                Mode Terang Formal
              </button>
              <button
                type="button"
                onClick={() => setDarkMode(true)}
                className={`px-4 py-2 rounded-xl font-bold text-xs ${darkMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                Mode Gelap Dashboard
              </button>
            </div>
          </div>

          {/* System Database Reset */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 space-y-2">
            <h4 className="font-bold text-rose-900 dark:text-rose-300 text-xs">Reset Database & Sampel Data Cianjur</h4>
            <p className="text-rose-700 dark:text-rose-400 text-[11px]">
              Mengembalikan seluruh data bidang tanah, koordinat spasial, dan log audit ke versi awal Kabupaten Cianjur.
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan database ke sampel awal Cianjur? Seluruh penambahan lokal akan dikembalikan.')) {
                  resetAllData();
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Database Sampel</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        editingUser={editingUserProfile}
      />
    </div>
  );
};


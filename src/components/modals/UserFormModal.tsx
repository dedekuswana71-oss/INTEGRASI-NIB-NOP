import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, ShieldCheck, UserCheck, Building2, KeyRound, Sparkles, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole } from '../../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser?: UserProfile | null;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150'
];

const PREDEFINED_ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin Integrasi', dept: 'Sekretariat Daerah / BPN & Bapenda' },
  { value: 'ADMIN_KANTAH', label: 'Admin Kantah BPN', dept: 'Kantor Pertanahan Kab. Cianjur' },
  { value: 'ADMIN_BAPENDA', label: 'Admin Bapenda', dept: 'Badan Pendapatan Daerah Cianjur' },
  { value: 'PETUGAS_LAPANGAN', label: 'Petugas Ukur Lapangan', dept: 'Tim Verifikasi Fisik GIS' },
  { value: 'KEPALA_DINAS', label: 'Kepala Dinas / Pimpinan', dept: 'Manajemen Eksekutif' },
  { value: 'OPERATOR_DESA', label: 'Operator Desa / Kec', dept: 'Pemerintahan Desa / Kecamatan' },
  { value: 'CUSTOM', label: '+ Peran Kustom Baru...', dept: 'Buat nama peran baru sesuai kebutuhan' }
];

const ALL_PERMISSIONS = [
  'Full Access System',
  'Tambah / Edit Bidang Tanah',
  'Hapus Data Bidang',
  'Akses Peta GIS Spasial',
  'Verifikasi & Validasi NIB-NOP',
  'Padankan / Matching Otomatis',
  'Cetak Berita Acara (BA)',
  'Akses Log Audit',
  'Kelola Pengguna & Peran'
];

export const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, editingUser }) => {
  const { addUserProfile, updateUserProfile } = useApp();

  const [formData, setFormData] = useState<Omit<UserProfile, 'id'>>({
    name: '',
    role: 'SUPER_ADMIN',
    instansi: 'Kantor Pertanahan Kab. Cianjur (BPN)',
    nip: '',
    jabatan: '',
    avatarUrl: PRESET_AVATARS[0],
    email: '',
    hakAkses: ['Full Access System', 'Verifikasi & Validasi NIB-NOP']
  });

  const [isCustomRole, setIsCustomRole] = useState<boolean>(false);
  const [customRoleName, setCustomRoleName] = useState<string>('');

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        role: editingUser.role,
        instansi: editingUser.instansi,
        nip: editingUser.nip,
        jabatan: editingUser.jabatan,
        avatarUrl: editingUser.avatarUrl || PRESET_AVATARS[0],
        email: editingUser.email || '',
        hakAkses: editingUser.hakAkses || ['Full Access System']
      });

      const isKnown = PREDEFINED_ROLES.some(r => r.value === editingUser.role);
      if (!isKnown) {
        setIsCustomRole(true);
        setCustomRoleName(editingUser.role);
      } else {
        setIsCustomRole(false);
      }
    } else {
      setFormData({
        name: '',
        role: 'SUPER_ADMIN',
        instansi: 'Kantor Pertanahan Kab. Cianjur (BPN)',
        nip: `198${Math.floor(100000 + Math.random() * 900000)} 201001 1 00${Math.floor(1 + Math.random() * 9)}`,
        jabatan: 'Analis Data Pertanahan & Pajak',
        avatarUrl: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
        email: '',
        hakAkses: ['Tambah / Edit Bidang Tanah', 'Verifikasi & Validasi NIB-NOP']
      });
      setIsCustomRole(false);
      setCustomRoleName('');
    }
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const togglePermission = (perm: string) => {
    setFormData(prev => {
      const current = prev.hakAkses || [];
      if (current.includes(perm)) {
        return { ...prev, hakAkses: current.filter(p => p !== perm) };
      } else {
        return { ...prev, hakAkses: [...current, perm] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalRole: UserRole = isCustomRole ? (customRoleName.trim().toUpperCase().replace(/\s+/g, '_') || 'PERAN_KUSTOM') : formData.role;

    const payload = {
      ...formData,
      role: finalRole,
      email: formData.email || `${formData.name.toLowerCase().replace(/[^a-z]/g, '')}@cianjurkab.go.id`
    };

    if (editingUser) {
      updateUserProfile(editingUser.id, payload);
    } else {
      addUserProfile(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingUser ? 'Edit Peran & Profil Pengguna' : 'Tambah Peran / Pengguna Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Kelola hak akses dan identitas aparatur integrasi NIB-NOP Cianjur
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
          {/* Row 1: Nama & NIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="misal: Drs. H. Dadang Supriatna, M.Si."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                NIP / Nomor Identitas Pegawai *
              </label>
              <input
                type="text"
                required
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                placeholder="19820512 200501 1 002"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Peran / Role Selector */}
          <div className="space-y-2 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
            <label className="block font-extrabold text-blue-950 dark:text-blue-200 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Peran / Role Pengguna Dalam Sistem *</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PREDEFINED_ROLES.map((r) => {
                const isSelected = !isCustomRole && formData.role === r.value;
                if (r.value === 'CUSTOM') {
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setIsCustomRole(true)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex items-start gap-2 ${
                        isCustomRole
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-xs">{r.label}</p>
                        <p className={`text-[10px] ${isCustomRole ? 'text-blue-100' : 'text-slate-400'}`}>{r.dept}</p>
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      setIsCustomRole(false);
                      setFormData({ ...formData, role: r.value as UserRole });
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                    }`}
                  >
                    <UserCheck className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <div>
                      <p className="font-bold text-xs">{r.label}</p>
                      <p className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{r.dept}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* If Custom Role name selected */}
            {isCustomRole && (
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 animate-in fade-in">
                <label className="block font-bold text-blue-900 dark:text-blue-200 mb-1">
                  Ketik Nama Peran Kustom Baru:
                </label>
                <input
                  type="text"
                  required
                  value={customRoleName}
                  onChange={(e) => setCustomRoleName(e.target.value)}
                  placeholder="misal: KEPALA_DINAS, OPERATOR_KECAMATAN, AUDITOR_BPK"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 font-mono font-bold text-blue-900 dark:text-white uppercase focus:outline-none focus:border-blue-600"
                />
              </div>
            )}
          </div>

          {/* Row 3: Instansi & Jabatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Instansi Kedinasan *
              </label>
              <select
                value={formData.instansi}
                onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Kantor Pertanahan Kab. Cianjur (BPN)">Kantor Pertanahan Kab. Cianjur (BPN)</option>
                <option value="Bapenda Kab. Cianjur">Bapenda Kab. Cianjur</option>
                <option value="Sekretariat Daerah / Tim Integrasi Kab. Cianjur">Sekretariat Daerah / Tim Integrasi Kab. Cianjur</option>
                <option value="Dinas Perumahan & Kawasan Permukiman">Dinas Perumahan & Kawasan Permukiman</option>
                <option value="Pemerintah Kecamatan / Desa">Pemerintah Kecamatan / Desa</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jabatan Resmi *
              </label>
              <input
                type="text"
                required
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                placeholder="misal: Kasi Survey & Pemetaan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Email & Avatar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Kedinasan (Opsional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@cianjurkab.go.id"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Foto Profil Avatar
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: url })}
                    className={`shrink-0 relative rounded-xl overflow-hidden ring-2 transition-all ${
                      formData.avatarUrl === url ? 'ring-blue-600 scale-105 shadow-md' : 'ring-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-9 h-9 object-cover" />
                    {formData.avatarUrl === url && (
                      <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white font-bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 5: Hak Akses Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>Otorisasi & Hak Akses Fitur Aplikasi</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ALL_PERMISSIONS.map((perm) => {
                const isChecked = formData.hakAkses?.includes(perm);
                return (
                  <label
                    key={perm}
                    className={`p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all flex items-center gap-2 ${
                      isChecked
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePermission(perm)}
                      className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{perm}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{editingUser ? 'Simpan Perubahan Peran' : 'Tambah Peran Pengguna'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

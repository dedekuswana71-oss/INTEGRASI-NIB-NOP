import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  IntegrationRecord, 
  AuditLog, 
  FilterState, 
  UserRole, 
  UserProfile,
  IntegrationStatus
} from '../types';
import { INITIAL_RECORDS, INITIAL_AUDIT_LOGS } from '../data/initialData';

interface AppContextType {
  records: IntegrationRecord[];
  auditLogs: AuditLog[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: UserProfile;
  userProfiles: UserProfile[];
  activeUserId: string;
  setActiveUserId: (id: string) => void;
  addUserProfile: (profile: Omit<UserProfile, 'id'>) => void;
  updateUserProfile: (id: string, updatedData: Partial<UserProfile>) => void;
  deleteUserProfile: (id: string) => void;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Filters
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredRecords: IntegrationRecord[];

  // Selected Record
  selectedRecord: IntegrationRecord | null;
  setSelectedRecord: (record: IntegrationRecord | null) => void;
  isDetailOpen: boolean;
  setIsDetailOpen: (open: boolean) => void;

  // Modals
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingRecord: IntegrationRecord | null;
  setEditingRecord: (record: IntegrationRecord | null) => void;

  isMatchModalOpen: boolean;
  setIsMatchModalOpen: (open: boolean) => void;
  matchingRecord: IntegrationRecord | null;
  setMatchingRecord: (record: IntegrationRecord | null) => void;

  // CRUD & Integration Operations
  addRecord: (record: Omit<IntegrationRecord, 'id' | 'tanggalUpdate' | 'selisihLuas' | 'persentaseSelisih'>) => void;
  updateRecord: (id: string, updatedData: Partial<IntegrationRecord>) => void;
  deleteRecord: (id: string) => void;
  deleteMultipleRecords: (ids: string[]) => void;
  matchNibNop: (id: string, nop: string, namaWajibPajak: string, luasBapenda: number, catatan?: string) => void;
  verifyRecord: (id: string, newStatus: IntegrationStatus, catatan?: string) => void;
  batchAutoMatch: () => { matchedCount: number; message: string };
  resetAllData: () => void;

  // Stats calculation
  stats: {
    total: number;
    terintegrasi: number;
    belumTerintegrasi: number;
    selisihLuas: number;
    perluVerifikasi: number;
    potensiNominalPbb: number;
    persentaseTerintegrasi: number;
  };
}

const INITIAL_USER_PROFILES: UserProfile[] = [
  {
    id: 'USR-SA-00',
    name: 'Dr. H. Mohammad Iqbal, S.I.P.',
    role: 'SUPER_ADMIN',
    instansi: 'Sekretariat Daerah / Tim Integrasi Kab. Cianjur',
    nip: '19750101 199803 1 002',
    jabatan: 'Administrator Utama Integrasi NIB-NOP',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    email: 'iqbal.admin@cianjurkab.go.id',
    hakAkses: ['Penanggung Jawab', 'Full Access', 'Verifikasi Utama']
  },
  {
    id: 'USR-BPN-01',
    name: 'Ir. Budi Santoso, M.Si.',
    role: 'ADMIN_KANTAH',
    instansi: 'Kantor Pertanahan Kab. Cianjur (BPN)',
    nip: '19780512 200212 1 003',
    jabatan: 'Kepala Seksi Survey dan Pemetaan',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    email: 'budi.santoso@atrbpn.go.id',
    hakAkses: ['Akses BPN', 'Kelola NIB', 'Ubah Geometris Spasial']
  },
  {
    id: 'USR-BAP-02',
    name: 'Rina Herlina, S.E., M.M.',
    role: 'ADMIN_BAPENDA',
    instansi: 'Bapenda Kab. Cianjur',
    nip: '19820315 200604 2 008',
    jabatan: 'Kepala Bidang Pendataan dan Penetapan PBB',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    email: 'rina.herlina@bapenda.cianjurkab.go.id',
    hakAkses: ['Akses Bapenda', 'Kelola NOP & PBB', 'Penetapan NJOP']
  },
  {
    id: 'USR-FLD-03',
    name: 'Ahmad Fauzi, S.T.',
    role: 'PETUGAS_LAPANGAN',
    instansi: 'Kantor Pertanahan Kab. Cianjur',
    nip: '19900822 201502 1 004',
    jabatan: 'Petugas Ukur & Pemetaan GIS',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    email: 'ahmad.fauzi@atrbpn.go.id',
    hakAkses: ['Input Lapangan', 'Verifikasi Fisik', 'Pemetaan TM3']
  }
];

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  kecamatan: '',
  desa: '',
  status: '',
  jenisHak: '',
  selisihLuasFilter: 'ALL',
  dateFrom: '',
  dateTo: '',
  sortBy: 'tanggalUpdate',
  sortOrder: 'desc',
  page: 1,
  pageSize: 10,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<IntegrationRecord[]>(() => {
    const saved = localStorage.getItem('nib_nop_records');
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('nib_nop_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('nib_nop_user_profiles');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILES;
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    const saved = localStorage.getItem('nib_nop_active_user_id');
    return saved || 'USR-SA-00';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('nib_nop_dark') === 'true';
  });

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Selection states
  const [selectedRecord, setSelectedRecord] = useState<IntegrationRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<IntegrationRecord | null>(null);

  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);
  const [matchingRecord, setMatchingRecord] = useState<IntegrationRecord | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('nib_nop_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('nib_nop_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('nib_nop_user_profiles', JSON.stringify(userProfiles));
  }, [userProfiles]);

  useEffect(() => {
    localStorage.setItem('nib_nop_active_user_id', activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem('nib_nop_dark', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Current User Profile based on activeUserId
  const currentUser = useMemo<UserProfile>(() => {
    const found = userProfiles.find(u => u.id === activeUserId);
    return found || userProfiles[0] || INITIAL_USER_PROFILES[0];
  }, [userProfiles, activeUserId]);

  const userRole = currentUser.role;

  const setUserRole = (role: UserRole) => {
    const foundUser = userProfiles.find(u => u.role === role);
    if (foundUser) {
      setActiveUserId(foundUser.id);
    } else {
      updateUserProfile(currentUser.id, { role });
    }
  };

  const addUserProfile = (profileData: Omit<UserProfile, 'id'>) => {
    const newId = `USR-${Date.now().toString().slice(-4)}`;
    const newProfile: UserProfile = {
      ...profileData,
      id: newId
    };
    setUserProfiles(prev => [...prev, newProfile]);
    setActiveUserId(newId);
  };

  const updateUserProfile = (id: string, updatedData: Partial<UserProfile>) => {
    setUserProfiles(prev => prev.map(u => u.id === id ? { ...u, ...updatedData } : u));
  };

  const deleteUserProfile = (id: string) => {
    if (userProfiles.length <= 1) {
      alert('Minimal harus terdapat 1 akun pengguna terdaftar.');
      return;
    }
    setUserProfiles(prev => prev.filter(u => u.id !== id));
    if (activeUserId === id) {
      const remaining = userProfiles.filter(u => u.id !== id);
      if (remaining.length > 0) {
        setActiveUserId(remaining[0].id);
      }
    }
  };

  // Log Action Helper
  const addLog = (
    action: AuditLog['action'], 
    nib: string, 
    nop: string, 
    keterangan: string
  ) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userRole,
      userName: currentUser.name,
      instansi: currentUser.instansi.includes('BPN') ? 'Kantor Pertanahan Kab. Cianjur' : currentUser.instansi.includes('Bapenda') ? 'Bapenda Kab. Cianjur' : 'Sistem',
      action,
      nib,
      nop,
      keterangan
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Reset Filters
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Filtered Records Calculation
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchNib = record.nib.toLowerCase().includes(q);
        const matchNop = record.nop.toLowerCase().includes(q);
        const matchPemilik = record.namaPemilikBpn.toLowerCase().includes(q);
        const matchWp = record.namaWajibPajakBapenda.toLowerCase().includes(q);
        const matchNik = record.nik.toLowerCase().includes(q);
        const matchAlamat = record.alamatObjek.toLowerCase().includes(q);
        const matchDesa = record.desa.toLowerCase().includes(q);
        if (!matchNib && !matchNop && !matchPemilik && !matchWp && !matchNik && !matchAlamat && !matchDesa) {
          return false;
        }
      }

      // Kecamatan
      if (filters.kecamatan && record.kecamatan !== filters.kecamatan) {
        return false;
      }

      // Desa
      if (filters.desa && record.desa !== filters.desa) {
        return false;
      }

      // Status
      if (filters.status && record.status !== filters.status) {
        return false;
      }

      // Jenis Hak
      if (filters.jenisHak && record.jenisHak !== filters.jenisHak) {
        return false;
      }

      // Selisih Luas Filter
      if (filters.selisihLuasFilter === 'EXACT_MATCH' && record.selisihLuas !== 0) return false;
      if (filters.selisihLuasFilter === 'UNDER_10_PERCENT' && (record.persentaseSelisih <= 0 || record.persentaseSelisih > 10)) return false;
      if (filters.selisihLuasFilter === 'OVER_10_PERCENT' && record.persentaseSelisih <= 10) return false;
      if (filters.selisihLuasFilter === 'UNMATCHED_NOP' && record.nop !== 'BELUM ADA NOP') return false;

      // Date Range
      if (filters.dateFrom && record.tanggalUpdate < filters.dateFrom) return false;
      if (filters.dateTo && record.tanggalUpdate > filters.dateTo) return false;

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === 'tanggalUpdate') {
        comparison = a.tanggalUpdate.localeCompare(b.tanggalUpdate);
      } else if (filters.sortBy === 'nib') {
        comparison = a.nib.localeCompare(b.nib);
      } else if (filters.sortBy === 'nop') {
        comparison = a.nop.localeCompare(b.nop);
      } else if (filters.sortBy === 'selisihLuas') {
        comparison = Math.abs(a.selisihLuas) - Math.abs(b.selisihLuas);
      } else if (filters.sortBy === 'luasBpn') {
        comparison = a.luasBpn - b.luasBpn;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [records, filters]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = records.length;
    const terintegrasi = records.filter(r => r.status === 'TERINTEGRASI').length;
    const belumTerintegrasi = records.filter(r => r.status === 'BELUM_TERINTEGRASI').length;
    const selisihLuas = records.filter(r => r.status === 'SELISIH_LUAS').length;
    const perluVerifikasi = records.filter(r => r.status === 'PERLU_VERIFIKASI' || r.status === 'DRAFT').length;
    
    // Potensi nominal PBB dari selisih luas tanah yang perlu disesuaikan
    const potensiNominalPbb = records.reduce((acc, r) => {
      if (r.selisihLuas > 0) {
        // PBB-P2 perkiraan 0.1% - 0.2% dari NJOP selisih
        return acc + (r.selisihLuas * r.njopPerM2 * 0.0015);
      }
      return acc;
    }, 0);

    const persentaseTerintegrasi = total > 0 ? Math.round((terintegrasi / total) * 100) : 0;

    return {
      total,
      terintegrasi,
      belumTerintegrasi,
      selisihLuas,
      perluVerifikasi,
      potensiNominalPbb,
      persentaseTerintegrasi
    };
  }, [records]);

  // Actions
  const addRecord = (newRecordData: Omit<IntegrationRecord, 'id' | 'tanggalUpdate' | 'selisihLuas' | 'persentaseSelisih'>) => {
    const selisih = Math.abs(newRecordData.luasBpn - newRecordData.luasBapenda);
    const pct = newRecordData.luasBpn > 0 ? Math.round((selisih / newRecordData.luasBpn) * 1000) / 10 : 0;
    
    const newRecord: IntegrationRecord = {
      ...newRecordData,
      id: `REC-CJR-${(records.length + 1).toString().padStart(3, '0')}`,
      selisihLuas: selisih,
      persentaseSelisih: pct,
      tanggalUpdate: new Date().toISOString().substring(0, 10),
    };

    setRecords(prev => [newRecord, ...prev]);
    addLog('TAMBAH', newRecord.nib, newRecord.nop, `Menambahkan data pertanahan bidang baru di Desa ${newRecord.desa}, Kec. ${newRecord.kecamatan}`);
  };

  const updateRecord = (id: string, updatedData: Partial<IntegrationRecord>) => {
    setRecords(prev => prev.map(rec => {
      if (rec.id === id) {
        const merged = { ...rec, ...updatedData };
        const selisih = Math.abs(merged.luasBpn - merged.luasBapenda);
        const pct = merged.luasBpn > 0 ? Math.round((selisih / merged.luasBpn) * 1000) / 10 : 0;
        const updated = {
          ...merged,
          selisihLuas: selisih,
          persentaseSelisih: pct,
          tanggalUpdate: new Date().toISOString().substring(0, 10)
        };
        return updated;
      }
      return rec;
    }));

    const target = records.find(r => r.id === id);
    if (target) {
      addLog('EDIT', target.nib, target.nop, `Memutakhirkan data NIB ${target.nib}`);
    }
  };

  const deleteRecord = (id: string) => {
    const target = records.find(r => r.id === id);
    if (target) {
      setRecords(prev => prev.filter(r => r.id !== id));
      addLog('HAPUS', target.nib, target.nop, `Menghapus record bidang tanah NIB ${target.nib}`);
    }
  };

  const deleteMultipleRecords = (ids: string[]) => {
    if (ids.length === 0) return;
    setRecords(prev => prev.filter(r => !ids.includes(r.id)));
    addLog('HAPUS', `${ids.length} Bidang`, '-', `Menghapus ${ids.length} data record bidang tanah sekaligus (Batch Delete)`);
  };

  const matchNibNop = (id: string, nop: string, namaWajibPajak: string, luasBapenda: number, catatan?: string) => {
    setRecords(prev => prev.map(rec => {
      if (rec.id === id) {
        const selisih = Math.abs(rec.luasBpn - luasBapenda);
        const pct = rec.luasBpn > 0 ? Math.round((selisih / rec.luasBpn) * 1000) / 10 : 0;
        let newStatus: IntegrationStatus = 'TERINTEGRASI';
        if (selisih > 0) {
          newStatus = pct > 5 ? 'SELISIH_LUAS' : 'TERINTEGRASI';
        }

        return {
          ...rec,
          nop,
          namaWajibPajakBapenda: namaWajibPajak,
          luasBapenda,
          selisihLuas: selisih,
          persentaseSelisih: pct,
          status: newStatus,
          tanggalUpdate: new Date().toISOString().substring(0, 10),
          petugasVerifikator: currentUser.name,
          catatan: catatan || `Penyepadanan manual dilakukan oleh ${currentUser.name}`
        };
      }
      return rec;
    }));

    const target = records.find(r => r.id === id);
    if (target) {
      addLog('SINKRONISASI', target.nib, nop, `Menyepadankan NIB ${target.nib} dengan NOP ${nop}`);
    }
  };

  const verifyRecord = (id: string, newStatus: IntegrationStatus, catatan?: string) => {
    setRecords(prev => prev.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          status: newStatus,
          tanggalUpdate: new Date().toISOString().substring(0, 10),
          petugasVerifikator: currentUser.name,
          catatan: catatan || `Status diverifikasi menjadi ${newStatus}`
        };
      }
      return rec;
    }));

    const target = records.find(r => r.id === id);
    if (target) {
      addLog('VERIFIKASI', target.nib, target.nop, `Mengubah status verifikasi NIB ${target.nib} menjadi ${newStatus}`);
    }
  };

  const batchAutoMatch = () => {
    let matchedCount = 0;
    setRecords(prev => prev.map(rec => {
      if (rec.status === 'BELUM_TERINTEGRASI') {
        // Generate automatic matching mock NOP based on NIK or NIB pattern
        const mockNop = `32.03.${(Math.floor(Math.random() * 80) + 10).toString().padStart(3, '0')}.001.002-${rec.nib.slice(-6)}.0`;
        matchedCount++;
        return {
          ...rec,
          nop: mockNop,
          namaWajibPajakBapenda: rec.namaPemilikBpn,
          luasBapenda: rec.luasBpn,
          selisihLuas: 0,
          persentaseSelisih: 0,
          status: 'TERINTEGRASI' as IntegrationStatus,
          tanggalUpdate: new Date().toISOString().substring(0, 10),
          catatan: 'Penyepadanan otomatis berhasil via NIK dan pencocokan spasial AI.'
        };
      }
      return rec;
    }));

    addLog('SINKRONISASI', 'ALL_UNMATCHED', 'BATCH', `Menjalankan proses penyepadanan masal otomatis. ${matchedCount} bidang tanah terintegrasi.`);

    return {
      matchedCount,
      message: `Berhasil menyepadankan ${matchedCount} bidang tanah NIB dengan database NOP Bapenda.`
    };
  };

  const resetAllData = () => {
    setRecords(INITIAL_RECORDS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.removeItem('nib_nop_records');
    localStorage.removeItem('nib_nop_audit_logs');
    addLog('EDIT', 'SYSTEM', 'SYSTEM', 'Mengembalikan database ke sampel data default Kabupaten Cianjur.');
  };

  return (
    <AppContext.Provider
      value={{
        records,
        auditLogs,
        activeTab,
        setActiveTab,
        userRole,
        setUserRole,
        currentUser,
        userProfiles,
        activeUserId,
        setActiveUserId,
        addUserProfile,
        updateUserProfile,
        deleteUserProfile,
        darkMode,
        setDarkMode,
        filters,
        setFilters,
        resetFilters,
        filteredRecords,
        selectedRecord,
        setSelectedRecord,
        isDetailOpen,
        setIsDetailOpen,
        isFormOpen,
        setIsFormOpen,
        editingRecord,
        setEditingRecord,
        isMatchModalOpen,
        setIsMatchModalOpen,
        matchingRecord,
        setMatchingRecord,
        addRecord,
        updateRecord,
        deleteRecord,
        deleteMultipleRecords,
        matchNibNop,
        verifyRecord,
        batchAutoMatch,
        resetAllData,
        stats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

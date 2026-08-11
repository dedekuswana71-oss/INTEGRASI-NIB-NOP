export type IntegrationStatus = 
  | 'TERINTEGRASI' 
  | 'BELUM_TERINTEGRASI' 
  | 'SELISIH_LUAS' 
  | 'PERLU_VERIFIKASI' 
  | 'DRAFT';

export type StandardUserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN_KANTAH' 
  | 'ADMIN_BAPENDA' 
  | 'PETUGAS_LAPANGAN';

export type UserRole = StandardUserRole | (string & {});

export interface SpatialBoundary {
  lat: number;
  lng: number;
}

export interface IntegrationRecord {
  id: string;
  nib: string; // Nomor Induk Bidang (Kantor Pertanahan BPN)
  nop: string; // Nomor Objek Pajak (Bapenda)
  namaPemilikBpn: string; // Subjek Hak di BPN
  namaWajibPajakBapenda: string; // Wajib Pajak di Bapenda
  nik: string;
  alamatObjek: string;
  kecamatan: string;
  desa: string;
  luasBpn: number; // m2
  luasBapenda: number; // m2 (Luas Tanah SPPT PBB)
  luasBangunanBapenda?: number; // m2 (Luas Bangunan SPPT PBB)
  selisihLuas: number; // luasBpn - luasBapenda
  persentaseSelisih: number; // %
  jenisHak: 'Hak Milik (HM)' | 'Hak Guna Bangunan (HGB)' | 'Hak Pakai (HP)' | 'Girik/Adat' | 'Hak Pengelolaan (HPL)';
  nomorSertipikat?: string;
  classPajak: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'Kanal';
  njopPerM2: number; // IDR per m2 (Tanah)
  totalNjopBapenda: number; // IDR (Tanah)
  njopBangunanPerM2?: number; // IDR per m2 (Bangunan)
  totalNjopBangunan?: number; // IDR (Bangunan)
  status: IntegrationStatus;
  lat: number;
  lng: number;
  polygonBoundary?: SpatialBoundary[];
  tanggalUpdate: string;
  petugasVerifikator: string;
  catatan?: string;
  dokumenPendukungUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  instansi: 'Kantor Pertanahan Kab. Cianjur' | 'Bapenda Kab. Cianjur' | 'Sistem';
  action: 'TAMBAH' | 'EDIT' | 'SINKRONISASI' | 'VERIFIKASI' | 'HAPUS' | 'CETAK_BA';
  nib: string;
  nop: string;
  keterangan: string;
}

export interface FilterState {
  searchQuery: string;
  kecamatan: string;
  desa: string;
  status: string;
  jenisHak: string;
  selisihLuasFilter: 'ALL' | 'EXACT_MATCH' | 'UNDER_10_PERCENT' | 'OVER_10_PERCENT' | 'UNMATCHED_NOP';
  dateFrom: string;
  dateTo: string;
  sortBy: 'tanggalUpdate' | 'nib' | 'nop' | 'selisihLuas' | 'luasBpn';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface KecamatanStats {
  kecamatan: string;
  totalBidang: number;
  terintegrasi: number;
  belumTerintegrasi: number;
  selisihLuas: number;
  potensiPbb: number; // Rp
  complianceRate: number; // %
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  instansi: string;
  nip: string;
  jabatan: string;
  avatarUrl: string;
  email?: string;
  hakAkses?: string[];
}

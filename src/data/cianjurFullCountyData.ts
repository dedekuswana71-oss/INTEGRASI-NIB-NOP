import { IntegrationRecord, IntegrationStatus } from '../types';
import { CIANJUR_KECAMATAN_DATA } from './cianjurLocationData';

// Center coordinates for all 32 Kecamatan in Kabupaten Cianjur
export const KECAMATAN_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Cianjur": { lat: -6.8228, lng: 107.1398 },
  "Karangtengah": { lat: -6.8185, lng: 107.1580 },
  "Cilaku": { lat: -6.8502, lng: 107.1211 },
  "Pacet": { lat: -6.7421, lng: 107.0412 },
  "Cipanas": { lat: -6.7311, lng: 107.0322 },
  "Sukaresmi": { lat: -6.7123, lng: 107.0543 },
  "Cugenang": { lat: -6.8012, lng: 107.0890 },
  "Warungkondang": { lat: -6.8621, lng: 107.0811 },
  "Gekbrong": { lat: -6.8432, lng: 107.0621 },
  "Cibeber": { lat: -6.9112, lng: 107.1245 },
  "Bojongpicung": { lat: -6.8341, lng: 107.2412 },
  "Haurwangi": { lat: -6.8211, lng: 107.2843 },
  "Ciranjang": { lat: -6.8123, lng: 107.2612 },
  "Sukaluyu": { lat: -6.8312, lng: 107.2012 },
  "Mande": { lat: -6.7721, lng: 107.1823 },
  "Cikalongkulon": { lat: -6.7112, lng: 107.1723 },
  "Campaka": { lat: -6.9712, lng: 107.1123 },
  "Campakamulya": { lat: -6.9912, lng: 107.1321 },
  "Sukanagara": { lat: -7.0512, lng: 107.1234 },
  "Pasirkuda": { lat: -7.1231, lng: 107.1823 },
  "Pagelaran": { lat: -7.1123, lng: 107.0823 },
  "Tanggeung": { lat: -7.1823, lng: 107.0912 },
  "Kadupandak": { lat: -7.1523, lng: 107.0412 },
  "Cijati": { lat: -7.2112, lng: 107.0612 },
  "Takokak": { lat: -7.0812, lng: 106.9812 },
  "Cibinong": { lat: -7.2812, lng: 107.1812 },
  "Leles": { lat: -7.3212, lng: 107.1912 },
  "Agrabinta": { lat: -7.4212, lng: 106.9212 },
  "Cidaun": { lat: -7.4812, lng: 107.3112 },
  "Naringgul": { lat: -7.3512, lng: 107.3812 },
  "Cikadu": { lat: -7.2612, lng: 107.2812 }
};

// Generate realistic parcel records covering all 32 Kecamatan in Cianjur
export function generateFullCianjurRecords(): IntegrationRecord[] {
  const records: IntegrationRecord[] = [];
  const kecamatans = Object.keys(CIANJUR_KECAMATAN_DATA);

  let recordCounter = 1;

  const sampleNames = [
    "H. AHMAD HIDAYAT", "HJJ. SITI NURJANAH", "PT. CIANJUR AGRO SEJAHTERA", "DEDEH KURNIASIH",
    "SUKIPTO ANDRIAWAN", "H. ENDANG DADANG", "YULIANTI KUSUMA", "PEMERINTAH DESA",
    "DEDEK USWANA", "BUDI SANTOSO", "SRI WAHYUNI", "AGUS SETIAWAN", "NURUL HIDAYATI",
    "CV. CIANJUR MAJU BERSAMA", "KOPERASI TANI MAKMUR", "CECEP SUPRIATNA", "ENIP RUHIYAT",
    "MAMAT RAHMAT", "EKA SARTIKA", "KHOERUNNISA", "PT. INDO PERKEBUNAN CIANJUR"
  ];

  const jenisHakList: IntegrationRecord['jenisHak'][] = [
    'Hak Milik (HM)', 'Hak Guna Bangunan (HGB)', 'Hak Pakai (HP)', 'Girik/Adat', 'Hak Pengelolaan (HPL)'
  ];

  const classPajakList: IntegrationRecord['classPajak'][] = ['A1', 'A2', 'B1', 'B2', 'C1'];

  const statusList: IntegrationStatus[] = ['TERINTEGRASI', 'TERINTEGRASI', 'SELISIH_LUAS', 'BELUM_TERINTEGRASI', 'PERLU_VERIFIKASI'];

  kecamatans.forEach((kec, kecIdx) => {
    const desas = CIANJUR_KECAMATAN_DATA[kec] || [kec];
    const center = KECAMATAN_COORDINATES[kec] || { lat: -6.8228 + (kecIdx * 0.02), lng: 107.1398 + (kecIdx * 0.02) };
    const kecCode = (kecIdx + 1).toString().padStart(2, '0');

    // Create 3 to 5 land parcels per Kecamatan across various desa
    const parcelsPerKec = 4;

    for (let p = 0; p < parcelsPerKec; p++) {
      const desa = desas[p % desas.length];
      const nameOwner = sampleNames[(recordCounter + p) % sampleNames.length];
      const hak = jenisHakList[(p + kecIdx) % jenisHakList.length];
      const cls = classPajakList[(p + kecIdx) % classPajakList.length];
      const stat = statusList[(p + kecIdx) % statusList.length];

      // Offset lat lng slightly around center
      const latOffset = (Math.sin(p * 1.5) * 0.008) + ((p - 1.5) * 0.003);
      const lngOffset = (Math.cos(p * 1.5) * 0.008) + ((p - 1.5) * 0.003);
      const lat = Number((center.lat + latOffset).toFixed(6));
      const lng = Number((center.lng + lngOffset).toFixed(6));

      // Land & Building Areas
      const luasBpn = 350 + (p * 180) + (kecIdx * 25);
      let luasBapenda = luasBpn;
      if (stat === 'SELISIH_LUAS') {
        luasBapenda = Math.round(luasBpn * (p % 2 === 0 ? 0.88 : 1.12));
      } else if (stat === 'BELUM_TERINTEGRASI') {
        luasBapenda = 0;
      }

      const luasBangunanBapenda = stat === 'BELUM_TERINTEGRASI' ? 0 : Math.round(luasBapenda * 0.35);

      const selisih = Math.abs(luasBpn - luasBapenda);
      const pct = luasBpn > 0 ? Math.round((selisih / luasBpn) * 1000) / 10 : 0;

      const njopPerM2 = 750000 + (kecIdx * 120000) + (p * 50000);
      const njopBangunanPerM2 = luasBangunanBapenda > 0 ? 1200000 + (kecIdx * 80000) : 0;

      const totalNjopBapenda = luasBapenda * njopPerM2;
      const totalNjopBangunan = luasBangunanBapenda * njopBangunanPerM2;

      const nib = `10.07.${kecCode}.${((p % 5) + 1).toString().padStart(2, '0')}.${(1000 + recordCounter).toString()}`;
      const nop = stat === 'BELUM_TERINTEGRASI' 
        ? 'BELUM ADA NOP' 
        : `32.03.${kecCode}0.${(p + 1).toString().padStart(3, '0')}.001-${(1000 + recordCounter).toString()}.0`;

      // Polygon boundary (4 corners)
      const d = 0.0008;
      const polygonBoundary = [
        { lat: Number((lat - d).toFixed(6)), lng: Number((lng - d).toFixed(6)) },
        { lat: Number((lat - d).toFixed(6)), lng: Number((lng + d).toFixed(6)) },
        { lat: Number((lat + d).toFixed(6)), lng: Number((lng + d).toFixed(6)) },
        { lat: Number((lat + d).toFixed(6)), lng: Number((lng - d).toFixed(6)) }
      ];

      records.push({
        id: `REC-CJR-${recordCounter.toString().padStart(3, '0')}`,
        nib,
        nop,
        namaPemilikBpn: nameOwner,
        namaWajibPajakBapenda: stat === 'BELUM_TERINTEGRASI' ? 'BELUM TERDAFTAR BAPENDA' : nameOwner,
        nik: `3203${kecCode}${(150000 + recordCounter * 777).toString().padStart(10, '0')}`,
        alamatObjek: `Jl. Desa ${desa} No. ${p + 12}, Kec. ${kec}, Kab. Cianjur`,
        kecamatan: kec,
        desa,
        luasBpn,
        luasBapenda,
        luasBangunanBapenda,
        selisihLuas: selisih,
        persentaseSelisih: pct,
        jenisHak: hak,
        nomorSertipikat: `${hak.split(' ')[0]} ${recordCounter.toString().padStart(4, '0')}/${desa}`,
        classPajak: cls,
        njopPerM2,
        totalNjopBapenda,
        njopBangunanPerM2,
        totalNjopBangunan,
        status: stat,
        lat,
        lng,
        polygonBoundary,
        tanggalUpdate: '2026-08-10',
        petugasVerifikator: 'Tim Survey Kantah BPN & Bapenda Cianjur',
        catatan: `Bidang tanah terdaftar di PBT GeoPortal Bhumi ATR/BPN Kab. Cianjur (Kecamatan ${kec}).`
      });

      recordCounter++;
    }
  });

  return records;
}

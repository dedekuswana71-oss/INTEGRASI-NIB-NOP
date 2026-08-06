/**
 * Utility Konversi Sistem Koordinat Spasial Geografis (WGS84 Lat/Lng) 
 * ke Sistem Koordinat TM3 (Transverse Mercator 3 Degree BPN Indonesia)
 * 
 * Spesifikasi TM-3 BPN:
 * - Ellipsoid: WGS84
 * - Scale Factor (k0): 0.9999
 * - False Easting (X): 200,000 meter
 * - False Northing (Y): 1,500,000 meter (Lintang Selatan)
 * - Lebar Zona: 3 Derajat
 * - Zona Kabupaten Cianjur & Jawa Barat Bagian Barat: Zona 48.2 (Meridian Utama 106°30' BT / 106.5° E)
 */

export interface TM3Point {
  x: number; // Easting dalam meter (False Easting 200,000m)
  y: number; // Northing dalam meter (False Northing 1,500,000m)
  zone: string; // e.g., '48.2'
  zoneName: string; // e.g., 'TM3 Zone 48.2 (Meridian 106°30\' BT)'
  lat: number;
  lng: number;
  formattedX: string;
  formattedY: string;
}

// BPN TM-3 Zones for Indonesia (Zones 46.1 to 54.2)
export const TM3_ZONES: { [key: string]: { cm: number; label: string } } = {
  '48.1': { cm: 103.5, label: 'Zona 48.1 (MU 103°30\' BT)' },
  '48.2': { cm: 106.5, label: 'Zona 48.2 (MU 106°30\' BT - Cianjur & Jabar Barat)' },
  '49.1': { cm: 109.5, label: 'Zona 49.1 (MU 109°30\' BT - Jabar Timur & Jateng)' },
  '49.2': { cm: 112.5, label: 'Zona 49.2 (MU 112°30\' BT - Jatim)' },
};

const WGS84_A = 6378137.0; // Semi-major axis
const WGS84_F = 1 / 298.257223563; // Flattening
const WGS84_B = WGS84_A * (1 - WGS84_F); // Semi-minor axis 6356752.3142
const E2 = (Math.pow(WGS84_A, 2) - Math.pow(WGS84_B, 2)) / Math.pow(WGS84_A, 2); // 0.00669437999014
const E_PRIME_2 = (Math.pow(WGS84_A, 2) - Math.pow(WGS84_B, 2)) / Math.pow(WGS84_B, 2);

const TM3_K0 = 0.9999;
const TM3_FE = 200000.0; // False Easting
const TM3_FN = 1500000.0; // False Northing for Southern Hemisphere

/**
 * Konversi Latitude & Longitude (WGS84) -> TM-3 BPN (X, Y)
 */
export function latLngToTM3(lat: number, lng: number, zoneKey: string = '48.2'): TM3Point {
  const zone = TM3_ZONES[zoneKey] || TM3_ZONES['48.2'];
  const cm = zone.cm; // Central Meridian in degrees

  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const cmRad = (cm * Math.PI) / 180;

  const N = WGS84_A / Math.sqrt(1 - E2 * Math.sin(latRad) * Math.sin(latRad));
  const T = Math.tan(latRad) * Math.tan(latRad);
  const C = E_PRIME_2 * Math.cos(latRad) * Math.cos(latRad);
  const A = (lngRad - cmRad) * Math.cos(latRad);

  // Meridian Arc Length M
  const M = WGS84_A * (
    (1 - E2 / 4 - 3 * Math.pow(E2, 2) / 64 - 5 * Math.pow(E2, 3) / 256) * latRad -
    (3 * E2 / 8 + 3 * Math.pow(E2, 2) / 32 + 45 * Math.pow(E2, 3) / 1024) * Math.sin(2 * latRad) +
    (15 * Math.pow(E2, 2) / 256 + 45 * Math.pow(E2, 3) / 1024) * Math.sin(4 * latRad) -
    (35 * Math.pow(E2, 3) / 3072) * Math.sin(6 * latRad)
  );

  // Calculate Easting (X)
  const x = TM3_FE + TM3_K0 * N * (
    A +
    (1 - T + C) * Math.pow(A, 3) / 6 +
    (5 - 18 * T + Math.pow(T, 2) + 72 * C - 58 * E_PRIME_2) * Math.pow(A, 5) / 120
  );

  // Calculate Northing (Y) - For Southern Hemisphere (lat < 0)
  const y = TM3_FN + TM3_K0 * (
    M + N * Math.tan(latRad) * (
      Math.pow(A, 2) / 2 +
      (5 - T + 9 * C + 4 * Math.pow(C, 2)) * Math.pow(A, 4) / 24 +
      (61 - 58 * T + Math.pow(T, 2) + 600 * C - 330 * E_PRIME_2) * Math.pow(A, 6) / 720
    )
  );

  return {
    x: Number(x.toFixed(3)),
    y: Number(y.toFixed(3)),
    zone: zoneKey,
    zoneName: zone.label,
    lat,
    lng,
    formattedX: `${x.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m`,
    formattedY: `${y.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m`
  };
}

/**
 * Konversi TM-3 BPN (X, Y, Zone) -> Latitude & Longitude (WGS84)
 */
export function tm3ToLatLng(x: number, y: number, zoneKey: string = '48.2'): { lat: number; lng: number } {
  const zone = TM3_ZONES[zoneKey] || TM3_ZONES['48.2'];
  const cm = zone.cm;

  const xOffset = x - TM3_FE;
  const yOffset = y - TM3_FN;

  const M = yOffset / TM3_K0;
  const mu = M / (WGS84_A * (1 - E2 / 4 - 3 * Math.pow(E2, 2) / 64 - 5 * Math.pow(E2, 3) / 256));

  const e1 = (1 - Math.sqrt(1 - E2)) / (1 + Math.sqrt(1 - E2));

  const phi1Rad = mu +
    (3 * e1 / 2 - 27 * Math.pow(e1, 3) / 32) * Math.sin(2 * mu) +
    (21 * Math.pow(e1, 2) / 16 - 55 * Math.pow(e1, 4) / 32) * Math.sin(4 * mu) +
    (151 * Math.pow(e1, 3) / 96) * Math.sin(6 * mu) +
    (1097 * Math.pow(e1, 4) / 512) * Math.sin(8 * mu);

  const N1 = WGS84_A / Math.sqrt(1 - E2 * Math.sin(phi1Rad) * Math.sin(phi1Rad));
  const T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
  const C1 = E_PRIME_2 * Math.cos(phi1Rad) * Math.cos(phi1Rad);
  const R1 = (WGS84_A * (1 - E2)) / Math.pow(1 - E2 * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
  const D = xOffset / (N1 * TM3_K0);

  const latRad = phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (
    Math.pow(D, 2) / 2 -
    (5 + 3 * T1 + 10 * C1 - 4 * Math.pow(C1, 2) - 9 * E_PRIME_2) * Math.pow(D, 4) / 24 +
    (61 + 90 * T1 + 298 * C1 + 45 * Math.pow(T1, 2) - 252 * E_PRIME_2 - 3 * Math.pow(C1, 2)) * Math.pow(D, 6) / 720
  );

  const lngRad = ((cm * Math.PI) / 180) + (
    D -
    (1 + 2 * T1 + C1) * Math.pow(D, 3) / 6 +
    (5 - 2 * C1 + 28 * T1 - 3 * Math.pow(C1, 2) + 8 * E_PRIME_2 + 24 * Math.pow(T1, 2)) * Math.pow(D, 5) / 120
  ) / Math.cos(phi1Rad);

  return {
    lat: Number(((latRad * 180) / Math.PI).toFixed(6)),
    lng: Number(((lngRad * 180) / Math.PI).toFixed(6))
  };
}

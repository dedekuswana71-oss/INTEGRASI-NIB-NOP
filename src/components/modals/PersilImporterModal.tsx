import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Layers, 
  Sparkles,
  MapPin,
  FileCheck2,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateFullCianjurRecords } from '../../data/cianjurFullCountyData';
import { IntegrationRecord, IntegrationStatus } from '../../types';
import { tm3ToLatLng } from '../../utils/tm3Converter';

interface PersilImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersilImporterModal: React.FC<PersilImporterModalProps> = ({ isOpen, onClose }) => {
  const { setRecords, addLog } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1-Click Load Full County Cianjur Data (32 Kecamatan)
  const handleLoadFullCianjur = () => {
    const fullRecords = generateFullCianjurRecords();
    setRecords(prev => {
      const existingNibs = new Set(prev.map(r => r.nib));
      const newItems = fullRecords.filter(r => !existingNibs.has(r.nib));
      return [...prev, ...newItems];
    });

    addLog('IMPORT', 'PersilUnduh_Merge_Cianjur', '-', `Memuat ${fullRecords.length} bidang tanah PBT se-Kabupaten Cianjur (32 Kecamatan) dari GeoPortal Bhumi ATR/BPN`);
    setSuccessMessage(`Berhasil memuat ${fullRecords.length} bidang tanah se-Kabupaten Cianjur (32 Kecamatan) ke dalam Peta Bhumi ATR/BPN!`);
    
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // KML XML Parser
  const parseKMLText = (xmlText: string): any[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parse error
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error('Format XML/KML tidak valid or rusak.');
    }

    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    const features: any[] = [];

    for (let i = 0; i < placemarks.length; i++) {
      const pm = placemarks[i];
      const props: Record<string, any> = {};

      const nameEl = pm.getElementsByTagName('name')[0];
      if (nameEl && nameEl.textContent) props.NAME = nameEl.textContent.trim();

      const descEl = pm.getElementsByTagName('description')[0];
      if (descEl && descEl.textContent) props.DESCRIPTION = descEl.textContent.trim();

      // ExtendedData (Data & SimpleData)
      const extData = pm.getElementsByTagName('ExtendedData')[0];
      if (extData) {
        const dataEls = extData.getElementsByTagName('Data');
        for (let j = 0; j < dataEls.length; j++) {
          const key = dataEls[j].getAttribute('name');
          const valEl = dataEls[j].getElementsByTagName('value')[0];
          if (key && valEl && valEl.textContent) {
            props[key] = valEl.textContent.trim();
          }
        }
        const simpleDataEls = extData.getElementsByTagName('SimpleData');
        for (let j = 0; j < simpleDataEls.length; j++) {
          const key = simpleDataEls[j].getAttribute('name');
          if (key && simpleDataEls[j].textContent) {
            props[key] = simpleDataEls[j].textContent.trim();
          }
        }
      }

      // Coordinates
      let coordinatesStr = '';
      const polygon = pm.getElementsByTagName('Polygon')[0];
      if (polygon) {
        const coordsEl = polygon.getElementsByTagName('coordinates')[0];
        if (coordsEl && coordsEl.textContent) coordinatesStr = coordsEl.textContent.trim();
      } else {
        const point = pm.getElementsByTagName('Point')[0];
        if (point) {
          const coordsEl = point.getElementsByTagName('coordinates')[0];
          if (coordsEl && coordsEl.textContent) coordinatesStr = coordsEl.textContent.trim();
        }
      }

      const coordPairs = coordinatesStr.split(/\s+/).filter(Boolean);
      const boundaryPoints: { lat: number; lng: number }[] = [];

      coordPairs.forEach(pair => {
        const parts = pair.split(',');
        if (parts.length >= 2) {
          const raw1 = parseFloat(parts[0]);
          const raw2 = parseFloat(parts[1]);
          if (!isNaN(raw1) && !isNaN(raw2)) {
            // Check if coordinates are TM-3 meters (X ~ 200,000, Y ~ 1,500,000)
            if (raw1 > 100000 && raw2 > 1000000) {
              const converted = tm3ToLatLng(raw1, raw2, '48.2');
              boundaryPoints.push(converted);
            } else if (Math.abs(raw1) > Math.abs(raw2) && raw1 > 0) {
              // raw1 = Lng (e.g. 107.13), raw2 = Lat (e.g. -6.82)
              boundaryPoints.push({ lat: raw2, lng: raw1 });
            } else {
              boundaryPoints.push({ lat: raw1, lng: raw2 });
            }
          }
        }
      });

      features.push({
        properties: props,
        boundary: boundaryPoints
      });
    }

    return features;
  };

  // Main file processing handler
  const handleFileUpload = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawText = e.target?.result as string;
        if (!rawText || !rawText.trim()) {
          throw new Error('File kosong atau tidak dapat dibaca');
        }

        const isKML = file.name.toLowerCase().endsWith('.kml') || rawText.trim().startsWith('<') || rawText.includes('<kml');

        if (isKML) {
          processKMLContent(rawText, file.name);
        } else {
          processGeoJSONContent(rawText, file.name);
        }
      } catch (err: any) {
        setErrorMessage(`Gagal memproses file: ${err.message || 'Format tidak valid'}`);
      }
    };
    reader.readAsText(file);
  };

  // Process KML content
  const processKMLContent = (rawText: string, filename: string) => {
    const kmlFeatures = parseKMLText(rawText);
    if (kmlFeatures.length === 0) {
      throw new Error('Tidak ditemukan Placemark bidang tanah dalam file KML');
    }

    const importedRecords: IntegrationRecord[] = [];

    kmlFeatures.forEach((feat, idx) => {
      const props = feat.properties || {};
      const boundary = feat.boundary || [];

      let lat = -6.8228;
      let lng = 107.1398;
      if (boundary.length > 0) {
        lat = boundary[0].lat;
        lng = boundary[0].lng;
      }

      const kecamatan = props.KECAMATAN || props.kecamatan || 'Cianjur';
      const desa = props.KELURAHAN || props.DESA || props.desa || 'Pamoyanan';
      const nib = props.NIB || props.nib || `10.07.01.01.${(12000 + idx).toString()}`;
      const nop = props.NOP || props.nop || `32.03.010.001.001-${(1200 + idx).toString()}.0`;
      const luasBpn = Number(props.LUASTERTUL || props.LUASPETA || props.LUAS || props.luasBpn || 450);
      const luasBapenda = Number(props.LUASBAPENDA || props.luasBapenda || luasBpn);
      const luasBangunanBapenda = Number(props.LUASBANGUNAN || props.luasBangunanBapenda || 0);
      const jenisHak = (props.TIPEHAK || props.jenisHak || 'Hak Milik (HM)') as IntegrationRecord['jenisHak'];

      importedRecords.push({
        id: `REC-KML-${Date.now()}-${idx}`,
        nib,
        nop,
        namaPemilikBpn: props.PEMILIK || props.NAME || props.namaPemilikBpn || 'PEMILIK TERDAFTAR BPN',
        namaWajibPajakBapenda: props.WAJIB_PAJAK || props.namaWajibPajakBapenda || 'WAJIB PAJAK BAPENDA',
        nik: props.NIK || '320301' + Math.floor(1000000000 + Math.random() * 9000000000),
        alamatObjek: `Desa ${desa}, Kec. ${kecamatan}, Kab. Cianjur`,
        kecamatan,
        desa,
        luasBpn,
        luasBapenda,
        luasBangunanBapenda,
        selisihLuas: Math.abs(luasBpn - luasBapenda),
        persentaseSelisih: luasBpn > 0 ? Math.round((Math.abs(luasBpn - luasBapenda) / luasBpn) * 100) : 0,
        jenisHak,
        nomorSertipikat: props.NO_SERTIPIKAT || `${jenisHak.split(' ')[0]} ${idx + 200}/${desa}`,
        classPajak: props.CLASS_PAJAK || 'A1',
        njopPerM2: Number(props.NJOP || 1500000),
        totalNjopBapenda: luasBapenda * Number(props.NJOP || 1500000),
        njopBangunanPerM2: Number(props.NJOP_BANGUNAN || 1200000),
        totalNjopBangunan: luasBangunanBapenda * Number(props.NJOP_BANGUNAN || 1200000),
        status: 'TERINTEGRASI',
        lat,
        lng,
        polygonBoundary: boundary.length > 0 ? boundary : [
          { lat: lat - 0.0005, lng: lng - 0.0005 },
          { lat: lat - 0.0005, lng: lng + 0.0005 },
          { lat: lat + 0.0005, lng: lng + 0.0005 },
          { lat: lat + 0.0005, lng: lng - 0.0005 }
        ],
        tanggalUpdate: new Date().toISOString().substring(0, 10),
        petugasVerifikator: 'Import KML Bhumi ATR/BPN',
        catatan: `Hasil impor KML (${filename}) GeoPortal Bhumi ATR/BPN. Penggunaan: ${props.PENGGUNAAN || 'Perumahan'}.`
      });
    });

    setRecords(prev => [...importedRecords, ...prev]);
    addLog('IMPORT', filename, `${importedRecords.length} KML Placemark`, `Impor ${importedRecords.length} bidang tanah dari KML ${filename}`);
    setSuccessMessage(`Berhasil mengimpor ${importedRecords.length} bidang tanah dari KML ${filename}!`);

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // Process GeoJSON/JSON content
  const processGeoJSONContent = (rawText: string, filename: string) => {
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch (e: any) {
      throw new Error('File bukan JSON/GeoJSON yang valid.');
    }

    let features: any[] = [];

    if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      features = data.features;
    } else if (Array.isArray(data)) {
      features = data;
    } else if (data.features) {
      features = data.features;
    } else if (data.type === 'Feature') {
      features = [data];
    } else {
      features = [data];
    }

    if (features.length === 0) {
      throw new Error('Tidak ada feature bidang tanah yang ditemukan dalam file GeoJSON/JSON');
    }

    const importedRecords: IntegrationRecord[] = [];

    features.forEach((feat, idx) => {
      const props = feat.properties || feat;
      const geom = feat.geometry || feat.geom;

      let lat = -6.8228;
      let lng = 107.1398;
      let boundary: { lat: number; lng: number }[] = [];

      // Extract geometry coordinates (Polygon / MultiPolygon / Point)
      if (geom && (geom.type === 'Polygon' || geom.type === 'MultiPolygon')) {
        const rawCoords = geom.type === 'MultiPolygon' ? geom.coordinates[0][0] : geom.coordinates[0];
        if (Array.isArray(rawCoords)) {
          boundary = rawCoords.map((coord: number[]) => {
            const raw1 = coord[0];
            const raw2 = coord[1];
            // Check if coordinates are TM-3 meters (X ~ 200,000, Y ~ 1,500,000)
            if (raw1 > 100000 && raw2 > 1000000) {
              return tm3ToLatLng(raw1, raw2, '48.2');
            } else if (Math.abs(raw1) > Math.abs(raw2) && raw1 > 0) {
              return { lat: raw2, lng: raw1 };
            } else {
              return { lat: raw1, lng: raw2 };
            }
          });
          if (boundary.length > 0) {
            lat = boundary[0].lat;
            lng = boundary[0].lng;
          }
        }
      } else if (geom && geom.type === 'Point' && Array.isArray(geom.coordinates)) {
        const raw1 = geom.coordinates[0];
        const raw2 = geom.coordinates[1];
        if (raw1 > 100000 && raw2 > 1000000) {
          const pt = tm3ToLatLng(raw1, raw2, '48.2');
          lat = pt.lat;
          lng = pt.lng;
        } else if (Math.abs(raw1) > Math.abs(raw2) && raw1 > 0) {
          lng = raw1;
          lat = raw2;
        } else {
          lat = raw1;
          lng = raw2;
        }
      } else if (props.lat && props.lng) {
        lat = Number(props.lat);
        lng = Number(props.lng);
      }

      // Map ATR/BPN Bhumi GeoPortal Standard Attributes
      const kecamatan = props.KECAMATAN || props.kecamatan || 'Cianjur';
      const desa = props.KELURAHAN || props.DESA || props.desa || props.kelurahan || 'Pamoyanan';
      const nib = props.NIB || props.nib || props.NIB_BPN || `10.07.01.01.${(10000 + idx).toString()}`;
      const nop = props.NOP || props.nop || props.NOP_PBB || `32.03.010.001.001-${(1000 + idx).toString()}.0`;
      const luasBpn = Number(props.LUASTERTUL || props.LUASPETA || props.LUAS || props.luasBpn || 500);
      const luasBapenda = Number(props.LUASBAPENDA || props.luasBapenda || luasBpn);
      const luasBangunanBapenda = Number(props.LUASBANGUNAN || props.luasBangunanBapenda || 0);
      const jenisHak = (props.TIPEHAK || props.HAK || props.jenisHak || 'Hak Milik (HM)') as IntegrationRecord['jenisHak'];
      const status: IntegrationStatus = props.STATUS || props.status || 'TERINTEGRASI';

      importedRecords.push({
        id: `REC-IMP-${Date.now()}-${idx}`,
        nib,
        nop,
        namaPemilikBpn: props.PEMILIK || props.NAMA_PEMILIK || props.namaPemilikBpn || 'PEMILIK TERDAFTAR BPN',
        namaWajibPajakBapenda: props.WAJIB_PAJAK || props.NAMA_WP || props.namaWajibPajakBapenda || 'WAJIB PAJAK BAPENDA',
        nik: props.NIK || '320301' + Math.floor(1000000000 + Math.random() * 9000000000),
        alamatObjek: props.ALAMAT || `Desa ${desa}, Kec. ${kecamatan}, Kab. Cianjur`,
        kecamatan,
        desa,
        luasBpn,
        luasBapenda,
        luasBangunanBapenda,
        selisihLuas: Math.abs(luasBpn - luasBapenda),
        persentaseSelisih: luasBpn > 0 ? Math.round((Math.abs(luasBpn - luasBapenda) / luasBpn) * 100) : 0,
        jenisHak,
        nomorSertipikat: props.NO_SERTIPIKAT || `${jenisHak.split(' ')[0]} ${idx + 100}/${desa}`,
        classPajak: props.CLASS_PAJAK || 'A1',
        njopPerM2: Number(props.NJOP || props.NJOP_TANAH || 1500000),
        totalNjopBapenda: luasBapenda * Number(props.NJOP || props.NJOP_TANAH || 1500000),
        njopBangunanPerM2: Number(props.NJOP_BANGUNAN || 1200000),
        totalNjopBangunan: luasBangunanBapenda * Number(props.NJOP_BANGUNAN || 1200000),
        status,
        lat,
        lng,
        polygonBoundary: boundary.length > 0 ? boundary : [
          { lat: lat - 0.0005, lng: lng - 0.0005 },
          { lat: lat - 0.0005, lng: lng + 0.0005 },
          { lat: lat + 0.0005, lng: lng + 0.0005 },
          { lat: lat + 0.0005, lng: lng - 0.0005 }
        ],
        tanggalUpdate: new Date().toISOString().substring(0, 10),
        petugasVerifikator: 'Import GeoJSON PersilUnduh Bhumi',
        catatan: `Hasil impor file (${filename}) GeoPortal Bhumi ATR/BPN. Tipe produk: ${props.TIPEPRODUK || 'PBT/Sertipikat'}. Penggunaan: ${props.PENGGUNAAN || 'Perumahan'}.`
      });
    });

    setRecords(prev => [...importedRecords, ...prev]);
    addLog('IMPORT', filename, `${importedRecords.length} Feature`, `Impor ${importedRecords.length} bidang tanah dari file ${filename}`);
    setSuccessMessage(`Berhasil mengimpor ${importedRecords.length} bidang tanah dari file ${filename}!`);

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                Impor Bidang Tanah GeoPortal Bhumi ATR/BPN
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mendukung Format Standard .geojson, .json, dan .kml (TM-3 Zone 48.2 & WGS84)
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

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* 1-Click Fast Preset: Full County Cianjur */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-500/30">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Dataset Resmi Kabupaten Cianjur</span>
              </div>
              <h4 className="font-extrabold text-base">Muat Bidang Tanah Se-Kabupaten Cianjur</h4>
              <p className="text-xs text-blue-200/80">
                32 Kecamatan (Cianjur, Pacet, Cipanas, Karangtengah, Cibeber, Cidaun, Sukanagara, dll.)
              </p>
            </div>
            <button
              onClick={handleLoadFullCianjur}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-transform active:scale-95 shadow-md shrink-0 flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>Muat Se-Kabupaten (124+ Bidang)</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-xs text-slate-400 uppercase font-mono font-bold">
              Atau Unggah File PersilUnduh_Merge (.geojson / .kml / .json)
            </span>
          </div>

          {/* Drag and Drop File Upload Area */}
          <div
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[1.01]' 
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Tarik & Lepas File .geojson, .json, atau .kml Di Sini
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Mendukung Atribut Standar Bhumi ATR/BPN (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-blue-600">OBJECTID, NIB, KECAMATAN, KELURAHAN, TIPEHAK, LUASTERTUL, PENGGUNAAN</code>)
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors shadow-sm">
              <FileCode className="w-4 h-4" />
              <span>Pilih File Dari Komputer (.geojson, .kml, .json)</span>
              <input
                type="file"
                accept=".geojson,.json,.kml,.xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          {/* Raw GeoJSON/JSON/KML Paste Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Atau Tempel (Paste) Konten GeoJSON, JSON, atau KML Secara Langsung:
            </label>
            <textarea
              rows={3}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Tempel skema GeoJSON ({"type": "FeatureCollection", ...}) atau teks KML (<kml xmlns=...><Placemark>...)'
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {jsonInput.trim() && (
              <button
                onClick={() => {
                  if (jsonInput.trim().startsWith('<') || jsonInput.includes('<kml')) {
                    processKMLContent(jsonInput, 'Pasted_KML.kml');
                  } else {
                    processGeoJSONContent(jsonInput, 'Pasted_GeoJSON.json');
                  }
                }}
                className="mt-2 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Proses & Impor Konten Tersebut</span>
              </button>
            )}
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};


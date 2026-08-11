import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Search, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Maximize2, 
  Eye, 
  GitCompare, 
  ShieldCheck,
  Building2,
  Maximize,
  ExternalLink,
  Globe,
  Compass,
  Upload
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntegrationRecord } from '../../types';
import { ALL_CIANJUR_KECAMATAN, getDesaListByKecamatan, ALL_CIANJUR_DESA } from '../../data/cianjurLocationData';
import { latLngToTM3 } from '../../utils/tm3Converter';
import { PersilImporterModal } from '../modals/PersilImporterModal';

export const GISMapViewer: React.FC = () => {
  const { 
    records, 
    selectedRecord, 
    setSelectedRecord, 
    setIsDetailOpen, 
    setMatchingRecord, 
    setIsMatchModalOpen,
    darkMode 
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const zntOverlayGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapType, setMapType] = useState<'street' | 'satellite' | 'bhumi_pbt' | 'bhumi_znt'>('bhumi_pbt');
  const [filterKecamatan, setFilterKecamatan] = useState<string>('');
  const [filterDesa, setFilterDesa] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [mapSearch, setMapSearch] = useState<string>('');
  const [showPolygons, setShowPolygons] = useState<boolean>(true);
  const [showZntOverlay, setShowZntOverlay] = useState<boolean>(true);
  const [isImporterOpen, setIsImporterOpen] = useState<boolean>(false);

  // Filtered records for GIS display
  const mapRecords = records.filter(r => {
    if (filterKecamatan && r.kecamatan !== filterKecamatan) return false;
    if (filterDesa && r.desa !== filterDesa) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (mapSearch) {
      const q = mapSearch.toLowerCase();
      return r.nib.toLowerCase().includes(q) || 
             r.nop.toLowerCase().includes(q) || 
             r.namaPemilikBpn.toLowerCase().includes(q) ||
             r.desa.toLowerCase().includes(q);
    }
    return true;
  });

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number; x: string; y: string; zone: string } | null>(null);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  // Helper function for marker color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TERINTEGRASI': return '#10B981'; // Emerald Green
      case 'BELUM_TERINTEGRASI': return '#F59E0B'; // Amber / Golden
      case 'SELISIH_LUAS': return '#EF4444'; // Crimson Red
      case 'PERLU_VERIFIKASI': return '#3B82F6'; // Royal Blue
      default: return '#6B7280';
    }
  };

  // Open Bhumi ATR/BPN portal URL for selected coordinate or general view
  const openBhumiPortal = (lat?: number, lng?: number, nib?: string) => {
    const targetLat = lat || (selectedRecord ? selectedRecord.lat : -6.8228);
    const targetLng = lng || (selectedRecord ? selectedRecord.lng : 107.1398);
    const url = `https://bhumi.atrbpn.go.id/map?lat=${targetLat}&lng=${targetLng}&zoom=18${nib ? `&q=${encodeURIComponent(nib)}` : ''}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center at Cianjur Town Hall / Kantah BPN Cianjur
      const map = L.map(mapContainerRef.current, {
        center: [-6.8228, 107.1398],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Track cursor coordinates in TM-3
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        const tm3 = latLngToTM3(e.latlng.lat, e.latlng.lng, '48.2');
        setCursorCoords({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          x: tm3.formattedX,
          y: tm3.formattedY,
          zone: tm3.zone
        });
      });

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
      zntOverlayGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add selected Tile Layer / Bhumi ATR BPN Basemaps
    if (mapType === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Peta Satelit Citra &copy; Esri &mdash; GeoPortal KKP BPN / Bhumi ATR/BPN RI',
        maxZoom: 19
      }).addTo(map);
    } else if (mapType === 'bhumi_pbt') {
      // Base Satelit with PBT Overlay style
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Peta Pendaftaran & Bidang Tanah (PBT) &copy; Kementerian ATR/BPN RI - KKP Web',
        maxZoom: 19
      }).addTo(map);
    } else if (mapType === 'bhumi_znt') {
      const tileUrl = darkMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      
      L.tileLayer(tileUrl, {
        attribution: 'Peta Zona Nilai Tanah (ZNT) &copy; KKP ATR/BPN & Bapenda Kab. Cianjur',
        maxZoom: 19
      }).addTo(map);
    } else {
      const tileUrl = darkMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      
      L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors | Peta Digital KKP BPN',
        maxZoom: 19
      }).addTo(map);
    }

  }, [mapType, darkMode]);

  // Update Layers & Parcels
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    mapRecords.forEach(rec => {
      const color = getStatusColor(rec.status);
      const tm3Pt = latLngToTM3(rec.lat, rec.lng, '48.2');

      // Add Polygon if present and enabled
      if (showPolygons && rec.polygonBoundary && rec.polygonBoundary.length > 0) {
        const polygonLatLngs = rec.polygonBoundary.map(p => [p.lat, p.lng] as [number, number]);
        const polygon = L.polygon(polygonLatLngs, {
          color: color,
          fillColor: color,
          fillOpacity: mapType === 'bhumi_pbt' ? 0.45 : 0.35,
          weight: mapType === 'bhumi_pbt' ? 2.5 : 2,
          dashArray: rec.status === 'BELUM_TERINTEGRASI' ? '4, 4' : undefined
        });

        // Permanent Tooltip Label KKP BPN style
        polygon.bindTooltip(`
          <div style="font-family: monospace; font-size: 10px; font-weight: 800; color: #0F172A; text-align: center;">
            <div>NIB: ${rec.nib}</div>
            <div style="font-size: 9px; color: #2563EB;">${rec.luasBpn} m²</div>
          </div>
        `, {
          permanent: true,
          direction: 'center',
          className: 'kkp-polygon-label'
        });

        polygon.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 240px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px;">
              <span style="font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 999px; background: ${color}20; color: ${color}; uppercase">
                ${rec.status.replace('_', ' ')}
              </span>
              <span style="font-size: 10px; font-weight: 800; color: #1E3A8A; background: #DBEAFE; padding: 2px 8px; border-radius: 4px;">
                GeoKKP BPN
              </span>
            </div>
            
            <div style="font-size: 12px; font-weight: 800; color: #0F172A; margin-bottom: 2px;">
              NIB: <span style="font-family: monospace; color: #2563EB;">${rec.nib}</span>
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;">
              NOP: <span style="font-family: monospace; color: #059669;">${rec.nop}</span>
            </div>
            
            <div style="background: #F8FAFC; padding: 8px; border-radius: 8px; border: 1px solid #E2E8F0; font-size: 11px; margin-bottom: 8px;">
              <div><strong>Pemilik BPN:</strong> ${rec.namaPemilikBpn}</div>
              <div><strong>Wajib Pajak:</strong> ${rec.namaWajibPajakBapenda}</div>
              <div style="margin-top: 4px; padding-top: 4px; border-t: 1px dashed #CBD5E1;">
                <strong>Luas BPN:</strong> ${rec.luasBpn} m² | <strong>Luas PBB:</strong> ${rec.luasBapenda} m²
              </div>
              ${rec.selisihLuas > 0 ? `<div style="color: #DC2626; font-weight: bold; margin-top: 2px;">Selisih: ${rec.selisihLuas} m² (${rec.persentaseSelisih}%)</div>` : ''}
            </div>

            <div style="background: #EFF6FF; border: 1px solid #BFDBFE; padding: 6px 8px; border-radius: 6px; font-size: 10px; font-family: monospace; color: #1E40AF; margin-bottom: 8px;">
              <strong>Sistem Proyeksi TM3 Zona ${tm3Pt.zone}:</strong><br/>
              X: ${tm3Pt.formattedX}<br/>
              Y: ${tm3Pt.formattedY}
            </div>
            
            <div style="font-size: 10px; color: #64748B; margin-bottom: 8px;">Desa ${rec.desa}, Kec. ${rec.kecamatan}</div>
            
            <a 
              href="https://bhumi.atrbpn.go.id/map?lat=${rec.lat}&lng=${rec.lng}&zoom=18" 
              target="_blank" 
              rel="noopener noreferrer"
              style="display: block; text-align: center; background: #1D4ED8; color: white; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: bold; text-decoration: none;"
            >
              🌐 Buka Bidang di Bhumi / KKP ATR/BPN
            </a>
          </div>
        `);

        polygon.on('click', () => {
          setSelectedRecord(rec);
        });

        polygon.addTo(layerGroup);
      }

      // Add Custom HTML Pin Marker
      const customIcon = L.divIcon({
        className: 'custom-gis-pin',
        html: `
          <div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 11px;
          ">
            📍
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([rec.lat, rec.lng], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 999px; background: ${color}20; color: ${color};">
              ${rec.status.replace('_', ' ')}
            </span>
            <span style="font-size: 10px; font-weight: bold; color: #1E3A8A; background: #DBEAFE; padding: 2px 6px; border-radius: 4px;">
              BPN RI
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 800; margin: 0; color: #0F172A;">NIB: ${rec.nib}</h4>
          <p style="font-size: 11px; color: #475569; margin: 2px 0 6px 0;">NOP: ${rec.nop}</p>
          <p style="font-size: 11px; font-weight: 600; color: #1E293B; margin-bottom: 4px;">${rec.namaPemilikBpn}</p>
          <p style="font-size: 10px; color: #64748B; margin-bottom: 8px;">Desa ${rec.desa}, Kec. ${rec.kecamatan}</p>

          <a 
            href="https://bhumi.atrbpn.go.id/map?lat=${rec.lat}&lng=${rec.lng}&zoom=18" 
            target="_blank" 
            rel="noopener noreferrer"
            style="display: block; text-align: center; background: #1D4ED8; color: white; padding: 5px; border-radius: 6px; font-size: 10px; font-weight: bold; text-decoration: none;"
          >
            🌐 Buka di Bhumi ATR/BPN
          </a>
        </div>
      `);

      marker.on('click', () => {
        setSelectedRecord(rec);
      });

      marker.addTo(layerGroup);
    });

  }, [mapRecords, showPolygons, mapType]);

  // Handle focus on selected record
  useEffect(() => {
    if (selectedRecord && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedRecord.lat, selectedRecord.lng], 17, {
        duration: 1.5
      });
    }
  }, [selectedRecord]);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[520px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* GIS Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md">
        {/* Left Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-slate-800">
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-extrabold text-[11px] flex items-center gap-1.5 shrink-0">
              <Globe className="w-3.5 h-3.5" />
              <span>Bhumi ATR/BPN</span>
            </span>
          </div>

          <div className="relative min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIB, NOP, Pemilik, Desa..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 border border-transparent focus:border-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={filterKecamatan}
            onChange={(e) => {
              setFilterKecamatan(e.target.value);
              setFilterDesa('');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-transparent focus:outline-none max-w-[150px]"
          >
            <option value="">Kecamatan ({ALL_CIANJUR_KECAMATAN.length})</option>
            {ALL_CIANJUR_KECAMATAN.map(kec => (
              <option key={kec} value={kec}>Kec. {kec}</option>
            ))}
          </select>

          <select
            value={filterDesa}
            onChange={(e) => setFilterDesa(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-transparent focus:outline-none max-w-[150px]"
          >
            <option value="">Semua Desa ({filterKecamatan ? getDesaListByKecamatan(filterKecamatan).length : ALL_CIANJUR_DESA.length})</option>
            {(filterKecamatan ? getDesaListByKecamatan(filterKecamatan) : ALL_CIANJUR_DESA).map(d => (
              <option key={d} value={d}>Desa/Kel. {d}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-transparent focus:outline-none"
          >
            <option value="">Semua Status</option>
            <option value="TERINTEGRASI">Terintegrasi Valid</option>
            <option value="BELUM_TERINTEGRASI">Belum Ada NOP</option>
            <option value="SELISIH_LUAS">Selisih Luas Tanah</option>
            <option value="PERLU_VERIFIKASI">Perlu Verifikasi Lapangan</option>
          </select>
        </div>

        {/* Right Layer Toggles & Bhumi Launcher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPolygons(!showPolygons)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              showPolygons 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>PBT Bidang</span>
          </button>

          {/* Map Layer Mode Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMapType('bhumi_pbt')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapType === 'bhumi_pbt' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
              title="Peta Bidang Tanah (PBT) Bhumi ATR/BPN"
            >
              Bhumi PBT
            </button>
            <button
              onClick={() => setMapType('bhumi_znt')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapType === 'bhumi_znt' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
              title="Zona Nilai Tanah (ZNT) Bhumi ATR/BPN"
            >
              Bhumi ZNT
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapType === 'satellite' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Satelit Citra
            </button>
            <button
              onClick={() => setMapType('street')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapType === 'street' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Vektor
            </button>
          </div>

          <button
            onClick={() => setIsImporterOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs"
            title="Unggah File PersilUnduh_Merge atau Muat Bidang Tanah Se-Kabupaten Cianjur"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor Persil Bhumi</span>
          </button>

          <button
            onClick={() => openBhumiPortal()}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs"
            title="Buka Portal Bhumi ATR/BPN Resmi di Tab Baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Portal Bhumi ATR/BPN</span>
          </button>
        </div>
      </div>

      {/* Persil GeoJSON Importer Modal */}
      <PersilImporterModal 
        isOpen={isImporterOpen} 
        onClose={() => setIsImporterOpen(false)} 
      />

      {/* Main Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-1" />

      {/* Live TM-3 Coordinate Status Bar (KKP BPN Standard) */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/60 text-[11px] font-mono shadow-lg pointer-events-auto">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          <span>CRS: TM-3 (DGN95) Zona 48.2</span>
        </div>
        {cursorCoords ? (
          <div className="flex items-center gap-3 text-slate-300">
            <span>X: <strong className="text-emerald-400">{cursorCoords.x}</strong></span>
            <span>Y: <strong className="text-emerald-400">{cursorCoords.y}</strong></span>
            <span className="hidden sm:inline text-slate-400">({cursorCoords.lat.toFixed(6)}, {cursorCoords.lng.toFixed(6)})</span>
          </div>
        ) : (
          <span className="text-slate-400 italic">Arahkan kursor pada peta...</span>
        )}
      </div>

      {/* KKP BPN Map Legend Overlay */}
      <div className="absolute bottom-16 left-4 z-20 pointer-events-auto">
        {showLegend ? (
          <div className="p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl w-64 text-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
              <span className="font-extrabold text-slate-800 dark:text-slate-100 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Legenda KKP BPN
              </span>
              <button 
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0 border border-emerald-600" />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Terintegrasi Valid (NIB + NOP)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0 border border-amber-600" />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Terdaftar BPN (Belum Ada NOP)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-rose-500 shrink-0 border border-rose-600" />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Selisih Luas (PBT vs SPPT)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-blue-500 shrink-0 border border-blue-600" />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Perlu Verifikasi Fisik</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-md hover:bg-slate-100 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Tampilkan Legenda</span>
          </button>
        )}
      </div>

      {/* Selected Parcel Inspector Side Panel */}
      {selectedRecord && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-20 p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full shrink-0`} style={{ backgroundColor: getStatusColor(selectedRecord.status) }} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {selectedRecord.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                Bhumi Verified
              </span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">NIB (BPN)</span>
              <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{selectedRecord.nib}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">NOP (Bapenda)</span>
              <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{selectedRecord.nop}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Pemilik Hak BPN</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">{selectedRecord.namaPemilikBpn}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Lokasi Admin</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[200px]">Desa {selectedRecord.desa}, Kec. {selectedRecord.kecamatan}</span>
            </div>

            <div className="p-3 my-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">LUAS SERTIPIKAT BPN</p>
                <p className="font-extrabold text-slate-800 dark:text-white">{selectedRecord.luasBpn} m²</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">LUAS SPPT PBB</p>
                <p className="font-extrabold text-slate-800 dark:text-white">{selectedRecord.luasBapenda} m²</p>
              </div>
            </div>

            {selectedRecord.selisihLuas > 0 && (
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Selisih Luas: {selectedRecord.selisihLuas} m² ({selectedRecord.persentaseSelisih}%)</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => openBhumiPortal(selectedRecord.lat, selectedRecord.lng, selectedRecord.nib)}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Koordinat di Portal Bhumi ATR/BPN</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDetailOpen(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 text-center transition-colors"
              >
                Detail Lengkap
              </button>
              <button
                onClick={() => {
                  setMatchingRecord(selectedRecord);
                  setIsMatchModalOpen(true);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Padankan NOP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

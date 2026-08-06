import React, { useState, useEffect, useRef } from 'react';
import { X, PlusCircle, Save, Landmark, Building2, MapPin, Compass, RefreshCw, Eye, Layers, ExternalLink, Maximize2 } from 'lucide-react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { IntegrationRecord, IntegrationStatus } from '../../types';
import { ALL_CIANJUR_KECAMATAN, getDesaListByKecamatan } from '../../data/cianjurLocationData';
import { latLngToTM3, tm3ToLatLng, TM3_ZONES } from '../../utils/tm3Converter';

interface ParcelMapPreviewProps {
  lat: number;
  lng: number;
  luas: number;
  nib: string;
  nop: string;
  namaPemilik: string;
  alamat: string;
  onLocationSelect: (lat: number, lng: number) => void;
}

const ParcelMapPreview: React.FC<ParcelMapPreviewProps> = ({
  lat,
  lng,
  luas,
  nib,
  nop,
  namaPemilik,
  alamat,
  onLocationSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const [mapTile, setMapTile] = useState<'satelit' | 'osm' | 'topo'>('satelit');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const initialLat = isNaN(lat) || lat === 0 ? -6.8228 : lat;
      const initialLng = isNaN(lng) || lng === 0 ? 107.1398 : lng;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 18,
        zoomControl: true,
        scrollWheelZoom: true
      });

      leafletMapRef.current = map;

      const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri World Imagery'
      });
      satLayer.addTo(map);

      // Handle map click to update position
      map.on('click', (e: L.LeafletMouseEvent) => {
        const newLat = Number(e.latlng.lat.toFixed(6));
        const newLng = Number(e.latlng.lng.toFixed(6));
        onLocationSelect(newLat, newLng);
      });

      // Force map recalculate size after mount inside modal
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update map tiles
  useEffect(() => {
    if (!leafletMapRef.current) return;

    leafletMapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        leafletMapRef.current?.removeLayer(layer);
      }
    });

    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attr = 'Esri World Imagery';

    if (mapTile === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attr = '© OpenStreetMap';
    } else if (mapTile === 'topo') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attr = '© OpenTopoMap';
    }

    L.tileLayer(tileUrl, { maxZoom: 19, attribution: attr }).addTo(leafletMapRef.current);
  }, [mapTile]);

  // Sync marker & parcel polygon when lat/lng/luas change
  useEffect(() => {
    if (!leafletMapRef.current) return;

    const safeLat = isNaN(lat) || lat === 0 ? -6.8228 : lat;
    const safeLng = isNaN(lng) || lng === 0 ? 107.1398 : lng;
    const map = leafletMapRef.current;

    map.setView([safeLat, safeLng], map.getZoom() < 16 ? 18 : map.getZoom());

    // Update or create Marker
    if (markerRef.current) {
      markerRef.current.setLatLng([safeLat, safeLng]);
    } else {
      const customIcon = L.divIcon({
        className: 'custom-parcel-pin',
        html: `<div style="
          background: #2563EB;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 14px rgba(0,0,0,0.4);
          font-size: 18px;
          cursor: grab;
        ">📍</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([safeLat, safeLng], {
        icon: customIcon,
        draggable: true
      }).addTo(map);

      marker.on('dragend', (e) => {
        const markerLatLng = e.target.getLatLng();
        onLocationSelect(
          Number(markerLatLng.lat.toFixed(6)),
          Number(markerLatLng.lng.toFixed(6))
        );
      });

      markerRef.current = marker;
    }

    // Popup content
    const tm3 = latLngToTM3(safeLat, safeLng, '48.2');
    markerRef.current.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; padding: 2px; min-width: 200px;">
        <div style="font-weight: bold; color: #1E3A8A; margin-bottom: 4px;">📍 Posisi Bidang Tanah</div>
        <div><strong>NIB:</strong> ${nib || 'Draft'}</div>
        <div><strong>NOP:</strong> ${nop || 'Draft'}</div>
        <div><strong>Pemilik:</strong> ${namaPemilik || '-'}</div>
        <div><strong>Luas Bidang:</strong> ${luas || 0} m²</div>
        <div style="margin-top: 6px; background: #EFF6FF; border: 1px solid #BFDBFE; padding: 4px; border-radius: 4px; font-family: monospace; font-size: 10px;">
          <strong>TM3 (Zona ${tm3.zone}):</strong><br/>
          X: ${tm3.formattedX}<br/>
          Y: ${tm3.formattedY}
        </div>
      </div>
    `);

    // Generate square parcel polygon representing exact area
    const safeLuas = luas > 0 ? luas : 400;
    const sideMeters = Math.sqrt(safeLuas);
    const dLat = (sideMeters / 2) / 111320;
    const dLng = (sideMeters / 2) / (111320 * Math.cos((safeLat * Math.PI) / 180));

    const polygonCoords: [number, number][] = [
      [safeLat + dLat, safeLng - dLng],
      [safeLat + dLat, safeLng + dLng],
      [safeLat - dLat, safeLng + dLng],
      [safeLat - dLat, safeLng - dLng]
    ];

    if (polygonRef.current) {
      polygonRef.current.setLatLngs(polygonCoords);
    } else {
      const poly = L.polygon(polygonCoords, {
        color: '#10B981',
        weight: 3,
        fillColor: '#10B981',
        fillOpacity: 0.35
      }).addTo(map);

      polygonRef.current = poly;
    }
  }, [lat, lng, luas, nib, nop, namaPemilik]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Eye className="w-4 h-4 text-emerald-500" />
          <span>Pratinjau Posisi Bidang Tanah Pada Peta (Klik / Geser Pin untuk Sesuaikan)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Tile switch button */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setMapTile('satelit')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                mapTile === 'satelit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Satelit
            </button>
            <button
              type="button"
              onClick={() => setMapTile('osm')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                mapTile === 'osm'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Peta Jalan
            </button>
            <button
              type="button"
              onClick={() => setMapTile('topo')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                mapTile === 'topo'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Topografi
            </button>
          </div>

          <a
            href={`https://bhumi.atrbpn.go.id/map?lat=${lat}&lng=${lng}&zoom=18`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-extrabold text-[11px] hover:bg-emerald-100 transition-colors flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Bhumi BPN</span>
          </a>
        </div>
      </div>

      <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        
        <div className="absolute top-2 left-2 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
          🟢 Polygon Luas: {luas || 0} m²
        </div>

        <div className="absolute bottom-2 right-2 z-[400] bg-blue-900/80 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1 pointer-events-none">
          <span>* Klik atau geser marker biru untuk memindahkan koordinat bidang</span>
        </div>
      </div>
    </div>
  );
};

export const FormRecordModal: React.FC = () => {
  const { 
    isFormOpen, 
    setIsFormOpen, 
    editingRecord, 
    addRecord, 
    updateRecord, 
    currentUser 
  } = useApp();

  const [formData, setFormData] = useState({
    nib: '',
    nop: '',
    namaPemilikBpn: '',
    namaWajibPajakBapenda: '',
    nik: '',
    alamatObjek: '',
    kecamatan: 'Cianjur',
    desa: 'Pamoyanan',
    luasBpn: 500,
    luasBapenda: 500,
    jenisHak: 'Hak Milik (HM)' as IntegrationRecord['jenisHak'],
    nomorSertipikat: '',
    classPajak: 'A1' as IntegrationRecord['classPajak'],
    njopPerM2: 1500000,
    status: 'TERINTEGRASI' as IntegrationStatus,
    lat: -6.8228,
    lng: 107.1398,
    catatan: ''
  });

  const [tm3Zone, setTm3Zone] = useState<string>('48.2');
  const [tm3XStr, setTm3XStr] = useState<string>('215420.500');
  const [tm3YStr, setTm3YStr] = useState<string>('1489120.350');
  const [activeCoordMode, setActiveCoordMode] = useState<'GEOGRAFIS' | 'TM3'>('GEOGRAFIS');

  // Helper to convert Lat/Lng to TM3 strings
  const updateTM3FromLatLng = (lat: number, lng: number, zone: string = tm3Zone) => {
    const tm3 = latLngToTM3(lat, lng, zone);
    setTm3XStr(tm3.x.toFixed(3));
    setTm3YStr(tm3.y.toFixed(3));
  };

  // Helper to convert TM3 strings to Lat/Lng
  const updateLatLngFromTM3 = (xStr: string, yStr: string, zone: string = tm3Zone) => {
    const xVal = parseFloat(xStr);
    const yVal = parseFloat(yStr);
    if (!isNaN(xVal) && !isNaN(yVal)) {
      const converted = tm3ToLatLng(xVal, yVal, zone);
      setFormData(prev => ({ ...prev, lat: converted.lat, lng: converted.lng }));
    }
  };

  useEffect(() => {
    if (editingRecord) {
      const initialLat = editingRecord.lat;
      const initialLng = editingRecord.lng;
      setFormData({
        nib: editingRecord.nib,
        nop: editingRecord.nop,
        namaPemilikBpn: editingRecord.namaPemilikBpn,
        namaWajibPajakBapenda: editingRecord.namaWajibPajakBapenda,
        nik: editingRecord.nik,
        alamatObjek: editingRecord.alamatObjek,
        kecamatan: editingRecord.kecamatan,
        desa: editingRecord.desa,
        luasBpn: editingRecord.luasBpn,
        luasBapenda: editingRecord.luasBapenda,
        jenisHak: editingRecord.jenisHak,
        nomorSertipikat: editingRecord.nomorSertipikat || '',
        classPajak: editingRecord.classPajak,
        njopPerM2: editingRecord.njopPerM2,
        status: editingRecord.status,
        lat: initialLat,
        lng: initialLng,
        catatan: editingRecord.catatan || ''
      });
      updateTM3FromLatLng(initialLat, initialLng, tm3Zone);
    } else {
      // Default new record template
      const newLat = -6.8228 + (Math.random() - 0.5) * 0.05;
      const newLng = 107.1398 + (Math.random() - 0.5) * 0.05;
      setFormData({
        nib: `10.07.01.${(Math.floor(Math.random() * 80) + 10).toString().padStart(2, '0')}.${(Math.floor(Math.random() * 89999) + 10000)}`,
        nop: `32.03.${(Math.floor(Math.random() * 80) + 10).toString().padStart(3, '0')}.001.002-${(Math.floor(Math.random() * 8999) + 1000)}.0`,
        namaPemilikBpn: '',
        namaWajibPajakBapenda: '',
        nik: '3203' + Math.floor(Math.random() * 899999999999 + 100000000000).toString(),
        alamatObjek: '',
        kecamatan: 'Cianjur',
        desa: 'Pamoyanan',
        luasBpn: 450,
        luasBapenda: 450,
        jenisHak: 'Hak Milik (HM)',
        nomorSertipikat: '',
        classPajak: 'A1',
        njopPerM2: 1200000,
        status: 'TERINTEGRASI',
        lat: newLat,
        lng: newLng,
        catatan: 'Data bidang tanah diinput via formulir integrasi NIB-NOP.'
      });
      updateTM3FromLatLng(newLat, newLng, tm3Zone);
    }
  }, [editingRecord, isFormOpen]);

  if (!isFormOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nib || !formData.namaPemilikBpn) {
      alert('Mohon lengkapi NIB dan Nama Pemilik Hak BPN.');
      return;
    }

    const totalNjop = formData.luasBapenda * formData.njopPerM2;

    if (editingRecord) {
      updateRecord(editingRecord.id, {
        ...formData,
        totalNjopBapenda: totalNjop,
        petugasVerifikator: currentUser.name
      });
    } else {
      addRecord({
        ...formData,
        totalNjopBapenda: totalNjop,
        petugasVerifikator: currentUser.name
      });
    }

    setIsFormOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {editingRecord ? 'Edit Data Bidang Tanah NIB-NOP' : 'Tambah Bidang Tanah & Objek Pajak'}
              </h3>
              <p className="text-xs text-slate-500">
                Pendaftaran & Pemutakhiran Database Kantah BPN & Bapenda Cianjur
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFormOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 text-xs">
          {/* Row 1: NIB & NOP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Induk Bidang (NIB) *
              </label>
              <input
                type="text"
                required
                value={formData.nib}
                onChange={(e) => setFormData(prev => ({ ...prev, nib: e.target.value }))}
                placeholder="10.07.01.01.00124"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Objek Pajak (NOP Bapenda)
              </label>
              <input
                type="text"
                value={formData.nop}
                onChange={(e) => setFormData(prev => ({ ...prev, nop: e.target.value }))}
                placeholder="32.03.010.001.002-0124.0"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Pemilik BPN & WP Bapenda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Pemegang Hak (BPN) *
              </label>
              <input
                type="text"
                required
                value={formData.namaPemilikBpn}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({ 
                    ...prev, 
                    namaPemilikBpn: val,
                    namaWajibPajakBapenda: prev.namaWajibPajakBapenda || val
                  }));
                }}
                placeholder="Nama Pemilik Sertipikat"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Wajib Pajak (SPPT Bapenda)
              </label>
              <input
                type="text"
                value={formData.namaWajibPajakBapenda}
                onChange={(e) => setFormData(prev => ({ ...prev, namaWajibPajakBapenda: e.target.value }))}
                placeholder="Nama di SPPT PBB"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 3: NIK & Jenis Hak */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                NIK Subjek (KTP)
              </label>
              <input
                type="text"
                value={formData.nik}
                onChange={(e) => setFormData(prev => ({ ...prev, nik: e.target.value }))}
                placeholder="3203..."
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Hak Atas Tanah
              </label>
              <select
                value={formData.jenisHak}
                onChange={(e) => setFormData(prev => ({ ...prev, jenisHak: e.target.value as any }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Hak Milik (HM)">Hak Milik (HM)</option>
                <option value="Hak Guna Bangunan (HGB)">Hak Guna Bangunan (HGB)</option>
                <option value="Hak Pakai (HP)">Hak Pakai (HP)</option>
                <option value="Girik/Adat">Girik / Adat</option>
                <option value="Hak Pengelolaan (HPL)">Hak Pengelolaan (HPL)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Sertipikat
              </label>
              <input
                type="text"
                value={formData.nomorSertipikat}
                onChange={(e) => setFormData(prev => ({ ...prev, nomorSertipikat: e.target.value }))}
                placeholder="HM 0124/Bojong"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Kecamatan & Desa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kecamatan (Kab. Cianjur) *
              </label>
              <select
                value={formData.kecamatan}
                onChange={(e) => {
                  const selectedKec = e.target.value;
                  const availableDesas = getDesaListByKecamatan(selectedKec);
                  setFormData(prev => ({
                    ...prev,
                    kecamatan: selectedKec,
                    desa: availableDesas.includes(prev.desa) ? prev.desa : (availableDesas[0] || '')
                  }));
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {ALL_CIANJUR_KECAMATAN.map(kec => (
                  <option key={kec} value={kec}>Kec. {kec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Desa / Kelurahan (Kec. {formData.kecamatan}) *
              </label>
              <select
                value={formData.desa}
                onChange={(e) => setFormData(prev => ({ ...prev, desa: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {getDesaListByKecamatan(formData.kecamatan).map(desaName => (
                  <option key={desaName} value={desaName}>Desa/Kel. {desaName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Alamat Objek */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alamat Lengkap Objek Tanah
            </label>
            <input
              type="text"
              required
              value={formData.alamatObjek}
              onChange={(e) => setFormData(prev => ({ ...prev, alamatObjek: e.target.value }))}
              placeholder="Jl. Raya Bandung No. 45, Kampung Bojong RT 01/02..."
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Row 5b: Koordinat Spasial Geografis & TM-3 BPN */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Koordinat Spasial Geografis & Sistem TM3 BPN *</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const lat = Number(pos.coords.latitude.toFixed(6));
                          const lng = Number(pos.coords.longitude.toFixed(6));
                          setFormData(prev => ({ ...prev, lat, lng }));
                          updateTM3FromLatLng(lat, lng);
                        },
                        () => {
                          const lat = Number((-6.8228 + (Math.random() - 0.5) * 0.02).toFixed(6));
                          const lng = Number((107.1398 + (Math.random() - 0.5) * 0.02).toFixed(6));
                          setFormData(prev => ({ ...prev, lat, lng }));
                          updateTM3FromLatLng(lat, lng);
                        }
                      );
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-bold text-[11px] transition-colors flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>GPS Autodetect</span>
                </button>
              </div>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveCoordMode('GEOGRAFIS')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeCoordMode === 'GEOGRAFIS'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                1. Input Geografis (WGS84 Lat / Lng)
              </button>
              <button
                type="button"
                onClick={() => setActiveCoordMode('TM3')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeCoordMode === 'TM3'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                2. Input Sistem TM3 BPN (X / Y / Zona Hasil Lapangan)
              </button>
            </div>

            {activeCoordMode === 'GEOGRAFIS' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-xs">
                    Latitude / Lintang (WGS84) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.lat}
                    onChange={(e) => {
                      const newLat = Number(e.target.value);
                      setFormData(prev => ({ ...prev, lat: newLat }));
                      updateTM3FromLatLng(newLat, formData.lng);
                    }}
                    placeholder="-6.8228"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-xs">
                    Longitude / Bujur (WGS84) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.lng}
                    onChange={(e) => {
                      const newLng = Number(e.target.value);
                      setFormData(prev => ({ ...prev, lng: newLng }));
                      updateTM3FromLatLng(formData.lat, newLng);
                    }}
                    placeholder="107.1398"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-xs">
                      Zona TM3 BPN *
                    </label>
                    <select
                      value={tm3Zone}
                      onChange={(e) => {
                        const newZone = e.target.value;
                        setTm3Zone(newZone);
                        updateLatLngFromTM3(tm3XStr, tm3YStr, newZone);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      {Object.entries(TM3_ZONES).map(([key, z]) => (
                        <option key={key} value={key}>{z.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-xs">
                      Koordinat X TM3 (Easting meter) *
                    </label>
                    <input
                      type="text"
                      required
                      value={tm3XStr}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTm3XStr(val);
                        updateLatLngFromTM3(val, tm3YStr, tm3Zone);
                      }}
                      placeholder="215420.500"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1 text-xs">
                      Koordinat Y TM3 (Northing meter) *
                    </label>
                    <input
                      type="text"
                      required
                      value={tm3YStr}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTm3YStr(val);
                        updateLatLngFromTM3(tm3XStr, val, tm3Zone);
                      }}
                      placeholder="1489120.350"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Hasil Konversi Real-Time Banner */}
            <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin-slow" />
                <span className="font-bold text-blue-950 dark:text-blue-200">Hasil Konversi Otomatis TM3 ↔ Geografis:</span>
              </div>
              <div className="font-mono text-[11px] font-extrabold text-blue-800 dark:text-blue-300">
                TM3 Zona {tm3Zone} | X: {parseFloat(tm3XStr || '0').toLocaleString('id-ID')} m | Y: {parseFloat(tm3YStr || '0').toLocaleString('id-ID')} m | WGS84: ({formData.lat.toFixed(6)}, {formData.lng.toFixed(6)})
              </div>
            </div>

            {/* Peta Interactive Preview Posisi Bidang Tanah */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <ParcelMapPreview
                lat={formData.lat}
                lng={formData.lng}
                luas={formData.luasBpn}
                nib={formData.nib}
                nop={formData.nop}
                namaPemilik={formData.namaPemilikBpn}
                alamat={formData.alamatObjek}
                onLocationSelect={(newLat, newLng) => {
                  setFormData(prev => ({ ...prev, lat: newLat, lng: newLng }));
                  updateTM3FromLatLng(newLat, newLng);
                }}
              />
            </div>
          </div>

          {/* Row 6: Luas BPN & Luas Bapenda & NJOP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div>
              <label className="block font-bold text-blue-900 dark:text-blue-300 mb-1">
                Luas Sertipikat BPN (m²)
              </label>
              <input
                type="number"
                required
                value={formData.luasBpn}
                onChange={(e) => setFormData(prev => ({ ...prev, luasBpn: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-extrabold text-blue-900 dark:text-blue-100 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-blue-900 dark:text-blue-300 mb-1">
                Luas SPPT PBB (m²)
              </label>
              <input
                type="number"
                required
                value={formData.luasBapenda}
                onChange={(e) => setFormData(prev => ({ ...prev, luasBapenda: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-extrabold text-blue-900 dark:text-blue-100 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-blue-900 dark:text-blue-300 mb-1">
                NJOP / m² (Rp)
              </label>
              <input
                type="number"
                required
                value={formData.njopPerM2}
                onChange={(e) => setFormData(prev => ({ ...prev, njopPerM2: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-blue-900 dark:text-blue-100 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Row 7: Status */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Status Sinkronisasi awal
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="TERINTEGRASI">TERINTEGRASI (Data Cocok)</option>
              <option value="BELUM_TERINTEGRASI">BELUM TERINTEGRASI (Belum Punya NOP)</option>
              <option value="SELISIH_LUAS">SELISIH LUAS (BPN vs Bapenda Beda m²)</option>
              <option value="PERLU_VERIFIKASI">PERLU VERIFIKASI (Tinjau Lapangan)</option>
            </select>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

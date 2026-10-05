import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Schedule, Vessel, Route, Port } from '../../types';
import {
  Navigation,
  Ship,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Wind,
  Search,
  RefreshCw
} from 'lucide-react';

export const ShipTrackingView: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Form State
  const [voyageNumber, setVoyageNumber] = useState('');
  const [vesselId, setVesselId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [etd, setEtd] = useState('');
  const [eta, setEta] = useState('');
  const [currentStatus, setCurrentStatus] = useState<'Scheduled' | 'Loading' | 'In Transit' | 'Arrived' | 'Delayed'>('In Transit');
  const [currentCoordinates, setCurrentCoordinates] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(50);
  const [weatherCondition, setWeatherCondition] = useState<'Calm Sea' | 'Moderate Waves' | 'Rough Sea' | 'Storm Warning'>('Calm Sea');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schData, vslData, rtData, prtData] = await Promise.all([
        api.getSchedules(),
        api.getVessels(),
        api.getRoutes(),
        api.getPorts()
      ]);
      setSchedules(schData);
      setVessels(vslData);
      setRoutes(rtData);
      setPorts(prtData);
    } catch (err) {
      console.error('Failed to load tracking schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingSchedule(null);
    setVoyageNumber(`VY-2026-${Math.floor(100 + Math.random() * 900)}`);
    setVesselId(vessels[0]?.id || '');
    setRouteId(routes[0]?.id || '');
    setEtd(new Date().toISOString().slice(0, 16));
    setEta(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
    setCurrentStatus('Scheduled');
    setCurrentCoordinates('Dermaga Pelabuhan Keberangkatan');
    setProgressPercentage(0);
    setWeatherCondition('Calm Sea');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (sch: Schedule) => {
    setEditingSchedule(sch);
    setVoyageNumber(sch.voyageNumber);
    setVesselId(sch.vesselId);
    setRouteId(sch.routeId);
    setEtd(sch.etd ? new Date(sch.etd).toISOString().slice(0, 16) : '');
    setEta(sch.eta ? new Date(sch.eta).toISOString().slice(0, 16) : '');
    setCurrentStatus(sch.currentStatus);
    setCurrentCoordinates(sch.currentCoordinates);
    setProgressPercentage(sch.progressPercentage);
    setWeatherCondition(sch.weatherCondition);
    setNotes(sch.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Schedule> = {
        voyageNumber,
        vesselId,
        routeId,
        etd: new Date(etd).toISOString(),
        eta: new Date(eta).toISOString(),
        currentStatus,
        currentCoordinates,
        progressPercentage: Number(progressPercentage),
        weatherCondition,
        notes,
        fuelConsumedLiters: editingSchedule ? editingSchedule.fuelConsumedLiters : 5000
      };

      if (editingSchedule) {
        await api.updateSchedule(editingSchedule.id, payload);
      } else {
        await api.createSchedule(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data jadwal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal pelayaran ini?')) {
      try {
        await api.deleteSchedule(id);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus jadwal.');
      }
    }
  };

  const filteredSchedules = schedules.filter((sch) => {
    const vessel = vessels.find((v) => v.id === sch.vesselId);
    const matchesSearch =
      sch.voyageNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vessel && vessel.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sch.currentCoordinates.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || sch.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Navigation className="w-6 h-6 text-blue-600" />
            <span>Pelacakan Jadwal Kapal & Posisi Armada</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring pergerakan kapal, ETA/ETD, cuaca pelayaran, dan logistikal perjalanan secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Pelayaran</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. Voyage, Nama Kapal, Lokasi..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'In Transit', 'Loading', 'Scheduled', 'Arrived', 'Delayed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'All' ? 'Semua Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule List */}
      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-slate-500">
          Memuat jadwal pelayaran dari database real...
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500 space-y-2">
          <Ship className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-sm">Tidak ada jadwal pelayaran ditemukan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSchedules.map((sch) => {
            const vessel = vessels.find((v) => v.id === sch.vesselId);
            const route = routes.find((r) => r.id === sch.routeId);
            const originPort = ports.find((p) => p.id === route?.originPortId);
            const destPort = ports.find((p) => p.id === route?.destinationPortId);

            return (
              <div
                key={sch.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all space-y-6"
              >
                {/* Card Top Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
                      <Ship className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">
                          {vessel?.name || 'Kapal Samudra'}
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold">
                          {sch.voyageNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        IMO: {vessel?.imoNumber || '-'} • Type: {vessel?.vesselType || 'Container'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        sch.currentStatus === 'In Transit'
                          ? 'bg-blue-100 text-blue-700'
                          : sch.currentStatus === 'Loading' || sch.currentStatus === 'Scheduled'
                          ? 'bg-amber-100 text-amber-800'
                          : sch.currentStatus === 'Delayed'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {sch.currentStatus}
                    </span>

                    <button
                      onClick={() => openEditModal(sch)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
                      title="Edit Status / Lokasi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(sch.id)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600 transition-all cursor-pointer"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Route Waypoint Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60">
                  {/* Origin */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pelabuhan Asal (ETD)
                    </span>
                    <div className="text-sm font-bold text-slate-900">
                      {originPort?.name || 'Pelabuhan Asal'} ({originPort?.code || 'ORIGIN'})
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {new Date(sch.etd).toLocaleString('id-ID')}
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-2 text-center">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Progres Rute</span>
                      <span>{sch.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${sch.progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
                      <Compass className="w-3 h-3 text-blue-600" />
                      <span>{sch.currentCoordinates}</span>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="space-y-1 md:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pelabuhan Tujuan (ETA)
                    </span>
                    <div className="text-sm font-bold text-slate-900">
                      {destPort?.name || 'Pelabuhan Tujuan'} ({destPort?.code || 'DEST'})
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {new Date(sch.eta).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-cyan-600" />
                    <span>Cuaca Pelayaran: <strong>{sch.weatherCondition}</strong></span>
                  </div>

                  {sch.notes && (
                    <div className="text-slate-500 italic">
                      "{sch.notes}"
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingSchedule ? 'Update Jadwal & Lokasi Kapal' : 'Buat Jadwal Pelayaran Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor Voyage
                  </label>
                  <input
                    type="text"
                    required
                    value={voyageNumber}
                    onChange={(e) => setVoyageNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pilih Kapal
                  </label>
                  <select
                    value={vesselId}
                    onChange={(e) => setVesselId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    {vessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.imoNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rute Pelayaran
                </label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} ({r.distanceNauticalMiles} NM)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estimasi Departure (ETD)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={etd}
                    onChange={(e) => setEtd(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estimasi Arrival (ETA)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Pelayaran
                  </label>
                  <select
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Loading">Loading at Port</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Progres (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Koordinat & Deskripsi Lokasi Terkini
                </label>
                <input
                  type="text"
                  required
                  value={currentCoordinates}
                  onChange={(e) => setCurrentCoordinates(e.target.value)}
                  placeholder="Contoh: 05°45'S 108°12'E (Laut Jawa)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kondisi Cuaca
                </label>
                <select
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="Calm Sea">Calm Sea (Tenang)</option>
                  <option value="Moderate Waves">Moderate Waves (Gelombang Sedang)</option>
                  <option value="Rough Sea">Rough Sea (Gelombang Tinggi)</option>
                  <option value="Storm Warning">Storm Warning (Peringatan Badai)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan Operasional / Delay
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Instruksi kapten atau alasan keterlambatan..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Simpan...' : 'Simpan Ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Route, Port } from '../../types';
import {
  Route as RouteIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Compass
} from 'lucide-react';

export const RouteMasterView: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [originPortId, setOriginPortId] = useState('');
  const [destinationPortId, setDestinationPortId] = useState('');
  const [distanceNauticalMiles, setDistanceNauticalMiles] = useState(450);
  const [estimatedTransitHours, setEstimatedTransitHours] = useState(30);
  const [baseFreightRateTeu, setBaseFreightRateTeu] = useState(5000000);
  const [baseFreightRateTon, setBaseFreightRateTon] = useState(250000);
  const [status, setStatus] = useState<'Active' | 'Suspended'>('Active');

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rtData, prtData] = await Promise.all([api.getRoutes(), api.getPorts()]);
      setRoutes(rtData);
      setPorts(prtData);
    } catch (err) {
      console.error('Error loading routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingRoute(null);
    setCode('RT-SBY-BLW');
    setOriginPortId(ports[1]?.id || '');
    setDestinationPortId(ports[3]?.id || '');
    setDistanceNauticalMiles(920);
    setEstimatedTransitHours(58);
    setBaseFreightRateTeu(9500000);
    setBaseFreightRateTon(450000);
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (r: Route) => {
    setEditingRoute(r);
    setCode(r.code);
    setOriginPortId(r.originPortId);
    setDestinationPortId(r.destinationPortId);
    setDistanceNauticalMiles(r.distanceNauticalMiles);
    setEstimatedTransitHours(r.estimatedTransitHours);
    setBaseFreightRateTeu(r.baseFreightRateTeu);
    setBaseFreightRateTon(r.baseFreightRateTon);
    setStatus(r.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Route> = {
        code,
        originPortId,
        destinationPortId,
        distanceNauticalMiles: Number(distanceNauticalMiles),
        estimatedTransitHours: Number(estimatedTransitHours),
        baseFreightRateTeu: Number(baseFreightRateTeu),
        baseFreightRateTon: Number(baseFreightRateTon),
        status
      };

      if (editingRoute) {
        await api.updateRoute(editingRoute.id, payload);
      } else {
        await api.createRoute(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data rute.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data rute pelayaran ini?')) {
      try {
        await api.deleteRoute(id);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus rute.');
      }
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const filteredRoutes = routes.filter((r) =>
    r.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <RouteIcon className="w-6 h-6 text-blue-600" />
            <span>Master Data Rute Pelayaran (Shipping Routes)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Penetapan rute, jarak nautical miles (NM), estimasi transit jam, dan tarif acuan kargo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rute Baru</span>
          </button>
        </div>
      </div>

      {/* Routes List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">
            Memuat rute dari database real...
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-sm">Tidak ada rute pelayaran ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Kode Rute</th>
                  <th className="py-3.5 px-4">Pelabuhan Asal & Tujuan</th>
                  <th className="py-3.5 px-4">Jarak Nautical Miles</th>
                  <th className="py-3.5 px-4">Estimasi Transit</th>
                  <th className="py-3.5 px-4">Tarif Dasar TEU</th>
                  <th className="py-3.5 px-4">Status Rute</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredRoutes.map((r) => {
                  const orig = ports.find((p) => p.id === r.originPortId);
                  const dest = ports.find((p) => p.id === r.destinationPortId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{r.code}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {orig?.name || 'Asal'} → {dest?.name || 'Tujuan'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ({orig?.code}) ke ({dest?.code})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">{r.distanceNauticalMiles} NM</td>
                      <td className="py-3.5 px-4 font-semibold">{r.estimatedTransitHours} Jam ({Math.round(r.estimatedTransitHours / 24 * 10) / 10} Hari)</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{formatRupiah(r.baseFreightRateTeu)}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(r)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRoute ? 'Edit Rute Pelayaran' : 'Tambah Rute Pelayaran Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kode Rute
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pelabuhan Asal
                  </label>
                  <select
                    value={originPortId}
                    onChange={(e) => setOriginPortId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pelabuhan Tujuan
                  </label>
                  <select
                    value={destinationPortId}
                    onChange={(e) => setDestinationPortId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jarak (Nautical Miles)
                  </label>
                  <input
                    type="number"
                    required
                    value={distanceNauticalMiles}
                    onChange={(e) => setDistanceNauticalMiles(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estimasi Jam Transit
                  </label>
                  <input
                    type="number"
                    required
                    value={estimatedTransitHours}
                    onChange={(e) => setEstimatedTransitHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tarif Dasar / TEU (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={baseFreightRateTeu}
                    onChange={(e) => setBaseFreightRateTeu(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Rute
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
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

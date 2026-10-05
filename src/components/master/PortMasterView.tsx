import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Port } from '../../types';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Anchor
} from 'lucide-react';

export const PortMasterView: React.FC = () => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [berthCount, setBerthCount] = useState(8);
  const [maxDraftMeters, setMaxDraftMeters] = useState(12.0);
  const [handlingCapacityTeu, setHandlingCapacityTeu] = useState(2000000);
  const [operationalStatus, setOperationalStatus] = useState<'Active' | 'High Traffic' | 'Maintenance'>('Active');

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getPorts();
      setPorts(data);
    } catch (err) {
      console.error('Error loading ports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingPort(null);
    setCode('IDBPN');
    setName('Pelabuhan Semayang Balikpapan');
    setCity('Balikpapan');
    setProvince('Kalimantan Timur');
    setBerthCount(6);
    setMaxDraftMeters(11.5);
    setHandlingCapacityTeu(1200000);
    setOperationalStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Port) => {
    setEditingPort(p);
    setCode(p.code);
    setName(p.name);
    setCity(p.city);
    setProvince(p.province);
    setBerthCount(p.berthCount);
    setMaxDraftMeters(p.maxDraftMeters);
    setHandlingCapacityTeu(p.handlingCapacityTeu);
    setOperationalStatus(p.operationalStatus);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Port> = {
        code,
        name,
        city,
        province,
        berthCount: Number(berthCount),
        maxDraftMeters: Number(maxDraftMeters),
        handlingCapacityTeu: Number(handlingCapacityTeu),
        operationalStatus
      };

      if (editingPort) {
        await api.updatePort(editingPort.id, payload);
      } else {
        await api.createPort(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data pelabuhan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pelabuhan ini?')) {
      try {
        await api.deletePort(id);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus pelabuhan.');
      }
    }
  };

  const filteredPorts = ports.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span>Master Data Pelabuhan (Port Terminals)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan infrastruktur pelabuhan, UN/LOCODE, draft kedalaman laut, dan jumlah dermaga.
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
            <span>Tambah Pelabuhan Baru</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Pelabuhan, Kode, Kota..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Total Pelabuhan: <span className="text-blue-600 font-mono">{filteredPorts.length}</span>
        </div>
      </div>

      {/* Ports Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">
            Memuat data pelabuhan dari database real...
          </div>
        ) : filteredPorts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Anchor className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-sm">Tidak ada pelabuhan ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Kode Port</th>
                  <th className="py-3.5 px-4">Nama Pelabuhan</th>
                  <th className="py-3.5 px-4">Kota / Provinsi</th>
                  <th className="py-3.5 px-4">Dermaga & Max Draft</th>
                  <th className="py-3.5 px-4">Kapasitas TEU/Tahun</th>
                  <th className="py-3.5 px-4">Status Operasional</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredPorts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{p.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4">{p.city}, {p.province}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold">{p.berthCount} Tambatan</span> • Draft {p.maxDraftMeters}m
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">{p.handlingCapacityTeu.toLocaleString('id-ID')} TEU</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.operationalStatus === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.operationalStatus === 'High Traffic'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.operationalStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                {editingPort ? 'Edit Pelabuhan' : 'Tambah Pelabuhan Baru'}
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
                    Kode UN/LOCODE
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Pelabuhan
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kota
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jumlah Dermaga
                  </label>
                  <input
                    type="number"
                    required
                    value={berthCount}
                    onChange={(e) => setBerthCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Max Draft (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={maxDraftMeters}
                    onChange={(e) => setMaxDraftMeters(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={operationalStatus}
                    onChange={(e) => setOperationalStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="High Traffic">High Traffic</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kapasitas Handling (TEU/Tahun)
                </label>
                <input
                  type="number"
                  required
                  value={handlingCapacityTeu}
                  onChange={(e) => setHandlingCapacityTeu(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
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

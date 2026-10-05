import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Vessel } from '../../types';
import {
  Ship,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const VesselMasterView: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);

  // Form State
  const [imoNumber, setImoNumber] = useState('');
  const [name, setName] = useState('');
  const [vesselType, setVesselType] = useState<'Container Ship' | 'Bulk Carrier' | 'Tanker' | 'Ro-Ro Cargo'>('Container Ship');
  const [capacityDwt, setCapacityDwt] = useState(25000);
  const [capacityTeu, setCapacityTeu] = useState(1800);
  const [flag, setFlag] = useState('Indonesia');
  const [yearBuilt, setYearBuilt] = useState(2020);
  const [status, setStatus] = useState<'At Sea' | 'In Transit' | 'At Berth' | 'In Anchorage' | 'Under Maintenance'>('At Sea');
  const [fuelEfficiency, setFuelEfficiency] = useState(38.0);
  const [ownerCompany, setOwnerCompany] = useState('PT Pelayaran Samudra');

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getVessels();
      setVessels(data);
    } catch (err) {
      console.error('Error loading vessels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingVessel(null);
    setImoNumber(`IMO ${Math.floor(9000000 + Math.random() * 900000)}`);
    setName('KM Nusantara Line');
    setVesselType('Container Ship');
    setCapacityDwt(30000);
    setCapacityTeu(2000);
    setFlag('Indonesia');
    setYearBuilt(2021);
    setStatus('At Berth');
    setFuelEfficiency(40.0);
    setOwnerCompany('PT Samudra Logistics');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vessel) => {
    setEditingVessel(v);
    setImoNumber(v.imoNumber);
    setName(v.name);
    setVesselType(v.vesselType);
    setCapacityDwt(v.capacityDwt);
    setCapacityTeu(v.capacityTeu);
    setFlag(v.flag);
    setYearBuilt(v.yearBuilt);
    setStatus(v.status);
    setFuelEfficiency(v.fuelEfficiency);
    setOwnerCompany(v.ownerCompany);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Vessel> = {
        imoNumber,
        name,
        vesselType,
        capacityDwt: Number(capacityDwt),
        capacityTeu: Number(capacityTeu),
        flag,
        yearBuilt: Number(yearBuilt),
        status,
        fuelEfficiency: Number(fuelEfficiency),
        currentSpeedKnots: status === 'At Sea' ? 16.5 : 0.0,
        ownerCompany
      };

      if (editingVessel) {
        await api.updateVessel(editingVessel.id, payload);
      } else {
        await api.createVessel(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data kapal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data kapal ini dari database?')) {
      try {
        await api.deleteVessel(id);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus kapal.');
      }
    }
  };

  const filteredVessels = vessels.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.imoNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.ownerCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Ship className="w-6 h-6 text-blue-600" />
            <span>Master Data Kapal (Armada Pelayaran)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan spesifikasi teknis, IMO number, kapasitas DWT/TEU, dan kepemilikan kapal.
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
            <span>Tambah Kapal Baru</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama Kapal, Nomor IMO, Pemilik..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="text-xs font-bold text-slate-500">
          Total Armada: <span className="text-blue-600 font-mono">{filteredVessels.length} Kapal</span>
        </div>
      </div>

      {/* Vessel Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-slate-500">
          Memuat data kapal dari database real...
        </div>
      ) : filteredVessels.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500 space-y-2">
          <Ship className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-sm">Tidak ada data kapal ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredVessels.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all space-y-4 relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                      {v.imoNumber}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">{v.name}</h3>
                    <p className="text-xs text-slate-500">{v.ownerCompany}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      v.status === 'At Sea'
                        ? 'bg-blue-100 text-blue-700'
                        : v.status === 'At Berth'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans uppercase">Tipe Kapal</span>
                    <span className="font-bold text-slate-800">{v.vesselType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans uppercase">Bendera</span>
                    <span className="font-bold text-slate-800">{v.flag}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans uppercase">Kapasitas TEU</span>
                    <span className="font-bold text-slate-800">{v.capacityTeu} TEU</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans uppercase">Tonase (DWT)</span>
                    <span className="font-bold text-slate-800">{v.capacityDwt.toLocaleString('id-ID')} DWT</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 text-[11px]">Tahun {v.yearBuilt}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(v)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 transition-all cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingVessel ? 'Edit Data Kapal' : 'Tambah Kapal Baru'}
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
                    IMO Number
                  </label>
                  <input
                    type="text"
                    required
                    value={imoNumber}
                    onChange={(e) => setImoNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Kapal
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
                    Jenis Kapal
                  </label>
                  <select
                    value={vesselType}
                    onChange={(e) => setVesselType(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Container Ship">Container Ship</option>
                    <option value="Bulk Carrier">Bulk Carrier</option>
                    <option value="Tanker">Tanker</option>
                    <option value="Ro-Ro Cargo">Ro-Ro Cargo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pemilik / Armador
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerCompany}
                    onChange={(e) => setOwnerCompany(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kapasitas DWT (Ton)
                  </label>
                  <input
                    type="number"
                    required
                    value={capacityDwt}
                    onChange={(e) => setCapacityDwt(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kapasitas TEU
                  </label>
                  <input
                    type="number"
                    required
                    value={capacityTeu}
                    onChange={(e) => setCapacityTeu(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bendera
                  </label>
                  <input
                    type="text"
                    required
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tahun Buat
                  </label>
                  <input
                    type="number"
                    required
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Operasi
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="At Sea">At Sea</option>
                    <option value="In Transit">In Transit</option>
                    <option value="At Berth">At Berth</option>
                    <option value="In Anchorage">In Anchorage</option>
                    <option value="Under Maintenance">Under Maintenance</option>
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

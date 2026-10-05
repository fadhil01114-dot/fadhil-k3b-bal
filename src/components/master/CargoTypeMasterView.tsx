import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CargoType } from '../../types';
import {
  PackageCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Thermometer,
  ShieldAlert
} from 'lucide-react';

export const CargoTypeMasterView: React.FC = () => {
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargoType, setEditingCargoType] = useState<CargoType | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Dry Container' | 'Reefer Container' | 'Hazardous HAZMAT' | 'General Bulk' | 'Liquid Bulk'>('Dry Container');
  const [unit, setUnit] = useState<'TEU' | 'Metric Ton' | 'CBM'>('TEU');
  const [handlingFeePerUnit, setHandlingFeePerUnit] = useState(1000000);
  const [temperatureRequired, setTemperatureRequired] = useState('');
  const [hazmatClass, setHazmatClass] = useState('');

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getCargoTypes();
      setCargoTypes(data);
    } catch (err) {
      console.error('Error loading cargo types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingCargoType(null);
    setCode(`CRG-${Math.floor(100 + Math.random() * 900)}`);
    setName('Special Open Top Container 20ft');
    setCategory('Dry Container');
    setUnit('TEU');
    setHandlingFeePerUnit(1800000);
    setTemperatureRequired('');
    setHazmatClass('');
    setIsModalOpen(true);
  };

  const openEditModal = (ct: CargoType) => {
    setEditingCargoType(ct);
    setCode(ct.code);
    setName(ct.name);
    setCategory(ct.category);
    setUnit(ct.unit);
    setHandlingFeePerUnit(ct.handlingFeePerUnit);
    setTemperatureRequired(ct.temperatureRequired || '');
    setHazmatClass(ct.hazmatClass || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<CargoType> = {
        code,
        name,
        category,
        unit,
        handlingFeePerUnit: Number(handlingFeePerUnit),
        temperatureRequired,
        hazmatClass
      };

      if (editingCargoType) {
        await api.updateCargoType(editingCargoType.id, payload);
      } else {
        await api.createCargoType(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan jenis kargo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data jenis kargo ini?')) {
      try {
        await api.deleteCargoType(id);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus jenis kargo.');
      }
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const filteredCargoTypes = cargoTypes.filter((ct) =>
    ct.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ct.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-blue-600" />
            <span>Master Data Jenis & Spesifikasi Kargo</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengaturan kategori kargo, standar penanganan reefer/pendingin, kelas HAZMAT, dan tarif handling port.
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
            <span>Tambah Jenis Kargo</span>
          </button>
        </div>
      </div>

      {/* Cargo Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCargoTypes.map((ct) => (
          <div
            key={ct.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                    {ct.code}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">{ct.name}</h3>
                  <p className="text-xs text-slate-500">Satuan Satuan: {ct.unit}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  {ct.category}
                </span>
              </div>

              {ct.temperatureRequired && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-50 border border-cyan-100 text-xs text-cyan-900 font-semibold">
                  <Thermometer className="w-4 h-4 text-cyan-600" />
                  <span>Suhu: {ct.temperatureRequired}</span>
                </div>
              )}

              {ct.hazmatClass && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-900 font-semibold">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Hazmat: {ct.hazmatClass}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Handling Fee</span>
                <span className="font-extrabold text-slate-900 font-mono">{formatRupiah(ct.handlingFeePerUnit)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(ct)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(ct.id)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCargoType ? 'Edit Jenis Kargo' : 'Tambah Jenis Kargo Baru'}
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
                    Kode Jenis Kargo
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
                    Nama Kargo
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
                    Kategori Kargo
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Dry Container">Dry Container</option>
                    <option value="Reefer Container">Reefer Container</option>
                    <option value="Hazardous HAZMAT">Hazardous HAZMAT</option>
                    <option value="General Bulk">General Bulk</option>
                    <option value="Liquid Bulk">Liquid Bulk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Satuan
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="TEU">TEU (Peti Kemas)</option>
                    <option value="Metric Ton">Metric Ton</option>
                    <option value="CBM">CBM (M3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Handling Fee / Unit (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={handlingFeePerUnit}
                  onChange={(e) => setHandlingFeePerUnit(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Suhu Kontrol (Opsional Reefer)
                </label>
                <input
                  type="text"
                  value={temperatureRequired}
                  onChange={(e) => setTemperatureRequired(e.target.value)}
                  placeholder="Contoh: -18°C s/d -22°C"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Klasifikasi HAZMAT (Opsional)
                </label>
                <input
                  type="text"
                  value={hazmatClass}
                  onChange={(e) => setHazmatClass(e.target.value)}
                  placeholder="Contoh: Class 3 Flammable Liquid"
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

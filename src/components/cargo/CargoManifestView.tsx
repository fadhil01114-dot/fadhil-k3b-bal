import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CargoBooking, Customer, Schedule, CargoType, Port } from '../../types';
import {
  Box,
  Plus,
  Search,
  FileText,
  Printer,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Package,
  Container,
  ShieldCheck,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export const CargoManifestView: React.FC = () => {
  const [bookings, setBookings] = useState<CargoBooking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<CargoBooking | null>(null);
  const [viewingBl, setViewingBl] = useState<CargoBooking | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [cargoTypeId, setCargoTypeId] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [weightTons, setWeightTons] = useState(15.0);
  const [volumeCbm, setVolumeCbm] = useState(38.0);
  const [goodsDescription, setGoodsDescription] = useState('');
  const [loadingPortId, setLoadingPortId] = useState('');
  const [dischargePortId, setDischargePortId] = useState('');
  const [freightChargeRp, setFreightChargeRp] = useState(12000000);
  const [shippingStatus, setShippingStatus] = useState<'Booked' | 'Loaded at Port' | 'In Transit' | 'Discharged' | 'Delivered'>('Booked');

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bkgData, cstData, schData, crgData, prtData] = await Promise.all([
        api.getBookings(),
        api.getCustomers(),
        api.getSchedules(),
        api.getCargoTypes(),
        api.getPorts()
      ]);
      setBookings(bkgData);
      setCustomers(cstData);
      setSchedules(schData);
      setCargoTypes(crgData);
      setPorts(prtData);
    } catch (err) {
      console.error('Error loading cargo manifests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingBooking(null);
    setCustomerId(customers[0]?.id || '');
    setScheduleId(schedules[0]?.id || '');
    setCargoTypeId(cargoTypes[0]?.id || '');
    setContainerNumber(`TGHU-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(Math.random() * 9)}`);
    setSealNumber(`SL-${Math.floor(100000 + Math.random() * 900000)}`);
    setQuantity(2);
    setWeightTons(28.5);
    setVolumeCbm(72.0);
    setGoodsDescription('Komoditas & Produk Manufaktur Export');
    setLoadingPortId(ports[0]?.id || '');
    setDischargePortId(ports[1]?.id || '');
    setFreightChargeRp(15000000);
    setShippingStatus('Booked');
    setIsModalOpen(true);
  };

  const openEditModal = (bkg: CargoBooking) => {
    setEditingBooking(bkg);
    setCustomerId(bkg.customerId);
    setScheduleId(bkg.scheduleId);
    setCargoTypeId(bkg.cargoTypeId);
    setContainerNumber(bkg.containerNumber);
    setSealNumber(bkg.sealNumber);
    setQuantity(bkg.quantity);
    setWeightTons(bkg.weightTons);
    setVolumeCbm(bkg.volumeCbm);
    setGoodsDescription(bkg.goodsDescription);
    setLoadingPortId(bkg.loadingPortId);
    setDischargePortId(bkg.dischargePortId);
    setFreightChargeRp(bkg.freightChargeRp);
    setShippingStatus(bkg.shippingStatus);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<CargoBooking> = {
        customerId,
        scheduleId,
        cargoTypeId,
        containerNumber,
        sealNumber,
        quantity: Number(quantity),
        weightTons: Number(weightTons),
        volumeCbm: Number(volumeCbm),
        goodsDescription,
        loadingPortId,
        dischargePortId,
        freightChargeRp: Number(freightChargeRp),
        shippingStatus,
        paymentStatus: editingBooking ? editingBooking.paymentStatus : 'Unpaid',
        bookingDate: editingBooking ? editingBooking.bookingDate : new Date().toISOString()
      };

      if (editingBooking) {
        await api.updateBooking(editingBooking.id, payload);
      } else {
        await api.createBooking(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan booking kargo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus manifest booking kargo ini?')) {
      try {
        await api.deleteBooking(id);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus kargo.');
      }
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const filteredBookings = bookings.filter((bkg) => {
    const customer = customers.find((c) => c.id === bkg.customerId);
    const matchesSearch =
      bkg.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bkg.blNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bkg.containerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer && customer.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || bkg.shippingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Box className="w-6 h-6 text-blue-600" />
            <span>Manajemen Kargo & Manifes (Bill of Lading)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan dokumen B/L, registrasi container, seal number, serta status muatan kargo kapal.
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
            <span>Pemesanan Kargo Baru</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari B/L No, Container, Pelanggan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Booked', 'Loaded at Port', 'In Transit', 'Discharged', 'Delivered'].map((st) => (
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

      {/* Manifest Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">
            Memuat data manifest kargo dari database real...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Container className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-sm">Tidak ada manifes kargo ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">No. B/L & Booking</th>
                  <th className="py-3.5 px-4">Pelanggan (Shipper)</th>
                  <th className="py-3.5 px-4">Container & Seal</th>
                  <th className="py-3.5 px-4">Spesifikasi Kargo</th>
                  <th className="py-3.5 px-4">Pelabuhan Muat & Bongkar</th>
                  <th className="py-3.5 px-4">Status Pengiriman</th>
                  <th className="py-3.5 px-4 text-right">Freight Rate</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredBookings.map((bkg) => {
                  const customer = customers.find((c) => c.id === bkg.customerId);
                  const cargoType = cargoTypes.find((ct) => ct.id === bkg.cargoTypeId);
                  const loadPort = ports.find((p) => p.id === bkg.loadingPortId);
                  const disPort = ports.find((p) => p.id === bkg.dischargePortId);

                  return (
                    <tr key={bkg.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        <div>{bkg.blNumber}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{bkg.bookingNumber}</div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{customer?.companyName || '-'}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{customer?.code}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{bkg.containerNumber}</div>
                        <div className="text-[10px] text-emerald-700 font-mono">Seal: {bkg.sealNumber}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{cargoType?.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {bkg.quantity} Unit • {bkg.weightTons} Tons • {bkg.volumeCbm} CBM
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          {loadPort?.code || 'POL'} → {disPort?.code || 'POD'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {loadPort?.city} ke {disPort?.city}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            bkg.shippingStatus === 'In Transit'
                              ? 'bg-blue-100 text-blue-700'
                              : bkg.shippingStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {bkg.shippingStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                        {formatRupiah(bkg.freightChargeRp)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewingBl(bkg)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-blue-600 transition-all cursor-pointer"
                            title="Cetak Bill of Lading (B/L)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(bkg)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer"
                            title="Edit Manifest"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(bkg.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 transition-all cursor-pointer"
                            title="Hapus"
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

      {/* Bill of Lading Printable Modal */}
      {viewingBl && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">BILL OF LADING (B/L)</h3>
                  <p className="text-xs text-slate-500">Official Maritime Transport Document</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={() => setViewingBl(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* B/L Document Body */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6 text-xs text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="text-sm font-black text-blue-900">NAUTICALOG MARITIME LINE</div>
                  <div className="text-[10px] text-slate-500">International Sea Freight & Container Carrier</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-extrabold text-slate-900">{viewingBl.blNumber}</div>
                  <div className="text-[10px] text-slate-500">Ref: {viewingBl.bookingNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">SHIPPER / CUSTOMER</span>
                  <div className="font-bold text-slate-900 mt-1">
                    {customers.find((c) => c.id === viewingBl.customerId)?.companyName}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    NPWP: {customers.find((c) => c.id === viewingBl.customerId)?.npwp}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">VESSEL & VOYAGE</span>
                  <div className="font-bold text-slate-900 mt-1">
                    {schedules.find((s) => s.id === viewingBl.scheduleId)?.voyageNumber || 'VY-2026-088'}
                  </div>
                  <div className="text-slate-500 text-[11px]">Flag: Indonesia</div>
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PORT OF LOADING (POL)</span>
                  <div className="font-bold text-slate-900">
                    {ports.find((p) => p.id === viewingBl.loadingPortId)?.name}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PORT OF DISCHARGE (POD)</span>
                  <div className="font-bold text-slate-900">
                    {ports.find((p) => p.id === viewingBl.dischargePortId)?.name}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">CONTAINER & CARGO SPECIFICATION</span>
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between font-mono font-bold text-slate-900">
                    <span>No. Container: {viewingBl.containerNumber}</span>
                    <span>Seal No: {viewingBl.sealNumber}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{viewingBl.goodsDescription}</p>
                  <div className="flex gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
                    <span>Qty: {viewingBl.quantity} TEU</span>
                    <span>Weight: {viewingBl.weightTons} Tons</span>
                    <span>Volume: {viewingBl.volumeCbm} CBM</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">PAYMENT STATUS</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                    {viewingBl.paymentStatus}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">FREIGHT AMOUNT</span>
                  <span className="font-extrabold text-sm text-slate-900 font-mono">
                    {formatRupiah(viewingBl.freightChargeRp)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBooking ? 'Edit Manifest Kargo' : 'Tambah Pemesanan Kargo Baru'}
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
                  Pelanggan / Shipper
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jadwal Pelayaran (Voyage)
                  </label>
                  <select
                    value={scheduleId}
                    onChange={(e) => setScheduleId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.voyageNumber} ({s.currentStatus})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jenis Kargo
                  </label>
                  <select
                    value={cargoTypeId}
                    onChange={(e) => setCargoTypeId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    {cargoTypes.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor Container
                  </label>
                  <input
                    type="text"
                    required
                    value={containerNumber}
                    onChange={(e) => setContainerNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor Segel (Seal No.)
                  </label>
                  <input
                    type="text"
                    required
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jumlah TEU/Unit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Berat (Tons)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightTons}
                    onChange={(e) => setWeightTons(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Volume (CBM)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={volumeCbm}
                    onChange={(e) => setVolumeCbm(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pelabuhan Muat (POL)
                  </label>
                  <select
                    value={loadingPortId}
                    onChange={(e) => setLoadingPortId(e.target.value)}
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
                    Pelabuhan Bongkar (POD)
                  </label>
                  <select
                    value={dischargePortId}
                    onChange={(e) => setDischargePortId(e.target.value)}
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi Kargo & Muatan
                </label>
                <input
                  type="text"
                  required
                  value={goodsDescription}
                  onChange={(e) => setGoodsDescription(e.target.value)}
                  placeholder="Deskripsi barang secara spesifik..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Freight Charge (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={freightChargeRp}
                    onChange={(e) => setFreightChargeRp(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Pengiriman
                  </label>
                  <select
                    value={shippingStatus}
                    onChange={(e) => setShippingStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Booked">Booked</option>
                    <option value="Loaded at Port">Loaded at Port</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Discharged">Discharged</option>
                    <option value="Delivered">Delivered</option>
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

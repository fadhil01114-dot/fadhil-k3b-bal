import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CargoBooking, Schedule, Vessel, Customer, Invoice } from '../../types';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Ship,
  Box,
  DollarSign,
  CheckCircle2,
  Filter,
  RefreshCw
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState<'manifest' | 'operational' | 'financial'>('manifest');
  const [bookings, setBookings] = useState<CargoBooking[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bkgData, schData, vslData, cstData, invData] = await Promise.all([
        api.getBookings(),
        api.getSchedules(),
        api.getVessels(),
        api.getCustomers(),
        api.getInvoices()
      ]);
      setBookings(bkgData);
      setSchedules(schData);
      setVessels(vslData);
      setCustomers(cstData);
      setInvoices(invData);
    } catch (err) {
      console.error('Error loading report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>Laporan Bisnis & Ringkasan Operasional</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Laporan resmi manifest kargo, utility kapal, dan rekapitulasi pendapatan transaksi angkutan laut.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintReport}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setReportType('manifest')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            reportType === 'manifest'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Laporan Manifes Kargo
        </button>

        <button
          onClick={() => setReportType('operational')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            reportType === 'operational'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Laporan Performa Operasional Kapal
        </button>

        <button
          onClick={() => setReportType('financial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            reportType === 'financial'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Laporan Keuangan & Pendapatan
        </button>
      </div>

      {/* Printable Report Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              {reportType === 'manifest'
                ? 'LAPORAN MANIFES MUATAN KARGO KAPAL'
                : reportType === 'operational'
                ? 'LAPORAN UTILITAS & PERFORMA ARMADA'
                : 'LAPORAN REKAPITULASI PENDAPATAN TRANSAKSI'}
            </h3>
            <p className="text-xs text-slate-500">PT NauticaLog Angkutan Laut Enterprise • Real DB Export</p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            Dicetak: {new Date().toLocaleString('id-ID')}
          </div>
        </div>

        {reportType === 'manifest' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">No. B/L</th>
                  <th className="py-2.5 px-3">Shipper</th>
                  <th className="py-2.5 px-3">Container No.</th>
                  <th className="py-2.5 px-3">Muatan & Deskripsi</th>
                  <th className="py-2.5 px-3">Berat (Ton)</th>
                  <th className="py-2.5 px-3">Freight (Rp)</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {bookings.map((bkg) => {
                  const cust = customers.find((c) => c.id === bkg.customerId);
                  return (
                    <tr key={bkg.id}>
                      <td className="py-2.5 px-3 font-mono font-bold">{bkg.blNumber}</td>
                      <td className="py-2.5 px-3">{cust?.companyName}</td>
                      <td className="py-2.5 px-3 font-mono">{bkg.containerNumber}</td>
                      <td className="py-2.5 px-3">{bkg.goodsDescription}</td>
                      <td className="py-2.5 px-3 font-mono">{bkg.weightTons}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{formatRupiah(bkg.freightChargeRp)}</td>
                      <td className="py-2.5 px-3 font-bold text-blue-700">{bkg.shippingStatus}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'operational' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">Nama Kapal</th>
                  <th className="py-2.5 px-3">IMO Number</th>
                  <th className="py-2.5 px-3">Tipe & Kapasitas TEU</th>
                  <th className="py-2.5 px-3">Efisiensi Bahan Bakar</th>
                  <th className="py-2.5 px-3">Status Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {vessels.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2.5 px-3 font-bold">{v.name}</td>
                    <td className="py-2.5 px-3 font-mono">{v.imoNumber}</td>
                    <td className="py-2.5 px-3">{v.vesselType} ({v.capacityTeu} TEU)</td>
                    <td className="py-2.5 px-3 font-mono">{v.fuelEfficiency} Liters/NM</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{v.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'financial' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">No. Invoice</th>
                  <th className="py-2.5 px-3">Pelanggan</th>
                  <th className="py-2.5 px-3">Subtotal</th>
                  <th className="py-2.5 px-3">PPN 11%</th>
                  <th className="py-2.5 px-3">Total Tagihan</th>
                  <th className="py-2.5 px-3">Status Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {invoices.map((inv) => {
                  const cust = customers.find((c) => c.id === inv.customerId);
                  return (
                    <tr key={inv.id}>
                      <td className="py-2.5 px-3 font-mono font-bold">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3">{cust?.companyName}</td>
                      <td className="py-2.5 px-3 font-mono">{formatRupiah(inv.subtotalRp)}</td>
                      <td className="py-2.5 px-3 font-mono">{formatRupiah(inv.taxAmountRp)}</td>
                      <td className="py-2.5 px-3 font-mono font-extrabold">{formatRupiah(inv.totalAmountRp)}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">{inv.paymentStatus}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

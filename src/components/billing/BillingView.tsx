import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Invoice, Customer, CargoBooking } from '../../types';
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  DollarSign,
  CreditCard
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<CargoBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [invData, cstData, bkgData] = await Promise.all([
        api.getInvoices(),
        api.getCustomers(),
        api.getBookings()
      ]);
      setInvoices(invData);
      setCustomers(cstData);
      setBookings(bkgData);
    } catch (err) {
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkPaid = async (inv: Invoice) => {
    if (confirm(`Konfirmasi pelunasan invoice ${inv.invoiceNumber}?`)) {
      try {
        await api.updateInvoice(inv.id, {
          paymentStatus: 'Paid',
          paymentMethod: 'Bank Transfer Escrow',
          paidAt: new Date().toISOString()
        });

        // Also update associated booking payment status
        const booking = bookings.find((b) => b.id === inv.bookingId);
        if (booking) {
          await api.updateBooking(booking.id, { paymentStatus: 'Paid' });
        }

        await loadData();
      } catch (err: any) {
        alert(err.message || 'Gagal mengubah status invoice.');
      }
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const customer = customers.find((c) => c.id === inv.customerId);
    return (
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer && customer.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" />
            <span>Invoicing & Transaksi Tagihan Freight</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Penagihan otomatis, kalkulasi PPN 11%, demurrage, dan status pembayaran escrow.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">
            Memuat transaksi tagihan dari database real...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="font-semibold text-sm">Tidak ada tagihan invoice ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">No. Invoice</th>
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Tanggal & Jatuh Tempo</th>
                  <th className="py-3.5 px-4">Subtotal & PPN 11%</th>
                  <th className="py-3.5 px-4">Total Tagihan</th>
                  <th className="py-3.5 px-4">Status Pembayaran</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredInvoices.map((inv) => {
                  const customer = customers.find((c) => c.id === inv.customerId);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{customer?.companyName || '-'}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        <div>Terbit: {new Date(inv.issueDate).toLocaleDateString('id-ID')}</div>
                        <div className="text-slate-400">Jatuh Tempo: {new Date(inv.dueDate).toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div>Subtotal: {formatRupiah(inv.subtotalRp)}</div>
                        <div className="text-[10px] text-slate-400">PPN 11%: {formatRupiah(inv.taxAmountRp)}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 text-sm">
                        {formatRupiah(inv.totalAmountRp)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            inv.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {inv.paymentStatus !== 'Paid' ? (
                          <button
                            onClick={() => handleMarkPaid(inv)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                          >
                            Tandai Lunas
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                          </span>
                        )}
                      </td>
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

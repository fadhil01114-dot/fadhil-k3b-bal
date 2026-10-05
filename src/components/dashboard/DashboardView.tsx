import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AnalyticsSummary, Schedule, Vessel, CargoBooking, Port } from '../../types';
import {
  Ship,
  TrendingUp,
  Box,
  Clock,
  DollarSign,
  MapPin,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Compass,
  Anchor
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumData, schData, vslData, prtData] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getSchedules(),
        api.getVessels(),
        api.getPorts()
      ]);
      setSummary(sumData);
      setSchedules(schData);
      setVessels(vslData);
      setPorts(prtData);
    } catch (err) {
      console.error('Error loading dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Memuat Analitik Performa Operasional Real Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold border border-cyan-400/30">
            <Compass className="w-3.5 h-3.5" />
            <span>Dashboard Eksekutif Angkutan Laut</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Performa Armada & Kargo Real-time
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Pantau pergerakan kapal, tingkat utilitas muatan, efisiensi waktu berlabuh, serta status pendapatan transaksi dalam satu tampilan.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('tracking')}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Pelacakan Kapal Live</span>
          </button>
          <button
            onClick={() => onNavigate('cargo')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Booking Kargo</span>
          </button>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <Anchor className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Active Vessels */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Armada Beroperasi
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {summary?.activeVessels || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {summary?.totalVessels || 0} Kapal
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{Math.round(((summary?.activeVessels || 0) / (summary?.totalVessels || 1)) * 100)}% Utilitas Armada</span>
          </div>
        </div>

        {/* Card 2: Total Cargo Tonnes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Volume Kargo Terangkut
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {summary?.totalCargoTons.toLocaleString('id-ID') || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">Tonnes</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-indigo-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{summary?.totalCargoTeu || 0} TEU Peti Kemas</span>
          </div>
        </div>

        {/* Card 3: On-Time Arrival Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              On-Time Schedule (OTP)
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {summary?.onTimePercentage || 100}%
            </span>
            <span className="text-xs text-slate-500 font-medium">Ketepatan Rute</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span>{summary?.delayedSchedules || 0} Jadwal Tertunda Pasang Surut</span>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pendapatan Terbayar
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-900">
              {formatRupiah(summary?.totalRevenue || 0)}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-amber-600 font-semibold">
            Pending: {formatRupiah(summary?.pendingRevenue || 0)}
          </div>
        </div>

      </div>

      {/* Main Grid: Active Vessels Map Schedule & Port Traffic Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Ships Track List (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Posisi & Status Armada Pelayaran Terkini
              </h3>
              <p className="text-xs text-slate-500">
                Monitoring otomatis progress pelayaran, ETA, dan koordinat kapal.
              </p>
            </div>
            <button
              onClick={() => onNavigate('tracking')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Peta Lengkap</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {schedules.slice(0, 4).map((sch) => {
              const vessel = vessels.find((v) => v.id === sch.vesselId);
              return (
                <div
                  key={sch.id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <Ship className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{vessel?.name || 'KM Samudra'}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono">
                            {sch.voyageNumber}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sch.currentCoordinates}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold ${
                        sch.currentStatus === 'In Transit'
                          ? 'bg-blue-100 text-blue-700'
                          : sch.currentStatus === 'Loading' || sch.currentStatus === 'Scheduled'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {sch.currentStatus}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Progres Rute Pelayaran</span>
                      <span>{sch.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${sch.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Port Status & Traffic Overview (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Kepadatan Pelabuhan
            </h3>
            <p className="text-xs text-slate-500">
              Kapasitas tambat & draft maksimum.
            </p>
          </div>

          <div className="space-y-3">
            {ports.map((port) => (
              <div
                key={port.id}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{port.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {port.code} • {port.city}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {port.berthCount} Dermaga Tambat • Draft {port.maxDraftMeters}m
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    port.operationalStatus === 'High Traffic'
                      ? 'bg-rose-100 text-rose-700'
                      : port.operationalStatus === 'Maintenance'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {port.operationalStatus}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-blue-800">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Sistem Sumber Tunggal Kebenaran</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-700">
              Seluruh perubahan data dikirimkan langsung ke Express Database Server. Tanpa localStorage.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

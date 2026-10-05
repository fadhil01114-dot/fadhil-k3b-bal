import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabType } from './components/layout/Sidebar';

import { DashboardView } from './components/dashboard/DashboardView';
import { ShipTrackingView } from './components/tracking/ShipTrackingView';
import { CargoManifestView } from './components/cargo/CargoManifestView';

import { VesselMasterView } from './components/master/VesselMasterView';
import { PortMasterView } from './components/master/PortMasterView';
import { RouteMasterView } from './components/master/RouteMasterView';
import { CustomerMasterView } from './components/master/CustomerMasterView';
import { CargoTypeMasterView } from './components/master/CargoTypeMasterView';

import { BillingView } from './components/billing/BillingView';
import { ReportsView } from './components/reports/ReportsView';
import { SystemLogsView } from './components/logs/SystemLogsView';

const tabTitles: Record<TabType, string> = {
  dashboard: 'Dashboard Analitik Performa Operasional',
  tracking: 'Pelacakan Jadwal Kapal & Posisi Live',
  cargo: 'Manajemen Kargo & Manifes (Bill of Lading)',
  vessels: 'Master Data Kapal (Armada Pelayaran)',
  ports: 'Master Data Pelabuhan',
  routes: 'Master Data Rute Pelayaran',
  customers: 'Master Data Pelanggan (Shipper / Consignee)',
  cargoTypes: 'Master Data Jenis & Spesifikasi Kargo',
  billing: 'Transaksi Invoicing & Tagihan',
  reports: 'Laporan Bisnis & Ringkasan Operasional',
  logs: 'Audit Log & Riwayat Sistem'
};

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-600">Menghubungkan ke Real Database Server...</p>
        </div>
      </div>
    );
  }

  // Default view when unauthenticated is Login Form
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTabTitle={tabTitles[activeTab]}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && <DashboardView onNavigate={(t) => setActiveTab(t)} />}
          {activeTab === 'tracking' && <ShipTrackingView />}
          {activeTab === 'cargo' && <CargoManifestView />}
          {activeTab === 'vessels' && <VesselMasterView />}
          {activeTab === 'ports' && <PortMasterView />}
          {activeTab === 'routes' && <RouteMasterView />}
          {activeTab === 'customers' && <CustomerMasterView />}
          {activeTab === 'cargoTypes' && <CargoTypeMasterView />}
          {activeTab === 'billing' && <BillingView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'logs' && <SystemLogsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

import React from 'react';
import {
  LayoutDashboard,
  Navigation,
  Box,
  Layers,
  Anchor,
  MapPin,
  Route as RouteIcon,
  Users,
  PackageCheck,
  Receipt,
  FileSpreadsheet,
  Activity,
  Ship,
  ChevronRight
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'tracking'
  | 'cargo'
  | 'vessels'
  | 'ports'
  | 'routes'
  | 'customers'
  | 'cargoTypes'
  | 'billing'
  | 'reports'
  | 'logs';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile
}) => {
  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    if (isOpenMobile) onCloseMobile();
  };

  const menuGroups = [
    {
      title: 'UTAMA & OPERASIONAL',
      items: [
        { id: 'dashboard' as TabType, label: 'Dashboard Analitik', icon: LayoutDashboard },
        { id: 'tracking' as TabType, label: 'Jadwal & Pelacakan Kapal', icon: Navigation, badge: 'Live' },
        { id: 'cargo' as TabType, label: 'Kargo & Manifes (B/L)', icon: Box }
      ]
    },
    {
      title: 'MASTER DATA (CRUD)',
      items: [
        { id: 'vessels' as TabType, label: 'Data Kapal (Armada)', icon: Ship },
        { id: 'ports' as TabType, label: 'Data Pelabuhan', icon: MapPin },
        { id: 'routes' as TabType, label: 'Data Rute Pelayaran', icon: RouteIcon },
        { id: 'customers' as TabType, label: 'Data Pelanggan', icon: Users },
        { id: 'cargoTypes' as TabType, label: 'Jenis & Spesifikasi Kargo', icon: PackageCheck }
      ]
    },
    {
      title: 'TRANSAKSI & LAPORAN',
      items: [
        { id: 'billing' as TabType, label: 'Invoicing & Tagihan', icon: Receipt },
        { id: 'reports' as TabType, label: 'Laporan Bisnis & Export', icon: FileSpreadsheet },
        { id: 'logs' as TabType, label: 'Audit Log Sistem', icon: Activity }
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Ship className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight block">
                  NauticaLog
                </span>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                  Angkutan Laut Enterprise
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {menuGroups.map((group, idx) => (
              <div key={idx}>
                <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <Anchor className="w-3.5 h-3.5 text-blue-600" />
            <span>Versi Produksi v2.5 • Real DB Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};

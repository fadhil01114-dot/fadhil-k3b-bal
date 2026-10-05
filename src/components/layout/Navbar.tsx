import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Ship,
  Bell,
  Database,
  LogOut,
  User as UserIcon,
  Search,
  Shield,
  Menu,
  X,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  activeTabTitle: string;
  onSearchQueryChange?: (query: string) => void;
  onMobileMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTabTitle,
  onSearchQueryChange,
  onMobileMenuToggle
}) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearchQueryChange) {
      onSearchQueryChange(e.target.value);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Menu Trigger & Active Tab Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:inline">
            NauticaLog /
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {activeTabTitle}
          </h1>
        </div>
      </div>

      {/* Center: Global Quick Search */}
      <div className="hidden md:flex items-center w-72 lg:w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchVal}
          onChange={handleSearchChange}
          placeholder="Cari IMO, Kapal, Pelabuhan, No. B/L..."
          className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200/60 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
        />
      </div>

      {/* Right: Database Status Badge, Notifications, & User Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Real DB Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-medium">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real Database API (Express/JSON)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-100 text-slate-600 transition-all relative cursor-pointer"
            title="Notifikasi Operasional"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Notifikasi Operasional
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  3 Baru
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="font-semibold text-slate-900">KM Nusantara Express IV</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Memasuki koordinat Laut Jawa. ETA 10:30 WIB Surabaya.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">10 menit yang lalu</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                  <div className="font-semibold">B/L BL-NLOG-88201 Lunas</div>
                  <p className="text-emerald-700 text-[11px] mt-0.5">Pembayaran PPN & Freight Charge diverifikasi.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="w-8 h-8 rounded-xl object-cover border border-slate-200 bg-slate-100"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                {user?.name}
              </div>
              <div className="text-[10px] text-blue-600 font-semibold truncate">
                {user?.role}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-fadeIn">
              <div className="p-3 bg-slate-50 rounded-xl mb-2 border border-slate-100">
                <div className="text-xs font-bold text-slate-900">{user?.name}</div>
                <div className="text-[11px] text-slate-500">{user?.email}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                  <Shield className="w-3 h-3 text-blue-600" />
                  <span>{user?.role}</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Sistem</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

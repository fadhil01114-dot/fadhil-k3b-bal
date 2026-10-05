import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Ship, Lock, User as UserIcon, Mail, Shield, AlertCircle, ArrowRight, CheckCircle2, Anchor } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form State
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [role, setRole] = useState<'Logistics Manager' | 'Port Supervisor' | 'Finance Admin'>('Logistics Manager');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(usernameOrEmail, password);
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa kembali username/email dan password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, username, password: regPassword, role });
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar akun baru.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (u: string, p: string) => {
    setUsernameOrEmail(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Sea Glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-70 pointer-events-none"></div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Brand & Live System Stats */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Anchor className="w-80 h-80 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <Ship className="w-7 h-7 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">NauticaLog</h1>
                <p className="text-xs text-blue-200 font-medium">Sistem Angkutan Laut Enterprise</p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Terhubung ke Real Database API
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Manajemen Angkutan Laut & Pelacakan Kargo Real-time
              </h2>
              <p className="text-sm text-blue-100/80 leading-relaxed">
                Kelola jadwal armada kapal, manifes peti kemas, rute pelayaran, dan analitik operasional pelabuhan secara efisien dalam satu platform terintegrasi.
              </p>
            </div>
          </div>

          {/* Quick Feature Highlights */}
          <div className="space-y-3 pt-6 border-t border-white/10 text-xs text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>CRUD Master Data Kapal, Pelabuhan & Customer</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Pelacakan Jadwal Kapal & Bill of Lading (B/L)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Laporan Operasional & Transaksi Tagihan Ready Export</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            
            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isRegisterMode ? 'Registrasi Akun Operasional' : 'Masuk Administrator'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {isRegisterMode
                  ? 'Daftarkan akun staf baru untuk mengakses sistem angkutan laut.'
                  : 'Silakan masukkan username/email dan password admin Anda.'}
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {!isRegisterMode ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Username atau Email Admin
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="admin@maritime.co.id atau admin"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Password Admin
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Memproses Login...</span>
                  ) : (
                    <>
                      <span>Masuk ke Sistem</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Demo Quick Logins */}
                <div className="pt-6 border-t border-slate-100 mt-6">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Pilih Akun Demo Cepat (Siap Pengujian):
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => fillQuickLogin('admin', 'admin123')}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Super Admin</div>
                      <div className="text-[10px] text-slate-500 truncate">admin / admin123</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillQuickLogin('manager', 'manager123')}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Manager Logistik</div>
                      <div className="text-[10px] text-slate-500 truncate">manager / manager123</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillQuickLogin('portoper', 'port123')}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Supervisor Port</div>
                      <div className="text-[10px] text-slate-500 truncate">portoper / port123</div>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Capt. Herman Susilo"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Operasional
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="herman@maritime.co.id"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="hermans"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Jabatan / Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Logistics Manager">Logistics Manager</option>
                      <option value="Port Supervisor">Port Supervisor</option>
                      <option value="Finance Admin">Finance Admin</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {loading ? 'Daftar...' : 'Daftar Akun Baru'}
                </button>
              </form>
            )}

            {/* Toggle Mode Footer */}
            <div className="mt-6 text-center text-xs text-slate-500">
              {isRegisterMode ? (
                <p>
                  Sudah punya akun admin?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setError(null);
                    }}
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Kembali ke Form Login
                  </button>
                </p>
              ) : (
                <p>
                  Perlu membuat akun staf baru?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError(null);
                    }}
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Daftar Akun Operasional
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

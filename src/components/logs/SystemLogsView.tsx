import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { SystemLog } from '../../types';
import { Activity, RefreshCw, Shield, Clock } from 'lucide-react';

export const SystemLogsView: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getSystemLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <span>Audit Log Sistem & Operasional</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Jejak rekam aktivitas pengguna, pencatatan transaksi, dan riwayat CRUD database.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">
            Memuat audit log dari database real...
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-all flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

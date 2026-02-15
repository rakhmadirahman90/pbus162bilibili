import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Shield, 
  Search, 
  Terminal, 
  User, 
  Clock, 
  Database, 
  AlertCircle,
  Loader2,
  Trash2,
  Filter
} from 'lucide-react';

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    // Kita mengambil data dari audit_poin sebagai sumber log utama
    // Anda bisa menggabungkan dengan tabel log lain jika ada di masa depan
    const { data, error } = await supabase
      .from('audit_poin')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setLogs(data);
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => 
    log.atlet_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield size={20} className="text-white" />
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              SYSTEM <span className="text-blue-600">LOGS</span>
            </h1>
          </div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] ml-1">
            Security & Activity Monitoring Console
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Search by Admin or Athlete..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-600 outline-none transition-all text-xs font-bold shadow-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Terminal Style Container */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
        <div className="bg-black/40 px-8 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest text-center">Activity_Stream.sh</span>
          </div>
          <div className="w-12" /> {/* Spacer */}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Identity</th>
                <th className="px-8 py-5">Action / Target</th>
                <th className="px-8 py-5 text-right">Raw Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="animate-spin inline-block text-blue-600" size={30} />
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-blue-600/5 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3 text-zinc-500 text-[10px]">
                        <Clock size={12} className="text-blue-500/50" />
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-white uppercase">{log.admin_email.split('@')[0]}</p>
                          <p className="text-[9px] text-zinc-600 lowercase">{log.admin_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] bg-zinc-800/50 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 w-fit">
                          UPDATE_POINTS
                        </span>
                        <p className="text-[11px] font-bold text-zinc-300">
                          Target: <span className="text-white italic">{log.atlet_nama}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="inline-block text-[10px] text-zinc-500 bg-black/40 p-2 rounded-lg border border-white/5">
                        <span className={log.perubahan > 0 ? 'text-emerald-500' : 'text-red-500'}>
                          {log.perubahan > 0 ? `+${log.perubahan}` : log.perubahan}
                        </span>
                        <span className="mx-2">→</span>
                        <span className="text-white">{log.poin_sesudah} PTS</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-zinc-700 text-xs font-black uppercase tracking-widest">
                    No system activity detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 flex items-center justify-between px-4">
        <div className="flex items-center gap-4 text-zinc-600">
          <div className="flex items-center gap-2">
             <Database size={12} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Audit_Storage: Active</span>
          </div>
          <div className="flex items-center gap-2">
             <AlertCircle size={12} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Retention: 30 Days</span>
          </div>
        </div>
        <p className="text-[10px] font-black text-blue-900 uppercase">PB US 162 Security Engine</p>
      </div>
    </div>
  );
}
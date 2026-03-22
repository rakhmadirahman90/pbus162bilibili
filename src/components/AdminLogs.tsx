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
  RefreshCcw,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();

    // Realtime subscription agar log langsung muncul saat poin diubah di ManajemenPoin
    const channel = supabase
      .channel('audit-changes')
      .on('postgres_changes', { event: 'INSERT', table: 'audit_poin', schema: 'public' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_poin')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setLogs(data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.atlet_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tipe_kegiatan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -z-10" />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Shield size={20} className="text-white" />
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              SYSTEM <span className="text-blue-600">LOGS</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] ml-1">
               Security & Activity Monitoring
             </p>
             <button onClick={fetchLogs} className="text-blue-500 hover:text-blue-400 transition-colors">
               <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Cari Admin, Atlet, atau Tipe..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-600 outline-none transition-all text-xs font-bold shadow-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Terminal Style Container */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="bg-black/40 px-8 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-[0_0_8px_rgba(255,95,86,0.4)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-[0_0_8px_rgba(255,189,46,0.4)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-[0_0_8px_rgba(39,201,63,0.4)]" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Audit_Vault_v2.0.sh</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase">
            <Clock size={12} /> Live Updates Active
          </div>
        </div>

        <div className="overflow-x-auto text-nowrap">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-8 py-5">Date & Time</th>
                <th className="px-8 py-5">Authorized Admin</th>
                <th className="px-8 py-5">Operation</th>
                <th className="px-8 py-5">Target Athlete</th>
                <th className="px-8 py-5 text-right">Point Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Loader2 className="animate-spin inline-block text-blue-600" size={32} />
                    <p className="text-[10px] text-zinc-600 font-black mt-4 uppercase tracking-[0.3em]">Decoding Streams...</p>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-blue-600/[0.03] transition-all">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white text-[11px] font-bold">
                          {new Date(log.created_at).toLocaleTimeString('id-ID')}
                        </span>
                        <span className="text-zinc-600 text-[9px] uppercase font-black">
                          {new Date(log.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all border border-white/5">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-white uppercase tracking-tighter">
                            {log.admin_email.split('@')[0]}
                          </p>
                          <p className="text-[9px] text-zinc-600 lowercase">{log.admin_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter border ${
                          log.perubahan > 0 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {log.tipe_kegiatan || 'UPDATE_POINTS'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-[11px] font-bold text-white uppercase italic">
                         {log.atlet_nama}
                       </p>
                       <p className="text-[9px] text-zinc-600 font-black uppercase">ID: {log.atlet_id?.slice(0, 8)}...</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="inline-flex flex-col items-end">
                        <div className="flex items-center gap-2">
                          <span className={`text-[12px] font-black ${log.perubahan > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {log.perubahan > 0 ? (
                              <ArrowUpRight size={12} className="inline mr-1" />
                            ) : (
                              <ArrowDownRight size={12} className="inline mr-1" />
                            )}
                            {log.perubahan > 0 ? `+${log.perubahan.toLocaleString()}` : log.perubahan.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[9px] text-zinc-600 font-black uppercase">Final: {log.poin_sesudah?.toLocaleString()} PTS</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <Database size={40} />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Activity Logs</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6 text-zinc-600">
          <div className="flex items-center gap-2 group cursor-help">
             <Database size={12} className="group-hover:text-blue-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest">PostgreSQL Audit: Connected</span>
          </div>
          <div className="flex items-center gap-2 group cursor-help">
             <AlertCircle size={12} className="group-hover:text-amber-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Security Policy: Standard_162</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Zap size={14} className="text-blue-900 animate-pulse" />
           <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Engine Operating Nominally</p>
        </div>
      </div>
    </div>
  );
}
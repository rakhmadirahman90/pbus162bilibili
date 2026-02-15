import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { History, Shield, Clock, ArrowRight } from 'lucide-react';

export default function AuditLogPoin() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('audit_poin')
        .select('*')
        .order('waktu', { ascending: false })
        .limit(50);
      if (data) setLogs(data);
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
          <History className="text-blue-600" /> Audit <span className="text-blue-600">Log Poin</span>
        </h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Riwayat Perubahan Manual oleh Administrator</p>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900/50 border-b border-zinc-800">
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Waktu</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Admin</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Atlet</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Perubahan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 text-xs text-zinc-400 font-mono">
                  {new Date(log.waktu).toLocaleString('id-ID')}
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <Shield size={12} className="text-blue-500" />
                    <span className="text-xs font-bold">{log.admin_email}</span>
                  </div>
                </td>
                <td className="p-6 text-sm font-black uppercase tracking-tight">{log.atlet_nama}</td>
                <td className="p-6">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-zinc-500 text-[10px]">{log.poin_sebelum}</span>
                    <ArrowRight size={12} className="text-zinc-700" />
                    <span className={`font-black text-sm ${log.perubahan > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {log.poin_sesudah} 
                      <small className="ml-1 opacity-60">({log.perubahan > 0 ? '+' : ''}{log.perubahan})</small>
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
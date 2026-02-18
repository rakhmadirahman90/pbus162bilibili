import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Trophy, Plus, Minus, Search, User, Loader2, 
  ChevronLeft, ChevronRight, Zap, CheckCircle2, Sparkles, RefreshCcw, AlertTriangle, History, ChevronDown, ChevronUp
} from 'lucide-react';

export default function ManajemenPoin() {
  const [atlets, setAtlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [histories, setHistories] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAtlets();
  }, []);

  const fetchAtlets = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from('pendaftaran').select('*').order('nama', { ascending: true });
      const { data: stats } = await supabase.from('atlet_stats').select('*');
      const merged = (profiles || []).map(p => {
        const statMatch = stats?.find(s => s.pendaftaran_id === p.id);
        return { ...p, display_points: statMatch ? Number(statMatch.points) : 0 };
      });
      setAtlets(merged);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // FUNGSI UNTUK MENGAMBIL HISTORI PER ATLET
  const fetchHistory = async (nama: string) => {
    const { data } = await supabase
      .from('audit_poin')
      .select('*')
      .eq('atlet_nama', nama)
      .order('created_at', { ascending: false })
      .limit(5);
    setHistories(data || []);
  };

  const toggleExpand = (atlet: any) => {
    if (expandedId === atlet.id) {
      setExpandedId(null);
    } else {
      setExpandedId(atlet.id);
      fetchHistory(atlet.nama);
    }
  };

  const handleUpdatePoin = async (atlet: any, currentPoints: number, amount: number) => {
    setUpdatingId(atlet.id);
    const newPoints = Math.max(0, currentPoints + amount);

    const { error } = await supabase
      .from('atlet_stats')
      .update({ points: newPoints })
      .eq('pendaftaran_id', atlet.id);

    if (!error) {
      // Catat Log ke Audit (PENTING untuk histori)
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_poin').insert([{
        admin_email: user?.email || 'Admin',
        atlet_nama: atlet.nama,
        poin_sebelum: currentPoints,
        poin_sesudah: newPoints,
        perubahan: amount
      }]);

      setAtlets(prev => prev.map(a => a.id === atlet.id ? { ...a, display_points: newPoints } : a));
      setShowSuccess(true);
      if (expandedId === atlet.id) fetchHistory(atlet.nama); // Refresh histori jika sedang terbuka
      setTimeout(() => setShowSuccess(false), 2000);
    }
    setUpdatingId(null);
  };

  const filteredAtlets = atlets.filter(a => a.nama?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);
  const currentItems = filteredAtlets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans">
      {/* Header section tetap sama */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Manajemen <span className="text-blue-600">Poin</span></h1>
          <div className="flex gap-2 mt-4">
            <button onClick={fetchAtlets} className="flex items-center gap-2 text-[10px] bg-zinc-900 text-zinc-400 px-4 py-2 rounded-xl font-black border border-zinc-800 hover:text-white transition-all"><RefreshCcw size={12} /> REFRESH</button>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input type="text" placeholder="Cari nama atlet..." className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 text-white font-bold outline-none focus:border-blue-600 shadow-2xl" onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      <div className="grid gap-4 mb-8">
        {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={30} /></div> : (
          currentItems.map((atlet) => (
            <div key={atlet.id} className="flex flex-col">
              <div className={`bg-zinc-900/40 border ${expandedId === atlet.id ? 'border-blue-600/50' : 'border-zinc-800/50'} p-6 rounded-t-[2.5rem] ${expandedId !== atlet.id ? 'rounded-b-[2.5rem]' : ''} flex flex-col md:flex-row items-center justify-between group transition-all`}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 border border-white/5"><User size={28} /></div>
                  <div>
                    <h3 className="font-black text-xl uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{atlet.nama}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 text-[9px] font-bold italic">ID: {atlet.id.slice(0,12)}...</span>
                      <button onClick={() => toggleExpand(atlet)} className="flex items-center gap-1 text-[9px] text-blue-500 font-black uppercase tracking-widest hover:underline">
                        <History size={10} /> {expandedId === atlet.id ? 'Tutup Histori' : 'Lihat Histori'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10 mt-6 md:mt-0">
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-600 font-black mb-1 italic">PTS BALANCE</p>
                    <p className="text-4xl font-black text-white leading-none">{atlet.display_points.toLocaleString()} <span className="text-blue-600 text-sm">PTS</span></p>
                  </div>
                  <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 shadow-inner">
                    <button disabled={updatingId === atlet.id} onClick={() => handleUpdatePoin(atlet, atlet.display_points, -100)} className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-red-600 flex items-center justify-center disabled:opacity-20 transition-all"><Minus size={20} /></button>
                    <button disabled={updatingId === atlet.id} onClick={() => handleUpdatePoin(atlet, atlet.display_points, 100)} className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-green-600 flex items-center justify-center disabled:opacity-20 transition-all"><Plus size={20} /></button>
                  </div>
                </div>
              </div>

              {/* AREA HISTORI (DROPDOWN) */}
              {expandedId === atlet.id && (
                <div className="bg-zinc-950 border-x border-b border-blue-600/30 rounded-b-[2.5rem] p-6 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                    <History size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Riwayat Perubahan Terakhir</span>
                  </div>
                  
                  <div className="space-y-3">
                    {histories.length > 0 ? histories.map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-[11px] bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${log.perubahan > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-zinc-400 font-mono italic">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        <div className="font-bold">
                          <span className="text-zinc-500">Admin: {log.admin_email?.split('@')[0]}</span>
                          <span className={`ml-4 ${log.perubahan > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {log.perubahan > 0 ? '+' : ''}{log.perubahan} Poin
                          </span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-zinc-600 text-[10px] py-4 font-bold uppercase tracking-widest italic">Belum ada riwayat perubahan poin.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination tetap di bawah */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 pb-10">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-20 transition-all"><ChevronLeft size={20} /></button>
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-12 h-12 rounded-xl font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-zinc-900 text-zinc-600 hover:text-zinc-400'}`}>{i + 1}</button>
            ))}
          </div>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-20 transition-all"><ChevronRight size={20} /></button>
        </div>
      )}

      {/* Toast Success */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 transform ${showSuccess ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-90 pointer-events-none'}`}>
        <div className="bg-blue-600 px-10 py-6 rounded-full shadow-2xl flex items-center gap-4 border border-white/20"><CheckCircle2 size={24} className="text-white" /><h4 className="text-white font-black uppercase text-lg italic tracking-widest">BERHASIL DIUPDATE!</h4></div>
      </div>
    </div>
  );
}
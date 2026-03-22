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
      // Mengambil data pendaftaran
      const { data: profiles } = await supabase.from('pendaftaran').select('*').order('nama', { ascending: true });
      // Mengambil data stats (kolom 'points' sesuai Gambar 3)
      const { data: stats } = await supabase.from('atlet_stats').select('*');
      
      const merged = (profiles || []).map(p => {
        const statMatch = stats?.find(s => s.pendaftaran_id === p.id);
        // Sinkronisasi: Pastikan menggunakan 'points' dari database
        return { ...p, display_points: statMatch ? Number(statMatch.points) : 0 };
      });
      setAtlets(merged);
    } catch (err) { 
        console.error("Gagal fetch data:", err); 
    }
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

    try {
      // PERBAIKAN: Gunakan upsert agar jika record belum ada di atlet_stats, sistem akan membuatnya
      const { error } = await supabase
        .from('atlet_stats')
        .upsert({ 
          pendaftaran_id: atlet.id, 
          player_name: atlet.nama,
          points: newPoints,
          last_match_at: new Date().toISOString()
        }, { onConflict: 'pendaftaran_id' });

      if (error) throw error;

      // Catat Log ke Audit (PENTING untuk histori)
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_poin').insert([{
        atlet_id: atlet.id,
        admin_email: user?.email || 'Admin System',
        atlet_nama: atlet.nama,
        poin_sebelum: currentPoints,
        poin_sesudah: newPoints,
        perubahan: amount,
        tipe_kegiatan: 'Manual Adjustment'
      }]);

      // Update State Lokal agar UI berubah seketika
      setAtlets(prev => prev.map(a => a.id === atlet.id ? { ...a, display_points: newPoints } : a));
      setShowSuccess(true);
      
      if (expandedId === atlet.id) fetchHistory(atlet.nama); 
      setTimeout(() => setShowSuccess(false), 2000);

    } catch (err: any) {
      console.error("Gagal update poin:", err.message);
      alert("Gagal memperbarui poin. Pastikan koneksi stabil atau cek status kuota Supabase Anda.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAtlets = atlets.filter(a => a.nama?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);
  const currentItems = filteredAtlets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans relative overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <Sparkles size={14} className="text-blue-500" />
               <p className="text-zinc-500 text-[9px] font-black tracking-[0.3em] uppercase">Control Center v2.0</p>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
              MANAGE <span className="text-blue-600 underline decoration-blue-900">POINTS</span>
            </h1>
            <div className="flex gap-2 mt-6">
              <button onClick={fetchAtlets} className="flex items-center gap-2 text-[10px] bg-zinc-900/50 text-zinc-400 px-5 py-2.5 rounded-xl font-black border border-zinc-800 hover:text-white hover:border-zinc-600 transition-all active:scale-95">
                <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} /> SYNC DATABASE
              </button>
            </div>
          </div>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama atlet..." 
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-600/50 focus:bg-zinc-900 transition-all shadow-2xl placeholder:text-zinc-700" 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
            />
          </div>
        </div>

        <div className="grid gap-6 mb-12">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Loading Athlete Data...</p>
            </div>
          ) : filteredAtlets.length === 0 ? (
            <div className="py-20 border border-dashed border-zinc-800 rounded-[3rem] flex flex-col items-center justify-center opacity-30">
              <User size={48} className="mb-4" />
              <p className="font-black uppercase tracking-widest text-xs">Atlet tidak ditemukan</p>
            </div>
          ) : (
            currentItems.map((atlet) => (
              <div key={atlet.id} className="flex flex-col group/item transition-all duration-500">
                <div className={`bg-zinc-900/40 backdrop-blur-md border ${expandedId === atlet.id ? 'border-blue-600/50 bg-zinc-900' : 'border-white/5 hover:border-white/10'} p-8 rounded-t-[2.5rem] ${expandedId !== atlet.id ? 'rounded-b-[2.5rem]' : ''} flex flex-col md:flex-row items-center justify-between transition-all shadow-xl`}>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 border border-white/5 shadow-inner group-hover/item:text-blue-500 group-hover/item:border-blue-500/20 transition-all">
                      <User size={32} />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl uppercase tracking-tighter leading-tight">{atlet.nama}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-zinc-600 text-[10px] font-bold font-mono">#{atlet.id.slice(0,8).toUpperCase()}</span>
                        <button 
                          onClick={() => toggleExpand(atlet)} 
                          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${expandedId === atlet.id ? 'text-blue-400' : 'text-zinc-500 hover:text-blue-500'}`}
                        >
                          <History size={12} /> {expandedId === atlet.id ? 'CLOSE LOG' : 'VIEW LOG'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 mt-8 md:mt-0">
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 font-black mb-1 tracking-widest uppercase italic">Balance</p>
                      <p className="text-5xl font-black text-white leading-none tracking-tighter">
                        {atlet.display_points.toLocaleString()} 
                        <span className="text-blue-600 text-lg ml-2 font-black italic">PTS</span>
                      </p>
                    </div>
                    <div className="flex gap-3 bg-black/40 p-2.5 rounded-[1.5rem] border border-white/5 shadow-2xl">
                      <button 
                        disabled={updatingId === atlet.id} 
                        onClick={() => handleUpdatePoin(atlet, atlet.display_points, -100)} 
                        className="w-14 h-14 rounded-xl bg-zinc-800 hover:bg-red-600 text-white flex items-center justify-center disabled:opacity-10 transition-all active:scale-90"
                      >
                        <Minus size={24} />
                      </button>
                      <button 
                        disabled={updatingId === atlet.id} 
                        onClick={() => handleUpdatePoin(atlet, atlet.display_points, 100)} 
                        className="w-14 h-14 rounded-xl bg-zinc-800 hover:bg-blue-600 text-white flex items-center justify-center disabled:opacity-10 transition-all active:scale-90"
                      >
                        <Plus size={24} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* AREA HISTORI (DROPDOWN) */}
                {expandedId === atlet.id && (
                  <div className="bg-zinc-950 border-x border-b border-blue-600/30 rounded-b-[2.5rem] p-8 animate-in slide-in-from-top-6 duration-500 shadow-2xl shadow-blue-900/10">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                      <div className="flex items-center gap-2">
                        <History size={16} className="text-blue-500" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 font-mono">Transaction History (Last 5)</span>
                      </div>
                      <span className="text-[9px] text-zinc-600 font-bold uppercase">Realtime Sync Active</span>
                    </div>
                    
                    <div className="space-y-3">
                      {histories.length > 0 ? histories.map((log) => (
                        <div key={log.id} className="flex items-center justify-between bg-zinc-900/40 p-5 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px] ${log.perubahan > 0 ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
                            <div className="flex flex-col">
                              <span className="text-white text-[11px] font-black uppercase">{log.tipe_kegiatan || 'Poin Adjustment'}</span>
                              <span className="text-zinc-600 text-[10px] font-bold">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm font-black italic ${log.perubahan > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {log.perubahan > 0 ? '+' : ''}{log.perubahan} <span className="text-[10px] not-italic opacity-50">PTS</span>
                            </span>
                            <p className="text-[9px] text-zinc-700 font-black uppercase tracking-tighter">By: {log.admin_email?.split('@')[0]}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="py-10 text-center flex flex-col items-center opacity-40">
                          <AlertTriangle size={24} className="mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest italic">Belum ada riwayat aktivitas poin.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 mt-12 pb-20">
            <button 
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }} 
              disabled={currentPage === 1} 
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-blue-600/50 disabled:opacity-10 transition-all shadow-xl active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex gap-3">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => { setCurrentPage(i + 1); window.scrollTo(0,0); }} 
                  className={`w-14 h-14 rounded-2xl font-black text-sm transition-all duration-300 ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] scale-110' : 'bg-zinc-900/50 text-zinc-600 border border-zinc-800 hover:text-zinc-300 hover:border-zinc-600'}`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0); }} 
              disabled={currentPage === totalPages} 
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-blue-600/50 disabled:opacity-10 transition-all shadow-xl active:scale-90"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Toast Success Notification */}
      <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 cubic-bezier(0.175, 0.885, 0.32, 1.275) transform ${showSuccess ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-32 opacity-0 scale-50 pointer-events-none'}`}>
        <div className="bg-zinc-900/90 backdrop-blur-2xl border border-blue-500/50 px-12 py-6 rounded-[2.5rem] shadow-[0_0_60px_rgba(37,99,235,0.3)] flex items-center gap-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center rotate-12 shadow-lg shadow-blue-500/40">
            <CheckCircle2 size={28} className="text-white -rotate-12" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase text-xl italic leading-none mb-1">UPDATED!</h4>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">Athlete stats synchronized</p>
          </div>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #2563eb; }
      `}</style>
    </div>
  );
}
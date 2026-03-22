import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Trophy, Plus, Minus, Search, User, Loader2, 
  ChevronLeft, ChevronRight, Zap, CheckCircle2, Sparkles, RefreshCcw, AlertTriangle, History, ChevronDown, ChevronUp
} from 'lucide-react';

export default function ManajemenPoin() {
  const [atlets, setAtlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [histories, setHistories] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  useEffect(() => {
    fetchAtlets();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', table: 'atlet_stats', schema: 'public' }, () => fetchAtlets())
      .on('postgres_changes', { event: '*', table: 'pendaftaran', schema: 'public' }, () => fetchAtlets())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAtlets = async () => {
    setLoading(true);
    try {
      // 1. Ambil data dari tabel pendaftaran
      const { data: profiles, error: pError } = await supabase
        .from('pendaftaran')
        .select('id, nama, poin') 
        .order('nama', { ascending: true });

      if (pError) throw pError;

      // 2. Ambil data dari tabel atlet_stats (sesuai Gambar 1 Anda)
      const { data: stats, error: sError } = await supabase
        .from('atlet_stats')
        .select('pendaftaran_id, player_name, total_points');

      if (sError) throw sError;

      // 3. MERGE LOGIC (Kunci Perbaikan)
      const merged = (profiles || []).map(p => {
        // Cari di stats berdasarkan ID, jika ID kosong cari berdasarkan Nama (case insensitive)
        const statMatch = stats?.find(s => 
          (s.pendaftaran_id === p.id) || 
          (s.player_name?.toLowerCase() === p.nama?.toLowerCase())
        );
        
        const basePoint = Number(p.poin || 0);
        const matchPoint = statMatch ? Number(statMatch.total_points) : 0;
        
        return { 
          ...p, 
          base_point: basePoint,
          match_point: matchPoint,
          display_points: basePoint + matchPoint
        };
      });

      setAtlets(merged);
    } catch (err) { 
      console.error("Gagal sinkronisasi:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdatePoin = async (atlet: any, currentTotal: number, amount: number) => {
    setUpdatingId(atlet.id);
    const newMatchPoints = atlet.match_point + amount;

    try {
      // Sesuai Gambar 1: Menggunakan player_name dan pendaftaran_id
      const { error: upsertError } = await supabase
        .from('atlet_stats')
        .upsert({ 
          pendaftaran_id: atlet.id, 
          player_name: atlet.nama,
          total_points: newMatchPoints, 
          last_match_at: new Date().toISOString()
        }, { onConflict: 'player_name' }); // Menggunakan player_name sebagai kunci jika ID bermasalah

      if (upsertError) throw upsertError;

      // Optimistic Update
      setAtlets(prev => prev.map(a => 
        a.id === atlet.id ? { 
          ...a, 
          match_point: newMatchPoints,
          display_points: a.base_point + newMatchPoints 
        } : a
      ));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAtlets = atlets.filter(a => a.nama?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);
  const currentItems = filteredAtlets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-zinc-500 text-[10px] font-black tracking-widest uppercase italic">
              System Ready: {atlets.length} Athletes Loaded
            </span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Quick <span className="text-blue-600">Adjustment</span></h1>
          <button onClick={fetchAtlets} className="mt-4 flex items-center gap-2 text-[10px] bg-zinc-900 text-zinc-400 px-4 py-2 rounded-xl font-black border border-zinc-800 hover:text-white transition-all">
            <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} /> RE-FETCH DATA
          </button>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atlet..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 text-white font-bold outline-none focus:border-blue-600 shadow-2xl" 
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
          />
        </div>
      </div>

      {/* Main List */}
      <div className="grid gap-4 mb-8">
        {loading && atlets.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest italic">Memuat Data...</p>
          </div>
        ) : (
          currentItems.map((atlet) => (
            <div key={atlet.id} className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between group hover:border-blue-600/30 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 border border-white/5"><User size={28} /></div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{atlet.nama}</h3>
                  <p className="text-[8px] text-zinc-600 font-bold uppercase italic mt-1">Ref: {atlet.id.slice(0,8)}</p>
                </div>
              </div>

              <div className="flex items-center gap-10 mt-6 md:mt-0">
                <div className="text-right">
                  <p className="text-[9px] text-zinc-600 font-black mb-1 italic tracking-widest uppercase">Current Balance</p>
                  <p className="text-4xl font-black text-white leading-none">
                    {atlet.display_points.toLocaleString()} <span className="text-blue-600 text-sm">PTS</span>
                  </p>
                  <p className="text-[8px] text-zinc-700 font-bold mt-1 uppercase italic">
                    Base: {atlet.base_point} | Match: {atlet.match_point}
                  </p>
                </div>
                <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                  <button disabled={updatingId === atlet.id} onClick={() => handleUpdatePoin(atlet, atlet.display_points, -100)} className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-red-600 text-white flex items-center justify-center transition-all active:scale-90">
                    {updatingId === atlet.id ? <Loader2 className="animate-spin" size={16}/> : <Minus size={20} />}
                  </button>
                  <button disabled={updatingId === atlet.id} onClick={() => handleUpdatePoin(atlet, atlet.display_points, 100)} className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-green-600 text-white flex items-center justify-center transition-all active:scale-90">
                    {updatingId === atlet.id ? <Loader2 className="animate-spin" size={16}/> : <Plus size={20} />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination & Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} />
          <span className="font-black uppercase text-sm tracking-widest italic">Data Synced!</span>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Trophy, Plus, Minus, Search, User, Loader2, 
  ChevronLeft, ChevronRight, Zap, CheckCircle2, Sparkles, RefreshCcw
} from 'lucide-react';

export default function ManajemenPoin() {
  const [atlets, setAtlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAmount, setLastAmount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAtlets();
  }, []);

  const fetchAtlets = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from('pendaftaran')
        .select('id, nama, kategori, kategori_atlet')
        .order('nama', { ascending: true });

      const { data: stats } = await supabase
        .from('atlet_stats')
        .select('*');

      const merged = (profiles || []).map(p => {
        const statMatch = stats?.find(s => s.pendaftaran_id === p.id);
        return {
          ...p,
          display_points: statMatch ? Number(statMatch.points) : 0
        };
      });
      setAtlets(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI BARU: PERBAIKAN ID OTOMATIS ---
  const handleRepairSync = async () => {
    setIsSyncing(true);
    try {
      const { data: profiles } = await supabase.from('pendaftaran').select('id, nama');
      const { data: stats } = await supabase.from('atlet_stats').select('pendaftaran_id');

      // Cari atlet yang tidak punya baris di atlet_stats
      const missingStats = profiles?.filter(p => 
        !stats?.some(s => s.pendaftaran_id === p.id)
      );

      if (missingStats && missingStats.length > 0) {
        const inserts = missingStats.map(m => ({
          pendaftaran_id: m.id,
          points: 0,
          rank: 0
        }));
        await supabase.from('atlet_stats').insert(inserts);
        alert(`Berhasil sinkronisasi ${missingStats.length} atlet baru termasuk Arwan!`);
      } else {
        alert("Data ID sudah sinkron.");
      }
      await fetchAtlets();
    } catch (err) {
      alert("Gagal sinkronisasi.");
    } finally {
      setIsSyncing(false);
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
      setAtlets(prev => prev.map(a => 
        a.id === atlet.id ? { ...a, display_points: newPoints } : a
      ));
      setLastAmount(amount);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
    setUpdatingId(null);
  };

  const filteredAtlets = atlets.filter(a => 
    a.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);
  const currentItems = filteredAtlets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans relative overflow-hidden">
      {/* Header & Button Sync */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Manajemen <span className="text-blue-600">Poin</span>
          </h1>
          <button 
            onClick={handleRepairSync}
            disabled={isSyncing}
            className="mt-3 flex items-center gap-2 text-[10px] bg-blue-600/10 text-blue-400 px-4 py-2 rounded-xl font-black border border-blue-600/30 hover:bg-blue-600 hover:text-white transition-all"
          >
            {isSyncing ? <Loader2 className="animate-spin" size={12} /> : <RefreshCcw size={12} />}
            SYNC & REPAIR DATABASE ID
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Cari atlet..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-600"
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="grid gap-4 mb-8 relative z-10">
        {loading ? (
          <div className="py-20 flex flex-col items-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          currentItems.map((atlet) => (
            <div key={atlet.id} className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between hover:bg-zinc-900/60 transition-all group relative overflow-hidden">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-blue-500 transition-all">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{atlet.nama}</h3>
                  <p className="text-zinc-600 text-[9px] font-bold italic tracking-widest uppercase">ID: {atlet.id.slice(0,8)}</p>
                </div>
              </div>

              <div className="flex items-center gap-10 mt-6 md:mt-0">
                <div className="text-right">
                  <p className="text-[9px] text-zinc-600 font-black uppercase mb-1">Database Balance</p>
                  <p className="text-3xl font-black text-white leading-none">
                    {atlet.display_points.toLocaleString()} <span className="text-blue-600 text-sm">PTS</span>
                  </p>
                </div>

                <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                  <button 
                    disabled={updatingId === atlet.id}
                    onClick={() => handleUpdatePoin(atlet, atlet.display_points, -100)}
                    className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-red-600 flex items-center justify-center transition-all disabled:opacity-30"
                  >
                    {updatingId === atlet.id ? <Loader2 size={18} className="animate-spin" /> : <Minus size={20} />}
                  </button>
                  <button 
                    disabled={updatingId === atlet.id}
                    onClick={() => handleUpdatePoin(atlet, atlet.display_points, 100)}
                    className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-green-600 flex items-center justify-center transition-all disabled:opacity-30"
                  >
                    {updatingId === atlet.id ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800"><ChevronLeft size={20} /></button>
          <div className="text-zinc-500 text-xs font-black bg-zinc-900 px-6 py-4 rounded-2xl border border-zinc-800">Page {currentPage} / {totalPages}</div>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800"><ChevronRight size={20} /></button>
        </div>
      )}
      
      {/* Toast Success (tetap sama) */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 transform ${showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="bg-zinc-950/90 border border-blue-500/50 px-10 py-6 rounded-[3rem] flex items-center gap-6 shadow-2xl">
          <CheckCircle2 size={28} className="text-green-500" />
          <h4 className="text-white font-black uppercase text-xl italic">POINTS UPDATED!</h4>
        </div>
      </div>
    </div>
  );
}
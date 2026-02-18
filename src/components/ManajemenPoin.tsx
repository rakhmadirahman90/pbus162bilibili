import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Trophy, Plus, Minus, Search, User, Loader2, 
  ChevronLeft, ChevronRight, Zap, CheckCircle2, Sparkles, RefreshCcw, AlertTriangle
} from 'lucide-react';

export default function ManajemenPoin() {
  const [atlets, setAtlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAmount, setLastAmount] = useState(0);

  // Pagination States
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
        return {
          ...p,
          display_points: statMatch ? Number(statMatch.points) : 0
        };
      });
      setAtlets(merged);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const forceFixArwan = async () => {
    setIsSyncing(true);
    try {
      const { data: arwanProfile } = await supabase
        .from('pendaftaran')
        .select('id')
        .ilike('nama', '%ARWAN%')
        .single();

      if (arwanProfile) {
        await supabase.from('atlet_stats').delete().eq('pendaftaran_id', arwanProfile.id);
        const { error: insertError } = await supabase
          .from('atlet_stats')
          .insert([{ pendaftaran_id: arwanProfile.id, points: 8040, rank: 0 }]);

        if (!insertError) {
          alert("Data Arwan Berhasil Diperbaiki!");
          await fetchAtlets();
        }
      }
    } catch (err) { alert("Gagal Force Fix"); }
    finally { setIsSyncing(false); }
  };

  const handleUpdatePoin = async (atlet: any, currentPoints: number, amount: number) => {
    setUpdatingId(atlet.id);
    const newPoints = Math.max(0, currentPoints + amount);

    const { error } = await supabase
      .from('atlet_stats')
      .update({ points: newPoints })
      .eq('pendaftaran_id', atlet.id);

    if (!error) {
      setAtlets(prev => prev.map(a => a.id === atlet.id ? { ...a, display_points: newPoints } : a));
      setLastAmount(amount);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
    setUpdatingId(null);
  };

  // Logic Pagination & Search
  const filteredAtlets = atlets.filter(a => a.nama?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);
  const currentItems = filteredAtlets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Manajemen <span className="text-blue-600">Poin</span></h1>
          <div className="flex gap-2 mt-4">
            <button onClick={fetchAtlets} className="flex items-center gap-2 text-[10px] bg-zinc-900 text-zinc-400 px-4 py-2 rounded-xl font-black border border-zinc-800"><RefreshCcw size={12} /> REFRESH</button>
            <button onClick={forceFixArwan} disabled={isSyncing} className="flex items-center gap-2 text-[10px] bg-red-600/10 text-red-500 px-4 py-2 rounded-xl font-black border border-red-600/30 hover:bg-red-600 hover:text-white"><AlertTriangle size={12} /> FIX ARWAN</button>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input type="text" placeholder="Cari nama..." className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 text-white font-bold outline-none" onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      <div className="grid gap-4 mb-8">
        {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div> : (
          currentItems.map((atlet) => (
            <div key={atlet.id} className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 border border-white/5"><User size={28} /></div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{atlet.nama}</h3>
                  <p className="text-zinc-600 text-[9px] font-bold italic">ID: {atlet.id.slice(0,12)}...</p>
                </div>
              </div>
              <div className="flex items-center gap-10 mt-6 md:mt-0">
                <div className="text-right">
                  <p className="text-[9px] text-zinc-600 font-black mb-1">BALANCE</p>
                  <p className="text-4xl font-black text-white">{atlet.display_points.toLocaleString()} <span className="text-blue-600 text-sm">PTS</span></p>
                </div>
                <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                  <button disabled={updatingId === atlet.id} onClick={() => handleUpdatePoin(atlet, atlet.display_points, -100)} className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-red-600 flex items-center justify-center disabled:opacity-20 transition-all"><Minus size={20} /></button>
                  <button disabled={updatingId === atlet.id} onClick={() => handleUpdatePoin(atlet, atlet.display_points, 100)} className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-green-600 flex items-center justify-center disabled:opacity-20 transition-all"><Plus size={20} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- PAGINATION CONTROLS (KEMBALI DITAMBAHKAN) --- */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 pb-10">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-12 h-12 rounded-xl font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-zinc-900 text-zinc-600 hover:text-zinc-400'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-20 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Toast Notif */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 transform ${showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="bg-blue-600 px-10 py-6 rounded-full shadow-2xl flex items-center gap-4 border border-white/20"><CheckCircle2 size={24} className="text-white" /><h4 className="text-white font-black uppercase text-lg italic tracking-widest">SUCCESS!</h4></div>
      </div>
    </div>
  );
}
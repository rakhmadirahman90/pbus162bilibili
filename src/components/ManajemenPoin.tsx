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

  // --- FUNGSI NUKLIR: PAKSA FIX ARWAN ---
  const forceFixArwan = async () => {
    setIsSyncing(true);
    try {
      // 1. Cari data Arwan di tabel pendaftaran
      const { data: arwanProfile } = await supabase
        .from('pendaftaran')
        .select('id')
        .ilike('nama', '%ARWAN%')
        .single();

      if (arwanProfile) {
        // 2. Hapus semua data statistik lama yang mungkin korup/ID salah untuk pendaftaran_id ini
        await supabase.from('atlet_stats').delete().eq('pendaftaran_id', arwanProfile.id);

        // 3. Masukkan data baru yang bersih dengan poin yang seharusnya (8040)
        const { error: insertError } = await supabase
          .from('atlet_stats')
          .insert([{ 
            pendaftaran_id: arwanProfile.id, 
            points: 8040, 
            rank: 0 
          }]);

        if (!insertError) {
          alert("BOOM! Data Arwan berhasil dipaksa ke 8040 PTS. Me-refresh...");
          await fetchAtlets();
        }
      } else {
        alert("Nama Arwan tidak ditemukan di tabel pendaftaran.");
      }
    } catch (err) {
      alert("Gagal melakukan Force Fix.");
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
      setAtlets(prev => prev.map(a => a.id === atlet.id ? { ...a, display_points: newPoints } : a));
      setLastAmount(amount);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
    setUpdatingId(null);
  };

  const filteredAtlets = atlets.filter(a => a.nama?.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentItems = filteredAtlets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Manajemen <span className="text-blue-600">Poin</span></h1>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={fetchAtlets}
              className="flex items-center gap-2 text-[10px] bg-zinc-900 text-zinc-400 px-4 py-2 rounded-xl font-black border border-zinc-800 hover:text-white"
            >
              <RefreshCcw size={12} /> REFRESH
            </button>
            <button 
              onClick={forceFixArwan}
              disabled={isSyncing}
              className="flex items-center gap-2 text-[10px] bg-red-600/10 text-red-500 px-4 py-2 rounded-xl font-black border border-red-600/30 hover:bg-red-600 hover:text-white transition-all"
            >
              <AlertTriangle size={12} /> {isSyncing ? 'FIXING...' : 'FORCE FIX ARWAN (8040)'}
            </button>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 text-white font-bold"
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div> : (
          currentItems.map((atlet) => (
            <div key={atlet.id} className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-blue-500 transition-all shadow-lg border border-white/5">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{atlet.nama}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 text-[9px] font-black uppercase tracking-widest">{atlet.kategori_atlet || 'ATLET'}</span>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                    <span className="text-zinc-600 text-[8px] font-bold italic">ID: {atlet.id.slice(0,12)}...</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10 mt-6 md:mt-0">
                <div className="text-right">
                  <p className="text-[9px] text-zinc-600 font-black mb-1">CURRENT POINTS</p>
                  <p className="text-4xl font-black text-white leading-none">
                    {atlet.display_points.toLocaleString()} <span className="text-blue-600 text-sm">PTS</span>
                  </p>
                </div>

                <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                  <button 
                    disabled={updatingId === atlet.id}
                    onClick={() => handleUpdatePoin(atlet, atlet.display_points, -100)}
                    className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-red-600 flex items-center justify-center transition-all disabled:opacity-20"
                  >
                    {updatingId === atlet.id ? <Loader2 size={18} className="animate-spin" /> : <Minus size={20} />}
                  </button>
                  <button 
                    disabled={updatingId === atlet.id}
                    onClick={() => handleUpdatePoin(atlet, atlet.display_points, 100)}
                    className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-green-600 flex items-center justify-center transition-all disabled:opacity-20"
                  >
                    {updatingId === atlet.id ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL SUCCESS (Glow Effect) */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 transform ${showSuccess ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-90 pointer-events-none'}`}>
        <div className="bg-blue-600 px-10 py-6 rounded-full shadow-[0_0_50px_rgba(37,99,235,0.6)] flex items-center gap-4">
          <CheckCircle2 size={24} className="text-white" />
          <h4 className="text-white font-black uppercase text-lg italic">POIN BERHASIL DIUPDATE!</h4>
        </div>
      </div>
    </div>
  );
}
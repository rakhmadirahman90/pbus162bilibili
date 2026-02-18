import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Trophy, Plus, Minus, Search, User, Loader2, 
  ChevronLeft, ChevronRight, Zap, CheckCircle2, Sparkles 
} from 'lucide-react';

export default function ManajemenPoin() {
  const [atlets, setAtlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAmount, setLastAmount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAtlets();
  }, []);

  // --- PERBAIKAN TOTAL: MANUAL MERGING ---
  const fetchAtlets = async () => {
    setLoading(true);
    try {
      // 1. Ambil data profil dari pendaftaran
      const { data: profileData, error: profileError } = await supabase
        .from('pendaftaran')
        .select('id, nama, kategori, kategori_atlet')
        .order('nama', { ascending: true });

      if (profileError) throw profileError;

      // 2. Ambil data poin dari atlet_stats secara mandiri
      const { data: statsData, error: statsError } = await supabase
        .from('atlet_stats')
        .select('pendaftaran_id, points');

      if (statsError) throw statsError;

      // 3. Gabungkan data berdasarkan pendaftaran_id
      // Cara ini menjamin nilai poin (seperti 8040 milik A. Arwan) pasti masuk ke state
      const mergedData = profileData.map(atlet => {
        const matchingStat = statsData?.find(s => s.pendaftaran_id === atlet.id);
        return {
          ...atlet,
          // Kita simpan di dalam properti manual_points untuk kepastian
          display_points: matchingStat ? Number(matchingStat.points) : 0
        };
      });

      setAtlets(mergedData);
    } catch (err) {
      console.error("Gagal sinkronisasi poin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePoin = async (atlet: any, currentPoints: number, amount: number) => {
    setUpdatingId(atlet.id);
    const newPoints = Math.max(0, currentPoints + amount);

    // Update langsung ke database
    const { error: updateError } = await supabase
      .from('atlet_stats')
      .update({ points: newPoints })
      .eq('pendaftaran_id', atlet.id);

    if (!updateError) {
      // Update state lokal secara instan
      setAtlets(atlets.map(a => 
        a.id === atlet.id ? { ...a, display_points: newPoints } : a
      ));

      setLastAmount(amount);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Log audit secara background
      supabase.auth.getUser().then(({ data: { user } }) => {
        supabase.from('audit_poin').insert([{
          admin_email: user?.email || 'Admin',
          atlet_nama: atlet.nama,
          poin_sebelum: currentPoints,
          poin_sesudah: newPoints,
          perubahan: amount
        }]).then();
      });
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
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Manajemen <span className="text-blue-600 underline decoration-blue-900/30">Poin</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-[10px] bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-blue-600/30">
              <Zap size={10} className="animate-pulse" /> Direct DB Sync
            </span>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Cari atlet..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-600 outline-none text-white font-bold"
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="grid gap-4 mb-8 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">Menarik Data Poin...</p>
          </div>
        ) : currentItems.map((atlet) => (
          <div key={atlet.id} className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between hover:bg-zinc-900/60 transition-all group relative overflow-hidden">
            <div className="absolute left-0 top-0 w-[2px] h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
            
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-blue-500 transition-all border border-white/5 shadow-xl">
                <User size={28} />
              </div>
              <div>
                <h3 className="font-black text-xl uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{atlet.nama}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${atlet.kategori_atlet === 'SENIOR' ? 'bg-purple-900/20 text-purple-400' : 'bg-blue-900/20 text-blue-400'}`}>
                    {atlet.kategori_atlet || atlet.kategori}
                  </span>
                  <span className="text-zinc-600 text-[9px] font-bold italic uppercase tracking-widest">ID: {atlet.id.slice(0,8)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-10 mt-6 md:mt-0">
              <div className="text-right">
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1 italic">Verified Balance</p>
                <p className="text-3xl font-black text-white leading-none">
                  {atlet.display_points.toLocaleString()} <span className="text-blue-600 text-sm">PTS</span>
                </p>
              </div>

              <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                <button 
                  disabled={updatingId === atlet.id}
                  onClick={() => handleUpdatePoin(atlet, atlet.display_points, -100)}
                  className="w-12 h-12 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
                >
                  {updatingId === atlet.id ? <Loader2 className="animate-spin" size={18} /> : <Minus size={20} />}
                </button>
                <button 
                  disabled={updatingId === atlet.id}
                  onClick={() => handleUpdatePoin(atlet, atlet.display_points, 100)}
                  className="w-12 h-12 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all disabled:opacity-30"
                >
                  {updatingId === atlet.id ? <Loader2 className="animate-spin" size={18} /> : <Plus size={20} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all disabled:opacity-20"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-zinc-500 text-xs font-black uppercase tracking-widest bg-zinc-900 px-6 py-4 rounded-2xl border border-zinc-800 shadow-xl">
            Page <span className="text-white">{currentPage}</span> / {totalPages}
          </div>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all disabled:opacity-20"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* MODAL NOTIFIKASI */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 transform ${
        showSuccess ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-90 pointer-events-none'}`}>
        <div className="bg-zinc-950/90 backdrop-blur-3xl border border-blue-500/50 px-10 py-6 rounded-[3rem] shadow-[0_0_50px_rgba(37,99,235,0.3)] flex items-center gap-6">
          <div className={`p-4 rounded-2xl rotate-12 shadow-lg ${lastAmount > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
            <CheckCircle2 size={28} className="text-white" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase text-xl italic leading-none mb-1">
              {lastAmount > 0 ? 'POINTS ADDED!' : 'POINTS REDUCED!'}
            </h4>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Audit Log Synchronized</p>
          </div>
        </div>
      </div>
    </div>
  );
}
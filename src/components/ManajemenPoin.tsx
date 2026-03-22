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
      .on('postgres_changes', 
        { event: '*', table: 'atlet_stats', schema: 'public' }, 
        () => fetchAtlets()
      )
      .on('postgres_changes', 
        { event: '*', table: 'pendaftaran', schema: 'public' }, 
        () => fetchAtlets()
      )
      .on('postgres_changes', 
        { event: '*', table: 'rankings', schema: 'public' }, 
        () => fetchAtlets()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAtlets = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: pError } = await supabase
        .from('pendaftaran')
        .select('id, nama')
        .order('nama', { ascending: true });

      if (pError) throw pError;

      const { data: stats, error: sError } = await supabase
        .from('atlet_stats')
        .select('pendaftaran_id, points, total_points');

      if (sError) throw sError;

      const statsMap = new Map(stats?.map(s => [
        s.pendaftaran_id, 
        { 
          p: Number(s.points || 0), 
          tp: Number(s.total_points || 0) 
        }
      ]));
      
      const merged = (profiles || []).map(p => {
        const stat = statsMap.get(p.id);
        return {
          ...p,
          display_points: (stat?.p || 0) + (stat?.tp || 0),
          raw_points: stat?.p || 0,
          raw_total_points: stat?.tp || 0
        };
      });

      setAtlets(merged);
    } catch (err) { 
      console.error("Gagal fetch data:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchHistory = async (nama: string) => {
    if (!nama) return;
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

  const handleUpdatePoin = async (atlet: any, currentDisplayPoints: number, amount: number) => {
    if (updatingId) return;
    setUpdatingId(atlet.id);
    
    // Perhitungan nilai baru
    // display_points = total akhir yang tampil di UI (Seed + Tambahan)
    // total_points = hanya akumulasi perubahan manual/turnamen
    const newDisplayPoints = Math.max(0, currentDisplayPoints + amount);
    const newTotalPointsOnly = Math.max(0, atlet.raw_total_points + amount);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. UPDATE ATLET_STATS (Data teknis per atlet)
      const { error: statsError } = await supabase
        .from('atlet_stats')
        .upsert({ 
          pendaftaran_id: atlet.id, 
          player_name: atlet.nama || 'Unnamed Atlet',
          points: atlet.raw_points, 
          total_points: newTotalPointsOnly, 
          last_match_at: new Date().toISOString()
        }, { onConflict: 'pendaftaran_id' });

      if (statsError) throw statsError;

      // 2. UPDATE RANKINGS (Sinkronisasi kolom total_points di tabel rankings)
      // Kita mengirim newDisplayPoints agar ranking publik menampilkan total (Seed + Tambahan)
      const { error: rankingsError } = await supabase
        .from('rankings')
        .upsert({ 
          player_name: atlet.nama,
          total_points: newDisplayPoints, 
          updated_at: new Date().toISOString()
        }, { onConflict: 'player_name' });

      if (rankingsError) {
        console.error("Rankings sync error:", rankingsError.message);
      }

      // 3. LOG AUDIT
      await supabase.from('audit_poin').insert([{
        admin_email: user?.email || 'Admin System',
        atlet_id: atlet.id,
        atlet_nama: atlet.nama,
        poin_sebelum: currentDisplayPoints,
        poin_sesudah: newDisplayPoints,
        perubahan: amount,
        tipe_kegiatan: amount > 0 ? "Manual Adjustment (+)" : "Manual Adjustment (-)"
      }]);

      // Optimistic UI Update agar transisi halus
      setAtlets(prev => prev.map(a => a.id === atlet.id ? { 
        ...a, 
        display_points: newDisplayPoints,
        raw_total_points: newTotalPointsOnly 
      } : a));
      
      setShowSuccess(true);
      if (expandedId === atlet.id) fetchHistory(atlet.nama);
      setTimeout(() => setShowSuccess(false), 2000);

    } catch (err) {
      console.error("Gagal sinkronisasi poin:", err);
      alert("Terjadi kesalahan saat memperbarui database.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAtlets = atlets.filter(a => 
    a.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);
  const currentItems = filteredAtlets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -z-10" />

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-zinc-500 text-[10px] font-black tracking-widest uppercase italic">
              Multi-Table Sync: Atlet Stats + Rankings
            </span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Point <span className="text-blue-600">Control</span>
          </h1>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={fetchAtlets} 
              disabled={loading}
              className="flex items-center gap-2 text-[10px] bg-zinc-900 text-zinc-400 px-4 py-2 rounded-xl font-black border border-zinc-800 hover:text-white transition-all shadow-lg hover:border-blue-500/50 disabled:opacity-50"
            >
              <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} /> RE-FETCH DATA
            </button>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atlet..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 text-white font-bold outline-none focus:border-blue-600 transition-all shadow-2xl" 
            value={searchTerm}
            onChange={handleSearchChange} 
          />
        </div>
      </div>

      <div className="grid gap-4 mb-8">
        {loading && atlets.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest">Sinkronisasi Server...</p>
          </div>
        ) : (
          currentItems.map((atlet) => (
            <div key={atlet.id} className="flex flex-col">
              <div className={`bg-zinc-900/40 border ${expandedId === atlet.id ? 'border-blue-600/50 bg-zinc-900/80' : 'border-zinc-800/50'} p-6 rounded-t-[2.5rem] ${expandedId !== atlet.id ? 'rounded-b-[2.5rem]' : ''} flex flex-col md:flex-row items-center justify-between group transition-all duration-300`}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 border border-white/5 group-hover:text-blue-500 transition-colors">
                    <User size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase tracking-tighter group-hover:text-blue-400 transition-colors">
                      {atlet.nama || 'Tanpa Nama'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 text-[9px] font-bold italic font-mono uppercase tracking-widest">ID: {atlet.id?.slice(0,8)}</span>
                      <button onClick={() => toggleExpand(atlet)} className="flex items-center gap-1 text-[9px] text-blue-500 font-black uppercase tracking-widest hover:underline">
                        <History size={10} /> {expandedId === atlet.id ? 'Tutup Log' : 'History'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10 mt-6 md:mt-0">
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-600 font-black mb-1 italic tracking-widest">TOTAL ACCUMULATED</p>
                    <p className="text-4xl font-black text-white leading-none">
                      {(atlet.display_points || 0).toLocaleString()} <span className="text-blue-600 text-sm">PTS</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                    <button 
                      disabled={updatingId === atlet.id} 
                      onClick={() => handleUpdatePoin(atlet, atlet.display_points, -100)} 
                      className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-red-600 text-white flex items-center justify-center disabled:opacity-20 transition-all active:scale-95 shadow-lg"
                    >
                       {updatingId === atlet.id ? <Loader2 className="animate-spin" size={16}/> : <Minus size={20} />}
                    </button>
                    <button 
                      disabled={updatingId === atlet.id} 
                      onClick={() => handleUpdatePoin(atlet, atlet.display_points, 100)} 
                      className="w-12 h-12 rounded-xl bg-zinc-800 hover:bg-green-600 text-white flex items-center justify-center disabled:opacity-20 transition-all active:scale-95 shadow-lg"
                    >
                       {updatingId === atlet.id ? <Loader2 className="animate-spin" size={16}/> : <Plus size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {expandedId === atlet.id && (
                <div className="bg-zinc-950 border-x border-b border-blue-600/30 rounded-b-[2.5rem] p-6 animate-in slide-in-from-top-4 duration-300">
                  <div className="grid md:grid-cols-2 gap-4 mb-4 border-b border-zinc-800 pb-4">
                     <div className="bg-zinc-900 p-3 rounded-xl border border-white/5">
                        <p className="text-[8px] text-zinc-500 font-black uppercase">Initial Points (Seeded)</p>
                        <p className="text-lg font-bold">{atlet.raw_points} PTS</p>
                     </div>
                     <div className="bg-zinc-900 p-3 rounded-xl border border-white/5">
                        <p className="text-[8px] text-blue-500 font-black uppercase">Tournament Points (Rankings Sync)</p>
                        <p className="text-lg font-bold">{atlet.raw_total_points} PTS</p>
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-[10px] text-zinc-600 font-black uppercase mb-2">Audit Logs</p>
                    {histories.length > 0 ? histories.map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-[11px] bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${log.perubahan > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-zinc-400 font-mono">{new Date(log.created_at).toLocaleString('id-ID')}</span>
                          <span className="text-zinc-600 uppercase hidden md:inline">{log.tipe_kegiatan}</span>
                        </div>
                        <div className="font-bold">
                          <span className={`${log.perubahan > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {log.perubahan > 0 ? '+' : ''}{log.perubahan} PTS
                          </span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-zinc-600 text-[10px] py-4 font-bold uppercase italic">Belum ada riwayat perubahan.</p>
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
        <div className="flex items-center justify-center gap-4 mt-8 pb-10">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1} 
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2 overflow-x-auto max-w-[200px] md:max-w-none no-scrollbar">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)} 
                className={`flex-shrink-0 w-12 h-12 rounded-xl font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-600 hover:text-zinc-400'}`}
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

      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 transform ${showSuccess ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-90 pointer-events-none'}`}>
        <div className="bg-emerald-600 px-10 py-6 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-4 border border-white/20">
          <CheckCircle2 size={24} className="text-white" />
          <h4 className="text-white font-black uppercase text-lg italic tracking-widest">RANKINGS & STATS SYNCED!</h4>
        </div>
      </div>
    </div>
  );
}import React, { useState, useEffect } from 'react';
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

    // Realtime listener untuk semua tabel terkait
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', table: 'atlet_stats', schema: 'public' }, 
        () => fetchAtlets()
      )
      .on('postgres_changes', 
        { event: '*', table: 'rankings', schema: 'public' }, 
        () => fetchAtlets()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAtlets = async () => {
    setLoading(true);
    try {
      // 1. Ambil data profil dasar
      const { data: profiles, error: pError } = await supabase
        .from('pendaftaran')
        .select('id, nama')
        .order('nama', { ascending: true });

      if (pError) throw pError;

      // 2. Ambil data statistik internal
      const { data: stats, error: sError } = await supabase
        .from('atlet_stats')
        .select('pendaftaran_id, points, total_points');

      if (sError) throw sError;

      // 3. Ambil data ranking (ini yang dipakai di Profil Atlet/Public)
      const { data: rankings, error: rError } = await supabase
        .from('rankings')
        .select('player_name, total_points');

      if (rError) throw rError;

      const statsMap = new Map(stats?.map(s => [s.pendaftaran_id, s]));
      const rankingsMap = new Map(rankings?.map(r => [r.player_name, r.total_points]));
      
      const merged = (profiles || []).map(p => {
        const stat = statsMap.get(p.id);
        // SINKRONISASI KRITIKAL:
        // Jika ada data di tabel rankings, pakai itu sebagai display_points utama
        // agar sama dengan yang muncul di profil atlet (8511 pts)
        const rankingPoints = rankingsMap.get(p.nama) || 0;
        
        return {
          ...p,
          display_points: rankingPoints, // Mengikuti data Rankings (8511)
          raw_points: Number(stat?.points || 0), // Seed
          raw_total_points: Number(stat?.total_points || 0) // Akumulasi tambahan
        };
      });

      setAtlets(merged);
    } catch (err) { 
      console.error("Gagal fetch data:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdatePoin = async (atlet: any, currentDisplayPoints: number, amount: number) => {
    if (updatingId) return;
    setUpdatingId(atlet.id);
    
    // Hitung nilai baru
    const newDisplayPoints = Math.max(0, currentDisplayPoints + amount);
    const newTotalPointsOnly = Math.max(0, atlet.raw_total_points + amount);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Step A: Update stats internal
      const { error: statsError } = await supabase
        .from('atlet_stats')
        .upsert({ 
          pendaftaran_id: atlet.id, 
          player_name: atlet.nama,
          points: atlet.raw_points, 
          total_points: newTotalPointsOnly, 
          last_match_at: new Date().toISOString()
        }, { onConflict: 'pendaftaran_id' });

      if (statsError) throw statsError;

      // Step B: Update Rankings (Public/Profile Data)
      // Ini yang akan mengubah angka 400 menjadi 8511 di tabel ranking
      const { error: rankingsError } = await supabase
        .from('rankings')
        .upsert({ 
          player_name: atlet.nama,
          total_points: newDisplayPoints, 
          updated_at: new Date().toISOString()
        }, { onConflict: 'player_name' });

      if (rankingsError) throw rankingsError;

      // Step C: Log History
      await supabase.from('audit_poin').insert([{
        admin_email: user?.email || 'Admin',
        atlet_id: atlet.id,
        atlet_nama: atlet.nama,
        poin_sebelum: currentDisplayPoints,
        poin_sesudah: newDisplayPoints,
        perubahan: amount,
        tipe_kegiatan: "Manual Adjustment"
      }]);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      fetchAtlets(); // Refresh data untuk memastikan sinkronisasi

    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // --- Sisa kode UI (Search, Filter, Render) tetap sama seperti sebelumnya ---
  const filteredAtlets = atlets.filter(a => a.nama?.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentItems = filteredAtlets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans relative">
      {/* Header & Search */}
      <div className="flex justify-between items-start mb-12">
        <div>
           <h1 className="text-4xl font-black italic uppercase">Point <span className="text-blue-600">Control</span></h1>
           <p className="text-zinc-500 text-[10px] font-bold mt-2 uppercase tracking-widest">Master Sync: Rankings + Atlet Stats</p>
        </div>
        <input 
          type="text" 
          placeholder="Cari atlet..." 
          className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl w-80 outline-none focus:border-blue-600"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List Atlet */}
      <div className="grid gap-4">
        {loading ? <Loader2 className="animate-spin mx-auto mt-20" /> : currentItems.map((atlet) => (
          <div key={atlet.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center"><User /></div>
              <div>
                <h3 className="font-bold text-lg uppercase italic">{atlet.nama}</h3>
                <p className="text-[10px] text-zinc-600">DB RANKING SYNC ACTIVE</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[9px] text-zinc-500 font-bold uppercase">Total Points</p>
                <p className="text-3xl font-black text-white">{atlet.display_points.toLocaleString()}</p>
              </div>
              <div className="flex gap-2 bg-black/50 p-2 rounded-2xl">
                <button onClick={() => handleUpdatePoin(atlet, atlet.display_points, -100)} className="w-10 h-10 bg-zinc-800 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"><Minus size={16}/></button>
                <button onClick={() => handleUpdatePoin(atlet, atlet.display_points, 100)} className="w-10 h-10 bg-zinc-800 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"><Plus size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notification */}
      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 px-8 py-4 rounded-full font-bold animate-bounce">
          DATA BERHASIL DISINKRONKAN!
        </div>
      )}
    </div>
  );
}
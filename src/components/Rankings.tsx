import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from "../supabase"; 
import { 
  TrendingUp, TrendingDown, Minus, Trophy, Search, 
  ChevronLeft, ChevronRight, Loader2, AlertCircle, 
  RefreshCw, History, Calendar, Info, ShieldCheck,
  Activity, Flame, Award
} from 'lucide-react';

// --- Interfaces ---
interface PlayerRanking {
  id: string;
  player_name: string;
  category: string;
  seed: string;
  total_points: number;
  bonus?: number;
}

interface PointHistory {
  id: string;
  created_at: string;
  perubahan: number;
  poin_sebelum: number;
  poin_sesudah: number;
  admin_email: string;
  tipe_kegiatan: string;
}

interface WeeklyTop {
  atlet_nama: string;
  total_gain: number;
  total_aktivitas: number;
}

// --- Komponen Baru: Weekly Spotlight ---
const WeeklySpotlight: React.FC = () => {
  const [topGainer, setTopGainer] = useState<WeeklyTop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyTop = async () => {
      try {
        // Memanggil view yang sudah dibuat di SQL Editor
        const { data, error } = await supabase
          .from('weekly_top_performers')
          .select('*')
          .limit(1)
          .single();
        
        if (error) throw error;
        if (data) setTopGainer(data);
      } catch (err) {
        console.error("Weekly Spotlight Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeeklyTop();
  }, []);

  if (loading || !topGainer) return null;

  return (
    <div className="relative group overflow-hidden bg-gradient-to-br from-orange-600/20 via-slate-900 to-slate-900 border border-orange-500/30 p-6 rounded-[2.5rem] mb-10 shadow-[0_0_50px_-12px_rgba(249,115,22,0.15)] animate-in fade-in zoom-in duration-700">
      <Flame className="absolute -right-4 -bottom-4 w-32 h-32 text-orange-600/10 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 animate-pulse" />
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center rotate-3 border-2 border-orange-400 shadow-lg shadow-orange-500/20">
              <Award className="text-white w-8 h-8" />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Weekly Performance Hero</span>
              <div className="h-[1px] w-8 bg-orange-500/30 rounded-full" />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              {topGainer.atlet_nama}
            </h2>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[120px] text-center transition-transform hover:scale-105">
            <p className="text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Poin Didapat</p>
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-xl">
              <TrendingUp size={16} />
              +{topGainer.total_gain}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[120px] text-center transition-transform hover:scale-105">
            <p className="text-[9px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Aktivitas</p>
            <div className="text-orange-400 font-black text-xl flex items-center justify-center gap-2">
              <Flame size={16} />
              {topGainer.total_aktivitas}x
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Komponen Utama: Rankings ---
const Rankings: React.FC = () => {
  const [dbRankings, setDbRankings] = useState<PlayerRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [playerHistory, setPlayerHistory] = useState<PointHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchRankings();

    const channel = supabase
      .channel('rankings_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rankings' }, () => fetchRankings())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_poin' }, () => fetchRankings())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data: rankingsData, error: rankingsError } = await supabase
        .from('rankings')
        .select('*')
        .order('total_points', { ascending: false });

      if (rankingsError) throw rankingsError;

      const { data: auditData, error: auditError } = await supabase
        .from('audit_poin')
        .select('atlet_nama, perubahan');

      if (auditError) throw auditError;

      const mergedData = (rankingsData || []).map(player => {
        const totalChanges = (auditData || [])
          .filter(audit => audit.atlet_nama === player.player_name)
          .reduce((sum, current) => sum + (current.perubahan || 0), 0);

        return { ...player, bonus: totalChanges };
      });

      setDbRankings(mergedData);
    } catch (error: any) {
      setFetchError(error.message || "Gagal mengambil data peringkat");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryForPlayer = async (playerName: string) => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('audit_poin')
        .select('id, created_at, perubahan, poin_sebelum, poin_sesudah, admin_email, tipe_kegiatan')
        .eq('atlet_nama', playerName)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPlayerHistory(data || []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleExpand = (player: PlayerRanking) => {
    if (expandedPlayer === player.id) {
      setExpandedPlayer(null);
    } else {
      setExpandedPlayer(player.id);
      fetchHistoryForPlayer(player.player_name);
    }
  };

  const getCategoryStyles = (seed: string) => {
    const s = seed?.toUpperCase() || '';
    if (s.includes('A')) return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
    if (s.includes('B+')) return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
    if (s.includes('B-') || s === 'B') return { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' };
    if (s.includes('C')) return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
    return { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' };
  };

  const filteredData = useMemo(() => {
    return dbRankings.filter(p => {
      const name = p.player_name?.toLowerCase() || "";
      const seedRaw = p.seed?.toUpperCase() || "";
      const matchesSearch = name.includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || seedRaw.includes(activeCategory.toUpperCase());
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, dbRankings]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPlayers = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section id="rankings" className="min-h-screen py-20 bg-slate-950 text-white font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#1e3a8a33,transparent_50%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        
        {/* Header & Matrix Section */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
              <Trophy className="text-blue-400" size={14} />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Official Points System</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 italic tracking-tighter uppercase">
              PB US 162 <span className="text-blue-500">RANKINGS</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">Transparansi Perolehan Poin Atlet</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
              <Activity size={16} className="text-blue-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">Matrix Poin</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Latihan Harian', val: '20/10/5' },
                { label: 'Sparing Partner', val: '100/50/25' },
                { label: 'Turnamen Internal', val: '300/--/50' },
                { label: 'Turnamen Eksternal', val: '500/--/100' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">{item.label}</span>
                  <span className="text-xs font-mono font-black text-blue-400">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- PENEMPATAN WEEKLY SPOTLIGHT --- */}
        <WeeklySpotlight />

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="text"
              placeholder="Cari nama atlet..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none font-bold text-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'A', 'B+', 'B-', 'C'].map(cat => (
              <button
                key={cat}
                onClick={() => {setActiveCategory(cat); setCurrentPage(1);}}
                className={`px-5 py-2 rounded-xl text-[10px] font-black border whitespace-nowrap transition-all ${
                  activeCategory === cat ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600'
                }`}
              >
                {cat === 'All' ? 'SEMUA' : `SEED ${cat}`}
              </button>
            ))}
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
            <AlertCircle size={18} />
            <span className="text-xs font-bold uppercase">{fetchError}</span>
          </div>
        )}

        {/* Main Table Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                  <th className="px-8 py-6 text-center w-24">Rank</th>
                  <th className="px-6 py-6">Atlet</th>
                  <th className="px-6 py-6 w-40">Kategori / Seed</th>
                  <th className="px-6 py-6 text-right w-40">Total Poin</th>
                  <th className="px-8 py-6 text-center w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={40} />
                      <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Database...</p>
                    </td>
                  </tr>
                ) : currentPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-20">
                        <Search size={40} />
                        <p className="font-black text-xs uppercase tracking-widest">Atlet tidak ditemukan</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPlayers.map((player) => {
                    const globalRank = dbRankings.findIndex(p => p.id === player.id) + 1;
                    const style = getCategoryStyles(player.seed);
                    const isExpanded = expandedPlayer === player.id;
                    
                    return (
                      <React.Fragment key={player.id}>
                        <tr 
                          onClick={() => toggleExpand(player)}
                          className={`cursor-pointer transition-all group ${isExpanded ? 'bg-blue-500/10' : 'hover:bg-white/[0.02]'}`}
                        >
                          <td className="px-8 py-6 text-center">
                            <span className={`text-xl font-black italic ${globalRank <= 3 ? 'text-blue-400' : 'text-slate-700'}`}>
                              #{String(globalRank).padStart(2, '0')}
                            </span>
                          </td>
                          <td className="px-6 py-6 font-black italic uppercase text-base">
                            <div className="flex items-center gap-3">
                              <span className="group-hover:text-blue-400 transition-colors">{player.player_name}</span>
                              {globalRank === 1 && <Trophy size={16} className="text-amber-400 animate-bounce" />}
                            </div>
                            <div className="flex items-center gap-1 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <Info size={10} className="text-blue-500" />
                                <span className="text-[8px] text-blue-500 font-black uppercase tracking-widest">Detail Riwayat</span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                              <div className="flex flex-col gap-1">
                                <span className={`text-[9px] font-black px-2 py-1 rounded-md border text-center uppercase ${style.bg} ${style.text} ${style.border}`}>
                                  {player.seed || 'UNSEEDED'}
                                </span>
                                <span className="text-[8px] text-slate-600 font-bold text-center uppercase tracking-tighter">
                                  {player.category}
                                </span>
                              </div>
                          </td>
                          <td className="px-6 py-6 text-right font-mono font-black text-white text-xl">
                            {Number(player.total_points || 0).toLocaleString()}
                          </td>
                          <td className="px-8 py-6 text-center">
                            {player.bonus !== undefined && player.bonus !== 0 ? (
                              <div className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold ${player.bonus > 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                {player.bonus > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                                {player.bonus > 0 ? `+${player.bonus}` : player.bonus}
                              </div>
                            ) : <Minus size={14} className="mx-auto text-slate-800" />}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="px-8 py-0 border-none bg-blue-500/[0.02]">
                              <div className="border-x border-b border-blue-500/20 rounded-b-[2rem] p-6 mb-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <History size={14} className="text-blue-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity Log: {player.player_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                                        <ShieldCheck size={10} className="text-blue-500" />
                                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Verified System</span>
                                    </div>
                                </div>

                                {loadingHistory ? (
                                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
                                ) : playerHistory.length > 0 ? (
                                  <div className="space-y-2">
                                    {playerHistory.map((log) => (
                                      <div key={log.id} className="flex items-center justify-between bg-slate-950/80 p-4 rounded-xl border border-white/5 hover:border-blue-500/20 transition-all">
                                        <div className="flex items-center gap-4">
                                          <div className={`p-2 rounded-lg ${log.perubahan > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {log.perubahan > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                          </div>
                                          <div>
                                            <div className="text-[10px] font-mono text-slate-500 mb-1">{new Date(log.created_at).toLocaleString('id-ID')}</div>
                                            <div className="text-[11px] font-black uppercase tracking-tight text-white flex items-center gap-2">
                                              {log.tipe_kegiatan || "Aktivitas Sistem"}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className={`text-sm font-black ${log.perubahan > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {log.perubahan > 0 ? '+' : ''}{log.perubahan}
                                          </div>
                                          <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Balance: {log.poin_sesudah}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
                                    <Calendar className="mx-auto mb-2 text-slate-800" size={24} />
                                    <div className="text-slate-700 text-[10px] font-bold uppercase tracking-widest italic">Belum ada riwayat aktivitas.</div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="p-6 flex items-center justify-between border-t border-slate-800 bg-slate-900/50">
            <button 
              onClick={fetchRankings} 
              disabled={loading}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-600 hover:text-blue-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Page {currentPage} of {totalPages || 1}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1 || loading} 
                  onClick={() => setCurrentPage(c => c - 1)} 
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl disabled:opacity-10 transition-colors"
                >
                  <ChevronLeft size={18}/>
                </button>
                <button 
                  disabled={currentPage === totalPages || totalPages === 0 || loading} 
                  onClick={() => setCurrentPage(c => c + 1)} 
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl disabled:opacity-10 transition-colors"
                >
                  <ChevronRight size={18}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default Rankings; 
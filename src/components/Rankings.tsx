import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from "../supabase"; // Pastikan path sesuai
import { TrendingUp, Minus, Trophy, Search, ChevronLeft, ChevronRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// Interface sesuai kolom di database Supabase
interface PlayerRanking {
  id: string;
  player_name: string;
  category: string;
  seed: string;
  total_points: number;
  bonus?: number;
}

const Rankings: React.FC = () => {
  const [dbRankings, setDbRankings] = useState<PlayerRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Ambil Data dari Supabase
  useEffect(() => {
    fetchRankings();

    // Setup Realtime agar ranking update otomatis saat admin input skor/atlet baru
    const subscription = supabase
      .channel('public:rankings_landing') // Channel unik untuk landing page
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rankings' }, 
        (payload) => {
          console.log("Change detected:", payload);
          fetchRankings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchRankings = async () => {
    try {
      // Menarik data terbaru dari tabel rankings
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('total_points', { ascending: false }); // Urutkan poin tertinggi di atas

      if (error) throw error;
      
      if (data) {
        setDbRankings(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Styling Kategori yang diperluas
  const getCategoryStyles = (seed: string) => {
    const s = seed?.toUpperCase() || '';
    if (s.includes('A')) return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
    if (s.includes('B+')) return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
    if (s.includes('B-')) return { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' };
    if (s.includes('C')) return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
    return { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' };
  };

  // 3. Filter Data dengan pengecekan null safety
  const filteredData = useMemo(() => {
    return dbRankings.filter(p => {
      const name = p.player_name?.toLowerCase() || "";
      const seed = p.seed || "";
      
      const matchesSearch = name.includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || 
                              seed === `Seed ${activeCategory}` || 
                              seed === activeCategory ||
                              (activeCategory === 'A' && seed.includes('A'));
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, dbRankings]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPlayers = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section id="rankings" className="min-h-screen py-20 bg-slate-950 text-white font-sans scroll-mt-20 relative overflow-hidden">
      {/* Ornamen Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#1e3a8a33,transparent_50%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <Trophy className="text-blue-400" size={14} />
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Live Points System</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 italic tracking-tighter uppercase">
            PB US 162 <span className="text-blue-500">RANKINGS</span>
          </h1>
          <p className="text-slate-500 text-sm uppercase tracking-widest font-bold opacity-70 max-w-lg mx-auto leading-relaxed">
            Poin otomatis diperbarui berdasarkan hasil Internal Cup 2026 secara real-time.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="text"
              placeholder="Cari atlet..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none transition-all font-bold text-sm focus:ring-4 focus:ring-blue-500/5"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['All', 'A', 'B+', 'B-', 'C'].map(cat => (
              <button
                key={cat}
                onClick={() => {setActiveCategory(cat); setCurrentPage(1);}}
                className={`px-5 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border ${
                  activeCategory === cat ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                {cat === 'All' ? 'SEMUA' : `SEED ${cat}`}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                  <th className="px-8 py-6 text-center w-24">Rank</th>
                  <th className="px-6 py-6">Atlet</th>
                  <th className="px-6 py-6 w-40">Kategori</th>
                  <th className="px-6 py-6 text-right w-40">Total Poin</th>
                  <th className="px-8 py-6 text-center w-32">Bonus</th>
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
                ) : dbRankings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <AlertCircle size={48} />
                        <p className="font-black text-xs uppercase tracking-[0.3em]">Belum ada data atlet</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <p className="text-slate-600 font-black text-xs uppercase tracking-widest italic">Atlet tidak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  currentPlayers.map((player) => {
                    // Global rank dihitung dari posisi di dbRankings yang sudah terurut
                    const globalRank = dbRankings.findIndex(p => p.id === player.id) + 1;
                    const style = getCategoryStyles(player.seed);
                    
                    return (
                      <tr key={player.id} className="hover:bg-white/[0.02] transition-all group">
                        <td className="px-8 py-6 text-center">
                          <span className={`text-xl font-black italic ${globalRank <= 3 ? 'text-blue-400' : 'text-slate-700'}`}>
                            #{String(globalRank).padStart(2, '0')}
                          </span>
                        </td>
                        <td className="px-6 py-6 font-black italic uppercase tracking-tighter text-base">
                          <div className="flex items-center gap-3">
                            <span className="group-hover:text-blue-400 transition-colors">{player.player_name}</span>
                            {globalRank === 1 && <Trophy size={16} className="text-amber-400 animate-pulse" />}
                            {globalRank === 2 && <Trophy size={16} className="text-slate-300" />}
                            {globalRank === 3 && <Trophy size={16} className="text-amber-700" />}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest whitespace-nowrap ${style.bg} ${style.text} ${style.border}`}>
                            {player.seed || 'NON-SEED'}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right font-mono font-black text-white text-xl tracking-tighter">
                          {(player.total_points || 0).toLocaleString()}
                        </td>
                        <td className="px-8 py-6 text-center">
                          {player.bonus && player.bonus > 0 ? (
                            <div className={`inline-flex items-center font-black text-[10px] ${style.text} bg-white/5 px-2 py-1 rounded-md`}>
                              <TrendingUp size={12} className="mr-1" /> +{player.bonus}
                            </div>
                          ) : (
                            <Minus size={14} className="mx-auto text-slate-800 opacity-30" />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-6 flex flex-col md:flex-row items-center justify-between border-t border-slate-800 bg-slate-900/50 gap-4">
            <div className="flex items-center gap-4">
               <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                Menampilkan {currentPlayers.length} dari {filteredData.length} Atlet
              </span>
              <button 
                onClick={fetchRankings}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-600 hover:text-blue-400"
                title="Refresh Data"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                Halaman {currentPage} <span className="text-slate-800 mx-1">/</span> {totalPages || 1}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => { setCurrentPage(c => c - 1); }} 
                  className="p-3 bg-slate-800 hover:bg-blue-600 disabled:hover:bg-slate-800 rounded-xl disabled:opacity-10 transition-all border border-white/5"
                >
                  <ChevronLeft size={18}/>
                </button>
                <button 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  onClick={() => { setCurrentPage(c => c + 1); }} 
                  className="p-3 bg-slate-800 hover:bg-blue-600 disabled:hover:bg-slate-800 rounded-xl disabled:opacity-10 transition-all border border-white/5"
                >
                  <ChevronRight size={18}/>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Info */}
        <p className="text-center mt-8 text-slate-600 text-[9px] font-bold uppercase tracking-[0.2em]">
          Internal Cup 162 &copy; 2026 • Verified Tournament Data
        </p>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default Rankings;
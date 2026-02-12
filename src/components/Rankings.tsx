import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from "../supabase"; // Pastikan path sesuai
import { TrendingUp, Minus, Trophy, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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

    // Setup Realtime agar ranking update otomatis saat admin input skor
    const subscription = supabase
      .channel('public:rankings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rankings' }, () => {
        fetchRankings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchRankings = async () => {
    try {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('total_points', { ascending: false }); // Urutkan poin tertinggi di atas

      if (error) throw error;
      if (data) setDbRankings(data);
    } catch (error) {
      console.error("Gagal mengambil data ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Styling Kategori (Tetap dipertahankan dari kode sebelumnya)
  const getCategoryStyles = (seed: string) => {
    switch (seed) {
      case 'Seed A': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
      case 'Seed B+': return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
      case 'Seed B-': return { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' };
      default: return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
    }
  };

  // 3. Filter Data
  const filteredData = useMemo(() => {
    return dbRankings.filter(p => {
      const matchesSearch = p.player_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || p.seed === `Seed ${activeCategory}` || p.seed === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, dbRankings]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPlayers = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section id="rankings" className="min-h-screen py-20 bg-slate-950 text-white font-sans scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <Trophy className="text-blue-400" size={14} />
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Live Points System</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 italic tracking-tighter">PB US 162 RANKINGS</h1>
          <p className="text-slate-500 text-sm uppercase tracking-widest font-bold opacity-70">
            Poin otomatis diperbarui berdasarkan hasil Internal Cup 2026
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="text"
              placeholder="Cari atlet..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none transition-all font-bold text-sm"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', 'A', 'B+', 'B-', 'C'].map(cat => (
              <button
                key={cat}
                onClick={() => {setActiveCategory(cat); setCurrentPage(1);}}
                className={`px-5 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border ${
                  activeCategory === cat ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600'
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                  <th className="px-8 py-6 text-center">Rank</th>
                  <th className="px-6 py-6">Atlet</th>
                  <th className="px-6 py-6">Kategori</th>
                  <th className="px-6 py-6 text-right">Total Poin</th>
                  <th className="px-8 py-6 text-center">Bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-500" size={40} />
                      <p className="text-slate-500 mt-4 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Database...</p>
                    </td>
                  </tr>
                ) : currentPlayers.map((player) => {
                  // Rank dihitung berdasarkan posisi di dbRankings (yang sudah disortir poinnya)
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
                          {player.player_name}
                          {globalRank <= 3 && <Trophy size={16} className="text-amber-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${style.bg} ${style.text} ${style.border}`}>
                          {player.seed}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right font-mono font-black text-white text-xl tracking-tighter">
                        {player.total_points.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-center">
                        {player.bonus && player.bonus > 0 ? (
                          <div className={`inline-flex items-center font-black text-[10px] ${style.text} bg-white/5 px-2 py-1 rounded-md`}>
                            <TrendingUp size={12} className="mr-1" /> +{player.bonus}
                          </div>
                        ) : <Minus size={14} className="mx-auto text-slate-800 opacity-30" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-6 flex items-center justify-between border-t border-slate-800 bg-slate-900/50">
            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
              Halaman {currentPage} <span className="text-slate-800 mx-1">/</span> {totalPages || 1}
            </span>
            <div className="flex gap-3">
              <button 
                disabled={currentPage === 1} 
                onClick={() => { setCurrentPage(c => c - 1); window.scrollTo({ top: document.getElementById('rankings')?.offsetTop }); }} 
                className="p-3 bg-slate-800 hover:bg-blue-600 rounded-xl disabled:opacity-10 transition-all border border-white/5"
              >
                <ChevronLeft size={18}/>
              </button>
              <button 
                disabled={currentPage === totalPages || totalPages === 0} 
                onClick={() => { setCurrentPage(c => c + 1); window.scrollTo({ top: document.getElementById('rankings')?.offsetTop }); }} 
                className="p-3 bg-slate-800 hover:bg-blue-600 rounded-xl disabled:opacity-10 transition-all border border-white/5"
              >
                <ChevronRight size={18}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rankings;
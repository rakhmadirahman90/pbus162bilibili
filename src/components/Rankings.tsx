import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Trophy, Medal, Target, Users, Search, Filter, Loader2 } from 'lucide-react';

export default function RankingTable() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- KODE BARU: State untuk Filter Kategori ---
  const [filterCategory, setFilterCategory] = useState('ALL'); // ALL, MUDA, SENIOR

  useEffect(() => {
    fetchRankings();
  }, [filterCategory]); // Fetch ulang jika filter kategori berubah

  async function fetchRankings() {
    setLoading(true);
    try {
      let query = supabase
        .from('rankings')
        .select('*')
        .order('poin', { ascending: false });

      // --- KODE BARU: Filter berdasarkan kategori_atlet sesuai Admin ---
      if (filterCategory !== 'ALL') {
        query = query.eq('kategori_atlet', filterCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRankings(data || []);
    } catch (err) {
      console.error('Error fetching rankings:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter pencarian nama
  const filteredRankings = rankings.filter(item =>
    item.player_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
              Peringkat <span className="text-blue-600">Atlet</span>
            </h2>
            <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Update Poin Nasional PB US 162</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Cari Nama Atlet..."
                className="pl-10 pr-4 py-2 rounded-xl border-2 border-slate-100 focus:border-blue-600 outline-none font-bold text-sm transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* --- KODE BARU: Toggle Filter Kategori (MUDA/SENIOR) --- */}
            <div className="flex bg-slate-100 p-1 rounded-xl border-2 border-slate-100">
              {['ALL', 'MUDA', 'SENIOR'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                    filterCategory === cat 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Memuat Data Peringkat...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-[0.2em] font-black">
                    <th className="px-6 py-5 text-center">Rank</th>
                    <th className="px-6 py-5">Atlet</th>
                    <th className="px-6 py-5 hidden md:table-cell">Kategori</th>
                    <th className="px-6 py-5 text-center">Poin</th>
                    <th className="px-6 py-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRankings.map((player, index) => (
                    <tr key={player.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          {index === 0 ? (
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-100">
                              <Trophy size={18} className="text-white" />
                            </div>
                          ) : index === 1 ? (
                            <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center shadow-lg shadow-slate-100">
                              <Medal size={18} className="text-white" />
                            </div>
                          ) : index === 2 ? (
                            <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-orange-100">
                              <Medal size={18} className="text-white" />
                            </div>
                          ) : (
                            <span className="font-black text-slate-300 group-hover:text-blue-600 transition-colors italic">#{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                            {player.player_name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase md:hidden">
                            {player.kategori_atlet} • {player.kategori}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <div className="flex flex-col">
                           <span className={`text-[9px] font-black px-2 py-0.5 rounded-full w-fit mb-1 ${
                             player.kategori_atlet === 'SENIOR' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                           }`}>
                             {player.kategori_atlet}
                           </span>
                           <span className="text-xs font-bold text-slate-500 uppercase">{player.kategori}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-blue-600 tracking-tighter">{player.poin}</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PTS</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                           <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                             <Target size={12} className="animate-pulse" />
                             <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                           </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && filteredRankings.length === 0 && (
            <div className="py-20 text-center">
              <Users className="mx-auto text-slate-200 mb-4" size={60} />
              <p className="text-slate-400 font-bold uppercase tracking-widest">Tidak ada data atlet ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
import React, { useState, useMemo } from 'react';
import { TrendingUp, Minus, Trophy, Search, Crown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// 1. STRUKTUR DATA EVENT (Update di sini setiap ada turnamen baru)
const EVENT_LOG = [
  { id: 1, name: "Internal Cup III", date: "Jan 2026", winners: ["Herman", "H. Wawan", "Arsan", "Marzuki"] },
  { id: 2, name: "Internal Cup IV", date: "Feb 2026", winners: ["Agustilaar", "Bustan", "H. Hasym", "Prof. Fikri", "Dr. Khaliq", "Momota", "Yakob", "H. Anwar"] },
];

const Rankings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Konfigurasi Gaya Kategori
  const categoryStyles: Record<string, any> = {
    'A': { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    'B+': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
    'B-': { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' },
    'C': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  };

  // 2. DATA DASAR PEMAIN
  const basePlayers = {
    categoryA: ["Agustilaar", "Herman", "Darwis (TNI)", "Salman", "Lutfi", "Udin", "Aldy Sandra", "Mustakim", "Rifai", "Acos"],
    categoryBPlus: ["H. Wawan", "Bustan", "Dr. Khaliq", "Momota", "H. Ismail", "Saleh", "H. Zaidi", "Zainuddin", "Lumpue", "Madhy", "Vhio", "Anto", "Lukman", "Sandra", "Amri", "Nasri Lapas", "Aprijal", "Arifuddin", "H Amier", "Rustam", "A. Arwan", "Laganing"],
    categoryBMinus: ["Prof. Fikri", "Marzuki", "A. Mansur", "Darwis R.", "Ali", "Saldy", "Mulyadi", "Haedir", "H Fitra", "Kurnia"],
    categoryC: ["Arsan", "H. Hasym", "H. Anwar", "Yakob", "Ust. Usman", "H. Tantong", "Surakati", "H. Faizal", "Markus", "H. Ude", "Hidayatullah", "H. Pangeran", "Syarifuddin"]
  };

  // 3. LOGIKA UPDATE OTOMATIS
  const processedData = useMemo(() => {
    const calculateBonus = (name: string) => {
      // Menghitung poin: Setiap kali menang di event, dapat 100-500 poin (asumsi)
      // Di sini kita filter EVENT_LOG, jika nama ada di daftar winners, tambahkan poinnya
      return EVENT_LOG.reduce((acc, event) => {
        return event.winners.includes(name) ? acc + 250 : acc; 
      }, 0);
    };

    const all = [
      ...basePlayers.categoryA.map((name, i) => ({ name, catGroup: 'A', catLabel: 'Seed A', base: 10000 - (i * 100) })),
      ...basePlayers.categoryBPlus.map((name, i) => ({ name, catGroup: 'B+', catLabel: 'Seed B+', base: 8500 - (i * 50) })),
      ...basePlayers.categoryBMinus.map((name, i) => ({ name, catGroup: 'B-', catLabel: 'Seed B-', base: 7000 - (i * 50) })),
      ...basePlayers.categoryC.map((name, i) => ({ name, catGroup: 'C', catLabel: 'Seed C', base: 5500 - (i * 50) }))
    ].map(p => {
      const bonus = calculateBonus(p.name);
      return {
        ...p,
        bonus,
        totalPoints: p.base + bonus,
        isWinner: bonus > 0
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);

    return all;
  }, []);

  const filteredData = useMemo(() => {
    return processedData.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || p.catGroup === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, processedData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPlayers = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section id="rankings" className="min-h-screen py-24 bg-slate-950 text-white font-sans scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-blue-500/10 rounded-full mb-4 border border-blue-500/20">
            <Trophy className="text-blue-400 mr-2" size={18} />
            <span className="text-blue-400 text-[10px] font-bold tracking-[0.2em] uppercase">Sistem Poin Otomatis v2.0</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white via-blue-200 to-slate-500 bg-clip-text text-transparent">
            RANKING PEMAIN
          </h1>
          <div className="flex items-center justify-center gap-4 text-slate-500 text-sm font-medium">
             <span className="flex items-center gap-1"><Calendar size={14}/> Last Event: {EVENT_LOG[EVENT_LOG.length - 1].name}</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Cari atlet pemenang..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-md-end">
            {['All', 'A', 'B+', 'B-', 'C'].map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
                  activeCategory === cat ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {cat === 'All' ? 'SEMUA' : `SEED ${cat}`}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel Klasemen */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 py-6">Pos</th>
                <th className="px-6 py-6">Nama Atlet</th>
                <th className="px-6 py-6">Kategori</th>
                <th className="px-6 py-6 text-right">Total Poin</th>
                <th className="px-6 py-6 text-center">Tren</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {currentPlayers.map((player) => {
                const globalRank = processedData.findIndex(p => p.name === player.name) + 1;
                const style = categoryStyles[player.catGroup];
                
                return (
                  <tr key={player.name} className="hover:bg-blue-500/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                        globalRank <= 3 ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {globalRank}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-200 group-hover:text-white transition-colors">
                          {player.name}
                        </span>
                        {player.isWinner && (
                          <div className="relative">
                            <Trophy size={16} className={`${style.text} animate-bounce`} />
                            <div className={`absolute inset-0 blur-md ${style.text} opacity-20`}></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-md border ${style.bg} ${style.text} ${style.border}`}>
                        {player.catLabel}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-mono font-black text-white text-xl">
                      {player.totalPoints.toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center">
                        {player.bonus > 0 ? (
                          <>
                            <TrendingUp size={16} className="text-emerald-500 mb-1" />
                            <span className="text-[9px] font-bold text-emerald-500">+{player.bonus}</span>
                          </>
                        ) : (
                          <Minus size={16} className="text-slate-800" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-6 bg-slate-900 flex items-center justify-between border-t border-slate-800">
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Showing {currentPlayers.length} of {filteredData.length} Players
             </span>
             <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-20 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rankings;
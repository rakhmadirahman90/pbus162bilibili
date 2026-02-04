import React, { useState, useMemo } from 'react';
import { TrendingUp, Minus, Trophy, Search, Crown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// 1. DAFTAR EVENT (Cukup update nama pemenang di sini)
const EVENT_LOG = [
  { 
    id: 1, 
    name: "Internal Cup IV 2026", 
    date: "Februari 2026", 
    // Masukkan semua nama yang mendapatkan poin tambahan di sini
    winners: [
      "Agustilaar", "Herman", "H. Wawan", "Bustan", "Dr. Khaliq", 
      "Momota", "Prof. Fikri", "Marzuki", "Arsan", "H. Hasym", 
      "H. Anwar", "Yakob"
    ] 
  },
];

const Rankings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 2. ATURAN POIN SESUAI KATEGORI
  const categorySettings: Record<string, any> = {
    'A': { 
        base: 10000, 
        winBonus: 300, // Contoh: Menang di Seed A +300 atau +200
        styles: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' } 
    },
    'B+': { 
        base: 8500, 
        winBonus: 500, // Menang di Seed B+ +500
        styles: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' } 
    },
    'B-': { 
        base: 7000, 
        winBonus: 300, // Menang di Seed B- +300 atau +200
        styles: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' } 
    },
    'C': { 
        base: 5500, 
        winBonus: 500, // Menang di Seed C +500 atau +300
        styles: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' } 
    },
  };

  // 3. DATA DASAR ATLET
  const basePlayers = {
    categoryA: ["Agustilaar", "Herman", "Darwis (TNI)", "Salman", "Lutfi", "Udin", "Aldy Sandra", "Mustakim", "Rifai", "Acos"],
    categoryBPlus: ["H. Wawan", "Bustan", "Dr. Khaliq", "Momota", "H. Ismail", "Saleh", "H. Zaidi", "Zainuddin", "Lumpue", "Madhy", "Vhio", "Anto", "Lukman", "Sandra", "Amri", "Nasri Lapas", "Aprijal", "Arifuddin", "H Amier", "Rustam", "A. Arwan", "Laganing"],
    categoryBMinus: ["Prof. Fikri", "Marzuki", "A. Mansur", "Darwis R.", "Ali", "Saldy", "Mulyadi", "Haedir", "H Fitra", "Kurnia"],
    categoryC: ["Arsan", "H. Hasym", "H. Anwar", "Yakob", "Ust. Usman", "H. Tantong", "Surakati", "H. Faizal", "Markus", "H. Ude", "Hidayatullah", "H. Pangeran", "Syarifuddin"]
  };

  // 4. PROSES DATA OTOMATIS
  const processedData = useMemo(() => {
    const all = [
      ...basePlayers.categoryA.map((name, i) => ({ name, catGroup: 'A', catLabel: 'Seed A', rankIndex: i })),
      ...basePlayers.categoryBPlus.map((name, i) => ({ name, catGroup: 'B+', catLabel: 'Seed B+', rankIndex: i })),
      ...basePlayers.categoryBMinus.map((name, i) => ({ name, catGroup: 'B-', catLabel: 'Seed B-', rankIndex: i })),
      ...basePlayers.categoryC.map((name, i) => ({ name, catGroup: 'C', catLabel: 'Seed C', rankIndex: i }))
    ].map(p => {
      const config = categorySettings[p.catGroup];
      
      // Hitung Base Point (menurun berdasarkan urutan awal)
      const playerBase = config.base - (p.rankIndex * 50);
      
      // Cek apakah menang di Event (Otomatis ambil poin sesuai kategori)
      const isWinner = EVENT_LOG.some(event => event.winners.includes(p.name));
      const bonus = isWinner ? config.winBonus : 0;

      return {
        ...p,
        bonus,
        totalPoints: playerBase + bonus,
        isWinner
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
    <section id="rankings" className="min-h-screen py-20 bg-slate-950 text-white font-sans scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <Trophy className="text-blue-400" size={14} />
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Live Points System</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">PB US 162 RANKINGS</h1>
          <p className="text-slate-500 text-sm">Poin otomatis diperbarui berdasarkan hasil {EVENT_LOG[EVENT_LOG.length-1].name}</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              type="text"
              placeholder="Cari atlet..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', 'A', 'B+', 'B-', 'C'].map(cat => (
              <button
                key={cat}
                onClick={() => {setActiveCategory(cat); setCurrentPage(1);}}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {cat === 'All' ? 'SEMUA' : `SEED ${cat}`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                  <th className="px-6 py-5">Global Rank</th>
                  <th className="px-6 py-5">Atlet</th>
                  <th className="px-6 py-5">Kategori</th>
                  <th className="px-6 py-5 text-right">Total Poin</th>
                  <th className="px-6 py-5 text-center">Bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {currentPlayers.map((player) => {
                  const globalRank = processedData.findIndex(p => p.name === player.name) + 1;
                  const config = categorySettings[player.catGroup];
                  
                  return (
                    <tr key={player.name} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <span className={`font-mono font-bold ${globalRank <= 3 ? 'text-blue-400' : 'text-slate-600'}`}>
                          #{String(globalRank).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold">
                        <div className="flex items-center gap-2">
                          {player.name}
                          {player.isWinner && (
                            <Trophy size={14} className={`${config.styles.text} animate-pulse`} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-black px-2 py-1 rounded border ${config.styles.bg} ${config.styles.text} ${config.styles.border}`}>
                          {player.catLabel}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono font-black text-white text-lg">
                        {player.totalPoints.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {player.isWinner ? (
                          <div className={`inline-flex items-center font-bold text-[10px] ${config.styles.text}`}>
                            <TrendingUp size={12} className="mr-1" /> +{player.bonus}
                          </div>
                        ) : <Minus size={14} className="mx-auto text-slate-800" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-between border-t border-slate-800 bg-slate-900/50">
            <span className="text-[10px] text-slate-600 font-bold uppercase">Hal {currentPage} / {totalPages || 1}</span>
            <div className="flex gap-2">
              <button disabled={currentPage===1} onClick={()=>setCurrentPage(c=>c-1)} className="p-2 bg-slate-800 rounded-lg disabled:opacity-20"><ChevronLeft size={16}/></button>
              <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(c=>c+1)} className="p-2 bg-slate-800 rounded-lg disabled:opacity-20"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rankings;
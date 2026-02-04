import React, { useState, useMemo } from 'react';
import { TrendingUp, Minus, Trophy, Medal, Search, Crown, ChevronLeft, ChevronRight } from 'lucide-react';

interface PlayerData {
  name: string;
  bonus: number;
}

const Rankings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Data Mentah berdasarkan dokumentasi internal
  const rawData: Record<string, PlayerData[]> = {
    categoryA: [
      { name: "Agustilaar", bonus: 200 }, { name: "Herman", bonus: 300 },
      { name: "Darwis (TNI)", bonus: 0 }, { name: "Salman", bonus: 0 },
      { name: "Lutfi", bonus: 0 }, { name: "Udin", bonus: 0 },
      { name: "Aldy Sandra", bonus: 0 }, { name: "Mustakim", bonus: 0 },
      { name: "Rifai", bonus: 0 }, { name: "Acos", bonus: 0 }
    ],
    categoryBPlus: [
      { name: "H. Wawan", bonus: 500 }, { name: "Bustan", bonus: 500 },
      { name: "Dr. Khaliq", bonus: 100 }, { name: "Momota", bonus: 100 },
      { name: "H. Ismail", bonus: 0 }, { name: "Saleh", bonus: 0 },
      { name: "H. Zaidi", bonus: 0 }, { name: "Zainuddin", bonus: 0 },
      { name: "Lumpue", bonus: 0 }, { name: "Madhy", bonus: 0 },
      { name: "Vhio", bonus: 0 }, { name: "Anto", bonus: 0 },
      { name: "Lukman", bonus: 0 }, { name: "Sandra", bonus: 0 },
      { name: "Amri", bonus: 0 }, { name: "Nasri Lapas", bonus: 0 },
      { name: "Aprijal", bonus: 0 }, { name: "Arifuddin", bonus: 0 },
      { name: "H Amier", bonus: 0 }, { name: "Rustam", bonus: 0 },
      { name: "A. Arwan", bonus: 0 }, { name: "Laganing", bonus: 0 }
    ],
    categoryBMinus: [
      { name: "Prof. Fikri", bonus: 200 }, { name: "Marzuki", bonus: 300 },
      { name: "A. Mansur", bonus: 0 }, { name: "Darwis R.", bonus: 0 },
      { name: "Ali", bonus: 0 }, { name: "Saldy", bonus: 0 },
      { name: "Mulyadi", bonus: 0 }, { name: "Haedir", bonus: 0 },
      { name: "H Fitra", bonus: 0 }, { name: "Kurnia", bonus: 0 }
    ],
    categoryC: [
      { name: "Arsan", bonus: 500 }, { name: "H. Hasym", bonus: 500 },
      { name: "H. Anwar", bonus: 300 }, { name: "Yakob", bonus: 300 },
      { name: "Ust. Usman", bonus: 0 }, { name: "H. Tantong", bonus: 0 },
      { name: "Surakati", bonus: 0 }, { name: "H. Faizal", bonus: 0 },
      { name: "Markus", bonus: 0 }, { name: "H. Ude", bonus: 0 },
      { name: "Hidayatullah", bonus: 0 }, { name: "H. Pangeran", bonus: 0 },
      { name: "Syarifuddin", bonus: 0 }
    ]
  };

  // Pengolahan Data dengan useMemo untuk performa
  const allPlayers = useMemo(() => {
    return [
      ...rawData.categoryA.map((p, i) => ({ ...p, catGroup: 'A', catLabel: 'Seed A', base: 10000 - (i * 100) })),
      ...rawData.categoryBPlus.map((p, i) => ({ ...p, catGroup: 'B+', catLabel: 'Seed B+', base: 8500 - (i * 50) })),
      ...rawData.categoryBMinus.map((p, i) => ({ ...p, catGroup: 'B-', catLabel: 'Seed B-', base: 7000 - (i * 50) })),
      ...rawData.categoryC.map((p, i) => ({ ...p, catGroup: 'C', catLabel: 'Seed C', base: 5500 - (i * 50) }))
    ]
    .map(player => ({
      ...player,
      totalPoints: player.base + player.bonus,
      status: player.bonus > 0 ? 'up' : 'same'
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
  }, []);

  // Filter Gabungan (Nama + Kategori)
  const filteredData = useMemo(() => {
    return allPlayers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || p.catGroup === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, allPlayers]);

  // Kalkulasi Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPlayers = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const categories = [
    { id: 'All', label: 'Semua Kategori' },
    { id: 'A', label: 'Seed A' },
    { id: 'B+', label: 'Seed B+' },
    { id: 'B-', label: 'Seed B-' },
    { id: 'C', label: 'Seed C' },
  ];

  return (
    <section id="rankings" className="min-h-screen py-24 bg-slate-950 text-white font-sans scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* JUDUL TETAP ADA */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-blue-500/10 rounded-full mb-4 border border-blue-500/20">
            <Crown className="text-blue-400 mr-2" size={20} />
            <span className="text-blue-400 text-[10px] font-bold tracking-[0.3em] uppercase">Klasemen Kategori Seeded</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            PERINGKAT PB US 162 Bilibili
          </h1>
          <p className="text-slate-500 font-medium italic">Update Turnamen Internal Cup IV 2026</p>
        </div>

        {/* TOOLBAR FILTER & SEARCH */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Input Pencarian Nama */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                placeholder="Cari nama atlet..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            {/* Filter Dropdown/Pills untuk Kategori */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    activeCategory === cat.id 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                <tr>
                  <th className="px-6 py-5">Global Rank</th>
                  <th className="px-6 py-5">Atlet</th>
                  <th className="px-6 py-5">Kategori</th>
                  <th className="px-6 py-5 text-right">Poin</th>
                  <th className="px-6 py-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {currentPlayers.map((player) => {
                  const globalRank = allPlayers.findIndex(p => p.name === player.name) + 1;
                  return (
                    <tr key={player.name} className="hover:bg-blue-500/[0.03] transition-colors group">
                      <td className="px-6 py-5">
                        <span className={`font-mono font-bold ${globalRank <= 3 ? 'text-blue-400' : 'text-slate-600'}`}>
                          #{String(globalRank).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-200 group-hover:text-blue-400">
                        <div className="flex items-center gap-2">
                          {player.name}
                          {player.bonus >= 500 && <Trophy size={14} className="text-yellow-500 animate-bounce" />}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-500">
                          {player.catLabel}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono font-black text-blue-400 text-lg">
                        {player.totalPoints.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {player.status === 'up' ? (
                          <div className="inline-flex items-center text-emerald-500 font-bold text-[10px]">
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

          {/* NAVIGASI HALAMAN (NEXT/PREVIOUS) */}
          <div className="p-5 bg-slate-800/20 flex items-center justify-between border-t border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Halaman {currentPage} dari {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(prev => prev - 1); document.getElementById('rankings')?.scrollIntoView(); }}
                className="p-2 bg-slate-950 border border-slate-800 rounded-lg disabled:opacity-20 hover:border-blue-500/50 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => { setCurrentPage(prev => prev + 1); document.getElementById('rankings')?.scrollIntoView(); }}
                className="p-2 bg-slate-950 border border-slate-800 rounded-lg disabled:opacity-20 hover:border-blue-500/50 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rankings;
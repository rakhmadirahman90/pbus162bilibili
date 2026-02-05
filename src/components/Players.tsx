import React, { useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Target, Star, Search, Award, ArrowRight, ChevronLeft, ChevronRight, Trophy 
} from 'lucide-react';

// Sync dengan EVENT_LOG dari Rankings
const EVENT_LOG = [
  { 
    id: 1, 
    winners: [
      "Agustilaar", "Herman", "H. Wawan", "Bustan", "Dr. Khaliq", 
      "Momota", "Prof. Fikri", "Marzuki", "Arsan", "H. Hasym", 
      "H. Anwar", "Yakob"
    ] 
  },
];

const Players: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // 1. DATA DASAR (Sesuai Rankings)
  const basePlayers = {
    categoryA: ["Agustilaar", "Herman", "Darwis (TNI)", "Salman", "Lutfi", "Udin", "Aldy Sandra", "Mustakim", "Rifai", "Acos"],
    categoryBPlus: ["H. Wawan", "Bustan", "Dr. Khaliq", "Momota", "H. Ismail", "Saleh", "H. Zaidi", "Zainuddin", "Lumpue", "Madhy", "Vhio", "Anto", "Lukman", "Sandra", "Amri", "Nasri Lapas", "Aprijal", "Arifuddin", "H Amier", "Rustam", "A. Arwan", "Laganing"],
    categoryBMinus: ["Prof. Fikri", "Marzuki", "A. Mansur", "Darwis R.", "Ali", "Saldy", "Mulyadi", "Haedir", "H Fitra", "Kurnia"],
    categoryC: ["Arsan", "H. Hasym", "H. Anwar", "Yakob", "Ust. Usman", "H. Tantong", "Surakati", "H. Faizal", "Markus", "H. Ude", "Hidayatullah", "H. Pangeran", "Syarifuddin"]
  };

  // 2. PROSES DATA (Logic yang sama dengan Ranking untuk menentukan urutan)
  const processedPlayers = useMemo(() => {
    const config: Record<string, any> = {
      'A': { base: 10000, bonus: 300, label: 'Seed A' },
      'B+': { base: 8500, bonus: 500, label: 'Seed B+' },
      'B-': { base: 7000, bonus: 300, label: 'Seed B-' },
      'C': { base: 5500, bonus: 500, label: 'Seed C' },
    };

    const all = [
      ...basePlayers.categoryA.map((name, i) => ({ name, group: 'A', rankIndex: i })),
      ...basePlayers.categoryBPlus.map((name, i) => ({ name, group: 'B+', rankIndex: i })),
      ...basePlayers.categoryBMinus.map((name, i) => ({ name, group: 'B-', rankIndex: i })),
      ...basePlayers.categoryC.map((name, i) => ({ name, group: 'C', rankIndex: i }))
    ].map(p => {
      const conf = config[p.group];
      const isWinner = EVENT_LOG[0].winners.includes(p.name);
      const totalPoints = (conf.base - (p.rankIndex * 50)) + (isWinner ? conf.bonus : 0);
      
      return {
        ...p,
        totalPoints,
        isWinner,
        categoryLabel: conf.label,
        // Mock image logic - sesuaikan dengan path gambar asli Anda
        image: p.name === "Agustilaar" ? "whatsapp_image_2026-02-05_at_11.38.00.jpeg" : 
               p.name === "Hidayatullah" ? "whatsapp_image_2025-12-30_at_15.33.37.jpeg" :
               `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);

    return all;
  }, []);

  const filteredPlayers = useMemo(() => {
    return processedPlayers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = currentTab === "All" || p.group === currentTab;
      return matchesSearch && matchesTab;
    });
  }, [searchTerm, currentTab, processedPlayers]);

  return (
    <section id="players" className="py-24 bg-[#020617] text-white min-h-screen relative overflow-hidden">
      
      {/* Detail Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/40">
          <div className="relative bg-slate-900 border border-white/10 w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-8">
              <img src={selectedPlayer.image} className="w-full h-80 object-contain" alt={selectedPlayer.name} />
            </div>
            <div className="p-10 flex-1 relative">
              <button onClick={() => setSelectedPlayer(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
              <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">{selectedPlayer.categoryLabel}</span>
              </div>
              <h2 className="text-5xl font-black uppercase mb-6 leading-none">{selectedPlayer.name}</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500 text-sm">Total Points</span>
                  <span className="font-mono font-bold text-blue-400">{selectedPlayer.totalPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500 text-sm">Status Poin</span>
                  <span className="text-sm">{selectedPlayer.isWinner ? "🔥 Bonus Aktif" : "Standard"}</span>
                </div>
              </div>
              {selectedPlayer.isWinner && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
                  <Trophy className="text-amber-500" size={20} />
                  <p className="text-xs text-amber-200 font-medium">Pemenang Internal Cup IV 2026. Mendapatkan bonus poin klasemen.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
              ATLET <br/> <span className="text-blue-600">UNGGULAN</span>
            </h2>
          </div>
          
          <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Cari nama..." 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:border-blue-500 outline-none transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {['All', 'A', 'B+', 'B-', 'C'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                    currentTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {tab === 'All' ? 'SEMUA' : `SEED ${tab}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative group">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1.2}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            breakpoints={{ 
              640: { slidesPerView: 2.3 }, 
              1024: { slidesPerView: 4 } 
            }}
          >
            {filteredPlayers.map((player, index) => (
              <SwiperSlide key={player.name}>
                <div 
                  onClick={() => setSelectedPlayer(player)}
                  className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden cursor-pointer group/card hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-black">
                    <img 
                      src={player.image} 
                      className="w-full h-full object-cover opacity-80 group-hover/card:scale-110 group-hover/card:opacity-100 transition-all duration-700" 
                      alt={player.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                    
                    {/* Rank Badge */}
                    <div className="absolute top-6 left-6 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-mono font-black text-sm border-2 border-[#020617]">
                      {index + 1}
                    </div>

                    {player.isWinner && (
                      <div className="absolute top-6 right-6 bg-amber-500 p-2 rounded-xl shadow-lg">
                        <Trophy size={16} className="text-black" />
                      </div>
                    )}
                  </div>

                  <div className="p-8">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">{player.categoryLabel}</p>
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 group-hover/card:text-blue-400 transition-colors line-clamp-1">
                      {player.name}
                    </h3>
                    <div className="flex items-center justify-between text-slate-500 border-t border-white/5 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Points</span>
                        <span className="text-white font-mono font-bold">{player.totalPoints.toLocaleString()}</span>
                      </div>
                      <ArrowRight size={20} className="group-hover/card:translate-x-2 transition-transform text-slate-700 group-hover/card:text-blue-500" />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Controls */}
          <button ref={prevRef} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl"><ChevronLeft/></button>
          <button ref={nextRef} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl"><ChevronRight/></button>
        </div>
      </div>
    </section>
  );
};

export default Players;
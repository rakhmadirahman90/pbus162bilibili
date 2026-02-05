import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  Trophy, X, Target, Star, ShieldCheck, Zap, 
  ChevronLeft, ChevronRight, UserCheck, Users, 
  ArrowRight, LayoutDashboard, Search
} from 'lucide-react';

interface Player {
  id: number;
  name: string;
  category: string;
  ageGroup: string;
  rank: number;
  achievements: number;
  image: string;
  description?: string;
}

// Data 54 Pemain (Sesuai list Anda)
const playersData: Player[] = [
  // --- SEEDED A ---
  { id: 1, name: 'Agustilaar', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 1, achievements: 10, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 2, name: 'Darwis (TNI)', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 2, achievements: 8, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 3, name: 'Salman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 3, achievements: 7, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 4, name: 'Lutfi', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 4, achievements: 6, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 5, name: 'Udin', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 5, achievements: 5, image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 6, name: 'Aldy Sandra', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 6, achievements: 5, image: 'https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 7, name: 'Mustakim', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 7, achievements: 4, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 8, name: 'Rifai', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 8, achievements: 4, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 9, name: 'Acos', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 9, achievements: 3, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 10, name: 'Herman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 10, achievements: 3, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600' },
  // ... (Sisa data B+, B-, C Anda masukkan di sini sesuai list sebelumnya)
  { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 8, achievements: 15, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 54, name: 'Yakob', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 12, achievements: 1, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const filteredPlayers = useMemo(() => {
    return playersData
      .filter(player => {
        const matchesTab = player.ageGroup === currentTab;
        const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
      })
      .sort((a, b) => a.rank - b.rank);
  }, [currentTab, searchTerm]);

  useEffect(() => {
    document.body.style.overflow = selectedPlayer ? 'hidden' : 'unset';
  }, [selectedPlayer]);

  return (
    <section id="atlet" className="py-24 bg-[#0a0a0a] text-white min-h-screen relative">
      
      {/* MODAL DETAIL PEMAIN */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-[#121212] border border-white/10 w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
            <button onClick={() => setSelectedPlayer(null)} className="absolute top-6 right-6 z-10 bg-white/10 hover:bg-red-600 p-3 rounded-full text-white transition-all">
              <X size={20} />
            </button>
            <div className="w-full md:w-1/2 h-[350px] md:h-auto overflow-hidden">
              <img src={selectedPlayer.image} className="w-full h-full object-cover" alt={selectedPlayer.name} />
            </div>
            <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-gradient-to-br from-zinc-900 to-black">
              <div className="flex items-center gap-2 mb-4 text-blue-500 font-bold text-[10px] uppercase tracking-[0.3em]">
                <ShieldCheck size={14} /> PB US 162 Member
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 italic leading-none">{selectedPlayer.name}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Target className="text-blue-500 mb-2" size={20} />
                  <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest">Kategori</p>
                  <p className="font-bold text-lg">{selectedPlayer.category}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Star className="text-yellow-500 mb-2" size={20} />
                  <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest">Internal Rank</p>
                  <p className="font-bold text-lg">#{selectedPlayer.rank}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-zinc-400 text-sm leading-relaxed italic border-l-2 border-blue-600 pl-4 uppercase">
                  "Pejuang lapangan dari {selectedPlayer.category}."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8 border-b border-white/5 pb-12">
          <div className="space-y-6 w-full lg:w-auto">
            <div>
              <p className="text-blue-500 font-bold text-sm uppercase tracking-[0.4em] mb-2">Pilar Utama</p>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">Profil Atlet</h2>
            </div>

            {/* SEARCH BAR INTEGRASI */}
            <div className="relative max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500" size={20} />
              <input 
                type="text"
                placeholder="Cari nama pemain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-600 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 shadow-xl w-full lg:w-auto">
            <button onClick={() => { setCurrentTab('Atlet Senior'); setShowAll(false); }} className={`flex-1 px-8 py-4 rounded-xl font-black text-[10px] tracking-[0.2em] transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
              SENIOR
            </button>
            <button onClick={() => { setCurrentTab('Atlet Muda'); setShowAll(false); }} className={`flex-1 px-8 py-4 rounded-xl font-black text-[10px] tracking-[0.2em] transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
              MUDA
            </button>
          </div>
        </div>

        {/* SLIDER / GRID VIEW */}
        {filteredPlayers.length > 0 ? (
          !showAll ? (
            <div className="relative group">
              <Swiper
                key={`${currentTab}-${searchTerm}`}
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                pagination={{ clickable: true, dynamicBullets: true }}
                breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
                className="player-swiper !pb-20"
              >
                {filteredPlayers.map((player) => (
                  <SwiperSlide key={player.id}>
                    <div onClick={() => setSelectedPlayer(player)} className="group/card cursor-pointer relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:-translate-y-3">
                      <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      
                      <div className="absolute top-6 left-6">
                        <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shadow-xl -rotate-6 group-hover/card:rotate-0 transition-transform">
                          <span className="text-[8px] opacity-70">RANK</span>
                          <span className="text-lg">#{player.rank}</span>
                        </div>
                      </div>

                      <div className="absolute bottom-8 left-8 right-8">
                        <span className="text-blue-500 font-bold text-[10px] uppercase tracking-widest block mb-1">{player.category}</span>
                        <h3 className="text-2xl font-black uppercase italic leading-tight group-hover/card:text-blue-400 transition-colors truncate">{player.name}</h3>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Navigasi Bulat */}
              <button ref={prevRef} className="absolute left-0 top-[40%] -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-7 transition-all hover:bg-blue-600 hover:text-white shadow-2xl">
                <ChevronLeft size={28} />
              </button>
              <button ref={nextRef} className="absolute right-0 top-[40%] -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-7 transition-all hover:bg-blue-600 hover:text-white shadow-2xl">
                <ChevronRight size={28} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredPlayers.map((player) => (
                <div key={player.id} onClick={() => setSelectedPlayer(player)} className="group/grid cursor-pointer relative aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600 transition-all">
                  <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-50 group-hover/grid:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="text-sm font-black uppercase italic truncate">{player.name}</h3>
                    <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">{player.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="py-20 text-center bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-800">
             <Search size={48} className="mx-auto text-zinc-700 mb-4" />
             <h3 className="text-xl font-bold text-zinc-500 uppercase tracking-widest text-zinc-500">Atlet Tidak Ditemukan</h3>
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <button onClick={() => setShowAll(!showAll)} className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-blue-600 hover:text-white shadow-2xl active:scale-95">
            {showAll ? <><LayoutDashboard size={18} /> Balik ke Slider</> : <>Lihat Semua {filteredPlayers.length} Atlet <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>

      <style>{`
        .player-swiper .swiper-pagination-bullet { background: #3f3f46; opacity: 1; height: 4px; width: 12px; border-radius: 2px; }
        .player-swiper .swiper-pagination-bullet-active { background: #2563eb !important; width: 32px; }
      `}</style>
    </section>
  );
}
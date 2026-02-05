import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Target, Star, ShieldCheck, 
  ChevronLeft, ChevronRight, UserCheck, Users, 
  ArrowRight, LayoutDashboard, Search 
} from 'lucide-react';

// ... (Interface Player & playersData tetap sama)

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [showAll, setShowAll] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // State pencarian
  
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Perbaikan Logika Filter: Menggabungkan Tab dan Pencarian
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
    if (selectedPlayer) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [selectedPlayer]);

  // Modal Component (Tetap sama)
  const PlayerModal = () => {
    if (!selectedPlayer) return null;
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedPlayer(null)} />
        <div className="relative bg-[#121212] border border-white/10 w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
          <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-blue-600 p-2 rounded-full text-white transition-all">
            <X size={24} />
          </button>
          <div className="w-full md:w-1/2 h-[300px] md:h-auto">
            <img src={selectedPlayer.image} className="w-full h-full object-cover" alt={selectedPlayer.name} />
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4 text-blue-500 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck size={16} /> Elite Member
            </div>
            <h2 className="text-4xl font-black uppercase mb-2">{selectedPlayer.name}</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <Target className="text-blue-500 mb-1" size={18} />
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Kategori</p>
                <p className="font-bold text-sm">{selectedPlayer.category}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <Star className="text-yellow-500 mb-1" size={18} />
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Rank</p>
                <p className="font-bold text-sm">#{selectedPlayer.rank}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="atlet" className="py-24 bg-[#0a0a0a] text-white min-h-screen relative">
      <PlayerModal />
      
      <div className="max-w-7xl mx-auto px-6">
        {/* --- HEADER SECTION (PERBAIKAN FILTER & SEARCH) --- */}
        <div className="flex flex-col space-y-8 mb-16 border-b border-white/5 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <p className="text-blue-500 font-bold text-sm uppercase tracking-[0.4em]">PILAR PB US 162</p>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
                {showAll ? 'SEMUA ANGGOTA' : 'PROFIL PEMAIN'}
              </h2>
            </div>

            {/* Tombol Filter Kategori (Senior/Muda) */}
            <div className="flex bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 self-start">
              <button 
                onClick={() => { setCurrentTab('Atlet Senior'); setShowAll(false); }} 
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              >
                <UserCheck size={16} /> SENIOR
              </button>
              <button 
                onClick={() => { setCurrentTab('Atlet Muda'); setShowAll(false); }} 
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              >
                <Users size={16} /> MUDA
              </button>
            </div>
          </div>

          {/* Search Bar Row */}
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder={`Cari nama di ${currentTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* --- CONTENT SECTION --- */}
        {filteredPlayers.length > 0 ? (
          !showAll ? (
            <div className="relative group">
              <Swiper
                key={`${currentTab}-${searchTerm}`} // Reset swiper saat ganti tab/cari
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                onBeforeInit={(swiper) => {
                  // @ts-ignore
                  swiper.params.navigation.prevEl = prevRef.current;
                  // @ts-ignore
                  swiper.params.navigation.nextEl = nextRef.current;
                }}
                pagination={{ clickable: true, dynamicBullets: true }}
                breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
                className="player-swiper !pb-20"
              >
                {filteredPlayers.map((player) => (
                  <SwiperSlide key={player.id}>
                    <div onClick={() => setSelectedPlayer(player)} className="group/card cursor-pointer relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:-translate-y-3">
                      <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <div className="absolute bottom-8 left-6 right-6">
                        <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-2 py-1 rounded mb-2 inline-block uppercase">{player.category}</span>
                        <h3 className="text-xl md:text-2xl font-black uppercase group-hover/card:text-blue-400 transition-colors">{player.name}</h3>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <button ref={prevRef} className="absolute left-0 top-[40%] -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-6 transition-all"><ChevronLeft size={24} /></button>
              <button ref={nextRef} className="absolute right-0 top-[40%] -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-6 transition-all"><ChevronRight size={24} /></button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredPlayers.map((player) => (
                <div key={player.id} onClick={() => setSelectedPlayer(player)} className="cursor-pointer relative aspect-[3/4.5] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800">
                  <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-50" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-sm md:text-base font-black uppercase leading-none">{player.name}</h3>
                    <p className="text-[10px] text-blue-500 font-bold mt-1 uppercase">{player.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-[2.5rem]">
            <Search className="mx-auto text-zinc-700 mb-4" size={48} />
            <p className="text-zinc-500 font-bold uppercase tracking-widest">Tidak ada pemain bernama "{searchTerm}"</p>
          </div>
        )}

        <div className="mt-12 flex flex-col items-center">
          <button onClick={() => { setShowAll(!showAll); setSearchTerm(""); }} className="group flex items-center gap-4 bg-white text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-blue-600 hover:text-white shadow-2xl">
            {showAll ? <><LayoutDashboard size={18} /> Back to Slider</> : <>Lihat Semua {filteredPlayers.length} Pemain <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>

      <style>{`
        .player-swiper .swiper-pagination-bullet { background: #3f3f46; opacity: 1; }
        .player-swiper .swiper-pagination-bullet-active { background: #2563eb !important; width: 24px; border-radius: 4px; }
      `}</style>
    </section>
  );
}
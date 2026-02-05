import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { 
  Trophy, X, Target, Star, ShieldCheck, Zap, 
  ChevronLeft, ChevronRight, UserCheck, Users, 
  ArrowRight, LayoutDashboard, Search, SlidersHorizontal 
} from 'lucide-react';

// ... (Data EVENT_LOG, categorySettings, dan rawPlayersData tetap sama seperti sebelumnya) ...

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [showAll, setShowAll] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState(""); // State baru untuk pencarian
  
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // --- LOGIKA SINKRONISASI RANKING & PENCARIAN ---
  const processedPlayers = useMemo(() => {
    // 1. Kalkulasi Poin & Sorting (Sinkron dengan Ranking Page)
    const withPoints = rawPlayersData.map((player, index) => {
      const config = categorySettings[player.category] || { base: 5000, winBonus: 0 };
      const playerBase = config.base - (index * 50);
      const isWinner = EVENT_LOG.some(event => event.winners.includes(player.name));
      const totalPoints = playerBase + (isWinner ? config.winBonus : 0);
      return { ...player, totalPoints, isWinner };
    }).sort((a, b) => b.totalPoints - a.totalPoints);

    // 2. Tambahkan Global Rank dan Filter Pencarian + Tab
    return withPoints
      .map((p, idx) => ({ ...p, globalRank: idx + 1 }))
      .filter(p => {
        const matchesTab = p.ageGroup === currentTab;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
      });
  }, [currentTab, searchTerm]);

  return (
    <section id="atlet" className="py-24 bg-[#0a0a0a] text-white min-h-screen relative">
      
      {/* MODAL PROFIL (Sama seperti sebelumnya) */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedPlayer(null)} />
          {/* ... konten modal ... */}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8 border-b border-white/5 pb-12">
          <div className="space-y-4 w-full lg:w-auto">
            <div>
              <p className="text-blue-500 font-bold text-sm uppercase tracking-[0.4em] mb-2">LIVE RANKING SYSTEM</p>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">PROFIL ATLET</h2>
            </div>
            
            {/* SEARCH BAR BARU */}
            <div className="relative max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Cari nama pemain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-sm font-medium"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800 shadow-xl w-full lg:w-auto">
            <button onClick={() => {setCurrentTab('Atlet Senior'); setShowAll(false)}} className={`flex-1 lg:flex-none px-8 py-4 rounded-xl font-black text-[10px] tracking-widest transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}>SENIOR</button>
            <button onClick={() => {setCurrentTab('Atlet Muda'); setShowAll(false)}} className={`flex-1 lg:flex-none px-8 py-4 rounded-xl font-black text-[10px] tracking-widest transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}>MUDA</button>
          </div>
        </div>

        {/* SLIDER / GRID AREA */}
        {processedPlayers.length > 0 ? (
          !showAll ? (
            <div className="relative group">
              <Swiper
                key={`${currentTab}-${searchTerm}`} // Key unik agar swiper reset saat cari/ganti tab
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
                className="player-swiper !pb-20"
              >
                {processedPlayers.map((player) => (
                  <SwiperSlide key={player.id}>
                    <div onClick={() => setSelectedPlayer(player)} className="group/card cursor-pointer relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:-translate-y-3">
                      <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-700" />
                      
                      {/* Rank Badge */}
                      <div className="absolute top-6 left-6">
                        <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shadow-xl -rotate-6 group-hover/card:rotate-0 transition-transform">
                          <span className="text-[8px] opacity-70 uppercase">Rank</span>
                          <span className="text-lg">#{player.globalRank}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover/card:opacity-100 transition-opacity" />
                      <div className="absolute bottom-8 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-600 text-[9px] font-black px-2 py-0.5 rounded uppercase">{player.category}</span>
                          {player.isWinner && <Trophy size={14} className="text-amber-500" />}
                        </div>
                        <h3 className="text-xl md:text-2xl font-black uppercase group-hover/card:text-blue-400 transition-colors leading-tight">{player.name}</h3>
                        <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">{player.totalPoints.toLocaleString()} Points</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Custom Nav Buttons */}
              <button ref={prevRef} className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-7 transition-all hover:bg-blue-600 hover:scale-110 backdrop-blur-md"><ChevronLeft/></button>
              <button ref={nextRef} className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-7 transition-all hover:bg-blue-600 hover:scale-110 backdrop-blur-md"><ChevronRight/></button>
            </div>
          ) : (
            /* GRID VIEW (Semua Pemain) */
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {processedPlayers.map((player) => (
                <div key={player.id} onClick={() => setSelectedPlayer(player)} className="group cursor-pointer relative aspect-[3/4.2] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800">
                  <img src={player.image} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                    <h3 className="text-sm font-black uppercase">{player.name}</h3>
                    <p className="text-[9px] text-blue-500 font-bold uppercase">Rank #{player.globalRank}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* EMPTY STATE (Jika pencarian tidak ketemu) */
          <div className="py-20 text-center bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-800">
             <Search size={48} className="mx-auto text-zinc-700 mb-4" />
             <h3 className="text-xl font-bold text-zinc-500">Pemain "{searchTerm}" tidak ditemukan</h3>
             <p className="text-zinc-600 text-sm mt-2">Coba gunakan nama lain atau periksa kategori Senior/Muda.</p>
             <button onClick={() => setSearchTerm("")} className="mt-6 text-blue-500 font-bold uppercase text-[10px] tracking-widest border-b border-blue-500/30 pb-1">Reset Pencarian</button>
          </div>
        )}

        {/* FOOTER ACTION */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <button onClick={() => setShowAll(!showAll)} className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95">
            {showAll ? <><LayoutDashboard size={18} /> Balik ke Slider</> : <>Lihat Semua {processedPlayers.length} Pemain <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>

      <style>{`
        .player-swiper .swiper-pagination-bullet { background: #27272a; opacity: 1; height: 4px; width: 12px; border-radius: 2px; transition: all 0.3s; }
        .player-swiper .swiper-pagination-bullet-active { background: #2563eb !important; width: 32px; }
      `}</style>
    </section>
  );
}
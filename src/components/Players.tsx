import React, { useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { 
  Trophy, X, Search, ChevronLeft, ChevronRight, 
  UserCheck, Users, ArrowRight, LayoutDashboard 
} from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// --- KONFIGURASI POIN & EVENT (Sesuai Logika Ranking) ---
const EVENT_LOG = [
  { 
    id: 1, 
    name: "Internal Cup IV 2026", 
    winners: [
      "Agustilaar", "Herman", "H. Wawan", "Bustan", "Dr. Khaliq", 
      "Momota", "Prof. Fikri", "Marzuki", "Arsan", "H. Hasym", 
      "H. Anwar", "Yakob"
    ] 
  },
];

const categorySettings: Record<string, any> = {
  'Seeded A': { base: 10000, winBonus: 300 },
  'Seeded B(+)': { base: 8500, winBonus: 500 },
  'Seeded B(-)': { base: 7000, winBonus: 300 },
  'Seeded C': { base: 5500, winBonus: 500 },
};

// --- DATA PEMAIN ---
const rawPlayersData = [
  // SEEDED A
  { id: 1, name: 'Agustilaar', category: 'Seeded A', ageGroup: 'Atlet Senior', image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg' },
  { id: 2, name: 'Herman', category: 'Seeded A', ageGroup: 'Atlet Senior', image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg' },
  { id: 3, name: 'Darwis (TNI)', category: 'Seeded A', ageGroup: 'Atlet Senior', image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg' },
  { id: 4, name: 'Salman', category: 'Seeded A', ageGroup: 'Atlet Senior', image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg' },
  { id: 5, name: 'Lutfi', category: 'Seeded A', ageGroup: 'Atlet Senior', image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg' },
  // SEEDED B+
  { id: 11, name: 'H. Wawan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg' },
  { id: 12, name: 'Bustan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg' },
  { id: 13, name: 'Dr. Khaliq', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', image: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg' },
  // SEEDED C
  { id: 43, name: 'Arsan', category: 'Seeded C', ageGroup: 'Atlet Muda', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' },
  { id: 44, name: 'H. Hasym', category: 'Seeded C', ageGroup: 'Atlet Muda', image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg' },
];

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // --- LOGIKA PENCARIAN & RANKING OTOMATIS ---
  const filteredPlayers = useMemo(() => {
    // 1. Kalkulasi poin & global rank terlebih dahulu
    const withPoints = rawPlayersData.map((player, index) => {
      const config = categorySettings[player.category] || { base: 5000, winBonus: 0 };
      const playerBase = config.base - (index * 50);
      const isWinner = EVENT_LOG.some(event => event.winners.includes(player.name));
      const totalPoints = playerBase + (isWinner ? config.winBonus : 0);
      return { ...player, totalPoints, isWinner };
    }).sort((a, b) => b.totalPoints - a.totalPoints);

    // 2. Filter berdasarkan Tab dan Input Pencarian
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
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER & SEARCH BAR */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8 border-b border-white/5 pb-12">
          <div className="space-y-6 w-full lg:w-auto">
            <div>
              <p className="text-blue-500 font-bold text-sm uppercase tracking-[0.4em] mb-2">Pilar Utama</p>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Profil Pemain</h2>
            </div>

            {/* Input Pencarian */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <input 
                type="text"
                placeholder="Cari nama atlet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-600 outline-none transition-all text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 w-full lg:w-auto">
            <button onClick={() => {setCurrentTab('Atlet Senior'); setSearchTerm("")}} className={`flex-1 px-8 py-4 rounded-xl font-black text-xs transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600' : 'text-zinc-500 hover:text-white'}`}>
              <UserCheck className="inline mr-2" size={16}/> SENIOR
            </button>
            <button onClick={() => {setCurrentTab('Atlet Muda'); setSearchTerm("")}} className={`flex-1 px-8 py-4 rounded-xl font-black text-xs transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600' : 'text-zinc-500 hover:text-white'}`}>
              <Users className="inline mr-2" size={16}/> MUDA
            </button>
          </div>
        </div>

        {/* SLIDER / EMPTY STATE */}
        {filteredPlayers.length > 0 ? (
          <div className="relative group">
            <Swiper
              key={`${currentTab}-${searchTerm}`} // Memaksa reset slider saat mencari
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
              breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
              className="player-swiper !pb-20"
            >
              {filteredPlayers.map((player) => (
                <SwiperSlide key={player.id}>
                  <div className="group/card cursor-pointer relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:-translate-y-3">
                    <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 transition-all duration-700" />
                    <div className="absolute top-6 left-6">
                      <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shadow-xl -rotate-6">
                        <span className="text-[8px] opacity-70">RANK</span>
                        <span className="text-lg">#{player.globalRank}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-8 left-6 right-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-2 py-1 rounded uppercase">{player.category}</span>
                        {player.isWinner && <Trophy size={14} className="text-amber-500" />}
                      </div>
                      <h3 className="text-xl md:text-2xl font-black uppercase leading-tight">{player.name}</h3>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">{player.totalPoints.toLocaleString()} PTS</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <button ref={prevRef} className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-6 transition-all"><ChevronLeft/></button>
            <button ref={nextRef} className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-6 transition-all"><ChevronRight/></button>
          </div>
        ) : (
          <div className="py-20 text-center bg-zinc-900/50 rounded-[3rem] border border-dashed border-zinc-800">
             <Search size={40} className="mx-auto text-zinc-700 mb-4" />
             <p className="text-zinc-500 font-bold uppercase tracking-widest">Pemain tidak ditemukan</p>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-12 flex justify-center">
          <button onClick={() => setShowAll(!showAll)} className="flex items-center gap-4 bg-white text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all shadow-2xl">
            {showAll ? <><LayoutDashboard size={18} /> Balik ke Slider</> : <>Lihat Semua {filteredPlayers.length} Pemain <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>
    </section>
  );
}
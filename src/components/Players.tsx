import React, { useState, useMemo, useEffect } from 'react';
// Import Swiper React components & styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import Icons
import { Trophy, Medal, ChevronLeft, ChevronRight, UserCheck, Users, ArrowRight } from 'lucide-react';

interface PlayersProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

// Data Pemain berdasarkan Tabel Ranking
const playersData = [
  // --- KATEGORI ATLET SENIOR ---
  { 
    id: 1, name: 'Hidayatullah', category: 'Ganda Putra (Seed C)', 
    ageGroup: 'Atlet Senior', rank: 1, achievements: 15,
    image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg' 
  },
  { 
    id: 2, name: 'H. Wawan', category: 'Ganda Putra (Seed B+)', 
    ageGroup: 'Atlet Senior', rank: 2, achievements: 12,
    image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' 
  },
  { 
    id: 3, name: 'Bustam', category: 'Ganda Putra (Seed B+)', 
    ageGroup: 'Atlet Senior', rank: 4, achievements: 10,
    image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' 
  },
  { 
    id: 4, name: 'Prof. Fikri', category: 'Ganda Putra (Seed B-)', 
    ageGroup: 'Atlet Senior', rank: 6, achievements: 8,
    image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' 
  },
  
  // --- KATEGORI ATLET MUDA ---
  { 
    id: 5, name: 'Andi Junior', category: 'Tunggal Putra', 
    ageGroup: 'Atlet Muda', rank: 1, achievements: 5,
    image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600' 
  },
  { 
    id: 6, name: 'Rian Masa Depan', category: 'Tunggal Putra', 
    ageGroup: 'Atlet Muda', rank: 2, achievements: 3,
    image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600' 
  },
  { 
    id: 7, name: 'Zaky Pratama', category: 'Tunggal Putra', 
    ageGroup: 'Atlet Muda', rank: 3, achievements: 2,
    image: 'https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg?auto=compress&cs=tinysrgb&w=600' 
  },
];

export default function Players({ activeTab: externalTab, onTabChange }: PlayersProps) {
  const [localTab, setLocalTab] = useState('Atlet Senior');

  // Sinkronisasi tab dengan Navbar
  useEffect(() => {
    if (externalTab) setLocalTab(externalTab);
  }, [externalTab]);

  const currentTab = externalTab || localTab;

  // Filter data berdasarkan tab aktif dan urutkan sesuai ranking
  const filteredPlayers = useMemo(() => {
    return playersData
      .filter(player => player.ageGroup === currentTab)
      .sort((a, b) => a.rank - b.rank);
  }, [currentTab]);

  const handleTabChange = (tabName: string) => {
    if (onTabChange) onTabChange(tabName);
    else setLocalTab(tabName);
  };

  return (
    <section id="atlet" className="py-24 bg-[#0a0a0a] text-white overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section (Design inspired by image 2) */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="space-y-2">
            <p className="text-blue-500 font-bold text-sm uppercase tracking-[0.4em]">Profil Pemain</p>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              Kenal Lebih Dekat
            </h2>
          </div>
          
          {/* Custom Tab Switcher (Design inspired by image 1) */}
          <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 shadow-2xl">
            <button 
              onClick={() => handleTabChange('Atlet Senior')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-xs tracking-widest transition-all duration-300 ${
                currentTab === 'Atlet Senior' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-zinc-500 hover:text-white'
              }`}
            >
              <UserCheck size={16} /> SENIOR
            </button>
            <button 
              onClick={() => handleTabChange('Atlet Muda')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-xs tracking-widest transition-all duration-300 ${
                currentTab === 'Atlet Muda' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Users size={16} /> MUDA
            </button>
          </div>
        </div>

        {/* Slider Container */}
        <div className="relative group">
          <Swiper
            key={currentTab} // Force re-render on tab change
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: '.btn-next',
              prevEl: '.btn-prev',
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            className="player-swiper !pb-20"
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.id}>
                <div className="group/card relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:-translate-y-3 shadow-2xl">
                  
                  {/* Player Image */}
                  <img 
                    src={player.image} 
                    alt={player.name}
                    className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-700"
                  />
                  
                  {/* Visual Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-8 left-8">
                    <div className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-xl border border-blue-400/30 -rotate-6 group-hover/card:rotate-0 transition-transform duration-500">
                      <span className="text-[9px] opacity-70 leading-none">RANK</span>
                      <span className="text-xl">#{player.rank}</span>
                    </div>
                  </div>

                  <div className="absolute top-8 right-8">
                    <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-xl border border-white/10 uppercase tracking-widest">
                      {player.category.split(' ')[0]}
                    </span>
                  </div>

                  {/* Player Info (Bottom) */}
                  <div className="absolute bottom-10 left-10 right-10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-[2px] w-8 bg-blue-500"></div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">PBDjarum Style</span>
                      </div>
                      
                      <h3 className="text-2xl font-black uppercase leading-tight tracking-tight group-hover/card:text-blue-400 transition-colors duration-300">
                        {player.name}
                      </h3>

                      <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                        <div className="flex items-center gap-2.5">
                          <Trophy size={16} className="text-yellow-500" />
                          <span className="text-xs font-bold text-zinc-300 uppercase tracking-tighter">
                            {player.achievements} Medals
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center group-hover/card:bg-blue-600 transition-all">
                           <Medal size={18} className="text-zinc-500 group-hover/card:text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Controls */}
          <button className="btn-prev absolute left-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-blue-600/10 hover:bg-blue-600 border border-blue-600/30 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-4">
            <ChevronLeft size={28} />
          </button>
          <button className="btn-next absolute right-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-blue-600/10 hover:bg-blue-600 border border-blue-600/30 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:-translate-x-4">
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center">
          <button className="group inline-flex items-center gap-4 text-zinc-500 hover:text-white transition-all font-black text-xs uppercase tracking-[0.3em]">
            Lihat Semua Pemain <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

      </div>

      <style>{`
        .player-swiper .swiper-pagination-bullet { background: #3f3f46; opacity: 1; height: 4px; width: 12px; border-radius: 2px; }
        .player-swiper .swiper-pagination-bullet-active { background: #2563eb !important; width: 30px; }
      `}</style>
    </section>
  );
}
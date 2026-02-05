import React, { useState, useMemo, useEffect } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import Swiper modules
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Trophy, Medal, ChevronLeft, ChevronRight, UserCheck, Users, ArrowRight } from 'lucide-react';

interface PlayersProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

const playersData = [
  // --- KATEGORI ATLET SENIOR (Berdasarkan Tabel Ranking) ---
  { 
    id: 1, 
    name: 'Hidayatullah', 
    category: 'Ganda Putra (Seed C)', 
    ageGroup: 'Atlet Senior', 
    rank: 1, 
    achievements: 15,
    image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg' 
  },
  { 
    id: 2, 
    name: 'H. Wawan', 
    category: 'Ganda Putra (Seed B+)', 
    ageGroup: 'Atlet Senior', 
    rank: 2, 
    achievements: 12,
    image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' 
  },
  { 
    id: 3, 
    name: 'Bustam', 
    category: 'Ganda Putra (Seed B+)', 
    ageGroup: 'Atlet Senior', 
    rank: 4, 
    achievements: 10,
    image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' 
  },
  { 
    id: 4, 
    name: 'Prof. Fikri', 
    category: 'Ganda Putra (Seed B-)', 
    ageGroup: 'Atlet Senior', 
    rank: 6, 
    achievements: 8,
    image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' 
  },
  
  // --- KATEGORI ATLET MUDA ---
  { 
    id: 5, 
    name: 'Andi Junior', 
    category: 'Tunggal Putra', 
    ageGroup: 'Atlet Muda', 
    rank: 1, 
    achievements: 5,
    image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600' 
  },
  { 
    id: 6, 
    name: 'Rian Masa Depan', 
    category: 'Tunggal Putra', 
    ageGroup: 'Atlet Muda', 
    rank: 2, 
    achievements: 3,
    image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600' 
  },
  { 
    id: 7, 
    name: 'Zaky Pratama', 
    category: 'Tunggal Putra', 
    ageGroup: 'Atlet Muda', 
    rank: 3, 
    achievements: 2,
    image: 'https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg?auto=compress&cs=tinysrgb&w=600' 
  },
];

export default function Players({ activeTab: externalTab, onTabChange }: PlayersProps) {
  const [localTab, setLocalTab] = useState('Atlet Senior');

  // Sinkronisasi dengan Navbar
  useEffect(() => {
    if (externalTab) setLocalTab(externalTab);
  }, [externalTab]);

  const currentTab = externalTab || localTab;

  // Filter & Urutkan berdasarkan Ranking
  const filteredPlayers = useMemo(() => {
    return playersData
      .filter(player => player.ageGroup === currentTab)
      .sort((a, b) => a.rank - b.rank);
  }, [currentTab]);

  const handleTabClick = (tabName: string) => {
    if (onTabChange) onTabChange(tabName);
    else setLocalTab(tabName);
  };

  return (
    <section id="atlet" className="py-24 bg-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <span className="text-blue-500 font-bold text-sm uppercase tracking-[0.3em]">Profil Pemain</span>
            <h2 className="text-5xl font-black mt-2 uppercase tracking-tighter">Kenal Lebih Dekat</h2>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-white/5 shadow-2xl">
            <button 
              onClick={() => handleTabClick('Atlet Senior')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all duration-300 ${
                currentTab === 'Atlet Senior' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCheck size={16} /> SENIOR
            </button>
            <button 
              onClick={() => handleTabClick('Atlet Muda')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all duration-300 ${
                currentTab === 'Atlet Muda' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users size={16} /> MUDA
            </button>
          </div>
        </div>

        {/* Slider Section */}
        <div className="relative group">
          <Swiper
            key={currentTab} // Force re-render saat ganti tab agar slider reset ke awal
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            className="player-swiper !pb-14"
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.id}>
                <div className="relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden group/card bg-slate-900 border border-white/5 shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  {/* Image */}
                  <img 
                    src={player.image} 
                    alt={player.name}
                    className="w-full h-full object-cover opacity-70 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-1000"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Rank Badge */}
                  <div className="absolute top-6 left-6 bg-blue-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-xl border border-blue-400/30 transform group-hover/card:rotate-0 -rotate-6 transition-transform">
                    <span className="text-[9px] opacity-70 leading-none mb-0.5">RANK</span>
                    <span className="text-xl">#{player.rank}</span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-6 right-6">
                    <span className="bg-black/50 backdrop-blur-md text-white text-[9px] font-bold px-4 py-2 rounded-xl border border-white/10 uppercase tracking-widest">
                      {player.category.split(' ')[0]}
                    </span>
                  </div>

                  {/* Info Player */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-2 mb-3">
                       <div className="h-0.5 w-6 bg-blue-500"></div>
                       <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Profile</span>
                    </div>
                    <h3 className="text-2xl font-black leading-tight uppercase tracking-tight group-hover/card:text-blue-400 transition-colors duration-300">
                      {player.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                       <div className="flex items-center gap-2">
                          <Trophy size={14} className="text-yellow-500" />
                          <span className="text-[10px] font-bold text-slate-300">{player.achievements} Medali</span>
                       </div>
                       <Medal size={16} className="text-slate-500 ml-auto group-hover/card:text-yellow-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Arrows */}
          <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/5 hover:bg-blue-600 border border-white/10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:translate-x-2">
            <ChevronLeft size={24} />
          </button>
          <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/5 hover:bg-blue-600 border border-white/10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-x-6 group-hover:-translate-x-2">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* View All Button */}
        <div className="mt-16 text-center animate-bounce-slow">
           <button className="group inline-flex items-center gap-4 bg-transparent hover:bg-white text-white hover:text-black border border-white/20 px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300">
             Lihat Semua {currentTab} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
           </button>
        </div>

      </div>

      {/* CSS Khusus untuk pagination Swiper agar berwarna biru */}
      <style>{`
        .player-swiper .swiper-pagination-bullet { background: #475569; opacity: 1; }
        .player-swiper .swiper-pagination-bullet-active { background: #2563eb !important; width: 24px; border-radius: 4px; transition: all 0.3s; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </section>
  );
}
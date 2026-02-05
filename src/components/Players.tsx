import React, { useState, useMemo, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { Trophy, Medal, ChevronLeft, ChevronRight, UserCheck, Users, ArrowRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface PlayersProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

const playersData = [
  // --- KATEGORI ATLET SENIOR (Berdasarkan Tabel Ranking) ---
  { id: 1, name: 'Hidayatullah', category: 'Ganda Putra (Seed C)', ageGroup: 'Atlet Senior', rank: 1, image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg' },
  { id: 2, name: 'H. Wawan', category: 'Ganda Putra (Seed B+)', ageGroup: 'Atlet Senior', rank: 2, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 3, name: 'Bustam', category: 'Ganda Putra (Seed B+)', ageGroup: 'Atlet Senior', rank: 4, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 4, name: 'Prof. Fikri', category: 'Ganda Putra (Seed B-)', ageGroup: 'Atlet Senior', rank: 6, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  
  // --- KATEGORI ATLET MUDA ---
  { id: 5, name: 'Andi Junior', category: 'Tunggal Putra', ageGroup: 'Atlet Muda', rank: 1, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 6, name: 'Rian Masa Depan', category: 'Tunggal Putra', ageGroup: 'Atlet Muda', rank: 2, image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 7, name: 'Zaky Pratama', category: 'Tunggal Putra', ageGroup: 'Atlet Muda', rank: 3, image: 'https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

export default function Players({ activeTab: externalTab, onTabChange }: PlayersProps) {
  const [localTab, setLocalTab] = useState('Atlet Senior');

  useEffect(() => {
    if (externalTab) setLocalTab(externalTab);
  }, [externalTab]);

  const currentTab = externalTab || localTab;

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
        
        {/* Header Section (Style Gambar 4) */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-blue-500 font-bold text-sm uppercase tracking-[0.3em]">Profil Pemain</span>
            <h2 className="text-5xl font-black mt-2 uppercase tracking-tighter">Kenal Lebih Dekat</h2>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-white/5">
            <button 
              onClick={() => handleTabClick('Atlet Senior')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900' : 'text-slate-400 hover:text-white'}`}
            >
              <UserCheck size={16} /> SENIOR
            </button>
            <button 
              onClick={() => handleTabClick('Atlet Muda')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900' : 'text-slate-400 hover:text-white'}`}
            >
              <Users size={16} /> MUDA
            </button>
          </div>
        </div>

        {/* Slider Section */}
        <div className="relative group">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={25}
            slidesPerView={1}
            navigation={{ nextEl: '.next-p', prevEl: '.prev-p' }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            className="pb-10"
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.id}>
                <div className="relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden group/card bg-slate-900 border border-white/5">
                  {/* Image */}
                  <img 
                    src={player.image} 
                    alt={player.name}
                    className="w-full h-full object-cover opacity-70 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-700"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

                  {/* Rank Badge */}
                  <div className="absolute top-6 left-6 bg-blue-600 text-white w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shadow-xl">
                    <span className="text-[8px] opacity-70 leading-none">RANK</span>
                    <span className="text-lg">#{player.rank}</span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-6 right-6">
                    <span className="bg-white/10 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest">
                      {player.category.split(' ')[0]}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-2 mb-2">
                       <Trophy size={14} className="text-yellow-500" />
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Kenal Lebih Dekat</span>
                    </div>
                    <h3 className="text-2xl font-black leading-tight uppercase tracking-tight group-hover/card:text-blue-400 transition-colors">
                      {player.name}
                    </h3>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button className="prev-p absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-blue-600/10 hover:bg-blue-600 border border-blue-600/30 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-8">
            <ChevronLeft size={24} />
          </button>
          <button className="next-p absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-blue-600/10 hover:bg-blue-600 border border-blue-600/30 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 -group-hover:translate-x-8">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
           <button className="inline-flex items-center gap-3 text-slate-500 hover:text-blue-400 font-bold text-sm uppercase tracking-widest transition-all">
             Lihat Semua {currentTab} <ArrowRight size={18} />
           </button>
        </div>
      </div>
    </section>
  );
}
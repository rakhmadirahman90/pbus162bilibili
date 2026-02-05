import React, { useState, useMemo, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Trophy, Medal, ChevronLeft, ChevronRight, UserCheck, Users, ArrowRight, LayoutDashboard } from 'lucide-react';

interface PlayersProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

const playersData = [
  // --- SEEDED A (Ranking 1-10) ---
  { id: 1, name: 'Agustilaar', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 1, achievements: 10, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 2, name: 'Darwis (TNI)', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 2, achievements: 8, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 3, name: 'Salman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 3, achievements: 7, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 4, name: 'Lutfi', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 4, achievements: 6, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 5, name: 'Udin', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 5, achievements: 5, image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 6, name: 'Aldy Sandra', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 6, achievements: 5, image: 'https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 7, name: 'Mustakim', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 7, achievements: 4, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 8, name: 'Rifai', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 8, achievements: 4, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 9, name: 'Acos', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 9, achievements: 3, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 10, name: 'Herman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 10, achievements: 3, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600' },

  // --- SEEDED B+ (Ranking 11-32) ---
  { id: 11, name: 'Dr. Khaliq', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 11, achievements: 9, image: 'https://via.placeholder.com/600x800?text=Dr.+Khaliq' },
  { id: 12, name: 'H. Ismail', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 12, achievements: 8, image: 'https://via.placeholder.com/600x800?text=H.+Ismail' },
  { id: 13, name: 'Momota', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 13, achievements: 15, image: 'https://via.placeholder.com/600x800?text=Momota' },
  { id: 14, name: 'Saleh', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 14, achievements: 6, image: 'https://via.placeholder.com/600x800?text=Saleh' },
  { id: 15, name: 'H. Zaidi', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 15, achievements: 5, image: 'https://via.placeholder.com/600x800?text=H.+Zaidi' },
  { id: 16, name: 'Zainuddin', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 16, achievements: 4, image: 'https://via.placeholder.com/600x800?text=Zainuddin' },
  { id: 17, name: 'Bustan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 17, achievements: 10, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 18, name: 'H. Wawan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 18, achievements: 12, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 19, name: 'Lumpue', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 19, achievements: 4, image: 'https://via.placeholder.com/600x800?text=Lumpue' },
  { id: 20, name: 'Madhy', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 20, achievements: 3, image: 'https://via.placeholder.com/600x800?text=Madhy' },
  { id: 21, name: 'Vhio', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 21, achievements: 2, image: 'https://via.placeholder.com/600x800?text=Vhio' },
  { id: 22, name: 'Anto', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 22, achievements: 2, image: 'https://via.placeholder.com/600x800?text=Anto' },
  { id: 23, name: 'Lukman', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 23, achievements: 2, image: 'https://via.placeholder.com/600x800?text=Lukman' },
  { id: 24, name: 'Sandra', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 24, achievements: 1, image: 'https://via.placeholder.com/600x800?text=Sandra' },
  { id: 25, name: 'Amri', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 25, achievements: 1, image: 'https://via.placeholder.com/600x800?text=Amri' },
  { id: 26, name: 'Nasri Lapas', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 26, achievements: 1, image: 'https://via.placeholder.com/600x800?text=Nasri+Lapas' },
  { id: 27, name: 'Aprijal', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 27, achievements: 1, image: 'https://via.placeholder.com/600x800?text=Aprijal' },
  { id: 28, name: 'Arifuddin', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 28, achievements: 1, image: 'https://via.placeholder.com/600x800?text=Arifuddin' },
  { id: 29, name: 'H Amier', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 29, achievements: 1, image: 'https://via.placeholder.com/600x800?text=H+Amier' },
  { id: 30, name: 'Rustam', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 30, achievements: 1, image: 'https://via.placeholder.com/600x800?text=Rustam' },
  { id: 31, name: 'A. Arwan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 31, achievements: 1, image: 'https://via.placeholder.com/600x800?text=A.+Arwan' },
  { id: 32, name: 'Laganing', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 32, achievements: 1, image: 'https://via.placeholder.com/600x800?text=Laganing' },

  // --- SEEDED B- (Ranking 33-42) ---
  { id: 33, name: 'A. Mansur', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 33, achievements: 5, image: 'https://via.placeholder.com/600x800?text=A.+Mansur' },
  { id: 34, name: 'Darwis R.', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 34, achievements: 4, image: 'https://via.placeholder.com/600x800?text=Darwis+R.' },
  { id: 35, name: 'Prof. Fikri', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 35, achievements: 8, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 36, name: 'Ali', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 36, achievements: 3, image: 'https://via.placeholder.com/600x800?text=Ali' },
  { id: 37, name: 'Saldy', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 37, achievements: 2, image: 'https://via.placeholder.com/600x800?text=Saldy' },
  { id: 38, name: 'Mulyadi', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 38, achievements: 2, image: 'https://via.placeholder.com/600x800?text=Mulyadi' },
  { id: 39, name: 'Haedir', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 39, achievements: 2, image: 'https://via.placeholder.com/600x800?text=Haedir' },
  { id: 40, name: 'H Fitra', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 40, achievements: 1, image: 'https://via.placeholder.com/600x800?text=H+Fitra' },
  { id: 41, name: 'Marzuki', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 41, achievements: 1, image: 'https://via.placeholder.com/600x800?text=Marzuki' },
  { id: 42, name: 'Kurnia', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 42, achievements: 1, image: 'https://via.placeholder.com/600x800?text=Kurnia' },

  // --- SEEDED C (Ranking 1-12 di Tab Muda) ---
  { id: 43, name: 'Ust. Usman', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 1, achievements: 5, image: 'https://via.placeholder.com/600x800?text=Ust.+Usman' },
  { id: 44, name: 'H. Tantong', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 2, achievements: 4, image: 'https://via.placeholder.com/600x800?text=H.+Tantong' },
  { id: 45, name: 'Surakati', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 3, achievements: 4, image: 'https://via.placeholder.com/600x800?text=Surakati' },
  { id: 46, name: 'H. Hasym', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 4, achievements: 3, image: 'https://via.placeholder.com/600x800?text=H.+Hasym' },
  { id: 47, name: 'H. Faizal', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 5, achievements: 3, image: 'https://via.placeholder.com/600x800?text=H.+Faizal' },
  { id: 48, name: 'Markus', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 6, achievements: 2, image: 'https://via.placeholder.com/600x800?text=Markus' },
  { id: 49, name: 'H. Ude', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 7, achievements: 2, image: 'https://via.placeholder.com/600x800?text=H.+Ude' },
  { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 8, achievements: 15, image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg' },
  { id: 51, name: 'H. Pangeran', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 9, achievements: 1, image: 'https://via.placeholder.com/600x800?text=H.+Pangeran' },
  { id: 52, name: 'H. Anwar', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 10, achievements: 1, image: 'https://via.placeholder.com/600x800?text=H.+Anwar' },
  { id: 53, name: 'Syarifuddin', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 11, achievements: 1, image: 'https://via.placeholder.com/600x800?text=Syarifuddin' },
  { id: 54, name: 'Yakob', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 12, achievements: 1, image: 'https://via.placeholder.com/600x800?text=Yakob' },
];

export default function Players({ activeTab: externalTab, onTabChange }: PlayersProps) {
  const [localTab, setLocalTab] = useState('Atlet Senior');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (externalTab) {
      setLocalTab(externalTab);
      setShowAll(false);
    }
  }, [externalTab]);

  const currentTab = externalTab || localTab;

  const filteredPlayers = useMemo(() => {
    return playersData
      .filter(player => player.ageGroup === currentTab)
      .sort((a, b) => a.rank - b.rank);
  }, [currentTab]);

  const handleTabChange = (tabName: string) => {
    if (onTabChange) onTabChange(tabName);
    else setLocalTab(tabName);
    setShowAll(false);
  };

  const PlayerCard = ({ player }: { player: typeof playersData[0] }) => (
    <div className="group/card relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:-translate-y-3 shadow-2xl h-full">
      <img 
        src={player.image} 
        alt={player.name}
        loading="lazy"
        className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      
      {/* Badge Rank */}
      <div className="absolute top-8 left-8">
        <div className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-xl border border-blue-400/30 -rotate-6 group-hover/card:rotate-0 transition-transform duration-500">
          <span className="text-[9px] opacity-70 leading-none">RANK</span>
          <span className="text-xl">#{player.rank}</span>
        </div>
      </div>

      <div className="absolute bottom-10 left-8 right-8">
        <div className="space-y-3">
          <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-lg border border-blue-500/30 uppercase tracking-widest inline-block">
            {player.category}
          </span>
          <h3 className="text-2xl font-black uppercase leading-tight tracking-tight group-hover/card:text-blue-400 transition-colors duration-300">
            {player.name}
          </h3>
          <div className="flex items-center gap-4 pt-4 border-t border-white/5">
             <div className="flex items-center gap-2">
                <Trophy size={14} className="text-yellow-500" />
                <span className="text-[10px] font-bold text-zinc-400">{player.achievements} Wins</span>
             </div>
             <Medal size={16} className="text-zinc-600 ml-auto group-hover/card:text-yellow-500 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="atlet" className="py-24 bg-[#0a0a0a] text-white overflow-hidden min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-white/5 pb-12">
          <div className="space-y-3">
            <p className="text-blue-500 font-bold text-sm uppercase tracking-[0.4em]">Klasemen PB US 162</p>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              {currentTab === 'Atlet Senior' ? 'Elite Senior' : 'Rising Stars'}
            </h2>
          </div>
          
          <div className="flex bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-2xl">
            <button onClick={() => handleTabChange('Atlet Senior')} className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
              <UserCheck size={18} /> SENIOR ({playersData.filter(p => p.ageGroup === 'Atlet Senior').length})
            </button>
            <button onClick={() => handleTabChange('Atlet Muda')} className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
              <Users size={18} /> MUDA ({playersData.filter(p => p.ageGroup === 'Atlet Muda').length})
            </button>
          </div>
        </div>

        {/* Slider / Grid View */}
        {!showAll ? (
          <div className="relative group">
            <Swiper
              key={currentTab}
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={25}
              slidesPerView={1}
              navigation={{ nextEl: '.next-btn', prevEl: '.prev-btn' }}
              pagination={{ clickable: true, dynamicBullets: true }}
              autoplay={{ delay: 4000 }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
              className="player-swiper !pb-20"
            >
              {filteredPlayers.map((player) => (
                <SwiperSlide key={player.id}>
                  <PlayerCard player={player} />
                </SwiperSlide>
              ))}
            </Swiper>

            <button className="prev-btn absolute left-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-blue-600 border border-blue-400 shadow-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:translate-x-4">
              <ChevronLeft size={28} />
            </button>
            <button className="next-btn absolute right-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-blue-600 border border-blue-400 shadow-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-x-6 group-hover:-translate-x-4">
              <ChevronRight size={28} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}

        {/* Footer Action */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="group inline-flex items-center gap-4 bg-white text-black px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-blue-600 hover:text-white shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            {showAll ? (
              <><LayoutDashboard size={18} /> Kembali Ke Slide</>
            ) : (
              <>Lihat Semua {filteredPlayers.length} Pemain <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .player-swiper .swiper-pagination-bullet { background: #3f3f46; opacity: 1; }
        .player-swiper .swiper-pagination-bullet-active { background: #2563eb !important; width: 30px; border-radius: 4px; }
      `}</style>
    </section>
  );
}
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
  { id: 11, name: 'Dr. Khaliq', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 11, achievements: 9, image: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 12, name: 'H. Ismail', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 12, achievements: 8, image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 13, name: 'Momota', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 13, achievements: 15, image: 'https://images.pexels.com/photos/4307869/pexels-photo-4307869.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 14, name: 'Saleh', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 14, achievements: 6, image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 15, name: 'H. Zaidi', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 15, achievements: 5, image: 'https://images.pexels.com/photos/3812743/pexels-photo-3812743.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 16, name: 'Zainuddin', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 16, achievements: 4, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 17, name: 'Bustan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 17, achievements: 10, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 18, name: 'H. Wawan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 18, achievements: 12, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 19, name: 'Lumpue', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 19, achievements: 4, image: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 20, name: 'Madhy', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 20, achievements: 3, image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 21, name: 'Vhio', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 21, achievements: 2, image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 22, name: 'Anto', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 22, achievements: 2, image: 'https://images.pexels.com/photos/428333/pexels-photo-428333.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 23, name: 'Lukman', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 23, achievements: 2, image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 24, name: 'Sandra', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 24, achievements: 1, image: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 25, name: 'Amri', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 25, achievements: 1, image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 26, name: 'Nasri Lapas', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 26, achievements: 1, image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 27, name: 'Aprijal', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 27, achievements: 1, image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 28, name: 'Arifuddin', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 28, achievements: 1, image: 'https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 29, name: 'H Amier', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 29, achievements: 1, image: 'https://images.pexels.com/photos/842567/pexels-photo-842567.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 30, name: 'Rustam', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 30, achievements: 1, image: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 31, name: 'A. Arwan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 31, achievements: 1, image: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 32, name: 'Laganing', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 32, achievements: 1, image: 'https://images.pexels.com/photos/937481/pexels-photo-937481.jpeg?auto=compress&cs=tinysrgb&w=600' },

  // --- SEEDED B- (Ranking 33-42) ---
  { id: 33, name: 'A. Mansur', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 33, achievements: 5, image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 34, name: 'Darwis R.', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 34, achievements: 4, image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 35, name: 'Prof. Fikri', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 35, achievements: 8, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 36, name: 'Ali', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 36, achievements: 3, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 37, name: 'Saldy', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 37, achievements: 2, image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 38, name: 'Mulyadi', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 38, achievements: 2, image: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 39, name: 'Haedir', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 39, achievements: 2, image: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 40, name: 'H Fitra', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 40, achievements: 1, image: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 41, name: 'Marzuki', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 41, achievements: 1, image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 42, name: 'Kurnia', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 42, achievements: 1, image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600' },

  // --- SEEDED C (Ranking 43-54 di Tab Muda) ---
  { id: 43, name: 'Ust. Usman', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 1, achievements: 5, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 44, name: 'H. Tantong', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 2, achievements: 4, image: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 45, name: 'Surakati', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 3, achievements: 4, image: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 46, name: 'H. Hasym', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 4, achievements: 3, image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 47, name: 'H. Faizal', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 5, achievements: 3, image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 48, name: 'Markus', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 6, achievements: 2, image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 49, name: 'H. Ude', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 7, achievements: 2, image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 8, achievements: 15, image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg' },
  { id: 51, name: 'H. Pangeran', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 9, achievements: 1, image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 52, name: 'H. Anwar', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 10, achievements: 1, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 53, name: 'Syarifuddin', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 11, achievements: 1, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 54, name: 'Yakob', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 12, achievements: 1, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
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
                <span className="text-[10px] font-bold text-zinc-400">{player.achievements} Medals</span>
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
            <p className="text-blue-500 font-bold text-sm uppercase tracking-[0.4em]">
              Profil Pemain
            </p>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              {showAll ? 'SEMUA ANGGOTA' : 'KENAL LEBIH DEKAT'}
            </h2>
          </div>
          
          <div className="flex bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-2xl">
            <button 
                onClick={() => handleTabChange('Atlet Senior')} 
                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <UserCheck size={18} /> SENIOR ({playersData.filter(p => p.ageGroup === 'Atlet Senior').length})
            </button>
            <button 
                onClick={() => handleTabChange('Atlet Muda')} 
                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <Users size={18} /> MUDA ({playersData.filter(p => p.ageGroup === 'Atlet Muda').length})
            </button>
          </div>
        </div>

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

            <button className="next-btn absolute right-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-blue-600 border border-blue-400 shadow-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-x-6 group-hover:-translate-x-4">
              <ChevronRight size={28} />
            </button>
            <button className="prev-btn absolute left-0 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-blue-600 border border-blue-400 shadow-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:translate-x-4">
              <ChevronLeft size={28} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}

        <div className="mt-16 flex flex-col items-center gap-4">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="group inline-flex items-center gap-4 bg-white text-black px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-blue-600 hover:text-white shadow-2xl"
          >
            {showAll ? (
              <><LayoutDashboard size={18} /> KEMBALI KE SLIDE</>
            ) : (
              <>LIHAT SEMUA {filteredPlayers.length} PEMAIN <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
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
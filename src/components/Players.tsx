import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  Trophy, 
  Medal, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  Users, 
  ArrowRight, 
  LayoutDashboard, 
  X, 
  Target, 
  Star, 
  ShieldCheck,
  Zap
} from 'lucide-react';

// --- Interface Data ---
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

const playersData: Player[] = [
    // --- SEEDED A ---
    { id: 1, name: 'Agustilaar', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 1, achievements: 10, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Spesialis serangan cepat dengan akurasi penempatan bola yang luar biasa.' },
    { id: 2, name: 'Darwis (TNI)', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 2, achievements: 8, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Memiliki pertahanan kokoh dan stamina fisik yang sangat kuat.' },
    { id: 3, name: 'Salman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 3, achievements: 7, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 4, name: 'Lutfi', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 4, achievements: 6, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 5, name: 'Udin', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 5, achievements: 5, image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600' },
    
    // --- SEEDED B+ ---
    { id: 11, name: 'Dr. Khaliq', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 11, achievements: 9, image: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 13, name: 'Momota', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 13, achievements: 15, image: 'https://images.pexels.com/photos/4307869/pexels-photo-4307869.jpeg?auto=compress&cs=tinysrgb&w=600' },
    
    // --- SEEDED C (Atlet Muda) ---
    { id: 43, name: 'Ust. Usman', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 1, achievements: 5, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 8, achievements: 15, image: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=600' },
    // ... tambahkan sisa data Anda di sini
];

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [showAll, setShowAll] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const filteredPlayers = useMemo(() => {
    return playersData
      .filter(player => player.ageGroup === currentTab)
      .sort((a, b) => a.rank - b.rank);
  }, [currentTab]);

  // Efek untuk mengunci scroll saat modal terbuka
  useEffect(() => {
    if (selectedPlayer) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [selectedPlayer]);

  // --- KOMPONEN MODAL PROFIL ---
  const PlayerModal = () => {
    if (!selectedPlayer) return null;

    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8">
        {/* Backdrop dengan animasi fade */}
        <div 
          className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setSelectedPlayer(null)}
        />
        
        {/* Konten Modal */}
        <div className="relative bg-[#121212] border border-white/10 w-full max-w-4xl rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row transform transition-all duration-300 scale-100">
          
          {/* Tombol Close */}
          <button 
            onClick={() => setSelectedPlayer(null)}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-blue-600 p-2 rounded-full text-white transition-all shadow-lg"
          >
            <X size={24} />
          </button>

          {/* Bagian Foto */}
          <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
            <img 
              src={selectedPlayer.image} 
              className="w-full h-full object-cover" 
              alt={selectedPlayer.name} 
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#121212] via-transparent to-transparent" />
          </div>

          {/* Bagian Detail */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4 text-blue-500 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck size={16} /> Verified Player
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 leading-none">
              {selectedPlayer.name}
            </h2>
            <p className="text-zinc-500 font-medium mb-8">Professional Athlete - {selectedPlayer.ageGroup}</p>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                <Target className="text-blue-500 mt-1" size={18} />
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Kategori</p>
                  <p className="font-bold text-sm leading-tight">{selectedPlayer.category}</p>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                <Star className="text-yellow-500 mt-1" size={18} />
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Rank</p>
                  <p className="font-bold text-sm leading-tight">#{selectedPlayer.rank}</p>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                <Trophy className="text-orange-500 mt-1" size={18} />
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Medals</p>
                  <p className="font-bold text-sm leading-tight">{selectedPlayer.achievements} Medali</p>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                <Zap className="text-purple-500 mt-1" size={18} />
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Status</p>
                  <p className="font-bold text-sm leading-tight">Active</p>
                </div>
              </div>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed italic border-l-2 border-blue-600 pl-4">
              {selectedPlayer.description || "Pemain ini dikenal memiliki teknik yang sangat disiplin dan semangat juang yang tinggi di setiap turnamen."}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const PlayerCard = ({ player }: { player: Player }) => (
    <div 
      onClick={() => setSelectedPlayer(player)}
      className="group/card cursor-pointer relative aspect-[3/4.5] rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:-translate-y-3 hover:shadow-blue-900/20 hover:shadow-2xl h-full"
    >
      <img 
        src={player.image} 
        alt={player.name}
        className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      
      {/* Rank Badge */}
      <div className="absolute top-6 left-6">
        <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shadow-xl border border-blue-400/30 -rotate-6 group-hover/card:rotate-0 transition-transform duration-500">
          <span className="text-[8px] opacity-70 leading-none">RANK</span>
          <span className="text-lg">#{player.rank}</span>
        </div>
      </div>

      {/* Info Bottom */}
      <div className="absolute bottom-8 left-6 right-6">
        <div className="space-y-2">
          <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded border border-blue-400/30 uppercase tracking-widest inline-block">
            {player.category}
          </span>
          <h3 className="text-xl md:text-2xl font-black uppercase leading-tight group-hover/card:text-blue-400 transition-colors">
            {player.name}
          </h3>
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-[10px] font-bold text-zinc-400 group-hover/card:text-white transition-colors">
             <Trophy size={12} className="text-yellow-500" />
             <span>{player.achievements} Medals</span>
             <ArrowRight size={12} className="ml-auto opacity-0 group-hover/card:opacity-100 -translate-x-2 group-hover/card:translate-x-0 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="atlet" className="py-24 bg-[#0a0a0a] text-white overflow-hidden min-h-screen relative font-sans">
      
      {/* Modal Profile Render */}
      <PlayerModal />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-white/5 pb-12">
          <div className="space-y-3">
            <p className="text-blue-500 font-bold text-sm uppercase tracking-[0.4em]">Elite Members</p>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              {showAll ? 'SEMUA ANGGOTA' : 'PROFIL PEMAIN'}
            </h2>
          </div>
          
          <div className="flex bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 shadow-xl">
            <button 
              onClick={() => { setCurrentTab('Atlet Senior'); setShowAll(false); }}
              className={`flex items-center gap-3 px-6 md:px-8 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
            >
              <UserCheck size={18} /> SENIOR
            </button>
            <button 
              onClick={() => { setCurrentTab('Atlet Muda'); setShowAll(false); }}
              className={`flex items-center gap-3 px-6 md:px-8 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
            >
              <Users size={18} /> MUDA
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!showAll ? (
          <div className="relative group">
            <Swiper
              key={currentTab}
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              onBeforeInit={(swiper) => {
                // @ts-ignore
                swiper.params.navigation.prevEl = prevRef.current;
                // @ts-ignore
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              autoplay={{ delay: 5000 }}
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

            {/* Navigation Buttons */}
            <button 
              ref={prevRef}
              className="absolute left-0 top-[40%] -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-blue-600 border border-blue-400 shadow-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 -translate-x-4 md:-translate-x-6 hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>

            <button 
              ref={nextRef}
              className="absolute right-0 top-[40%] -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-blue-600 border border-blue-400 shadow-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-x-4 md:translate-x-6 hover:scale-110 active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-12 flex flex-col items-center">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center gap-4 bg-white text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-blue-600 hover:text-white shadow-2xl hover:shadow-blue-600/40"
          >
            {showAll ? (
              <><LayoutDashboard size={18} /> Back to Slider</>
            ) : (
              <>View All {filteredPlayers.length} Members <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
            )}
          </button>
        </div>
      </div>
      
      {/* Internal Custom Styles for Swiper Pagination */}
      <style>{`
        .player-swiper .swiper-pagination-bullet { background: #3f3f46; opacity: 1; }
        .player-swiper .swiper-pagination-bullet-active { background: #2563eb !important; width: 24px; border-radius: 4px; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-modal { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </section>
  );
}
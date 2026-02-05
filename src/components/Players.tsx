import React, { useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Target, Star, ChevronLeft, ChevronRight, 
  UserCheck, Users, Search, Award, ArrowRight, MapPin
} from 'lucide-react';

interface Player {
  id: number;
  name: string;
  category: string;
  ageGroup: string;
  rank: number;
  image: string;
  bio: string;
  isChampion?: boolean;
}

const playersData: Player[] = [
  // --- SEEDED A (Senior) ---
  { id: 1, name: 'Agustilaar', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 1, image: 'whatsapp_image_2026-02-05_at_11.38.00.jpeg', bio: 'Mempertahankan posisi puncak klasemen dengan konsistensi permainan yang luar biasa.' },
  { id: 2, name: 'Darwis (TNI)', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 2, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Runner-up turnamen terakhir, menunjukkan pertahanan komando yang sulit ditembus.' },
  { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 8, isChampion: true, image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg', bio: 'Bintang muda yang baru saja menunjukkan performa gemilang di turnamen terakhir.' },
  // ... (Tambahkan data lainnya sesuai kebutuhan)
];

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // FUNGSI PERBAIKAN: Pastikan reset filter dan scroll ke atas
  const handleViewAll = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah event bubbling
    setSearchTerm("");
    setCurrentTab('Atlet Senior');
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const counts = useMemo(() => ({
    Senior: playersData.filter(p => p.ageGroup === 'Atlet Senior').length,
    Muda: playersData.filter(p => p.ageGroup === 'Atlet Muda').length
  }), []);

  const filteredPlayers = useMemo(() => {
    return playersData
      .filter(p => p.ageGroup === currentTab && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.rank - b.rank);
  }, [currentTab, searchTerm]);

  return (
    <section id="atlet" ref={sectionRef} className="py-24 bg-[#050505] text-white min-h-screen font-sans relative overflow-hidden">
      
      {/* --- MODAL DETAIL (PRESISI TOTAL) --- */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedPlayer(null)} />
          
          <div className="relative bg-zinc-900 w-full max-w-5xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,1)] border border-white/5 animate-in fade-in zoom-in duration-300">
            
            {/* Area Foto - Mengikuti Lekukan dengan overflow-hidden */}
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative h-[350px] md:h-auto overflow-hidden">
              <img 
                src={selectedPlayer.image} 
                className="w-full h-full object-contain p-4 relative z-10" 
                alt={selectedPlayer.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-0" />
              
              <button 
                onClick={() => setSelectedPlayer(null)} 
                className="absolute top-6 left-6 z-50 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md md:hidden"
              >
                <X size={20} />
              </button>
            </div>

            {/* Area Info */}
            <div className="p-8 md:p-12 flex-1 flex flex-col justify-center relative bg-zinc-900">
              <button 
                onClick={() => setSelectedPlayer(null)} 
                className="absolute top-8 right-8 hidden md:block text-zinc-500 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>

              <div className="mb-6 inline-flex items-center gap-2">
                <span className="w-8 h-[2px] bg-blue-600"></span>
                <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Athlete Profile</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black uppercase leading-none mb-8 tracking-tighter">
                {selectedPlayer.name}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                  <Target className="text-blue-600 mb-2" size={20} />
                  <p className="text-[9px] text-zinc-500 uppercase font-bold">Category</p>
                  <p className="font-bold">{selectedPlayer.category}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                  <Star className="text-yellow-500 mb-2" size={20} />
                  <p className="text-[9px] text-zinc-500 uppercase font-bold">Rank</p>
                  <p className="font-bold">#{selectedPlayer.rank}</p>
                </div>
              </div>

              <p className="text-zinc-400 italic text-lg leading-relaxed border-l-4 border-blue-600 pl-6 py-2">
                "{selectedPlayer.bio}"
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-blue-600 font-black text-xs tracking-[0.4em] uppercase mb-4 block">Profil Pemain</span>
            <h2 className="text-5xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase">
              Kenal Lebih <br/> <span className="text-blue-600">Dekat</span>
            </h2>
          </div>
          
          {/* PERBAIKAN TOMBOL: Ditambah z-index dan pointer-events-auto */}
          <button 
            onClick={handleViewAll}
            className="group relative z-50 flex items-center gap-2 text-zinc-500 hover:text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer pointer-events-auto py-2"
          >
            Lihat Semua Pemain 
            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform text-blue-600" />
          </button>
        </div>

        {/* --- SEARCH & TAB --- */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 w-full md:w-auto">
            <button 
              onClick={() => setCurrentTab('Atlet Senior')}
              className={`flex-1 md:px-8 py-3 rounded-xl text-[10px] font-black transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500'}`}
            >
              SENIOR <span className="ml-2 opacity-40">{counts.Senior}</span>
            </button>
            <button 
              onClick={() => setCurrentTab('Atlet Muda')}
              className={`flex-1 md:px-8 py-3 rounded-xl text-[10px] font-black transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500'}`}
            >
              MUDA <span className="ml-2 opacity-40">{counts.Muda}</span>
            </button>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text"
              placeholder="Cari pemain..."
              className="w-full bg-zinc-900 border border-zinc-800 py-3.5 pl-12 pr-4 rounded-2xl focus:outline-none focus:border-blue-600 transition-all text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- SLIDER --- */}
        <div className="relative group/slider">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.2}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            onBeforeInit={(swiper) => {
                // @ts-ignore
                swiper.params.navigation.prevEl = prevRef.current;
                // @ts-ignore
                swiper.params.navigation.nextEl = nextRef.current;
            }}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 4 }
            }}
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.id}>
                <div 
                  onClick={() => setSelectedPlayer(player)}
                  className="group cursor-pointer relative aspect-[3/4.5] rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 transition-all duration-500 hover:-translate-y-2"
                >
                  <img src={player.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-black uppercase leading-none mb-2">{player.name}</h3>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-400 tracking-widest uppercase border-t border-white/10 pt-4">
                      Rank #{player.rank} <span className="text-blue-600">•</span> {player.category}
                    </div>
                  </div>
                  
                  {player.isChampion && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-black p-2 rounded-xl shadow-lg">
                      <Award size={16} />
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nav Buttons */}
          <button ref={prevRef} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 transition-all">
            <ChevronLeft size={24} />
          </button>
          <button ref={nextRef} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 transition-all">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
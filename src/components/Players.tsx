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

// ... (Data playersData tetap sama seperti sebelumnya, saya ringkas untuk fokus ke kode fungsi)

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // FUNGSI PERBAIKAN: Pastikan ini dipanggil saat onClick
  const handleViewAll = (e: React.MouseEvent) => {
    e.preventDefault(); // Mencegah reload halaman
    setSearchTerm(""); // Reset pencarian
    setCurrentTab('Atlet Senior'); // Kembali ke tab utama
    
    // Scroll ke atas section atlet
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredPlayers = useMemo(() => {
    return playersData
      .filter(p => p.ageGroup === currentTab && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.rank - b.rank);
  }, [currentTab, searchTerm]);

  return (
    <section id="atlet" ref={sectionRef} className="py-24 bg-[#050505] text-white min-h-screen">
      
      {/* --- MODAL DETAIL (Sama seperti versi presisi sebelumnya) --- */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
             {/* ... isi modal sama ... */}
             <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
                <img src={selectedPlayer.image} className="w-full h-full object-contain p-8 max-h-[80vh]" alt="" />
             </div>
             <div className="p-10 flex-1">
                <h2 className="text-5xl font-black uppercase mb-4">{selectedPlayer.name}</h2>
                <p className="text-zinc-400 italic">"{selectedPlayer.bio}"</p>
                <button onClick={() => setSelectedPlayer(null)} className="mt-8 bg-blue-600 px-6 py-2 rounded-full text-xs font-bold">TUTUP</button>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* --- HEADER --- */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <span className="bg-blue-600 text-[10px] font-black px-4 py-1.5 rounded-lg tracking-[0.3em] inline-block uppercase">ELITE ROSTER</span>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">
                PROFIL <br/> <span className="text-blue-600">PEMAIN</span>
              </h2>
            </div>
            
            {/* TOMBOL YANG DIPERBAIKI */}
            <button 
              type="button"
              onClick={handleViewAll}
              className="relative z-50 flex items-center gap-3 text-zinc-500 hover:text-white text-sm font-black transition-all group uppercase tracking-widest border border-white/10 px-8 py-4 rounded-full hover:bg-white/5 active:scale-95 cursor-pointer"
            >
              Lihat Semua Pemain 
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform text-blue-600" />
            </button>
          </div>
          <div className="h-px bg-gradient-to-r from-blue-600/50 via-zinc-800 to-transparent w-full mt-12" />
        </div>

        {/* --- FILTER & SEARCH --- */}
        <div className="flex flex-col md:flex-row gap-8 mb-16 items-center justify-between">
          <div className="flex bg-zinc-900/50 p-2 rounded-[2rem] border border-zinc-800">
            <button 
              onClick={() => setCurrentTab('Atlet Senior')} 
              className={`px-10 py-4 rounded-[1.5rem] text-[12px] font-black tracking-wider transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-xl' : 'text-zinc-500 hover:text-white'}`}
            >
              SENIOR
            </button>
            <button 
              onClick={() => setCurrentTab('Atlet Muda')} 
              className={`px-10 py-4 rounded-[1.5rem] text-[12px] font-black tracking-wider transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-xl' : 'text-zinc-500 hover:text-white'}`}
            >
              MUDA
            </button>
          </div>

          <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={22} />
            <input 
              type="text" 
              placeholder="Cari Legenda PB US 162..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-[2rem] py-5 pl-16 pr-8 focus:outline-none focus:border-blue-600 text-base font-bold"
            />
          </div>
        </div>

        {/* --- SWIPER CARDS --- */}
        <div className="relative group/slider">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            onBeforeInit={(swiper: any) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            breakpoints={{ 
              640: { slidesPerView: 2 }, 
              1024: { slidesPerView: 4 } 
            }}
            className="!pb-24"
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.id}>
                <div 
                  onClick={() => setSelectedPlayer(player)} 
                  className="group cursor-pointer relative aspect-[4/5.5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 transition-all duration-500 hover:-translate-y-4 shadow-2xl"
                >
                  <img src={player.image} alt={player.name} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                  <div className="absolute bottom-10 left-10 right-10">
                    <h3 className="text-3xl font-black uppercase leading-none tracking-tighter">{player.name}</h3>
                    <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-widest border-t border-white/10 pt-5 mt-4">
                      RANK #{player.rank} • {player.category}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button ref={prevRef} className="absolute left-[-30px] top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center hover:bg-blue-600 opacity-0 group-hover/slider:opacity-100 transition-all">
            <ChevronLeft size={28} />
          </button>
          <button ref={nextRef} className="absolute right-[-30px] top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center hover:bg-blue-600 opacity-0 group-hover/slider:opacity-100 transition-all">
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </section>
  );
}
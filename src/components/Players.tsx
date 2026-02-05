import React, { useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Target, Star, ShieldCheck, 
  ChevronLeft, ChevronRight, UserCheck, Users, 
  ArrowRight, Search, Quote
} from 'lucide-react';

interface Player {
  id: number;
  name: string;
  category: string;
  ageGroup: string;
  rank: number;
  image: string;
  bio: string;
}

const playersData: Player[] = [
  // --- SEEDED A ---
  { id: 1, name: 'Agustilaar', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 1, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Pemain veteran dengan teknik penempatan bola yang sangat akurat di lapangan.' },
  { id: 2, name: 'Darwis (TNI)', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 2, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Memiliki stamina fisik yang luar biasa dan semangat juang komando.' },
  { id: 3, name: 'Salman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 3, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Spesialis permainan net yang tipis dan menyulitkan lawan.' },
  { id: 4, name: 'Lutfi', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 4, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Dikenal dengan smash keras dan tajam yang menjadi andalan tim.' },
  { id: 5, name: 'Udin', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 5, image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Pemain serba bisa yang mampu mengontrol tempo permainan dengan baik.' },
  // ... (Gunakan pola yang sama untuk Seeded B+, B-, dan C)
  { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 8, image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg', bio: 'Bintang muda berbakat dengan dedikasi tinggi dan prestasi yang terus meningkat.' },
];

// Catatan: Pastikan sisa 54 data pemain dimasukkan ke array di atas

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const filteredPlayers = useMemo(() => {
    return playersData
      .filter(p => p.ageGroup === currentTab && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.rank - b.rank);
  }, [currentTab, searchTerm]);

  return (
    <section id="atlet" className="py-24 bg-[#0a0a0a] text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* --- MODAL DETAIL (VERSI LENGKAP) --- */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedPlayer(null)} />
          
          <div className="relative bg-[#111] border border-white/10 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedPlayer(null)} 
              className="absolute top-6 right-6 z-20 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all hover:rotate-90"
            >
              <X size={24} />
            </button>

            {/* Bagian Gambar */}
            <div className="w-full md:w-5/12 aspect-square md:aspect-auto relative">
              <img src={selectedPlayer.image} className="w-full h-full object-cover" alt={selectedPlayer.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent md:hidden" />
            </div>

            {/* Bagian Konten/Teks */}
            <div className="p-8 md:p-14 flex flex-col justify-center flex-1">
              <div className="flex items-center gap-2 mb-6 text-blue-500 font-bold text-xs uppercase tracking-[0.3em]">
                <ShieldCheck size={18} strokeWidth={2.5} /> ELITE MEMBER PB US 162
              </div>

              <h2 className="text-4xl md:text-6xl font-black uppercase mb-6 leading-none tracking-tighter">
                {selectedPlayer.name}
              </h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 border border-white/5 p-5 rounded-[1.5rem] hover:bg-white/10 transition-colors">
                  <Target className="text-blue-500 mb-2" size={20} />
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Kategori</p>
                  <p className="font-bold text-lg">{selectedPlayer.category}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-5 rounded-[1.5rem] hover:bg-white/10 transition-colors">
                  <Star className="text-yellow-500 mb-2" size={20} />
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Ranking</p>
                  <p className="font-bold text-lg">Peringkat {selectedPlayer.rank}</p>
                </div>
              </div>

              {/* Deskripsi/Bio Singkat */}
              <div className="relative">
                <Quote className="absolute -top-4 -left-2 text-white/5" size={48} />
                <p className="text-zinc-400 leading-relaxed text-sm md:text-base italic relative z-10">
                  {selectedPlayer.bio}
                </p>
              </div>

              <div className="mt-10 h-1 w-20 bg-blue-600 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* --- KONTEN UTAMA (HEADER & SLIDER) --- */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <p className="text-blue-500 font-bold text-sm uppercase tracking-[0.5em]">DATABASE</p>
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              PROFIL<br/><span className="text-blue-600">PEMAIN</span>
            </h2>
          </div>

          <div className="flex flex-col items-end gap-6 w-full md:w-auto">
            {/* Tab Selector */}
            <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800 w-full md:w-auto">
              <button 
                onClick={() => setCurrentTab('Atlet Senior')} 
                className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
              >
                <UserCheck size={18} /> SENIOR
              </button>
              <button 
                onClick={() => setCurrentTab('Atlet Muda')} 
                className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
              >
                <Users size={18} /> MUDA
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Cari nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-600 transition-all font-bold text-sm"
              />
            </div>
          </div>
        </div>

        {/* --- SWIPER SLIDER --- */}
        <div className="relative group/slider">
          <Swiper
            key={currentTab + searchTerm}
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={25}
            slidesPerView={1}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            onBeforeInit={(swiper) => {
              // @ts-ignore
              swiper.params.navigation.prevEl = prevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{ 
              640: { slidesPerView: 2 }, 
              1024: { slidesPerView: 4 } 
            }}
            className="player-swiper !pb-24"
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.id}>
                <div 
                  onClick={() => setSelectedPlayer(player)} 
                  className="group cursor-pointer relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:-translate-y-4 hover:border-blue-500/50 shadow-2xl"
                >
                  <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute top-6 left-6">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-black text-[10px] tracking-widest shadow-xl border border-white/10">
                      RANK #{player.rank}
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest mb-2">{player.category}</p>
                    <h3 className="text-2xl font-black uppercase leading-none group-hover:text-blue-400 transition-colors tracking-tighter">
                      {player.name}
                    </h3>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button ref={prevRef} className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center -translate-x-7 opacity-0 group-hover/slider:opacity-100 transition-all shadow-2xl hover:scale-110 active:scale-95">
            <ChevronLeft size={28} />
          </button>
          <button ref={nextRef} className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center translate-x-7 opacity-0 group-hover/slider:opacity-100 transition-all shadow-2xl hover:scale-110 active:scale-95">
            <ChevronRight size={28} />
          </button>
        </div>
      </div>

      <style>{`
        .player-swiper .swiper-pagination-bullet { background: #333; opacity: 1; height: 6px; width: 6px; }
        .player-swiper .swiper-pagination-bullet-active { background: #2563eb !important; width: 30px; border-radius: 10px; }
      `}</style>
    </section>
  );
}
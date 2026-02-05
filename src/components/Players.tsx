import React, { useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Target, Star, ShieldCheck, 
  ChevronLeft, ChevronRight, UserCheck, Users, 
  Search, Award, TrendingUp
} from 'lucide-react';

interface Player {
  id: number;
  name: string;
  category: string;
  ageGroup: string;
  rank: number;
  image: string;
  bio: string;
  isChampion?: boolean; // Penanda jika baru saja menang turnamen
}

const playersData: Player[] = [
  // --- SEEDED A (Senior - Update Ranking) ---
  { id: 1, name: 'Agustilaar', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 1, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Mempertahankan posisi puncak klasemen dengan konsistensi permainan yang luar biasa.' },
  { id: 2, name: 'Darwis (TNI)', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 2, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Runner-up turnamen terakhir, menunjukkan pertahanan komando yang sulit ditembus.' },
  // ... (Data Seeded A lainnya tetap sesuai urutan)

  // --- SEEDED C (Muda - Update Berdasarkan Hasil Turnamen) ---
  { id: 43, name: 'Ust. Usman', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 1, bio: 'Pemimpin klasemen Seeded C dengan teknik netting paling stabil.', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 8, isChampion: true, image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg', bio: 'Bintang muda yang baru saja menunjukkan performa gemilang di turnamen Bosowa Cup, naik ke peringkat 8 besar.' },
  // ... (Gunakan sisa 54 data dari kode sebelumnya)
];

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
      
      {/* --- MODAL DETAIL (Profil Lengkap) --- */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-[#111] border border-white/10 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
            <button onClick={() => setSelectedPlayer(null)} className="absolute top-6 right-6 z-20 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all">
              <X size={24} />
            </button>
            <div className="w-full md:w-5/12 aspect-square md:aspect-auto relative">
              <img src={selectedPlayer.image} className="w-full h-full object-cover" alt={selectedPlayer.name} />
              {selectedPlayer.isChampion && (
                <div className="absolute bottom-4 left-4 bg-yellow-500 text-black px-4 py-2 rounded-full font-black text-xs flex items-center gap-2">
                  <Award size={16} /> NEW CHAMPION
                </div>
              )}
            </div>
            <div className="p-8 md:p-14 flex flex-col justify-center flex-1">
              <div className="flex items-center gap-2 mb-6 text-blue-500 font-bold text-xs uppercase tracking-[0.3em]">
                <ShieldCheck size={18} strokeWidth={2.5} /> ELITE MEMBER PB US 162
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase mb-6 leading-none tracking-tighter">{selectedPlayer.name}</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 border border-white/5 p-5 rounded-[1.5rem]">
                  <Target className="text-blue-500 mb-2" size={20} />
                  <p className="text-zinc-500 text-[10px] uppercase font-black">Kategori</p>
                  <p className="font-bold text-lg">{selectedPlayer.category}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-5 rounded-[1.5rem]">
                  <Star className="text-yellow-500 mb-2" size={20} />
                  <p className="text-zinc-500 text-[10px] uppercase font-black">Ranking</p>
                  <p className="font-bold text-lg">Peringkat {selectedPlayer.rank}</p>
                </div>
              </div>
              <div className="relative italic text-zinc-400 border-l-4 border-blue-600 pl-6 py-2">
                <p className="text-sm md:text-base leading-relaxed">{selectedPlayer.bio}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- KONTEN UTAMA --- */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <p className="text-blue-500 font-bold text-sm uppercase tracking-[0.5em]">KLASEMEN TERBARU</p>
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">RANKING<br/><span className="text-blue-600">PEMAIN</span></h2>
          </div>
          <div className="flex flex-col items-end gap-6 w-full md:w-auto">
            <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800 w-full md:w-auto">
              <button onClick={() => setCurrentTab('Atlet Senior')} className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}>
                <UserCheck size={18} /> SENIOR
              </button>
              <button onClick={() => setCurrentTab('Atlet Muda')} className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}>
                <Users size={18} /> MUDA
              </button>
            </div>
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input type="text" placeholder="Cari nama pemain..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-600 transition-all font-bold text-sm" />
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
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
            className="player-swiper !pb-24"
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.id}>
                <div onClick={() => setSelectedPlayer(player)} className="group cursor-pointer relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:-translate-y-4 shadow-2xl">
                  <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-black text-[10px] tracking-widest shadow-xl border border-white/10">
                      RANK #{player.rank}
                    </div>
                    {player.isChampion && (
                      <div className="bg-yellow-500 text-black px-2 py-1 rounded-md font-black text-[8px] tracking-tighter flex items-center gap-1 animate-pulse">
                        <TrendingUp size={10} /> TRENDING
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest mb-2">{player.category}</p>
                    <h3 className="text-2xl font-black uppercase leading-none group-hover:text-blue-400 transition-colors tracking-tighter">{player.name}</h3>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button ref={prevRef} className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center -translate-x-7 opacity-0 group-hover/slider:opacity-100 transition-all shadow-2xl hover:scale-110"><ChevronLeft size={28} /></button>
          <button ref={nextRef} className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center translate-x-7 opacity-0 group-hover/slider:opacity-100 transition-all shadow-2xl hover:scale-110"><ChevronRight size={28} /></button>
        </div>
      </div>
      
      <style>{`
        .player-swiper .swiper-pagination-bullet { background: #333; opacity: 1; height: 6px; width: 6px; }
        .player-swiper .swiper-pagination-bullet-active { background: #2563eb !important; width: 30px; border-radius: 10px; }
      `}</style>
    </section>
  );
}
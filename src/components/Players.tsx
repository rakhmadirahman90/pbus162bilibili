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
  { id: 3, name: 'Salman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 3, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Ahli dalam permainan netting tipis yang sering membuat lawan mati langkah.' },
  { id: 4, name: 'Lutfi', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 4, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Dikenal dengan smash keras menyilang yang menjadi senjata utama dalam menyerang.' },
  { id: 5, name: 'Udin', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 5, image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Strategis lapangan yang mampu membaca pergerakan lawan dengan sangat cepat.' },
  { id: 6, name: 'Aldy Sandra', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 6, image: 'https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Pemain dengan mobilitas tinggi, selalu siap mengejar bola di area manapun.' },
  { id: 7, name: 'Mustakim', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 7, image: 'whatsapp_image_2026-02-05_at_10.36.22.jpeg', bio: 'Eksekutor poin yang handal dengan penempatan bola yang cerdas.' },
  { id: 8, name: 'Rifai', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 8, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Mempunyai variasi pukulan lob dan drop shot yang sangat menipu.' },
  { id: 9, name: 'Acos', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 9, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Spesialis ganda yang sangat kompak dan komunikatif di dalam lapangan.' },
  { id: 10, name: 'Herman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 10, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600', bio: 'Pemain dengan mental juara yang stabil dalam kondisi poin kritis.' },

  // --- SEEDED B+ (Senior) ---
  { id: 11, name: 'Dr. Khaliq', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 11, bio: 'Memadukan kecerdasan strategi dengan teknik dasar yang sangat kuat.', image: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 12, name: 'H. Ismail', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 12, bio: 'Senior dengan jam terbang tinggi yang sangat dihormati di lapangan.', image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 21, name: 'Vhio', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 21, bio: 'Anak muda potensial yang sudah menembus level Seeded Senior.', image: 'whatsapp_image_2026-02-05_at_10.34.12.jpeg' },
  
  // --- SEEDED C (Muda) ---
  { id: 43, name: 'Ust. Usman', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 1, bio: 'Pemimpin klasemen Seeded C dengan teknik netting paling stabil.', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 8, isChampion: true, image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg', bio: 'Bintang muda yang baru saja menunjukkan performa gemilang di turnamen terakhir.' },
];

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleViewAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchTerm("");
    setCurrentTab('Atlet Senior');
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredPlayers = useMemo(() => {
    return playersData
      .filter(p => p.ageGroup === currentTab && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.rank - b.rank);
  }, [currentTab, searchTerm]);

  return (
    <section id="atlet" ref={sectionRef} className="py-24 bg-[#050505] text-white min-h-screen font-sans relative">
      
      {/* --- MODAL DETAIL (PRESISI TOTAL) --- */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-12">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedPlayer(null)} />
          
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
            
            {/* Area Foto - Mengikuti Lekukan dengan overflow-hidden */}
            <div className="w-full md:w-1/2 bg-[#080808] flex items-center justify-center relative overflow-hidden h-[400px] md:h-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-transparent" />
              <img 
                src={selectedPlayer.image} 
                className="w-full h-full object-contain relative z-10 p-6 md:p-12" 
                alt={selectedPlayer.name} 
              />
              {selectedPlayer.isChampion && (
                <div className="absolute bottom-8 left-8 z-20 bg-yellow-500 text-black px-4 py-2 rounded-2xl font-black text-[10px] flex items-center gap-2 shadow-2xl">
                  <Award size={16} /> NEW CHAMPION
                </div>
              )}
            </div>

            {/* Area Info Profil */}
            <div className="p-10 md:p-16 flex flex-col justify-center flex-1 bg-gradient-to-br from-zinc-900 to-black relative">
              <button 
                onClick={() => setSelectedPlayer(null)} 
                className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-all bg-white/5 p-2 rounded-full border border-white/5"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-[2px] w-10 bg-blue-600"></div>
                <p className="text-blue-500 font-black text-[11px] uppercase tracking-[0.4em]">Official Passport</p>
              </div>

              <h2 className="text-5xl md:text-7xl font-black uppercase mb-10 leading-none tracking-tighter">
                {selectedPlayer.name}
              </h2>

              <div className="grid grid-cols-2 gap-5 mb-12">
                <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
                  <Target className="text-blue-500 mb-3" size={24} />
                  <p className="text-zinc-500 text-[11px] uppercase font-black mb-1">Kategori</p>
                  <p className="font-bold text-xl text-zinc-100">{selectedPlayer.category}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
                  <Star className="text-yellow-500 mb-3" size={24} />
                  <p className="text-zinc-500 text-[11px] uppercase font-black mb-1">Ranking</p>
                  <p className="font-bold text-xl text-zinc-100">#{selectedPlayer.rank}</p>
                </div>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)]"></div>
                <p className="text-zinc-400 text-lg md:text-2xl leading-relaxed italic">
                  "{selectedPlayer.bio}"
                </p>
              </div>

              <div className="mt-14 pt-10 border-t border-white/5 flex items-center justify-between text-zinc-500 text-[11px] font-black tracking-widest uppercase">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-blue-600" /> PB US 162 PAREPARE
                </div>
                <div className="opacity-40">2026 EDITION</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- KONTEN UTAMA --- */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-4">
            <span className="bg-blue-600/10 text-blue-500 border border-blue-600/20 text-[10px] font-black px-4 py-2 rounded-lg tracking-[0.3em] inline-block uppercase">PROFIL PEMAIN</span>
            <h2 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
              KENAL LEBIH <br/> <span className="text-blue-600">DEKAT</span>
            </h2>
          </div>
          
          <button 
            type="button"
            onClick={handleViewAll}
            className="relative z-[60] flex items-center gap-3 text-zinc-500 hover:text-white text-sm font-black transition-all group uppercase tracking-widest border border-white/10 px-8 py-4 rounded-full hover:bg-white/5 cursor-pointer pointer-events-auto"
          >
            Lihat Semua Pemain 
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform text-blue-600" />
          </button>
        </div>

        {/* --- FILTER & SEARCH --- */}
        <div className="flex flex-col md:flex-row gap-8 mb-16 items-center justify-between">
          <div className="flex bg-zinc-900/50 p-2 rounded-[2rem] border border-zinc-800 backdrop-blur-xl">
            <button 
              onClick={() => setCurrentTab('Atlet Senior')} 
              className={`px-10 py-4 rounded-[1.5rem] text-[12px] font-black tracking-wider transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40' : 'text-zinc-500'}`}
            >
              SENIOR
            </button>
            <button 
              onClick={() => setCurrentTab('Atlet Muda')} 
              className={`px-10 py-4 rounded-[1.5rem] text-[12px] font-black tracking-wider transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40' : 'text-zinc-500'}`}
            >
              MUDA
            </button>
          </div>

          <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={22} />
            <input 
              type="text" 
              placeholder="Cari pemain..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-[2rem] py-5 pl-16 pr-8 focus:outline-none focus:border-blue-600 text-base font-bold transition-all"
            />
          </div>
        </div>

        {/* --- SLIDER --- */}
        <div className="relative group/slider">
          <Swiper
            key={currentTab + searchTerm}
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
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
            className="!pb-24"
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.id}>
                <div 
                  onClick={() => setSelectedPlayer(player)} 
                  className="group cursor-pointer relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 transition-all duration-700 hover:-translate-y-4"
                >
                  <img src={player.image} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-3xl font-black uppercase leading-none tracking-tighter group-hover:text-blue-500 transition-colors">{player.name}</h3>
                    <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-widest border-t border-white/10 pt-5 mt-4">
                      RANK #{player.rank} • {player.category}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button ref={prevRef} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-40 w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 transition-all">
            <ChevronLeft size={32} />
          </button>
          <button ref={nextRef} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-40 w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 transition-all">
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    </section>
  );
}
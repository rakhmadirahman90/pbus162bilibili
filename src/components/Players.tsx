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
  { id: 13, name: 'Momota', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 13, bio: 'Gaya bermain lincah dan atraktif, selalu memberikan tontonan menarik.', image: 'https://images.pexels.com/photos/4307869/pexels-photo-4307869.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 14, name: 'Saleh', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 14, bio: 'Pemain yang gigih dan tidak mudah menyerah sebelum bola menyentuh lantai.', image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 21, name: 'Vhio', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 21, bio: 'Anak muda potensial yang sudah menembus level Seeded Senior.', image: 'whatsapp_image_2026-02-05_at_10.34.12.jpeg' },

  // --- SEEDED B- (Senior) ---
  { id: 33, name: 'A. Mansur', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 33, bio: 'Pemain senior yang ulet dan penuh pengalaman.', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 35, name: 'Prof. Fikri', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 35, bio: 'Gaya bermain cerdas dan taktis sesuai dengan analisis lapangan.', image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },

  // --- SEEDED C (Muda) ---
  { id: 43, name: 'Ust. Usman', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 1, bio: 'Pemimpin klasemen Seeded C dengan teknik netting paling stabil.', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 45, name: 'Surakati', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 3, bio: 'Andal dalam serangan smes keras yang menghujam tajam.', image: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 8, isChampion: true, image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg', bio: 'Bintang muda yang baru saja menunjukkan performa gemilang di turnamen terakhir.' },
];

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // LOGIKA HITUNG JUMLAH PER KATEGORI
  const counts = useMemo(() => ({
    Senior: playersData.filter(p => p.ageGroup === 'Atlet Senior').length,
    Muda: playersData.filter(p => p.ageGroup === 'Atlet Muda').length
  }), []);

  // FUNGSI RESET LIHAT SEMUA PEMAIN
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
    <section id="atlet" ref={sectionRef} className="py-24 bg-[#050505] text-white min-h-screen relative overflow-hidden">
      
      {/* --- MODAL DETAIL (PRESISI TOTAL) --- */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-full md:w-1/2 bg-[#080808] flex items-center justify-center relative overflow-hidden h-[350px] md:h-auto">
              <img src={selectedPlayer.image} className="w-full h-full object-contain p-6 md:p-12 relative z-10" alt="" />
            </div>
            <div className="p-10 md:p-16 flex-1 bg-zinc-900 relative">
              <button onClick={() => setSelectedPlayer(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={28} /></button>
              <h2 className="text-5xl md:text-7xl font-black uppercase mb-8 tracking-tighter">{selectedPlayer.name}</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] text-zinc-500 uppercase font-black">Kategori</p>
                    <p className="text-xl font-bold">{selectedPlayer.category}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] text-zinc-500 uppercase font-black">Ranking</p>
                    <p className="text-xl font-bold">#{selectedPlayer.rank}</p>
                </div>
              </div>
              <p className="text-zinc-400 text-xl italic leading-relaxed">"{selectedPlayer.bio}"</p>
            </div>
          </div>
        </div>
      )}

      {/* --- KONTEN UTAMA --- */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <span className="text-blue-600 font-black text-xs tracking-[0.4em] uppercase mb-4 block">Database Pemain</span>
            <h2 className="text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter uppercase">KENAL LEBIH <br/> <span className="text-blue-600">DEKAT</span></h2>
          </div>
          
          {/* TOMBOL LIHAT SEMUA (PERBAIKAN Z-INDEX) */}
          <button 
            onClick={handleViewAll}
            className="relative z-[100] flex items-center gap-3 text-zinc-500 hover:text-white text-sm font-black transition-all group uppercase tracking-widest border border-white/10 px-8 py-4 rounded-full hover:bg-white/5 cursor-pointer"
          >
            Lihat Semua Pemain 
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform text-blue-600" />
          </button>
        </div>

        {/* TAB & SEARCH (JUMLAH KATEGORI DITAMPILKAN LAGI) */}
        <div className="flex flex-col md:flex-row gap-8 mb-16 items-center justify-between">
          <div className="flex bg-zinc-900/50 p-2 rounded-[2rem] border border-zinc-800">
            <button 
              onClick={() => setCurrentTab('Atlet Senior')} 
              className={`px-10 py-4 rounded-[1.5rem] text-[12px] font-black transition-all flex items-center gap-3 ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-zinc-500'}`}
            >
              SENIOR <span className="opacity-40">{counts.Senior}</span>
            </button>
            <button 
              onClick={() => setCurrentTab('Atlet Muda')} 
              className={`px-10 py-4 rounded-[1.5rem] text-[12px] font-black transition-all flex items-center gap-3 ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-zinc-500'}`}
            >
              MUDA <span className="opacity-40">{counts.Muda}</span>
            </button>
          </div>

          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
            <input 
              type="text" 
              placeholder="Cari pemain..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-[2rem] py-5 pl-14 pr-8 focus:outline-none focus:border-blue-600 font-bold"
            />
          </div>
        </div>

        {/* SLIDER */}
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
            breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 4 } }}
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.id}>
                <div 
                  onClick={() => setSelectedPlayer(player)} 
                  className="group cursor-pointer relative aspect-[3/4.5] rounded-[3rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600 transition-all duration-500 hover:-translate-y-3"
                >
                  <img src={player.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-10 left-10">
                    <h3 className="text-3xl font-black uppercase leading-none mb-3 group-hover:text-blue-500 transition-colors">{player.name}</h3>
                    <div className="text-[10px] font-black uppercase text-white/30 tracking-widest border-t border-white/10 pt-4">RANK #{player.rank} • {player.category}</div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button ref={prevRef} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 transition-all"><ChevronLeft size={28} /></button>
          <button ref={nextRef} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 transition-all"><ChevronRight size={28} /></button>
        </div>
      </div>
    </section>
  );
}
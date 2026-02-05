import React, { useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import CSS Swiper secara lengkap
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Target, Star, ShieldCheck, 
  ChevronLeft, ChevronRight, UserCheck, Users, 
  ArrowRight, LayoutDashboard, Search 
} from 'lucide-react';

interface Player {
  id: number;
  name: string;
  category: string;
  ageGroup: string;
  rank: number;
  image: string;
}

const playersData: Player[] = [
  // --- SEEDED A (10 Orang) ---
  { id: 1, name: 'Agustilaar', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 1, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 2, name: 'Darwis (TNI)', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 2, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 3, name: 'Salman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 3, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 4, name: 'Lutfi', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 4, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 5, name: 'Udin', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 5, image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 6, name: 'Aldy Sandra', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 6, image: 'https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 7, name: 'Mustakim', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 7, image: 'whatsapp_image_2026-02-05_at_10.36.22.jpeg' },
  { id: 8, name: 'Rifai', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 8, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 9, name: 'Acos', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 9, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 10, name: 'Herman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 10, image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600' },

  // --- SEEDED B+ (22 Orang) ---
  { id: 11, name: 'Dr. Khaliq', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 11, image: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 12, name: 'H. Ismail', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 12, image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 13, name: 'Momota', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 13, image: 'https://images.pexels.com/photos/4307869/pexels-photo-4307869.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 14, name: 'Saleh', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 14, image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 15, name: 'H. Zaidi', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 15, image: 'https://images.pexels.com/photos/3812743/pexels-photo-3812743.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 16, name: 'Zainuddin', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 16, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 17, name: 'Bustan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 17, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 18, name: 'H. Wawan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 18, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 19, name: 'Lumpue', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 19, image: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 20, name: 'Madhy', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 20, image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 21, name: 'Vhio', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 21, image: 'whatsapp_image_2026-02-05_at_10.34.12.jpeg' },
  { id: 22, name: 'Anto', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 22, image: 'https://images.pexels.com/photos/428333/pexels-photo-428333.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 23, name: 'Lukman', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 23, image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 24, name: 'Sandra', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 24, image: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 25, name: 'Amri', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 25, image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 26, name: 'Nasri Lapas', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 26, image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 27, name: 'Aprijal', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 27, image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 28, name: 'Arifuddin', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 28, image: 'https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 29, name: 'H Amier', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 29, image: 'https://images.pexels.com/photos/842567/pexels-photo-842567.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 30, name: 'Rustam', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 30, image: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 31, name: 'A. Arwan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 31, image: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 32, name: 'Laganing', category: 'Seeded B(+)', ageGroup: 'Atlet Senior', rank: 32, image: 'https://images.pexels.com/photos/937481/pexels-photo-937481.jpeg?auto=compress&cs=tinysrgb&w=600' },

  // --- SEEDED B- (10 Orang) ---
  { id: 33, name: 'A. Mansur', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 33, image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 34, name: 'Darwis R.', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 34, image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 35, name: 'Prof. Fikri', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 35, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 36, name: 'Ali', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 36, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 37, name: 'Saldy', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 37, image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 38, name: 'Mulyadi', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 38, image: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 39, name: 'Haedir', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 39, image: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 40, name: 'H Fitra', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 40, image: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 41, name: 'Marzuki', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 41, image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 42, name: 'Kurnia', category: 'Seeded B(-)', ageGroup: 'Atlet Senior', rank: 42, image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=600' },

  // --- SEEDED C (Atlet Muda - 12 Orang) ---
  { id: 43, name: 'Ust. Usman', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 1, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 44, name: 'H. Tantong', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 2, image: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 45, name: 'Surakati', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 3, image: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 46, name: 'H. Hasym', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 4, image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 47, name: 'H. Faizal', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 5, image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 48, name: 'Markus', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 6, image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 49, name: 'H. Ude', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 7, image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 8, image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg' },
  { id: 51, name: 'H. Pangeran', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 9, image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 52, name: 'H. Anwar', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 10, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 53, name: 'Syarifuddin', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 11, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 54, name: 'Yakob', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 12, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [showAll, setShowAll] = useState(false);
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
    <section id="atlet" className="py-24 bg-[#0a0a0a] text-white min-h-screen relative overflow-hidden">
      
      {/* Modal Detail Pemain */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-[#121212] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300">
            <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 z-10 bg-blue-600 p-2 rounded-full hover:scale-110 transition-transform">
              <X size={20} />
            </button>
            <div className="w-full md:w-1/2 aspect-square md:aspect-auto">
              <img src={selectedPlayer.image} className="w-full h-full object-cover" alt={selectedPlayer.name} />
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center flex-1">
              <div className="flex items-center gap-2 mb-4 text-blue-500 font-bold text-xs uppercase tracking-widest">
                <ShieldCheck size={16} /> Elite Member
              </div>
              <h2 className="text-4xl font-black uppercase mb-4 leading-none">{selectedPlayer.name}</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-4 rounded-2xl">
                  <Target className="text-blue-500 mb-1" size={18} />
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Kategori</p>
                  <p className="font-bold text-sm">{selectedPlayer.category}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl">
                  <Star className="text-yellow-500 mb-1" size={18} />
                  <p className="text-zinc-500 text-[10px] uppercase font-bold">Rank</p>
                  <p className="font-bold text-sm">#{selectedPlayer.rank}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* Header & Filter Section */}
        <div className="flex flex-col space-y-12 mb-16 border-b border-white/5 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="space-y-3">
              <p className="text-blue-500 font-bold text-sm uppercase tracking-[0.4em]">PILAR PB US 162</p>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
                {showAll ? 'SEMUA ANGGOTA' : 'PROFIL PEMAIN'}
              </h2>
            </div>
            <div className="flex bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
              <button 
                onClick={() => {setCurrentTab('Atlet Senior'); setShowAll(false);}} 
                className={`flex items-center gap-3 px-6 md:px-8 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                <UserCheck size={18} /> SENIOR
              </button>
              <button 
                onClick={() => {setCurrentTab('Atlet Muda'); setShowAll(false);}} 
                className={`flex items-center gap-3 px-6 md:px-8 py-4 rounded-xl font-black text-xs tracking-widest transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                <Users size={18} /> MUDA
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder={`Cari nama pemain di ${currentTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Content Section: Slider or Grid */}
        {filteredPlayers.length > 0 ? (
          !showAll ? (
            <div className="relative group">
              <Swiper
                key={`${currentTab}-${searchTerm}`} // Memaksa re-render saat filter berubah
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                onBeforeInit={(swiper) => {
                  // Inisialisasi navigasi kustom
                  // @ts-ignore
                  swiper.params.navigation.prevEl = prevRef.current;
                  // @ts-ignore
                  swiper.params.navigation.nextEl = nextRef.current;
                }}
                pagination={{ clickable: true, dynamicBullets: true }}
                breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
                className="player-swiper !pb-20"
              >
                {filteredPlayers.map((player) => (
                  <SwiperSlide key={player.id}>
                    <div 
                      onClick={() => setSelectedPlayer(player)} 
                      className="group/card cursor-pointer relative aspect-[3/4.5] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:-translate-y-3"
                    >
                      <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-60 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <div className="absolute top-6 left-6">
                        <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-xl">
                          #{player.rank}
                        </div>
                      </div>
                      <div className="absolute bottom-8 left-6 right-6">
                        <span className="text-[10px] bg-blue-600/20 text-blue-400 font-black px-2 py-1 rounded mb-2 inline-block uppercase tracking-wider">{player.category}</span>
                        <h3 className="text-xl md:text-2xl font-black uppercase group-hover/card:text-blue-400 transition-colors leading-tight">{player.name}</h3>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Custom Navigation Buttons */}
              <button ref={prevRef} className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-6 transition-all shadow-xl hover:scale-110">
                <ChevronLeft size={24} />
              </button>
              <button ref={nextRef} className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-6 transition-all shadow-xl hover:scale-110">
                <ChevronRight size={24} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in fade-in duration-500">
              {filteredPlayers.map((player) => (
                <div key={player.id} onClick={() => setSelectedPlayer(player)} className="cursor-pointer relative aspect-[3/4.5] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-500 transition-all">
                  <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xs md:text-sm font-black uppercase leading-tight">{player.name}</h3>
                    <p className="text-[9px] text-blue-500 font-bold mt-1 uppercase">{player.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-[2.5rem]">
            <Search className="mx-auto text-zinc-700 mb-4" size={48} />
            <p className="text-zinc-500 font-bold uppercase tracking-widest">Pemain tidak ditemukan</p>
          </div>
        )}

        {/* Toggle View Button */}
        <div className="mt-16 flex justify-center">
          <button 
            onClick={() => {setShowAll(!showAll); setSearchTerm("");}} 
            className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-blue-600 hover:text-white shadow-2xl active:scale-95"
          >
            {showAll ? <><LayoutDashboard size={18} /> Kembali ke Slider</> : <>Lihat Semua {filteredPlayers.length} Pemain <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>

      <style>{`
        .player-swiper .swiper-pagination-bullet { background: #3f3f46; opacity: 1; }
        .player-swiper .swiper-pagination-bullet-active { background: #2563eb !important; width: 24px; border-radius: 4px; }
      `}</style>
    </section>
  );
}
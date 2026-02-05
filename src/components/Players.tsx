import React, { useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { 
  Trophy, X, Search, ChevronLeft, ChevronRight, 
  UserCheck, Users, ArrowRight, LayoutDashboard,
  Target, Zap, ShieldCheck, Star
} from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// --- DATA PEMAIN BERDASARKAN GAMBAR TABEL ---
const rawPlayersData = [
  // SEEDED A (KOLOM A)
  { id: 1, name: 'Agustilaar', category: 'Seeded A', ageGroup: 'Atlet Senior' },
  { id: 2, name: 'Darwis (TNI)', category: 'Seeded A', ageGroup: 'Atlet Senior' },
  { id: 3, name: 'Salman', category: 'Seeded A', ageGroup: 'Atlet Senior' },
  { id: 4, name: 'Lutfi', category: 'Seeded A', ageGroup: 'Atlet Senior' },
  { id: 5, name: 'Udin', category: 'Seeded A', ageGroup: 'Atlet Senior' },
  { id: 6, name: 'Aldy Sandra', category: 'Seeded A', ageGroup: 'Atlet Senior' },
  { id: 7, name: 'Mustakim', category: 'Seeded A', ageGroup: 'Atlet Senior' },
  { id: 8, name: 'Rifai', category: 'Seeded A', ageGroup: 'Atlet Senior' },
  { id: 9, name: 'Acos', category: 'Seeded A', ageGroup: 'Atlet Senior' },
  { id: 10, name: 'Herman', category: 'Seeded A', ageGroup: 'Atlet Senior' },
  // SEEDED B(+) (KOLOM B+)
  { id: 11, name: 'Dr. Khaliq', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 12, name: 'H. Ismail', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 13, name: 'Momota', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 14, name: 'Saleh', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 15, name: 'H. Zaidi', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 16, name: 'Zainuddin', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 17, name: 'Bustan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 18, name: 'H. Wawan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 19, name: 'Lumpue', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 20, name: 'Madhy', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 21, name: 'Vhio', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 22, name: 'Anto', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 23, name: 'Lukman', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 24, name: 'Sandra', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 25, name: 'Amri', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 26, name: 'Nasri Lapas', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 27, name: 'Aprijal', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 28, name: 'Arifuddin', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 29, name: 'H Amier', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 30, name: 'Rustam', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 31, name: 'A. Arwan', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  { id: 32, name: 'Laganing', category: 'Seeded B(+)', ageGroup: 'Atlet Senior' },
  // SEEDED B(-) (KOLOM B-)
  { id: 33, name: 'A. Mansur', category: 'Seeded B(-)', ageGroup: 'Atlet Senior' },
  { id: 34, name: 'Darwis R.', category: 'Seeded B(-)', ageGroup: 'Atlet Senior' },
  { id: 35, name: 'Prof. Fikri', category: 'Seeded B(-)', ageGroup: 'Atlet Senior' },
  { id: 36, name: 'Ali', category: 'Seeded B(-)', ageGroup: 'Atlet Senior' },
  { id: 37, name: 'Saldy', category: 'Seeded B(-)', ageGroup: 'Atlet Senior' },
  { id: 38, name: 'Mulyadi', category: 'Seeded B(-)', ageGroup: 'Atlet Senior' },
  { id: 39, name: 'Haedir', category: 'Seeded B(-)', ageGroup: 'Atlet Senior' },
  { id: 40, name: 'H Fitra', category: 'Seeded B(-)', ageGroup: 'Atlet Senior' },
  { id: 41, name: 'Marzuki', category: 'Seeded B(-)', ageGroup: 'Atlet Senior' },
  { id: 42, name: 'Kurnia', category: 'Seeded B(-)', ageGroup: 'Atlet Senior' },
  // SEEDED C (KOLOM C)
  { id: 43, name: 'Ust. Usman', category: 'Seeded C', ageGroup: 'Atlet Muda' },
  { id: 44, name: 'H. Tantong', category: 'Seeded C', ageGroup: 'Atlet Muda' },
  { id: 45, name: 'Surakati', category: 'Seeded C', ageGroup: 'Atlet Muda' },
  { id: 46, name: 'H. Hasym', category: 'Seeded C', ageGroup: 'Atlet Muda' },
  { id: 47, name: 'H. Faizal', category: 'Seeded C', ageGroup: 'Atlet Muda' },
  { id: 48, name: 'Markus', category: 'Seeded C', ageGroup: 'Atlet Muda' },
  { id: 49, name: 'H. Ude', category: 'Seeded C', ageGroup: 'Atlet Muda' },
  { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda' },
  { id: 51, name: 'H. Pangeran', category: 'Seeded C', ageGroup: 'Atlet Muda' },
  { id: 52, name: 'H. Anwar', category: 'Seeded C', ageGroup: 'Atlet Muda' },
  { id: 53, name: 'Syarifuddin', category: 'Seeded C', ageGroup: 'Atlet Muda' },
  { id: 54, name: 'Yakob', category: 'Seeded C', ageGroup: 'Atlet Muda' },
].map(p => ({
  ...p,
  // Menggunakan gambar placeholder yang bersih
  image: `https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600`,
  stats: {
    power: Math.floor(Math.random() * 20) + 75,
    speed: Math.floor(Math.random() * 20) + 75,
    stamina: Math.floor(Math.random() * 20) + 75,
  }
}));

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const filteredPlayers = useMemo(() => {
    return rawPlayersData.filter(p => {
      const matchesTab = p.ageGroup === currentTab;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [currentTab, searchTerm]);

  return (
    <section id="atlet" className="py-24 bg-[#0a0a0a] text-white min-h-screen relative overflow-hidden">
      
      {/* MODAL DETAIL PEMAIN */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-4xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setSelectedPlayer(null)} className="absolute top-6 right-6 z-10 p-3 bg-black/50 rounded-full hover:bg-white hover:text-black transition-all">
              <X size={20} />
            </button>
            
            <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto relative">
              <img src={selectedPlayer.image} alt={selectedPlayer.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
            </div>

            <div className="p-8 md:p-12 w-full md:w-1/2 flex flex-col justify-center">
              <span className="text-blue-500 font-bold tracking-widest uppercase text-xs mb-4">{selectedPlayer.category}</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic leading-tight mb-8">{selectedPlayer.name}</h2>
              
              <div className="grid grid-cols-1 gap-6">
                {[
                  { label: 'Power', val: selectedPlayer.stats.power, icon: <Zap className="text-amber-500" size={16}/> },
                  { label: 'Speed', val: selectedPlayer.stats.speed, icon: <Target className="text-blue-500" size={16}/> },
                  { label: 'Defense', val: selectedPlayer.stats.stamina, icon: <ShieldCheck className="text-emerald-500" size={16}/> }
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">
                      <div className="flex items-center gap-2">{s.icon} {s.label}</div>
                      <span>{s.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${s.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* HEADER & SEARCH */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="space-y-6">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic">Pemain</h2>
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500" size={18} />
              <input 
                type="text" 
                placeholder="Cari 54 Nama Atlet..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-600 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
            <button onClick={() => {setCurrentTab('Atlet Senior'); setSearchTerm("")}} className={`px-8 py-4 rounded-xl font-black text-[10px] tracking-widest transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}>SENIOR</button>
            <button onClick={() => {setCurrentTab('Atlet Muda'); setSearchTerm("")}} className={`px-8 py-4 rounded-xl font-black text-[10px] tracking-widest transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}>MUDA</button>
          </div>
        </div>

        {/* SLIDER */}
        {filteredPlayers.length > 0 ? (
          <div className="relative group">
            <Swiper
              key={`${currentTab}-${searchTerm}`}
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-8 left-8 right-8">
                      <span className="text-blue-500 font-bold text-[9px] uppercase tracking-widest block mb-2">{player.category}</span>
                      <h3 className="text-2xl font-black uppercase italic leading-tight group-hover/card:text-blue-400 transition-colors">{player.name}</h3>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            <button ref={prevRef} className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-7 transition-all hover:bg-blue-600 backdrop-blur-md"><ChevronLeft/></button>
            <button ref={nextRef} className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-7 transition-all hover:bg-blue-600 backdrop-blur-md"><ChevronRight/></button>
          </div>
        ) : (
          <div className="py-20 text-center bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-800">
             <Search size={48} className="mx-auto text-zinc-700 mb-4" />
             <h3 className="text-xl font-bold text-zinc-500 uppercase tracking-widest">Pemain tidak ditemukan</h3>
          </div>
        )}
      </div>

      <style>{`
        .player-swiper .swiper-pagination-bullet { background: #27272a; opacity: 1; height: 4px; width: 12px; border-radius: 2px; transition: all 0.3s; }
        .player-swiper .swiper-pagination-bullet-active { background: #2563eb !important; width: 32px; }
      `}</style>
    </section>
  );
}
import React, { useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { 
  Trophy, X, Search, ChevronLeft, ChevronRight, 
  UserCheck, Users, ArrowRight, LayoutDashboard 
} from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// --- DATA PEMAIN LENGKAP (54 PEMAIN) ---
const rawPlayersData = [
  // SEEDED A (10 Pemain)
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

  // SEEDED B (+) (22 Pemain)
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

  // SEEDED B (-) (10 Pemain)
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

  // SEEDED C (12 Pemain)
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
  image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}` // Placeholder foto profil unik per nama
}));

const categorySettings: Record<string, any> = {
  'Seeded A': { base: 10000, winBonus: 500 },
  'Seeded B(+)': { base: 8500, winBonus: 400 },
  'Seeded B(-)': { base: 7500, winBonus: 300 },
  'Seeded C': { base: 6000, winBonus: 200 },
};

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [searchTerm, setSearchTerm] = useState("");
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const filteredPlayers = useMemo(() => {
    return rawPlayersData
      .map((p, idx) => ({
        ...p,
        totalPoints: (categorySettings[p.category]?.base || 5000) - (idx * 10),
        globalRank: idx + 1
      }))
      .filter(p => {
        const matchesTab = p.ageGroup === currentTab;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
      });
  }, [currentTab, searchTerm]);

  return (
    <section id="atlet" className="py-20 bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="space-y-4 w-full md:w-auto">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Database Pemain</h2>
            
            <div className="relative max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text"
                placeholder="Cari 54 Nama Pemain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 focus:border-blue-600 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button onClick={() => setCurrentTab('Atlet Senior')} className={`px-6 py-3 rounded-lg font-bold text-xs transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600' : 'text-zinc-500'}`}>SENIOR (A, B+, B-)</button>
            <button onClick={() => setCurrentTab('Atlet Muda')} className={`px-6 py-3 rounded-lg font-bold text-xs transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600' : 'text-zinc-500'}`}>MUDA (C)</button>
          </div>
        </div>

        {/* SLIDER */}
        {filteredPlayers.length > 0 ? (
          <div className="relative">
            <Swiper
              key={`${currentTab}-${searchTerm}`}
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
              breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
            >
              {filteredPlayers.map((player) => (
                <SwiperSlide key={player.id}>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden group hover:border-blue-600/50 transition-all">
                    <div className="aspect-[4/5] relative bg-zinc-800">
                      <img src={player.image} alt={player.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      <div className="absolute top-4 left-4 bg-blue-600 px-3 py-1 rounded-lg font-black text-xs italic">#{player.globalRank}</div>
                    </div>
                    <div className="p-6">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{player.category}</span>
                      <h3 className="text-xl font-black uppercase truncate mt-1">{player.name}</h3>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            <button ref={prevRef} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:bg-blue-600 hover:text-white transition-all"><ChevronLeft size={20}/></button>
            <button ref={nextRef} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:bg-blue-600 hover:text-white transition-all"><ChevronRight size={20}/></button>
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
            <p className="text-zinc-500 font-bold uppercase">Nama "{searchTerm}" tidak ditemukan di database</p>
          </div>
        )}
      </div>
    </section>
  );
}
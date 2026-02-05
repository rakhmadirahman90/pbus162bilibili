import React, { useState, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
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
  // --- SEEDED A ---
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

  // --- SEEDED B+ ---
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

  // --- SEEDED B- ---
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

  // --- SEEDED C ---
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const filteredPlayers = useMemo(() => {
    return playersData.filter(p => 
      p.ageGroup === currentTab && 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentTab, searchTerm]);

  return (
    <section id="atlet" className="py-20 bg-[#0a0a0a] text-white min-h-screen">
      {/* --- MODAL DETAIL --- */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-[#121212] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden animate-in zoom-in duration-200">
            <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 z-10 bg-blue-600 p-2 rounded-full"><X size={20} /></button>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 aspect-square">
                <img src={selectedPlayer.image} className="w-full h-full object-cover" alt={selectedPlayer.name} />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="text-blue-500 font-bold text-xs tracking-tighter uppercase mb-2">Member Elite</span>
                <h2 className="text-3xl font-black uppercase mb-4">{selectedPlayer.name}</h2>
                <div className="flex gap-4">
                   <div className="bg-white/5 p-3 rounded-xl">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Kategori</p>
                      <p className="font-bold">{selectedPlayer.category}</p>
                   </div>
                   <div className="bg-white/5 p-3 rounded-xl">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Rank</p>
                      <p className="font-bold">#{selectedPlayer.rank}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* --- HEADER --- */}
        <div className="mb-16 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
            <div>
              <p className="text-blue-500 font-bold text-sm tracking-[0.4em] uppercase mb-2">PB US 162</p>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">DATA PEMAIN</h2>
            </div>

            <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
              <button 
                onClick={() => setCurrentTab('Atlet Senior')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 shadow-lg' : 'text-zinc-500'}`}
              >
                <UserCheck size={16} /> SENIOR
              </button>
              <button 
                onClick={() => setCurrentTab('Atlet Muda')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 shadow-lg' : 'text-zinc-500'}`}
              >
                <Users size={16} /> MUDA
              </button>
            </div>
          </div>

          {/* --- SEARCH BAR --- */}
          <div className="relative max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder={`Cari nama di ${currentTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* --- GRID PEMAIN --- */}
        {filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 animate-in fade-in duration-500">
            {filteredPlayers.map((player) => (
              <div 
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="group cursor-pointer relative aspect-[3/4.5] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-500 transition-all duration-300"
              >
                <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[9px] bg-blue-600 px-2 py-0.5 rounded font-black uppercase mb-1 inline-block">{player.category}</span>
                  <h3 className="text-sm md:text-base font-bold uppercase leading-tight group-hover:text-blue-400 transition-colors">{player.name}</h3>
                </div>
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                  <p className="text-[10px] font-black">#{player.rank}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
            <Search className="mx-auto text-zinc-700 mb-4" size={40} />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Pemain "{searchTerm}" tidak ditemukan</p>
          </div>
        )}
      </div>
    </section>
  );
}
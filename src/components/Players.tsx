import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Pastikan semua ikon ini terpasang di project Anda
import { 
  Trophy, X, Target, Star, ShieldCheck, Zap, 
  ChevronLeft, ChevronRight, UserCheck, Users, 
  ArrowRight, LayoutDashboard, Search 
} from 'lucide-react';

// --- DATA PEMAIN (Pastikan ID Unik) ---
const playersData = [
  // Seeded A
  { id: 1, name: 'Agustilaar', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 1, image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 2, name: 'Darwis (TNI)', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 2, image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 3, name: 'Salman', category: 'Seeded A', ageGroup: 'Atlet Senior', rank: 3, image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600' },
  // ... Tambahkan data lainnya sesuai kebutuhan
  { id: 43, name: 'Ust. Usman', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 1, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 50, name: 'Hidayatullah', category: 'Seeded C', ageGroup: 'Atlet Muda', rank: 8, image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

export default function Players() {
  const [currentTab, setCurrentTab] = useState('Atlet Senior');
  const [showAll, setShowAll] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // Filter Logika
  const filteredPlayers = useMemo(() => {
    return playersData.filter(p => 
      p.ageGroup === currentTab && 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentTab, searchTerm]);

  return (
    <section className="py-20 bg-[#0a0a0a] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header & Filter */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-blue-500 font-bold text-sm tracking-widest uppercase">PB US 162</p>
              <h2 className="text-4xl md:text-6xl font-black uppercase">Anggota Kami</h2>
            </div>

            {/* Tab Selector */}
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button 
                onClick={() => {setCurrentTab('Atlet Senior'); setShowAll(false);}}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${currentTab === 'Atlet Senior' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}
              >
                SENIOR
              </button>
              <button 
                onClick={() => {setCurrentTab('Atlet Muda'); setShowAll(false);}}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${currentTab === 'Atlet Muda' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}
              >
                MUDA
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text"
              placeholder="Cari nama pemain..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Swiper / Grid View */}
        {filteredPlayers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredPlayers.map((player) => (
              <div 
                key={player.id} 
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-500 transition-all cursor-pointer"
                onClick={() => setSelectedPlayer(player)}
              >
                <img src={player.image} alt={player.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-[10px] text-blue-400 font-bold uppercase">{player.category}</p>
                  <h3 className="font-bold text-sm md:text-base uppercase">{player.name}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-500">Pemain tidak ditemukan.</p>
          </div>
        )}

      </div>
    </section>
  );
}
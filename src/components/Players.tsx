import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Observer } from 'swiper/modules';
import { supabase } from "../supabase";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Search, Trophy, ChevronLeft, ChevronRight, Award, Zap, Info, Loader2, User 
} from 'lucide-react';

const Players: React.FC<{ initialFilter?: string }> = ({ initialFilter = 'Semua' }) => {
  const [currentAgeGroup, setCurrentAgeGroup] = useState(initialFilter); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  
  const [dbPlayers, setDbPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // --- FETCH DATA SESUAI SCREENSHOT SUPABASE ---
  const fetchPlayersFromDB = async () => {
    try {
      setIsLoading(true);
      // Mengambil data dari tabel 'rankings' sesuai screenshot image_7b1141.jpg
      const { data, error } = await supabase
        .from('rankings')
        .select('*') 
        .order('total_points', { ascending: false });

      if (error) throw error;
      if (data) setDbPlayers(data);
    } catch (err) {
      console.error("Error fetching rankings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayersFromDB();
  }, []);

  // --- MAPPING DATA ---
  const processedPlayers = useMemo(() => {
    return dbPlayers.map((p) => {
      // Penentuan Kategori berdasarkan kolom 'category' di database
      const dbCat = (p.category || "").toUpperCase();
      let ageGroup = 'Senior';
      if (dbCat.includes('MUDA') || dbCat.includes('U-') || dbCat.includes('TARUNA')) {
        ageGroup = 'Muda';
      }

      return {
        ...p,
        id: p.id,
        name: p.player_name || "Tanpa Nama",
        // Menggunakan fallback jika photo_url tidak ada di tabel rankings
        img: p.photo_url || p.foto_url || null, 
        points: p.total_points || 0,
        seed: p.seed || "UNSEEDED",
        category: ageGroup
      };
    });
  }, [dbPlayers]);

  // --- FILTERING ---
  const filteredPlayers = useMemo(() => {
    return processedPlayers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAge = currentAgeGroup === "Semua" || p.category === currentAgeGroup;
      return matchesSearch && matchesAge;
    });
  }, [searchTerm, currentAgeGroup, processedPlayers]);

  return (
    <section id="atlet" className="py-20 bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-5xl font-black italic uppercase">PROFIL <span className="text-blue-600">PEMAIN</span></h2>
            <p className="text-zinc-500 font-bold tracking-widest text-sm mt-2">DATA TERUPDATE & REALTIME</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
            <input 
              type="text" 
              placeholder="Cari atlet..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-600 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TAB FILTER - Sesuai angka di screenshot Anda (54, 44, 10) */}
        <div className="flex bg-zinc-900/50 p-2 rounded-full border border-zinc-800 w-fit mb-12">
          {['Semua', 'Senior', 'Muda'].map((tab) => {
            const count = tab === 'Semua' ? processedPlayers.length : processedPlayers.filter(p => p.category === tab).length;
            return (
              <button 
                key={tab}
                onClick={() => setCurrentAgeGroup(tab)}
                className={`px-8 py-3 rounded-full text-xs font-black transition-all flex items-center gap-3 ${currentAgeGroup === tab ? 'bg-blue-600' : 'text-zinc-500'}`}
              >
                {tab.toUpperCase()} <span className="opacity-50">{count}</span>
              </button>
            )
          })}
        </div>

        {/* RENDER KONTEN */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : filteredPlayers.length > 0 ? (
          <div className="relative group">
            <Swiper
              modules={[Navigation, Pagination, Observer]}
              spaceBetween={20}
              slidesPerView={1.2}
              observer={true}
              observeParents={true}
              navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
              breakpoints={{ 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
            >
              {filteredPlayers.map((player) => (
                <SwiperSlide key={player.id}>
                  <div 
                    onClick={() => setSelectedPlayer(player)}
                    className="bg-zinc-900 rounded-[3rem] overflow-hidden border border-zinc-800 hover:border-blue-600 transition-all group/card cursor-pointer relative aspect-[3/4]"
                  >
                    {player.img ? (
                      <img src={player.img} className="w-full h-full object-cover" alt={player.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={60} className="text-zinc-700" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8">
                      <p className="text-blue-500 text-[10px] font-black tracking-widest uppercase mb-1">{player.category}</p>
                      <h3 className="text-2xl font-black uppercase italic line-clamp-1">{player.name}</h3>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                        <span className="text-[10px] text-zinc-500 font-bold">{player.seed}</span>
                        <span className="text-sm font-black">{player.points.toLocaleString()} PTS</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Tombol Navigasi Swiper */}
            <button ref={prevRef} className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"><ChevronLeft /></button>
            <button ref={nextRef} className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"><ChevronRight /></button>
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-700 font-black uppercase tracking-widest italic">Data Tidak Ditemukan</div>
        )}
      </div>

      {/* MODAL SEDERHANA */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedPlayer(null)} />
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] max-w-lg w-full p-10 relative overflow-hidden">
             <button onClick={() => setSelectedPlayer(null)} className="absolute top-6 right-6"><X /></button>
             <h2 className="text-4xl font-black italic uppercase mb-4">{selectedPlayer.name}</h2>
             <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl flex justify-between">
                  <span className="text-zinc-500 font-bold uppercase text-xs">Poin</span>
                  <span className="font-black text-blue-500">{selectedPlayer.points.toLocaleString()}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl flex justify-between">
                  <span className="text-zinc-500 font-bold uppercase text-xs">Kategori</span>
                  <span className="font-black">{selectedPlayer.category}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl flex justify-between">
                  <span className="text-zinc-500 font-bold uppercase text-xs">Status</span>
                  <span className="font-black">{selectedPlayer.seed}</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Players;
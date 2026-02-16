import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { supabase } from "../supabase";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Search, Trophy, ChevronLeft, ChevronRight, Award, Zap, Loader2, User 
} from 'lucide-react';

const Players: React.FC = () => {
  const [currentAgeGroup, setCurrentAgeGroup] = useState('Semua'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [dbPlayers, setDbPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // --- FETCH DATA SESUAI STRUKTUR GAMBAR SUPABASE ANDA ---
  const fetchPlayersFromDB = async () => {
    try {
      setIsLoading(true);
      
      // Ambil data dari atlet_stats dan join ke pendaftaran
      // Berdasarkan image_7cf1c1.jpg, kolom di pendaftaran adalah 'nama' dan 'kategori'
      const { data, error } = await supabase
        .from('atlet_stats')
        .select(`
          *,
          pendaftaran (
            nama,
            foto_url,
            kategori
          )
        `)
        .order('points', { ascending: false });

      if (error) throw error;
      setDbPlayers(data || []);
      
    } catch (err) {
      console.error("Database Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayersFromDB();
    // Realtime subscription agar otomatis update saat poin diubah di admin
    const channel = supabase.channel('atlet_changes')
      .on('postgres_changes', { event: '*', table: 'atlet_stats', schema: 'public' }, () => fetchPlayersFromDB())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const processedPlayers = useMemo(() => {
    return dbPlayers.map((p) => {
      const info = p.pendaftaran || {};
      
      // Mapping field berdasarkan image_7cf1c1.jpg dan image_7cf1a3.jpg
      const name = info.nama || "Atlet PB US";
      const photo = info.foto_url || null;
      const categoryRaw = (info.kategori || p.seed || "SENIOR").toUpperCase();

      // Penentuan Tab (Senior/Muda)
      let ageGroup = 'Senior';
      if (categoryRaw.includes('MUDA')) {
        ageGroup = 'Muda';
      }

      return {
        ...p,
        name: name,
        img: photo,
        ageGroup: ageGroup,
        displayPoints: p.points || 0,
        displaySeed: p.seed || "UNSEEDED",
        bio: p.bio || "Atlet profesional PB US 162 Bilibili."
      };
    });
  }, [dbPlayers]);

  const filteredPlayers = useMemo(() => {
    return processedPlayers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAge = currentAgeGroup === "Semua" || p.ageGroup === currentAgeGroup;
      return matchesSearch && matchesAge;
    });
  }, [searchTerm, currentAgeGroup, processedPlayers]);

  return (
    <section id="atlet" className="py-24 bg-[#050505] text-white min-h-screen relative font-sans">
      
      {/* MODAL DETAIL */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-4xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in duration-300">
            <div className="w-full md:w-1/2 bg-[#080808] h-[400px] md:h-auto">
              {selectedPlayer.img ? (
                <img src={selectedPlayer.img} className="w-full h-full object-cover" alt={selectedPlayer.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={100} className="text-zinc-700" /></div>
              )}
            </div>
            <div className="p-10 flex-1 relative">
              <button onClick={() => setSelectedPlayer(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={28} /></button>
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-600/20 text-blue-500 rounded-full text-[10px] font-black uppercase">{selectedPlayer.ageGroup}</span>
                <span className="px-3 py-1 bg-white/5 text-zinc-400 rounded-full text-[10px] font-black uppercase">{selectedPlayer.displaySeed}</span>
              </div>
              <h2 className="text-4xl font-black uppercase italic mb-6 leading-tight">{selectedPlayer.name}</h2>
              <div className="bg-white/5 p-6 rounded-2xl mb-8 border border-white/5">
                <p className="text-zinc-400 italic">"{selectedPlayer.bio}"</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 p-5 rounded-2xl border border-white/5">
                  <Zap className="text-blue-500 mb-1" size={18} />
                  <p className="text-[10px] text-zinc-500 uppercase font-black">Points</p>
                  <p className="text-xl font-black">{selectedPlayer.displayPoints.toLocaleString()}</p>
                </div>
                <div className="bg-zinc-800/50 p-5 rounded-2xl border border-white/5">
                  <Trophy className="text-yellow-500 mb-1" size={18} />
                  <p className="text-[10px] text-zinc-500 uppercase font-black">Rank</p>
                  <p className="text-xl font-black">#{processedPlayers.findIndex(x => x.id === selectedPlayer.id) + 1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">PROFIL <span className="text-blue-600">PEMAIN</span></h2>
            <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase">Data Sinkron dengan Manajemen Atlet</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama atlet..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs focus:border-blue-600 transition-colors"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Filter */}
        <div className="flex bg-zinc-900/50 p-1.5 rounded-full border border-zinc-800 w-fit mb-12">
          {['Semua', 'Senior', 'Muda'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setCurrentAgeGroup(tab)}
              className={`px-8 py-3 rounded-full text-[11px] font-black transition-all ${currentAgeGroup === tab ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-xs font-black uppercase text-zinc-500">Menghubungkan Database...</p>
          </div>
        ) : (
          <div className="relative group/slider">
            {filteredPlayers.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1.2}
                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                breakpoints={{ 640: { slidesPerView: 2.5 }, 1024: { slidesPerView: 4 } }}
                className="!pb-16"
              >
                {filteredPlayers.map((player) => (
                  <SwiperSlide key={player.id}>
                    <div 
                      onClick={() => setSelectedPlayer(player)}
                      className="group cursor-pointer relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600 transition-all duration-500"
                    >
                      {player.img ? (
                        <img src={player.img} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-700" alt={player.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600"><User size={50} /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-8 left-8 right-8">
                        <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest mb-1">{player.ageGroup}</p>
                        <h3 className="text-xl font-black uppercase italic mb-3 group-hover:text-blue-500 transition-colors line-clamp-1">{player.name}</h3>
                        <div className="flex justify-between items-center text-[10px] font-black pt-3 border-t border-white/10">
                          <span className="text-white/30">{player.displaySeed}</span>
                          <span>{player.displayPoints.toLocaleString()} PTS</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="py-20 text-center text-zinc-600 font-black uppercase italic">
                Data Atlet "{searchTerm}" Tidak Ditemukan
              </div>
            )}
            <button ref={prevRef} className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-blue-600"><ChevronLeft /></button>
            <button ref={nextRef} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-blue-600"><ChevronRight /></button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Players;
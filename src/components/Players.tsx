import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { supabase } from "../supabase";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Search, Trophy, ChevronLeft, ChevronRight, Award, Zap, Info, Loader2, User 
} from 'lucide-react';

const EVENT_LOG = [
  { 
    id: 1, 
    winners: ["Agustilaar", "Herman", "H. Wawan", "Bustan", "Dr. Khaliq", "Momota", "Prof. Fikri", "Marzuki", "Arsan", "H. Hasym", "H. Anwar", "Yakob"] 
  },
];

interface PlayersProps {
  initialFilter?: string;
}

const Players: React.FC<PlayersProps> = ({ initialFilter = 'Semua' }) => {
  const [currentAgeGroup, setCurrentAgeGroup] = useState(initialFilter); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  
  const [dbPlayers, setDbPlayers] = useState<any[]>([]);
  const [dbWinners, setDbWinners] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<any>(null); // Ref untuk akses API Swiper secara langsung

  // 1. Sinkronisasi tab saat mount
  useEffect(() => {
    if (initialFilter) setCurrentAgeGroup(initialFilter);
  }, [initialFilter]);

  // 2. Fungsi Fetching Data
  const fetchPlayersFromDB = async () => {
    try {
      // Ambil data ranking
      const { data: rankingsData, error: rError } = await supabase
        .from('rankings')
        .select('*')
        .order('total_points', { ascending: false });

      // Ambil data pemenang
      const { data: winnersData } = await supabase
        .from('hasil_turnamen')
        .select('nama_atlet');

      if (rError) throw rError;

      setDbPlayers(rankingsData || []);
      if (winnersData) setDbWinners(winnersData.map(w => w.nama_atlet));
      
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayersFromDB();

    const channel = supabase
      .channel('db_realtime_players')
      .on('postgres_changes', { event: '*', table: 'rankings', schema: 'public' }, () => fetchPlayersFromDB())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Logika Proses Data (Memoized)
  const processedPlayers = useMemo(() => {
    const ageMapping: Record<string, string> = {
      'SENIOR': 'Senior',
      'DEWASA': 'Senior',
      'TARUNA (U-19)': 'Muda',
      'REMAJA (U-17)': 'Muda',
    };

    const allWinners = [...new Set([...EVENT_LOG[0].winners, ...dbWinners])];

    return dbPlayers.map((p) => {
      const rawCategory = (p.category || "").toUpperCase();
      let mappedAge = (rawCategory.includes('MUDA') || rawCategory.includes('U-')) ? 'Muda' : (ageMapping[rawCategory] || 'Senior');

      return {
        ...p,
        id: p.id,
        name: p.player_name,
        img: p.photo_url || p.foto_url,
        bio: p.bio || `Atlet PB US 162 kategori ${p.category}.`,
        totalPoints: Number(p.total_points) || 0,
        isWinner: allWinners.includes(p.player_name),
        ageGroup: mappedAge,
        categoryLabel: p.seed || 'UNSEEDED',
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [dbPlayers, dbWinners]);

  // 4. Perbaikan Utama: Paksa Swiper Update saat data siap
  useEffect(() => {
    if (swiperRef.current && processedPlayers.length > 0) {
      setTimeout(() => {
        swiperRef.current.update(); // Paksa kalkulasi ulang dimensi Swiper
      }, 100);
    }
  }, [processedPlayers, currentAgeGroup]);

  const filteredPlayers = useMemo(() => {
    return processedPlayers.filter(p => {
      const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAge = currentAgeGroup === "Semua" || p.ageGroup === currentAgeGroup;
      return matchesSearch && matchesAge;
    });
  }, [searchTerm, currentAgeGroup, processedPlayers]);

  return (
    <section id="atlet" className="py-24 bg-[#050505] text-white min-h-screen relative overflow-hidden">
      
      {/* MODAL DETAIL */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-full md:w-1/2 bg-[#080808] flex items-center justify-center h-[400px] md:h-auto relative">
              {selectedPlayer.img ? (
                <img src={selectedPlayer.img} className="w-full h-full object-cover object-[center_20%]" alt="" />
              ) : (
                <User size={120} className="text-zinc-800" />
              )}
              {selectedPlayer.isWinner && (
                <div className="absolute bottom-8 left-8 bg-yellow-500 text-black px-5 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 italic tracking-widest uppercase">
                  <Award size={16} /> CHAMPION PLAYER
                </div>
              )}
            </div>
            <div className="p-10 md:p-16 flex-1">
              <button onClick={() => setSelectedPlayer(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={28} /></button>
              <h2 className="text-5xl font-black uppercase mb-6 italic tracking-tighter">{selectedPlayer.name}</h2>
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 mb-8">
                <p className="text-zinc-400 italic">"{selectedPlayer.bio}"</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 p-6 rounded-3xl border border-white/5">
                  <Zap className="text-blue-500 mb-2" size={20} />
                  <p className="text-[10px] text-zinc-500 uppercase font-black">Poin Klasemen</p>
                  <p className="text-2xl font-black">{selectedPlayer.totalPoints.toLocaleString()} PTS</p>
                </div>
                <div className="bg-zinc-800/50 p-6 rounded-3xl border border-white/5">
                  <Trophy className="text-yellow-500 mb-2" size={20} />
                  <p className="text-[10px] text-zinc-500 uppercase font-black">Kategori</p>
                  <p className="text-2xl font-black">{selectedPlayer.categoryLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
          <div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">PROFIL <span className="text-blue-600">PEMAIN</span></h2>
            <p className="text-zinc-500 text-xs font-bold tracking-[0.3em] mt-2 uppercase">Data Atlet Terupdate & Realtime</p>
          </div>
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" placeholder="Cari atlet..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-5 focus:border-blue-600 outline-none text-xs font-bold transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABS FILTER */}
        <div className="flex bg-zinc-900/50 p-2 rounded-[2.5rem] border border-zinc-800 backdrop-blur-xl w-fit mb-16">
          {['Semua', 'Senior', 'Muda'].map((label) => (
            <button 
              key={label}
              onClick={() => setCurrentAgeGroup(label)} 
              className={`px-10 py-4 rounded-[2rem] text-[12px] font-black transition-all ${currentAgeGroup === label ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              {label.toUpperCase()}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center py-20 gap-4 text-zinc-500">
            <Loader2 className="animate-spin" size={40} />
            <p className="font-black uppercase tracking-widest text-[10px]">Menyinkronkan Database...</p>
          </div>
        ) : (
          <div className="relative group">
            {filteredPlayers.length > 0 ? (
              <Swiper
                modules={[Navigation, Autoplay]}
                onSwiper={(swiper) => (swiperRef.current = swiper)} // Simpan akses swiper ke ref
                key={`swiper-instance-${currentAgeGroup}`} // Key unik per tab
                spaceBetween={25}
                slidesPerView={1.2}
                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                onBeforeInit={(swiper) => {
                    // @ts-ignore
                    swiper.params.navigation.prevEl = prevRef.current;
                    // @ts-ignore
                    swiper.params.navigation.nextEl = nextRef.current;
                }}
                breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 4 } }}
                className="!pb-20"
              >
                {filteredPlayers.map((player) => (
                  <SwiperSlide key={player.id}>
                    <div 
                      onClick={() => setSelectedPlayer(player)} 
                      className="group cursor-pointer relative aspect-[3/4] rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 hover:border-blue-600/50 transition-all duration-500 hover:-translate-y-2"
                    >
                      {player.img ? (
                        <img src={player.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={40} className="text-zinc-700" /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      
                      <div className="absolute top-6 left-6 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black border-2 border-black">
                        {processedPlayers.findIndex(p => p.id === player.id) + 1}
                      </div>

                      <div className="absolute bottom-8 left-8 right-8">
                        <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest mb-1">{player.ageGroup}</p>
                        <h3 className="text-2xl font-black uppercase italic leading-none mb-3 truncate">{player.name}</h3>
                        <div className="flex justify-between items-center border-t border-white/10 pt-4">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">{player.categoryLabel}</span>
                          <span className="text-xs font-black">{player.totalPoints.toLocaleString()} PTS</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="py-20 text-center text-zinc-600 font-black uppercase tracking-widest">Tidak ada data atlet ditemukan</div>
            )}
            
            <button ref={prevRef} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-600 transition-all shadow-2xl"><ChevronLeft size={24} /></button>
            <button ref={nextRef} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-600 transition-all shadow-2xl"><ChevronRight size={24} /></button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Players;
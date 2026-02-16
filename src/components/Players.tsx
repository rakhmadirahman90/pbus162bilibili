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
  { id: 1, winners: ["Agustilaar", "Herman", "H. Wawan", "Bustan", "Dr. Khaliq", "Momota", "Prof. Fikri", "Marzuki", "Arsan", "H. Hasym", "H. Anwar", "Yakob"] },
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
  const swiperInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (initialFilter) setCurrentAgeGroup(initialFilter);
  }, [initialFilter]);

  const fetchPlayersFromDB = async () => {
    try {
      setIsLoading(true);
      // Mencoba fetch data sederhana terlebih dahulu untuk menghindari error relasi
      const { data: atletData, error: aError } = await supabase
        .from('atlet_stats')
        .select('*')
        .order('points', { ascending: false });

      if (aError) throw aError;

      // Ambil data pemenang untuk lencana (badge)
      const { data: winnersData } = await supabase
        .from('hasil_turnamen')
        .select('nama_atlet');

      setDbPlayers(atletData || []);
      if (winnersData) setDbWinners(winnersData.map(w => w.nama_atlet));
      
    } catch (err) {
      console.error("Gagal fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayersFromDB();
    const channel = supabase.channel('realtime_atlet')
      .on('postgres_changes', { event: '*', table: 'atlet_stats', schema: 'public' }, () => fetchPlayersFromDB())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const processedPlayers = useMemo(() => {
    const allWinners = [...new Set([...EVENT_LOG[0].winners, ...dbWinners])];

    return dbPlayers.map((p) => {
      // Sesuai dengan gambar tabel Supabase Anda: 
      // bio -> bio, points -> points, seed -> seed
      // Untuk nama, jika tidak ada kolom nama di atlet_stats, kita beri placeholder
      const playerName = p.nama_atlet || p.player_name || "Atlet PB US";
      const rawSeed = (p.seed || "UNSEEDED").toUpperCase();
      
      // Penentuan Kelompok Usia Otomatis
      let mappedAge = 'Senior';
      if (rawSeed.includes('A') || rawSeed.includes('B')) {
        mappedAge = 'Senior';
      } else if (rawSeed.includes('MUDA') || (p.rank && p.rank > 50)) {
        mappedAge = 'Muda';
      }

      return {
        ...p,
        id: p.id,
        name: playerName,
        img: p.foto_url || p.img_url || p.photo_url,
        bio: p.bio || "Atlet profesional PB US 162 Bilibili.",
        totalPoints: Number(p.points) || 0,
        isWinner: allWinners.includes(playerName),
        ageGroup: mappedAge,
        categoryLabel: rawSeed,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [dbPlayers, dbWinners]);

  const filteredPlayers = useMemo(() => {
    return processedPlayers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAge = currentAgeGroup === "Semua" || p.ageGroup === currentAgeGroup;
      return matchesSearch && matchesAge;
    });
  }, [searchTerm, currentAgeGroup, processedPlayers]);

  useEffect(() => {
    if (swiperInstanceRef.current && !isLoading) {
      setTimeout(() => swiperInstanceRef.current.update(), 500);
    }
  }, [isLoading, filteredPlayers]);

  return (
    <section id="atlet" className="py-24 bg-[#050505] text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* MODAL DETAIL */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-full md:w-1/2 bg-[#080808] flex items-center justify-center h-[450px] md:h-auto relative">
              {selectedPlayer.img ? (
                <img src={selectedPlayer.img} className="w-full h-full object-cover" alt={selectedPlayer.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={120} className="text-zinc-700" /></div>
              )}
              {selectedPlayer.isWinner && (
                <div className="absolute bottom-10 left-10 bg-yellow-500 text-black px-6 py-3 rounded-2xl font-black text-[10px] flex items-center gap-3 italic uppercase tracking-widest"><Award size={18} /> WINNER - PB US 162</div>
              )}
            </div>
            <div className="p-10 md:p-16 flex-1 bg-zinc-900 relative">
              <button onClick={() => setSelectedPlayer(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={28} /></button>
              <div className="flex gap-3 mb-6">
                <span className="px-4 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-500 text-[10px] font-black uppercase">{selectedPlayer.ageGroup}</span>
                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-zinc-400 text-[10px] font-black uppercase">{selectedPlayer.categoryLabel}</span>
              </div>
              <h2 className="text-5xl font-black uppercase mb-8 italic">{selectedPlayer.name}</h2>
              <div className="bg-white/5 p-8 rounded-[2.5rem] mb-8">
                <p className="text-zinc-400 text-lg italic">"{selectedPlayer.bio}"</p>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5">
                  <Zap className="text-blue-500 mb-2" size={20} /><p className="text-[9px] text-zinc-600 uppercase font-black">Rank</p><p className="text-2xl font-black">#{processedPlayers.findIndex(p => p.id === selectedPlayer.id) + 1}</p>
                </div>
                <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5">
                  <Trophy className="text-yellow-500 mb-2" size={20} /><p className="text-[9px] text-zinc-600 uppercase font-black">Poin</p><p className="text-2xl font-black">{selectedPlayer.totalPoints.toLocaleString()} PTS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic mb-2 uppercase tracking-tighter">PROFIL <span className="text-blue-600">PEMAIN</span></h2>
            <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase">Data Atlet Terupdate & Realtime</p>
          </div>
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input type="text" placeholder="Cari atlet..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 text-xs text-white" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Tab Filter */}
        <div className="flex bg-zinc-900/50 p-2 rounded-[2.5rem] border border-zinc-800 mb-16 w-fit">
          {['Semua', 'Senior', 'Muda'].map((label) => (
            <button key={label} onClick={() => setCurrentAgeGroup(label)} className={`px-10 py-4 rounded-[2rem] text-[12px] font-black transition-all ${currentAgeGroup === label ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
              {label.toUpperCase()}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Memuat Data Atlet...</p>
          </div>
        ) : (
          <div className="relative group/slider">
            {filteredPlayers.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                onSwiper={(swiper) => (swiperInstanceRef.current = swiper)}
                spaceBetween={25}
                slidesPerView={1.2}
                navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 4 } }}
                className="!pb-20"
              >
                {filteredPlayers.map((player) => (
                  <SwiperSlide key={player.id}>
                    <div onClick={() => setSelectedPlayer(player)} className="group cursor-pointer relative aspect-[3/4.5] rounded-[3.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 transition-all duration-500 hover:-translate-y-2">
                      {player.img ? (
                        <img src={player.img} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={player.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600"><User size={60} /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute top-8 left-8 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black border-4 border-zinc-900">
                        {processedPlayers.findIndex(p => p.id === player.id) + 1}
                      </div>
                      <div className="absolute bottom-10 left-10 right-10">
                        <p className="text-zinc-400 text-[10px] font-black uppercase mb-1">{player.ageGroup}</p>
                        <h3 className="text-2xl font-black uppercase mb-4 italic group-hover:text-blue-500 transition-colors line-clamp-1">{player.name}</h3>
                        <div className="flex justify-between text-[10px] font-black border-t border-white/10 pt-4">
                          <span className="text-white/40">{player.categoryLabel}</span>
                          <span>{player.totalPoints.toLocaleString()} PTS</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="py-20 text-center text-zinc-600 font-black uppercase italic">Data Tidak Ditemukan</div>
            )}
            <button ref={prevRef} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-blue-600"><ChevronLeft /></button>
            <button ref={nextRef} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-blue-600"><ChevronRight /></button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Players;
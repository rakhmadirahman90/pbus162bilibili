import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Observer } from 'swiper/modules'; // Tambahkan Observer
import { supabase } from "../supabase";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Search, Trophy, ChevronLeft, ChevronRight, Award, Zap, Info, Loader2, User 
} from 'lucide-react';

// --- DATA SOURCE FALLBACK ---
const EVENT_LOG = [{ id: 1, winners: ["Agustilaar", "Herman", "H. Wawan", "Bustan", "Dr. Khaliq", "Momota", "Prof. Fikri", "Marzuki", "Arsan", "H. Hasym", "H. Anwar", "Yakob"] }];

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
  const swiperInstance = useRef<any>(null);

  // 1. Fetching Data
  const fetchPlayersFromDB = async () => {
    try {
      const { data: rankingsData, error: rError } = await supabase
        .from('rankings')
        .select('*')
        .order('total_points', { ascending: false });

      const { data: winnersData } = await supabase
        .from('hasil_turnamen')
        .select('nama_atlet');

      if (rError) throw rError;
      setDbPlayers(rankingsData || []);
      if (winnersData) setDbWinners(winnersData.map(w => w.nama_atlet));
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayersFromDB();
  }, []);

  // 2. Logika Proses Data
  const processedPlayers = useMemo(() => {
    const ageMapping: Record<string, string> = {
      'SENIOR': 'Senior', 'VETERAN (35+ / 40+)': 'Senior', 'DEWASA': 'Senior',
      'DEWASA / UMUM': 'Senior', 'TARUNA (U-19)': 'Muda', 'REMAJA (U-17)': 'Muda', 'PEMULA (U-15)': 'Muda',
    };
    const allWinners = [...new Set([...EVENT_LOG[0].winners, ...dbWinners])];

    return dbPlayers.map((p) => {
      const rawCategory = (p.category || "").toUpperCase();
      let mappedAge = (rawCategory.includes('MUDA') || rawCategory.includes('U-')) ? 'Muda' : (ageMapping[rawCategory] || 'Senior');
      return {
        ...p, name: p.player_name, img: p.photo_url || p.foto_url,
        bio: p.bio || `Atlet PB US 162 kategori ${p.category}.`,
        totalPoints: Number(p.total_points) || 0,
        isWinner: allWinners.includes(p.player_name),
        ageGroup: mappedAge, categoryLabel: p.seed || 'UNSEEDED',
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [dbPlayers, dbWinners]);

  const filteredPlayers = useMemo(() => {
    return processedPlayers.filter(p => {
      const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAge = currentAgeGroup === "Semua" || p.ageGroup === currentAgeGroup;
      return matchesSearch && matchesAge;
    });
  }, [searchTerm, currentAgeGroup, processedPlayers]);

  // --- PERBAIKAN KRUSIAL: FORCE UPDATE ---
  useEffect(() => {
    if (swiperInstance.current && filteredPlayers.length > 0) {
      // Kita panggil update beberapa kali untuk memastikan render DOM selesai
      const timer = setTimeout(() => {
        swiperInstance.current.update();
        swiperInstance.current.slideTo(0, 0); // Reset ke slide pertama
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredPlayers.length, isLoading]);

  return (
    <section id="atlet" className="py-24 bg-[#050505] text-white min-h-screen relative overflow-hidden font-sans">
      {/* Modal Detail (Kode tetap sama) */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
             {/* Konten Modal */}
             <div className="w-full md:w-1/2 bg-[#080808] flex items-center justify-center h-[450px] md:h-auto relative">
                {selectedPlayer.img ? <img src={selectedPlayer.img} className="w-full h-full object-cover object-[center_20%]" /> : <User size={120} className="text-zinc-700" />}
             </div>
             <div className="p-10 md:p-16 flex-1 bg-zinc-900 relative">
                <button onClick={() => setSelectedPlayer(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X size={28} /></button>
                <h2 className="text-5xl font-black uppercase mb-8 italic">{selectedPlayer.name}</h2>
                <p className="text-zinc-400 text-lg italic mb-8">"{selectedPlayer.bio}"</p>
                <div className="grid grid-cols-2 gap-5">
                   <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5"><p className="text-[9px] text-zinc-600 uppercase font-black">Rank</p><p className="text-2xl font-black">#{processedPlayers.findIndex(p => p.id === selectedPlayer.id) + 1}</p></div>
                   <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5"><p className="text-[9px] text-zinc-600 uppercase font-black">Points</p><p className="text-2xl font-black">{selectedPlayer.totalPoints.toLocaleString()} PTS</p></div>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic mb-2 uppercase tracking-tighter">PROFIL <span className="text-blue-600">PEMAIN</span></h2>
            <p className="text-zinc-500 text-xs font-bold uppercase">Data Atlet Terupdate & Realtime</p>
          </div>
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input type="text" placeholder="Cari atlet..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-5 text-xs font-bold" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-zinc-900/50 p-2 rounded-[2.5rem] border border-zinc-800 backdrop-blur-xl w-fit mb-16 overflow-x-auto">
          {['Semua', 'Senior', 'Muda'].map((label) => (
            <button key={label} onClick={() => setCurrentAgeGroup(label)} className={`px-10 py-4 rounded-[2rem] text-[12px] font-black transition-all ${currentAgeGroup === label ? 'bg-blue-600 text-white shadow-xl' : 'text-zinc-500'}`}>
              {label.toUpperCase()} <span className="ml-2 opacity-40">{label === 'Semua' ? dbPlayers.length : processedPlayers.filter(p => p.ageGroup === label).length}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center py-20 gap-4 text-zinc-500"><Loader2 className="animate-spin" size={40} /><p className="font-black uppercase text-xs">Menghubungkan Database...</p></div>
        ) : (
          <div className="relative group/slider">
            {filteredPlayers.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination, Autoplay, Observer]} // Tambahkan Observer
                onSwiper={(swiper) => { swiperInstance.current = swiper; }}
                key={`swiper-v3-${currentAgeGroup}-${filteredPlayers.length}`} // Key unik sangat penting
                observer={true} // Memantau perubahan DOM secara internal
                observeParents={true}
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
                    <div onClick={() => setSelectedPlayer(player)} className="group cursor-pointer relative aspect-[3/4.5] rounded-[3.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 transition-all duration-700 hover:-translate-y-4">
                      {player.img ? <img src={player.img} className="w-full h-full object-cover object-[center_25%]" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={60} className="text-zinc-700" /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute top-8 left-8 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg border-4 border-zinc-900">
                        {processedPlayers.findIndex(p => p.id === player.id) + 1}
                      </div>
                      <div className="absolute bottom-10 left-10 right-10">
                        <p className="text-zinc-400 text-[10px] font-black uppercase mb-1">{player.ageGroup}</p>
                        <h3 className="text-2xl font-black uppercase italic mb-4 line-clamp-1">{player.name}</h3>
                        <div className="flex justify-between items-center border-t border-white/10 pt-4 text-[10px] font-black uppercase opacity-60">
                          <span>{player.categoryLabel}</span>
                          <span>{player.totalPoints.toLocaleString()} PTS</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="py-20 text-center text-zinc-600 font-black uppercase tracking-widest">Data Tidak Ditemukan</div>
            )}
            
            <button ref={prevRef} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 transition-all shadow-2xl"><ChevronLeft size={24} /></button>
            <button ref={nextRef} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 transition-all shadow-2xl"><ChevronRight size={24} /></button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Players;
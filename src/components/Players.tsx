import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { supabase } from "../supabase";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Search, Trophy, ChevronLeft, ChevronRight, Award, Zap, Info, Loader2 
} from 'lucide-react';

// --- DATA PEMENANG UNTUK BONUS +300 SESUAI TABEL POIN ---
const EVENT_LOG = [
  { 
    id: 1, 
    winners: [
      "Agustilaar", "Herman", "H. Wawan", "Bustan", "Dr. Khaliq", 
      "Momota", "Prof. Fikri", "Marzuki", "Arsan", "H. Hasym", 
      "H. Anwar", "Yakob"
    ] 
  },
];

const Players: React.FC = () => {
  const [currentAgeGroup, setCurrentAgeGroup] = useState('Semua'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [dbPlayers, setDbPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const fetchPlayersFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select('*');
      if (error) throw error;
      setDbPlayers(data || []);
    } catch (err) {
      console.error("Gagal sinkronisasi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayersFromDB();
    const channel = supabase.channel('pendaftaran_realtime')
      .on('postgres_changes', { event: '*', table: 'pendaftaran', schema: 'public' }, () => fetchPlayersFromDB())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // LOGIKA PERBAIKAN POIN AGAR SINKRON 10.300 PTS
  const processedPlayers = useMemo(() => {
    const config: Record<string, any> = {
      'SENIOR': { base: 10000, label: 'Seed A', age: 'Senior' },
      'VETERAN (35+ / 40+)': { base: 10000, label: 'Seed A', age: 'Senior' },
      'DEWASA': { base: 8500, label: 'Seed B+', age: 'Senior' },
      'TARUNA (U-19)': { base: 6500, label: 'Seed C', age: 'Muda' },
    };

    return dbPlayers.map((p) => {
      const playerCat = p.kategori ? p.kategori.toUpperCase() : '';
      const conf = config[playerCat] || { base: 5000, label: 'UNSEEDED', age: 'Senior' };
      
      // Hitung Bonus Win Turnamen Internal (+300)
      const isWinner = EVENT_LOG[0].winners.includes(p.nama);
      const bonusPoin = isWinner ? 300 : 0;
      
      // Hasil: 10.000 + 300 = 10.300
      const totalPoints = conf.base + bonusPoin;
      
      return {
        ...p,
        name: p.nama,
        img: p.foto_url,
        bio: p.pengalaman && p.pengalaman !== "ok" ? p.pengalaman : `Atlet PB US 162.`,
        totalPoints,
        isWinner,
        ageGroup: conf.age,
        categoryLabel: conf.label,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [dbPlayers]);

  const filteredPlayers = useMemo(() => {
    return processedPlayers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
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
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
            <div className="w-full md:w-1/2 bg-[#080808] flex items-center justify-center h-[400px] md:h-auto overflow-hidden">
              <img src={selectedPlayer.img} className="w-full h-full object-cover p-6" alt={selectedPlayer.name} />
            </div>
            <div className="p-10 md:p-16 flex-1 bg-zinc-900 relative">
              <button onClick={() => setSelectedPlayer(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X size={28} /></button>
              <h2 className="text-5xl md:text-6xl font-black uppercase mb-4 leading-[0.9]">{selectedPlayer.name}</h2>
              <div className="flex gap-3 mb-8">
                <span className="px-4 py-1.5 bg-blue-600/20 border border-blue-600/30 rounded-full text-blue-500 text-[10px] font-black uppercase tracking-widest">{selectedPlayer.ageGroup}</span>
                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-zinc-400 text-[10px] font-black uppercase tracking-widest">{selectedPlayer.categoryLabel}</span>
              </div>

              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 mb-8">
                <p className="text-zinc-500 text-xs font-black uppercase mb-3 flex items-center gap-2"><Info size={14}/> Deskripsi Atlet</p>
                <p className="text-zinc-300 text-lg italic italic leading-relaxed">"{selectedPlayer.bio}"</p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5 text-center">
                    <p className="text-[9px] text-zinc-600 uppercase font-black">Global Rank</p>
                    <p className="text-2xl font-black text-blue-500">#{processedPlayers.findIndex(p => p.id === selectedPlayer.id) + 1}</p>
                </div>
                <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5 text-center">
                    <p className="text-[9px] text-zinc-600 uppercase font-black">Total Poin</p>
                    <p className="text-2xl font-black text-yellow-500">{selectedPlayer.totalPoints.toLocaleString()} PTS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            PROFIL <span className="text-blue-600">PEMAIN</span>
          </h2>
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              placeholder="Cari atlet..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-5 focus:outline-none focus:border-blue-600 text-xs font-bold transition-all shadow-xl"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          <div className="relative group/slider">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              key={`${currentAgeGroup}-${filteredPlayers.length}`}
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
                  <div onClick={() => setSelectedPlayer(player)} className="group cursor-pointer relative aspect-[3/4.5] rounded-[3.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600 transition-all duration-700 hover:-translate-y-4 shadow-2xl">
                    <img src={player.img} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" alt={player.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    <div className="absolute top-8 left-8 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg border-4 border-zinc-900 shadow-xl">
                      {processedPlayers.findIndex(p => p.id === player.id) + 1}
                    </div>

                    {player.isWinner && (
                      <div className="absolute top-8 right-8 bg-yellow-500 p-2.5 rounded-xl text-black shadow-lg animate-pulse">
                        <Trophy size={18} />
                      </div>
                    )}

                    <div className="absolute bottom-10 left-10 right-10">
                      <p className="text-zinc-500 text-[10px] font-black uppercase mb-1">{player.ageGroup}</p>
                      <h3 className="text-3xl font-black uppercase mb-4 line-clamp-1 group-hover:text-blue-500 transition-colors">{player.name}</h3>
                      <div className="flex items-center justify-between text-white/30 text-[10px] font-black uppercase border-t border-white/10 pt-5">
                        <span>{player.categoryLabel}</span>
                        <span className="text-white font-mono">{player.totalPoints.toLocaleString()} PTS</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            <button ref={prevRef} className="absolute left-[-25px] top-1/2 -translate-y-1/2 z-40 w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 text-white transition-all shadow-2xl"><ChevronLeft size={32} /></button>
            <button ref={nextRef} className="absolute right-[-25px] top-1/2 -translate-y-1/2 z-40 w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 text-white transition-all shadow-2xl"><ChevronRight size={32} /></button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Players;
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

// --- DATA SOURCE FALLBACK ---
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

// Menambahkan Interface Props untuk Sinkronisasi dengan App.tsx
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

  // SINKRONISASI: Update state jika initialFilter dari props berubah (via Navbar)
  useEffect(() => {
    if (initialFilter) {
      setCurrentAgeGroup(initialFilter);
    }
  }, [initialFilter]);

  const fetchPlayersFromDB = async () => {
    try {
      const { data: players, error: pError } = await supabase
        .from('pendaftaran')
        .select(`
          *,
          atlet_stats (
            points,
            rank,
            seed,
            bio
          ),
          pertandingan (
            kategori_kegiatan,
            hasil
          )
        `);

      const { data: winnersData } = await supabase
        .from('hasil_turnamen')
        .select('nama_atlet');

      if (pError) throw pError;

      setDbPlayers(players || []);
      
      if (winnersData) {
        setDbWinners(winnersData.map(w => w.nama_atlet));
      }
    } catch (err) {
      console.error("Gagal mengambil data atlet:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayersFromDB();

    const channel = supabase
      .channel('db_realtime_updates')
      .on('postgres_changes', { event: '*', table: 'pendaftaran', schema: 'public' }, () => fetchPlayersFromDB())
      .on('postgres_changes', { event: '*', table: 'atlet_stats', schema: 'public' }, () => fetchPlayersFromDB())
      .on('postgres_changes', { event: '*', table: 'pertandingan', schema: 'public' }, () => fetchPlayersFromDB())
      .on('postgres_changes', { event: '*', table: 'hasil_turnamen', schema: 'public' }, () => fetchPlayersFromDB())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Listener untuk event kustom (opsional, sebagai backup dari initialFilter)
  useEffect(() => {
    const handleFilterAtlet = (event: any) => {
      const category = event.detail;
      if (category) setCurrentAgeGroup(category);
    };
    window.addEventListener('filterAtlet', handleFilterAtlet);
    return () => window.removeEventListener('filterAtlet', handleFilterAtlet);
  }, []);

  const processedPlayers = useMemo(() => {
    const config: Record<string, any> = {
      'SENIOR': { base: 10000, label: 'Seed A', age: 'Senior' },
      'VETERAN (35+ / 40+)': { base: 10000, label: 'Seed A', age: 'Senior' },
      'DEWASA': { base: 8500, label: 'Seed B+', age: 'Senior' },
      'DEWASA / UMUM': { base: 8500, label: 'Seed B+', age: 'Senior' },
      'TARUNA (U-19)': { base: 6500, label: 'Seed C', age: 'Muda' },
      'REMAJA (U-17)': { base: 6000, label: 'Seed C', age: 'Muda' },
      'PEMULA (U-15)': { base: 5500, label: 'Seed C', age: 'Muda' },
    };

    const defaultConfig = { base: 5000, label: 'UNSEEDED', age: 'Senior' };
    const allWinners = [...new Set([...EVENT_LOG[0].winners, ...dbWinners])];

    return dbPlayers.map((p) => {
      const stats = Array.isArray(p.atlet_stats) ? p.atlet_stats[0] : p.atlet_stats;
      const history = Array.isArray(p.pertandingan) ? p.pertandingan : [];
      
      const playerCat = p.kategori ? p.kategori.toUpperCase() : '';
      const conf = config[playerCat] || defaultConfig;

      const hasWonInternal = history.some(m => m.kategori_kegiatan === 'Internal' && m.hasil === 'Menang');
      const isWinner = hasWonInternal || allWinners.includes(p.nama);
      
      const manualPoints = Number(stats?.points) || Number(p.poin) || 0;
      const totalPoints = manualPoints > 0 ? manualPoints : (conf.base + (isWinner ? 300 : 0));
      
      return {
        ...p,
        name: p.nama,
        img: p.foto_url,
        bio: stats?.bio || (p.pengalaman && p.pengalaman.toLowerCase() !== "ok" ? p.pengalaman : `Atlet profesional PB US 162 kategori ${p.kategori}.`),
        totalPoints,
        isWinner,
        ageGroup: conf.age,
        categoryLabel: stats?.seed || conf.label,
        globalRank: stats?.rank || null,
        matchHistory: history 
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [dbPlayers, dbWinners]);

  const filteredPlayers = useMemo(() => {
    return processedPlayers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAge = currentAgeGroup === "Semua" || p.ageGroup === currentAgeGroup;
      return matchesSearch && matchesAge;
    });
  }, [searchTerm, currentAgeGroup, processedPlayers]);

  return (
    <section id="atlet" className="py-24 bg-[#050505] text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* MODAL DETAIL */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-full md:w-1/2 bg-[#080808] flex items-center justify-center overflow-hidden h-[400px] md:h-auto">
              <img src={selectedPlayer.img} className="w-full h-full object-cover p-4" alt={selectedPlayer.name} />
              {selectedPlayer.isWinner && (
                <div className="absolute bottom-10 left-10 bg-yellow-500 text-black px-6 py-3 rounded-2xl font-black text-[10px] flex items-center gap-3 shadow-2xl">
                  <Award size={18} /> WINNER - PB US 162
                </div>
              )}
            </div>
            <div className="p-10 md:p-16 flex-1 bg-zinc-900 relative">
              <button onClick={() => setSelectedPlayer(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X size={28} /></button>
              <div className="flex gap-3 mb-6">
                <span className="px-4 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-500 text-[10px] font-black tracking-widest uppercase">{selectedPlayer.ageGroup}</span>
                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-zinc-400 text-[10px] font-black tracking-widest uppercase">{selectedPlayer.categoryLabel}</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black uppercase mb-8 tracking-tighter leading-[0.9]">{selectedPlayer.name}</h2>
              
              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 mb-8">
                <div className="flex items-center gap-3 mb-4 text-blue-500">
                    <Info size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">Profil Singkat</span>
                </div>
                <p className="text-zinc-400 text-lg leading-relaxed italic">"{selectedPlayer.bio}"</p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5">
                    <Zap className="text-blue-500 mb-2" size={20} />
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Global Rank</p>
                    <p className="text-2xl font-black">#{selectedPlayer.globalRank || processedPlayers.findIndex(p => p.id === selectedPlayer.id) + 1}</p>
                </div>
                <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5">
                    <Trophy className="text-yellow-500 mb-2" size={20} />
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Poin Klasemen</p>
                    <p className="text-2xl font-black">{selectedPlayer.totalPoints.toLocaleString()} PTS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic mb-2 uppercase tracking-tighter">
              PROFIL <span className="text-blue-600">PEMAIN</span>
            </h2>
            <p className="text-zinc-500 text-xs md:text-sm font-bold tracking-[0.2em] uppercase">Data Atlet Terupdate & Realtime</p>
          </div>
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              placeholder="Cari atlet..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-5 focus:outline-none focus:border-blue-600 text-xs font-bold transition-all placeholder:text-zinc-700 shadow-xl"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-16">
            <div className="flex bg-zinc-900/50 p-2 rounded-[2.5rem] border border-zinc-800 backdrop-blur-xl overflow-x-auto no-scrollbar max-w-full">
              {[
                { label: 'Semua', count: dbPlayers.length },
                { label: 'Senior', count: processedPlayers.filter(p => p.ageGroup === 'Senior').length },
                { label: 'Muda', count: processedPlayers.filter(p => p.ageGroup === 'Muda').length }
              ].map((tab) => (
                <button 
                  key={tab.label}
                  onClick={() => setCurrentAgeGroup(tab.label)} 
                  className={`px-10 py-4 rounded-[2rem] text-[12px] font-black transition-all flex items-center gap-3 whitespace-nowrap ${currentAgeGroup === tab.label ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'text-zinc-500 hover:text-white'}`}
                >
                  {tab.label.toUpperCase()} 
                  <span className="opacity-40 text-[10px]">{tab.count}</span>
                </button>
              ))}
            </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-500">
            <Loader2 className="animate-spin" size={40} />
            <p className="font-black uppercase tracking-widest text-xs">Menghubungkan Database...</p>
          </div>
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
                  <div 
                    onClick={() => setSelectedPlayer(player)} 
                    className="group cursor-pointer relative aspect-[3/4.5] rounded-[3.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 transition-all duration-700 hover:-translate-y-4 shadow-2xl"
                  >
                    <img src={player.img} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt={player.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                    
                    <div className="absolute top-8 left-8 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg border-4 border-zinc-900 shadow-xl group-hover:scale-110 transition-transform">
                      {player.globalRank || processedPlayers.findIndex(p => p.id === player.id) + 1}
                    </div>

                    {player.isWinner && (
                      <div className="absolute top-8 right-8 bg-yellow-500 p-2.5 rounded-xl text-black animate-bounce shadow-lg">
                        <Trophy size={18} />
                      </div>
                    )}

                    <div className="absolute bottom-10 left-10 right-10">
                      <div className="flex items-center gap-2 mb-2">
                           <span className={`w-2 h-2 rounded-full ${player.ageGroup === 'Senior' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                           <p className="text-zinc-400 text-[10px] font-black tracking-widest uppercase">{player.ageGroup}</p>
                      </div>
                      <h3 className="text-3xl font-black uppercase leading-none tracking-tighter group-hover:text-blue-500 transition-colors mb-4 line-clamp-1">{player.name}</h3>
                      <div className="flex items-center justify-between text-white/30 text-[10px] font-black uppercase tracking-widest border-t border-white/10 pt-5">
                        <span>{player.categoryLabel}</span>
                        <span className="text-white font-mono">{player.totalPoints.toLocaleString()} PTS</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            <button ref={prevRef} className="absolute left-[-25px] top-1/2 -translate-y-1/2 z-40 w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 text-white transition-all active:scale-90 shadow-2xl disabled:hidden"><ChevronLeft size={32} /></button>
            <button ref={nextRef} className="absolute right-[-25px] top-1/2 -translate-y-1/2 z-40 w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 text-white transition-all active:scale-90 shadow-2xl disabled:hidden"><ChevronRight size={32} /></button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Players;
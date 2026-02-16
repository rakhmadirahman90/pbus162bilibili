import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { supabase } from "../supabase";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Search, Trophy, ChevronLeft, ChevronRight, Award, Zap, Loader2, User, 
  Star, ShieldCheck, TrendingUp, LayoutGrid
} from 'lucide-react';

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
      setIsLoading(true);
      const { data, error } = await supabase
        .from('atlet_stats')
        .select(`*, pendaftaran ( nama, foto_url, kategori )`)
        .order('points', { ascending: false });

      if (error) throw error;
      setDbPlayers(data || []);
    } catch (err) {
      console.error("Database Error:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 800); // Sedikit delay agar transisi mulus
    }
  };

  useEffect(() => {
    fetchPlayersFromDB();
    const channel = supabase.channel('atlet_changes')
      .on('postgres_changes', { event: '*', table: 'atlet_stats', schema: 'public' }, () => fetchPlayersFromDB())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const processedPlayers = useMemo(() => {
    return dbPlayers.map((p) => {
      const info = p.pendaftaran || {};
      const categoryRaw = (info.kategori || p.seed || "SENIOR").toUpperCase();
      let ageGroup = 'Senior';
      if (categoryRaw.includes('MUDA')) ageGroup = 'Muda';

      return {
        ...p,
        name: info.nama || "Atlet PB US",
        img: info.foto_url || null,
        ageGroup,
        displayPoints: p.points || 0,
        displaySeed: p.seed || "UNSEEDED",
        bio: p.bio || "Dedikasi tinggi untuk PB US 162 Bilibili."
      };
    });
  }, [dbPlayers]);

  const counts = useMemo(() => ({
    all: processedPlayers.length,
    senior: processedPlayers.filter(p => p.ageGroup === 'Senior').length,
    muda: processedPlayers.filter(p => p.ageGroup === 'Muda').length
  }), [processedPlayers]);

  const filteredPlayers = useMemo(() => {
    return processedPlayers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAge = currentAgeGroup === "Semua" || p.ageGroup === currentAgeGroup;
      return matchesSearch && matchesAge;
    });
  }, [searchTerm, currentAgeGroup, processedPlayers]);

  return (
    <section id="atlet" className="py-24 bg-[#050505] text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* LUXURY AMBIENT LIGHTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />

      {/* MODAL DETAIL (Ditingkatkan) */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedPlayer(null)} />
          
          <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-[45%] relative aspect-[3/4] md:aspect-auto bg-zinc-900">
                {selectedPlayer.img ? (
                  <img src={selectedPlayer.img} className="w-full h-full object-cover object-top" alt={selectedPlayer.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User size={100} className="text-zinc-800" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                <div className="absolute top-10 left-10">
                   <div className="bg-blue-600 p-4 rounded-3xl shadow-xl border border-white/20 -rotate-6">
                      <p className="text-[10px] font-black uppercase text-blue-100">Rank</p>
                      <p className="text-4xl font-black italic">#{processedPlayers.findIndex(x => x.id === selectedPlayer.id) + 1}</p>
                   </div>
                </div>
              </div>

              <div className="flex-1 p-10 md:p-16 flex flex-col justify-center">
                <button onClick={() => setSelectedPlayer(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X size={32} /></button>
                
                <div className="flex gap-3 mb-8">
                  <span className="px-5 py-2 bg-blue-600 rounded-full text-[10px] font-black tracking-[0.2em] flex items-center gap-2"><ShieldCheck size={14}/> {selectedPlayer.ageGroup}</span>
                  <span className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-[0.2em] text-zinc-400">{selectedPlayer.displaySeed}</span>
                </div>

                <h2 className="text-5xl md:text-7xl font-black uppercase italic mb-8 tracking-tighter leading-none">
                  {selectedPlayer.name}
                </h2>

                <p className="text-zinc-400 text-xl italic mb-12 border-l-4 border-blue-600 pl-6 leading-relaxed">"{selectedPlayer.bio}"</p>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Points', val: selectedPlayer.displayPoints.toLocaleString(), icon: Trophy, color: 'text-yellow-500' },
                    { label: 'Accuracy', val: '92%', icon: Target, color: 'text-blue-500' },
                    { label: 'Status', val: 'Active', icon: Zap, color: 'text-green-500' }
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                      <s.icon className={`${s.color} mb-2`} size={20} />
                      <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">{s.label}</p>
                      <p className="text-xl font-black">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 animate-in slide-in-from-top duration-700">
          <div>
            <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">LEADERBOARD <span className="text-blue-600 underline decoration-blue-600/30">ELITE</span></h2>
            <p className="text-zinc-500 text-sm font-medium tracking-[0.3em] uppercase flex items-center gap-2">
               <LayoutGrid size={16} className="text-blue-600" /> Profil Atlet & Statistik Performa
            </p>
          </div>
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Cari Legenda..." 
              className="w-full md:w-[350px] bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-14 pr-6 text-sm focus:border-blue-600 outline-none transition-all backdrop-blur-md focus:ring-4 focus:ring-blue-600/10"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* TAB FILTER LUX */}
        <div className="flex bg-zinc-900/40 p-2 rounded-[2.5rem] border border-zinc-800 w-fit mb-20 backdrop-blur-md animate-in fade-in slide-in-from-left duration-1000">
          {[
            { id: 'Semua', label: 'ALL PROS', count: counts.all },
            { id: 'Senior', label: 'SENIOR', count: counts.senior },
            { id: 'Muda', label: 'MUDA', count: counts.muda }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setCurrentAgeGroup(tab.id)}
              className={`px-10 py-4 rounded-full text-[11px] font-black transition-all flex items-center gap-4 ${
                currentAgeGroup === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] min-w-[24px] px-2 py-0.5 rounded-lg ${
                currentAgeGroup === tab.id ? 'bg-white/20' : 'bg-zinc-800'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center gap-8 animate-pulse">
            <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600">Syncing Athlete Database</p>
          </div>
        ) : (
          <div className="relative group/slider">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1.2}
              navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
              breakpoints={{ 640: { slidesPerView: 2.5 }, 1024: { slidesPerView: 4 } }}
              className="!pb-24"
            >
              {filteredPlayers.map((player, index) => (
                <SwiperSlide key={player.id}>
                  {/* STAGGERED ENTRANCE ANIMATION */}
                  <div 
                    onClick={() => setSelectedPlayer(player)}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className="animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both"
                  >
                    <div className="group cursor-pointer relative aspect-[3/4.5] rounded-[3.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 transition-all duration-700 hover:-translate-y-4 shadow-2xl">
                      {player.img ? (
                        <img src={player.img} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt={player.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-700"><User size={80} /></div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-100" />
                      
                      {/* GLASS OVERLAY CARD */}
                      <div className="absolute bottom-6 left-6 right-6 p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-md border border-white/10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-3">
                           <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_#2563eb]" />
                           <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">{player.ageGroup}</p>
                        </div>
                        <h3 className="text-2xl font-black uppercase italic mb-4 leading-none group-hover:text-blue-500 transition-colors line-clamp-1">
                          {player.name}
                        </h3>
                        <div className="flex justify-between items-center text-[11px] font-black opacity-60">
                          <span className="tracking-tighter uppercase">{player.displaySeed}</span>
                          <span className="text-white">{player.displayPoints.toLocaleString()} PTS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* CUSTOM NAV BUTTONS LUX */}
            <button ref={prevRef} className="absolute -left-10 top-1/2 -translate-y-1/2 z-30 w-20 h-20 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-blue-600 hover:scale-110 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <ChevronLeft size={32} />
            </button>
            <button ref={nextRef} className="absolute -right-10 top-1/2 -translate-y-1/2 z-30 w-20 h-20 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-blue-600 hover:scale-110 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <ChevronRight size={32} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Players;
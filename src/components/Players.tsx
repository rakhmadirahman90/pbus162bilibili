import React, { useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Target, Search, Trophy, ArrowRight, ChevronLeft, ChevronRight, Users, Star, Award, Zap, Info 
} from 'lucide-react';

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

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const processedPlayers = useMemo(() => {
    const config: Record<string, any> = {
      'A': { base: 10000, bonus: 300, label: 'Seed A', age: 'Senior' },
      'B+': { base: 8500, bonus: 500, label: 'Seed B+', age: 'Senior' },
      'B-': { base: 7000, bonus: 300, label: 'Seed B-', age: 'Senior' },
      'C': { base: 5500, bonus: 500, label: 'Seed C', age: 'Muda' },
    };

    const rawData = [
      { name: "Agustilaar", group: "A", img: "https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg", bio: "Pemain kunci dengan pertahanan solid dan visi bermain yang tajam." },
      { name: "Herman", group: "A", img: "https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg", bio: "Spesialis smash tajam dengan akurasi penempatan bola yang tinggi." },
      { name: "Darwis (TNI)", group: "A", img: "https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg", bio: "Kedisiplinan tinggi dan stamina yang luar biasa di lapangan." },
      { name: "Salman", group: "A", img: "https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg", bio: "Ahli dalam permainan net yang tipis dan mengecoh lawan." },
      { name: "Lutfi", group: "A", img: "https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg", bio: "Pemain lincah dengan kemampuan backhand yang mematikan." },
      { name: "Udin", group: "A", img: "https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg", bio: "Andalan tim dalam serangan cepat dan drive horizontal." },
      { name: "Aldy Sandra", group: "A", img: "https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg", bio: "Kombinasi kekuatan dan teknik yang sangat seimbang." },
      { name: "Mustakim", group: "A", img: "https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg", bio: "Memiliki kontrol permainan yang tenang di poin-poin kritis." },
      { name: "Rifai", group: "A", img: "https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg", bio: "Strategist lapangan yang handal membaca pergerakan lawan." },
      { name: "Acos", group: "A", img: "https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg", bio: "Power player dengan serangan bertubi-tubi yang sulit dibendung." },
      { name: "H. Wawan", group: "B+", img: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", bio: "Pengalaman tinggi dalam mengatur ritme permainan ganda." },
      { name: "Bustan", group: "B+", img: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", bio: "Pemain yang ulet dan pantang menyerah dalam mengejar bola." },
      { name: "Dr. Khaliq", group: "B+", img: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", bio: "Akurasi penempatan bola yang presisi dan cerdas." },
      { name: "Momota", group: "B+", img: "https://images.pexels.com/photos/4307869/pexels-photo-4307869.jpeg", bio: "Gaya bermain teknis yang terinspirasi dari legenda bulutangkis." },
      { name: "H. Ismail", group: "B+", img: "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg", bio: "Pemain senior dengan teknik drop shot yang sangat halus." },
      { name: "Saleh", group: "B+", img: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg", bio: "Dikenal dengan pertahanan 'tembok' yang sulit ditembus." },
      { name: "H. Zaidi", group: "B+", img: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg", bio: "Memiliki flick serve yang sering mengecoh lawan di depan net." },
      { name: "Zainuddin", group: "B+", img: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg", bio: "Agresif dalam melakukan serangan-serangan cepat depan net." },
      { name: "Lumpue", group: "B+", img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg", bio: "Pemain enerjik yang mengandalkan kecepatan kaki (footwork)." },
      { name: "Madhy", group: "B+", img: "https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg", bio: "Spesialis bola-bola atas dengan jangkauan yang luas." },
      { name: "Arsan", group: "C", img: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", bio: "Rising star di kategori C dengan perkembangan teknik yang sangat pesat." },
      { name: "Hidayatullah", group: "C", img: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg", bio: "Pemain muda paling menonjol saat ini dengan determinasi tinggi." },
    ];

    return rawData.map((p) => {
      const conf = config[p.group];
      const isWinner = EVENT_LOG[0].winners.includes(p.name);
      const rankInGroup = rawData.filter(x => x.group === p.group).findIndex(y => y.name === p.name);
      const totalPoints = (conf.base - (rankInGroup * 50)) + (isWinner ? conf.bonus : 0);
      return { ...p, totalPoints, isWinner, ageGroup: conf.age, categoryLabel: conf.label };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, []);

  const filteredPlayers = useMemo(() => {
    return processedPlayers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAge = currentAgeGroup === "Semua" || p.ageGroup === currentAgeGroup;
      return matchesSearch && matchesAge;
    });
  }, [searchTerm, currentAgeGroup, processedPlayers]);

  return (
    <section id="atlet" className="py-24 bg-[#050505] text-white min-h-screen relative overflow-hidden">
      
      {/* --- MODAL DETAIL PEMAIN --- */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-full md:w-[45%] bg-[#080808] flex items-center justify-center h-[350px] md:h-auto overflow-hidden">
              <img src={selectedPlayer.img} className="w-full h-full object-cover" alt={selectedPlayer.name} />
            </div>
            <div className="p-8 md:p-12 flex-1 relative flex flex-col justify-center">
              <button onClick={() => setSelectedPlayer(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
              
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-600/10 border border-blue-600/20 rounded-lg text-blue-500 text-[9px] font-bold tracking-widest uppercase">{selectedPlayer.ageGroup}</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-zinc-400 text-[9px] font-bold tracking-widest uppercase">{selectedPlayer.categoryLabel}</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-extrabold uppercase mb-6 tracking-tight leading-tight">{selectedPlayer.name}</h2>
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-8">
                <div className="flex items-center gap-2 mb-2 text-blue-500">
                  <Info size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Bio Singkat</span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed italic">"{selectedPlayer.bio}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 p-5 rounded-2xl border border-white/5">
                  <Zap className="text-blue-500 mb-1" size={18} />
                  <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">Rank</p>
                  <p className="text-xl font-bold">#{processedPlayers.findIndex(p => p.name === selectedPlayer.name) + 1}</p>
                </div>
                <div className="bg-zinc-800/50 p-5 rounded-2xl border border-white/5">
                  <Trophy className="text-yellow-500 mb-1" size={18} />
                  <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">Poin</p>
                  <p className="text-xl font-bold">{selectedPlayer.totalPoints.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <span className="text-blue-600 font-bold text-[10px] tracking-[0.3em] uppercase mb-3 block">Profil Pemain Profesional</span>
            <h2 className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight uppercase">
              Kenal Lebih <br/> <span className="text-blue-600">Dekat</span>
            </h2>
          </div>
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              placeholder="Cari atlet..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-5 focus:outline-none focus:border-blue-600 text-sm transition-all shadow-xl"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- FILTER TAB --- */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-12">
          <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 backdrop-blur-md">
            {['Semua', 'Senior', 'Muda'].map((label) => (
              <button 
                key={label}
                onClick={() => setCurrentAgeGroup(label)} 
                className={`px-8 py-3 rounded-xl text-[11px] font-bold transition-all ${currentAgeGroup === label ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-8 items-center">
            <div className="text-right">
              <p className="text-2xl font-bold text-white leading-none">54</p>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Total Atlet</p>
            </div>
            <div className="w-[1px] h-8 bg-zinc-800"></div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600 leading-none">12</p>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Atlet Muda</p>
            </div>
          </div>
        </div>

        {/* --- SLIDER --- */}
        <div className="relative group/slider">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.2}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 4 } }}
            className="!pb-16"
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.name}>
                <div 
                  onClick={() => setSelectedPlayer(player)} 
                  className="group cursor-pointer relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600 transition-all duration-500 shadow-xl"
                >
                  <img src={player.img} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt={player.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                  
                  <div className="absolute top-6 left-6 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-sm border-2 border-zinc-900">
                    {processedPlayers.findIndex(p => p.name === player.name) + 1}
                  </div>

                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-blue-500 text-[8px] font-bold tracking-[0.2em] uppercase mb-1">{player.ageGroup}</p>
                    <h3 className="text-xl font-bold uppercase leading-tight tracking-tight mb-3 line-clamp-1">{player.name}</h3>
                    <div className="flex items-center justify-between text-white/40 text-[9px] font-bold uppercase tracking-widest border-t border-white/10 pt-4">
                      <span>{player.categoryLabel}</span>
                      <span className="text-white">{player.totalPoints.toLocaleString()} PTS</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button ref={prevRef} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 transition-all"><ChevronLeft size={24} /></button>
          <button ref={nextRef} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 transition-all"><ChevronRight size={24} /></button>
        </div>
      </div>
    </section>
  );
};

export default Players;
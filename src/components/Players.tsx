import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Search, Trophy, ChevronLeft, ChevronRight, Award, Zap, Info 
} from 'lucide-react';

// --- DATA SOURCE & PEMENANG ---
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

interface PlayersProps {
  activeTab?: string; // Untuk menerima filter dari Navbar (Senior/Muda)
}

const Players: React.FC<PlayersProps> = ({ activeTab }) => {
  const [currentAgeGroup, setCurrentAgeGroup] = useState('Semua'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Efek untuk sinkronisasi dengan Navigasi Navbar
  useEffect(() => {
    if (activeTab) {
      setCurrentAgeGroup(activeTab);
      // Scroll otomatis ke section atlet jika tab berubah
      const section = document.getElementById('atlet');
      section?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab]);

  // 1. DATABASE LENGKAP & LOGIKA POIN
  const processedPlayers = useMemo(() => {
    const config: Record<string, any> = {
      'A': { base: 10000, bonus: 300, label: 'Seed A', age: 'Senior' },
      'B+': { base: 8500, bonus: 500, label: 'Seed B+', age: 'Senior' },
      'B-': { base: 7000, bonus: 300, label: 'Seed B-', age: 'Senior' },
      'C': { base: 5500, bonus: 500, label: 'Seed C', age: 'Muda' },
    };

    const rawData = [
      // SEEDED A - SENIOR
      { name: "Agustilaar", group: "A", img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg", bio: "Pemain kunci dengan pertahanan solid dan visi bermain yang tajam." },
      { name: "Herman", group: "A", img: "https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg", bio: "Spesialis smash tajam dengan akurasi penempatan bola yang tinggi." },
      { name: "Darwis (TNI)", group: "A", img: "https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg", bio: "Kedisiplinan tinggi dan stamina yang luar biasa di lapangan." },
      { name: "Salman", group: "A", img: "https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg", bio: "Ahli dalam permainan net yang tipis dan mengecoh lawan." },
      { name: "Lutfi", group: "A", img: "https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg", bio: "Pemain lincah dengan kemampuan backhand yang mematikan." },
      { name: "Udin", group: "A", img: "https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg", bio: "Andalan tim dalam serangan cepat dan drive horizontal." },
      { name: "Aldy Sandra", group: "A", img: "https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg", bio: "Kombinasi kekuatan dan teknik yang sangat seimbang." },
      { name: "Mustakim", group: "A", img: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", bio: "Memiliki kontrol permainan yang tenang di poin-poin kritis." },
      { name: "Rifai", group: "A", img: "https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg", bio: "Strategist lapangan yang handal membaca pergerakan lawan." },
      { name: "Acos", group: "A", img: "https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg", bio: "Power player dengan serangan bertubi-tubi yang sulit dibendung." },

      // SEEDED B+ - SENIOR
      { name: "H. Wawan", group: "B+", img: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", bio: "Pengalaman tinggi dalam mengatur ritme permainan ganda." },
      { name: "Bustan", group: "B+", img: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg", bio: "Pemain yang ulet dan pantang menyerah dalam mengejar bola." },
      { name: "Dr. Khaliq", group: "B+", img: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg", bio: "Akurasi penempatan bola yang presisi dan cerdas." },
      { name: "Momota", group: "B+", img: "https://images.pexels.com/photos/4307869/pexels-photo-4307869.jpeg", bio: "Gaya bermain teknis yang terinspirasi dari legenda bulutangkis." },
      { name: "H. Ismail", group: "B+", img: "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg", bio: "Pemain senior dengan teknik drop shot yang sangat halus." },
      { name: "Saleh", group: "B+", img: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg", bio: "Dikenal dengan pertahanan 'tembok' yang sulit ditembus." },
      
      // SEEDED B- - SENIOR
      { name: "Prof. Fikri", group: "B-", img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg", bio: "Akademisi di lapangan yang bermain dengan logika dan strategi matang." },
      { name: "Marzuki", group: "B-", img: "https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg", bio: "Andalan dalam mengamankan area depan net." },

      // SEEDED C - MUDA
      { name: "Arsan", group: "C", img: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg", bio: "Rising star di kategori C dengan perkembangan teknik yang sangat pesat." },
      { name: "Hidayatullah", group: "C", img: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", bio: "Recent Champion! Pemain muda paling menonjol saat ini dengan determinasi tinggi." },
      { name: "H. Anwar", group: "C", img: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg", bio: "Gaya main menyerang yang menjadi ciri khas generasi muda." },
      { name: "Yakob", group: "C", img: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", bio: "Stamina prima yang menjadi momok bagi lawan di reli-reli panjang." },
    ];

    return rawData.map((p) => {
      const conf = config[p.group];
      const isWinner = EVENT_LOG[0].winners.includes(p.name);
      const rankInGroup = rawData.filter(x => x.group === p.group).findIndex(y => y.name === p.name);
      const totalPoints = (conf.base - (rankInGroup * 50)) + (isWinner ? conf.bonus : 0);
      
      return {
        ...p,
        totalPoints,
        isWinner,
        ageGroup: conf.age,
        categoryLabel: conf.label,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, []);

  // Filter Logic
  const filteredPlayers = useMemo(() => {
    return processedPlayers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAge = currentAgeGroup === "Semua" || p.ageGroup === currentAgeGroup;
      return matchesSearch && matchesAge;
    });
  }, [searchTerm, currentAgeGroup, processedPlayers]);

  return (
    <section id="atlet" className="py-24 bg-[#050505] text-white min-h-screen relative overflow-hidden font-sans">
      
      {/* --- MODAL DETAIL PEMAIN --- */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedPlayer(null)} />
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:row shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-full md:w-1/2 bg-[#080808] flex items-center justify-center overflow-hidden h-[400px] md:h-auto">
              <img src={selectedPlayer.img} className="w-full h-full object-cover p-4" alt={selectedPlayer.name} />
              {selectedPlayer.isWinner && (
                <div className="absolute bottom-6 left-6 bg-yellow-500 text-black px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-2xl">
                  <Award size={14} /> WINNER
                </div>
              )}
            </div>
            <div className="p-8 md:p-12 flex-1 bg-zinc-900 relative">
              <button onClick={() => setSelectedPlayer(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24} /></button>
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-500 text-[9px] font-black tracking-widest uppercase">{selectedPlayer.ageGroup}</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-zinc-400 text-[9px] font-black tracking-widest uppercase">{selectedPlayer.categoryLabel}</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase mb-6 tracking-tighter leading-tight">{selectedPlayer.name}</h2>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-6">
                <p className="text-zinc-400 text-sm leading-relaxed italic">"{selectedPlayer.bio}"</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/2 p-4 rounded-xl border border-white/5 text-center">
                  <Zap className="text-blue-500 mx-auto mb-1" size={18} />
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Points</p>
                  <p className="text-xl font-black">{selectedPlayer.totalPoints.toLocaleString()}</p>
                </div>
                <div className="bg-white/2 p-4 rounded-xl border border-white/5 text-center">
                  <Trophy className="text-yellow-500 mx-auto mb-1" size={18} />
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Rank</p>
                  <p className="text-xl font-black">#{processedPlayers.findIndex(p => p.name === selectedPlayer.name) + 1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic mb-2 uppercase tracking-tighter">
              PROFIL <span className="text-blue-600">PEMAIN</span>
            </h2>
            <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase">Roster Resmi PB US 162</p>
          </div>
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama atlet..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:border-blue-600 transition-all outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- FILTER TABS --- */}
        <div className="flex flex-wrap gap-4 mb-12 items-center justify-between">
            <div className="flex bg-zinc-900 p-1.5 rounded-full border border-zinc-800">
              {['Semua', 'Senior', 'Muda'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setCurrentAgeGroup(tab)} 
                  className={`px-8 py-2.5 rounded-full text-[10px] font-black transition-all ${currentAgeGroup === tab ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <p>Total: <span className="text-blue-500">{filteredPlayers.length} Atlet</span></p>
            </div>
        </div>

        {/* --- SWIPER CARDS --- */}
        <div className="relative group/slider">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.2}
            onBeforeInit={(swiper: any) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            breakpoints={{ 
              640: { slidesPerView: 2.2 }, 
              1024: { slidesPerView: 4 } 
            }}
            className="!pb-12"
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.name}>
                <div 
                  onClick={() => setSelectedPlayer(player)} 
                  className="group cursor-pointer relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 transition-all duration-500 shadow-2xl"
                >
                  <img src={player.img} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt={player.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  <div className="absolute top-6 left-6 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-sm border-2 border-zinc-900 shadow-xl">
                    #{processedPlayers.findIndex(p => p.name === player.name) + 1}
                  </div>

                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-blue-500 text-[8px] font-black tracking-widest uppercase mb-1">{player.categoryLabel}</p>
                    <h3 className="text-2xl font-black uppercase leading-none tracking-tighter mb-3 line-clamp-1">{player.name}</h3>
                    <div className="flex items-center justify-between text-[9px] font-bold text-zinc-500 border-t border-white/10 pt-4">
                      <span>{player.ageGroup}</span>
                      <span className="text-white">{player.totalPoints} PTS</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <button ref={prevRef} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 transition-all text-white"><ChevronLeft size={20} /></button>
          <button ref={nextRef} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 transition-all text-white"><ChevronRight size={20} /></button>
        </div>
      </div>
    </section>
  );
};

export default Players;
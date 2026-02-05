import React, { useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { 
  X, Target, Search, Trophy, ArrowRight, ChevronLeft, ChevronRight, Users, Star, Award, Zap, Info
} from 'lucide-react';

// --- DATA SOURCE & PEMENANG (Sync dengan Klasemen) ---
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

  // 1. DATABASE LENGKAP (54 ATLET)
  const processedPlayers = useMemo(() => {
    const config: Record<string, any> = {
      'A': { base: 10000, bonus: 300, label: 'Seed A', age: 'Senior' },
      'B+': { base: 8500, bonus: 500, label: 'Seed B+', age: 'Senior' },
      'B-': { base: 7000, bonus: 300, label: 'Seed B-', age: 'Senior' },
      'C': { base: 5500, bonus: 500, label: 'Seed C', age: 'Muda' },
    };

    const rawData = [
      // SEEDED A (10) - SENIOR
      { name: "Agustilaar", group: "A", img: "gemini_generated_image_qdfwfpqdfwfpqdfw.png", bio: "Pemain kunci dengan pertahanan solid dan visi bermain yang tajam." },
      { name: "Herman", group: "A", img: "https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg", bio: "Spesialis smash tajam dengan akurasi penempatan bola yang tinggi." },
      { name: "Darwis (TNI)", group: "A", img: "https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg", bio: "Kedisiplinan tinggi dan stamina yang luar biasa di lapangan." },
      { name: "Salman", group: "A", img: "https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg", bio: "Ahli dalam permainan net yang tipis dan mengecoh lawan." },
      { name: "Lutfi", group: "A", img: "https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg", bio: "Pemain lincah dengan kemampuan backhand yang mematikan." },
      { name: "Udin", group: "A", img: "https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg", bio: "Andalan tim dalam serangan cepat dan drive horizontal." },
      { name: "Aldy Sandra", group: "A", img: "https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg", bio: "Kombinasi kekuatan dan teknik yang sangat seimbang." },
      { name: "Mustakim", group: "A", img: "gemini_generated_image_gh30n4gh30n4gh30.png", bio: "Memiliki kontrol permainan yang tenang di poin-poin kritis." },
      { name: "Rifai", group: "A", img: "https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg", bio: "Strategist lapangan yang handal membaca pergerakan lawan." },
      { name: "Acos", group: "A", img: "https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg", bio: "Power player dengan serangan bertubi-tubi yang sulit dibendung." },

      // SEEDED B+ (22) - SENIOR
      { name: "H. Wawan", group: "B+", img: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", bio: "Pengalaman tinggi dalam mengatur ritme permainan ganda." },
      { name: "Bustan", group: "B+", img: "gemini_generated_image_abml4qabml4qabml.png", bio: "Pemain yang ulet dan pantang menyerah dalam mengejar bola." },
      { name: "Dr. Khaliq", group: "B+", img: "gemini_generated_image_l4hhwml4hhwml4hh.png", bio: "Akurasi penempatan bola yang presisi dan cerdas." },
      { name: "Momota", group: "B+", img: "https://images.pexels.com/photos/4307869/pexels-photo-4307869.jpeg", bio: "Gaya bermain teknis yang terinspirasi dari legenda bulutangkis." },
      { name: "H. Ismail", group: "B+", img: "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg", bio: "Pemain senior dengan teknik drop shot yang sangat halus." },
      { name: "Saleh", group: "B+", img: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg", bio: "Dikenal dengan pertahanan 'tembok' yang sulit ditembus." },
      { name: "H. Zaidi", group: "B+", img: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg", bio: "Memiliki flick serve yang sering mengecoh lawan di depan net." },
      { name: "Zainuddin", group: "B+", img: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg", bio: "Agresif dalam melakukan serangan-serangan cepat depan net." },
      { name: "Lumpue", group: "B+", img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg", bio: "Pemain enerjik yang mengandalkan kecepatan kaki (footwork)." },
      { name: "Madhy", group: "B+", img: "https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg", bio: "Spesialis bola-bola atas dengan jangkauan yang luas." },
      { name: "Vhio", group: "B+", img: "gemini_generated_image_3ntq3x3ntq3x3ntq.png", bio: "Pemain muda berbakat dengan potensi besar di kategori Senior." },
      { name: "Anto", group: "B+", img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg", bio: "Handal dalam melakukan drive cepat satu lawan satu." },
      { name: "Lukman", group: "B+", img: "https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg", bio: "Visi bermain ganda yang sangat baik dan suportif bagi partner." },
      { name: "Sandra", group: "B+", img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg", bio: "Memiliki kontrol emosi yang stabil di lapangan pertandingan." },
      { name: "Amri", group: "B+", img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg", bio: "Pemain yang konsisten dalam menjaga area belakang lapangan." },
      { name: "Nasri Lapas", group: "B+", img: "https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg", bio: "Andalan dalam duel-duel panjang (rally) di klasemen B+." },
      { name: "Aprijal", group: "B+", img: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg", bio: "Teknik smash menyilang menjadi senjata utamanya." },
      { name: "Arifuddin", group: "B+", img: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg", bio: "Fokus tinggi pada penempatan bola di sudut-sudut lapangan." },
      { name: "H Amier", group: "B+", img: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", bio: "Pemain senior yang sangat dihormati dengan teknik yang mumpuni." },
      { name: "Rustam", group: "B+", img: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", bio: "Dikenal dengan gaya main yang santai namun sangat efektif." },
      { name: "A. Arwan", group: "B+", img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg", bio: "Pemain dengan variasi pukulan yang sulit ditebak lawan." },
      { name: "Laganing", group: "B+", img: "https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg", bio: "Memiliki semangat juang tinggi di setiap turnamen internal." },

      // SEEDED B- (10) - SENIOR
      { name: "Prof. Fikri", group: "B-", img: "gemini_generated_image_mzatg7mzatg7mzat.png", bio: "Akademisi di lapangan yang bermain dengan logika dan strategi matang." },
      { name: "Marzuki", group: "B-", img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg", bio: "Andalan dalam mengamankan area depan net." },
      { name: "A. Mansur", group: "B-", img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg", bio: "Gaya main klasik dengan efisiensi tenaga yang luar biasa." },
      { name: "Darwis R.", group: "B-", img: "https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg", bio: "Pemain yang gigih dalam mengejar bola-bola sulit." },
      { name: "Ali", group: "B-", img: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg", bio: "Dikenal sebagai pemain yang sangat suportif bagi rekan duetnya." },
      { name: "Saldy", group: "B-", img: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg", bio: "Andalan tim dalam serangan-serangan smash lurus." },
      { name: "Mulyadi", group: "B-", img: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg", bio: "Pertahanan yang rapat menjadi ciri khas permainannya." },
      { name: "Haedir", group: "B-", img: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", bio: "Memiliki pukulan lop yang akurat hingga garis belakang." },
      { name: "H Fitra", group: "B-", img: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", bio: "Pemain dengan pergerakan yang lincah dan cepat." },
      { name: "Kurnia", group: "B-", img: "https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg", bio: "Cerdas dalam menaruh bola-bola tipis di area depan lawan." },

      // SEEDED C (12) - MUDA
      { name: "Arsan", group: "C", img: "gemini_generated_image_yz5sjxyz5sjxyz5s.png", bio: "Rising star di kategori C dengan perkembangan teknik yang sangat pesat." },
      { name: "H. Hasym", group: "C", img: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", bio: "Pemain muda dengan semangat kompetisi yang luar biasa." },
      { name: "H. Anwar", group: "C", img: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg", bio: "Gaya main menyerang yang menjadi ciri khas generasi muda PB US 162." },
      { name: "Yakob", group: "C", img: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", bio: "Stamina prima yang menjadi momok bagi lawan di reli-reli panjang." },
      { name: "Ust. Usman", group: "C", img: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg", bio: "Ketenangan batin di lapangan mencerminkan kepribadiannya." },
      { name: "Surakati", group: "C", img: "https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg", bio: "Pemain muda yang ulet dan sangat rajin melatih footwork." },
      { name: "H. Faizal", group: "C", img: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg", bio: "Muda dan berbahaya dengan smash keras yang mematikan." },
      { name: "H. Ude", group: "C", img: "https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg", bio: "Selalu tampil maksimal dan memberikan kejutan di lapangan." },
      { name: "Hidayatullah", group: "C", img: "whatsapp_image_2025-12-30_at_15.33.37.jpeg", bio: "Recent Champion! Pemain muda paling menonjol saat ini dengan determinasi tinggi." },
      { name: "H. Pangeran", group: "C", img: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg", bio: "Memiliki insting mencuri poin yang sangat baik di depan net." },
      { name: "Syarifuddin", group: "C", img: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", bio: "Pemain yang cerdas dalam memilih momen untuk menyerang balik." },
      { name: "H. Tantong", group: "C", img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg", bio: "Pemain muda penutup daftar roster dengan potensi juara yang besar." }
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
          <div className="relative bg-zinc-900 border border-white/10 w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-full md:w-1/2 bg-[#080808] flex items-center justify-center overflow-hidden h-[400px] md:h-auto">
              <img src={selectedPlayer.img} className="w-full h-full object-contain p-8 md:p-14" alt={selectedPlayer.name} />
              {selectedPlayer.isWinner && (
                <div className="absolute bottom-10 left-10 bg-yellow-500 text-black px-6 py-3 rounded-2xl font-black text-[10px] flex items-center gap-3 shadow-2xl">
                  <Award size={18} /> WINNER - INTERNAL CUP IV
                </div>
              )}
            </div>
            <div className="p-10 md:p-16 flex-1 bg-zinc-900 relative">
              <button onClick={() => setSelectedPlayer(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"><X size={28} /></button>
              <div className="flex gap-3 mb-6">
                <span className="px-4 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-500 text-[10px] font-black tracking-widest uppercase">{selectedPlayer.ageGroup}</span>
                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-zinc-400 text-[10px] font-black tracking-widest uppercase">{selectedPlayer.categoryLabel}</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase mb-8 tracking-tighter leading-[0.9]">{selectedPlayer.name}</h2>
              
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
                    <p className="text-2xl font-black">#{processedPlayers.findIndex(p => p.name === selectedPlayer.name) + 1}</p>
                </div>
                <div className="bg-white/2 p-6 rounded-[2rem] border border-white/5">
                    <Trophy className="text-yellow-500 mb-2" size={20} />
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Poin Klasemen</p>
                    <p className="text-2xl font-black">{selectedPlayer.totalPoints.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- HEADER TERBARU --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <span className="text-blue-600 font-black text-xs tracking-[0.4em] uppercase mb-4 block underline decoration-2 underline-offset-8">
              Profil Pemain
            </span>
            <h2 className="text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter uppercase">
              KENAL LEBIH <br/> <span className="text-blue-600">DEKAT</span>
            </h2>
          </div>
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
            <input 
              type="text" 
              placeholder="Cari atlet..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-5 pl-14 pr-6 focus:outline-none focus:border-blue-600 font-bold transition-all placeholder:text-zinc-700 shadow-2xl"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- STATS & FILTER TAB --- */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-16">
            <div className="flex bg-zinc-900/50 p-2 rounded-[2.5rem] border border-zinc-800 backdrop-blur-xl overflow-x-auto no-scrollbar max-w-full">
              {[
                { label: 'Semua', count: 54 },
                { label: 'Senior', count: 42 },
                { label: 'Muda', count: 12 }
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

            <div className="flex items-center gap-10">
                <div className="text-center group cursor-default">
                    <p className="text-blue-600 font-black text-4xl group-hover:scale-110 transition-transform">42</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Atlet Senior</p>
                </div>
                <div className="w-[1px] h-10 bg-zinc-800"></div>
                <div className="text-center group cursor-default">
                    <p className="text-blue-600 font-black text-4xl group-hover:scale-110 transition-transform">12</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Atlet Muda</p>
                </div>
            </div>
        </div>

        {/* --- SWIPER CARDS --- */}
        <div className="relative group/slider">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={25}
            slidesPerView={1.2}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 4 } }}
            className="!pb-20"
          >
            {filteredPlayers.map((player) => (
              <SwiperSlide key={player.name}>
                <div 
                  onClick={() => setSelectedPlayer(player)} 
                  className="group cursor-pointer relative aspect-[3/4.5] rounded-[3.5rem] overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-blue-600/50 transition-all duration-700 hover:-translate-y-4 shadow-2xl"
                >
                  <img src={player.img} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt={player.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                  
                  {/* Rank Badge */}
                  <div className="absolute top-8 left-8 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg border-4 border-zinc-900 shadow-xl group-hover:scale-110 transition-transform">
                    {processedPlayers.findIndex(p => p.name === player.name) + 1}
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
          
          <button ref={prevRef} className="absolute left-[-25px] top-1/2 -translate-y-1/2 z-40 w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 text-white transition-all active:scale-90 shadow-2xl"><ChevronLeft size={32} /></button>
          <button ref={nextRef} className="absolute right-[-25px] top-1/2 -translate-y-1/2 z-40 w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 hover:bg-blue-600 text-white transition-all active:scale-90 shadow-2xl"><ChevronRight size={32} /></button>
        </div>
      </div>
    </section>
  );
};

export default Players;
import { Trophy, Medal, ChevronDown, ChevronUp, Users, UserCheck } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

interface PlayersProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

const playersData = [
  // --- KATEGORI ATLET SENIOR ---
  {
    id: 1,
    name: 'Hidayatullah',
    category: 'Ganda Putra (Seed C)',
    ageGroup: 'Atlet Senior',
    achievements: 15,
    rank: 1,
    image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg',
  },
  {
    id: 2,
    name: 'H. Wawan',
    category: 'Ganda Putra (Seed B+)',
    ageGroup: 'Atlet Senior',
    achievements: 12,
    rank: 2,
    image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 3,
    name: 'Bustam',
    category: 'Ganda Putra (Seed B+)',
    ageGroup: 'Atlet Senior',
    achievements: 10,
    rank: 4,
    image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 4,
    name: 'Prof. Fikri',
    category: 'Ganda Putra (Seed B-)',
    ageGroup: 'Atlet Senior',
    achievements: 8,
    rank: 6,
    image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600',
  },

  // --- KATEGORI ATLET MUDA ---
  {
    id: 5,
    name: 'Andi Junior',
    category: 'Tunggal Putra',
    ageGroup: 'Atlet Muda',
    achievements: 5,
    rank: 1,
    image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 6,
    name: 'Rian Masa Depan',
    category: 'Tunggal Putra',
    ageGroup: 'Atlet Muda',
    achievements: 3,
    rank: 2,
    image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 7,
    name: 'Zaky Pratama',
    category: 'Tunggal Putra',
    ageGroup: 'Atlet Muda',
    achievements: 2,
    rank: 3,
    image: 'https://images.pexels.com/photos/11224855/pexels-photo-11224855.jpeg?auto=compress&cs=tinysrgb&w=600',
  }
];

export default function Players({ activeTab: externalTab, onTabChange }: PlayersProps) {
  const [showAll, setShowAll] = useState(false);
  const [localTab, setLocalTab] = useState('Atlet Senior');

  useEffect(() => {
    if (externalTab) {
      setLocalTab(externalTab);
      setShowAll(false);
    }
  }, [externalTab]);

  const currentTab = externalTab || localTab;

  // Filter & Urutkan berdasarkan Rank
  const filteredPlayers = useMemo(() => {
    return playersData
      .filter(player => player.ageGroup === currentTab)
      .sort((a, b) => a.rank - b.rank);
  }, [currentTab]);

  const visiblePlayers = showAll ? filteredPlayers : filteredPlayers.slice(0, 4);

  const handleTabClick = (tabName: string) => {
    if (onTabChange) {
      onTabChange(tabName);
    } else {
      setLocalTab(tabName);
    }
    setShowAll(false);
  };

  return (
    <section id="atlet" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Judul Dinamis berdasarkan Kategori */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">
            Pilar {currentTab}
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Daftar pejuang lapangan {currentTab.toLowerCase()} PB US 162 yang diurutkan berdasarkan peringkat terbaru.
          </p>
          <div className="w-24 h-1.5 bg-blue-600 mx-auto mt-6 rounded-full shadow-lg shadow-blue-200"></div>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-slate-100 p-2 rounded-[2rem] shadow-inner border border-slate-200">
            <button
              onClick={() => handleTabClick('Atlet Senior')}
              className={`flex items-center gap-3 px-10 py-4 rounded-[1.5rem] font-black text-sm transition-all duration-300 ${
                currentTab === 'Atlet Senior' 
                ? 'bg-white text-blue-600 shadow-xl' 
                : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck size={20} /> SENIOR
            </button>
            <button
              onClick={() => handleTabClick('Atlet Muda')}
              className={`flex items-center gap-3 px-10 py-4 rounded-[1.5rem] font-black text-sm transition-all duration-300 ${
                currentTab === 'Atlet Muda' 
                ? 'bg-white text-blue-600 shadow-xl' 
                : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users size={20} /> MUDA
            </button>
          </div>
        </div>

        {/* Grid Media */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {visiblePlayers.map((player) => (
            <div
              key={player.id}
              className="group relative bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 hover:-translate-y-4"
            >
              <div className="relative h-[420px]">
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Badge Rank sesuai Tabel Ranking */}
                <div className="absolute top-8 left-8 bg-blue-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg shadow-blue-500/40">
                  <span className="text-[9px] opacity-80 leading-none">RANK</span>
                  <span className="text-xl">#{player.rank}</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 pt-0">
                <div className="mb-2">
                  <span className="bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                    {player.category}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mb-5 group-hover:text-blue-400 transition-colors">
                  {player.name}
                </h3>

                <div className="flex items-center justify-between pt-5 border-t border-white/10">
                  <div className="flex items-center space-x-3 text-slate-300">
                    <Trophy size={18} className="text-yellow-500" />
                    <span className="font-bold text-xs uppercase">{player.achievements} Medali</span>
                  </div>
                  <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <Medal size={20} className="text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Muat Lebih Banyak */}
        {filteredPlayers.length > 4 && (
          <div className="text-center mt-20">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-4 bg-slate-900 hover:bg-blue-600 text-white px-12 py-5 rounded-full font-black text-sm uppercase transition-all"
            >
              {showAll ? 'Sembunyikan' : `Lihat Semua ${currentTab}`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trophy, User } from 'lucide-react';

// Interface untuk tipe data Pemain
interface Player {
  id: number;
  name: string;
  category: string;
  ageGroup: 'Senior' | 'Muda'; // Sesuai dengan data Anda
  rank: number;
  image: string;
  achievements: string[];
}

// Interface untuk Props
interface PlayersProps {
  externalFilter?: string; // Menangkap 'Senior' atau 'Muda' dari Navbar
  onFilterChange?: (id: string) => void;
}

const Players: React.FC<PlayersProps> = ({ externalFilter, onFilterChange }) => {
  // 1. STATE INTERNAL
  const [searchTerm, setSearchTerm] = useState('');
  const [currentAgeGroup, setCurrentAgeGroup] = useState('Semua');

  // 2. DATA ATLET (Pastikan minimal ada satu 'Muda' untuk testing)
  const playersData: Player[] = [
    {
      id: 1,
      name: "Jonatan Christie",
      category: "Tunggal Putra",
      ageGroup: "Senior",
      rank: 3,
      image: "https://images.unsplash.com/photo-1626225967045-9c76db7b6209?w=400&h=500&fit=crop",
      achievements: ["Asian Games Gold", "All England Winner"]
    },
    {
      id: 2,
      name: "Alwi Farhan",
      category: "Tunggal Putra",
      ageGroup: "Muda",
      rank: 40,
      image: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&h=500&fit=crop",
      achievements: ["World Junior Champion"]
    },
    {
      id: 3,
      name: "Fajar Alfian",
      category: "Ganda Putra",
      ageGroup: "Senior",
      rank: 7,
      image: "https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?w=400&h=500&fit=crop",
      achievements: ["All England Gold", "Thomas Cup Winner"]
    }
  ];

  // 3. LOGIKA SINKRONISASI (KUNCI UTAMA)
  useEffect(() => {
    // Jika ada filter dari luar (Navbar), update state internal
    if (externalFilter) {
      setCurrentAgeGroup(externalFilter);
    }
  }, [externalFilter]);

  // 4. FILTERING LOGIC (Sudah diperbaiki agar Case-Insensitive)
  const filteredPlayers = useMemo(() => {
    return playersData.filter(player => {
      // Filter Nama
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter Kategori (Case Insensitive Check)
      const matchesTab = 
        currentAgeGroup.toLowerCase() === 'semua' || 
        player.ageGroup.toLowerCase() === currentAgeGroup.toLowerCase();

      return matchesSearch && matchesTab;
    });
  }, [searchTerm, currentAgeGroup]);

  // Handler untuk klik tab manual
  const handleTabClick = (tab: string) => {
    setCurrentAgeGroup(tab);
    if (onFilterChange) onFilterChange(tab);
  };

  return (
    <section id="atlet" className="py-24 bg-[#050505] min-h-screen scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              Elite <span className="text-blue-500">Athletes</span>
            </h2>
            <div className="h-1.5 w-24 bg-blue-600 rounded-full"></div>
            <p className="text-zinc-500 max-w-md text-sm font-medium">
              Representasi dedikasi dan prestasi tinggi dalam dunia badminton profesional.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atlet..."
              className="bg-zinc-900/80 border border-zinc-800 py-4 pl-12 pr-6 rounded-2xl w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex flex-wrap bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800/50 mb-12 w-fit">
          {['Semua', 'Senior', 'Muda'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all duration-300 ${
                currentAgeGroup.toLowerCase() === tab.toLowerCase()
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* PLAYERS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPlayers.map((player) => (
            <div 
              key={player.id} 
              className="group relative bg-zinc-900/20 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden hover:border-blue-500/40 transition-all duration-500 shadow-xl"
            >
              {/* IMAGE CONTAINER */}
              <div className="aspect-[4/5] overflow-hidden relative">
                <img 
                  src={player.image} 
                  alt={player.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90" />
                
                {/* RANK TAG (TOP RIGHT) */}
                <div className="absolute top-5 right-5 px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
                  <span className="text-[10px] font-black text-blue-400 italic">RANK #{player.rank}</span>
                </div>
              </div>

              {/* INFO CONTENT */}
              <div className="absolute bottom-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
                  {player.category}
                </p>
                <h3 className="text-2xl font-bold text-white mb-5 leading-none">
                  {player.name}
                </h3>
                
                {/* ACHIEVEMENTS BLOCK */}
                <div className="space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest border-b border-white/10 pb-2 mb-2">Major Titles</p>
                  {player.achievements.map((ach, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-300">
                      <Trophy size={12} className="text-blue-500 shrink-0" />
                      <span className="truncate">{ach}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredPlayers.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 rounded-[3rem]">
            <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6">
              <User size={32} className="text-zinc-700" />
            </div>
            <h4 className="text-white font-bold mb-1">Atlet tidak ditemukan</h4>
            <p className="text-zinc-600 text-sm">Coba gunakan kata kunci pencarian lain.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Players;
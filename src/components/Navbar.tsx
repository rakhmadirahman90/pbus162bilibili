import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trophy, User, Calendar } from 'lucide-react';

// Interface untuk tipe data Pemain
interface Player {
  id: number;
  name: string;
  category: string;
  ageGroup: 'Senior' | 'Muda';
  rank: number;
  image: string;
  achievements: string[];
}

// Interface untuk Props (Menerima data dari App.tsx)
interface PlayersProps {
  externalFilter?: string; // Menangkap 'Senior' atau 'Muda' dari Navbar
  onFilterChange?: (id: string) => void;
}

const Players: React.FC<PlayersProps> = ({ externalFilter, onFilterChange }) => {
  // 1. STATE INTERNAL
  const [searchTerm, setSearchTerm] = useState('');
  const [currentAgeGroup, setCurrentAgeGroup] = useState('Semua');

  // 2. DATA ATLET (Contoh Data)
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
    // Tambahkan data lainnya sesuai kategori Senior/Muda
  ];

  // 3. LOGIKA SINKRONISASI (KUNCI UTAMA)
  // Setiap kali user klik di Navbar, props externalFilter berubah.
  // useEffect ini akan menangkap perubahan tersebut dan mengubah state internal di sini.
  useEffect(() => {
    if (externalFilter) {
      setCurrentAgeGroup(externalFilter);
    }
  }, [externalFilter]);

  // 4. FILTERING LOGIC
  const filteredPlayers = useMemo(() => {
    return playersData.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = currentAgeGroup === 'Semua' || player.ageGroup === currentAgeGroup;
      return matchesSearch && matchesTab;
    });
  }, [searchTerm, currentAgeGroup]);

  // Handler untuk klik tab manual di halaman ini
  const handleTabClick = (tab: string) => {
    setCurrentAgeGroup(tab);
    if (onFilterChange) onFilterChange(tab);
  };

  return (
    <section id="atlet" className="py-24 bg-[#050505] min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
              DAFTAR <span className="text-blue-500">ATLET</span>
            </h2>
            <p className="text-zinc-500 max-w-md">
              Generasi profesional badminton US 162 BILIBILI yang siap mengharumkan nama bangsa.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama atlet..."
              className="bg-zinc-900/50 border border-zinc-800 py-3 pl-12 pr-6 rounded-2xl w-full md:w-80 focus:outline-none focus:border-blue-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex bg-zinc-900/50 p-2 rounded-[2rem] border border-zinc-800 mb-12 w-max">
          {['Semua', 'Senior', 'Muda'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`px-8 py-3 rounded-[1.5rem] text-[11px] font-black tracking-widest transition-all ${
                currentAgeGroup === tab 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* PLAYERS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <div 
              key={player.id} 
              className="group relative bg-zinc-900/30 border border-zinc-800/50 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-500"
            >
              {/* IMAGE CONTAINER */}
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src={player.image} 
                  alt={player.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
              </div>

              {/* INFO CONTENT */}
              <div className="absolute bottom-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-[9px] font-black uppercase tracking-wider rounded-full border border-blue-500/20">
                    {player.category}
                  </span>
                  <span className="px-3 py-1 bg-white/5 text-zinc-400 text-[9px] font-black uppercase tracking-wider rounded-full border border-white/5">
                    Rank #{player.rank}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                  {player.name}
                </h3>
                
                {/* ACHIEVEMENTS (Muncul saat hover) */}
                <div className="h-0 group-hover:h-auto overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                    {player.achievements.map((ach, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <Trophy size={12} className="text-yellow-500" />
                        {ach}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredPlayers.length === 0 && (
          <div className="py-20 text-center">
            <User size={48} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-zinc-500">Tidak ada atlet yang ditemukan.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Players;
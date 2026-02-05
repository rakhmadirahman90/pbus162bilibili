import { Trophy, Medal, ChevronDown, ChevronUp, Users, UserCheck } from 'lucide-react';
import { useState, useMemo } from 'react';

// Data ditambahkan properti 'ageGroup'
const playersData = [
  {
    id: 1,
    name: 'Hidayatullah',
    category: 'Ganda Putra (Seed C)',
    ageGroup: 'Senior',
    achievements: 15,
    rank: 1,
    image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg',
  },
  {
    id: 2,
    name: 'H. Wawan',
    category: 'Ganda Putra (Seed B+)',
    ageGroup: 'Senior',
    achievements: 12,
    rank: 2,
    image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 3,
    name: 'Andi Junior',
    category: 'Tunggal Putra',
    ageGroup: 'Muda',
    achievements: 5,
    rank: 1,
    image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 4,
    name: 'Bustam',
    category: 'Ganda Putra (Seed B+)',
    ageGroup: 'Senior',
    achievements: 10,
    rank: 4,
    image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 5,
    name: 'Rian Masa Depan',
    category: 'Tunggal Putra',
    ageGroup: 'Muda',
    achievements: 3,
    rank: 2,
    image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 6,
    name: 'Prof. Fikri',
    category: 'Ganda Putra (Seed B-)',
    ageGroup: 'Senior',
    achievements: 8,
    rank: 6,
    image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

export default function Players() {
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'Senior' | 'Muda'>('Senior');

  // Filter data berdasarkan kategori yang dipilih
  const filteredPlayers = useMemo(() => {
    return playersData.filter(player => player.ageGroup === activeTab);
  }, [activeTab]);

  const visiblePlayers = showAll ? filteredPlayers : filteredPlayers.slice(0, 4);

  return (
    <section id="atlet" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">Daftar Atlet</h2>
          <p className="text-xl text-gray-600">Pusat pembinaan bakat bulutangkis PB US 162</p>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Category Switcher (Tabs) */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
            <button
              onClick={() => { setActiveTab('Senior'); setShowAll(false); }}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === 'Senior' 
                ? 'bg-white text-blue-600 shadow-md scale-105' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserCheck size={18} /> SENIOR
            </button>
            <button
              onClick={() => { setActiveTab('Muda'); setShowAll(false); }}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === 'Muda' 
                ? 'bg-white text-blue-600 shadow-md scale-105' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users size={18} /> ATLET MUDA
            </button>
          </div>
        </div>

        {/* Grid Players */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {visiblePlayers.map((player) => (
            <div
              key={player.id}
              className="group relative bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-in fade-in zoom-in-95"
            >
              <div className="relative h-[380px]">
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent" />

                {/* Rank Badge */}
                <div className="absolute top-6 left-6 bg-blue-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                  <span className="text-[10px] opacity-70 leading-none">RANK</span>
                  <span className="text-xl">#{player.rank}</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
                  {player.category}
                </p>
                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors">
                  {player.name}
                </h3>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <Trophy size={16} className="text-yellow-500" />
                    <span className="text-white font-bold text-xs">{player.achievements} Prestasi</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <Medal size={18} className="text-yellow-400 group-hover:text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State jika atlet belum ada */}
        {visiblePlayers.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">Belum ada atlet di kategori ini.</p>
          </div>
        )}

        {/* Toggle Button */}
        {filteredPlayers.length > 4 && (
          <div className="text-center mt-16">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="group inline-flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-10 py-4 rounded-full font-bold transition-all shadow-xl active:scale-95"
            >
              {showAll ? (
                <>Sembunyikan <ChevronUp size={20} /></>
              ) : (
                <>Lihat Semua Atlet {activeTab} <ChevronDown size={20} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
import { Trophy, Medal, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const playersData = [
  {
    id: 1,
    name: 'Hidayatullah',
    category: 'Ganda Putra (Seed C)',
    achievements: 15,
    rank: 1,
    image: 'whatsapp_image_2025-12-30_at_15.33.37.jpeg',
  },
  {
    id: 2,
    name: 'H. Wawan',
    category: 'Ganda Putra (Seed B+)',
    achievements: 12,
    rank: 2,
    image: 'https://images.pexels.com/photos/7045704/pexels-photo-7045704.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 3,
    name: 'Madhy',
    category: 'Ganda Putra (Seed B+)',
    achievements: 18,
    rank: 3,
    image: 'https://images.pexels.com/photos/6253570/pexels-photo-6253570.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 4,
    name: 'Bustam',
    category: 'Ganda Putra (Seed B+)',
    achievements: 10,
    rank: 4,
    image: 'https://images.pexels.com/photos/8007471/pexels-photo-8007471.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 5,
    name: 'Agustilaar',
    category: 'Ganda Putra (Seed A)',
    achievements: 22,
    rank: 5,
    image: 'https://images.pexels.com/photos/3660204/pexels-photo-3660204.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 6,
    name: 'Prof. Fikri',
    category: 'Ganda Putra (Seed B-)',
    achievements: 8,
    rank: 6,
    image: 'https://images.pexels.com/photos/2202685/pexels-photo-2202685.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

export default function Players() {
  const [showAll, setShowAll] = useState(false);

  // Menampilkan 4 atlet pertama jika showAll false, jika true tampilkan semua
  const visiblePlayers = showAll ? playersData : playersData.slice(0, 4);

  return (
    <section id="players" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">ATLET UNGGULAN</h2>
          <p className="text-xl text-gray-600">Para juara yang menjadi pilar kekuatan PB US 162</p>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {visiblePlayers.map((player) => (
            <div
              key={player.id}
              className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-in fade-in zoom-in-95"
            >
              {/* Image Container */}
              <div className="relative h-[400px]">
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />

                {/* Rank Badge */}
                <div className="absolute top-6 left-6 bg-blue-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                  <span className="text-[10px] opacity-70 leading-none">RANK</span>
                  <span className="text-xl">#{player.rank}</span>
                </div>
              </div>

              {/* Content Container */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-blue-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">
                  {player.category}
                </p>
                <h3 className="text-2xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors">
                  {player.name}
                </h3>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <Trophy size={18} className="text-yellow-500" />
                    <span className="text-white font-bold text-sm">{player.achievements} Prestasi</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <Medal size={20} className="text-yellow-400 group-hover:text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toggle Button */}
        {playersData.length > 4 && (
          <div className="text-center mt-16">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="group inline-flex items-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-10 py-4 rounded-full font-bold transition-all shadow-xl active:scale-95"
            >
              {showAll ? (
                <>Sembunyikan Atlet <ChevronUp className="group-hover:-translate-y-1 transition-transform" /></>
              ) : (
                <>Lihat Semua Atlet <ChevronDown className="group-hover:translate-y-1 transition-transform" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
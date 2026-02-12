import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Search, User, X, Award, TrendingUp, Users, 
  MapPin, Phone, ShieldCheck, Star, Trophy
} from 'lucide-react';

interface Registrant {
  id: string;
  nama: string;
  whatsapp: string;
  kategori: string;
  domisili: string;
  foto_url: string;
  jenis_kelamin: string;
  // Field tambahan untuk simulasi data manajemen
  rank?: number;
  points?: string;
  seed?: string;
  bio?: string;
}

export default function ManajemenAtlet() {
  const [atlets, setAtlets] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtlet, setSelectedAtlet] = useState<Registrant | null>(null);

  useEffect(() => {
    fetchAtlets();
  }, []);

  const fetchAtlets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pendaftaran')
      .select('*')
      .order('nama', { ascending: true });
    
    if (!error && data) {
      // Menambahkan data dummy untuk rank & poin karena data ini 
      // biasanya dikelola di tabel terpisah (Ranking)
      const enhancedData = data.map((item, index) => ({
        ...item,
        rank: index + 1,
        points: (10000 - (index * 250)).toLocaleString(),
        seed: index < 4 ? 'SEED A' : 'UNSEEDED',
        bio: "Pemain kunci dengan pertahanan solid dan visi bermain yang tajam."
      }));
      setAtlets(enhancedData);
    }
    setLoading(false);
  };

  const filteredAtlets = atlets.filter(a => 
    a.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      {/* HEADER STATS */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
              Manajemen <span className="text-blue-600">Atlet</span>
            </h1>
            <p className="text-slate-500 font-medium">Kelola data prestasi dan profil profesional atlet.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
             <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Atlet</p>
                <p className="text-xl font-black text-blue-600">{atlets.length}</p>
             </div>
             <div className="w-[1px] h-8 bg-slate-100"></div>
             <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Aktif</p>
                <p className="text-xl font-black text-emerald-500">{atlets.length}</p>
             </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Cari nama atlet..."
            className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ATLET GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAtlets.map((atlet) => (
            <div 
              key={atlet.id}
              onClick={() => setSelectedAtlet(atlet)}
              className="bg-white p-4 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group border border-slate-50"
            >
              <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-4 bg-slate-100">
                {atlet.foto_url ? (
                  <img src={atlet.foto_url} className="w-full h-full object-cover" alt={atlet.nama} />
                ) : (
                  <User className="m-auto mt-10 text-slate-300" size={60} />
                )}
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  #{atlet.rank} GLOBAL
                </div>
              </div>
              <h3 className="font-black text-slate-900 uppercase italic truncate">{atlet.nama}</h3>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">{atlet.kategori}</p>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                <div className="text-[9px] font-bold text-slate-400">POINTS: <span className="text-slate-900">{atlet.points}</span></div>
                <div className="text-[9px] font-black text-emerald-500 italic">{atlet.seed}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DETAIL (KARTU SEPERTI GAMBAR) */}
      {selectedAtlet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl bg-[#121212] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10">
            {/* Tombol Close */}
            <button 
              onClick={() => setSelectedAtlet(null)}
              className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            {/* Bagian Kiri: Foto Besar */}
            <div className="w-full md:w-1/2 relative bg-[#1a1a1a] flex items-end">
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent z-10"></div>
              {selectedAtlet.foto_url ? (
                <img src={selectedAtlet.foto_url} className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700" alt={selectedAtlet.nama} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800"><User size={120} className="text-slate-700" /></div>
              )}
              
              {/* Badge Pemenang */}
              <div className="absolute bottom-8 left-8 z-20 bg-yellow-400 text-black font-black text-[10px] px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg italic">
                <Trophy size={14} /> WINNER - INTERNAL CUP IV
              </div>
            </div>

            {/* Bagian Kanan: Info Profil */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex gap-2 mb-4">
                <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-md border border-blue-600/30 uppercase tracking-tighter">
                  {selectedAtlet.kategori}
                </span>
                <span className="bg-white/5 text-white/50 text-[10px] font-black px-3 py-1 rounded-md border border-white/10 uppercase tracking-tighter">
                  {selectedAtlet.seed}
                </span>
              </div>

              <h2 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-8 leading-none">
                {selectedAtlet.nama.split(' ')[0]}<br/>
                <span className="text-white/20">{selectedAtlet.nama.split(' ').slice(1).join(' ')}</span>
              </h2>

              <div className="space-y-6">
                {/* Bio */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-blue-400">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Profil Singkat</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed italic">
                    "{selectedAtlet.bio}"
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <TrendingUp className="text-blue-500 mb-2" size={20} />
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Global Rank</p>
                    <p className="text-2xl font-black text-white">#{selectedAtlet.rank}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <Trophy className="text-yellow-500 mb-2" size={20} />
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Poin Klasemen</p>
                    <p className="text-2xl font-black text-white">{selectedAtlet.points}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
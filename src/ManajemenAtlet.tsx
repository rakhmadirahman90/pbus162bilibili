import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Search, User, X, Award, TrendingUp, Users, 
  MapPin, Phone, ShieldCheck, Star, Trophy, Save, Loader2, Edit3
} from 'lucide-react';

interface Registrant {
  id: string;
  nama: string;
  whatsapp: string;
  kategori: string;
  domisili: string;
  foto_url: string;
  jenis_kelamin: string;
  // Field dari join table atlet_stats
  rank: number;
  points: number;
  seed: string;
  bio: string;
  prestasi: string;
}

export default function ManajemenAtlet() {
  const [atlets, setAtlets] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtlet, setSelectedAtlet] = useState<Registrant | null>(null);
  
  // State untuk Modal Edit Stats
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStats, setEditingStats] = useState<Partial<Registrant> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAtlets();
  }, []);

  const fetchAtlets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select(`
          *,
          atlet_stats (
            rank,
            points,
            seed,
            bio,
            prestasi_terakhir
          )
        `)
        .order('nama', { ascending: true });
      
      if (error) throw error;

      if (data) {
        const formattedData = data.map((item: any) => ({
          ...item,
          rank: item.atlet_stats?.[0]?.rank || 0,
          points: item.atlet_stats?.[0]?.points || 0,
          seed: item.atlet_stats?.[0]?.seed || 'UNSEEDED',
          bio: item.atlet_stats?.[0]?.bio || "Data profil belum dilengkapi.",
          prestasi: item.atlet_stats?.[0]?.prestasi_terakhir || "CONTENDER"
        }));
        setAtlets(formattedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStats || !editingStats.id) return;
    
    setIsSaving(true);
    try {
      // Cek apakah data stats sudah ada
      const { data: existing } = await supabase
        .from('atlet_stats')
        .select('id')
        .eq('pendaftaran_id', editingStats.id)
        .single();

      const payload = {
        pendaftaran_id: editingStats.id,
        rank: editingStats.rank,
        points: editingStats.points,
        seed: editingStats.seed,
        bio: editingStats.bio,
        prestasi_terakhir: editingStats.prestasi
      };

      if (existing) {
        await supabase.from('atlet_stats').update(payload).eq('pendaftaran_id', editingStats.id);
      } else {
        await supabase.from('atlet_stats').insert([payload]);
      }

      await fetchAtlets();
      setIsEditModalOpen(false);
      setSelectedAtlet(null); // Tutup detail jika sedang terbuka
    } catch (err) {
      alert("Gagal memperbarui statistik");
    } finally {
      setIsSaving(false);
    }
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
          {loading ? (
            <div className="col-span-full py-20 text-center font-bold text-slate-400 uppercase italic tracking-widest">Memuat Data Atlet...</div>
          ) : filteredAtlets.map((atlet) => (
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
                <div className="text-[9px] font-bold text-slate-400">POINTS: <span className="text-slate-900">{atlet.points.toLocaleString()}</span></div>
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
              
              <div className="absolute bottom-8 left-8 z-20 bg-yellow-400 text-black font-black text-[10px] px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg italic uppercase">
                <Trophy size={14} /> {selectedAtlet.prestasi}
              </div>
            </div>

            {/* Bagian Kanan: Info Profil */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-md border border-blue-600/30 uppercase tracking-tighter">
                    {selectedAtlet.kategori}
                  </span>
                  <span className="bg-white/5 text-white/50 text-[10px] font-black px-3 py-1 rounded-md border border-white/10 uppercase tracking-tighter">
                    {selectedAtlet.seed}
                  </span>
                </div>
                {/* Tombol ke Edit Stats */}
                <button 
                  onClick={() => { setEditingStats(selectedAtlet); setIsEditModalOpen(true); }}
                  className="flex items-center gap-2 text-white/40 hover:text-blue-400 text-[10px] font-bold transition-colors"
                >
                  <Edit3 size={14} /> EDIT STATS
                </button>
              </div>

              <h2 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-8 leading-none">
                {selectedAtlet.nama.split(' ')[0]}<br/>
                <span className="text-white/20">{selectedAtlet.nama.split(' ').slice(1).join(' ')}</span>
              </h2>

              <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-blue-400">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Profil Singkat</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed italic">
                    "{selectedAtlet.bio}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <TrendingUp className="text-blue-500 mb-2" size={20} />
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Global Rank</p>
                    <p className="text-2xl font-black text-white">#{selectedAtlet.rank}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <Trophy className="text-yellow-500 mb-2" size={20} />
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Poin Klasemen</p>
                    <p className="text-2xl font-black text-white">{selectedAtlet.points.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT STATS */}
      {isEditModalOpen && editingStats && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-xl uppercase italic tracking-tighter">Update <span className="text-blue-600">Stats</span></h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleUpdateStats} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</label>
                  <input type="number" className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none font-bold" value={editingStats.rank} onChange={e => setEditingStats({...editingStats, rank: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Poin Klasemen</label>
                  <input type="number" className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none font-bold" value={editingStats.points} onChange={e => setEditingStats({...editingStats, points: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Seed (A/B/Unseeded)</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none font-bold uppercase" value={editingStats.seed} onChange={e => setEditingStats({...editingStats, seed: e.target.value})} />
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prestasi Terakhir</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none font-bold uppercase" placeholder="Contoh: Winner Internal Cup IV" value={editingStats.prestasi} onChange={e => setEditingStats({...editingStats, prestasi: e.target.value})} />
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio Singkat</label>
                  <textarea rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none font-bold text-sm" value={editingStats.bio} onChange={e => setEditingStats({...editingStats, bio: e.target.value})} />
              </div>
              <button disabled={isSaving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-slate-900 transition-all">
                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                Simpan Statistik
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
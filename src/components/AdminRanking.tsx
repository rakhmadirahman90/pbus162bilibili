import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "../supabase";
import { 
  Trophy, Plus, Trash2, Edit3, Save, X, 
  Search, Loader2, Award, User, Hash, 
  ChevronUp, ChevronDown, Filter, AlertCircle, RefreshCw,
  TrendingUp, Info
} from 'lucide-react';

// Interface
interface Ranking {
  id: string;
  player_name: string;
  category: string;
  seed: string;
  total_points: number;
  bonus: number;
  updated_at?: string;
}

export default function AdminRanking() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeed, setSelectedSeed] = useState('Semua');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Ranking>>({
    player_name: '',
    category: 'Senior',
    seed: 'Seed A',
    total_points: 0,
    bonus: 0
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch Data
  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('total_points', { ascending: false });
      
      if (error) throw error;
      setRankings(data || []);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // --- LOGIKA FIX SINKRONISASI ---
  const syncFromStats = async () => {
    const confirm = window.confirm("Gabungkan poin dari semua statistik atlet ke Leaderboard?");
    if (!confirm) return;
    
    setLoading(true);
    try {
      // 1. Ambil data stats dan join nama dari pendaftaran
      const { data: statsData, error: statsError } = await supabase
        .from('atlet_stats')
        .select(`
          points,
          seed,
          pendaftaran ( nama, kategori )
        `);

      if (statsError) throw statsError;
      if (!statsData || statsData.length === 0) {
        alert("Data statistik tidak ditemukan.");
        return;
      }

      // 2. PROSES AGREGASI (Mencegah Error 'Second Time Update')
      // Kita kumpulkan semua poin untuk nama yang sama di memori dulu
      const athleteMap: Record<string, any> = {};

      statsData.forEach((item: any) => {
        const detail = Array.isArray(item.pendaftaran) ? item.pendaftaran[0] : item.pendaftaran;
        
        if (detail?.nama) {
          const nameKey = detail.nama.trim().toUpperCase();
          const currentPoints = Number(item.points) || 0;

          if (athleteMap[nameKey]) {
            // Jika nama sudah ada, tambahkan poinnya saja
            athleteMap[nameKey].total_points += currentPoints;
          } else {
            // Jika nama baru, buat entry baru
            athleteMap[nameKey] = {
              player_name: nameKey,
              category: detail.kategori || 'Senior',
              seed: item.seed || 'Non-Seed',
              total_points: currentPoints,
              bonus: 0
            };
          }
        }
      });

      // Ubah objek map kembali menjadi array untuk dikirim ke Supabase
      const finalDataToUpsert = Object.values(athleteMap);

      // 3. Simpan ke database menggunakan UPSERT
      const { error: upsertError } = await supabase
        .from('rankings')
        .upsert(finalDataToUpsert, { 
          onConflict: 'player_name' // Pastikan kolom ini UNIQUE di database
        });

      if (upsertError) throw upsertError;
      
      alert(`Berhasil sinkronisasi ${finalDataToUpsert.length} data atlet.`);
      fetchRankings();
    } catch (err: any) {
      console.error(err);
      alert("Gagal Sinkron: " + (err.message || "Terjadi kesalahan sistem"));
    } finally {
      setLoading(false);
    }
  };

  // --- SUBMIT MANUAL ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      const payload = {
        player_name: formData.player_name?.trim().toUpperCase(),
        category: formData.category,
        seed: formData.seed,
        total_points: (Number(formData.total_points) || 0) + (Number(formData.bonus) || 0),
        bonus: Number(formData.bonus) || 0
      };

      const { error } = await supabase
        .from('rankings')
        .upsert([payload], { onConflict: 'player_name' });

      if (error) throw error;
      
      setIsModalOpen(false);
      fetchRankings();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus atlet ini dari ranking?")) return;
    await supabase.from('rankings').delete().eq('id', id);
    fetchRankings();
  };

  const filteredRankings = rankings.filter(r => 
    r.player_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedSeed === 'Semua' || r.seed === selectedSeed)
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              MANAJEMEN<span className="text-blue-600"> RANKING</span>
            </h1>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={syncFromStats}
              disabled={loading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900 border border-white/10 px-6 py-4 rounded-xl font-bold uppercase text-[10px] hover:bg-zinc-800 transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
              Sinkron Poin
            </button>
            <button 
              onClick={() => { setEditingId(null); setFormData({player_name:'', category:'Senior', seed:'Seed A', total_points:0, bonus:0}); setIsModalOpen(true); }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-xl font-bold uppercase text-[10px] transition-all"
            >
              <Plus size={16} /> Tambah Atlet
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-zinc-900/40 border border-white/5 p-3 rounded-2xl mb-8 flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="CARI NAMA ATLET..." 
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 outline-none text-xs font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 font-bold text-xs outline-none"
            value={selectedSeed}
            onChange={(e) => setSelectedSeed(e.target.value)}
          >
            <option value="Semua">SEMUA SEED</option>
            <option value="Seed A">SEED A</option>
            <option value="Seed B">SEED B</option>
            <option value="Non-Seed">NON-SEED</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase text-zinc-500">Pos</th>
                <th className="p-5 text-[10px] font-black uppercase text-zinc-500">Atlet</th>
                <th className="p-5 text-[10px] font-black uppercase text-zinc-500">Kategori</th>
                <th className="p-5 text-[10px] font-black uppercase text-zinc-500 text-center">Seed</th>
                <th className="p-5 text-[10px] font-black uppercase text-zinc-500">Total Poin</th>
                <th className="p-5 text-[10px] font-black uppercase text-zinc-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600" size={30} />
                  </td>
                </tr>
              ) : filteredRankings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">Data Tidak Ditemukan</td>
                </tr>
              ) : (
                filteredRankings.map((item, index) => (
                  <tr key={item.id} className="hover:bg-white/[0.01] transition-all group">
                    <td className="p-5 font-black italic text-blue-600">#{String(index + 1).padStart(2, '0')}</td>
                    <td className="p-5 font-black uppercase italic text-sm">{item.player_name}</td>
                    <td className="p-5">
                       <span className="bg-zinc-800 px-3 py-1 rounded text-[9px] font-bold text-zinc-400 uppercase">{item.category}</span>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded text-[9px] font-bold uppercase ${item.seed.includes('A') ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'}`}>
                        {item.seed}
                      </span>
                    </td>
                    <td className="p-5 font-bold text-zinc-400">{item.total_points?.toLocaleString()} PTS</td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingId(item.id); setFormData(item); setIsModalOpen(true); }} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all"><Edit3 size={14}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-zinc-800 hover:bg-red-900/50 rounded-lg transition-all"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-black uppercase italic tracking-tighter">Form Data Atlet</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Nama Lengkap</label>
                <input 
                  required 
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl p-3 outline-none focus:border-blue-600 uppercase font-bold text-sm" 
                  value={formData.player_name} 
                  onChange={e => setFormData({...formData, player_name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Kategori</label>
                  <select className="w-full bg-zinc-900 border border-white/5 rounded-xl p-3 outline-none text-xs font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Senior">Senior</option>
                    <option value="Muda">Muda</option>
                    <option value="Veteran">Veteran</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Seed</label>
                  <select className="w-full bg-zinc-900 border border-white/5 rounded-xl p-3 outline-none text-xs font-bold" value={formData.seed} onChange={e => setFormData({...formData, seed: e.target.value})}>
                    <option value="Seed A">Seed A</option>
                    <option value="Seed B">Seed B</option>
                    <option value="Non-Seed">Non-Seed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Poin Dasar</label>
                  <input type="number" className="w-full bg-black border border-white/5 rounded-lg p-2 outline-none font-bold" value={formData.total_points} onChange={e => setFormData({...formData, total_points: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-blue-400 uppercase">Poin Bonus</label>
                  <input type="number" className="w-full bg-black border border-white/5 rounded-lg p-2 outline-none font-bold text-blue-400" value={formData.bonus} onChange={e => setFormData({...formData, bonus: Number(e.target.value)})} />
                </div>
              </div>
              <button disabled={isSaving} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-black uppercase text-xs tracking-widest transition-all">
                {isSaving ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
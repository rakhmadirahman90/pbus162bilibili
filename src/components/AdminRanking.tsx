import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "../supabase";
import { 
  Plus, Trash2, Edit3, Save, X, 
  Search, Loader2, User, RefreshCw,
  AlertCircle
} from 'lucide-react';

// Interface sesuai kolom database
interface Ranking {
  id: string;
  player_name: string;
  category: string;
  seed: string;
  total_points: number;
  bonus: number;
  photo_url?: string; 
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
    bonus: 0,
    photo_url: ''
  });
  
  const [formError, setFormError] = useState<string | null>(null);

  // --- FETCH DATA ---
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

  // --- LOGIKA SINKRONISASI FOTO & POIN (FULL FIX) ---
  const syncFromStats = async () => {
    const confirm = window.confirm("Sistem akan menghitung ulang poin dan MENARIK FOTO dari tabel pendaftaran. Lanjutkan?");
    if (!confirm) return;
    
    setLoading(true);
    try {
      // 1. Ambil data statistik poin
      const { data: statsData, error: statsError } = await supabase
        .from('atlet_stats')
        .select('points, seed, player_name');

      if (statsError) throw statsError;

      // 2. Ambil data pendaftaran untuk referensi FOTO dan KATEGORI
      const { data: pendaftaranData, error: pendaftaranError } = await supabase
        .from('pendaftaran')
        .select('nama, foto_url, kategori');

      if (pendaftaranError) throw pendaftaranError;

      // 3. Buat Map untuk mempercepat pencarian foto berdasarkan nama
      const photoMap = new Map();
      pendaftaranData?.forEach(p => {
        if (p.nama) {
          photoMap.set(p.nama.trim().toUpperCase(), {
            url: p.foto_url,
            kat: p.kategori
          });
        }
      });

      // 4. Proses penggabungan data (Aggregation)
      const athleteMap = new Map();

      statsData?.forEach((item: any) => {
        if (item.player_name) {
          const cleanName = item.player_name.trim().toUpperCase();
          const currentPoints = Number(item.points) || 0;
          
          // Cari data pendukung (foto & kategori) dari pendaftaran
          const profile = photoMap.get(cleanName);

          if (athleteMap.has(cleanName)) {
            const existing = athleteMap.get(cleanName);
            existing.total_points += currentPoints;
          } else {
            athleteMap.set(cleanName, {
              player_name: cleanName,
              category: profile?.kat || 'Senior',
              seed: item.seed || 'Non-Seed',
              total_points: currentPoints,
              bonus: 0,
              photo_url: profile?.url || null // MENYIMPAN FOTO KE DATABASE RANKING
            });
          }
        }
      });

      const finalDataArray = Array.from(athleteMap.values());

      if (finalDataArray.length === 0) {
        alert("Tidak ada data untuk disinkronkan.");
        return;
      }

      // 5. Eksekusi Database: Bersihkan lalu Masukkan data baru
      // Menghapus semua data kecuali sistem (untuk menghindari conflict)
      const { error: deleteError } = await supabase
        .from('rankings')
        .delete()
        .neq('player_name', 'SYSTEM_RESERVED_PROTECT');

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('rankings')
        .insert(finalDataArray);

      if (insertError) throw insertError;
      
      alert(`Berhasil sinkronisasi ${finalDataArray.length} atlet. Foto telah diperbarui.`);
      fetchRankings();
    } catch (err: any) {
      console.error("Sync Error:", err);
      alert("Gagal Sinkron: " + (err.message || "Terjadi kesalahan"));
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
      if (!formData.player_name) throw new Error("Nama atlet wajib diisi");

      const cleanName = formData.player_name.trim().toUpperCase();
      const payload = {
        player_name: cleanName,
        category: formData.category,
        seed: formData.seed,
        total_points: (Number(formData.total_points) || 0) + (Number(formData.bonus) || 0),
        bonus: Number(formData.bonus) || 0,
        photo_url: formData.photo_url || null
      };

      let error;
      if (editingId) {
        const res = await supabase.from('rankings').update(payload).eq('id', editingId);
        error = res.error;
      } else {
        const res = await supabase.from('rankings').upsert([payload], { onConflict: 'player_name' });
        error = res.error;
      }

      if (error) throw error;
      
      setIsModalOpen(false);
      setEditingId(null);
      fetchRankings();
    } catch (err: any) {
      setFormError(err.message.includes('unique') ? "Nama atlet sudah terdaftar!" : err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus atlet ini dari ranking?")) return;
    try {
      const { error } = await supabase.from('rankings').delete().eq('id', id);
      if (error) throw error;
      fetchRankings();
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  const filteredRankings = rankings.filter(r => {
    const matchesSearch = r.player_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeed = selectedSeed === 'Semua' || r.seed === selectedSeed;
    return matchesSearch && matchesSeed;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              MANAJEMEN<span className="text-blue-600"> RANKING</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
               <span className="w-2 h-2 bg-blue-600 animate-pulse rounded-full"></span>
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Database Synchronization System</p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={syncFromStats}
              disabled={loading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900 border border-white/10 px-6 py-4 rounded-xl font-bold uppercase text-[10px] hover:bg-zinc-800 transition-all text-zinc-300 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
              Sinkron Ulang Poin & Foto
            </button>
            <button 
              onClick={() => { 
                setEditingId(null); 
                setFormData({player_name:'', category:'Senior', seed:'Seed A', total_points:0, bonus:0, photo_url:''}); 
                setIsModalOpen(true); 
              }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-xl font-bold uppercase text-[10px] transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus size={14} /> Tambah Atlet
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
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 outline-none text-xs font-bold uppercase focus:border-blue-600/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 font-bold text-xs outline-none cursor-pointer hover:bg-zinc-800 transition-all"
            value={selectedSeed}
            onChange={(e) => setSelectedSeed(e.target.value)}
          >
            <option value="Semua">SEMUA SEED</option>
            <option value="Seed A">SEED A</option>
            <option value="Seed B">SEED B</option>
            <option value="Non-Seed">NON-SEED</option>
          </select>
        </div>

        {/* Table Content */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md overflow-x-auto shadow-2xl">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-white/[0.02] border-b border-white/5 text-zinc-500">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center w-16">Pos</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Atlet</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Kategori</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Total Poin</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={30} />
                    <p className="text-[10px] font-bold text-zinc-500 uppercase">Mengolah Database...</p>
                  </td>
                </tr>
              ) : filteredRankings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Data Tidak Ditemukan</td>
                </tr>
              ) : (
                filteredRankings.map((item, index) => (
                  <tr key={item.id} className="hover:bg-white/[0.01] transition-all group">
                    <td className="p-5 text-center font-black italic text-blue-600">#{String(index + 1).padStart(2, '0')}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-all overflow-hidden shadow-inner">
                          {item.photo_url ? (
                            <img 
                              src={item.photo_url} 
                              alt={item.player_name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => { 
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.player_name)}&background=0D8ABC&color=fff&bold=true`; 
                              }}
                            />
                          ) : (
                            <User size={16} className="text-zinc-600" />
                          )}
                        </div>
                        <span className="font-black uppercase italic text-sm tracking-tight">{item.player_name}</span>
                      </div>
                    </td>
                    <td className="p-5">
                       <span className="bg-zinc-900 border border-white/5 px-3 py-1 rounded text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                         {item.category}
                       </span>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded text-[9px] font-black uppercase ${
                        item.seed === 'Seed A' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 
                        item.seed === 'Seed B' ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20' : 
                        'bg-zinc-800 text-zinc-500 border border-white/5'
                      }`}>
                        {item.seed}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-white text-base leading-none tracking-tighter">{item.total_points?.toLocaleString()}</span>
                        {item.bonus > 0 && <span className="text-[8px] text-blue-500 font-bold mt-1">+{item.bonus} BONUS</span>}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingId(item.id); setFormData(item); setIsModalOpen(true); }} className="p-2 bg-zinc-900 hover:bg-blue-600 rounded-lg transition-all border border-white/5"><Edit3 size={14}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-zinc-900 hover:bg-red-600 rounded-lg transition-all border border-white/5"><Trash2 size={14}/></button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-zinc-950 w-full max-w-lg rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-black uppercase italic tracking-tighter text-lg">
                {editingId ? 'Edit' : 'Tambah'} <span className="text-blue-600">Atlet</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                  <AlertCircle size={16}/> {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nama Lengkap</label>
                <input 
                  required 
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 outline-none focus:border-blue-600 uppercase font-black text-sm transition-all" 
                  value={formData.player_name} 
                  onChange={e => setFormData({...formData, player_name: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Kategori</label>
                  <select className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 outline-none text-xs font-bold uppercase" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Senior">Senior</option>
                    <option value="Muda">Muda</option>
                    <option value="Veteran">Veteran</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Seed Status</label>
                  <select className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 outline-none text-xs font-bold uppercase" value={formData.seed} onChange={e => setFormData({...formData, seed: e.target.value})}>
                    <option value="Seed A">Seed A</option>
                    <option value="Seed B">Seed B</option>
                    <option value="Non-Seed">Non-Seed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">URL Foto (Optional)</label>
                <input 
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 outline-none focus:border-blue-600 text-xs transition-all" 
                  placeholder="https://..."
                  value={formData.photo_url || ''} 
                  onChange={e => setFormData({...formData, photo_url: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/[0.03] p-6 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Poin Dasar</label>
                  <input type="number" className="w-full bg-black border border-white/5 rounded-lg p-3 outline-none font-black text-white" value={formData.total_points} onChange={e => setFormData({...formData, total_points: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Bonus Manual</label>
                  <input type="number" className="w-full bg-black border border-white/5 rounded-lg p-3 outline-none font-black text-blue-400" value={formData.bonus} onChange={e => setFormData({...formData, bonus: Number(e.target.value)})} />
                </div>
              </div>

              <button 
                disabled={isSaving} 
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                {isSaving ? 'MEMPROSES...' : 'SIMPAN DATA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
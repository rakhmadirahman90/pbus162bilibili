import React, { useState, useEffect } from 'react';
import { supabase } from "../supabase";
import { 
  Trophy, Plus, Trash2, Edit3, Save, X, 
  Search, Loader2, Award, User, Hash, 
  ChevronUp, ChevronDown, Filter, AlertCircle, RefreshCw
} from 'lucide-react';

interface Ranking {
  id: string;
  player_name: string;
  category: string;
  seed: string;
  total_points: number;
  bonus?: number;
  global_rank?: number;
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

  useEffect(() => {
    fetchRankings();
    
    const subscription = supabase
      .channel('rankings_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rankings' }, () => {
        fetchRankings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('total_points', { ascending: false });
      
      if (error) throw error;
      if (data) setRankings(data);
    } catch (err: any) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * FUNGSI SINKRONISASI ULTRA-SAFE
   * Menjumlahkan semua poin dari statistik dan bonus pemain secara otomatis
   */
  const syncFromStats = async () => {
    if (!window.confirm("Sinkronisasi akan menjumlahkan total poin atlet dari data statistik terbaru. Lanjutkan?")) return;
    
    setLoading(true);
    try {
      // 1. Ambil data stats beserta relasi pendaftarannya
      const { data: statsData, error: statsError } = await supabase
        .from('atlet_stats')
        .select(`
          points,
          seed,
          pendaftaran ( nama, kategori )
        `);

      if (statsError) throw statsError;

      if (!statsData || statsData.length === 0) {
        alert("Tidak ada data di Statistik Atlet.");
        return;
      }

      // 2. Gunakan Map untuk Agregasi (Penjumlahan Poin)
      const aggregatedMap = new Map();

      statsData.forEach(item => {
        const pendaftar = item.pendaftaran as any;
        if (pendaftar && pendaftar.nama) {
          const cleanName = pendaftar.nama.trim().toUpperCase();
          const existing = aggregatedMap.get(cleanName);
          
          const currentPoints = Number(item.points) || 0;

          if (existing) {
            aggregatedMap.set(cleanName, {
              ...existing,
              total_points: existing.total_points + currentPoints,
              // Tetapkan seed jika sebelumnya kosong
              seed: item.seed || existing.seed
            });
          } else {
            aggregatedMap.set(cleanName, {
              player_name: cleanName,
              category: pendaftar.kategori || 'Senior',
              seed: item.seed || 'Non-Seed',
              total_points: currentPoints,
              bonus: 0
            });
          }
        }
      });

      const upsertData = Array.from(aggregatedMap.values());

      // 3. Eksekusi Upsert
      const { error: upsertError } = await supabase
        .from('rankings')
        .upsert(upsertData, { 
          onConflict: 'player_name',
          ignoreDuplicates: false 
        });

      if (upsertError) throw upsertError;
      
      alert(`Berhasil! ${upsertData.length} data atlet telah diakumulasikan ke tabel ranking.`);
      fetchRankings();
    } catch (err: any) {
      console.error("Sync Critical Error:", err);
      alert("Gagal Sinkron: " + (err.hint || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.player_name?.trim()) {
      setFormError("Nama atlet wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      // Kalkulasi total final jika ada bonus manual
      const totalFinal = (Number(formData.total_points) || 0) + (Number(formData.bonus) || 0);
      
      const payload = {
        player_name: formData.player_name.trim().toUpperCase(),
        category: formData.category,
        seed: formData.seed,
        total_points: totalFinal,
        bonus: formData.bonus || 0
      };

      if (editingId) {
        const { error } = await supabase
          .from('rankings')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rankings')
          .upsert([payload], { onConflict: 'player_name' });
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      fetchRankings();
    } catch (err: any) {
      setFormError("Gagal menyimpan: Nama atlet mungkin duplikat atau database sibuk.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Hapus atlet dari ranking?")) {
      try {
        const { error } = await supabase.from('rankings').delete().eq('id', id);
        if (error) throw error;
        fetchRankings();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const openModal = (item?: Ranking) => {
    setFormError(null);
    if (item) {
      setEditingId(item.id);
      // Pisahkan poin murni untuk input form
      setFormData({
        ...item,
        total_points: (item.total_points || 0) - (item.bonus || 0)
      });
    } else {
      setEditingId(null);
      setFormData({ player_name: '', category: 'Senior', seed: 'Seed A', total_points: 0, bonus: 0 });
    }
    setIsModalOpen(true);
  };

  const filteredRankings = rankings.filter(r => {
    const matchName = r.player_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeed = selectedSeed === 'Semua' || r.seed === selectedSeed;
    return matchName && matchSeed;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative font-sans selection:bg-blue-500/30">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500 shadow-inner"><Trophy size={20} /></div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Official Ranking</p>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              LEADER<span className="text-blue-600">BOARD</span>
            </h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={syncFromStats}
              disabled={loading}
              className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-zinc-900 border border-white/10 hover:bg-zinc-800 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Sinkron Otomatis
            </button>
            <button 
              onClick={() => openModal()} 
              className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/20"
            >
              <Plus size={18} /> Tambah Baru
            </button>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-[2rem] mb-8 flex flex-col md:flex-row gap-4 backdrop-blur-xl shadow-2xl">
          <div className="relative flex-grow">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text" 
              placeholder="CARI NAMA ATLET..." 
              className="w-full bg-black/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-blue-600/50 font-bold text-[11px] tracking-widest uppercase transition-all placeholder:text-zinc-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <div className="flex items-center gap-3 bg-black/50 border border-white/5 rounded-2xl px-6 py-2">
                <Filter size={16} className="text-blue-500" />
                <select 
                  className="bg-transparent font-black text-[10px] uppercase tracking-tighter outline-none cursor-pointer appearance-none pr-4"
                  value={selectedSeed}
                  onChange={(e) => setSelectedSeed(e.target.value)}
                >
                  <option value="Semua">Filter: Semua Seed</option>
                  <option value="Seed A">Seed A Only</option>
                  <option value="Seed B">Seed B Only</option>
                  <option value="Non-Seed">Non-Seed</option>
                </select>
             </div>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-7 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Rank</th>
                  <th className="p-7 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Athlete Identity</th>
                  <th className="p-7 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Category</th>
                  <th className="p-7 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Classification</th>
                  <th className="p-7 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Total Score</th>
                  <th className="p-7 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={6} className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /></td></tr>
                ) : filteredRankings.length === 0 ? (
                  <tr><td colSpan={6} className="p-32 text-center text-zinc-600 font-black uppercase italic tracking-widest opacity-50">No Data Synchronized</td></tr>
                ) : (
                  filteredRankings.map((item, index) => (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition-all group">
                      <td className="p-7">
                        <span className={`font-black italic text-2xl ${index < 3 ? 'text-blue-500 drop-shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'text-zinc-700'}`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="p-7">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-white/5 group-hover:border-blue-500/50 transition-all">
                            <User size={18} className="text-zinc-500 group-hover:text-blue-400" />
                          </div>
                          <span className="font-black italic uppercase tracking-tighter text-base group-hover:text-blue-400 transition-colors">
                            {item.player_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-7">
                        <span className="px-4 py-1.5 bg-zinc-900 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-7 text-center">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          item.seed === 'Seed A' ? 'bg-blue-600/10 text-blue-400 border-blue-600/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]' : 
                          item.seed === 'Seed B' ? 'bg-purple-600/10 text-purple-400 border-purple-600/30' : 
                          'bg-zinc-900/50 text-zinc-500 border-white/5'
                        }`}>
                          {item.seed}
                        </span>
                      </td>
                      <td className="p-7">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 font-black italic text-xl text-white">
                            {item.total_points?.toLocaleString()} <span className="text-[10px] text-blue-600 not-italic uppercase tracking-[0.3em]">Pts</span>
                          </div>
                          {item.bonus! > 0 && (
                            <span className="text-[9px] text-green-500 font-bold uppercase tracking-tighter">Incl. Bonus: +{item.bonus}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-7">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                          <button onClick={() => openModal(item)} className="p-3 bg-zinc-800 hover:bg-blue-600 rounded-xl transition-all border border-white/5 shadow-xl"><Edit3 size={18} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-3 bg-zinc-800 hover:bg-red-600 rounded-xl transition-all border border-white/5 shadow-xl"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Editor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-[#0c0c0c] w-full max-w-xl rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-5">
                <div className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                  {editingId ? 'Modify' : 'Register'} <span className="text-blue-600">Player</span>
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                  <AlertCircle size={18}/> {formError}
                </div>
              )}
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Full Athlete Name</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ex: JHON DOE" 
                  className="w-full px-7 py-5 bg-white/[0.03] rounded-2xl border border-white/5 focus:border-blue-600/50 outline-none font-bold text-base text-white transition-all shadow-inner" 
                  value={formData.player_name} 
                  onChange={e => setFormData({...formData, player_name: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Division</label>
                  <select 
                    className="w-full px-7 py-5 bg-[#141414] rounded-2xl border border-white/5 focus:border-blue-600/50 outline-none font-bold text-sm text-white appearance-none cursor-pointer shadow-inner" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Senior">Senior</option>
                    <option value="Muda">Muda</option>
                    <option value="Veteran">Veteran</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Seed Rank</label>
                  <select 
                    className="w-full px-7 py-5 bg-[#141414] rounded-2xl border border-white/5 focus:border-blue-600/50 outline-none font-bold text-sm text-white appearance-none cursor-pointer shadow-inner" 
                    value={formData.seed} 
                    onChange={e => setFormData({...formData, seed: e.target.value})}
                  >
                    <option value="Seed A">Seed A</option>
                    <option value="Seed B">Seed B</option>
                    <option value="Non-Seed">Non-Seed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Base Points</label>
                  <input required type="number" className="w-full px-7 py-5 bg-white/[0.03] rounded-2xl border border-white/5 focus:border-blue-600/50 outline-none font-bold text-base text-white shadow-inner" value={formData.total_points} onChange={e => setFormData({...formData, total_points: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Bonus (+)</label>
                  <input type="number" className="w-full px-7 py-5 bg-white/[0.03] rounded-2xl border border-white/5 focus:border-blue-600/50 outline-none font-bold text-base text-white shadow-inner" value={formData.bonus} onChange={e => setFormData({...formData, bonus: parseInt(e.target.value) || 0})} />
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={isSaving} className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} 
                  {editingId ? 'Update Leaderboard' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
        select option { background: #0c0c0c; color: white; padding: 20px; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}
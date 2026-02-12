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
    
    // Realtime subscription
    const subscription = supabase
      .channel('public:rankings_changes')
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
   * FUNGSI SINKRONISASI (DIPERBAIKI)
   * Mengintegrasikan data dari atlet_stats ke rankings dengan proteksi duplikasi ketat
   */
  const syncFromStats = async () => {
    if (!window.confirm("Sinkronisasi akan memperbarui poin berdasarkan data pendaftaran terbaru. Lanjutkan?")) return;
    
    setLoading(true);
    try {
      const { data: statsData, error: statsError } = await supabase
        .from('atlet_stats')
        .select(`
          points,
          seed,
          pendaftaran ( nama, kategori )
        `);

      if (statsError) throw statsError;

      if (statsData && statsData.length > 0) {
        const uniquePlayersMap = new Map();

        statsData.forEach(item => {
          // Gunakan optional chaining dan trim untuk membersihkan whitespace
          const rawName = item.pendaftaran?.nama;
          if (rawName) {
            const cleanName = rawName.trim();
            uniquePlayersMap.set(cleanName, {
              player_name: cleanName,
              category: item.pendaftaran?.kategori || 'Senior',
              seed: item.seed || 'Non-Seed',
              total_points: item.points || 0,
              bonus: 0 // Default reset bonus saat sinkron massal jika diperlukan
            });
          }
        });

        const upsertData = Array.from(uniquePlayersMap.values());

        const { error: upsertError } = await supabase
          .from('rankings')
          .upsert(upsertData, { 
            onConflict: 'player_name',
            ignoreDuplicates: false 
          });

        if (upsertError) throw upsertError;
        
        alert(`Sinkronisasi Berhasil! ${upsertData.length} data atlet telah diperbarui.`);
        fetchRankings();
      } else {
        alert("Tidak ada data di Statistik Atlet untuk disinkronkan.");
      }
    } catch (err: any) {
      console.error("Sync Error Detail:", err);
      alert("Gagal Sinkron: " + err.message);
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
      // Membersihkan nama sebelum simpan
      const payload = {
        ...formData,
        player_name: formData.player_name.trim()
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
      setFormError("Gagal menyimpan data: " + (err.hint || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Hapus data atlet ini dari peringkat? Tindakan ini tidak bisa dibatalkan.")) {
      try {
        const { error } = await supabase.from('rankings').delete().eq('id', id);
        if (error) throw error;
        fetchRankings();
      } catch (err: any) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  const openModal = (item?: Ranking) => {
    setFormError(null);
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({ 
        player_name: '', 
        category: 'Senior', 
        seed: 'Seed A', 
        total_points: 0, 
        bonus: 0 
      });
    }
    setIsModalOpen(true);
  };

  const filteredRankings = rankings.filter(r => {
    const matchName = r.player_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeed = selectedSeed === 'Semua' || r.seed === selectedSeed;
    return matchName && matchSeed;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><Trophy size={20} /></div>
                <p className="text-zinc-500 text-[10px] font-black tracking-[0.3em] uppercase">Leaderboard System</p>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
              MANAJEMEN <span className="text-blue-600">RANKING</span>
            </h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={syncFromStats}
              disabled={loading}
              className="flex items-center gap-3 bg-zinc-900 border border-white/10 hover:bg-zinc-800 px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Sinkron Poin
            </button>
            <button 
              onClick={() => openModal()} 
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/20"
            >
              <Plus size={18} /> Tambah Atlet
            </button>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] mb-8 flex flex-col md:flex-row gap-4 backdrop-blur-sm">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="CARI NAMA ATLET..." 
              className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-6 outline-none focus:border-blue-600 font-bold text-[10px] tracking-widest uppercase transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <div className="flex items-center gap-2 bg-black border border-white/10 rounded-xl px-4 py-2">
                <Filter size={14} className="text-blue-500" />
                <select 
                  className="bg-transparent font-black text-[9px] uppercase tracking-tighter outline-none cursor-pointer appearance-none pr-4"
                  value={selectedSeed}
                  onChange={(e) => setSelectedSeed(e.target.value)}
                >
                  <option value="Semua">Semua Seed</option>
                  <option value="Seed A">Seed A</option>
                  <option value="Seed B">Seed B</option>
                  <option value="Non-Seed">Non-Seed</option>
                </select>
             </div>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-500">Pos</th>
                  <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-500">Atlet</th>
                  <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-500">Kategori</th>
                  <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-500 text-center">Seed</th>
                  <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-500">Total Poin</th>
                  <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-500 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={6} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></td></tr>
                ) : filteredRankings.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center text-zinc-600 font-bold uppercase italic tracking-widest">Data Tidak Ditemukan</td></tr>
                ) : (
                  filteredRankings.map((item, index) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <span className={`font-black italic text-lg ${index < 3 ? 'text-blue-500' : 'text-zinc-600'}`}>
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="font-black italic uppercase tracking-tighter text-sm group-hover:text-blue-400 transition-colors">
                          {item.player_name}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 border border-white/5">{item.category}</span>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          item.seed === 'Seed A' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 
                          item.seed === 'Seed B' ? 'bg-purple-600/10 text-purple-400 border-purple-600/20' : 
                          'bg-zinc-800 text-zinc-500 border-white/5'
                        }`}>
                          {item.seed}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 font-black italic text-sm text-zinc-200">
                          {item.total_points?.toLocaleString()} <span className="text-[10px] text-zinc-600 not-italic uppercase tracking-widest">PTS</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(item)} className="p-3 bg-zinc-800 hover:bg-blue-600 rounded-xl transition-all border border-white/5" title="Edit Data"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-3 bg-zinc-800 hover:bg-red-600 rounded-xl transition-all border border-white/5" title="Hapus Data"><Trash2 size={16} /></button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0c0c0c] w-full max-w-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                <h3 className="text-xl font-black italic uppercase tracking-tighter">{editingId ? 'Edit' : 'Tambah'} <span className="text-blue-600">Atlet</span></h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14}/> {formError}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nama Lengkap Atlet</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Masukkan nama..." 
                  className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm text-white transition-colors" 
                  value={formData.player_name} 
                  onChange={e => setFormData({...formData, player_name: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Kategori</label>
                  <select 
                    className="w-full px-5 py-4 bg-[#1a1a1a] rounded-xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm text-white" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Senior">Senior</option>
                    <option value="Muda">Muda</option>
                    <option value="Veteran">Veteran</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Klasifikasi Seed</label>
                  <select 
                    className="w-full px-5 py-4 bg-[#1a1a1a] rounded-xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm text-white" 
                    value={formData.seed} 
                    onChange={e => setFormData({...formData, seed: e.target.value})}
                  >
                    <option value="Seed A">Seed A</option>
                    <option value="Seed B">Seed B</option>
                    <option value="Non-Seed">Non-Seed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Total Poin</label>
                  <input 
                    required 
                    type="number" 
                    className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm text-white" 
                    value={formData.total_points} 
                    onChange={e => setFormData({...formData, total_points: parseInt(e.target.value) || 0})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Bonus Poin</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm text-white" 
                    value={formData.bonus} 
                    onChange={e => setFormData({...formData, bonus: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                  {editingId ? 'Simpan Perubahan' : 'Tambahkan Peringkat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563eb; }
        select option { background: #0c0c0c; color: white; }
      `}</style>
    </div>
  );
}
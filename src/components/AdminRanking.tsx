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
    
    const subscription = supabase
      .channel('rankings_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rankings' }, () => {
        fetchRankings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchRankings]);

  // --- LOGIKA SINKRONISASI OTOMATIS ---
  const syncFromStats = async () => {
    const confirm = window.confirm("Gabungkan semua poin dari manajemen atlet ke Leaderboard?");
    if (!confirm) return;
    
    setLoading(true);
    try {
      // 1. Ambil data stats dengan join pendaftaran
      const { data: statsData, error: statsError } = await supabase
        .from('atlet_stats')
        .select(`
          points,
          seed,
          pendaftaran ( nama, kategori )
        `);

      if (statsError) throw statsError;
      if (!statsData || statsData.length === 0) {
        alert("Data statistik kosong.");
        return;
      }

      // 2. Agregasi Data (Menjumlahkan poin jika nama sama)
      const aggregatedMap = new Map<string, any>();

      statsData.forEach((item: any) => {
        const pendaftar = Array.isArray(item.pendaftaran) ? item.pendaftaran[0] : item.pendaftaran;
        
        if (pendaftar?.nama) {
          const rawName = pendaftar.nama.trim();
          const key = rawName.toUpperCase(); // Kunci unik berdasarkan nama kapital
          const points = Number(item.points) || 0;
          const existing = aggregatedMap.get(key);

          if (existing) {
            aggregatedMap.set(key, {
              ...existing,
              total_points: existing.total_points + points,
              // Update seed jika yang baru lebih tinggi (A > B > Non)
              seed: item.seed === 'Seed A' ? 'Seed A' : (existing.seed === 'Seed A' ? 'Seed A' : item.seed)
            });
          } else {
            aggregatedMap.set(key, {
              player_name: rawName.toUpperCase(),
              category: pendaftar.kategori || 'Senior',
              seed: item.seed || 'Non-Seed',
              total_points: points,
              bonus: 0
            });
          }
        }
      });

      const upsertData = Array.from(aggregatedMap.values());

      // 3. Simpan ke rankings
      const { error: upsertError } = await supabase
        .from('rankings')
        .upsert(upsertData, { 
          onConflict: 'player_name',
          ignoreDuplicates: false 
        });

      if (upsertError) throw upsertError;
      
      alert(`Berhasil mensinkronkan ${upsertData.length} data atlet.`);
      fetchRankings();
    } catch (err: any) {
      alert("Gagal Sinkron: " + (err.hint || err.message));
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
      const basePoints = Number(formData.total_points) || 0;
      const bonusPoints = Number(formData.bonus) || 0;
      
      const payload = {
        player_name: formData.player_name?.trim().toUpperCase(),
        category: formData.category,
        seed: formData.seed,
        total_points: basePoints + bonusPoints,
        bonus: bonusPoints
      };

      let result;
      if (editingId) {
        result = await supabase.from('rankings').update(payload).eq('id', editingId);
      } else {
        result = await supabase.from('rankings').upsert([payload], { onConflict: 'player_name' });
      }

      if (result.error) throw result.error;
      
      setIsModalOpen(false);
      setEditingId(null);
      fetchRankings();
    } catch (err: any) {
      setFormError(err.message?.includes('unique') ? "Nama atlet ini sudah ada!" : err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus data ini?")) return;
    try {
      const { error } = await supabase.from('rankings').delete().eq('id', id);
      if (error) throw error;
      fetchRankings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openModal = (item?: Ranking) => {
    setFormError(null);
    if (item) {
      setEditingId(item.id);
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
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 relative font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-bold rounded-full border border-blue-600/30 uppercase tracking-widest">
                Database System v2.0
              </span>
            </div>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
              RANKING<span className="text-blue-600">.</span>MNG
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={syncFromStats}
              disabled={loading}
              className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
              {loading ? 'Processing...' : 'Sync Poin'}
            </button>
            <button 
              onClick={() => openModal()} 
              className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus size={16} /> Add Athlete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Total Athletes</p>
            <p className="text-3xl font-black italic">{rankings.length}</p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Highest Score</p>
            <p className="text-3xl font-black italic text-blue-500">
              {rankings[0]?.total_points?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">System Status</p>
            <p className="text-3xl font-black italic text-zinc-400">ONLINE</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 p-3 rounded-[2rem] mb-8 flex flex-col md:flex-row gap-3 backdrop-blur-xl">
          <div className="relative flex-grow">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama..." 
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/50 font-bold text-[11px] uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 font-bold text-[10px] uppercase outline-none cursor-pointer"
            value={selectedSeed}
            onChange={(e) => setSelectedSeed(e.target.value)}
          >
            <option value="Semua">All Seed</option>
            <option value="Seed A">Seed A</option>
            <option value="Seed B">Seed B</option>
            <option value="Non-Seed">Non-Seed</option>
          </select>
        </div>

        <div className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Pos</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Athlete</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Division</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Final Score</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-24 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={32} />
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Synchronizing Database...</p>
                  </td>
                </tr>
              ) : filteredRankings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-24 text-center">
                    <Info className="text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest">No matching results found</p>
                  </td>
                </tr>
              ) : (
                filteredRankings.map((item, index) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="p-6 font-black italic text-zinc-500">{index + 1}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-white/5">
                          <User size={16} className="text-zinc-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black italic uppercase text-white group-hover:text-blue-400 transition-colors">
                            {item.player_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-[10px] font-black uppercase text-zinc-400">{item.category}</td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        item.seed === 'Seed A' ? 'bg-blue-600/10 text-blue-400 border-blue-600/30' : 
                        item.seed === 'Seed B' ? 'bg-purple-600/10 text-purple-400 border-purple-600/30' : 
                        'bg-zinc-900/50 text-zinc-500 border-white/5'
                      }`}>
                        {item.seed}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 font-black italic text-lg">
                        {item.total_points?.toLocaleString()}
                        <TrendingUp size={14} className="text-blue-600" />
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openModal(item)} className="p-3 bg-zinc-800 hover:bg-blue-600 rounded-xl transition-all"><Edit3 size={16}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-3 bg-zinc-800 hover:bg-red-600 rounded-xl transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0c0c0c] w-full max-w-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">
                {editingId ? 'Edit' : 'New'} <span className="text-blue-600">Entry</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {formError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                  <AlertCircle size={16}/> {formError}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Athlete Name</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-6 py-4 bg-white/[0.03] rounded-2xl border border-white/5 focus:border-blue-600 outline-none font-bold text-white uppercase transition-all" 
                  value={formData.player_name} 
                  onChange={e => setFormData({...formData, player_name: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Category</label>
                  <select 
                    className="w-full px-6 py-4 bg-[#141414] rounded-2xl border border-white/5 outline-none font-bold text-white text-xs uppercase" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Senior">Senior</option>
                    <option value="Muda">Muda</option>
                    <option value="Veteran">Veteran</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Seed Status</label>
                  <select 
                    className="w-full px-6 py-4 bg-[#141414] rounded-2xl border border-white/5 outline-none font-bold text-white text-xs uppercase" 
                    value={formData.seed} 
                    onChange={e => setFormData({...formData, seed: e.target.value})}
                  >
                    <option value="Seed A">Seed A</option>
                    <option value="Seed B">Seed B</option>
                    <option value="Non-Seed">Non-Seed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Base Points</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 bg-black/40 rounded-2xl border border-white/5 outline-none font-black text-white" 
                    value={formData.total_points} 
                    onChange={e => setFormData({...formData, total_points: parseInt(e.target.value) || 0})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-green-500 uppercase tracking-widest">Bonus Point</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 bg-black/40 rounded-2xl border border-white/5 outline-none font-black text-white" 
                    value={formData.bonus} 
                    onChange={e => setFormData({...formData, bonus: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSaving} 
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 transition-all"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                {editingId ? 'Save Changes' : 'Create Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
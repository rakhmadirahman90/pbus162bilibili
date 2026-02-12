import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from "../supabase";
import { 
  Trophy, Plus, Trash2, Edit3, Save, X, 
  Search, Loader2, Award, User, Hash, 
  ChevronUp, ChevronDown, Filter, AlertCircle,
  Download, Users, BarChart3, RefreshCw
} from 'lucide-react';

interface Ranking {
  id: string;
  player_name: string;
  category: string;
  seed: string;
  total_points: number;
  bonus?: number;
  global_rank?: number;
  created_at?: string;
}

export default function AdminRanking() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeed, setSelectedSeed] = useState('Semua');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      .channel('public:rankings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rankings' }, () => {
        fetchRankings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchRankings = async () => {
    if (!isRefreshing) setLoading(true);
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .order('total_points', { ascending: false });
    
    if (data) setRankings(data);
    setLoading(false);
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRankings();
  };

  // Fitur Baru: Export Data ke CSV
  const exportToCSV = () => {
    const headers = ["Rank,Nama,Kategori,Seed,Total Poin,Bonus\n"];
    const rows = filteredRankings.map((r, i) => 
      `${i+1},${r.player_name},${r.category},${r.seed},${r.total_points},${r.bonus || 0}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rankings_Export_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.player_name) {
      setFormError("Nama atlet wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('rankings').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('rankings').insert([formData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      setEditingId(null);
      fetchRankings();
    } catch (err: any) {
      setFormError("Gagal menyimpan data: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Hapus data atlet ini dari peringkat? Tindakan ini tidak bisa dibatalkan.")) {
      const { error } = await supabase.from('rankings').delete().eq('id', id);
      if (!error) fetchRankings();
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
    const matchName = r.player_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeed = selectedSeed === 'Semua' || r.seed === selectedSeed;
    return matchName && matchSeed;
  });

  // Fitur Baru: Statistik Sederhana
  const stats = useMemo(() => {
    const total = rankings.length;
    const avgPoints = total > 0 ? Math.round(rankings.reduce((acc, curr) => acc + curr.total_points, 0) / total) : 0;
    return { total, avgPoints };
  }, [rankings]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-500/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><Trophy size={20} /></div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Administrator Mode</p>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              MANAJEMEN <span className="text-blue-600">RANKING</span>
            </h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
            >
              <Download size={16} /> Export
            </button>
            <button 
              onClick={() => openModal()} 
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/20"
            >
              <Plus size={18} /> Tambah Atlet
            </button>
          </div>
        </div>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl"><Users size={20}/></div>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Atlet</span>
            </div>
            <div className="text-3xl font-black italic">{stats.total}</div>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-yellow-600/10 text-yellow-500 rounded-xl"><BarChart3 size={20}/></div>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rata-rata Poin</span>
            </div>
            <div className="text-3xl font-black italic">{stats.avgPoints.toLocaleString()}</div>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm flex items-center justify-center border-dashed group cursor-pointer" onClick={handleRefresh}>
             <RefreshCw className={`text-zinc-700 group-hover:text-blue-500 transition-all ${isRefreshing ? 'animate-spin' : ''}`} size={30} />
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] mb-8 flex flex-col md:flex-row gap-4 backdrop-blur-sm">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="CARI NAMA ATLET..." 
              className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-6 outline-none focus:border-blue-600 font-bold text-[10px] tracking-widest uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-black border border-white/10 rounded-xl px-4 py-2 min-w-[180px]">
            <Filter size={14} className="text-blue-500" />
            <select 
              className="bg-transparent font-black text-[9px] uppercase tracking-tighter outline-none cursor-pointer w-full text-white"
              value={selectedSeed}
              onChange={(e) => setSelectedSeed(e.target.value)}
            >
              <option value="Semua" className="bg-zinc-900">Filter Seed: Semua</option>
              <option value="Seed A" className="bg-zinc-900">Seed A</option>
              <option value="Seed B" className="bg-zinc-900">Seed B</option>
              <option value="Non-Seed" className="bg-zinc-900">Non-Seed</option>
            </select>
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
                  filteredRankings.map((item, index) => {
                    const isTop3 = index < 3;
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                             <span className={`font-black italic text-lg ${isTop3 ? 'text-blue-500' : 'text-zinc-600'}`}>
                              #{String(index + 1).padStart(2, '0')}
                            </span>
                            {isTop3 && <Award size={14} className="text-yellow-500" />}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col">
                             <span className="font-black italic uppercase tracking-tighter text-sm group-hover:text-blue-400 transition-colors">{item.player_name}</span>
                          </div>
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
                            {item.total_points.toLocaleString()} <span className="text-[10px] text-zinc-600 not-italic uppercase tracking-widest">PTS</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal(item)} className="p-3 bg-zinc-800 hover:bg-blue-600 rounded-xl transition-all border border-white/5"><Edit3 size={16} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-3 bg-zinc-800 hover:bg-red-600 rounded-xl transition-all border border-white/5"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
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
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-zinc-500 hover:text-white"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14}/> {formError}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nama Lengkap Atlet</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input required type="text" placeholder="Masukkan nama..." className="w-full px-5 py-4 pl-12 bg-white/5 rounded-xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm" value={formData.player_name} onChange={e => setFormData({...formData, player_name: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Kategori Umur</label>
                  <select className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Senior">Senior</option>
                    <option value="Muda">Muda</option>
                    <option value="Veteran">Veteran</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Klasifikasi Seed</label>
                  <select className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm" value={formData.seed} onChange={e => setFormData({...formData, seed: e.target.value})}>
                    <option value="Seed A">Seed A</option>
                    <option value="Seed B">Seed B</option>
                    <option value="Non-Seed">Non-Seed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Total Poin</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input required type="number" className="w-full px-5 py-4 pl-12 bg-white/5 rounded-xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm" value={formData.total_points} onChange={e => setFormData({...formData, total_points: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Bonus Poin</label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input type="number" className="w-full px-5 py-4 pl-12 bg-white/5 rounded-xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm" value={formData.bonus} onChange={e => setFormData({...formData, bonus: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} {editingId ? 'Update Data' : 'Tambah Atlet'}
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
      `}</style>
    </div>
  );
}
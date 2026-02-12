import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "../supabase";
import { 
  Plus, Trash2, Edit3, Save, X, 
  Search, Loader2, User, RefreshCw,
  AlertCircle, CheckCircle2, Camera, Upload,
  ChevronLeft, ChevronRight // Tambahkan icon untuk pagination
} from 'lucide-react';

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
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeed, setSelectedSeed] = useState('Semua');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- STATE BARU UNTUK PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Jumlah data per halaman

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

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Reset ke halaman 1 jika filter atau search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSeed]);

  // --- LOGIKA UPLOAD FOTO ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Hanya file gambar yang diizinkan!");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `ranking-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, photo_url: publicUrl });
      setSuccessMsg("Foto berhasil diunggah!");
    } catch (err: any) {
      alert("Gagal upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- LOGIKA SINKRONISASI ---
  const syncFromStats = async () => {
    const confirm = window.confirm("Sistem akan sinkronisasi POIN, FOTO dari Pendaftaran, dan STATUS SEED dari Statistik. Lanjutkan?");
    if (!confirm) return;
    
    setLoading(true);
    try {
      const { data: statsData, error: statsError } = await supabase
        .from('atlet_stats')
        .select('pendaftaran_id, points, seed');

      if (statsError) throw statsError;

      const { data: pendaftaranData, error: pendaftaranError } = await supabase
        .from('pendaftaran')
        .select('id, nama, foto_url, kategori');

      if (pendaftaranError) throw pendaftaranError;

      const athleteMap = new Map();

      statsData?.forEach((stat: any) => {
        const profile = pendaftaranData?.find(p => p.id === stat.pendaftaran_id);
        
        if (profile && profile.nama) {
          const cleanName = profile.nama.replace(/\s+/g, ' ').trim().toUpperCase();
          const currentPoints = Number(stat.points) || 0;

          if (athleteMap.has(cleanName)) {
            const existing = athleteMap.get(cleanName);
            existing.total_points += currentPoints;
            if (stat.seed) existing.seed = stat.seed;
          } else {
            athleteMap.set(cleanName, {
              player_name: cleanName,
              category: profile.kategori || 'Senior',
              seed: stat.seed || 'Non-Seed',
              total_points: currentPoints,
              bonus: 0,
              photo_url: profile.foto_url || null 
            });
          }
        }
      });

      const finalDataArray = Array.from(athleteMap.values());
      if (finalDataArray.length === 0) throw new Error("Tidak ada data atlet yang valid untuk disinkron.");

      await supabase.from('rankings').delete().neq('player_name', '_SYSTEM_');
      const { error: insertError } = await supabase.from('rankings').insert(finalDataArray);

      if (insertError) throw insertError;
      
      setSuccessMsg(`Berhasil sinkronisasi ${finalDataArray.length} atlet!`);
      fetchRankings();
    } catch (err: any) {
      console.error("Sync Error:", err);
      alert("Gagal Sinkron: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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

      const { error } = editingId 
        ? await supabase.from('rankings').update(payload).eq('id', editingId)
        : await supabase.from('rankings').upsert([payload], { onConflict: 'player_name' });

      if (error) throw error;
      
      setIsModalOpen(false);
      setEditingId(null);
      setSuccessMsg("Data berhasil disimpan!");
      fetchRankings();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus atlet ini?")) return;
    try {
      await supabase.from('rankings').delete().eq('id', id);
      fetchRankings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- LOGIKA FILTER & PAGINATION BARU ---
  const filteredRankings = rankings.filter(r => 
    r.player_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedSeed === 'Semua' || r.seed === selectedSeed)
  );

  const totalPages = Math.ceil(filteredRankings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRankings = filteredRankings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        
        {successMsg && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[150] bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xs uppercase flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              MANAJEMEN<span className="text-blue-600"> RANKING</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
               <span className="w-2 h-2 bg-blue-600 animate-pulse rounded-full"></span>
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Live Database Engine v2.0</p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={syncFromStats}
              disabled={loading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900 border border-white/10 px-6 py-4 rounded-xl font-bold uppercase text-[10px] hover:bg-zinc-800 transition-all text-zinc-300 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
              Sinkron Foto & Poin
            </button>
            <button 
              onClick={() => { setEditingId(null); setFormData({player_name:'', category:'Senior', seed:'Seed A', total_points:0, bonus:0, photo_url:''}); setIsModalOpen(true); }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-xl font-bold uppercase text-[10px] transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus size={14} /> Tambah Atlet
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-zinc-900/40 border border-white/5 p-3 rounded-2xl mb-8 flex flex-col md:flex-row gap-3 backdrop-blur-sm">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="CARI NAMA ATLET..." 
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 outline-none text-xs font-bold uppercase focus:border-blue-600/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 font-bold text-xs outline-none cursor-pointer"
            value={selectedSeed}
            onChange={(e) => setSelectedSeed(e.target.value)}
          >
            <option value="Semua">SEMUA SEED</option>
            <option value="Seed A">SEED A</option>
            <option value="Seed B+">SEED B+</option>
            <option value="Seed B">SEED B</option>
            <option value="Seed C">SEED C</option>
            <option value="Non-Seed">NON-SEED</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-white/[0.02] border-b border-white/5 text-zinc-500">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center w-20">Rank</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Profil Atlet</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Kategori</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Total Poin</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="p-32 text-center text-xs font-bold uppercase text-zinc-500 animate-pulse">Memproses Data...</td></tr>
              ) : paginatedRankings.length > 0 ? (
                paginatedRankings.map((item, index) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-all group">
                  <td className="p-5 text-center font-black italic text-xl text-zinc-700 group-hover:text-blue-500">
                    {String(startIndex + index + 1).padStart(2,'0')}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-800 rounded-full border border-white/10 overflow-hidden ring-4 ring-black">
                        {item.photo_url ? (
                          <img src={item.photo_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><User size={20} className="text-zinc-600"/></div>
                        )}
                      </div>
                      <p className="font-black uppercase italic text-sm text-white group-hover:text-blue-400">{item.player_name}</p>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-black text-zinc-400 uppercase">{item.category}</span>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                      item.seed?.includes('A') ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 
                      item.seed?.includes('B') ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20' : 
                      item.seed?.includes('C') ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' :
                      'bg-zinc-800 text-zinc-500 border border-white/5'
                    }`}>
                      {item.seed || 'NON-SEED'}
                    </span>
                  </td>
                  <td className="p-5 text-center font-black text-white text-lg">{item.total_points?.toLocaleString()}</td>
                  <td className="p-5 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditingId(item.id); setFormData(item); setIsModalOpen(true); }} className="p-2.5 bg-zinc-900 hover:bg-blue-600 rounded-xl border border-white/5"><Edit3 size={16}/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-zinc-900 hover:bg-red-600 rounded-xl border border-white/5"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))) : (
                <tr><td colSpan={6} className="p-20 text-center text-zinc-500 uppercase font-bold text-xs">Tidak ada data ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- KOMPONEN PAGINATION BARU --- */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-8 px-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredRankings.length)} dari {filteredRankings.length} Atlet
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-3 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all border ${
                      currentPage === i + 1 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-3 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tetap Sama */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-zinc-950 w-full max-w-lg rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-black uppercase italic text-2xl">{editingId ? 'EDIT' : 'TAMBAH'} PROFIL</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-zinc-900 rounded-2xl"><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
                <div className="w-20 h-20 bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                  {formData.photo_url ? <img src={formData.photo_url} className="w-full h-full object-cover" alt="" /> : <Camera size={24} className="text-zinc-700" />}
                </div>
                <div className="flex-grow">
                   <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                   <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-zinc-800 px-4 py-2 rounded-xl text-[10px] font-bold uppercase">
                     {isUploading ? 'Uploading...' : 'Upload Foto'}
                   </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase">Nama Atlet</label>
                <input required className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 outline-none focus:border-blue-600 font-black uppercase" value={formData.player_name} onChange={e => setFormData({...formData, player_name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase">Seed Status</label>
                  <select className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 outline-none" value={formData.seed} onChange={e => setFormData({...formData, seed: e.target.value})}>
                    <option value="Seed A">Seed A</option>
                    <option value="Seed B+">Seed B+</option>
                    <option value="Seed B">Seed B</option>
                    <option value="Seed C">Seed C</option>
                    <option value="Non-Seed">Non-Seed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase">Poin Dasar</label>
                  <input type="number" className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 outline-none" value={formData.total_points} onChange={e => setFormData({...formData, total_points: Number(e.target.value)})} />
                </div>
              </div>

              <button disabled={isSaving || isUploading} className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save />} SIMPAN PERUBAHAN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
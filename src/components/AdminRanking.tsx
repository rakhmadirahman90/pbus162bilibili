import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from "../supabase";
import { 
  Plus, Trash2, Edit3, Save, X, 
  Search, Loader2, User, RefreshCw,
  AlertCircle, CheckCircle2, Camera, Upload
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

  // --- LOGIKA UPLOAD FOTO KE STORAGE ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith('image/')) {
      alert("Hanya file gambar yang diizinkan!");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `ranking-photos/${fileName}`;

      // 1. Upload ke Bucket 'atlet-photos' (Pastikan bucket ini sudah dibuat di Supabase)
      const { error: uploadError } = await supabase.storage
        .from('atlet-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Ambil Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('atlet-photos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, photo_url: publicUrl });
      setSuccessMsg("Foto berhasil diunggah!");
    } catch (err: any) {
      alert("Gagal upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // --- LOGIKA SINKRONISASI FOTO & POIN ---
  const syncFromStats = async () => {
    const confirm = window.confirm("Sistem akan menghitung ulang poin dan MENARIK FOTO dari tabel pendaftaran. Lanjutkan?");
    if (!confirm) return;
    
    setLoading(true);
    try {
      const { data: statsData, error: statsError } = await supabase
        .from('atlet_stats')
        .select('points, seed, player_name');

      if (statsError) throw statsError;

      const { data: pendaftaranData, error: pendaftaranError } = await supabase
        .from('pendaftaran')
        .select('nama, foto_url, kategori');

      if (pendaftaranError) throw pendaftaranError;

      const clean = (name: string) => name ? name.replace(/\s+/g, ' ').trim().toUpperCase() : '';

      const profileMap = new Map();
      pendaftaranData?.forEach(p => {
        if (p.nama) {
          profileMap.set(clean(p.nama), {
            url: p.foto_url,
            kat: p.kategori
          });
        }
      });

      const athleteMap = new Map();

      statsData?.forEach((item: any) => {
        if (item.player_name) {
          const cleanName = clean(item.player_name);
          const currentPoints = Number(item.points) || 0;
          const profile = profileMap.get(cleanName);

          if (athleteMap.has(cleanName)) {
            const existing = athleteMap.get(cleanName);
            existing.total_points += currentPoints;
            if (!existing.photo_url && profile?.url) {
              existing.photo_url = profile.url;
            }
          } else {
            athleteMap.set(cleanName, {
              player_name: cleanName,
              category: profile?.kat || 'Senior',
              seed: item.seed || 'Non-Seed',
              total_points: currentPoints,
              bonus: 0,
              photo_url: profile?.url || null 
            });
          }
        }
      });

      const finalDataArray = Array.from(athleteMap.values());

      if (finalDataArray.length === 0) {
        throw new Error("Tidak ada data atlet yang valid ditemukan.");
      }

      const { error: deleteError } = await supabase
        .from('rankings')
        .delete()
        .neq('player_name', 'SYSTEM_RESERVED');

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('rankings')
        .insert(finalDataArray);

      if (insertError) throw insertError;
      
      setSuccessMsg(`Berhasil sinkronisasi ${finalDataArray.length} atlet!`);
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
        const { error: updateError } = await supabase
          .from('rankings')
          .update(payload)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: upsertError } = await supabase
          .from('rankings')
          .upsert([payload], { onConflict: 'player_name' });
        error = upsertError;
      }

      if (error) throw error;
      
      setIsModalOpen(false);
      setEditingId(null);
      setSuccessMsg("Data berhasil disimpan!");
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
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Pesan Sukses Floating */}
        {successMsg && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[150] bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Header Section */}
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

        {/* Search & Filter Bar */}
        <div className="bg-zinc-900/40 border border-white/5 p-3 rounded-2xl mb-8 flex flex-col md:flex-row gap-3 backdrop-blur-sm">
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

        {/* Rankings Table */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl overflow-x-auto">
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
                <tr>
                  <td colSpan={6} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                        <RefreshCw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={16} />
                      </div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Mengolah Database...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRankings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs">Tidak ada data atlet ditemukan</td>
                </tr>
              ) : (
                filteredRankings.map((item, index) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="p-5 text-center">
                       <span className={`text-xl font-black italic ${index < 3 ? 'text-blue-500' : 'text-zinc-700'}`}>
                         {String(index + 1).padStart(2, '0')}
                       </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-all overflow-hidden ring-4 ring-black">
                          {item.photo_url ? (
                            <img 
                              src={item.photo_url} 
                              alt={item.player_name} 
                              className="w-full h-full object-cover"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => { 
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.player_name)}&background=0D8ABC&color=fff&bold=true`; 
                              }}
                            />
                          ) : (
                            <User size={20} className="text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-black uppercase italic text-sm tracking-wide text-white group-hover:text-blue-400 transition-colors">
                            {item.player_name}
                          </p>
                          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Verified Athlete</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                       <span className="bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-black text-zinc-400 uppercase">
                         {item.category}
                       </span>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        item.seed === 'Seed A' ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 
                        item.seed === 'Seed B' ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20' : 
                        'bg-zinc-800 text-zinc-500 border border-white/5'
                      }`}>
                        {item.seed}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-white text-lg leading-none tracking-tighter">{item.total_points?.toLocaleString()}</span>
                        {item.bonus > 0 && (
                          <span className="text-[9px] text-blue-500 font-bold mt-1 bg-blue-500/10 px-2 py-0.5 rounded-md">
                            +{item.bonus} BONUS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => { setEditingId(item.id); setFormData(item); setIsModalOpen(true); }} 
                          className="p-2.5 bg-zinc-900 hover:bg-blue-600 rounded-xl transition-all border border-white/5 hover:scale-110"
                        >
                          <Edit3 size={16}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="p-2.5 bg-zinc-900 hover:bg-red-600 rounded-xl transition-all border border-white/5 hover:scale-110"
                        >
                          <Trash2 size={16}/>
                        </button>
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-zinc-950 w-full max-w-lg rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="font-black uppercase italic tracking-tighter text-2xl">
                  {editingId ? 'EDIT' : 'TAMBAH'} <span className="text-blue-600">PROFIL</span>
                </h3>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Manajemen Ranking Manual</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-3 bg-zinc-900 hover:bg-red-600/20 hover:text-red-500 text-zinc-500 rounded-2xl transition-all"
              >
                <X size={24}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                  <AlertCircle size={18}/> {formError}
                </div>
              )}

              {/* UPLOAD FOTO SECTION */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Foto Atlet</label>
                <div className="flex items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
                  <div className="relative w-24 h-24 bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center group/photo">
                    {formData.photo_url ? (
                      <img src={formData.photo_url} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <Camera size={24} className="text-zinc-700" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow space-y-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all"
                    >
                      <Upload size={14} /> Pilih Gambar
                    </button>
                    <p className="text-[8px] text-zinc-500 leading-tight">Maksimal 2MB. Format: JPG, PNG, WEBP.</p>
                  </div>
                </div>
                <input 
                  className="w-full bg-zinc-900/30 border border-white/5 rounded-xl px-4 py-2 outline-none focus:border-blue-600 text-[10px] transition-all placeholder:text-zinc-700" 
                  placeholder="Atau tempel URL foto di sini..."
                  value={formData.photo_url || ''} 
                  onChange={e => setFormData({...formData, photo_url: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input 
                  required 
                  placeholder="MASUKKAN NAMA ATLET..."
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-4 outline-none focus:border-blue-600 uppercase font-black text-sm transition-all focus:ring-4 focus:ring-blue-600/10" 
                  value={formData.player_name} 
                  onChange={e => setFormData({...formData, player_name: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Kategori</label>
                  <select 
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-4 outline-none text-xs font-bold uppercase cursor-pointer focus:border-blue-600" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Senior">Senior</option>
                    <option value="Muda">Muda</option>
                    <option value="Veteran">Veteran</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Seed Status</label>
                  <select 
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-4 outline-none text-xs font-bold uppercase cursor-pointer focus:border-blue-600" 
                    value={formData.seed} 
                    onChange={e => setFormData({...formData, seed: e.target.value})}
                  >
                    <option value="Seed A">Seed A</option>
                    <option value="Seed B">Seed B</option>
                    <option value="Non-Seed">Non-Seed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-blue-600/5 p-6 rounded-[2rem] border border-blue-600/10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Poin Dasar</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3 outline-none font-black text-white focus:border-blue-600" 
                    value={formData.total_points} 
                    onChange={e => setFormData({...formData, total_points: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Poin Bonus</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3 outline-none font-black text-blue-500 focus:border-blue-600" 
                    value={formData.bonus} 
                    onChange={e => setFormData({...formData, bonus: Number(e.target.value)})} 
                  />
                </div>
              </div>

              <button 
                disabled={isSaving || isUploading} 
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                {isSaving ? 'MEMPROSES DATA...' : 'SIMPAN PERUBAHAN'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
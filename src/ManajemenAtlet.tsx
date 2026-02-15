import React, { useEffect, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { supabase } from "./supabase";
import { 
  Search, User, X, Award, TrendingUp, Users, 
  MapPin, Phone, ShieldCheck, Star, Trophy, Save, Loader2, Edit3,
  ChevronLeft, ChevronRight, Zap, Sparkles, RefreshCcw, Camera, Scissors, Plus
} from 'lucide-react';

const SEED_STANDARDS: Record<string, number> = {
  'SEED A': 10000,
  'SEED B+': 8500,
  'SEED B': 7500,
  'SEED C': 6825,
  'QUALIFIER': 500,
  'UNSEEDED': 0
};

interface Registrant {
  id: string;
  nama: string;
  whatsapp: string;
  kategori: string;
  domisili: string;
  foto_url: string;
  jenis_kelamin: string;
  rank: number;
  points: number;
  seed: string;
  bio: string;
  prestasi: string;
  status?: string;
}

export default function ManajemenAtlet() {
  const [atlets, setAtlets] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtlet, setSelectedAtlet] = useState<Registrant | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [editingStats, setEditingStats] = useState<Partial<Registrant> | null>(null);
  const [newAtlet, setNewAtlet] = useState<Partial<Registrant>>({
    nama: '', kategori: "MEN'S SINGLE", seed: 'UNSEEDED', points: 0, rank: 0, bio: '', prestasi: 'CONTENDER', foto_url: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');

  useEffect(() => {
    fetchAtlets();
  }, []);

  const fetchAtlets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select(`*, atlet_stats (rank, points, seed, bio, prestasi_terakhir)`)
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

  const handleSeedUpdate = (newSeed: string, target: 'edit' | 'add') => {
    const standardizedPoints = SEED_STANDARDS[newSeed.toUpperCase()] ?? 0;
    if (target === 'edit' && editingStats) {
      setEditingStats({ ...editingStats, seed: newSeed.toUpperCase(), points: standardizedPoints });
    } else {
      setNewAtlet({ ...newAtlet, seed: newSeed.toUpperCase(), points: standardizedPoints });
    }
  };

  const onCropComplete = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => setImageToCrop(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // --- PERBAIKAN FUNGSI CROP (MENGGUNAKAN BUCKET identitas_atlet) ---
  const executeCropAndUpload = async () => {
    if (!croppedAreaPixels || !imageToCrop) {
      alert("Data tidak lengkap untuk proses crop");
      return;
    }
    
    setIsCropping(true);
    try {
      const image = new Image();
      image.src = imageToCrop;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Gagal menginisialisasi canvas");

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x, croppedAreaPixels.y,
        croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0,
        croppedAreaPixels.width, croppedAreaPixels.height
      );

      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', 0.9));
      if (!blob) throw new Error("Gagal membuat file gambar");

      const fileName = `${Date.now()}-atlet.jpg`;
      const filePath = `atlet_photos/${fileName}`;

      // UPLOAD KE BUCKET identitas_atlet
      const { error: uploadError } = await supabase.storage
        .from('identitas_atlet') 
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('identitas_atlet').getPublicUrl(filePath);

      if (isAddModalOpen) {
        setNewAtlet({ ...newAtlet, foto_url: publicUrl });
      } else if (editingStats) {
        setEditingStats({ ...editingStats, foto_url: publicUrl });
        await supabase.from('pendaftaran').update({ foto_url: publicUrl }).eq('id', editingStats.id);
      }

      setImageToCrop(null);
      setNotifMessage("Foto Berhasil Diproses!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message || "Gagal memproses gambar"}`);
    } finally {
      setIsCropping(false);
    }
  };

  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStats || !editingStats.id) return;
    
    setIsSaving(true);
    try {
      const statsPayload = {
        pendaftaran_id: editingStats.id,
        rank: editingStats.rank,
        points: editingStats.points,
        seed: editingStats.seed,
        bio: editingStats.bio,
        prestasi_terakhir: editingStats.prestasi
      };

      const { data: existing } = await supabase.from('atlet_stats').select('id').eq('pendaftaran_id', editingStats.id).single();

      if (existing) {
        await supabase.from('atlet_stats').update(statsPayload).eq('pendaftaran_id', editingStats.id);
      } else {
        await supabase.from('atlet_stats').insert([statsPayload]);
      }

      await supabase.from('rankings').upsert({
        player_name: editingStats.nama,
        category: editingStats.kategori,
        seed: editingStats.seed,
        total_points: editingStats.points
      }, { onConflict: 'player_name' });

      await fetchAtlets();
      setNotifMessage("Data Atlet Disinkronkan!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsEditModalOpen(false);
      setSelectedAtlet(null);
    } catch (err) {
      console.error(err);
      alert("Gagal sinkronisasi data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAtlet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data: pendaftaran, error: pError } = await supabase
        .from('pendaftaran')
        .insert([{
          nama: newAtlet.nama,
          kategori: newAtlet.kategori,
          foto_url: newAtlet.foto_url,
          domisili: 'Internal',
          whatsapp: '0'
        }])
        .select()
        .single();

      if (pError) throw pError;

      await supabase.from('atlet_stats').insert([{
        pendaftaran_id: pendaftaran.id,
        rank: newAtlet.rank,
        points: newAtlet.points,
        seed: newAtlet.seed,
        bio: newAtlet.bio,
        prestasi_terakhir: newAtlet.prestasi
      }]);

      await fetchAtlets();
      setIsAddModalOpen(false);
      setNewAtlet({ nama: '', kategori: "MEN'S SINGLE", seed: 'UNSEEDED', points: 0, rank: 0, bio: '', prestasi: 'CONTENDER', foto_url: '' });
      setNotifMessage("Atlet Baru Ditambahkan!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Gagal menambah atlet");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAtlets = atlets.filter(a => a.nama.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentItems = filteredAtlets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] font-sans relative overflow-hidden">
      {/* HEADER */}
      <div className="flex-shrink-0 p-4 md:p-8 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-blue-600 animate-pulse" />
                <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase">Pro Database System</p>
              </div>
              <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">
                Manajemen <span className="text-blue-600">Atlet</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-slate-900 text-white px-6 py-4 rounded-2xl flex items-center gap-3 font-black text-[10px] tracking-widest transition-all shadow-lg"
               >
                 <Plus size={18} /> TAMBAH ATLET
               </button>
               <div className="bg-white px-8 py-4 rounded-[2rem] shadow-xl border border-slate-100 flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{atlets.length}</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={22} />
            <input 
              type="text"
              placeholder="CARI NAMA ATLET..."
              className="w-full pl-14 pr-8 py-5 bg-white rounded-[2rem] border-none shadow-sm focus:ring-4 focus:ring-blue-100 transition-all font-black uppercase text-sm tracking-widest placeholder:text-slate-300"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* GRID KONTEN */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20">
        <div className="max-w-7xl mx-auto pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full py-32 text-center">
                 <Loader2 className="animate-spin m-auto text-blue-600 mb-4" size={40} />
                 <p className="font-black text-slate-300 uppercase italic tracking-[0.3em]">Mengakses Server...</p>
              </div>
            ) : currentItems.map((atlet) => (
              <div 
                key={atlet.id}
                onClick={() => setSelectedAtlet(atlet)}
                className="bg-white p-4 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group border border-slate-100 relative overflow-hidden"
              >
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-5 bg-slate-100 shadow-inner">
                  {atlet.foto_url ? (
                    <img src={atlet.foto_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={atlet.nama} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200"><User className="text-slate-400" size={60} /></div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xl text-white text-[9px] font-black px-4 py-1.5 rounded-full border border-white/20 uppercase">
                    #{atlet.rank || '??'} GLOBAL
                  </div>
                </div>
                <div className="px-2">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{atlet.kategori}</p>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic truncate mb-4">{atlet.nama}</h3>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Points</p>
                      <p className="text-sm font-black text-slate-900">{atlet.points.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Seed</p>
                      <p className="text-[10px] font-black text-emerald-600 uppercase">{atlet.seed}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-16 pb-10">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-4 bg-white rounded-2xl shadow-sm disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all"><ChevronLeft size={20} /></button>
              <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-12 h-12 rounded-xl font-black text-sm ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-4 bg-white rounded-2xl shadow-sm disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all"><ChevronRight size={20} /></button>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedAtlet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/5">
            <button onClick={() => setSelectedAtlet(null)} className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-red-500 text-white rounded-full transition-all"><X size={24} /></button>
            <div className="w-full md:w-[45%] h-[400px] md:h-auto relative bg-zinc-900 overflow-hidden">
              {selectedAtlet.foto_url ? (
                <img src={selectedAtlet.foto_url} className="w-full h-full object-cover" alt={selectedAtlet.nama} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={150} className="text-white/5" /></div>
              )}
              <div className="absolute bottom-10 left-10 z-20">
                 <div className="bg-blue-600 text-white text-[10px] font-black px-5 py-2 rounded-full mb-3 inline-block uppercase italic tracking-widest shadow-xl">PRO ATHLETE</div>
                 <div className="bg-amber-400 text-black font-black text-[11px] px-5 py-2 rounded-xl flex items-center gap-3 shadow-2xl italic uppercase tracking-tighter">
                   <Trophy size={16} /> {selectedAtlet.prestasi}
                 </div>
              </div>
            </div>
            <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-8">
                <div className="flex gap-2">
                  <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-lg border border-blue-600/30 uppercase italic">{selectedAtlet.kategori}</span>
                  <span className="bg-white/5 text-white/40 text-[10px] font-black px-4 py-1.5 rounded-lg border border-white/10 uppercase italic">{selectedAtlet.seed}</span>
                </div>
                <button onClick={() => { setEditingStats(selectedAtlet); setIsEditModalOpen(true); }} className="group flex items-center gap-2 text-white/30 hover:text-blue-400 text-[10px] font-black transition-all uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full hover:bg-white/5">
                  <Edit3 size={14} className="group-hover:rotate-12 transition-transform" /> UPDATE STATISTICS
                </button>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-10 leading-[0.85]">
                {selectedAtlet.nama.split(' ')[0]}<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent">{selectedAtlet.nama.split(' ').slice(1).join(' ')}</span>
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5 transition-colors">
                    <TrendingUp className="text-blue-500 mb-3" size={24} />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Global Standing</p>
                    <p className="text-3xl font-black text-white italic leading-none">#{selectedAtlet.rank}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5 transition-colors">
                    <Zap className="text-amber-500 mb-3" size={24} />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Total Points</p>
                    <p className="text-3xl font-black text-white italic leading-none">{selectedAtlet.points.toLocaleString()}</p>
                  </div>
              </div>
              <div className="bg-blue-600/5 p-8 rounded-3xl border border-blue-600/10 relative">
                  <div className="absolute -top-3 left-6 px-3 bg-blue-600 text-[9px] font-black uppercase tracking-widest italic rounded text-white py-1">Athlete Bio</div>
                  <p className="text-slate-400 text-sm leading-relaxed italic font-medium">"{selectedAtlet.bio}"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH ATLET */}
      {(isEditModalOpen || isAddModalOpen) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 my-8">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-2xl uppercase italic tracking-tighter">
                {isAddModalOpen ? 'Tambah' : 'Edit'} <span className="text-blue-600">Atlet</span>
              </h3>
              <button onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); }} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-all"><X size={24}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner group">
                   <img src={(isAddModalOpen ? newAtlet.foto_url : editingStats?.foto_url) || '/placeholder.jpg'} className="w-full h-full object-cover" alt="Avatar" />
                   <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white backdrop-blur-sm">
                      <Camera size={40} className="mb-2" />
                      <span className="font-black text-[10px] uppercase tracking-widest">Update Photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                   </label>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-relaxed">Tips: Poin akan menyesuaikan otomatis saat kategori Seed diubah.</p>
                </div>
              </div>
              <form onSubmit={isAddModalOpen ? handleAddAtlet : handleUpdateStats} className="space-y-4">
                {isAddModalOpen && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                    <input type="text" required className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black" value={newAtlet.nama} onChange={e => setNewAtlet({...newAtlet, nama: e.target.value})} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rank</label>
                    <input type="number" className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black" value={isAddModalOpen ? newAtlet.rank : editingStats?.rank} onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, rank: parseInt(e.target.value)}) : setEditingStats({...editingStats!, rank: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Points</label>
                    <input type="number" className="w-full px-5 py-3 bg-blue-50 text-blue-700 rounded-xl border-2 border-blue-100 font-black" value={isAddModalOpen ? newAtlet.points : editingStats?.points} onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, points: parseInt(e.target.value)}) : setEditingStats({...editingStats!, points: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seed Category</label>
                    <select 
                      className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black uppercase"
                      value={isAddModalOpen ? newAtlet.seed : editingStats?.seed}
                      onChange={e => handleSeedUpdate(e.target.value, isAddModalOpen ? 'add' : 'edit')}
                    >
                      {Object.keys(SEED_STANDARDS).map(seed => (
                        <option key={seed} value={seed}>{seed}</option>
                      ))}
                    </select>
                </div>
                {isAddModalOpen && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Tanding</label>
                    <select className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black" value={newAtlet.kategori} onChange={e => setNewAtlet({...newAtlet, kategori: e.target.value})}>
                      <option value="MEN'S SINGLE">MEN'S SINGLE</option>
                      <option value="WOMEN'S SINGLE">WOMEN'S SINGLE</option>
                      <option value="MEN'S DOUBLE">MEN'S DOUBLE</option>
                      <option value="WOMEN'S DOUBLE">WOMEN'S DOUBLE</option>
                    </select>
                  </div>
                )}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Achievements</label>
                    <input type="text" className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black italic uppercase" value={isAddModalOpen ? newAtlet.prestasi : editingStats?.prestasi} onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, prestasi: e.target.value}) : setEditingStats({...editingStats!, prestasi: e.target.value})} />
                </div>
                <button disabled={isSaving} className="w-full py-5 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all">
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                  {isAddModalOpen ? 'Register Athlete' : 'Update Stats'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CROP MODAL (Z-INDEX TERTINGGI 300) */}
      {imageToCrop && (
        <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center p-6 backdrop-blur-2xl">
           <div className="w-full max-w-2xl relative aspect-[3/4] bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
           </div>
           <div className="mt-10 w-full max-w-xl">
              <div className="flex items-center gap-6 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Zoom Control</span>
                <input type="range" value={zoom} min={1} max={3} step={0.1} className="w-full accent-blue-600 h-1 bg-white/20 rounded-full appearance-none" onChange={(e) => setZoom(Number(e.target.value))} />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setImageToCrop(null)} className="flex-1 py-5 bg-white/10 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-white/20 transition-all border border-white/5">Cancel</button>
                <button 
                  onClick={executeCropAndUpload} 
                  disabled={isCropping} 
                  className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-blue-500 transition-all active:scale-95"
                >
                  {isCropping ? <Loader2 className="animate-spin" size={18}/> : <Scissors size={18}/>}
                  Confirm & Upload
                </button>
              </div>
           </div>
        </div>
      )}

      {/* NOTIFICATION (Z-INDEX 400) */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[400] transition-all duration-700 transform ${showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-blue-500/50 px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 min-w-[380px] overflow-hidden relative">
          <div className="absolute bottom-0 left-0 h-1 bg-blue-600" style={{ width: showSuccess ? '100%' : '0%', transition: 'width 3s linear' }} />
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg animate-bounce"><Zap size={24} className="text-white fill-white" /></div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-xl italic leading-none mb-1">{notifMessage}</h4>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Database Updated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { supabase } from "./supabase";
import { 
  Search, User, X, Award, TrendingUp, Users, 
  MapPin, Phone, ShieldCheck, Star, Trophy, Save, Loader2, Edit3,
  ChevronLeft, ChevronRight, Zap, Sparkles, RefreshCcw, Camera, Scissors, Plus
} from 'lucide-react';

// --- STANDAR POIN BERDASARKAN SEED ---
const SEED_STANDARDS: Record<string, number> = {
  'SEED A': 10000,
  'SEED B+': 8500,
  'SEED B': 7500,
  'SEED C': 6825,
  'QUALIFIER': 500,
  'UNSEEDED': 0
};

// --- DEFINISI KATEGORI ---
const KATEGORI_UMUM = [
  "TUNGGAL PUTRA (MS)",
  "TUNGGAL PUTRI (WS)",
  "GANDA PUTRA (MD)",
  "GANDA PUTRI (WD)",
  "GANDA CAMPURAN (XD)"
];

const KATEGORI_KHUSUS = [
  "TARUNA / MUDA",
  "DEWASA / SENIOR",
  "VETERAN"
];

interface Registrant {
  id: string;
  nama: string;
  whatsapp: string;
  kategori: string;
  kategori_khusus?: string; // Kolom baru
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

  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStats, setEditingStats] = useState<Partial<Registrant> | null>(null);
  const [newAtlet, setNewAtlet] = useState<Partial<Registrant>>({
    nama: '', 
    kategori: "TUNGGAL PUTRA (MS)", 
    kategori_khusus: "DEWASA / SENIOR",
    seed: 'UNSEEDED', 
    points: 0, 
    rank: 0, 
    bio: '', 
    prestasi: 'CONTENDER', 
    foto_url: ''
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

  // --- LOGIKA UPLOAD KE BUCKET "foto" ---
  const executeCropAndUpload = async () => {
    if (!croppedAreaPixels || !imageToCrop) return;
    
    setIsCropping(true);
    try {
      const image = new Image();
      image.src = imageToCrop;
      await new Promise(res => image.onload = res);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

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
      if (!blob) return;

      const fileName = `${Date.now()}-atlet.jpg`;
      const filePath = `atlet_photos/${fileName}`;

      // Memastikan menggunakan bucket 'foto'
      const { error: uploadError } = await supabase.storage
        .from('foto') 
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('foto').getPublicUrl(filePath);

      if (isAddModalOpen) {
        setNewAtlet({ ...newAtlet, foto_url: publicUrl });
      } else if (editingStats) {
        setEditingStats({ ...editingStats, foto_url: publicUrl });
        await supabase.from('pendaftaran').update({ foto_url: publicUrl }).eq('id', editingStats.id);
      }

      setImageToCrop(null);
      setNotifMessage("Foto Berhasil Diunggah!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error Upload: ${err.message}`);
    } finally {
      setIsCropping(false);
    }
  };

  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStats || !editingStats.id) return;
    setIsSaving(true);
    try {
      // Update data utama (Kategori)
      await supabase.from('pendaftaran').update({
        kategori: editingStats.kategori,
        kategori_khusus: editingStats.kategori_khusus
      }).eq('id', editingStats.id);

      // Update data statistik
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

      await fetchAtlets();
      setNotifMessage("Data Atlet Diperbarui!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsEditModalOpen(false);
      setSelectedAtlet(null);
    } catch (err) {
      console.error(err);
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
          kategori_khusus: newAtlet.kategori_khusus,
          foto_url: newAtlet.foto_url,
          domisili: 'Internal',
          whatsapp: '0'
        }])
        .select().single();

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
      setNewAtlet({ nama: '', kategori: "TUNGGAL PUTRA (MS)", seed: 'UNSEEDED', points: 0, rank: 0, bio: '', prestasi: 'CONTENDER', foto_url: '' });
      setNotifMessage("Atlet Berhasil Ditambahkan!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
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
      {/* HEADER SECTION */}
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
               <div className="bg-white px-8 py-4 rounded-[2rem] shadow-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Total Database</p>
                    <p className="text-2xl font-black text-slate-900 leading-none text-center">{atlets.length}</p>
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

      {/* ATHLETE GRID */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20">
        <div className="max-w-7xl mx-auto pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full py-32 text-center">
                 <Loader2 className="animate-spin m-auto text-blue-600 mb-4" size={40} />
                 <p className="font-black text-slate-300 uppercase italic tracking-[0.3em]">Sinkronisasi Data...</p>
              </div>
            ) : currentItems.map((atlet) => (
              <div 
                key={atlet.id}
                onClick={() => setSelectedAtlet(atlet)}
                className="bg-white p-4 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group border border-slate-100 relative"
              >
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-5 bg-slate-100">
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
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{atlet.kategori_khusus || 'DEWASA'}</p>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic truncate mb-3">{atlet.nama}</h3>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Points</p>
                      <p className="text-sm font-black text-slate-900">{atlet.points.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Seed</p>
                      <p className="text-[10px] font-black text-emerald-600 uppercase italic">{atlet.seed}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedAtlet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/5">
            <button onClick={() => setSelectedAtlet(null)} className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-red-500 text-white rounded-full transition-all"><X size={24} /></button>
            <div className="w-full md:w-[45%] h-[400px] md:h-auto relative bg-zinc-900 overflow-hidden">
              {selectedAtlet.foto_url ? (
                <img src={selectedAtlet.foto_url} className="w-full h-full object-cover" alt={selectedAtlet.nama} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={150} className="text-white/5" /></div>
              )}
            </div>
            <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center">
              <div className="flex gap-2 mb-6">
                <span className="bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-lg uppercase italic tracking-widest">{selectedAtlet.kategori}</span>
                <span className="bg-white/10 text-white/60 text-[9px] font-black px-4 py-1.5 rounded-lg uppercase italic tracking-widest">{selectedAtlet.kategori_khusus}</span>
              </div>
              <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-10 leading-none">
                {selectedAtlet.nama}
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <TrendingUp className="text-blue-500 mb-2" size={24} />
                    <p className="text-[9px] font-black text-white/20 uppercase mb-1 tracking-widest">Rank</p>
                    <p className="text-3xl font-black text-white italic leading-none">#{selectedAtlet.rank}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <Zap className="text-amber-500 mb-2" size={24} />
                    <p className="text-[9px] font-black text-white/20 uppercase mb-1 tracking-widest">Points</p>
                    <p className="text-3xl font-black text-white italic leading-none">{selectedAtlet.points.toLocaleString()}</p>
                  </div>
              </div>
              <button onClick={() => { setEditingStats(selectedAtlet); setIsEditModalOpen(true); }} className="w-fit flex items-center gap-3 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-400/20 px-6 py-3 rounded-full hover:bg-blue-400 hover:text-white transition-all">
                <Edit3 size={14} /> Update Athlete Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / ADD MODAL */}
      {(isEditModalOpen || isAddModalOpen) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden my-8">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-2xl uppercase italic tracking-tighter">
                {isAddModalOpen ? 'Tambah' : 'Edit'} <span className="text-blue-600">Atlet</span>
              </h3>
              <button onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); }} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-all"><X size={24}/></button>
            </div>
            
            <div className="p-10">
              <form onSubmit={isAddModalOpen ? handleAddAtlet : handleUpdateStats} className="space-y-6">
                
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3">
                    <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 shadow-inner group">
                      <img src={(isAddModalOpen ? newAtlet.foto_url : editingStats?.foto_url) || '/placeholder.jpg'} className="w-full h-full object-cover" alt="Upload" />
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white">
                        <Camera size={30} className="mb-2" />
                        <span className="font-black text-[9px] uppercase">Ganti Foto</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    {isAddModalOpen && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                        <input type="text" required className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black" value={newAtlet.nama} onChange={e => setNewAtlet({...newAtlet, nama: e.target.value})} />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Umum</label>
                        <select 
                          className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black text-[11px]"
                          value={isAddModalOpen ? newAtlet.kategori : editingStats?.kategori}
                          onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, kategori: e.target.value}) : setEditingStats({...editingStats!, kategori: e.target.value})}
                        >
                          {KATEGORI_UMUM.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Khusus</label>
                        <select 
                          className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black text-[11px]"
                          value={isAddModalOpen ? newAtlet.kategori_khusus : editingStats?.kategori_khusus}
                          onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, kategori_khusus: e.target.value}) : setEditingStats({...editingStats!, kategori_khusus: e.target.value})}
                        >
                          {KATEGORI_KHUSUS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seed</label>
                        <select 
                          className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black text-[11px]"
                          value={isAddModalOpen ? newAtlet.seed : editingStats?.seed}
                          onChange={e => handleSeedUpdate(e.target.value, isAddModalOpen ? 'add' : 'edit')}
                        >
                          {Object.keys(SEED_STANDARDS).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rank</label>
                        <input type="number" className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black" value={isAddModalOpen ? newAtlet.rank : editingStats?.rank} onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, rank: parseInt(e.target.value)}) : setEditingStats({...editingStats!, rank: parseInt(e.target.value)})} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Achievements / Prestasi Terakhir</label>
                  <input type="text" className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black italic uppercase" value={isAddModalOpen ? newAtlet.prestasi : editingStats?.prestasi} onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, prestasi: e.target.value}) : setEditingStats({...editingStats!, prestasi: e.target.value})} />
                </div>

                <button disabled={isSaving} className="w-full py-5 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all">
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                  {isAddModalOpen ? 'DAFTARKAN ATLET SEKARANG' : 'SIMPAN PERUBAHAN'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CROPPER OVERLAY */}
      {imageToCrop && (
        <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center p-6 backdrop-blur-2xl">
           <div className="w-full max-w-2xl relative aspect-[3/4] bg-zinc-900 rounded-[3rem] overflow-hidden">
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
           <div className="mt-10 flex gap-4 w-full max-w-xl">
              <button onClick={() => setImageToCrop(null)} className="flex-1 py-5 bg-white/10 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest">Batal</button>
              <button onClick={executeCropAndUpload} disabled={isCropping} className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center justify-center gap-3">
                {isCropping ? <Loader2 className="animate-spin" size={18}/> : <Scissors size={18}/>} Potong & Simpan
              </button>
           </div>
        </div>
      )}

      {/* SUCCESS NOTIFICATION */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[400] transition-all duration-700 transform ${showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
        <div className="bg-slate-900 text-white px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6">
          <Zap size={24} className="text-blue-500 fill-blue-500" />
          <h4 className="font-black uppercase tracking-tighter text-lg italic">{notifMessage}</h4>
        </div>
      </div>
    </div>
  );
}
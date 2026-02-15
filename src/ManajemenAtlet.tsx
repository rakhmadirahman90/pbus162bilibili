import React, { useEffect, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { supabase } from "./supabase";
import { 
  Search, User, X, Award, TrendingUp, Users, 
  MapPin, Phone, ShieldCheck, Star, Trophy, Save, Loader2, Edit3,
  ChevronLeft, ChevronRight, Zap, Sparkles, RefreshCcw, Camera, Scissors, Plus
} from 'lucide-react';

// --- STANDAR SEED & POIN PBSI (Simulasi) ---
const PBSI_STANDARDS: Record<string, number> = {
  'UTAMA': 12000,
  'PRATAMA': 8500,
  'UNGGULAN 1': 7000,
  'UNGGULAN 2': 6000,
  'NON-SEEDED': 500
};

interface Registrant {
  id: string;
  nama: string;
  whatsapp: string;
  kategori: string; // Umum (Tunggal Putra, dll)
  kategori_umur: string; // Khusus (Senior/Muda)
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
    nama: '',
    kategori: 'TUNGGAL PUTRA',
    kategori_umur: 'SENIOR',
    seed: 'NON-SEEDED',
    points: 500,
    rank: 0,
    bio: '',
    prestasi: 'CONTENDER'
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // --- STATES FOR IMAGE CROPPER ---
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchAtlets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select(`*, atlet_stats (rank, points, seed, bio, prestasi_terakhir, kategori_umur)`)
        .order('nama', { ascending: true });
      
      if (error) throw error;

      if (data) {
        const formattedData = data.map((item: any) => ({
          ...item,
          rank: item.atlet_stats?.[0]?.rank || 0,
          points: item.atlet_stats?.[0]?.points || 0,
          seed: item.atlet_stats?.[0]?.seed || 'NON-SEEDED',
          kategori_umur: item.atlet_stats?.[0]?.kategori_umur || 'SENIOR',
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

  const handleSeedChange = (val: string, type: 'edit' | 'add') => {
    const points = PBSI_STANDARDS[val] || 0;
    if (type === 'edit') {
      setEditingStats({ ...editingStats!, seed: val, points });
    } else {
      setNewAtlet({ ...newAtlet, seed: val, points });
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

  const executeCropAndUpload = async () => {
    const targetId = isAddModalOpen ? 'new' : editingStats?.id;
    if (!croppedAreaPixels || !imageToCrop || !targetId) return;
    
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

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const fileName = `${Date.now()}-atlet.jpg`;
        const filePath = `atlet_photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('foto')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('foto').getPublicUrl(filePath);

        if (isAddModalOpen) {
          setNewAtlet({ ...newAtlet, foto_url: publicUrl });
        } else {
          setEditingStats({ ...editingStats!, foto_url: publicUrl });
          await supabase.from('pendaftaran').update({ foto_url: publicUrl }).eq('id', editingStats!.id);
        }

        setImageToCrop(null);
        setNotifMessage("Foto Berhasil Diperbarui!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }, 'image/jpeg');

    } catch (err) {
      console.error(err);
      alert("Gagal memproses gambar");
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
        kategori_umur: editingStats.kategori_umur,
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
      setNotifMessage("Data Atlet Terupdate!");
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
                <ShieldCheck size={18} className="text-blue-600" />
                <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase">Sistem Informasi Atlet PBSI</p>
              </div>
              <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">
                Database <span className="text-blue-600">Atlet</span>
              </h1>
            </div>
            <div className="flex gap-4">
              <div className="bg-white px-8 py-4 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{atlets.length}</p>
                  </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
            <input 
              type="text"
              placeholder="CARI NAMA ATLET..."
              className="w-full pl-14 pr-8 py-5 bg-white rounded-[2rem] border-none shadow-sm focus:ring-4 focus:ring-blue-100 transition-all font-black uppercase text-sm tracking-widest"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20">
        <div className="max-w-7xl mx-auto pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full py-32 text-center text-slate-300 font-black uppercase tracking-widest italic">Syncing with server...</div>
            ) : currentItems.map((atlet) => (
              <div 
                key={atlet.id}
                onClick={() => setSelectedAtlet(atlet)}
                className="bg-white p-4 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group border border-slate-100 relative overflow-hidden"
              >
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-5 bg-slate-100">
                  {atlet.foto_url ? (
                    <img src={atlet.foto_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={atlet.nama} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400"><User size={60} /></div>
                  )}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xl text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase">
                    {atlet.kategori_umur}
                  </div>
                </div>
                <div className="px-2">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{atlet.kategori}</p>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic truncate mb-4">{atlet.nama}</h3>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Points</p>
                      <p className="text-sm font-black text-slate-900">{atlet.points.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Seed</p>
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
          <div className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-[3rem] overflow-hidden flex flex-col md:flex-row border border-white/5">
            <button onClick={() => setSelectedAtlet(null)} className="absolute top-8 right-8 z-50 p-3 bg-white/5 text-white rounded-full hover:bg-red-500"><X size={24} /></button>
            <div className="w-full md:w-[45%] h-[400px] md:h-auto bg-zinc-900">
              {selectedAtlet.foto_url ? (
                <img src={selectedAtlet.foto_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={150} className="text-white/5" /></div>
              )}
            </div>
            <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center">
              <div className="flex gap-2 mb-8">
                <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-lg uppercase italic">{selectedAtlet.kategori}</span>
                <span className="bg-white/10 text-white/50 text-[10px] font-black px-4 py-1.5 rounded-lg uppercase italic">{selectedAtlet.kategori_umur}</span>
              </div>
              <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-8">{selectedAtlet.nama}</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">PBSI Points</p>
                    <p className="text-3xl font-black text-white italic">{selectedAtlet.points.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Seed Rank</p>
                    <p className="text-3xl font-black text-blue-500 italic uppercase">{selectedAtlet.seed}</p>
                  </div>
              </div>
              <div className="bg-blue-600/5 p-8 rounded-3xl border border-blue-600/10 mb-8">
                  <p className="text-slate-400 text-sm italic">"{selectedAtlet.bio}"</p>
              </div>
              <button onClick={() => { setEditingStats(selectedAtlet); setIsEditModalOpen(true); }} className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl border border-white/10 flex items-center justify-center gap-3">
                <Edit3 size={16} /> Edit Data Performance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingStats && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden my-8">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-2xl uppercase italic tracking-tighter">Edit <span className="text-blue-600">Atlet Profile</span></h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full"><X size={24}/></button>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 group">
                   <img src={editingStats.foto_url || '/placeholder.jpg'} className="w-full h-full object-cover" alt="" />
                   <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white">
                      <Camera size={40} className="mb-2" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                   </label>
                </div>
              </div>
              <form onSubmit={handleUpdateStats} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Umum (PBSI)</label>
                  <select className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black uppercase" value={editingStats.kategori} onChange={e => setEditingStats({...editingStats!, kategori: e.target.value})}>
                    <option value="TUNGGAL PUTRA">TUNGGAL PUTRA</option>
                    <option value="TUNGGAL PUTRI">TUNGGAL PUTRI</option>
                    <option value="GANDA PUTRA">GANDA PUTRA</option>
                    <option value="GANDA PUTRI">GANDA PUTRI</option>
                    <option value="GANDA CAMPURAN">GANDA CAMPURAN</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Umur</label>
                  <select className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black uppercase" value={editingStats.kategori_umur} onChange={e => setEditingStats({...editingStats!, kategori_umur: e.target.value})}>
                    <option value="SENIOR">SENIOR</option>
                    <option value="MUDA">MUDA (U-19)</option>
                    <option value="REMAJA">REMAJA (U-17)</option>
                    <option value="PEMULA">PEMULA (U-15)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standar Seed</label>
                  <select className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black uppercase" value={editingStats.seed} onChange={e => handleSeedChange(e.target.value, 'edit')}>
                    {Object.keys(PBSI_STANDARDS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Poin Otomatis</label>
                    <input type="number" className="w-full px-5 py-3 bg-blue-50 text-blue-600 rounded-xl font-black" value={editingStats.points} readOnly />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</label>
                    <input type="number" className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black" value={editingStats.rank} onChange={e => setEditingStats({...editingStats!, rank: parseInt(e.target.value)})} />
                  </div>
                </div>
                <button disabled={isSaving} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3">
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} UPDATE DATABASE
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CROPPER MODAL */}
      {imageToCrop && (
        <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center p-6 backdrop-blur-2xl">
           <div className="w-full max-w-2xl relative aspect-[3/4] bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl">
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
              <input type="range" value={zoom} min={1} max={3} step={0.1} className="w-full mb-8 h-1 bg-white/20 rounded-full appearance-none accent-blue-600" onChange={(e) => setZoom(Number(e.target.value))} />
              <div className="flex gap-4">
                <button onClick={() => setImageToCrop(null)} className="flex-1 py-5 bg-white/10 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-white/20">Cancel</button>
                <button onClick={executeCropAndUpload} disabled={isCropping} className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-blue-500">
                  {isCropping ? <Loader2 className="animate-spin" size={18}/> : <Scissors size={18}/>} Confirm & Upload
                </button>
              </div>
           </div>
        </div>
      )}

      {/* NOTIFICATION */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[400] transition-all duration-700 transform ${showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-blue-500/50 px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 min-w-[380px]">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg animate-bounce"><Zap size={24} className="text-white fill-white" /></div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-xl italic leading-none mb-1">{notifMessage}</h4>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Sync Complete</p>
          </div>
        </div>
      </div>
    </div>
  );
}
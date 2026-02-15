import React, { useEffect, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { supabase } from "./supabase";
import { 
  Search, User, X, Award, TrendingUp, Users, 
  MapPin, Phone, ShieldCheck, Star, Trophy, Save, Loader2, Edit3,
  ChevronLeft, ChevronRight, Zap, Sparkles, RefreshCcw, Camera, Scissors, Plus
} from 'lucide-react';

// STANDAR POIN OTOMATIS BERDASARKAN SEED
const SEED_STANDARDS: Record<string, number> = {
  'SEED A': 10000,
  'SEED B+': 8500,
  'SEED B': 7500,
  'SEED C': 6825,
  'QUALIFIER': 500,
  'UNSEEDED': 0
};

// KATEGORI UMUM
const KATEGORI_UMUM = [
  "TUNGGAL PUTRA (MS)",
  "TUNGGAL PUTRI (WS)",
  "GANDA PUTRA (MD)",
  "GANDA PUTRI (WD)",
  "GANDA CAMPURAN (XD)"
];

// STATUS KHUSUS
const STATUS_KHUSUS = ["SENIOR", "MUDA (YOUTH)"];

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
  status_umur: string; 
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
    kategori: "TUNGGAL PUTRA (MS)",
    seed: 'UNSEEDED',
    points: 0,
    rank: 0,
    bio: '',
    prestasi: 'CONTENDER',
    foto_url: '',
    status_umur: 'SENIOR'
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // --- IMAGE CROPPER STATES ---
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
      // Perbaikan Query: Mengambil data pendaftaran dengan join atlet_stats
      const { data, error } = await supabase
        .from('pendaftaran')
        .select(`
          *,
          atlet_stats (
            rank, 
            points, 
            seed, 
            bio, 
            prestasi_terakhir, 
            status_umur
          )
        `);
      
      if (error) throw error;

      if (data) {
        const formattedData = data.map((item: any) => {
          // Ambil data stats (mengatasi jika stats kosong atau berbentuk array)
          const stats = Array.isArray(item.atlet_stats) ? item.atlet_stats[0] : item.atlet_stats;
          
          return {
            ...item,
            rank: stats?.rank || 0,
            points: stats?.points || 0,
            seed: stats?.seed || 'UNSEEDED',
            bio: stats?.bio || "Data profil belum dilengkapi.",
            prestasi: stats?.prestasi_terakhir || "CONTENDER",
            status_umur: stats?.status_umur || "SENIOR"
          };
        });
        
        // Sorting berdasarkan poin tertinggi
        const sortedByPoints = formattedData.sort((a, b) => b.points - a.points);
        setAtlets(sortedByPoints);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setNotifMessage("Gagal Memuat Data!");
      setShowSuccess(true);
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

  const executeCropAndUpload = async () => {
    if (!croppedAreaPixels || !imageToCrop) return;
    
    setIsCropping(true);
    try {
      const image = new Image();
      image.src = imageToCrop;
      await new Promise((resolve) => image.onload = resolve);

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

      // Menggunakan bucket 'foto'
      const { error: uploadError } = await supabase.storage
        .from('foto')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('foto').getPublicUrl(filePath);

      if (isAddModalOpen) {
        setNewAtlet(prev => ({ ...prev, foto_url: publicUrl }));
      } else if (editingStats) {
        setEditingStats(prev => ({ ...prev!, foto_url: publicUrl }));
        // Update langsung di tabel pendaftaran untuk foto
        await supabase.from('pendaftaran').update({ foto_url: publicUrl }).eq('id', editingStats.id);
      }

      setImageToCrop(null);
      setNotifMessage("Foto Berhasil Diperbarui!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error Upload: ${err.message}. Pastikan bucket 'foto' tersedia di Supabase Storage.`);
    } finally {
      setIsCropping(false);
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
        .select().single();

      if (pError) throw pError;

      await supabase.from('atlet_stats').insert([{
        pendaftaran_id: pendaftaran.id,
        rank: newAtlet.rank,
        points: newAtlet.points,
        seed: newAtlet.seed,
        bio: newAtlet.bio,
        prestasi_terakhir: newAtlet.prestasi,
        status_umur: newAtlet.status_umur
      }]);

      await fetchAtlets();
      setIsAddModalOpen(false);
      setNewAtlet({ nama: '', kategori: "TUNGGAL PUTRA (MS)", seed: 'UNSEEDED', points: 0, rank: 0, bio: '', prestasi: 'CONTENDER', foto_url: '', status_umur: 'SENIOR' });
      setNotifMessage("Atlet Berhasil Diregistrasi!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Gagal menambah atlet");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStats?.id) return;
    setIsSaving(true);
    try {
      // 1. Update data dasar di tabel pendaftaran
      await supabase.from('pendaftaran').update({
        nama: editingStats.nama,
        kategori: editingStats.kategori
      }).eq('id', editingStats.id);

      // 2. Update atau Insert di tabel atlet_stats
      const statsPayload = {
        pendaftaran_id: editingStats.id,
        rank: editingStats.rank,
        points: editingStats.points,
        seed: editingStats.seed,
        bio: editingStats.bio,
        prestasi_terakhir: editingStats.prestasi,
        status_umur: editingStats.status_umur
      };

      const { data: existing } = await supabase
        .from('atlet_stats')
        .select('id')
        .eq('pendaftaran_id', editingStats.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('atlet_stats').update(statsPayload).eq('pendaftaran_id', editingStats.id);
      } else {
        await supabase.from('atlet_stats').insert([statsPayload]);
      }

      await fetchAtlets();
      setNotifMessage("Statistik Berhasil Disinkron!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Gagal Sinkron Data");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAtlets = atlets.filter(a => a.nama?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);
  const currentItems = filteredAtlets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                 <Plus size={18} /> TAMBAH ATLET BARU
               </button>
               <button 
                onClick={fetchAtlets}
                className="bg-white hover:bg-slate-100 text-slate-900 p-4 rounded-2xl flex items-center shadow-sm border border-slate-100 transition-all"
               >
                 <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
               </button>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={22} />
            <input 
              type="text"
              placeholder="CARI NAMA ATLET..."
              className="w-full pl-14 pr-8 py-5 bg-white rounded-[2rem] border-none shadow-sm focus:ring-4 focus:ring-blue-100 transition-all font-black uppercase text-sm tracking-widest"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* GRID ATLET */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20">
        <div className="max-w-7xl mx-auto pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full py-32 text-center">
                 <Loader2 className="animate-spin m-auto text-blue-600 mb-4" size={40} />
                 <p className="font-black text-slate-300 uppercase italic tracking-[0.3em]">Mengakses Server...</p>
              </div>
            ) : currentItems.length === 0 ? (
                <div className="col-span-full py-32 text-center">
                    <Users className="m-auto text-slate-200 mb-4" size={60} />
                    <p className="font-black text-slate-300 uppercase italic tracking-[0.3em]">Data Atlet Tidak Ditemukan</p>
                </div>
            ) : currentItems.map((atlet) => (
              <div 
                key={atlet.id}
                onClick={() => {
                    setEditingStats(atlet);
                    setIsEditModalOpen(true);
                }}
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
                  <div className="absolute bottom-4 right-4 bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-lg uppercase italic shadow-lg">
                    {atlet.status_umur}
                  </div>
                </div>
                <div className="px-2">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{atlet.kategori}</p>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic truncate mb-4">{atlet.nama}</h3>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Points</p>
                      <p className="text-sm font-black text-slate-900">{atlet.points?.toLocaleString()}</p>
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

          {/* PAGINATION */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-16 pb-10">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-4 bg-white rounded-2xl shadow-sm disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all border border-slate-100"><ChevronLeft size={20} /></button>
              <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-12 h-12 rounded-xl font-black text-sm transition-all ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-4 bg-white rounded-2xl shadow-sm disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all border border-slate-100"><ChevronRight size={20} /></button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL ADD / EDIT */}
      {(isEditModalOpen || isAddModalOpen) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 my-8">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-2xl uppercase italic tracking-tighter">
                {isAddModalOpen ? 'Registrasi' : 'Update'} <span className="text-blue-600">Atlet</span>
              </h3>
              <button onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); }} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-all"><X size={24}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner group">
                   <img src={(isAddModalOpen ? newAtlet.foto_url : editingStats?.foto_url) || 'https://via.placeholder.com/300x400?text=NO+IMAGE'} className="w-full h-full object-cover" alt="Avatar" />
                   <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white backdrop-blur-sm">
                      <Camera size={40} className="mb-2" />
                      <span className="font-black text-[10px] uppercase tracking-widest">Ganti Foto</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                   </label>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-relaxed">Sistem akan otomatis menghitung poin berdasarkan kategori Seed yang Anda pilih.</p>
                </div>
              </div>
              <form onSubmit={isAddModalOpen ? handleAddAtlet : handleUpdateStats} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black" 
                    value={isAddModalOpen ? newAtlet.nama : editingStats?.nama} 
                    onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, nama: e.target.value}) : setEditingStats({...editingStats!, nama: e.target.value})} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rank</label>
                    <input type="number" className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black" value={isAddModalOpen ? newAtlet.rank : editingStats?.rank} onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, rank: parseInt(e.target.value)}) : setEditingStats({...editingStats!, rank: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Poin Otomatis</label>
                    <input type="number" className="w-full px-5 py-3 bg-blue-50 text-blue-700 rounded-xl border-2 border-blue-100 font-black" value={isAddModalOpen ? newAtlet.points : editingStats?.points} readOnly />
                  </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Seed</label>
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
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Tanding</label>
                    <select 
                      className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black uppercase"
                      value={isAddModalOpen ? newAtlet.kategori : editingStats?.kategori}
                      onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, kategori: e.target.value}) : setEditingStats({...editingStats!, kategori: e.target.value})}
                    >
                      {KATEGORI_UMUM.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Umur</label>
                    <select 
                      className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black uppercase"
                      value={isAddModalOpen ? newAtlet.status_umur : editingStats?.status_umur}
                      onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, status_umur: e.target.value}) : setEditingStats({...editingStats!, status_umur: e.target.value})}
                    >
                      {STATUS_KHUSUS.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prestasi</label>
                    <input type="text" className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black italic uppercase" value={isAddModalOpen ? newAtlet.prestasi : editingStats?.prestasi} onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, prestasi: e.target.value}) : setEditingStats({...editingStats!, prestasi: e.target.value})} />
                </div>
                <button disabled={isSaving} className="w-full py-5 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95">
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                  {isAddModalOpen ? 'DAFTARKAN SEKARANG' : 'SIMPAN PERUBAHAN'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CROPPER MODAL */}
      {imageToCrop && (
        <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center p-6 backdrop-blur-2xl">
           <div className="w-full max-w-2xl relative aspect-[3/4] bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
              <Cropper
                image={imageToCrop}
                crop={crop} zoom={zoom} aspect={3 / 4}
                onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom}
              />
           </div>
           <div className="mt-10 w-full max-w-xl">
             <div className="flex gap-4">
               <button onClick={() => setImageToCrop(null)} className="flex-1 py-5 bg-white/10 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest">Cancel</button>
               <button 
                 onClick={executeCropAndUpload} 
                 disabled={isCropping} 
                 className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center justify-center gap-3"
               >
                 {isCropping ? <Loader2 className="animate-spin" size={18}/> : <Scissors size={18}/>}
                 POTONG & UNGGAH
               </button>
             </div>
           </div>
        </div>
      )}

      {/* SUCCESS NOTIF */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[400] transition-all duration-700 transform ${showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-blue-500/50 px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 min-w-[380px] overflow-hidden relative">
          <div className="absolute bottom-0 left-0 h-1 bg-blue-600" style={{ width: showSuccess ? '100%' : '0%', transition: 'width 3s linear' }} />
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg animate-bounce"><Zap size={24} className="text-white fill-white" /></div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-xl italic leading-none mb-1">{notifMessage}</h4>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Database Tersinkronasi</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { supabase } from "./supabase";
import { 
  Search, User, X, Award, TrendingUp, Users, 
  MapPin, Phone, ShieldCheck, Star, Trophy, Save, Loader2, Edit3,
  ChevronLeft, ChevronRight, Zap, Sparkles, RefreshCcw, Camera, Scissors, Plus
} from 'lucide-react';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // New State
  const [editingStats, setEditingStats] = useState<Partial<Registrant> | null>(null);
  const [newAtlet, setNewAtlet] = useState<Partial<Registrant>>({
    nama: '', kategori: 'Tunggal Putra', jenis_kelamin: 'Laki-laki', 
    domisili: '', whatsapp: '', seed: 'UNSEEDED', points: 0, rank: 0,
    bio: '', prestasi: 'CONTENDER'
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

  // Pilihan Kategori
  const kategoriUmum = ["Tunggal Putra", "Tunggal Putri", "Ganda Putra", "Ganda Putri", "Ganda Campuran"];
  const kategoriKhusus = ["Senior", "Muda"];

  useEffect(() => {
    fetchAtlets();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Logika Otomatisasi Poin berdasarkan Seed saat input data baru
  useEffect(() => {
    if (isAddModalOpen || isEditModalOpen) {
      const currentData = isAddModalOpen ? newAtlet : editingStats;
      const setter = isAddModalOpen ? setNewAtlet : setEditingStats;

      if (currentData?.seed === 'SEEDED 1') setter({ ...currentData, points: 1000, rank: 1 });
      else if (currentData?.seed === 'SEEDED 2') setter({ ...currentData, points: 800, rank: 2 });
      else if (currentData?.seed === 'UNSEEDED') setter({ ...currentData, points: 0 });
    }
  }, [newAtlet.seed, editingStats?.seed]);

  const fetchAtlets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select(`
          *,
          atlet_stats (
            rank,
            points,
            seed,
            bio,
            prestasi_terakhir
          )
        `)
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
        const fileExt = 'jpg';
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `atlet_photos/${fileName}`;

        // PERBAIKAN: Menggunakan bucket 'foto' sesuai permintaan
        const { error: uploadError } = await supabase.storage
          .from('foto') 
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('foto').getPublicUrl(filePath);

        if (isAddModalOpen) {
          setNewAtlet({ ...newAtlet, foto_url: publicUrl });
        } else {
          setEditingStats({ ...editingStats, foto_url: publicUrl });
        }

        setImageToCrop(null);
        setNotifMessage("Foto Berhasil Diproses!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }, 'image/jpeg');

    } catch (err) {
      console.error(err);
      alert("Gagal memproses gambar. Pastikan bucket 'foto' sudah dibuat di Supabase.");
    } finally {
      setIsCropping(false);
    }
  };

  const handleAddNewAtlet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Insert ke tabel pendaftaran
      const { data: pendaftaranData, error: pError } = await supabase
        .from('pendaftaran')
        .insert([{
          nama: newAtlet.nama,
          kategori: newAtlet.kategori,
          domisili: newAtlet.domisili,
          whatsapp: newAtlet.whatsapp,
          jenis_kelamin: newAtlet.jenis_kelamin,
          foto_url: newAtlet.foto_url
        }])
        .select()
        .single();

      if (pError) throw pError;

      // 2. Insert ke atlet_stats
      await supabase.from('atlet_stats').insert([{
        pendaftaran_id: pendaftaranData.id,
        rank: newAtlet.rank,
        points: newAtlet.points,
        seed: newAtlet.seed,
        bio: newAtlet.bio,
        prestasi_terakhir: newAtlet.prestasi
      }]);

      setNotifMessage("Atlet Berhasil Ditambahkan!");
      setShowSuccess(true);
      setIsAddModalOpen(false);
      fetchAtlets();
    } catch (err) {
      console.error(err);
      alert("Gagal menambah atlet");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStats || !editingStats.id) return;
    
    setIsSaving(true);
    try {
      const { data: existingStats } = await supabase
        .from('atlet_stats')
        .select('id')
        .eq('pendaftaran_id', editingStats.id)
        .single();

      const statsPayload = {
        pendaftaran_id: editingStats.id,
        rank: editingStats.rank,
        points: editingStats.points,
        seed: editingStats.seed,
        bio: editingStats.bio,
        prestasi_terakhir: editingStats.prestasi
      };

      if (existingStats) {
        await supabase.from('atlet_stats').update(statsPayload).eq('pendaftaran_id', editingStats.id);
      } else {
        await supabase.from('atlet_stats').insert([statsPayload]);
      }

      await supabase.from('pendaftaran').update({ foto_url: editingStats.foto_url }).eq('id', editingStats.id);

      await fetchAtlets();
      setNotifMessage("Data Berhasil Diperbarui!");
      setShowSuccess(true);
      setIsEditModalOpen(false);
      setSelectedAtlet(null);
    } catch (err) {
      console.error(err);
      alert("Gagal sinkronisasi data");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAtlets = atlets.filter(a => 
    a.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAtlets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
                className="bg-blue-600 hover:bg-black text-white px-6 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2 transition-all shadow-lg active:scale-95"
              >
                <Plus size={18} /> Tambah Atlet Baru
              </button>
              <div className="bg-white px-8 py-4 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center gap-6">
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

      {/* LIST AREA */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20 scroll-smooth">
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
                    <img src={atlet.foto_url} className="w-full h-full object-cover object-[center_25%] group-hover:scale-110 transition-transform duration-700" alt={atlet.nama} />
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
                      <p className="text-[10px] font-black text-emerald-600 italic uppercase">{atlet.seed}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL ADD / EDIT FORM (Reusable Component Logic) */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-8">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-2xl uppercase italic tracking-tighter">
                {isAddModalOpen ? 'Tambah' : 'Edit'} <span className="text-blue-600">Atlet</span>
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full"><X size={24}/></button>
            </div>
            
            <form onSubmit={isAddModalOpen ? handleAddNewAtlet : handleUpdateStats} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Kolom Kiri: Foto */}
              <div className="space-y-6">
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-inner group border-4 border-slate-50">
                   <img src={(isAddModalOpen ? newAtlet.foto_url : editingStats?.foto_url) || '/placeholder.jpg'} className="w-full h-full object-cover" alt="Preview" />
                   <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white backdrop-blur-sm">
                      <Camera size={40} className="mb-2" />
                      <span className="font-black text-[10px] uppercase tracking-widest">Upload Foto</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                   </label>
                </div>
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                  <p className="text-[10px] font-black text-amber-700 uppercase mb-2 flex items-center gap-2"><Zap size={14}/> Sistem Otomatisasi</p>
                  <p className="text-[9px] font-bold text-amber-600 leading-relaxed italic">Point & Ranking akan menyesuaikan secara otomatis saat Anda memilih kategori Seeded.</p>
                </div>
              </div>

              {/* Kolom Kanan: Data */}
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                  <input required type="text" className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-black text-slate-900" 
                    value={isAddModalOpen ? newAtlet.nama : editingStats?.nama} 
                    onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, nama: e.target.value}) : setEditingStats({...editingStats, nama: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Umum</label>
                    <select className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-black text-sm" 
                      value={isAddModalOpen ? newAtlet.kategori : editingStats?.kategori}
                      onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, kategori: e.target.value}) : setEditingStats({...editingStats, kategori: e.target.value})}
                    >
                      {kategoriUmum.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Khusus</label>
                    <select className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-black text-sm"
                      onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, prestasi: e.target.value}) : setEditingStats({...editingStats, prestasi: e.target.value})}
                    >
                      {kategoriKhusus.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seeded Status</label>
                    <select className="w-full px-6 py-4 bg-blue-600 text-white rounded-2xl border-none font-black text-sm"
                      value={isAddModalOpen ? newAtlet.seed : editingStats?.seed}
                      onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, seed: e.target.value}) : setEditingStats({...editingStats, seed: e.target.value})}
                    >
                      <option value="UNSEEDED">UNSEEDED</option>
                      <option value="SEEDED 1">SEEDED 1 (1000 Pts)</option>
                      <option value="SEEDED 2">SEEDED 2 (800 Pts)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto Rank</label>
                    <input disabled type="number" className="w-full px-6 py-4 bg-slate-200 rounded-2xl border-none font-black text-slate-500" 
                      value={isAddModalOpen ? newAtlet.rank : editingStats?.rank} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domisili / Klub</label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-bold text-slate-700" 
                    value={isAddModalOpen ? newAtlet.domisili : editingStats?.domisili}
                    onChange={e => isAddModalOpen ? setNewAtlet({...newAtlet, domisili: e.target.value}) : setEditingStats({...editingStats, domisili: e.target.value})}
                  />
                </div>

                <button disabled={isSaving} className="w-full py-6 bg-blue-600 hover:bg-black text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-slate-300 mt-4">
                  {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                  Simpan Data Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL (Original) */}
      {selectedAtlet && !isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/5">
             <button onClick={() => setSelectedAtlet(null)} className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-red-500 text-white rounded-full"><X size={24} /></button>
             <div className="w-full md:w-[45%] h-[400px] md:h-auto relative bg-zinc-900 overflow-hidden">
               {selectedAtlet.foto_url ? (
                 <img src={selectedAtlet.foto_url} className="w-full h-full object-cover" alt={selectedAtlet.nama} />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={150} className="text-white/5" /></div>
               )}
             </div>
             <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center">
               <div className="flex justify-between items-center mb-8">
                 <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-lg border border-blue-600/30 uppercase italic">{selectedAtlet.kategori}</span>
                 <button onClick={() => { setEditingStats(selectedAtlet); setIsEditModalOpen(true); }} className="flex items-center gap-2 text-white/30 hover:text-blue-400 text-[10px] font-black transition-all uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full">
                   <Edit3 size={14} /> UPDATE STATISTICS
                 </button>
               </div>
               <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-10 leading-[0.85]">
                 {selectedAtlet.nama}
               </h2>
               <div className="grid grid-cols-2 gap-4 mb-10">
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                     <TrendingUp className="text-blue-500 mb-3" size={24} />
                     <p className="text-[10px] font-black text-white/20 uppercase mb-1">Rank</p>
                     <p className="text-3xl font-black text-white italic">#{selectedAtlet.rank}</p>
                   </div>
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                     <Zap className="text-amber-500 mb-3" size={24} />
                     <p className="text-[10px] font-black text-white/20 uppercase mb-1">Points</p>
                     <p className="text-3xl font-black text-white italic">{selectedAtlet.points.toLocaleString()}</p>
                   </div>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* IMAGE CROPPER MODAL (Universal) */}
      {imageToCrop && (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6 backdrop-blur-2xl">
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
           <div className="mt-10 w-full max-w-xl flex gap-4">
              <button onClick={() => setImageToCrop(null)} className="flex-1 py-5 bg-white/10 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest">Cancel</button>
              <button onClick={executeCropAndUpload} disabled={isCropping} className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center justify-center gap-3">
                {isCropping ? <Loader2 className="animate-spin" size={18}/> : <Scissors size={18}/>}
                Confirm & Upload
              </button>
           </div>
        </div>
      )}

      {/* SUCCESS NOTIFICATION */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[250] transition-all duration-700 transform ${showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-blue-500/50 px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6">
          <div className="bg-blue-600 p-4 rounded-2xl animate-bounce"><Zap size={24} className="text-white fill-white" /></div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-xl italic leading-none mb-1">{notifMessage}</h4>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Database Synced Successfully</p>
          </div>
        </div>
      </div>
    </div>
  );
}
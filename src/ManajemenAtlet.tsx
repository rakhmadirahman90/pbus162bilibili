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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State baru untuk Tambah Atlet
  const [editingStats, setEditingStats] = useState<Partial<Registrant> | null>(null);
  const [newAtlet, setNewAtlet] = useState<Partial<Registrant>>({
    nama: '', kategori: 'TUNGGAL PUTRA', seed: 'C', points: 1000, bio: '', prestasi: 'CONTENDER', domisili: '', whatsapp: '', jenis_kelamin: 'L'
  });
  const [isSaving, setIsSaving] = useState(false);

  // --- STATES FOR IMAGE CROPPER ---
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [targetSource, setTargetSource] = useState<'edit' | 'add'>('edit');

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

  // Logika Poin Otomatis Berdasarkan Seed
  const getAutoPoints = (seed: string) => {
    switch(seed) {
      case 'A': return 10000;
      case 'B+': return 7500;
      case 'B': return 5000;
      case 'C': return 2500;
      default: return 1000;
    }
  };

  // --- LOGIKA IMAGE CROPPER ---
  const onCropComplete = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, source: 'edit' | 'add') => {
    if (e.target.files && e.target.files.length > 0) {
      setTargetSource(source);
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

        // MENGGUNAKAN BUCKET 'foto'
        const { error: uploadError } = await supabase.storage
          .from('foto')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('foto').getPublicUrl(filePath);

        if (targetSource === 'edit' && editingStats) {
          setEditingStats({ ...editingStats, foto_url: publicUrl });
          await supabase.from('pendaftaran').update({ foto_url: publicUrl }).eq('id', editingStats.id);
        } else {
          setNewAtlet({ ...newAtlet, foto_url: publicUrl });
        }

        setImageToCrop(null);
        setNotifMessage("Foto Berhasil Diproses!");
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

  // HANDLE TAMBAH ATLET BARU
  const handleAddNewAtlet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Insert ke pendaftaran
      const { data: pendaftar, error: pError } = await supabase
        .from('pendaftaran')
        .insert([{
          nama: newAtlet.nama,
          whatsapp: newAtlet.whatsapp,
          kategori: newAtlet.kategori,
          domisili: newAtlet.domisili,
          foto_url: newAtlet.foto_url,
          jenis_kelamin: newAtlet.jenis_kelamin
        }])
        .select()
        .single();

      if (pError) throw pError;

      // 2. Insert ke atlet_stats
      await supabase.from('atlet_stats').insert([{
        pendaftaran_id: pendaftar.id,
        rank: 0,
        points: newAtlet.points,
        seed: newAtlet.seed,
        bio: newAtlet.bio,
        prestasi_terakhir: newAtlet.prestasi
      }]);

      await fetchAtlets();
      setIsAddModalOpen(false);
      setNotifMessage("Atlet Baru Berhasil Ditambahkan!");
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

      await supabase
        .from('rankings')
        .upsert({
          player_name: editingStats.nama,
          category: editingStats.kategori,
          seed: editingStats.seed,
          total_points: editingStats.points
        }, { onConflict: 'player_name' });

      await fetchAtlets();
      
      setNotifMessage("Data & Ranking Tersinkronasi!");
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
              <p className="text-slate-500 font-medium text-sm">Kelola data prestasi secara realtime.</p>
            </div>

            <div className="flex items-center gap-4">
               {/* TOMBOL TAMBAH ATLET */}
               <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center gap-3 transition-all active:scale-95 group"
               >
                 <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                 <span className="font-black text-[10px] uppercase tracking-widest">Tambah Atlet Baru</span>
               </button>

               <div className="bg-white px-8 py-4 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center gap-6">
                  <div className="text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                     <p className="text-2xl font-black text-slate-900 leading-none">{atlets.length}</p>
                  </div>
                  <div className="w-[1px] h-10 bg-slate-100"></div>
                  <div className="text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Tier</p>
                     <p className="text-2xl font-black text-blue-600 leading-none">{atlets.filter(a => a.rank <= 10 && a.rank > 0).length}</p>
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

      {/* AREA SCROLLABLE */}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xl text-white text-[9px] font-black px-4 py-1.5 rounded-full border border-white/20 uppercase tracking-tighter">
                    #{atlet.rank || '??'} GLOBAL
                  </div>
                </div>

                <div className="px-2">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{atlet.kategori}</p>
                  <h3 className="text-lg font-black text-slate-900 uppercase italic truncate mb-4 leading-tight">{atlet.nama}</h3>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Points</p>
                      <p className="text-sm font-black text-slate-900 tracking-tighter">{atlet.points.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Seed</p>
                      <p className="text-[10px] font-black text-emerald-600 italic tracking-tighter uppercase">{atlet.seed}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-16 pb-10">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all"><ChevronLeft size={20} /></button>
              <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => paginate(i + 1)} className={`w-12 h-12 rounded-xl font-black text-sm transition-all ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}>{i + 1}</button>
                ))}
              </div>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all"><ChevronRight size={20} /></button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL TAMBAH ATLET BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
           <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-auto">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200"><Plus size={24}/></div>
                  <h3 className="font-black text-2xl uppercase italic tracking-tighter text-slate-900">Registrasi <span className="text-blue-600">Atlet Baru</span></h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"><X size={24}/></button>
              </div>

              <form onSubmit={handleAddNewAtlet} className="p-10">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Sisi Kiri: Foto */}
                    <div className="space-y-6">
                        <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-inner group border-4 border-slate-50">
                           {newAtlet.foto_url ? (
                             <img src={newAtlet.foto_url} className="w-full h-full object-cover" alt="Preview" />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                <Camera size={48} className="mb-4 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Pas Foto 3x4</p>
                             </div>
                           )}
                           <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white backdrop-blur-md">
                              <Plus size={32} className="mb-2" />
                              <span className="font-black text-[9px] uppercase tracking-[0.2em]">Upload Photo</span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'add')} />
                           </label>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                           <p className="text-[9px] font-black text-amber-700 uppercase leading-relaxed text-center">Pastikan foto jelas & wajah menghadap ke depan.</p>
                        </div>
                    </div>

                    {/* Sisi Kanan: Form Data */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                              <input required type="text" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-900" placeholder="CONTOH: BUDI SANTOSO" value={newAtlet.nama} onChange={e => setNewAtlet({...newAtlet, nama: e.target.value.toUpperCase()})} />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                              <input required type="tel" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-900" placeholder="0812..." value={newAtlet.whatsapp} onChange={e => setNewAtlet({...newAtlet, whatsapp: e.target.value})} />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Umum</label>
                              <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white font-black text-sm text-slate-900" value={newAtlet.kategori} onChange={e => setNewAtlet({...newAtlet, kategori: e.target.value})}>
                                 <option value="TUNGGAL PUTRA">TUNGGAL PUTRA</option>
                                 <option value="TUNGGAL PUTRI">TUNGGAL PUTRI</option>
                                 <option value="GANDA PUTRA">GANDA PUTRA</option>
                                 <option value="GANDA PUTRI">GANDA PUTRI</option>
                                 <option value="GANDA CAMPURAN">GANDA CAMPURAN</option>
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kelompok Usia</label>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => setNewAtlet({...newAtlet, domisili: 'SENIOR'})} className={`flex-1 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all ${newAtlet.domisili === 'SENIOR' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>SENIOR</button>
                                <button type="button" onClick={() => setNewAtlet({...newAtlet, domisili: 'MUDA'})} className={`flex-1 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all ${newAtlet.domisili === 'MUDA' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>MUDA</button>
                              </div>
                           </div>
                        </div>

                        <div className="p-6 bg-blue-600/5 rounded-[2rem] border border-blue-600/10 grid grid-cols-2 md:grid-cols-3 gap-5">
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest ml-1">Seeded</label>
                               <select 
                                 className="w-full px-5 py-3 bg-white rounded-xl border-none font-black text-blue-600 shadow-sm"
                                 value={newAtlet.seed}
                                 onChange={e => {
                                   const val = e.target.value;
                                   setNewAtlet({...newAtlet, seed: val, points: getAutoPoints(val)});
                                 }}
                               >
                                  <option value="A">SEED A</option>
                                  <option value="B+">SEED B+</option>
                                  <option value="B">SEED B</option>
                                  <option value="C">SEED C</option>
                                  <option value="UNSEEDED">UNSEEDED</option>
                               </select>
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest ml-1">Poin Dasar</label>
                               <input type="number" className="w-full px-5 py-3 bg-white rounded-xl border-none font-black text-slate-900 shadow-sm" value={newAtlet.points} readOnly />
                            </div>
                            <div className="space-y-1 col-span-2 md:col-span-1">
                               <label className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest ml-1">Prestasi</label>
                               <input type="text" className="w-full px-5 py-3 bg-white rounded-xl border-none font-black text-slate-900 shadow-sm uppercase italic placeholder:text-slate-200" placeholder="JUARA 1..." value={newAtlet.prestasi} onChange={e => setNewAtlet({...newAtlet, prestasi: e.target.value})} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biografi / Motto</label>
                            <textarea rows={2} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 text-sm italic" placeholder="Tuliskan motivasi singkat atlet..." value={newAtlet.bio} onChange={e => setNewAtlet({...newAtlet, bio: e.target.value})} />
                        </div>

                        <button disabled={isSaving} className="w-full py-6 bg-blue-600 hover:bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl shadow-blue-200 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:bg-slate-200">
                           {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                           SIMPAN DATA KE DATABASE
                        </button>
                    </div>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {selectedAtlet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/5">
            <button onClick={() => setSelectedAtlet(null)} className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-red-500 text-white rounded-full transition-all"><X size={24} /></button>
            <div className="w-full md:w-[45%] h-[400px] md:h-auto relative bg-zinc-900 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10"></div>
              {selectedAtlet.foto_url ? (
                <img src={selectedAtlet.foto_url} className="w-full h-full object-cover object-[center_20%]" alt={selectedAtlet.nama} />
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
                  <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-lg border border-blue-600/30 uppercase tracking-widest italic">{selectedAtlet.kategori}</span>
                  <span className="bg-white/5 text-white/40 text-[10px] font-black px-4 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest italic">{selectedAtlet.seed}</span>
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

      {/* MODAL EDIT STATS */}
      {isEditModalOpen && editingStats && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20 my-8">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-2xl uppercase italic tracking-tighter">Edit <span className="text-blue-600">Performance</span></h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-all"><X size={24}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-slate-100 shadow-inner group">
                   <img src={editingStats.foto_url || '/placeholder.jpg'} className="w-full h-full object-cover" alt="Current" />
                   <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white backdrop-blur-sm">
                      <Camera size={40} className="mb-2" />
                      <span className="font-black text-[10px] uppercase tracking-widest">Update Photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'edit')} />
                   </label>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-relaxed">Tips: Rasio 3:4 disarankan agar presisi.</p>
                </div>
              </div>
              <form onSubmit={handleUpdateStats} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rank</label>
                    <input type="number" className="w-full px-5 py-3 bg-slate-100 rounded-xl border-none font-black text-slate-900" value={editingStats.rank} onChange={e => setEditingStats({...editingStats, rank: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Points</label>
                    <input type="number" className="w-full px-5 py-3 bg-slate-100 rounded-xl border-none font-black text-slate-900" value={editingStats.points} onChange={e => setEditingStats({...editingStats, points: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seed Category</label>
                    <input type="text" className="w-full px-5 py-3 bg-slate-100 rounded-xl border-none font-black text-slate-900 uppercase" value={editingStats.seed} onChange={e => setEditingStats({...editingStats, seed: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Achievements</label>
                    <input type="text" className="w-full px-5 py-3 bg-slate-100 rounded-xl border-none font-black text-slate-900 uppercase italic" value={editingStats.prestasi} onChange={e => setEditingStats({...editingStats, prestasi: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biography</label>
                    <textarea rows={3} className="w-full px-5 py-3 bg-slate-100 rounded-xl border-none font-bold text-slate-700 text-sm" value={editingStats.bio} onChange={e => setEditingStats({...editingStats, bio: e.target.value})} />
                </div>
                <button disabled={isSaving} className="w-full py-5 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-slate-300">
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                  Save Performance
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE CROPPER MODAL */}
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
           <div className="mt-10 w-full max-w-xl">
              <div className="flex items-center gap-6 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Zoom Control</span>
                <input type="range" value={zoom} min={1} max={3} step={0.1} className="w-full accent-blue-600 h-1 bg-white/20 rounded-full appearance-none" onChange={(e) => setZoom(Number(e.target.value))} />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setImageToCrop(null)} className="flex-1 py-5 bg-white/10 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-white/20 transition-all border border-white/5">Cancel</button>
                <button onClick={executeCropAndUpload} disabled={isCropping} className="flex-1 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-blue-500 transition-all active:scale-95">
                  {isCropping ? <Loader2 className="animate-spin" size={18}/> : <Scissors size={18}/>}
                  Confirm & Upload
                </button>
              </div>
           </div>
        </div>
      )}

      {/* SUCCESS NOTIFICATION */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] transition-all duration-700 transform ${showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
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
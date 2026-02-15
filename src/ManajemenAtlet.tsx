import React, { useEffect, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { supabase } from "./supabase";
import { 
  Search, User, X, Award, TrendingUp, Users, 
  MapPin, Phone, ShieldCheck, Star, Trophy, Save, Loader2, Edit3,
  ChevronLeft, ChevronRight, Zap, Sparkles, RefreshCcw, Camera, Scissors
} from 'lucide-react'; // Pastikan library lucide-react terpasang

// 1. Tambahkan Interface yang lebih ketat untuk konsistensi data
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
  const [editingStats, setEditingStats] = useState<Partial<Registrant> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');

  // --- KODE BARU / PERBAIKAN START ---

  // Efek untuk fetch data saat pertama kali load
  useEffect(() => {
    fetchAtlets();
  }, []);

  // Reset ke halaman 1 saat mencari
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

const fetchAtlets = async () => {
  setLoading(true);
  try {
    // 1. Ambil data pendaftaran
    const { data: pendaftaranData, error: pError } = await supabase
      .from('pendaftaran')
      .select('*')
      .order('nama', { ascending: true });

    if (pError) throw pError;

    // 2. Ambil data rankings (diurutkan berdasarkan poin tertinggi)
    const { data: rankingsData, error: rError } = await supabase
      .from('rankings')
      .select('*')
      .order('total_points', { ascending: false });

    if (rError) throw rError;

    // 3. Gabungkan data
    if (pendaftaranData) {
      const combined = pendaftaranData.map((atlet) => {
        // Cari posisi ranking berdasarkan urutan poin di tabel rankings
        const rankIndex = rankingsData?.findIndex(r => r.nama === atlet.nama) ?? -1;
        const stats = rankingsData?.find(r => r.nama === atlet.nama);

        return {
          ...atlet,
          // Jika ketemu di tabel rankings, index + 1 adalah posisi rank-nya
          rank: rankIndex !== -1 ? rankIndex + 1 : 0, 
          points: stats?.total_points || 0,
          seed: stats?.total_points > 10000 ? 'SEED A' : 'SEED B', // Contoh logika seed sederhana
        };
      });
      setAtlets(combined);
    }
  } catch (err: any) {
    console.error("Error fetching data:", err.message);
  } finally {
    setLoading(false);
  }
};
  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStats || !editingStats.id) return;
    
    setIsSaving(true);
    try {
      // 1. Sync ke tabel atlet_stats (UPSERT: Update if exists, Insert if not)
      const statsPayload = {
        pendaftaran_id: editingStats.id,
        rank: editingStats.rank || 0,
        points: editingStats.points || 0,
        seed: editingStats.seed || 'UNSEEDED',
        bio: editingStats.bio || '',
        prestasi_terakhir: editingStats.prestasi || ''
      };

      const { error: statsError } = await supabase
        .from('atlet_stats')
        .upsert(statsPayload, { onConflict: 'pendaftaran_id' });

      if (statsError) throw statsError;

      // 2. Sync ke tabel rankings (Penting untuk leaderboard utama)
      const { error: rankError } = await supabase
        .from('rankings')
        .upsert({
          player_name: editingStats.nama,
          category: editingStats.kategori,
          seed: editingStats.seed,
          total_points: editingStats.points
        }, { onConflict: 'player_name' });

      if (rankError) throw rankError;

      // Sukses
      await fetchAtlets();
      setNotifMessage("Data Atlet & Ranking Berhasil Disinkronkan!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsEditModalOpen(false);
      setSelectedAtlet(null);
    } catch (err: any) {
      console.error("Update Error:", err.message);
      alert("Error saat menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- KODE BARU / PERBAIKAN END ---

  // Fungsi Image Cropping (Sesuai kode awal Anda)
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
    if (!croppedAreaPixels || !imageToCrop || !editingStats?.id) return;
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
        const fileName = `${editingStats.id}-${Date.now()}.jpg`;
        const filePath = `atlet_photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

        await supabase.from('pendaftaran').update({ foto_url: publicUrl }).eq('id', editingStats.id);

        setEditingStats({ ...editingStats, foto_url: publicUrl });
        setImageToCrop(null);
        setNotifMessage("Foto Berhasil Diperbarui!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchAtlets();
      }, 'image/jpeg');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCropping(false);
    }
  };

  // Logic Pagination & Search
  const filteredAtlets = atlets.filter(a => 
    a.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAtlets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] font-sans relative overflow-hidden">
      {/* BAGIAN UI / JSX: 
        Tetap menggunakan desain High-End Anda namun pastikan prop 'selectedAtlet'
        terisi data hasil mapping terbaru di atas agar stat muncul.
      */}
      
      {/* HEADER & SEARCH BAR (Sesuai kode awal) */}
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

      {/* RENDER LIST ATLET (Sesuai kode awal) */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20 scroll-smooth">
        <div className="max-w-7xl mx-auto pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full py-32 text-center">
                 <Loader2 className="animate-spin m-auto text-blue-600 mb-4" size={40} />
                 <p className="font-black text-slate-300 uppercase italic tracking-[0.3em]">Mengakses Server...</p>
              </div>
            ) : currentItems.length > 0 ? (
              currentItems.map((atlet) => (
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
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
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
              ))
            ) : (
              <div className="col-span-full py-32 text-center text-slate-400 font-bold uppercase tracking-widest">
                Data Tidak Ditemukan
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DETAIL (Sesuai kode awal) */}
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
                 <div className="bg-amber-400 text-black font-black text-[11px] px-5 py-2 rounded-xl flex items-center gap-3 italic uppercase tracking-tighter">
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
                <button onClick={() => { setEditingStats(selectedAtlet); setIsEditModalOpen(true); }} className="flex items-center gap-2 text-white/30 hover:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  <Edit3 size={14} /> UPDATE STATISTICS
                </button>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-10 leading-[0.85]">
                {selectedAtlet.nama}
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5 transition-colors">
                    <TrendingUp className="text-blue-500 mb-3" size={24} />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Global Standing</p>
                    <p className="text-3xl font-black text-white italic">#{selectedAtlet.rank}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5 transition-colors">
                    <Zap className="text-amber-500 mb-3" size={24} />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Total Points</p>
                    <p className="text-3xl font-black text-white italic">{selectedAtlet.points.toLocaleString()}</p>
                  </div>
              </div>
              <div className="bg-blue-600/5 p-8 rounded-3xl border border-blue-600/10 relative">
                  <p className="text-slate-400 text-sm leading-relaxed italic font-medium">"{selectedAtlet.bio}"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT & CROPPER (Sesuai kode awal namun dengan handleUpdateStats yang diperbaiki) */}
      {/* ... sisanya tetap sesuai kode Anda ... */}
      
      {/* MODAL EDIT (Snippet untuk tombol save yang terhubung ke handleUpdateStats) */}
      {isEditModalOpen && editingStats && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
             {/* ... form content Anda ... */}
             <div className="p-10">
               <form onSubmit={handleUpdateStats} className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rank</label>
                      <input type="number" className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black" value={editingStats.rank || 0} onChange={e => setEditingStats({...editingStats, rank: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Points</label>
                      <input type="number" className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black" value={editingStats.points || 0} onChange={e => setEditingStats({...editingStats, points: parseInt(e.target.value)})} />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Achievements</label>
                    <input type="text" className="w-full px-5 py-3 bg-slate-100 rounded-xl font-black uppercase italic" value={editingStats.prestasi || ''} onChange={e => setEditingStats({...editingStats, prestasi: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biography</label>
                    <textarea rows={3} className="w-full px-5 py-3 bg-slate-100 rounded-xl font-bold text-sm" value={editingStats.bio || ''} onChange={e => setEditingStats({...editingStats, bio: e.target.value})} />
                 </div>
                 <button disabled={isSaving} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3">
                   {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                   Save Performance
                 </button>
               </form>
             </div>
           </div>
        </div>
      )}

      {/* FOOTER PAGINATION */}
      {/* ... kode pagination Anda ... */}

      {/* NOTIFIKASI SUKSES */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] transition-all duration-700 transform ${showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-blue-500/50 px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6">
          <div className="bg-blue-600 p-4 rounded-2xl animate-bounce"><Zap size={24} className="text-white fill-white" /></div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-xl italic leading-none mb-1">{notifMessage}</h4>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Database Updated</p>
          </div>
        </div>
      </div>

    </div>
  );
}
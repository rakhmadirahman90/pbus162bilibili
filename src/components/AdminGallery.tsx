import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from "../supabase";
import { 
  Plus, Trash2, Image as ImageIcon, Video, 
  Upload, X, Loader2, CheckCircle2,
  Film, Camera, ChevronLeft, ChevronRight,
  Edit3, AlignLeft, Tag, Link as LinkIcon // BARU: Icon Link
} from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  category: string;
  description: string;
  created_at: string;
  is_local?: boolean; // BARU: Penanda video lokal vs link
}

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // BARU: State untuk menentukan input video via Link atau File
  const [videoInputMethod, setVideoInputMethod] = useState<'link' | 'file'>('file');

  const [formData, setFormData] = useState({
    title: '',
    type: 'image' as 'image' | 'video',
    url: '',
    category: 'Pertandingan',
    description: '',
    is_local: true // Default true untuk image/file upload
  });

  const categories = ['Pertandingan', 'Latihan', 'Prestasi', 'Fasilitas', 'Latihan Rutin'];

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  async function fetchGallery() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  // BARU: Fungsi untuk memproses URL YouTube menjadi embed
  const processVideoUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      type: item.type,
      url: item.url,
      category: item.category || 'Pertandingan',
      description: item.description || '',
      is_local: item.is_local ?? (!item.url.includes('youtube.com') && !item.url.includes('youtu.be'))
    });
    // Set metode input berdasarkan URL yang ada
    if (item.type === 'video') {
        setVideoInputMethod(item.url.includes('http') && !item.url.includes('supabase') ? 'link' : 'file');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setVideoInputMethod('file');
    setFormData({ 
      title: '', 
      type: 'image', 
      url: '', 
      category: 'Pertandingan', 
      description: '',
      is_local: true
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => item.type === activeTab);
  }, [items, activeTab]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      setFormData({ ...formData, url: publicUrl, is_local: true });
      showToast("Media berhasil diunggah!");
    } catch (err: any) {
      alert("Gagal upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) return alert("Pilih file atau masukkan link terlebih dahulu!");

    // Proses URL jika tipenya video dan metode link
    let finalUrl = formData.url;
    if (formData.type === 'video' && videoInputMethod === 'link') {
        finalUrl = processVideoUrl(formData.url);
    }

    const payload = {
        title: formData.title,
        type: formData.type,
        url: finalUrl,
        category: formData.category,
        description: formData.description,
        is_local: formData.type === 'image' ? true : (videoInputMethod === 'file')
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('gallery')
          .update(payload)
          .eq('id', editingId);
        
        if (error) throw error;
        showToast("Media berhasil diperbarui!");
      } else {
        const { error } = await supabase.from('gallery').insert([payload]);
        if (error) throw error;
        showToast("Berhasil menambahkan ke galeri!");
      }

      handleCloseModal();
      fetchGallery();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!window.confirm("Hapus media ini secara permanen?")) return;
    try {
      await supabase.from('gallery').delete().eq('id', id);
      const filePath = url.split('/').pop();
      // Hanya hapus dari storage jika itu file lokal (bukan link YouTube)
      if (filePath && url.includes('supabase.co')) {
        await supabase.storage.from('gallery').remove([`uploads/${filePath}`]);
      }
      showToast("Media berhasil dihapus");
      fetchGallery();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {successMsg && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[150] bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-xs uppercase flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              UPDATE<span className="text-blue-600"> GALERI</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Media Asset Management System</p>
          </div>
          
          <button 
            onClick={() => {
                setFormData({...formData, type: activeTab});
                setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-black uppercase text-[10px] transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus size={16} /> Tambah {activeTab === 'image' ? 'Foto' : 'Video'}
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex gap-2 mb-8 bg-zinc-900/50 p-1.5 rounded-2xl w-fit border border-white/5">
          <button 
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'image' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <ImageIcon size={14} /> Galeri Foto
          </button>
          <button 
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'video' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Video size={14} /> Galeri Video
          </button>
        </div>

        {/* GRID CONTENT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-500">
                <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
                <span className="font-bold uppercase tracking-widest text-xs">Sinkronisasi Data...</span>
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-zinc-600 font-bold uppercase italic">
                Tidak ada {activeTab === 'image' ? 'foto' : 'video'} ditemukan
            </div>
          ) : paginatedItems.map((item) => (
            <div key={item.id} className="group relative bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden aspect-video transition-all hover:border-blue-500/50 animate-in fade-in zoom-in duration-300">
              {item.type === 'image' ? (
                <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.title} />
              ) : (
                <div className="relative w-full h-full">
                    {/* BARU: Tampilkan Thumbnail YouTube jika link YT */}
                    {item.url.includes('youtube.com') || item.url.includes('youtu.be') ? (
                        <div className="w-full h-full relative">
                            <img 
                                src={`https://img.youtube.com/vi/${item.url.split('embed/')[1] || item.url.split('/').pop()}/mqdefault.jpg`} 
                                className="w-full h-full object-cover opacity-50"
                                alt="YT Thumbnail"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Film size={40} className="text-white/20" />
                            </div>
                            <span className="absolute bottom-4 left-4 bg-red-600 text-[8px] font-black px-2 py-1 rounded uppercase">YouTube Link</span>
                        </div>
                    ) : (
                        <video src={item.url} className="w-full h-full object-cover" />
                    )}
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <div className="flex justify-between items-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="max-w-[70%]">
                    <span className="text-blue-500 text-[7px] font-black uppercase tracking-widest block mb-1">{item.category}</span>
                    <h3 className="font-bold text-sm uppercase italic leading-none truncate mb-1">{item.title}</h3>
                    <p className="text-[8px] text-zinc-400 font-medium uppercase tracking-wider line-clamp-1">{item.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="p-3 bg-blue-600/20 hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl transition-all active:scale-90">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id, item.url)} className="p-3 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all active:scale-90">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-4 bg-zinc-900 border border-white/5 rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed hover:bg-zinc-800 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-4 bg-zinc-900 border border-white/5 rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed hover:bg-zinc-800 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* MODAL UPLOAD & EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-zinc-950 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/10 shadow-2xl scale-in-center custom-scrollbar">
            <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md p-8 border-b border-white/5 flex justify-between items-center z-10">
              <h3 className="font-black uppercase italic text-2xl">
                {editingId ? 'EDIT' : 'TAMBAH'} <span className="text-blue-600">{formData.type === 'image' ? 'FOTO' : 'VIDEO'}</span>
              </h3>
              <button onClick={handleCloseModal} className="p-3 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Media Type Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
                   <ImageIcon size={12}/> Tipe Media Utama
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, type: 'image'})}
                    className={`py-4 rounded-2xl border flex items-center justify-center gap-3 font-bold text-xs transition-all ${formData.type === 'image' ? 'bg-blue-600 border-blue-600' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}
                  >
                    <Camera size={18} /> FOTO
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, type: 'video'})}
                    className={`py-4 rounded-2xl border flex items-center justify-center gap-3 font-bold text-xs transition-all ${formData.type === 'video' ? 'bg-blue-600 border-blue-600' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}
                  >
                    <Film size={18} /> VIDEO
                  </button>
                </div>
              </div>

              {/* VIDEO SPECIFIC: Method Selection (File vs Link) */}
              {formData.type === 'video' && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
                    <Video size={12}/> Metode Input Video
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-white/5">
                    <button 
                        type="button"
                        onClick={() => setVideoInputMethod('file')}
                        className={`py-3 rounded-xl flex items-center justify-center gap-2 font-black text-[9px] transition-all ${videoInputMethod === 'file' ? 'bg-zinc-800 text-blue-500 shadow-lg' : 'text-zinc-500'}`}
                    >
                        <Upload size={14} /> UPLOAD FILE
                    </button>
                    <button 
                        type="button"
                        onClick={() => setVideoInputMethod('link')}
                        className={`py-3 rounded-xl flex items-center justify-center gap-2 font-black text-[9px] transition-all ${videoInputMethod === 'link' ? 'bg-zinc-800 text-blue-500 shadow-lg' : 'text-zinc-500'}`}
                    >
                        <LinkIcon size={14} /> LINK EXTERNAL
                    </button>
                  </div>
                </div>
              )}

              {/* Inputs Common */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                   <Edit3 size={12}/> Judul Media
                </label>
                <input 
                  required
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 outline-none focus:border-blue-600 font-bold uppercase transition-all"
                  placeholder="CONTOH: FINAL CUP IV 2026..."
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Tag size={12}/> Kategori
                    </label>
                    <select 
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 outline-none focus:border-blue-600 font-bold uppercase transition-all appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                    </select>
                  </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                   <AlignLeft size={12}/> Deskripsi Lengkap
                </label>
                <textarea 
                  required
                  rows={2}
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 outline-none focus:border-blue-600 font-medium transition-all"
                  placeholder="Ceritakan momen dibalik media ini..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* CONDITIONAL MEDIA INPUT (UPLOAD OR LINK) */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2">
                   {formData.type === 'image' || videoInputMethod === 'file' ? <Upload size={12}/> : <LinkIcon size={12}/>} 
                   Sumber {formData.type === 'image' ? 'Foto' : 'Video'}
                </label>

                {(formData.type === 'image' || videoInputMethod === 'file') ? (
                    /* UPLOAD BOX */
                    <div 
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className="group relative h-40 bg-zinc-900/50 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-600/50 transition-all overflow-hidden"
                    >
                        {formData.url && formData.is_local ? (
                            formData.type === 'image' ? (
                                <img src={formData.url} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-blue-500">
                                    <CheckCircle2 size={40} className="mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Video Lokal Terpilih</span>
                                </div>
                            )
                        ) : (
                            <>
                                <div className="p-4 bg-zinc-800 rounded-2xl mb-3 text-zinc-500 group-hover:text-blue-500 transition-colors">
                                <Upload size={24} />
                                </div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter text-center">
                                    Klik untuk {editingId ? 'ganti' : 'pilih'} file {formData.type === 'image' ? 'Foto' : 'Video'}<br/>
                                    <span className="opacity-50 font-medium">Max size: 10MB</span>
                                </p>
                            </>
                        )}
                        
                        {isUploading && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Mengunggah ke Storage...</p>
                        </div>
                        )}
                    </div>
                ) : (
                    /* LINK INPUT BOX */
                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                        <input 
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-5 outline-none focus:border-red-600 font-medium text-sm transition-all"
                            placeholder="Paste link YouTube di sini (Contoh: https://www.youtube.com/watch?v=...)"
                            value={formData.is_local ? '' : formData.url}
                            onChange={e => setFormData({...formData, url: e.target.value, is_local: false})}
                        />
                        <p className="text-[9px] text-zinc-500 italic px-2">Format yang didukung: YouTube Link & YouTube Shorts</p>
                    </div>
                )}

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept={formData.type === 'image' ? 'image/*' : 'video/*'} 
                />
              </div>

              <button 
                type="submit"
                disabled={isUploading || !formData.url}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 disabled:cursor-not-allowed rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all active:scale-95"
              >
                {editingId ? 'SIMPAN PERUBAHAN' : 'PUBLIKASIKAN SEKARANG'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
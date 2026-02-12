import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "../supabase";
import { 
  Plus, Trash2, Image as ImageIcon, Video, 
  Upload, X, Loader2, CheckCircle2, Search,
  Film, Camera
} from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  created_at: string;
}

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'image' as 'image' | 'video',
    url: ''
  });

  useEffect(() => {
    fetchGallery();
  }, []);

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

      setFormData({ ...formData, url: publicUrl });
      setSuccessMsg("Media berhasil diunggah ke storage!");
    } catch (err: any) {
      alert("Gagal upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) return alert("Pilih file terlebih dahulu!");

    try {
      const { error } = await supabase.from('gallery').insert([formData]);
      if (error) throw error;

      setIsModalOpen(false);
      setFormData({ title: '', type: 'image', url: '' });
      setSuccessMsg("Berhasil menambahkan ke galeri!");
      fetchGallery();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!window.confirm("Hapus media ini?")) return;
    try {
      // 1. Hapus dari database
      await supabase.from('gallery').delete().eq('id', id);
      
      // 2. Opsi: Hapus dari storage (ekstrak file path dari URL)
      const filePath = url.split('/').pop();
      if (filePath) {
        await supabase.storage.from('gallery').remove([`uploads/${filePath}`]);
      }

      setSuccessMsg("Media berhasil dihapus");
      fetchGallery();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Toast Notification */}
        {successMsg && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[150] bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-xs uppercase flex items-center gap-3 shadow-2xl animate-bounce">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              UPDATE<span className="text-blue-600"> GALERI</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Media Asset Management System</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-black uppercase text-[10px] transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={16} /> Tambah Media
          </button>
        </div>

        {/* Grid Media */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center animate-pulse text-zinc-500 font-bold uppercase">Memuat Galeri...</div>
          ) : items.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-zinc-600 font-bold uppercase italic">Galeri masih kosong</div>
          ) : items.map((item) => (
            <div key={item.id} className="group relative bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden aspect-video transition-all hover:border-blue-500/50">
              {item.type === 'image' ? (
                <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.title} />
              ) : (
                <video src={item.url} className="w-full h-full object-cover" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="bg-blue-600 text-[8px] font-black px-2 py-1 rounded mb-2 inline-block uppercase italic">{item.type}</span>
                    <h3 className="font-bold text-sm uppercase italic leading-none">{item.title}</h3>
                  </div>
                  <button onClick={() => handleDelete(item.id, item.url)} className="p-3 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-zinc-950 w-full max-w-lg rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-black uppercase italic text-2xl">TAMBAH <span className="text-blue-600">MEDIA</span></h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase">Tipe Media</label>
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

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Judul / Caption</label>
                <input 
                  required
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 outline-none focus:border-blue-600 font-bold uppercase transition-all"
                  placeholder="MASUKKAN JUDUL MEDIA..."
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-48 bg-zinc-900/50 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-600/50 transition-all overflow-hidden"
              >
                {formData.url ? (
                  formData.type === 'image' ? (
                    <img src={formData.url} className="w-full h-full object-cover" />
                  ) : (
                    <video src={formData.url} className="w-full h-full object-cover" />
                  )
                ) : (
                  <>
                    <div className="p-4 bg-zinc-800 rounded-2xl mb-3 text-zinc-500 group-hover:text-blue-500 transition-colors">
                      <Upload size={24} />
                    </div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase">Klik untuk upload file</p>
                  </>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Mengunggah...</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept={formData.type === 'image' ? 'image/*' : 'video/*'} />
              </div>

              <button 
                type="submit"
                disabled={isUploading || !formData.url}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all"
              >
                PUBLIKASIKAN KE GALERI
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
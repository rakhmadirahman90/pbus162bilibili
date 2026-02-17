import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { 
  Plus, Trash2, Image as ImageIcon, Save, 
  Loader2, Power, PowerOff, Upload, X, Camera, Edit3 
} from 'lucide-react';
import Swal from 'sweetalert2';

interface PopupConfig {
  id: string;
  url_gambar: string;
  judul: string;
  deskripsi: string;
  is_active: boolean;
}

export default function AdminPopup() {
  const [popups, setPopups] = useState<PopupConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newPopup, setNewPopup] = useState({ url_gambar: '', judul: '', deskripsi: '' });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchPopups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('konfigurasi_popup')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setPopups(data);
    setLoading(false);
  };

  useEffect(() => { fetchPopups(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Gunakan FileReader untuk validasi dimensi jika diperlukan di masa depan
    setPreviewImage(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `popup-${Date.now()}.${fileExt}`;
      const filePath = `promosi/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('identitas-atlet') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('identitas-atlet')
        .getPublicUrl(filePath);

      setNewPopup({ ...newPopup, url_gambar: publicUrl });
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
      Toast.fire({ icon: 'success', title: 'Gambar berhasil diunggah' });

    } catch (err: any) {
      Swal.fire('Gagal', err.message, 'error');
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPopup.url_gambar) {
      return Swal.fire('Opps!', 'Harap unggah gambar terlebih dahulu', 'warning');
    }

    setIsSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from('konfigurasi_popup')
        .update({
          judul: newPopup.judul,
          deskripsi: newPopup.deskripsi,
          url_gambar: newPopup.url_gambar
        })
        .eq('id', editingId);

      if (!error) {
        Swal.fire({ title: 'Berhasil', text: 'Pop-up diperbarui', icon: 'success', background: '#0F172A', color: '#fff' });
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from('konfigurasi_popup').insert([newPopup]);
      if (!error) {
        Swal.fire({ title: 'Berhasil', text: 'Pop-up baru diaktifkan', icon: 'success', background: '#0F172A', color: '#fff' });
      }
    }

    setNewPopup({ url_gambar: '', judul: '', deskripsi: '' });
    setPreviewImage(null);
    fetchPopups();
    setIsSaving(false);
  };

  const startEdit = (item: PopupConfig) => {
    setEditingId(item.id);
    setNewPopup({
      judul: item.judul,
      deskripsi: item.deskripsi,
      url_gambar: item.url_gambar
    });
    setPreviewImage(item.url_gambar);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewPopup({ url_gambar: '', judul: '', deskripsi: '' });
    setPreviewImage(null);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('konfigurasi_popup')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (!error) fetchPopups();
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: 'Hapus Pop-up?',
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#1e293b',
      confirmButtonText: 'Ya, Hapus!',
      background: '#0F172A',
      color: '#fff'
    });

    if (res.isConfirmed) {
      await supabase.from('konfigurasi_popup').delete().eq('id', id);
      fetchPopups();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen bg-[#050505]">
      <header className="mb-10 flex justify-between items-end">
        <div>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
            Kelola <span className="text-blue-500">Pop-up Promo</span>
            </h1>
            <p className="text-white/40 font-bold text-xs uppercase tracking-[0.3em] mt-2">Atur tampilan informasi landing page</p>
        </div>
        {editingId && (
            <button onClick={cancelEdit} className="px-6 py-2 bg-rose-600/10 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all">
                Batal Edit
            </button>
        )}
      </header>

      {/* FORM INPUT */}
      <div className={`bg-[#0F172A] rounded-[2.5rem] border transition-all duration-500 ${editingId ? 'border-blue-500/50 shadow-blue-500/10' : 'border-white/5 shadow-2xl'} mb-12 overflow-hidden`}>
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="lg:col-span-2 p-8 bg-black/20 border-r border-white/5 flex flex-col items-center justify-center">
            {/* CONTAINER GAMBAR: Menambahkan bg-checkered atau dark pattern untuk presisi */}
            <div className="relative group w-full aspect-[4/5] rounded-[2rem] border-2 border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center bg-[#080808]">
              {previewImage ? (
                <>
                  {/* Background Blur agar gambar yang tidak proporsional tetap terlihat penuh */}
                  <img src={previewImage} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30" alt="blur-bg" />
                  
                  {/* Gambar Utama: Menggunakan object-contain agar tidak terpotong sama sekali */}
                  <img src={previewImage} className="relative z-10 w-full h-full object-contain p-2" alt="Preview" />
                  
                  <label className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <Camera className="text-white" size={32} />
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Ganti Gambar</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                  
                  <button 
                    onClick={() => {setPreviewImage(null); setNewPopup({...newPopup, url_gambar: ''})}}
                    className="absolute top-4 right-4 z-30 p-2 bg-rose-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center group relative z-10">
                  <div className="p-5 bg-blue-600/10 rounded-full text-blue-500 mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Camera size={32} />
                  </div>
                  <span className="text-white/40 font-black text-[10px] uppercase tracking-widest text-center px-4">
                    {isUploading ? 'Sedang Mengunggah...' : 'Unggah Poster (Saran 4:5)'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              )}
              {isUploading && (
                <div className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center backdrop-blur-md">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                    <span className="text-blue-500 font-bold text-[10px] tracking-widest">PROCESSING...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSave} className="lg:col-span-3 p-8 space-y-6 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Judul Promosi</label>
                <input 
                  required 
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-white/10" 
                  placeholder="Contoh: MARHABAN YA RAMADHAN" 
                  value={newPopup.judul} 
                  onChange={e => setNewPopup({...newPopup, judul: e.target.value})} 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Deskripsi Informasi</label>
                <textarea 
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 h-28 resize-none transition-all placeholder:text-white/10" 
                  placeholder="Jelaskan detail promo atau informasi singkat di sini..." 
                  value={newPopup.deskripsi} 
                  onChange={e => setNewPopup({...newPopup, deskripsi: e.target.value})} 
                />
              </div>
            </div>

            <button 
              disabled={isSaving || isUploading} 
              className={`w-full ${editingId ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'} disabled:bg-slate-800 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95`}
            >
              {isSaving ? <Loader2 className="animate-spin" /> : (
                <>{editingId ? <Edit3 size={18}/> : <Save size={18}/>} {editingId ? 'PERBARUI POP-UP' : 'AKTIFKAN SEKARANG'}</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ARSIP LIST */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-[1px] flex-1 bg-white/10"></div>
        <h2 className="text-white/40 font-black text-[10px] uppercase tracking-[0.4em]">Arsip Pop-up Konten</h2>
        <div className="h-[1px] flex-1 bg-white/10"></div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {popups.map(item => (
            <div key={item.id} className={`group relative bg-[#0F172A] rounded-[2.5rem] border-2 overflow-hidden transition-all duration-300 ${item.is_active ? 'border-blue-500/30' : 'border-white/5 opacity-50 grayscale hover:grayscale-0'}`}>
              <div className="aspect-[4/5] overflow-hidden relative bg-black">
                {/* Layer Blur di belakang arsip */}
                <img src={item.url_gambar} className="absolute inset-0 w-full h-full object-cover blur-lg opacity-20" alt="" />
                
                {/* Gambar Utama di arsip menggunakan object-contain agar terlihat penuh */}
                <img 
                    src={item.url_gambar} 
                    className="relative z-10 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700" 
                    alt={item.judul} 
                />
                
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-60" />
                <div className="absolute top-4 left-4 z-30">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white/50'}`}>
                    {item.is_active ? 'LIVE' : 'OFF'}
                  </span>
                </div>
              </div>

              <div className="p-6 relative">
                <h4 className="text-white font-black uppercase text-sm mb-2 italic line-clamp-1">{item.judul || 'PENGUMUMAN'}</h4>
                <p className="text-white/40 text-[11px] font-medium mb-6 line-clamp-2 leading-relaxed h-8">{item.deskripsi}</p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleStatus(item.id, item.is_active)} 
                    className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${item.is_active ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-white/5 text-white/40 hover:bg-blue-600 hover:text-white'}`}
                    title={item.is_active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {item.is_active ? <Power size={14}/> : <PowerOff size={14}/>}
                  </button>
                  <button 
                    onClick={() => startEdit(item)} 
                    className="flex-[2] py-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 size={14} /> EDIT
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    className="p-3 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
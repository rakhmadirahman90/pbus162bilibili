import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { 
  Plus, Trash2, Image as ImageIcon, Save, 
  Loader2, Power, PowerOff, Upload, X, Camera 
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

  // --- FUNGSI UPLOAD GAMBAR KE STORAGE ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview lokal
    setPreviewImage(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `popup-${Date.now()}.${fileExt}`;
      const filePath = `promosi/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('identitas-atlet') // Menggunakan bucket yang sudah ada atau sesuaikan
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPopup.url_gambar) {
      return Swal.fire('Opps!', 'Harap unggah gambar terlebih dahulu', 'warning');
    }

    setIsSaving(true);
    const { error } = await supabase.from('konfigurasi_popup').insert([newPopup]);
    
    if (!error) {
      setNewPopup({ url_gambar: '', judul: '', deskripsi: '' });
      setPreviewImage(null);
      fetchPopups();
      Swal.fire({
        title: 'Berhasil',
        text: 'Pop-up promosi baru telah diaktifkan',
        icon: 'success',
        background: '#0F172A',
        color: '#fff',
        confirmButtonColor: '#2563eb'
      });
    }
    setIsSaving(false);
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
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
          Kelola <span className="text-blue-500">Pop-up Promo</span>
        </h1>
        <p className="text-white/40 font-bold text-xs uppercase tracking-[0.3em] mt-2">Atur tampilan informasi landing page</p>
      </header>

      {/* FORM TAMBAH (CARD) */}
      <div className="bg-[#0F172A] rounded-[2.5rem] border border-white/5 mb-12 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          
          {/* Sisi Kiri: Upload & Preview */}
          <div className="lg:col-span-2 p-8 bg-black/20 border-r border-white/5 flex flex-col items-center justify-center">
            <div className="relative group w-full aspect-[4/5] rounded-[2rem] border-2 border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center bg-black/40">
              {previewImage ? (
                <>
                  <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    onClick={() => {setPreviewImage(null); setNewPopup({...newPopup, url_gambar: ''})}}
                    className="absolute top-4 right-4 p-2 bg-rose-600 text-white rounded-full shadow-lg"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center group">
                  <div className="p-5 bg-blue-600/10 rounded-full text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                    <Camera size={32} />
                  </div>
                  <span className="text-white/40 font-black text-[10px] uppercase tracking-widest text-center">
                    {isUploading ? 'Sedang Mengunggah...' : 'Klik Untuk Unggah Gambar'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Detail Input */}
          <form onSubmit={handleAdd} className="lg:col-span-3 p-8 space-y-6 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Judul Promosi</label>
                <input 
                  required 
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all" 
                  placeholder="Contoh: PENDAFTARAN GELOMBANG 2" 
                  value={newPopup.judul} 
                  onChange={e => setNewPopup({...newPopup, judul: e.target.value})} 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Deskripsi Informasi</label>
                <textarea 
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 h-28 resize-none transition-all" 
                  placeholder="Jelaskan detail promo atau informasi singkat di sini..." 
                  value={newPopup.deskripsi} 
                  onChange={e => setNewPopup({...newPopup, deskripsi: e.target.value})} 
                />
              </div>

              {/* URL Field (Read Only if Uploaded) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Image URL System</label>
                <input 
                  readOnly
                  className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-white/30 text-xs font-mono outline-none" 
                  placeholder="Automated link after upload..." 
                  value={newPopup.url_gambar} 
                />
              </div>
            </div>

            <button 
              disabled={isSaving || isUploading} 
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-95"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={18}/> AKTIFKAN SEKARANG</>}
            </button>
          </form>
        </div>
      </div>

      {/* HEADER LIST */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-[1px] flex-1 bg-white/10"></div>
        <h2 className="text-white/40 font-black text-[10px] uppercase tracking-[0.4em]">Arsip Pop-up Konten</h2>
        <div className="h-[1px] flex-1 bg-white/10"></div>
      </div>

      {/* GRID LIST */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {popups.map(item => (
            <div key={item.id} className={`group relative bg-[#0F172A] rounded-[2.5rem] border-2 overflow-hidden transition-all duration-300 ${item.is_active ? 'border-blue-500/30' : 'border-white/5 opacity-50 grayscale hover:grayscale-0'}`}>
              
              {/* Gambar List */}
              <div className="aspect-[4/5] overflow-hidden relative">
                <img src={item.url_gambar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.judul} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-80" />
                
                {/* Badge Status */}
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white/50'}`}>
                    {item.is_active ? 'LIVE' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* Konten List */}
              <div className="p-6 relative">
                <h4 className="text-white font-black uppercase text-sm mb-2 italic line-clamp-1">{item.judul || 'PENGUMUMAN'}</h4>
                <p className="text-white/40 text-[11px] font-medium mb-6 line-clamp-2 leading-relaxed">{item.deskripsi}</p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => toggleStatus(item.id, item.is_active)} 
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${item.is_active ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-white/5 text-white/40 hover:bg-blue-600 hover:text-white'}`}
                  >
                    {item.is_active ? <><Power size={14}/> MATIKAN</> : <><PowerOff size={14}/> AKTIFKAN</>}
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

          {popups.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <ImageIcon className="mx-auto text-white/10 mb-4" size={48} />
              <p className="text-white/20 font-black uppercase tracking-widest text-xs">Belum ada konten pop-up</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
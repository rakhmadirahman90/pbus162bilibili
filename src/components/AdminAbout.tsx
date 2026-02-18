import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Save, 
  BookOpen, 
  Target, 
  Rocket, 
  Award, 
  Loader2, 
  Plus, 
  Trash2,
  Type,
  Image as ImageIcon,
  Upload,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  
  const [content, setContent] = useState({
    sejarah_title: '',
    sejarah_accent: '',
    sejarah_desc: '',
    sejarah_img: '', // Foto Sejarah
    vision: '',
    missions: [] as string[],
    fasilitas_title: '',
    fasilitas_img1: '', // Foto Fasilitas 1 (Utama)
    fasilitas_img2: '', // Foto Fasilitas 2 (Kanan Atas)
    fasilitas_img3: '', // Foto Fasilitas 3 (Kanan Bawah)
  });

  const [newMission, setNewMission] = useState('');

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'about_content')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const val = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setContent({
          sejarah_title: val.sejarah_title || '',
          sejarah_accent: val.sejarah_accent || '',
          sejarah_desc: val.sejarah_desc || '',
          sejarah_img: val.sejarah_img || '',
          vision: val.vision || '',
          missions: Array.isArray(val.missions) ? val.missions : [],
          fasilitas_title: val.fasilitas_title || '',
          fasilitas_img1: val.fasilitas_img1 || '',
          fasilitas_img2: val.fasilitas_img2 || '',
          fasilitas_img3: val.fasilitas_img3 || '',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI BARU: Upload Image ke Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `about/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads') // Pastikan bucket 'uploads' sudah ada & publik
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      setContent(prev => ({ ...prev, [field]: publicUrl }));
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Gambar berhasil diunggah',
        showConfirmButton: false,
        timer: 2000,
        background: '#1E293B',
        color: '#fff'
      });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Gagal Upload', text: error.message });
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'about_content', 
          value: content 
        }, { onConflict: 'key' });

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'BERHASIL DISIMPAN',
        text: 'Konten halaman Tentang Kami telah diperbarui.',
        background: '#0F172A',
        color: '#fff',
        confirmButtonColor: '#2563eb'
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'GAGAL MENYIMPAN',
        text: error.message,
        background: '#0F172A',
        color: '#fff'
      });
    } finally {
      setSaving(false);
    }
  };

  const addMission = () => {
    if (newMission.trim()) {
      setContent({ ...content, missions: [...content.missions, newMission.trim()] });
      setNewMission('');
    }
  };

  const removeMission = (index: number) => {
    const filtered = content.missions.filter((_, i) => i !== index);
    setContent({ ...content, missions: filtered });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#050505] min-h-screen text-white pb-24">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            KELOLA <span className="text-blue-500">TENTANG KAMI</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] mt-2">Integrasi Multimedia & Narasi Website</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'PROSES...' : 'SIMPAN PERUBAHAN'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* SECTION 1: SEJARAH */}
        <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl">
          <div className="flex items-center gap-4 mb-8 text-blue-500 border-b border-white/5 pb-6">
            <BookOpen size={28} />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Evolusi & Sejarah</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Upload Foto Sejarah */}
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Visual Sejarah (1 Foto)</label>
               <div className="relative group aspect-video bg-black/40 rounded-[2rem] overflow-hidden border-2 border-dashed border-white/10 flex flex-col items-center justify-center transition-all hover:border-blue-500/50">
                  {content.sejarah_img ? (
                    <>
                      <img src={content.sejarah_img} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all gap-3">
                        <label className="cursor-pointer p-3 bg-blue-600 rounded-full hover:scale-110 transition-transform">
                          <Upload size={20} />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sejarah_img')} />
                        </label>
                        <button onClick={() => setContent({...content, sejarah_img: ''})} className="p-3 bg-red-600 rounded-full hover:scale-110 transition-transform">
                          <X size={20} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <ImageIcon size={40} className="text-slate-600 mb-2" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Klik untuk Upload Gambar</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sejarah_img')} />
                    </label>
                  )}
                  {uploading === 'sejarah_img' && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>}
               </div>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Judul Utama</label>
                  <input 
                    type="text"
                    value={content.sejarah_title}
                    onChange={(e) => setContent({...content, sejarah_title: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Judul Aksen</label>
                  <input 
                    type="text"
                    value={content.sejarah_accent}
                    onChange={(e) => setContent({...content, sejarah_accent: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-blue-500 focus:border-blue-500 outline-none font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Narasi Sejarah</label>
                <textarea
                  value={content.sejarah_desc}
                  onChange={(e) => setContent({...content, sejarah_desc: e.target.value})}
                  className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-slate-300 focus:border-blue-500 outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: VISI & MISI */}
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-8 text-purple-500 border-b border-white/5 pb-6">
              <Target size={28} />
              <h2 className="text-2xl font-black uppercase italic tracking-tight">Visi Klub</h2>
            </div>
            <textarea
              placeholder="Masukkan visi..."
              value={content.vision}
              onChange={(e) => setContent({...content, vision: e.target.value})}
              className="w-full h-44 bg-black/40 border border-white/10 rounded-2xl p-6 text-slate-300 focus:border-purple-500 outline-none resize-none italic font-medium text-lg"
            />
          </div>

          <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-8 text-emerald-500 border-b border-white/5 pb-6">
              <Rocket size={28} />
              <h2 className="text-2xl font-black uppercase italic tracking-tight">Misi Strategis</h2>
            </div>
            <div className="flex gap-2 mb-6">
              <input 
                type="text"
                placeholder="Tambah misi..."
                value={newMission}
                onChange={(e) => setNewMission(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMission()}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-emerald-500 outline-none"
              />
              <button onClick={addMission} className="p-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all"><Plus size={20}/></button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
              {content.missions.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 group">
                  <span className="text-xs text-slate-400 italic">{m}</span>
                  <button onClick={() => removeMission(idx)} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: FASILITAS (3 FOTO) */}
        <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl">
          <div className="flex items-center gap-4 mb-8 text-amber-500 border-b border-white/5 pb-6">
            <Award size={28} />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Galeri & Nama Fasilitas</h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            {/* Slot Foto 1 (Utama) */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Foto Utama (Besar)</span>
              <ImageUploadBox field="fasilitas_img1" url={content.fasilitas_img1} onUpload={handleImageUpload} onClear={() => setContent({...content, fasilitas_img1: ''})} uploading={uploading === 'fasilitas_img1'} />
            </div>
            {/* Slot Foto 2 */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Detail 1 (Kanan Atas)</span>
              <ImageUploadBox field="fasilitas_img2" url={content.fasilitas_img2} onUpload={handleImageUpload} onClear={() => setContent({...content, fasilitas_img2: ''})} uploading={uploading === 'fasilitas_img2'} />
            </div>
            {/* Slot Foto 3 */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Detail 2 (Kanan Bawah)</span>
              <ImageUploadBox field="fasilitas_img3" url={content.fasilitas_img3} onUpload={handleImageUpload} onClear={() => setContent({...content, fasilitas_img3: ''})} uploading={uploading === 'fasilitas_img3'} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1 italic">Judul Section Fasilitas</label>
            <input 
              type="text"
              value={content.fasilitas_title}
              onChange={(e) => setContent({...content, fasilitas_title: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:border-amber-500 outline-none font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Pembantu UI untuk Upload Box
function ImageUploadBox({ field, url, onUpload, onClear, uploading }: any) {
  return (
    <div className="relative group aspect-square bg-black/40 rounded-[1.5rem] overflow-hidden border-2 border-dashed border-white/10 flex flex-col items-center justify-center transition-all hover:border-amber-500/50">
      {url ? (
        <>
          <img src={url} className="w-full h-full object-cover" alt="Preview" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all gap-3">
            <label className="cursor-pointer p-2 bg-amber-600 rounded-full hover:scale-110 transition-transform">
              <Upload size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(e, field)} />
            </label>
            <button onClick={onClear} className="p-2 bg-red-600 rounded-full hover:scale-110 transition-transform">
              <X size={16} />
            </button>
          </div>
        </>
      ) : (
        <label className="flex flex-col items-center cursor-pointer">
          <Upload size={24} className="text-slate-600 mb-2" />
          <span className="text-[9px] font-bold text-slate-500 uppercase">Upload</span>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(e, field)} />
        </label>
      )}
      {uploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>}
    </div>
  );
}
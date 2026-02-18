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
  UploadCloud,
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
    sejarah_img: '', // KODE BARU
    vision: '',
    vision_img: '',  // KODE BARU
    missions: [] as string[],
    mission_img: '', // KODE BARU
    fasilitas_title: '',
    fasilitas_img: '' // KODE BARU
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
          vision_img: val.vision_img || '',
          missions: Array.isArray(val.missions) ? val.missions : [],
          mission_img: val.mission_img || '',
          fasilitas_title: val.fasilitas_title || '',
          fasilitas_img: val.fasilitas_img || '',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI UPLOAD GAMBAR (KODE BARU) ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(field);

      const fileExt = file.name.split('.').pop();
      const fileName = `${field}_${Math.random()}.${fileExt}`;
      const filePath = `about_assets/${fileName}`;

      // Upload ke bucket 'about'
      const { error: uploadError } = await supabase.storage
        .from('about')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ambil Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('about')
        .getPublicUrl(filePath);

      setContent(prev => ({ ...prev, [field]: publicUrl }));
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Gambar berhasil diunggah',
        showConfirmButton: false,
        timer: 1500,
        background: '#0F172A',
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
        text: 'Konten & Media halaman Tentang Kami telah diperbarui.',
        background: '#0F172A',
        color: '#fff',
        confirmButtonColor: '#2563eb'
      });
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'GAGAL MENYIMPAN', text: error.message, background: '#0F172A', color: '#fff' });
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

  // Komponen Helper untuk Dropzone Gambar (KODE BARU)
  const ImageUploader = ({ field, currentUrl }: { field: string, currentUrl: string }) => (
    <div className="relative group w-full h-48 bg-black/40 border-2 border-dashed border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all hover:border-blue-500/50">
      {currentUrl ? (
        <>
          <img src={currentUrl} className="w-full h-full object-cover" alt="Preview" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label className="cursor-pointer p-3 bg-blue-600 rounded-full hover:bg-blue-700">
              <UploadCloud size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, field)} />
            </label>
            <button onClick={() => setContent({...content, [field]: ''})} className="p-3 bg-red-600 rounded-full hover:bg-red-700">
              <X size={20} />
            </button>
          </div>
        </>
      ) : (
        <label className="flex flex-col items-center gap-3 cursor-pointer">
          <div className="p-4 bg-white/5 rounded-full text-slate-500">
            {uploading === field ? <Loader2 className="animate-spin" /> : <ImageIcon size={30} />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Upload Media</span>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, field)} />
        </label>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#050505] min-h-screen text-white">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            KELOLA <span className="text-blue-500">TENTANG KAMI</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] mt-2">Sinkronisasi Konten & Media Utama</p>
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

      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-10">
        
        {/* SECTION 1: SEJARAH */}
        <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8 text-blue-500">
            <BookOpen size={28} />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Konten Sejarah</h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Foto Sejarah</label>
              <ImageUploader field="sejarah_img" currentUrl={content.sejarah_img} />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Type size={12} /> Judul Utama
                  </label>
                  <input 
                    type="text"
                    value={content.sejarah_title}
                    onChange={(e) => setContent({...content, sejarah_title: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:border-blue-500 outline-none font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Type size={12} /> Judul Aksen
                  </label>
                  <input 
                    type="text"
                    value={content.sejarah_accent}
                    onChange={(e) => setContent({...content, sejarah_accent: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-blue-500 focus:border-blue-500 outline-none font-bold"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Narasi Sejarah</label>
                <textarea
                  value={content.sejarah_desc}
                  onChange={(e) => setContent({...content, sejarah_desc: e.target.value})}
                  className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-5 text-slate-300 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: VISI & MISI */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* VISI */}
          <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-8 text-purple-500">
              <Target size={28} />
              <h2 className="text-2xl font-black uppercase italic tracking-tight">Visi Utama</h2>
            </div>
            <div className="space-y-6">
              <ImageUploader field="vision_img" currentUrl={content.vision_img} />
              <textarea
                value={content.vision}
                onChange={(e) => setContent({...content, vision: e.target.value})}
                className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-6 text-slate-300 focus:border-purple-500 outline-none resize-none italic"
              />
            </div>
          </div>

          {/* MISI */}
          <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-8 text-emerald-500">
              <Rocket size={28} />
              <h2 className="text-2xl font-black uppercase italic tracking-tight">Misi Strategis</h2>
            </div>
            
            <div className="space-y-6">
              <ImageUploader field="mission_img" currentUrl={content.mission_img} />
              <div className="flex gap-3">
                <input 
                  type="text"
                  placeholder="Tambah misi..."
                  value={newMission}
                  onChange={(e) => setNewMission(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMission()}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-emerald-500"
                />
                <button onClick={addMission} className="px-6 bg-emerald-600 rounded-xl"><Plus size={20} /></button>
              </div>

              <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                {content.missions.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-400 italic">{m}</span>
                    <button onClick={() => removeMission(idx)} className="text-slate-600 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: FASILITAS */}
        <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl mb-20">
          <div className="flex items-center gap-4 mb-8 text-amber-500">
            <Award size={28} />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Media & Info Fasilitas</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 items-end">
            <div className="lg:col-span-1 space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Banner Fasilitas</label>
              <ImageUploader field="fasilitas_img" currentUrl={content.fasilitas_img} />
            </div>
            <div className="lg:col-span-2 space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Judul Tab</label>
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
    </div>
  );
}
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
  Type
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State ini dirancang untuk menyuplai data ke dynamicContent di About.tsx
  const [content, setContent] = useState({
    sejarah_title: '',
    sejarah_accent: '',
    sejarah_desc: '',
    vision: '',
    missions: [] as string[],
    fasilitas_title: '',
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
          vision: val.vision || '',
          missions: Array.isArray(val.missions) ? val.missions : [],
          fasilitas_title: val.fasilitas_title || '',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
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
    <div className="p-4 md:p-8 bg-[#050505] min-h-screen text-white">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            KELOLA <span className="text-blue-500">TENTANG KAMI</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] mt-2">Sinkronisasi Konten Utama Website</p>
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
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Type size={12} /> Judul Utama (Hitam)
              </label>
              <input 
                type="text"
                placeholder="Contoh: MEMBINA"
                value={content.sejarah_title}
                onChange={(e) => setContent({...content, sejarah_title: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:border-blue-500 outline-none font-bold transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Type size={12} /> Judul Aksen (Biru)
              </label>
              <input 
                type="text"
                placeholder="Contoh: LEGENDA"
                value={content.sejarah_accent}
                onChange={(e) => setContent({...content, sejarah_accent: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-blue-500 focus:border-blue-500 outline-none font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Narasi Lengkap</label>
            <textarea
              placeholder="Tuliskan sejarah lengkap klub di sini..."
              value={content.sejarah_desc}
              onChange={(e) => setContent({...content, sejarah_desc: e.target.value})}
              className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-5 text-slate-300 focus:border-blue-500 outline-none resize-none leading-relaxed transition-all"
            />
          </div>
        </div>

        {/* SECTION 2: VISI & MISI */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* VISI */}
          <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl group">
            <div className="flex items-center gap-4 mb-8 text-purple-500">
              <Target size={28} />
              <h2 className="text-2xl font-black uppercase italic tracking-tight">Visi Utama</h2>
            </div>
            <textarea
              placeholder="Masukkan visi klub..."
              value={content.vision}
              onChange={(e) => setContent({...content, vision: e.target.value})}
              className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-slate-300 focus:border-purple-500 outline-none resize-none italic font-medium text-lg leading-snug"
            />
          </div>

          {/* MISI */}
          <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-8 text-emerald-500">
              <Rocket size={28} />
              <h2 className="text-2xl font-black uppercase italic tracking-tight">Misi Strategis</h2>
            </div>
            
            <div className="flex gap-3 mb-6">
              <input 
                type="text"
                placeholder="Tambah poin misi..."
                value={newMission}
                onChange={(e) => setNewMission(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMission()}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500"
              />
              <button 
                onClick={addMission}
                className="px-6 bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {content.missions.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                  <span className="text-sm text-slate-400 italic font-medium">{m}</span>
                  <button 
                    onClick={() => removeMission(idx)}
                    className="text-slate-600 hover:text-red-500 p-1 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {content.missions.length === 0 && (
                <p className="text-center text-slate-600 text-xs italic py-4">Belum ada misi yang ditambahkan</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: FASILITAS */}
        <div className="bg-[#0F172A] border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl mb-20">
          <div className="flex items-center gap-4 mb-8 text-amber-500">
            <Award size={28} />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Informasi Fasilitas</h2>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">
              Judul Tab Fasilitas
            </label>
            <input 
              type="text"
              placeholder="Contoh: Fasilitas Unggulan"
              value={content.fasilitas_title}
              onChange={(e) => setContent({...content, fasilitas_title: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:border-amber-500 outline-none font-bold transition-all"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
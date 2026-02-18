import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Save, BookOpen, Target, Rocket, Shield, Loader2, Award, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State disesuaikan 100% dengan kebutuhan variabel di About.tsx Anda
  const [content, setContent] = useState({
    sejarah_title: '',
    sejarah_accent: '',
    sejarah_desc: '',
    vision: '',
    missions: [] as string[],
    fasilitas_title: '',
    fasilitas_list: [] as string[]
  });

  const [missionInput, setMissionInput] = useState('');

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
          fasilitas_list: Array.isArray(val.fasilitas_list) ? val.fasilitas_list : []
        });
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
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
        title: 'BERHASIL!',
        text: 'Konten Tentang Kami telah diperbarui.',
        background: '#0F172A',
        color: '#fff',
        confirmButtonColor: '#2563eb'
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'GAGAL',
        text: error.message,
        background: '#0F172A',
        color: '#fff'
      });
    } finally {
      setSaving(false);
    }
  };

  // Fungsi tambah misi
  const addMission = () => {
    if (missionInput.trim()) {
      setContent({ ...content, missions: [...content.missions, missionInput.trim()] });
      setMissionInput('');
    }
  };

  const removeMission = (index: number) => {
    const newMissions = content.missions.filter((_, i) => i !== index);
    setContent({ ...content, missions: newMissions });
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
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Kelola <span className="text-blue-600">Tentang Kami</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">Pengaturan Informasi Utama Klub</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl shadow-blue-900/40 active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8 pb-20">
        
        {/* SEJARAH */}
        <div className="bg-[#0F172A] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shadow-inner">
              <BookOpen size={24} />
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tight">Narasi Sejarah</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kata Utama</label>
              <input 
                type="text"
                placeholder="Contoh: MEMBINA"
                value={content.sejarah_title}
                onChange={(e) => setContent({...content, sejarah_title: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kata Aksen (Biru)</label>
              <input 
                type="text"
                placeholder="Contoh: LEGENDA"
                value={content.sejarah_accent}
                onChange={(e) => setContent({...content, sejarah_accent: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-blue-500 focus:border-blue-500 outline-none font-bold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deskripsi Narasi</label>
            <textarea
              placeholder="Jelaskan sejarah klub..."
              value={content.sejarah_desc}
              onChange={(e) => setContent({...content, sejarah_desc: e.target.value})}
              className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-slate-300 focus:border-blue-500 outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* VISI & MISI */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* VISI */}
          <div className="bg-[#0F172A] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                <Target size={24} />
              </div>
              <h2 className="text-xl font-black uppercase italic tracking-tight">Visi Utama</h2>
            </div>
            <textarea
              placeholder="Tulis visi dalam tanda kutip..."
              value={content.vision}
              onChange={(e) => setContent({...content, vision: e.target.value})}
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-slate-300 focus:border-purple-500 outline-none resize-none italic font-medium"
            />
          </div>

          {/* MISI */}
          <div className="bg-[#0F172A] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                <Rocket size={24} />
              </div>
              <h2 className="text-xl font-black uppercase italic tracking-tight">Misi Strategis</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <input 
                type="text"
                placeholder="Tambah misi baru..."
                value={missionInput}
                onChange={(e) => setMissionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMission()}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
              />
              <button onClick={addMission} className="px-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-xs">ADD</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {content.missions.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 group">
                  <span className="text-xs text-slate-300 italic">{m}</span>
                  <button onClick={() => removeMission(idx)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Shield size={14} className="rotate-180" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FASILITAS */}
        <div className="bg-[#0F172A] border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex items-center gap-4 mb-6 text-amber-500">
            <Award size={28} />
            <h2 className="text-xl font-black uppercase italic tracking-tight">Fasilitas & Keunggulan</h2>
          </div>
          <input 
            type="text"
            placeholder="Sub-judul fasilitas (Contoh: Standardisasi Nasional)"
            value={content.fasilitas_title}
            onChange={(e) => setContent({...content, fasilitas_title: e.target.value})}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 outline-none font-bold mb-4"
          />
          <p className="text-[10px] text-slate-500 mb-2 italic">*Catatan: Untuk fasilitas saat ini menggunakan list statis di About.tsx, Anda bisa mengembangkannya menjadi array seperti Misi.</p>
        </div>

      </div>
    </div>
  );
}
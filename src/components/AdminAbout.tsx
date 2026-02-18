import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Save, BookOpen, Target, Shield, Loader2, Award } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State disesuaikan dengan kebutuhan konten di About.tsx
  const [content, setContent] = useState({
    sejarah_title: '',
    sejarah_desc: '',
    visi: '',
    misi: '',
    fasilitas_title: '',
    fasilitas_list: ''
  });

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
        // Handle jika data berupa string atau sudah object (JSONB)
        const val = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setContent({
          sejarah_title: val.sejarah_title || '',
          sejarah_desc: val.sejarah_desc || '',
          visi: val.visi || '',
          misi: val.misi || '',
          fasilitas_title: val.fasilitas_title || '',
          fasilitas_list: val.fasilitas_list || ''
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
      // Upsert ke tabel site_settings berdasarkan key 'about_content'
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'about_content', 
          value: content 
        }, { onConflict: 'key' });

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Konten Tentang Kami telah diperbarui secara global.',
        background: '#0F172A',
        color: '#fff',
        confirmButtonColor: '#2563eb'
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: error.message,
        background: '#0F172A',
        color: '#fff'
      });
    } finally {
      setSaving(false);
    }
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
      {/* Header Elegan */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Kelola <span className="text-blue-500">Tentang Kami</span>
          </h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Konfigurasi Konten Statis Website</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'Proses...' : 'Update Konten'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8">
        
        {/* SECTION: SEJARAH */}
        <div className="bg-[#0F172A] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6 text-blue-500">
            <BookOpen size={28} />
            <h2 className="text-xl font-black uppercase tracking-tight">Narasi Sejarah (Tab Sejarah)</h2>
          </div>
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Judul Sejarah (Contoh: MEMBINA LEGENDA MASA DEPAN)"
              value={content.sejarah_title}
              onChange={(e) => setContent({...content, sejarah_title: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 transition-all outline-none font-bold"
            />
            <textarea
              placeholder="Deskripsi Lengkap Sejarah..."
              value={content.sejarah_desc}
              onChange={(e) => setContent({...content, sejarah_desc: e.target.value})}
              className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-slate-400 focus:border-blue-500 transition-all outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* SECTION: VISI & MISI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#0F172A] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-4 mb-6 text-purple-500">
              <Target size={28} />
              <h2 className="text-xl font-black uppercase tracking-tight">Visi Klub</h2>
            </div>
            <textarea
              placeholder="Tuliskan Visi..."
              value={content.visi}
              onChange={(e) => setContent({...content, visi: e.target.value})}
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-slate-400 focus:border-purple-500 transition-all outline-none resize-none"
            />
          </div>

          <div className="bg-[#0F172A] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-4 mb-6 text-emerald-500">
              <Shield size={28} />
              <h2 className="text-xl font-black uppercase tracking-tight">Misi Klub</h2>
            </div>
            <textarea
              placeholder="Tuliskan Misi (Gunakan enter untuk baris baru)..."
              value={content.misi}
              onChange={(e) => setContent({...content, misi: e.target.value})}
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-slate-400 focus:border-emerald-500 transition-all outline-none resize-none"
            />
          </div>
        </div>

        {/* SECTION: FASILITAS */}
        <div className="bg-[#0F172A] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6 text-amber-500">
            <Award size={28} />
            <h2 className="text-xl font-black uppercase tracking-tight">Fasilitas & Keunggulan</h2>
          </div>
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Judul Fasilitas"
              value={content.fasilitas_title}
              onChange={(e) => setContent({...content, fasilitas_title: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 transition-all outline-none font-bold"
            />
            <textarea
              placeholder="Daftar Fasilitas (Contoh: GOR Standar BWF, Sport-Science, dll)"
              value={content.fasilitas_list}
              onChange={(e) => setContent({...content, fasilitas_list: e.target.value})}
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-slate-400 focus:border-amber-500 transition-all outline-none resize-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
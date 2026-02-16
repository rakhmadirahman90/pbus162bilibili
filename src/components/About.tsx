import React, { useState, useEffect } from 'react'; 
import { BookOpen, Target, Rocket, Shield, Award, MapPin, CheckCircle2 } from 'lucide-react';
// PERBAIKAN: Mengikuti path yang sama dengan Navbar agar tidak error import
import { supabase } from '../supabase'; 

interface AboutProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export default function About({ activeTab: propsActiveTab, onTabChange }: AboutProps) {
  const [internalTab, setInternalTab] = useState('sejarah');
  const [dynamicContent, setDynamicContent] = useState<Record<string, any>>({});
  
  // Menggunakan activeTab dari props (Navbar) jika ada, jika tidak pakai internal state
  const activeTab = propsActiveTab || internalTab;

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'about_content')
        .maybeSingle();
      
      if (!error && data) {
        const val = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setDynamicContent(val);
      }
    } catch (err) {
      console.error("Error fetching about content:", err);
    }
  };

  const handleTabChange = (id: string) => {
    if (onTabChange) {
      onTabChange(id);
    } else {
      setInternalTab(id);
    }
  };

  const tabs = [
    { id: 'sejarah', label: 'Sejarah' },
    { id: 'visi-misi', label: 'Visi & Misi' },
    { id: 'fasilitas', label: 'Fasilitas' }
  ];

  return (
    <section id="tentang-kami" className="relative w-full bg-white pt-16 pb-12 flex flex-col items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col">
        
        {/* DETAIL PERBAIKAN: Header Konsisten (Di Luar Konten) */}
        <div className="text-center mb-10 shrink-0">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Tentang Kami</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Tab Switcher - Tetap Konsisten di Semua Sub-menu */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-8 md:px-10 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DETAIL PERBAIKAN: Warna & Shadow (bg-slate-50/50 & Shadow Soft) */}
        <div className="bg-slate-50/50 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-14 border border-slate-100 shadow-sm flex-grow flex items-center overflow-hidden min-h-[500px]">
          
          {/* DETAIL PERBAIKAN: Layout Sejarah (Grid 2 Kolom & rounded-[2.5rem]) */}
          {activeTab === 'sejarah' && (
            <div id="sejarah" className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative group overflow-hidden rounded-[2.5rem] hidden md:block">
                  <img 
                    src="photo_2026-02-03_00-32-07.jpg" 
                    alt="Latihan PB US 162" 
                    className="relative w-full h-[380px] object-cover shadow-2xl border-4 border-white transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl md:text-4xl font-black text-slate-900 uppercase leading-tight">
                    {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">{dynamicContent.sejarah_accent || "LEGENDA"}</span> MASA DEPAN
                  </h3>
                  <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                    {dynamicContent.sejarah_desc || "PB US 162 Bilibili adalah ekosistem pembinaan bulutangkis terpadu yang menggabungkan disiplin dan teknik modern untuk mencetak juara masa depan."}
                  </p>
                  
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["Sport-science intensif", "GOR Standar BWF", "Karier Profesional", "Klasemen Digital"].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-slate-700 font-bold group">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                            <CheckCircle2 size={14} className="text-blue-600 group-hover:text-white" />
                        </div>
                        <span className="text-xs md:text-sm uppercase tracking-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* DETAIL PERBAIKAN: Layout Visi & Misi (Dua Kartu Sejajar Horizontal) */}
          {activeTab === 'visi-misi' && (
            <div id="visi-misi" className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 grid lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group flex flex-col justify-center min-h-[300px]">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-100">
                  <Target size={28} />
                </div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase">Visi Utama</span>
                <p className="text-slate-700 text-xl md:text-2xl font-bold leading-tight italic">
                  "{dynamicContent.vision || "Menjadi klub rujukan nasional yang mencetak atlet berprestasi dunia."}"
                </p>
              </div>

              <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group flex flex-col justify-center min-h-[300px]">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-slate-100">
                  <Rocket size={28} />
                </div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase">Misi Kami</span>
                <ul className="space-y-4 text-slate-700 font-bold text-sm md:text-base italic">
                  {(dynamicContent.missions || ["Latihan terstruktur & disiplin", "Fasilitas internasional", "Kompetisi rutin", "Karakter juara"]).map((misi, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-blue-500 shrink-0" /> {misi}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* DETAIL PERBAIKAN: Layout Fasilitas (List Kiri & Collage Grid Kanan) */}
          {activeTab === 'fasilitas' && (
            <div id="fasilitas" className="w-full animate-in fade-in duration-500 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 uppercase">Fasilitas Standar Nasional</h3>
                <ul className="grid grid-cols-1 gap-4">
                  {[
                    'Lapangan karpet standar BWF', 
                    'Pencahayaan LED anti-silau', 
                    'Fitness & Conditioning center', 
                    'Asrama atlet (Home base)'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-500 transition-all">
                      <span className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                        <Shield size={18} />
                      </span>
                      <span className="text-base md:text-lg font-bold text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Collage Grid Foto: 1 Besar, 2 Kecil Vertikal */}
              <div className="grid grid-cols-2 gap-4 h-[350px] md:h-[450px]">
                <img 
                  src="dpnkwabotttfihp7gf3r.jpg" 
                  alt="Badminton Court" 
                  className="w-full h-full object-cover rounded-[2rem] shadow-md border-2 border-white"
                />
                <div className="grid grid-rows-2 gap-4">
                  <img 
                    src="dpnkwabotttfihp7gf3r.jpg" 
                    alt="Racket Detail" 
                    className="w-full h-full object-cover rounded-[2rem] shadow-md border-2 border-white"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&q=80" 
                    alt="Training Session" 
                    className="w-full h-full object-cover rounded-[2rem] shadow-md border-2 border-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
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
    /* PERBAIKAN: 
       1. Menggunakan h-auto md:min-h-[90vh] agar tidak memaksa tinggi penuh jika layar kecil.
       2. Menghilangkan py-20 yang terlalu besar dan menggantinya dengan pt-16 pb-8 agar tidak menabrak section bawah.
    */
    <section id="tentang-kami" className="relative w-full h-auto md:min-h-[90vh] bg-white pt-16 pb-8 flex flex-col items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col">
        
        {/* Judul Utama - Tetap muncul sebagai identitas section */}
        <div className="text-center mb-6 md:mb-8 shrink-0">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight uppercase">Tentang Kami</h2>
          <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Tab Switcher - Tetap muncul di semua sub-menu */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-10 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 md:px-8 py-2 md:py-2.5 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Box - Dioptimalkan tingginya agar pas dengan section bawah */}
        <div className="bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm flex-grow flex items-center overflow-hidden">
          
          {/* SEJARAH */}
          {activeTab === 'sejarah' && (
            <div id="sejarah" className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid lg:grid-cols-2 gap-6 md:gap-10 items-center">
                <div className="relative group overflow-hidden rounded-[1.5rem] hidden md:block">
                  <img 
                    src="photo_2026-02-03_00-32-07.jpg" 
                    alt="Latihan PB US 162" 
                    className="relative w-full h-[250px] lg:h-[320px] object-cover shadow-xl border-4 border-white transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-xl md:text-3xl font-black text-slate-900 uppercase leading-tight">
                    {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">{dynamicContent.sejarah_accent || "LEGENDA"}</span> MASA DEPAN
                  </h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                    {dynamicContent.sejarah_desc || "PB US 162 Bilibili adalah ekosistem pembinaan bulutangkis terpadu yang menggabungkan disiplin dan teknik modern."}
                  </p>
                  
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "Sport-science intensif",
                      "GOR Standar BWF",
                      "Karier Profesional",
                      "Klasemen Digital"
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-slate-700 font-bold group">
                        <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                        <span className="text-[11px] md:text-xs uppercase tracking-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* VISI MISI */}
          {activeTab === 'visi-misi' && (
            <div id="visi-misi" className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 grid lg:grid-cols-2 gap-4 md:gap-6 items-stretch">
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group flex flex-col justify-center min-h-[160px]">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600 group-hover:scale-110 transition-transform">
                  <Target size={100} />
                </div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <Target size={20} />
                </div>
                <span className="text-blue-600 font-black block mb-2 tracking-widest text-[10px] uppercase">Visi Utama</span>
                <p className="text-slate-700 text-lg md:text-xl font-bold leading-tight italic">
                  "{dynamicContent.vision || "Menjadi klub rujukan nasional yang mencetak atlet berprestasi dunia."}"
                </p>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group flex flex-col justify-center min-h-[160px]">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600 group-hover:scale-110 transition-transform">
                  <Rocket size={100} />
                </div>
                <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <Rocket size={20} />
                </div>
                <span className="text-blue-600 font-black block mb-2 tracking-widest text-[10px] uppercase">Misi Kami</span>
                <ul className="grid grid-cols-1 gap-1 text-slate-700 font-bold text-[11px] md:text-xs">
                  {(dynamicContent.missions || ["Latihan terstruktur & disiplin", "Fasilitas internasional", "Kompetisi rutin", "Karakter juara"]).map((misi, i) => (
                    <li key={i} className="flex items-center gap-2 italic">
                      <CheckCircle2 size={12} className="text-blue-500 shrink-0" /> {misi}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div id="fasilitas" className="w-full animate-in fade-in duration-500 grid lg:grid-cols-2 gap-6 md:gap-10 items-center">
              <div>
                <h3 className="text-lg md:text-xl font-black mb-4 md:mb-6 text-slate-800 uppercase">Fasilitas Standar Nasional</h3>
                <ul className="grid grid-cols-1 gap-3">
                  {[
                    'Lapangan karpet standar BWF', 
                    'Pencahayaan LED anti-silau', 
                    'Fitness & Conditioning center', 
                    'Asrama atlet (Home base)'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-slate-600 text-xs md:text-sm font-bold group p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <span className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                        <Shield size={14} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-2 h-[180px] md:h-[280px]">
                <img 
                  src="dpnkwabotttfihp7gf3r.jpg" 
                  alt="Badminton Court" 
                  className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white"
                />
                <div className="grid grid-rows-2 gap-2">
                  <img 
                    src="dpnkwabotttfihp7gf3r.jpg" 
                    alt="Racket" 
                    className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&q=80" 
                    alt="Training Gear" 
                    className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white"
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
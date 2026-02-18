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
    <section id="tentang-kami" className="relative w-full h-auto bg-white pt-16 pb-12 flex flex-col items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 w-full flex flex-col">
        
        {/* Header Section */}
        <div className="text-center mb-8 shrink-0">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">
            Tentang <span className="text-blue-600">Kami</span>
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full shadow-sm"></div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 md:px-10 py-3 rounded-2xl font-bold text-[11px] md:text-xs uppercase tracking-widest transition-all duration-300 border-2 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200 scale-105' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200 hover:text-blue-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Box */}
        <div className="bg-slate-50/50 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 border border-slate-100 shadow-sm min-h-[500px] flex items-center transition-all duration-500">
          
          {/* 1. SEJARAH */}
          {activeTab === 'sejarah' && (
            <div id="sejarah" className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative group hidden md:block">
                  <div className="absolute -inset-4 bg-blue-100/50 rounded-[3rem] blur-2xl group-hover:bg-blue-200/50 transition-colors"></div>
                  <img 
                    src={dynamicContent.sejarah_img || "photo_2026-02-03_00-32-07.jpg"} 
                    alt="Latihan PB US 162" 
                    className="relative w-full h-[400px] object-cover rounded-[2.5rem] shadow-2xl border-4 border-white transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>

                <div className="space-y-6">
                  <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Legacy & Spirit
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase leading-[1.1]">
                    {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">{dynamicContent.sejarah_accent || "LEGENDA"}</span> MASA DEPAN
                  </h3>
                  <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                    {dynamicContent.sejarah_desc || "PB US 162 Bilibili hadir sebagai pusat keunggulan bulutangkis yang mengintegrasikan sport-science dengan disiplin tinggi untuk mencetak atlet kelas dunia."}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {["Sport-science intensif", "GOR Standar BWF", "Karier Profesional", "Klasemen Digital"].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 uppercase">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. VISI MISI */}
          {activeTab === 'visi-misi' && (
            <div id="visi-misi" className="w-full animate-in fade-in slide-in-from-right-8 duration-700 grid lg:grid-cols-2 gap-8 items-stretch">
              {/* Visi Card */}
              <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-5 text-blue-600 transition-transform duration-700 group-hover:scale-110">
                  <Target size={250} />
                </div>
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200">
                  <Target size={32} />
                </div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase italic">Visi Utama</span>
                <p className="text-slate-800 text-2xl md:text-3xl font-bold leading-tight italic relative z-10">
                  "{dynamicContent.vision || "Menjadi klub rujukan nasional yang mencetak atlet berprestasi dunia."}"
                </p>
              </div>

              {/* Misi Card */}
              <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-5 text-slate-900 transition-transform duration-700 group-hover:scale-110">
                  <Rocket size={250} />
                </div>
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                  <Rocket size={32} />
                </div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase italic">Misi Strategis</span>
                <ul className="space-y-4 relative z-10">
                  {(Array.isArray(dynamicContent.missions) && dynamicContent.missions.length > 0 
                    ? dynamicContent.missions 
                    : ["Latihan terstruktur & disiplin", "Fasilitas internasional", "Kompetisi rutin", "Karakter juara"]
                  ).map((misi, i) => (
                    <li key={i} className="flex items-center gap-4 text-slate-700 font-bold text-sm md:text-base italic group/item">
                      <div className="w-2 h-2 bg-blue-500 rounded-full group-hover/item:scale-150 transition-transform"></div>
                      {misi}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 3. FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div id="fasilitas" className="w-full animate-in fade-in zoom-in-95 duration-500 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase mb-2">
                    {dynamicContent.fasilitas_title || "Fasilitas Unggulan"}
                  </h3>
                  <p className="text-slate-500 font-medium italic">Standardisasi Nasional & Internasional (BWF)</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    'Lapangan karpet standar BWF', 
                    'Pencahayaan LED anti-silau', 
                    'Fitness & Conditioning center', 
                    'Asrama atlet (Home base)'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-5 p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                        <Shield size={22} />
                      </div>
                      <span className="text-sm md:text-base font-black text-slate-700 uppercase tracking-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fasilitas Gallery Collage (Menggunakan Data Dinamis) */}
              <div className="grid grid-cols-2 gap-4 h-[400px] md:h-[500px]">
                <div className="relative overflow-hidden rounded-[2.5rem] shadow-lg group">
                   <img 
                    src={dynamicContent.fasilitas_img1 || "dpnkwabotttfihp7gf3r.jpg"} 
                    alt="Main Court" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                    <span className="text-white font-bold text-xs uppercase tracking-widest">Arena Utama</span>
                  </div>
                </div>
                <div className="grid grid-rows-2 gap-4">
                  <img 
                    src={dynamicContent.fasilitas_img2 || "dpnkwabotttfihp7gf3r.jpg"} 
                    alt="Side View" 
                    className="w-full h-full object-cover rounded-[2.5rem] shadow-md border-2 border-white transition-transform duration-700 hover:scale-105"
                  />
                  <img 
                    src={dynamicContent.fasilitas_img3 || "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&q=80"} 
                    alt="Equipment" 
                    className="w-full h-full object-cover rounded-[2.5rem] shadow-md border-2 border-white transition-transform duration-700 hover:scale-105"
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
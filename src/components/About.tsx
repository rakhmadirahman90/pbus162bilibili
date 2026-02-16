import React, { useState, useEffect } from 'react'; 
import { Target, Rocket, Shield, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabase'; 

interface AboutProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export default function About({ activeTab: propsActiveTab, onTabChange }: AboutProps) {
  const [internalTab, setInternalTab] = useState('sejarah');
  const [dynamicContent, setDynamicContent] = useState<Record<string, any>>({});
  
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
    <section id="tentang-kami" className="relative w-full bg-white pt-16 pb-20 flex flex-col items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 w-full flex flex-col">
        
        {/* Header Seksi - Konsisten di semua tab */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight uppercase italic">Tentang Kami</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Tab Switcher - Rounded Pills Style */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-sm'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Container Konten Utama */}
        <div className="bg-slate-50/50 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 border border-slate-100 shadow-sm min-h-[520px] flex items-center">
          
          {/* TAB: SEJARAH */}
          {activeTab === 'sejarah' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative group overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white aspect-video lg:aspect-square">
                  <img 
                    src="photo_2026-02-03_00-32-07.jpg" 
                    alt="Latihan PB US 162" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl md:text-4xl font-black text-slate-900 uppercase leading-tight italic">
                    {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">{dynamicContent.sejarah_accent || "LEGENDA"}</span> MASA DEPAN
                  </h3>
                  <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium">
                    {dynamicContent.sejarah_desc || "PB US 162 Bilibili adalah ekosistem pembinaan bulutangkis terpadu yang menggabungkan disiplin, teknik modern, dan sport-science."}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["Sport-science Intensif", "GOR Standar BWF", "Karier Profesional", "Klasemen Digital"].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 group">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                            <CheckCircle2 size={14} className="text-blue-600 group-hover:text-white" />
                        </div>
                        <span className="text-xs font-black text-slate-700 uppercase">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VISI & MISI */}
          {activeTab === 'visi-misi' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 grid lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-600">
                  <Target size={150} />
                </div>
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-100">
                  <Target size={32} />
                </div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase italic">Visi Utama</span>
                <p className="text-slate-800 text-xl md:text-2xl font-bold leading-tight italic">
                  "{dynamicContent.vision || "Menjadi klub bulutangkis rujukan nasional yang mencetak atlet berprestasi dunia."}"
                </p>
              </div>

              <div className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900">
                  <Rocket size={150} />
                </div>
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                  <Rocket size={32} />
                </div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase italic">Misi Kami</span>
                <ul className="space-y-4 text-slate-700 font-bold text-sm md:text-base italic">
                  {(dynamicContent.missions || ["Latihan terstruktur & disiplin", "Fasilitas berstandar internasional", "Kompetisi rutin berkala", "Pembentukan karakter juara"]).map((misi, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <CheckCircle2 size={20} className="text-blue-500 shrink-0" /> {misi}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB: FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div className="w-full animate-in fade-in slide-in-from-right-6 duration-700 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 uppercase italic">Fasilitas Standar Nasional</h3>
                <div className="space-y-4">
                  {[
                    'Lapangan karpet standar BWF', 
                    'Pencahayaan LED anti-silau', 
                    'Fitness & Conditioning center', 
                    'Asrama atlet (Home base)'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-500 hover:shadow-md transition-all">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                        <Shield size={20} />
                      </div>
                      <span className="text-base md:text-lg font-bold text-slate-700 uppercase italic tracking-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collage Grid Foto - 1 Besar & 2 Kecil Vertikal */}
              <div className="grid grid-cols-2 gap-4 h-[400px] md:h-[500px]">
                <img 
                  src="dpnkwabotttfihp7gf3r.jpg" 
                  alt="Lapangan Utama" 
                  className="w-full h-full object-cover rounded-[2rem] shadow-md border-2 border-white"
                />
                <div className="grid grid-rows-2 gap-4">
                  <img 
                    src="dpnkwabotttfihp7gf3r.jpg" 
                    alt="Detail Fasilitas" 
                    className="w-full h-full object-cover rounded-[2rem] shadow-md border-2 border-white"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&q=80" 
                    alt="Alat Latihan" 
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
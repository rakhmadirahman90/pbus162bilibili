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
    <section id="tentang-kami" className="relative w-full bg-white py-12 md:py-16 flex flex-col items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full flex flex-col">
        
        {/* HEADER: Fix posisi & Ukuran */}
        <div className="text-center mb-8 shrink-0">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight uppercase">Tentang Kami</h2>
          <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* TAB SWITCHER: Kompak & Presisi */}
        <div className="flex justify-center gap-2 md:gap-4 mb-10 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 md:px-10 py-2.5 md:py-3 rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105' 
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT BOX: Mengunci Tinggi agar Pas */}
        <div className="bg-slate-50/50 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 border border-slate-100 shadow-sm flex items-center min-h-[450px] md:h-[500px]">
          
          {/* TAB 1: SEJARAH */}
          {activeTab === 'sejarah' && (
            <div className="w-full animate-in fade-in duration-500 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="hidden md:flex justify-center">
                <img 
                  src="photo_2026-02-03_00-32-07.jpg" 
                  alt="PB US 162" 
                  className="w-full max-h-[350px] object-cover rounded-[2.5rem] shadow-2xl border-4 border-white"
                />
              </div>
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight uppercase">
                  MEMBINA <span className="text-blue-600">LEGENDA</span> MASA DEPAN
                </h3>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                  {dynamicContent.sejarah_desc || "PB US 162 Bilibili adalah ekosistem pembinaan bulutangkis terpadu yang menggabungkan disiplin, teknik modern, dan sport-science."}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                  {["Sport-Science", "GOR Standar BWF", "Karier Atlet", "Sistem Digital"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-blue-500" />
                      <span className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-tighter">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISI MISI */}
          {activeTab === 'visi-misi' && (
            <div className="w-full animate-in fade-in duration-500 grid md:grid-cols-2 gap-4 md:gap-8 items-stretch h-full">
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6">
                  <Target size={24} />
                </div>
                <h4 className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">Visi Utama</h4>
                <p className="text-slate-800 text-lg md:text-xl font-bold italic leading-snug">
                  "{dynamicContent.vision || "Menjadi klub rujukan nasional yang mencetak atlet berprestasi dunia."}"
                </p>
              </div>
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-6">
                  <Rocket size={24} />
                </div>
                <h4 className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">Misi Kami</h4>
                <ul className="space-y-2 md:space-y-3">
                  {["Latihan Terstruktur", "Fasilitas Standar Internasional", "Kompetisi Rutin", "Karakter Juara"].map((misi, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-bold italic text-xs md:text-sm">
                      <CheckCircle2 size={16} className="text-blue-500" /> {misi}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div className="w-full animate-in fade-in duration-500 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic">Fasilitas Standar Nasional</h3>
                <div className="grid gap-3">
                  {['Lapangan Karpet BWF', 'LED Anti-Silau', 'Fitness Center', 'Asrama Atlet'].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <Shield size={16} />
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-slate-800 uppercase tracking-widest">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 h-[300px] md:h-[380px]">
                <img src="dpnkwabotttfihp7gf3r.jpg" className="w-full h-full object-cover rounded-[2rem] border-2 border-white shadow-md" alt="GOR 1" />
                <div className="grid grid-rows-2 gap-3">
                  <img src="dpnkwabotttfihp7gf3r.jpg" className="w-full h-full object-cover rounded-[2rem] border-2 border-white shadow-md" alt="GOR 2" />
                  <img src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400" className="w-full h-full object-cover rounded-[2rem] border-2 border-white shadow-md" alt="GOR 3" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
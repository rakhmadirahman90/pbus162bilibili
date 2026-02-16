import React, { useState, useEffect } from 'react'; 
import { BookOpen, Target, Rocket, Shield, Award, MapPin, CheckCircle2 } from 'lucide-react';
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
    } catch (err) { console.error("Error fetching about content:", err); }
  };

  const handleTabChange = (id: string) => {
    if (onTabChange) { onTabChange(id); } else { setInternalTab(id); }
  };

  const tabs = [
    { id: 'sejarah', label: 'Sejarah' },
    { id: 'visi-misi', label: 'Visi & Misi' },
    { id: 'fasilitas', label: 'Fasilitas' }
  ];

  return (
    /* PERBAIKAN: Menggunakan h-screen/90 agar section ini terkunci di satu layar */
    <section id="tentang-kami" className="relative w-full min-h-[85vh] lg:h-[90vh] bg-white flex flex-col pt-10 pb-4 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col">
        
        {/* Header Section - Selalu Muncul */}
        <div className="text-center mb-4 shrink-0">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">Tentang Kami</h2>
          <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Tab Switcher - Selalu Muncul */}
        <div className="flex justify-center gap-2 mb-6 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-1.5 rounded-lg font-bold text-[10px] md:text-xs uppercase tracking-wider transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Box - Dibuat Flex Grow agar fleksibel mengikuti sisa ruang layar */}
        <div className="bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 border border-slate-100 shadow-sm flex-grow flex items-center justify-center overflow-hidden">
          
          {/* SEJARAH - Layout Kompak */}
          {activeTab === 'sejarah' && (
            <div className="w-full animate-in fade-in duration-500">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="hidden md:block">
                  <img 
                    src="photo_2026-02-03_00-32-07.jpg" 
                    className="w-full h-48 lg:h-64 object-cover rounded-2xl shadow-lg border-2 border-white" 
                    alt="Logo PB"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl lg:text-2xl font-black text-slate-900 uppercase">
                    {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">LEGENDA</span>
                  </h3>
                  <p className="text-slate-500 text-xs lg:text-sm font-medium leading-relaxed max-w-md">
                    {dynamicContent.sejarah_desc || "Ekosistem pembinaan bulutangkis terpadu di Parepare yang menggabungkan disiplin dan teknik modern."}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {["Sport-Science", "Fasilitas BWF", "Digital Monitoring"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-700 font-bold text-[10px] uppercase">
                        <CheckCircle2 size={12} className="text-blue-600" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISI MISI - Dibuat Side-by-Side agar pendek secara vertikal */}
          {activeTab === 'visi-misi' && (
            <div className="w-full animate-in fade-in duration-500 grid md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
                <Target size={24} className="text-blue-600 mb-2" />
                <span className="text-blue-600 font-black text-[9px] uppercase tracking-widest mb-1">Visi</span>
                <p className="text-slate-700 text-sm lg:text-base font-bold italic leading-snug">
                   "{dynamicContent.vision || "Menjadi rujukan nasional yang mencetak atlet berprestasi dunia."}"
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
                <Rocket size={24} className="text-slate-800 mb-2" />
                <span className="text-blue-600 font-black text-[9px] uppercase tracking-widest mb-1">Misi</span>
                <ul className="text-slate-700 text-[10px] lg:text-[11px] font-bold space-y-1">
                  {["Latihan Terstruktur", "Fasilitas Standar", "Karakter Juara"].map((m, i) => (
                    <li key={i} className="flex items-center gap-2 italic"><CheckCircle2 size={10} className="text-blue-500" /> {m}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* FASILITAS - Grid Pendek */}
          {activeTab === 'fasilitas' && (
            <div className="w-full animate-in fade-in duration-500 grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <h3 className="text-lg font-black text-slate-800 uppercase">Gedung Olahraga</h3>
                <div className="grid grid-cols-1 gap-2">
                  {['Karpet Standar BWF', 'LED Anti-Silau', 'Asrama Atlet'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                      <Shield size={12} className="text-blue-600" /> {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 h-32 md:h-48">
                <img src="dpnkwabotttfihp7gf3r.jpg" className="w-full h-full object-cover rounded-xl" alt="GOR 1" />
                <img src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400" className="w-full h-full object-cover rounded-xl" alt="GOR 2" />
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
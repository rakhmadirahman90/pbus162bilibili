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
    /* PERBAIKAN UTAMA: 
       - min-h-screen & h-screen: Memastikan section memenuhi layar.
       - flex flex-col: Agar konten judul, tab, dan box tersebar merata.
    */
    <section id="tentang-kami" className="relative w-full min-h-screen md:h-screen flex flex-col bg-white py-12 md:py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col">
        
        {/* Judul Utama - Diperkecil marginnya agar hemat ruang */}
        <div className="text-center mb-6 md:mb-4 shrink-0">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">Tentang Kami</h2>
          <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Tab Switcher - Diperkecil gap dan paddingnya */}
        <div className="flex justify-center gap-2 mb-6 md:mb-6 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 md:px-8 py-2 md:py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Box - flex-grow agar mengisi sisa layar */}
        <div className="bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm flex-grow overflow-hidden flex flex-col justify-center">
          
          {/* SEJARAH */}
          {activeTab === 'sejarah' && (
            <div id="sejarah" className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col justify-center">
              <div className="text-center mb-6 md:mb-10">
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 md:mb-4 uppercase tracking-tight">
                  {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">{dynamicContent.sejarah_accent || "LEGENDA"}</span> MASA DEPAN
                </h3>
                <p className="text-slate-500 text-sm md:text-base max-w-3xl mx-auto leading-relaxed font-medium">
                  {dynamicContent.sejarah_desc || "PB US 162 Bilibili bukan sekadar klub, melainkan ekosistem pembinaan bulutangkis terpadu."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="relative group hidden md:block">
                  <div className="absolute -inset-2 bg-blue-600/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <img 
                    src="photo_2026-02-03_00-32-07.jpg" 
                    alt="Latihan PB US 162" 
                    className="relative w-full h-[300px] md:h-[350px] object-cover rounded-[2rem] shadow-2xl border-4 border-white"
                  />
                </div>

                <div className="space-y-4 md:space-y-6">
                  <h4 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
                    Pusat Pelatihan Berstandar Tinggi
                  </h4>
                  <ul className="grid grid-cols-1 gap-3 md:gap-4">
                    {[
                      "Pelatihan intensif berbasis sport-science",
                      "Fasilitas GOR modern standar BWF",
                      "Jenjang karier atlet profesional",
                      "Sistem klasemen digital real-time"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-slate-700 font-semibold text-sm md:text-base">
                        <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 size={14} className="text-blue-600" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* VISI MISI */}
          {activeTab === 'visi-misi' && (
            <div id="visi-misi" className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid md:grid-cols-2 gap-6 md:gap-8 items-center h-full">
              <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600">
                  <Target size={150} />
                </div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4">
                  <Target size={20} />
                </div>
                <span className="text-blue-600 font-black block mb-2 tracking-[0.2em] text-[10px] uppercase">Visi Utama</span>
                <p className="text-slate-700 text-lg md:text-2xl font-bold leading-tight italic">
                  "{dynamicContent.vision || "Menjadi klub bulutangkis rujukan nasional yang mencetak atlet berprestasi dunia."}"
                </p>
              </div>

              <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600">
                  <Rocket size={150} />
                </div>
                <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center mb-4">
                  <Rocket size={20} />
                </div>
                <span className="text-blue-600 font-black block mb-2 tracking-[0.2em] text-[10px] uppercase">Misi Kami</span>
                <ul className="space-y-2 text-slate-700 font-medium text-sm md:text-base">
                  {(dynamicContent.missions || ["Pelatihan terstruktur & disiplin", "Fasilitas berstandar internasional", "Kompetisi rutin berkala", "Pembentukan karakter juara"]).map((misi, i) => (
                    <li key={i} className="flex items-center gap-2 italic">
                      <CheckCircle2 size={14} className="text-blue-500" /> {misi}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div id="fasilitas" className="animate-in fade-in duration-500 grid md:grid-cols-2 gap-8 items-center h-full">
              <div className="flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-black mb-6 text-slate-800 uppercase">Fasilitas Utama</h3>
                <ul className="space-y-3 md:space-y-4">
                  {[
                    'Lapangan karpet standar BWF', 
                    'Pencahayaan LED anti-silau', 
                    'Fitness & Conditioning center', 
                    'Asrama atlet (Home base)'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-4 text-slate-600 text-sm md:text-lg font-medium group">
                      <span className="w-8 h-8 bg-white text-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Shield size={16} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 h-[250px] md:h-[350px]">
                <img 
                  src="dpnkwabotttfihp7gf3r.jpg" 
                  alt="Badminton Court" 
                  className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white"
                />
                <div className="grid grid-rows-2 gap-4">
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
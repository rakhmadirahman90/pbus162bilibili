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
    <section id="tentang-kami" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Judul Utama */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Tentang Kami</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-3 mb-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Box */}
        <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm min-h-[450px]">
          
          {/* SEJARAH - Menggunakan ID agar bisa di-scroll dari Navbar */}
          {activeTab === 'sejarah' && (
            <div id="sejarah" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                  {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">{dynamicContent.sejarah_accent || "LEGENDA"}</span> MASA DEPAN
                </h3>
                <p className="text-slate-500 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
                  {dynamicContent.sejarah_desc || "PB US 162 Bilibili bukan sekadar klub, melainkan ekosistem pembinaan bulutangkis terpadu yang menggabungkan disiplin, teknik modern, dan semangat juang."}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-blue-600/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <img 
                    src="photo_2026-02-03_00-32-07.jpg" 
                    alt="Latihan PB US 162" 
                    className="relative w-full h-[450px] object-cover rounded-[2rem] shadow-2xl border-4 border-white"
                  />
                </div>

                <div className="space-y-6">
                  <h4 className="text-2xl font-black text-slate-800 leading-tight">
                    Pusat Pelatihan Berstandar Tinggi di Parepare
                  </h4>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    Lahir dari semangat memajukan olahraga di Sulawesi Selatan, <strong>PB US 162</strong> kini menjadi barometer pembinaan bulutangkis regional.
                  </p>
                  
                  <ul className="space-y-4">
                    {[
                      "Pelatihan intensif berbasis sport-science",
                      "Fasilitas GOR modern dengan pencahayaan standar BWF",
                      "Jenjang karier atlet dari pemula hingga profesional",
                      "Monitoring perkembangan poin melalui sistem klasemen digital"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-slate-700 font-semibold group">
                        <div className="mt-1 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                          <CheckCircle2 size={16} className="text-blue-600 group-hover:text-white" />
                        </div>
                        <span className="text-[16px] leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* VISI MISI - Menggunakan ID agar bisa di-scroll dari Navbar */}
          {activeTab === 'visi-misi' && (
            <div id="visi-misi" className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid md:grid-cols-2 gap-8 h-full items-center">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group min-h-[300px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-blue-600 group-hover:scale-110 transition-transform">
                  <Target size={120} />
                </div>
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                  <Target size={24} />
                </div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase">Visi Utama</span>
                <p className="text-slate-700 text-2xl font-bold leading-tight italic">
                  "{dynamicContent.vision || "Menjadi klub bulutangkis rujukan nasional yang mencetak atlet berprestasi dunia."}"
                </p>
              </div>

              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group min-h-[300px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-blue-600 group-hover:scale-110 transition-transform">
                  <Rocket size={120} />
                </div>
                <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-slate-200">
                  <Rocket size={24} />
                </div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase">Misi Kami</span>
                <ul className="space-y-3 text-slate-700 font-medium">
                  {(dynamicContent.missions || ["Pelatihan terstruktur & disiplin", "Fasilitas berstandar internasional", "Kompetisi rutin berkala", "Pembentukan karakter juara"]).map((misi, i) => (
                    <li key={i} className="flex items-center gap-2 italic">
                      <CheckCircle2 size={16} className="text-blue-500" /> {misi}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* FASILITAS - Menggunakan ID agar bisa di-scroll dari Navbar */}
          {activeTab === 'fasilitas' && (
            <div id="fasilitas" className="animate-in fade-in duration-500 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-black mb-8 text-slate-800 uppercase">Fasilitas Standar Nasional</h3>
                <ul className="space-y-5">
                  {[
                    'Lapangan karpet standar BWF', 
                    'Pencahayaan LED anti-silau', 
                    'Fitness & Conditioning center', 
                    'Asrama atlet (Home base)', 
                    'Shower & Locker room'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-4 text-slate-600 text-lg font-medium group">
                      <span className="w-8 h-8 bg-white text-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Shield size={16} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 h-[350px]">
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
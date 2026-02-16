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
    <section id="tentang-kami" className="relative w-full bg-white pt-12 pb-16 flex flex-col items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex flex-col">
        
        {/* Judul Utama - Sesuai Gambar: Hitam, Bold, Center */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">TENTANG KAMI</h2>
          <div className="w-16 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Tab Switcher - Sesuai Gambar: Rounded halus, Abu-abu muda untuk non-aktif */}
        <div className="flex justify-center gap-3 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-8 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Kotak Konten Utama - Sesuai Gambar: Rounded besar, Background sangat muda */}
        <div className="bg-slate-50/50 rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-sm min-h-[500px]">
          
          {/* TAB: SEJARAH - Sesuai Gambar: Teks di Kanan, Logo di Kiri */}
          {activeTab === 'sejarah' && (
            <div className="w-full animate-in fade-in duration-700">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative flex justify-center">
                  {/* Gambar Logo/Hero Sejarah */}
                  <img 
                    src="photo_2026-02-03_00-32-07.jpg" 
                    alt="Logo PB US 162" 
                    className="w-full max-w-[500px] rounded-[2.5rem] shadow-xl"
                  />
                </div>

                <div className="space-y-6">
                  <h3 className="text-4xl font-black text-slate-900 leading-tight">
                    MEMBINA <span className="text-blue-600">LEGENDA</span> MASA DEPAN
                  </h3>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium">
                    {dynamicContent.sejarah_desc || "PB US 162 Bilibili bukan sekadar klub, melainkan ekosistem pembinaan bulutangkis terpadu yang menggabungkan disiplin, teknik modern, dan semangat juang."}
                  </p>
                  
                  {/* List Fitur Sejarah - Sesuai Gambar: Grid 2 Kolom */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 pt-4 border-t border-slate-200">
                    {[
                      { label: "Sport-science intensif", icon: <CheckCircle2 size={18}/> },
                      { label: "GOR Standar BWF", icon: <CheckCircle2 size={18}/> },
                      { label: "Karier Profesional", icon: <CheckCircle2 size={18}/> },
                      { label: "Klasemen Digital", icon: <CheckCircle2 size={18}/> }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-blue-500">{item.icon}</span>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VISI & MISI - Sesuai Gambar: Dua Box Putih Bersih */}
          {activeTab === 'visi-misi' && (
            <div className="w-full animate-in fade-in duration-700 grid lg:grid-cols-2 gap-8">
              <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center relative">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
                  <Target size={24} />
                </div>
                <h4 className="text-blue-600 font-black text-xs uppercase tracking-widest mb-4">Visi Utama</h4>
                <p className="text-slate-800 text-2xl font-bold italic leading-snug">
                  "{dynamicContent.vision || "Menjadi klub bulutangkis rujukan nasional yang mencetak atlet berprestasi dunia."}"
                </p>
              </div>

              <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-6 shadow-md">
                  <Rocket size={24} />
                </div>
                <h4 className="text-blue-600 font-black text-xs uppercase tracking-widest mb-4">Misi Kami</h4>
                <ul className="space-y-3">
                  {(dynamicContent.missions || ["Latihan terstruktur & disiplin", "Fasilitas berstandar internasional", "Kompetisi rutin berkala", "Pembentukan karakter juara"]).map((misi, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-bold italic text-sm md:text-base">
                      <CheckCircle2 size={18} className="text-blue-500 shrink-0" /> {misi}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB: FASILITAS - Sesuai Gambar: List di Kiri, Collage di Kanan */}
          {activeTab === 'fasilitas' && (
            <div className="w-full animate-in fade-in duration-700 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-black text-slate-900 uppercase italic mb-8">FASILITAS STANDAR NASIONAL</h3>
                <div className="space-y-4">
                  {[
                    'Lapangan karpet standar BWF', 
                    'Pencahayaan LED anti-silau', 
                    'Fitness & Conditioning center', 
                    'Asrama atlet (Home base)'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 group hover:border-blue-500 transition-all">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <Shield size={18} />
                      </div>
                      <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Collage Foto sesuai Screenshot */}
              <div className="grid grid-cols-2 gap-4 h-[450px]">
                <img src="dpnkwabotttfihp7gf3r.jpg" className="w-full h-full object-cover rounded-[2rem]" alt="Fasilitas 1" />
                <div className="grid grid-rows-2 gap-4">
                  <img src="dpnkwabotttfihp7gf3r.jpg" className="w-full h-full object-cover rounded-[2rem]" alt="Fasilitas 2" />
                  <img src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&q=80" className="w-full h-full object-cover rounded-[2rem]" alt="Fasilitas 3" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
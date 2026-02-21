import React, { useState, useEffect } from 'react'; 
import { BookOpen, Target, Rocket, Shield, Award, MapPin, CheckCircle2, Users2, ArrowRight, User, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase'; 

interface AboutProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export default function About({ activeTab: propsActiveTab, onTabChange }: AboutProps) {
  const [internalTab, setInternalTab] = useState('sejarah');
  const [dynamicContent, setDynamicContent] = useState<Record<string, any>>({});
  const [orgData, setOrgData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const activeTab = propsActiveTab || internalTab;

  useEffect(() => {
    fetchAboutContent();
    fetchOrganizationalStructure();
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

  const fetchOrganizationalStructure = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('*')
        .order('level', { ascending: true })
        .order('name', { ascending: true });

      if (!error && data) {
        setOrgData(data);
      }
    } catch (err) {
      console.error("Error fetching org structure:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (id: string) => {
    if (onTabChange) {
      onTabChange(id);
    } else {
      setInternalTab(id);
    }
    // Scroll smooth ke container content saat ganti tab di mobile
    const element = document.getElementById('about-content-area');
    if (element && window.innerWidth < 768) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tabs = [
    { id: 'sejarah', label: 'Sejarah', icon: <BookOpen size={14} /> },
    { id: 'visi-misi', label: 'Visi & Misi', icon: <Target size={14} /> },
    { id: 'fasilitas', label: 'Fasilitas', icon: <Rocket size={14} /> }
  ];

  return (
    <section id="tentang-kami" className="relative w-full bg-white pt-24 pb-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-50 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/5 text-blue-600 rounded-full mb-6 border border-blue-100">
            <Users2 size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Profil Keunggulan</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase italic">
            Mengenal <span className="text-blue-600">PB US 162</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-500 font-medium text-sm md:text-base uppercase tracking-wider">
            Dedikasi kami dalam melahirkan bibit juara melalui pembinaan yang terukur dan profesional.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 md:px-8 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.15em] transition-all duration-500 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] scale-105 border-transparent' 
                : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          
          <button
            onClick={() => handleTabChange('organisasi')}
            className={`flex items-center gap-2 px-6 md:px-8 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.15em] transition-all duration-500 border-2 ${
              activeTab === 'organisasi'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105'
              : 'bg-slate-900 text-white border-slate-900 hover:bg-blue-600 hover:border-blue-600'
            }`}
          >
            Struktur Organisasi
            <ArrowRight size={14} className={activeTab === 'organisasi' ? 'translate-x-1' : ''} />
          </button>
        </div>

        {/* Content Area */}
        <div id="about-content-area" className="relative">
          <div className="bg-white rounded-[3rem] md:rounded-[5rem] p-8 md:p-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.04)] border border-slate-50 min-h-[600px] transition-all duration-700">
            
            {/* 1. SEJARAH */}
            {activeTab === 'sejarah' && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="relative order-2 lg:order-1">
                    <div className="absolute -inset-6 bg-blue-600/5 rounded-[4rem] -rotate-3"></div>
                    <img 
                      src={dynamicContent.sejarah_img || "photo_2026-02-03_00-32-07.jpg"} 
                      className="relative w-full aspect-[4/5] object-cover rounded-[3.5rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                      alt="History of PB US 162"
                    />
                    <div className="absolute bottom-10 -right-8 bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl hidden md:block">
                      <p className="text-4xl font-black italic tracking-tighter">Est. 2024</p>
                      <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">Bilibili, Gowa</p>
                    </div>
                  </div>

                  <div className="space-y-8 order-1 lg:order-2">
                    <h3 className="text-4xl md:text-6xl font-black text-slate-900 uppercase leading-[0.95] italic tracking-tighter">
                      {dynamicContent.sejarah_title || "Menempa"} <br/>
                      <span className="text-blue-600">{dynamicContent.sejarah_accent || "Mental Juara"}</span>
                    </h3>
                    <p className="text-slate-500 text-lg leading-relaxed font-medium">
                      {dynamicContent.sejarah_desc || "Lahir dari semangat kebersamaan di Bilibili, PB US 162 bertransformasi menjadi kawah candradimuka bagi atlet muda berbakat dengan kurikulum pelatihan yang mengacu pada standar nasional."}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["Pelatih Bersertifikat", "Kurikulum Terpadu", "Fokus Karakter", "Evaluasi Berkala"].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl group hover:bg-blue-600 transition-all duration-300">
                          <CheckCircle2 size={20} className="text-blue-600 group-hover:text-white" />
                          <span className="text-[11px] font-black text-slate-700 group-hover:text-white uppercase tracking-wider">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. VISI MISI */}
            {activeTab === 'visi-misi' && (
              <div className="w-full animate-in fade-in zoom-in-95 duration-700">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 md:p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                    <Target size={300} className="absolute -bottom-20 -right-20 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                        <Target size={32} />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-70">Vision Statement</h4>
                      <h3 className="text-3xl md:text-5xl font-black italic leading-[1.1] uppercase tracking-tighter">
                        "{dynamicContent.vision || "Mewujudkan akademi bulutangkis yang melahirkan atlet elit berintegritas dunia."}"
                      </h3>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-12 md:p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                    <Rocket size={300} className="absolute -bottom-20 -right-20 opacity-5 group-hover:rotate-12 transition-transform duration-1000" />
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                        <Rocket size={32} className="text-blue-500" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-blue-500">Our Missions</h4>
                      <div className="space-y-6">
                        {(Array.isArray(dynamicContent.missions) && dynamicContent.missions.length > 0 
                          ? dynamicContent.missions 
                          : ["Sistem pelatihan berbasis IPTEK Olahraga", "Pengembangan sarana berstandar BWF", "Membangun ekosistem kompetisi sehat", "Membentuk disiplin dan etika atlet"]
                        ).map((misi, i) => (
                          <div key={i} className="flex items-start gap-4 group/item">
                            <div className="mt-2 w-2 h-2 bg-blue-600 rounded-full group-hover/item:scale-150 transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.8)]"></div>
                            <p className="text-base md:text-lg font-bold italic text-slate-300 group-hover/item:text-white transition-colors">{misi}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. FASILITAS */}
            {activeTab === 'fasilitas' && (
              <div className="w-full animate-in fade-in slide-in-from-right-10 duration-1000">
                <div className="grid lg:grid-cols-5 gap-8 items-start">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="p-8 bg-blue-50 rounded-[3rem] border border-blue-100">
                      <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">Infrastructure</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        Kami menyediakan ekosistem latihan yang lengkap untuk mendukung performa maksimal setiap atlet.
                      </p>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: 'Court Standar BWF', desc: 'Lantai vinyl kualitas premium' },
                        { title: 'Lighting System', desc: 'LED anti-glare 1000 lux' },
                        { title: 'Gym & Recovery', desc: 'Area penguatan fisik khusus' },
                        { title: 'Athlete Lounge', desc: 'Ruang diskusi dan analisis video' }
                      ].map((f, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-5 hover:shadow-xl hover:border-blue-500 transition-all group cursor-default">
                          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <Shield size={20} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">{f.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-3 grid grid-cols-2 gap-4 h-[500px] md:h-[650px]">
                    <div className="relative group overflow-hidden rounded-[3rem]">
                      <img src={dynamicContent.fasilitas_img1 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Facilities" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-8">
                        <p className="text-white font-black uppercase text-xs tracking-[0.3em]">Main Arena View</p>
                      </div>
                    </div>
                    <div className="grid grid-rows-2 gap-4">
                      <div className="relative group overflow-hidden rounded-[3rem]">
                        <img src={dynamicContent.fasilitas_img2 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Detail" />
                      </div>
                      <div className="relative group overflow-hidden rounded-[3rem]">
                        <img src={dynamicContent.fasilitas_img3 || "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&q=80"} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Training" />
                        <div className="absolute inset-0 bg-blue-600/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. STRUKTUR ORGANISASI */}
            {activeTab === 'organisasi' && (
              <div className="w-full animate-in fade-in slide-in-from-top-10 duration-1000">
                <div className="text-center mb-16">
                  <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Elite Management</h3>
                  <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Sinkronisasi Database...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {orgData.map((person) => (
                      <div key={person.id} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
                        <div className="relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center transition-all duration-500 group-hover:-translate-y-2">
                          <div className="w-24 h-24 bg-slate-50 rounded-3xl overflow-hidden mb-6 border-4 border-slate-50 group-hover:border-blue-50 shadow-inner relative">
                            {person.photo_url ? (
                              <img src={person.photo_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={person.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                <User size={40} className="text-blue-200" />
                              </div>
                            )}
                            <div className="absolute top-0 right-0 bg-blue-600 text-white p-1.5 rounded-bl-xl shadow-lg transform translate-x-full group-hover:translate-x-0 transition-transform duration-500">
                              <Award size={12} />
                            </div>
                          </div>
                          
                          <h4 className="font-black text-slate-900 text-sm uppercase italic leading-tight mb-2 tracking-tight group-hover:text-blue-600 transition-colors">
                            {person.name}
                          </h4>
                          
                          <div className="px-4 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase rounded-full tracking-[0.1em] mb-4">
                            {person.role}
                          </div>
                          
                          <div className="flex items-center gap-1 text-slate-300 group-hover:text-blue-400 transition-colors">
                            {[...Array(4 - person.level)].map((_, i) => (
                              <Shield key={i} size={10} fill="currentColor" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Organizational Summary Decor */}
                <div className="mt-20 p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
                      <Users2 size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Solidaritas Tinggi</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Kolaborasi profesional antar bidang</p>
                    </div>
                  </div>
                  <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>
                  <div className="text-center md:text-right">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Masa Bakti</p>
                    <p className="text-slate-900 font-black italic text-xl uppercase tracking-tighter">2024 — 2028</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
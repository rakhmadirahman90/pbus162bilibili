import React, { useState, useEffect } from 'react'; 
import { 
  BookOpen, Target, Rocket, Shield, Award, MapPin, 
  CheckCircle2, Users2, ArrowRight, User, ShieldCheck, 
  ChevronDown, Star 
} from 'lucide-react';
import { supabase } from '../supabase'; 

interface AboutProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export default function About({ activeTab: propsActiveTab, onTabChange }: AboutProps) {
  const [internalTab, setInternalTab] = useState('sejarah');
  const [dynamicContent, setDynamicContent] = useState<Record<string, any>>({});
  const [orgData, setOrgData] = useState<any[]>([]);
  
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
    try {
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('*')
        .order('level', { ascending: true })
        .order('id', { ascending: true });

      if (!error && data) {
        setOrgData(data);
      }
    } catch (err) {
      console.error("Error fetching org structure:", err);
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full mb-4">
            <Users2 size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Profil Organisasi</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase leading-none">
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
          
          <button
            onClick={() => handleTabChange('organisasi')}
            className={`px-6 md:px-10 py-3 rounded-2xl font-bold text-[11px] md:text-xs uppercase tracking-widest transition-all duration-300 border-2 flex items-center gap-2 group shadow-xl ${
              activeTab === 'organisasi'
              ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200 scale-105'
              : 'bg-slate-900 text-white border-slate-900 hover:bg-blue-700 hover:border-blue-700'
            }`}
          >
            Struktur Organisasi
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="bg-slate-50/50 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 border border-slate-100 shadow-sm min-h-[600px] flex items-start justify-center transition-all duration-500 overflow-hidden">
          
          {/* 1. SEJARAH CONTENT */}
          {activeTab === 'sejarah' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative group hidden md:block">
                  <div className="absolute -inset-4 bg-blue-100/50 rounded-[3rem] blur-2xl group-hover:bg-blue-200/50 transition-colors"></div>
                  <img 
                    src={dynamicContent.sejarah_img || "photo_2026-02-03_00-32-07.jpg"} 
                    alt="Latihan PB US 162" 
                    className="relative w-full h-[450px] object-cover rounded-[2.5rem] shadow-2xl border-4 border-white transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="space-y-6">
                  <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">Legacy & Spirit</div>
                  <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase leading-[1.1]">
                    {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">{dynamicContent.sejarah_accent || "LEGENDA"}</span> MASA DEPAN
                  </h3>
                  <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                    {dynamicContent.sejarah_desc || "PB US 162 hadir sebagai pusat keunggulan bulutangkis yang mengintegrasikan sport-science dengan disiplin tinggi."}
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

          {/* 2. VISI MISI CONTENT */}
          {activeTab === 'visi-misi' && (
            <div className="w-full animate-in fade-in slide-in-from-right-8 duration-700 grid lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-5 text-blue-600 transition-transform duration-700 group-hover:scale-110"><Target size={250} /></div>
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200"><Target size={32} /></div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase italic">Visi Utama</span>
                <p className="text-slate-800 text-2xl md:text-3xl font-bold leading-tight italic relative z-10">"{dynamicContent.vision || "Menjadi klub rujukan nasional yang mencetak atlet berprestasi dunia."}"</p>
              </div>
              <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-5 text-slate-900 transition-transform duration-700 group-hover:scale-110"><Rocket size={250} /></div>
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg"><Rocket size={32} /></div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase italic">Misi Strategis</span>
                <ul className="space-y-4 relative z-10">
                  {(dynamicContent.missions || ["Latihan terstruktur", "Fasilitas internasional", "Kompetisi rutin"]).map((misi: string, i: number) => (
                    <li key={i} className="flex items-center gap-4 text-slate-700 font-bold text-sm md:text-base italic group/item">
                      <div className="w-2 h-2 bg-blue-500 rounded-full group-hover/item:scale-150 transition-transform"></div>{misi}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 3. FASILITAS CONTENT */}
          {activeTab === 'fasilitas' && (
            <div className="w-full animate-in fade-in zoom-in-95 duration-500 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase mb-2">Fasilitas Unggulan</h3>
                  <p className="text-slate-500 font-medium italic">Standardisasi Internasional (BWF)</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {['Lapangan karpet standar BWF', 'Pencahayaan LED anti-silau', 'Fitness center', 'Asrama atlet'].map((item, index) => (
                    <div key={index} className="flex items-center gap-5 p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0"><Shield size={22} /></div>
                      <span className="text-sm md:text-base font-black text-slate-700 uppercase tracking-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 h-[400px]">
                <img src={dynamicContent.fasilitas_img1 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-[2.5rem] shadow-lg border-2 border-white" alt="Court" />
                <div className="grid grid-rows-2 gap-4">
                   <img src={dynamicContent.fasilitas_img2 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-[2rem] shadow-md border-2 border-white" alt="Faci 2" />
                   <img src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&q=80" className="w-full h-full object-cover rounded-[2rem] shadow-md border-2 border-white" alt="Faci 3" />
                </div>
              </div>
            </div>
          )}

          {/* 4. STRUKTUR ORGANISASI (TOP-DOWN HIERARCHY) */}
          {activeTab === 'organisasi' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="relative flex flex-col items-center">
                
                {/* Visual Connector: Garis Vertikal Tengah (Desktop) */}
                <div className="absolute top-20 bottom-20 w-0.5 bg-gradient-to-b from-amber-200 via-blue-100 to-transparent left-1/2 -translate-x-1/2 hidden lg:block opacity-50"></div>

                {/* --- LEVEL 1: PIMPINAN (Authority) --- */}
                <div className="relative z-10 mb-16 flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full mb-6 border border-amber-100 shadow-sm">
                    <ShieldCheck size={14} className="animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">High Authority</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-8">
                    {orgData.filter(m => m.level === 1).map(person => (
                      <div key={person.id} className="relative group perspective-1000">
                        <div className="bg-white p-8 rounded-[3rem] border-2 border-amber-100 shadow-[0_20px_50px_rgba(245,158,11,0.1)] text-center w-72 transition-all duration-500 group-hover:-translate-y-2 group-hover:border-amber-400 group-hover:shadow-amber-200/50">
                          <div className="w-32 h-32 mx-auto mb-6 rounded-[2rem] overflow-hidden border-4 border-amber-50 group-hover:border-amber-200 transition-all shadow-inner">
                            {person.photo_url ? (
                              <img src={person.photo_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300"><User size={48} /></div>
                            )}
                          </div>
                          <h4 className="font-black text-slate-900 text-lg italic uppercase leading-none mb-2">{person.name}</h4>
                          <span className="px-4 py-1 bg-amber-500 text-white text-[10px] font-black uppercase rounded-full tracking-[0.1em] shadow-lg shadow-amber-200 italic">
                            {person.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level Spacer Icon */}
                <div className="relative z-10 flex flex-col items-center mb-16 opacity-30">
                  <ChevronDown className="text-slate-400" />
                  <ChevronDown className="text-slate-300 -mt-2" />
                </div>

                {/* --- LEVEL 2: PENGURUS INTI (Executive) --- */}
                <div className="relative z-10 mb-20 w-full max-w-5xl">
                  <div className="text-center mb-10">
                    <h5 className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Dewan Pengurus Inti</h5>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {orgData.filter(m => m.level === 2).map(person => (
                      <div key={person.id} className="group">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl transition-all duration-500 hover:shadow-blue-200/40 hover:border-blue-400 text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Award size={60} /></div>
                          <div className="w-24 h-24 mx-auto mb-4 rounded-3xl overflow-hidden border-2 border-slate-50 transition-all group-hover:scale-105">
                            {person.photo_url ? (
                              <img src={person.photo_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200"><User size={30} /></div>
                            )}
                          </div>
                          <h4 className="font-black text-slate-900 text-[13px] italic uppercase leading-tight mb-2 tracking-tight">{person.name}</h4>
                          <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase rounded-lg tracking-widest shadow-md">
                            {person.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- LEVEL 3: SEKSI-SEKSI (Operational) --- */}
                <div className="relative z-10 w-full">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                    <span className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Koordinator & Bidang</span>
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {orgData.filter(m => m.level === 3).map(person => (
                      <div key={person.id} className="bg-white/60 backdrop-blur-sm p-4 rounded-3xl border border-slate-100 hover:bg-white hover:border-blue-300 hover:shadow-lg transition-all flex flex-col items-center text-center group">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-3 group-hover:scale-110 transition-transform">
                          {person.photo_url ? (
                            <img src={person.photo_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200"><User size={20} /></div>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-800 text-[10px] uppercase italic leading-none mb-1">{person.name}</h4>
                        <p className="text-blue-500 font-black text-[8px] uppercase tracking-tighter">{person.role}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Loading State for Org Data */}
                {orgData.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Sinkronisasi Database...</p>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
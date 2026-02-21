import React, { useState, useEffect } from 'react'; 
import { BookOpen, Target, Rocket, Shield, Award, MapPin, CheckCircle2, Users2, ArrowRight, User, ShieldCheck, ChevronDown } from 'lucide-react';
import { supabase } from '../supabase'; 

interface AboutProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

interface Member {
  id: string;
  name: string;
  role: string;
  category: string;
  level: number;
  photo_url: string;
}

export default function About({ activeTab: propsActiveTab, onTabChange }: AboutProps) {
  const [internalTab, setInternalTab] = useState('sejarah');
  const [dynamicContent, setDynamicContent] = useState<Record<string, any>>({});
  const [orgData, setOrgData] = useState<Member[]>([]); 
  
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
        .order('name', { ascending: true });

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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full mb-4 border border-blue-100">
            <Users2 size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Profil & Integritas</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">
            Tentang <span className="text-blue-600 font-black">Kami</span>
          </h2>
          <div className="w-24 h-2 bg-blue-600 mx-auto rounded-full shadow-lg shadow-blue-200"></div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 md:px-10 py-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 border-2 ${
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
            className={`px-6 md:px-10 py-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 border-2 flex items-center gap-2 group shadow-xl ${
              activeTab === 'organisasi'
              ? 'bg-slate-900 text-white border-slate-900 shadow-slate-200 scale-105'
              : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white'
            }`}
          >
            Struktur Organisasi
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="bg-slate-50/40 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-12 border border-slate-100 shadow-sm min-h-[600px] transition-all duration-500">
          
          {/* 1. SEJARAH, VISI-MISI, FASILITAS (Existing Logic) */}
          {activeTab === 'sejarah' && (
             <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="relative group hidden md:block">
                    <div className="absolute -inset-4 bg-blue-100/50 rounded-[3rem] blur-2xl group-hover:bg-blue-200/50 transition-colors"></div>
                    <img src={dynamicContent.sejarah_img || "photo_2026-02-03_00-32-07.jpg"} alt="Sejarah" className="relative w-full h-[450px] object-cover rounded-[2.5rem] shadow-2xl border-4 border-white transition-transform duration-700 group-hover:scale-[1.02]" />
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic leading-none">{dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600 uppercase italic">LEGENDA</span></h3>
                    <p className="text-slate-500 text-lg leading-relaxed font-medium italic">{dynamicContent.sejarah_desc || "PB US 162 Bilibili hadir sebagai pusat keunggulan bulutangkis yang mengintegrasikan sport-science dengan disiplin tinggi."}</p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      {["Sport-science", "GOR Standar BWF", "Karier Pro", "Klasemen Digital"].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm font-black text-[10px] uppercase text-slate-700 tracking-tighter"><CheckCircle2 size={16} className="text-blue-600" /> {item}</div>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'visi-misi' && (
             <div className="w-full animate-in fade-in slide-in-from-right-8 duration-700 grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
                  <Target size={200} className="absolute -top-10 -right-10 opacity-[0.03] text-blue-600" />
                  <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-200"><Target size={28} /></div>
                  <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] block mb-2 italic">Visi Masa Depan</span>
                  <p className="text-slate-900 text-2xl md:text-3xl font-black italic uppercase leading-tight">"{dynamicContent.vision || "Menjadi klub rujukan nasional yang mencetak atlet berprestasi dunia."}"</p>
                </div>
                <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-xl relative overflow-hidden">
                  <Rocket size={200} className="absolute -top-10 -right-10 opacity-10 text-white" />
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20"><Rocket size={28} /></div>
                  <span className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] block mb-4 italic">Misi Strategis</span>
                  <ul className="space-y-4">
                    {(dynamicContent.missions || ["Latihan Terstruktur", "Fasilitas BWF", "Karakter Juara"]).map((m, i) => (
                      <li key={i} className="flex items-center gap-4 text-white font-black text-xs md:text-sm uppercase italic tracking-wide group cursor-default">
                        <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-150 transition-transform"></div> {m}
                      </li>
                    ))}
                  </ul>
                </div>
             </div>
          )}

          {/* 4. STRUKTUR ORGANISASI (HIRARKI TREE-FLOW) */}
          {activeTab === 'organisasi' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="relative flex flex-col items-center">
                
                {/* Visual Connector Line (Desktop Only) */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-200 via-blue-100 to-transparent -translate-x-1/2 hidden lg:block z-0"></div>

                {/* LEVEL 1: PIMPINAN (Top Flow) */}
                <div className="relative z-10 w-full flex flex-col items-center mb-20">
                  <div className="flex items-center gap-3 mb-8 bg-amber-50 px-6 py-2 rounded-full border border-amber-100 shadow-sm">
                    <ShieldCheck size={20} className="text-amber-500" />
                    <span className="text-amber-700 font-black text-[10px] uppercase tracking-[0.3em]">Executive Board</span>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-8 w-full">
                    {orgData.filter(m => m.level === 1).map((person) => (
                      <div key={person.id} className="group relative">
                        <div className="bg-white p-6 md:p-8 rounded-[3rem] border-2 border-amber-100 shadow-[0_20px_50px_rgba(245,158,11,0.15)] text-center w-64 md:w-72 transition-all duration-500 hover:-translate-y-2 hover:shadow-amber-200/40">
                          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 rounded-[2rem] overflow-hidden border-4 border-amber-50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                            <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=F59E0B&color=fff`} className="w-full h-full object-cover" alt={person.name} />
                          </div>
                          <h4 className="text-slate-900 font-black text-sm md:text-base uppercase italic leading-tight mb-2 tracking-tighter">{person.name}</h4>
                          <div className="inline-block px-4 py-1.5 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-200">
                            <p className="text-[9px] font-black uppercase tracking-widest">{person.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transition Arrow */}
                <div className="relative z-10 mb-20 bg-white p-3 rounded-full border border-slate-100 shadow-md">
                   <ChevronDown className="text-blue-600 animate-bounce" size={24} />
                </div>

                {/* LEVEL 2: PENGURUS INTI (Middle Flow) */}
                <div className="relative z-10 w-full mb-24">
                  <div className="text-center mb-12">
                    <h2 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em] mb-2 italic">Management Core</h2>
                    <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full opacity-30"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {orgData.filter(m => m.level === 2).map((person) => (
                      <div key={person.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl text-center group hover:border-blue-500 transition-all duration-500 hover:shadow-blue-900/5">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-blue-50 group-hover:scale-110 transition-transform">
                           <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=2563EB&color=fff`} className="w-full h-full object-cover" alt={person.name} />
                        </div>
                        <h4 className="text-slate-900 font-black text-sm uppercase italic mb-1">{person.name}</h4>
                        <p className="text-blue-600 font-black text-[9px] uppercase tracking-widest">{person.role}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LEVEL 3: SEKSI / BIDANG (Foundation Flow) */}
                <div className="relative z-10 w-full">
                   <div className="bg-slate-900 p-10 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
                      <div className="text-center mb-12">
                        <h3 className="text-white font-black text-sm uppercase tracking-[0.3em] italic">Koordinator & Bidang Operasional</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {orgData.filter(m => m.level === 3).map((person) => (
                          <div key={person.id} className="bg-white/5 border border-white/10 backdrop-blur-md p-5 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-colors group">
                            <div className="w-12 h-12 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                               <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=334155&color=fff`} className="w-full h-full object-cover" alt={person.name} />
                            </div>
                            <div>
                               <h5 className="text-white font-black text-[11px] uppercase italic tracking-tight leading-none mb-1">{person.name}</h5>
                               <p className="text-blue-400 font-bold text-[9px] uppercase tracking-tighter">{person.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
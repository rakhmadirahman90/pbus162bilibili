import React, { useState, useEffect } from 'react'; 
import { BookOpen, Target, Rocket, Shield, Award, MapPin, CheckCircle2, Users2, ArrowRight, User, ShieldCheck, ChevronDown, Users } from 'lucide-react';
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
    <section id="tentang-kami" className="relative w-full h-auto bg-white pt-16 pb-12 flex flex-col items-center overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 w-full flex flex-col">
        
        {/* Header Section */}
        <div className="text-center mb-8 shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full mb-4">
            <Users2 size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Profil Organisasi</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">
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
        <div className={`bg-slate-50/50 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 border border-slate-100 shadow-sm min-h-[600px] flex items-start justify-center transition-all duration-500 ${activeTab === 'organisasi' ? 'bg-white' : ''}`}>
          
          {/* 1. SEJARAH */}
          {activeTab === 'sejarah' && (
            <div id="sejarah" className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative group hidden md:block">
                  <div className="absolute -inset-4 bg-blue-100/50 rounded-[3rem] blur-2xl group-hover:bg-blue-200/50 transition-colors"></div>
                  <img 
                    src={dynamicContent.sejarah_img || "photo_2026-02-03_00-32-07.jpg"} 
                    alt="Sejarah PB US 162" 
                    className="relative w-full h-[400px] object-cover rounded-[2.5rem] shadow-2xl border-4 border-white transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="space-y-6">
                  <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">Legacy & Spirit</div>
                  <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase leading-[1.1] italic">
                    {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">{dynamicContent.sejarah_accent || "LEGENDA"}</span> MASA DEPAN
                  </h3>
                  <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                    {dynamicContent.sejarah_desc || "PB US 162 Bilibili hadir sebagai pusat keunggulan bulutangkis yang mengintegrasikan sport-science dengan disiplin tinggi."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. VISI MISI */}
          {activeTab === 'visi-misi' && (
            <div id="visi-misi" className="w-full animate-in fade-in slide-in-from-right-8 duration-700 grid lg:grid-cols-2 gap-8 items-stretch">
               {/* Visual Visi */}
               <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-5 text-blue-600 group-hover:scale-110 transition-transform"><Target size={250} /></div>
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200"><Target size={32} /></div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase italic">Visi Utama</span>
                <p className="text-slate-800 text-2xl md:text-3xl font-black leading-tight italic relative z-10">"{dynamicContent.vision || "Menjadi klub rujukan nasional yang mencetak atlet berprestasi dunia."}"</p>
              </div>
              {/* Visual Misi */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-5 text-slate-900 group-hover:scale-110 transition-transform"><Rocket size={250} /></div>
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg"><Rocket size={32} /></div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase italic">Misi Strategis</span>
                <ul className="space-y-4 relative z-10">
                  {(Array.isArray(dynamicContent.missions) ? dynamicContent.missions : ["Latihan terstruktur", "Fasilitas internasional", "Karakter juara"]).map((m, i) => (
                    <li key={i} className="flex items-center gap-4 text-slate-700 font-bold text-sm md:text-base italic"><div className="w-2 h-2 bg-blue-500 rounded-full"></div>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 3. FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div id="fasilitas" className="w-full animate-in fade-in zoom-in-95 duration-500 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h3 className="text-3xl font-black text-slate-900 uppercase italic">Fasilitas <span className="text-blue-600">Unggulan</span></h3>
                <div className="grid grid-cols-1 gap-4">
                  {['Lapangan karpet standar BWF', 'Pencahayaan LED anti-silau', 'Fitness center', 'Asrama atlet'].map((item, i) => (
                    <div key={i} className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-500 transition-all group">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"><Shield size={22} /></div>
                      <span className="text-sm font-black text-slate-700 uppercase italic">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[450px] border-4 border-white">
                <img src={dynamicContent.fasilitas_img1 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* 4. STRUKTUR ORGANISASI (HIERARCHY DESIGN) */}
          {activeTab === 'organisasi' && (
            <div id="organisasi" className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000">
              
              {/* Tree Flow Container */}
              <div className="relative flex flex-col items-center">
                
                {/* Visual Connector: Garis Vertikal Utama */}
                <div className="absolute left-1/2 top-10 bottom-20 w-[2px] bg-gradient-to-b from-blue-200 via-blue-400 to-transparent -translate-x-1/2 hidden lg:block z-0"></div>

                {/* --- LEVEL 1: TOP LEADERSHIP --- */}
                <div className="relative z-10 w-full flex flex-col items-center mb-16">
                  <div className="bg-amber-500 text-white p-2 rounded-xl mb-6 shadow-lg shadow-amber-200"><ShieldCheck size={28} /></div>
                  <h3 className="text-slate-400 font-black uppercase tracking-[0.4em] text-[11px] mb-8 italic">Penasehat & Penanggung Jawab</h3>
                  
                  <div className="flex flex-wrap justify-center gap-8">
                    {orgData.filter(m => m.level === 1).map(person => (
                      <div key={person.id} className="group relative">
                        <div className="bg-white p-7 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-t-4 border-amber-500 text-center w-72 transition-all duration-500 hover:-translate-y-2">
                          <div className="w-28 h-28 mx-auto mb-5 rounded-3xl overflow-hidden border-4 border-slate-50 group-hover:border-amber-400 transition-all duration-500 shadow-inner">
                            {person.photo_url ? <img src={person.photo_url} className="w-full h-full object-cover" alt={person.name} /> : <User size={40} className="m-auto mt-6 text-slate-200" />}
                          </div>
                          <h4 className="font-black text-slate-900 text-base uppercase italic leading-tight mb-2 tracking-tighter">{person.name}</h4>
                          <span className="px-4 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-full tracking-widest">{person.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connector Arrow */}
                <div className="relative z-10 mb-12 hidden lg:flex"><div className="bg-white p-2 rounded-full shadow-md border border-blue-100 text-blue-600"><ChevronDown size={20} className="animate-bounce" /></div></div>

                {/* --- LEVEL 2: CORE EXECUTIVE --- */}
                <div className="relative z-10 w-full flex flex-col items-center mb-20">
                  <div className="bg-blue-600 text-white p-2 rounded-xl mb-6 shadow-lg shadow-blue-200"><Award size={28} /></div>
                  <h3 className="text-slate-400 font-black uppercase tracking-[0.4em] text-[11px] mb-8 italic">Dewan Pengurus Inti</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                    {orgData.filter(m => m.level === 2).map(person => (
                      <div key={person.id} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 text-center group hover:border-blue-500 hover:shadow-blue-500/10 transition-all duration-500">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-blue-50 group-hover:scale-105 transition-transform">
                          {person.photo_url ? <img src={person.photo_url} className="w-full h-full object-cover" alt={person.name} /> : <User size={30} className="m-auto mt-5 text-slate-200" />}
                        </div>
                        <h4 className="font-black text-slate-900 text-[13px] uppercase italic leading-tight mb-1">{person.name}</h4>
                        <p className="text-blue-600 font-black text-[9px] uppercase tracking-widest">{person.role}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- LEVEL 3: SEKSI & OPERATIONAL --- */}
                <div className="relative z-10 w-full flex flex-col items-center">
                  <div className="bg-slate-800 text-white p-2 rounded-xl mb-6 shadow-lg shadow-slate-200"><Users size={28} /></div>
                  <h3 className="text-slate-400 font-black uppercase tracking-[0.4em] text-[11px] mb-10 italic">Koordinator & Anggota Bidang</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
                    {orgData.filter(m => m.level === 3).map(person => (
                      <div key={person.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-white hover:border-blue-300 transition-all group">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm border border-slate-200">
                          {person.photo_url ? <img src={person.photo_url} className="w-full h-full object-cover" alt={person.name} /> : <User size={20} className="m-auto mt-3 text-slate-300" />}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-[11px] uppercase italic leading-none mb-1 group-hover:text-blue-600 transition-colors">{person.name}</h4>
                          <span className="text-blue-500 font-bold text-[8px] uppercase tracking-tighter">{person.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              
              {/* Footer Database Sync Info */}
              <div className="mt-16 text-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Database Synced: {orgData.length} Personnel Active</span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
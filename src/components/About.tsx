import React, { useState, useEffect } from 'react'; 
import { 
  Target, Rocket, Shield, Award, 
  CheckCircle2, Users2, ArrowRight, User, ShieldCheck, 
  ChevronDown, Star, LayoutGrid
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
        .order('level', { ascending: true });

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
        
        {/* --- HEADER --- */}
        <div className="text-center mb-8 shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full mb-4">
            <Users2 size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Profil Organisasi</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase leading-none italic">
            Tentang <span className="text-blue-600">Kami</span>
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full shadow-sm"></div>
        </div>

        {/* --- TAB SWITCHER --- */}
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

        {/* --- CONTENT BOX --- */}
        <div className="bg-slate-50/50 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 border border-slate-100 shadow-sm min-h-[600px] transition-all duration-500">
          
          {/* 1. SEJARAH */}
          {activeTab === 'sejarah' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative group hidden md:block">
                  <div className="absolute -inset-4 bg-blue-100/50 rounded-[3rem] blur-2xl group-hover:bg-blue-200/50 transition-colors"></div>
                  <img src={dynamicContent.sejarah_img || "photo_2026-02-03_00-32-07.jpg"} className="relative w-full h-[450px] object-cover rounded-[2.5rem] shadow-2xl border-4 border-white" alt="Sejarah" />
                </div>
                <div className="space-y-6">
                  <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase">
                    {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">LEGENDA</span>
                  </h3>
                  <p className="text-slate-500 text-base md:text-lg leading-relaxed">{dynamicContent.sejarah_desc || "PB US 162 mencetak atlet berprestasi dengan disiplin tinggi."}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {["BWF Court", "Pro Training", "Hostel", "Digital Stats"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-slate-100 font-bold text-[10px] uppercase text-slate-700">
                        <CheckCircle2 size={16} className="text-blue-600" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. VISI MISI */}
          {activeTab === 'visi-misi' && (
            <div className="w-full animate-in fade-in duration-700 grid lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 relative overflow-hidden group">
                <Target className="absolute -top-10 -right-10 opacity-5 text-blue-600" size={200} />
                <h4 className="text-blue-600 font-black text-xs uppercase mb-4 tracking-widest italic">Visi</h4>
                <p className="text-slate-800 text-2xl font-bold italic relative z-10">"{dynamicContent.vision || "Menjadi klub rujukan nasional yang mencetak atlet berprestasi dunia."}"</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100">
                <h4 className="text-blue-600 font-black text-xs uppercase mb-4 tracking-widest italic">Misi</h4>
                <ul className="space-y-3 font-bold text-slate-700 italic">
                  {(dynamicContent.missions || ["Latihan Terpadu", "Fasilitas Standar", "Mental Juara"]).map((m, i) => (
                    <li key={i} className="flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full" /> {m}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 3. FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div className="w-full animate-in fade-in duration-500 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-black text-slate-900 uppercase">Fasilitas Standar BWF</h3>
                <div className="space-y-3">
                  {['4 Lapangan Karpet', 'LED Lighting', 'Gym Area', 'Locker Room'].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 font-black uppercase text-xs text-slate-700">
                      <Shield className="text-blue-600" size={20} /> {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 h-[350px]">
                <img src={dynamicContent.fasilitas_img1 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-[2.5rem] shadow-lg border-2 border-white" alt="Arena" />
                <div className="grid grid-rows-2 gap-4">
                   <img src={dynamicContent.fasilitas_img2 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-[2rem] shadow-md border-2 border-white" alt="Gym" />
                   <img src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&q=80" className="w-full h-full object-cover rounded-[2rem] shadow-md border-2 border-white" alt="Equip" />
                </div>
              </div>
            </div>
          )}

          {/* 4. STRUKTUR ORGANISASI (HIERARCHY REFINED) */}
          {activeTab === 'organisasi' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000 relative">
              {/* Desktop Hierarchy Line */}
              <div className="absolute top-24 bottom-24 w-0.5 bg-gradient-to-b from-amber-300 via-blue-200 to-transparent left-1/2 -translate-x-1/2 hidden lg:block opacity-30"></div>

              <div className="relative flex flex-col items-center">
                
                {/* --- LVL 1 PINNACLE: PENANGGUNG JAWAB --- */}
                <div className="relative z-10 mb-12">
                  {orgData.filter(m => m.role.toLowerCase().includes('penanggung jawab')).map(person => (
                    <div key={person.id} className="flex flex-col items-center">
                      <div className="bg-white p-8 rounded-[3.5rem] border-4 border-amber-400 shadow-[0_25px_60px_rgba(245,158,11,0.2)] text-center w-80 group hover:scale-105 transition-all duration-500">
                        <div className="w-32 h-32 mx-auto mb-4 rounded-[2.2rem] overflow-hidden border-4 border-amber-50">
                          {person.photo_url ? <img src={person.photo_url} className="w-full h-full object-cover" alt={person.name} /> : <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300"><User size={40} /></div>}
                        </div>
                        <h4 className="font-black text-slate-900 text-lg italic uppercase leading-none mb-2">{person.name}</h4>
                        <span className="px-5 py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg italic">Penanggung Jawab</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- LVL 2: PENASEHAT --- */}
                <div className="relative z-10 mb-12 w-full max-w-4xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-[1px] flex-1 bg-amber-200"></div>
                    <span className="text-amber-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Jajaran Penasehat</span>
                    <div className="h-[1px] flex-1 bg-amber-200"></div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6">
                    {orgData.filter(m => m.role.toLowerCase().includes('penasehat')).map(person => (
                      <div key={person.id} className="bg-white p-6 rounded-[2.5rem] border border-amber-100 shadow-xl text-center w-60 group hover:border-amber-400 transition-all">
                        <h4 className="font-black text-slate-800 text-[12px] italic uppercase mb-1">{person.name}</h4>
                        <span className="text-[9px] font-bold text-amber-600 uppercase">Penasehat</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- LVL 3: PEMBINA --- */}
                <div className="relative z-10 mb-16 w-full max-w-3xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                    <span className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] italic">Dewan Pembina</span>
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6">
                    {orgData.filter(m => m.role.toLowerCase().includes('pembina')).map(person => (
                      <div key={person.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-lg text-center w-56 group hover:border-blue-300 transition-all">
                        <h4 className="font-black text-slate-800 text-[11px] italic uppercase mb-1">{person.name}</h4>
                        <span className="text-[8px] font-bold text-blue-500 uppercase">Pembina</span>
                      </div>
                    ))}
                  </div>
                </div>

                <ChevronDown className="text-slate-300 mb-12 animate-bounce" />

                {/* --- LVL 4: KETUA UMUM & PENGURUS INTI --- */}
                <div className="relative z-10 mb-20 w-full max-w-6xl">
                  <div className="text-center mb-10">
                     <span className="px-6 py-2 bg-blue-600 text-white rounded-full font-black uppercase text-[10px] tracking-widest italic shadow-xl">Dewan Pengurus Inti</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {orgData.filter(m => m.level === 2).map(person => (
                      <div key={person.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl text-center group hover:-translate-y-2 transition-all duration-500">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-3xl overflow-hidden border-2 border-blue-50 group-hover:border-blue-600 transition-all">
                           {person.photo_url ? <img src={person.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-50 flex items-center justify-center"><User className="text-slate-200" /></div>}
                        </div>
                        <h4 className="font-black text-slate-900 text-[13px] italic uppercase leading-tight mb-2">{person.name}</h4>
                        <span className="px-3 py-1 bg-slate-900 text-white text-[8px] font-black uppercase rounded-lg tracking-widest">{person.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- LVL 5: BIDANG/SEKSI & ANGGOTA --- */}
                <div className="relative z-10 w-full">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                    <span className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Struktur Bidang & Anggota</span>
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                  </div>
                  
                  {/* Grouping Level 3 by Role/Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from(new Set(orgData.filter(m => m.level === 3).map(m => m.role))).map(role => (
                      <div key={role} className="bg-white/60 backdrop-blur-sm p-6 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all">
                        <div className="flex items-center gap-3 mb-4 border-b border-slate-50 pb-3">
                          <LayoutGrid size={18} className="text-blue-600" />
                          <h5 className="font-black text-slate-800 text-[10px] uppercase tracking-wider italic">{role}</h5>
                        </div>
                        <div className="space-y-3">
                          {orgData.filter(m => m.role === role && m.level === 3).map(member => (
                            <div key={member.id} className="flex items-center gap-3 group">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-50">
                                {member.photo_url ? <img src={member.photo_url} className="w-full h-full object-cover" /> : <User size={16} className="m-auto mt-2 text-slate-300" />}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-[10px] uppercase leading-none mb-1 group-hover:text-blue-600 transition-colors">{member.name}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Anggota Bidang</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Empty State */}
                {orgData.length === 0 && (
                  <div className="py-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div><p className="text-slate-400 font-bold uppercase text-[10px]">Loading Database...</p></div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
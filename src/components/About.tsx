import React, { useState, useEffect } from 'react'; 
import { 
  Target, Rocket, Shield, Award, 
  CheckCircle2, Users2, ArrowRight, User, ShieldCheck, 
  ChevronDown, Star, GraduationCap
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
        .order('created_at', { ascending: true });

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

  const getLevelColor = (level: number) => {
    switch(level) {
      case 1: return 'bg-amber-500'; 
      case 2: return 'bg-emerald-500'; 
      case 3: return 'bg-blue-600'; 
      case 4: return 'bg-purple-600'; 
      default: return 'bg-slate-500';
    }
  };

  // --- FUNGSI BARU UNTUK LOGIKA PENGELOMPOKAN BIDANG ---
  const renderDepartmentLogic = () => {
    // Level 6 diasumsikan sebagai Koordinator
    const coordinators = orgData.filter(m => m.level === 6);
    // Level 7 diasumsikan sebagai Anggota
    const members = orgData.filter(m => m.level === 7);

    return coordinators.map(coord => {
      // Mengambil kata kunci bidang (misal dari "Koordinator Humas" diambil "Humas")
      const bidangName = coord.role.toLowerCase().replace('koordinator', '').trim();
      const clusterMembers = members.filter(mem => 
        mem.role.toLowerCase().includes(bidangName)
      );

      return (
        <div key={coord.id} className="flex flex-col items-center gap-6 w-full animate-in fade-in duration-700">
          {/* Garis Vertikal Penghubung ke Atas */}
          <div className="w-0.5 h-8 bg-slate-200"></div>
          
          {/* Kartu Koordinator */}
          <div className="bg-white p-4 rounded-[1.5rem] border-2 border-blue-400 shadow-md w-44 md:w-52 text-center relative z-10">
            <div className="w-16 h-16 mx-auto mb-2 relative">
              <img 
                src={coord.photo_url || `https://ui-avatars.com/api/?name=${coord.name}&background=3b82f6&color=fff`} 
                className="w-full h-full rounded-xl object-cover border-2 border-slate-50 shadow-sm" 
                alt={coord.name} 
              />
            </div>
            <p className="font-black text-[10px] uppercase text-slate-800 leading-tight">{coord.name}</p>
            <span className="text-[7px] bg-blue-600 text-white px-3 py-1 rounded-full font-black mt-2 inline-block uppercase italic tracking-tighter">
              {coord.role}
            </span>
          </div>

          {/* Garis Cabang Anggota */}
          {clusterMembers.length > 0 && (
            <div className="flex flex-col items-center w-full">
              <div className="w-0.5 h-6 bg-blue-200"></div>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-4">
                {clusterMembers.map(mem => (
                  <div key={mem.id} className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm w-32 md:w-36 text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 mx-auto mb-1.5">
                      <img 
                        src={mem.photo_url || `https://ui-avatars.com/api/?name=${mem.name}&background=f1f5f9&color=64748b`} 
                        className="w-full h-full rounded-lg object-cover grayscale hover:grayscale-0 transition-all" 
                        alt={mem.name} 
                      />
                    </div>
                    <p className="font-bold text-[8px] text-slate-700 leading-tight min-h-[1rem] flex items-center justify-center">{mem.name}</p>
                    <p className="text-[6px] text-blue-500 font-bold uppercase mt-1">{mem.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <section id="tentang-kami" className="relative w-full h-screen bg-white flex flex-col items-center overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col py-2 md:py-4">
        
        {/* 1. Header Section */}
        <div className="text-center mb-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full mb-1">
            <Users2 size={10} className="animate-pulse" />
            <span className="text-[7px] font-black uppercase tracking-[0.2em]">Profil Organisasi</span>
          </div>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight uppercase leading-none italic">
            Tentang <span className="text-blue-600">Kami</span>
          </h2>
        </div>

        {/* 2. Tab Switcher */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-3 shrink-0">
          {['sejarah', 'visi-misi', 'fasilitas'].map((id) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`px-3 md:px-5 py-1.5 rounded-lg font-bold text-[8px] md:text-xs uppercase border-2 transition-all ${
                activeTab === id ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105' : 'bg-white text-slate-400 border-slate-100'
              }`}
            >
              {id.replace('-', ' ')}
            </button>
          ))}
          <button
            onClick={() => handleTabChange('organisasi')}
            className={`px-3 md:px-5 py-1.5 rounded-lg font-bold text-[8px] md:text-xs uppercase border-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'organisasi' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-900 text-white border-slate-900'
            }`}
          >
            Struktur <ArrowRight size={10} />
          </button>
        </div>

        {/* 3. Kotak Konten Utama */}
        <div className={`flex-1 min-h-0 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 border border-slate-100 shadow-sm relative ${activeTab === 'organisasi' ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}>
          
          {activeTab === 'sejarah' && <div className="h-full flex items-center justify-center italic text-slate-400">Konten Sejarah...</div>}
          
          {/* TAB ORGANISASI */}
          {activeTab === 'organisasi' && (
            <div className="w-full flex flex-col items-center py-8 animate-in slide-in-from-bottom-5 duration-700 pb-32">
              
              {/* LEVEL 1: PENANGGUNG JAWAB (CENTERED) */}
              <div className="relative flex flex-col items-center mb-12">
                {orgData.filter(m => m.level === 1).map(p => (
                  <div key={p.id} className="relative z-10 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-[2.5rem] border-4 border-amber-400 shadow-2xl text-center w-56 md:w-64 transform transition-all hover:scale-105">
                      <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-3">
                        <img 
                          src={p.photo_url || `https://ui-avatars.com/api/?name=${p.name}&background=f59e0b&color=fff`} 
                          className="w-full h-full rounded-2xl object-cover border-2 border-slate-50 shadow-md" 
                          alt={p.name}
                        />
                      </div>
                      <p className="font-black text-[10px] md:text-xs uppercase italic text-slate-900 leading-tight mb-2">{p.name}</p>
                      <span className="text-[8px] bg-amber-500 text-white px-4 py-1 rounded-full font-black uppercase tracking-tighter">
                        {p.role}
                      </span>
                    </div>
                    <div className="w-1 h-12 bg-gradient-to-b from-amber-400 to-blue-400"></div>
                  </div>
                ))}
              </div>

              {/* LEVEL 2-4: PEMBINA & KETUA (CENTERED/FLEX WRAP) */}
              <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-16 relative w-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-blue-100 -z-10 hidden md:block"></div>
                {orgData.filter(m => m.level >= 2 && m.level <= 4).map(p => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-blue-100 hidden md:block"></div>
                    <div className="bg-white p-4 rounded-[2rem] border-2 border-emerald-100 shadow-lg text-center w-44 md:w-48 transition-transform hover:scale-105">
                      <div className="w-16 h-16 mx-auto mb-2">
                        <img src={p.photo_url} className="w-full h-full rounded-xl object-cover border shadow-sm" alt={p.name} />
                      </div>
                      <p className="font-black text-[9px] md:text-[10px] uppercase italic text-slate-800 leading-tight">{p.name}</p>
                      <span className={`text-[7px] text-white px-3 py-1 rounded-lg font-bold mt-2 inline-block uppercase ${getLevelColor(p.level)}`}>
                        {p.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* LEVEL 5: KEPALA PELATIH (FIXED CENTER) */}
              <div className="flex flex-col items-center mb-4 w-full">
                <div className="w-full flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Departemen Teknis & Pelatihan</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                </div>

                {orgData.filter(m => m.level === 5 || m.role.toLowerCase().includes('kepala pelatih')).map(p => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="bg-slate-900 p-5 rounded-[2.2rem] shadow-2xl text-center w-52 md:w-60 border-4 border-blue-500 relative transform transition-all hover:scale-105">
                      <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 relative">
                        <img src={p.photo_url} className="w-full h-full rounded-2xl object-cover border-2 border-white" alt={p.name} />
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl text-white shadow-xl animate-bounce">
                           <GraduationCap size={14} />
                        </div>
                      </div>
                      <p className="font-black text-[11px] uppercase text-white leading-tight mb-1">{p.name}</p>
                      <span className="text-[8px] bg-blue-600 text-white px-4 py-1.5 rounded-full font-black mt-1 inline-block uppercase tracking-widest">
                         {p.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* LEVEL 6 & 7: KOORDINATOR & ANGGOTA (GROUPED BY BIDANG) */}
              <div className="w-full max-w-6xl flex flex-col gap-4">
                {renderDepartmentLogic()}
              </div>

            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </section>
  );
}
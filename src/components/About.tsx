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

  // --- LOGIKA BARU: MENGELOMPOKKAN ANGGOTA BERDASARKAN BIDANG KOORDINATOR ---
  const renderDepartmentGroups = () => {
    const coordinators = orgData.filter(m => m.level === 6);
    const allMembers = orgData.filter(m => m.level === 7);

    return coordinators.map(coord => {
      // Mengambil nama bidang dari role koordinator (misal: "Koordinator Humas" -> "Humas")
      const bidangName = coord.role.toLowerCase().replace('koordinator', '').trim();
      // Mencari anggota yang rolenya mengandung nama bidang tersebut
      const matchedMembers = allMembers.filter(mem => 
        mem.role.toLowerCase().includes(bidangName)
      );

      return (
        <div key={coord.id} className="flex flex-col items-center w-full mb-12">
          {/* Garis Komando ke Koordinator */}
          <div className="w-0.5 h-8 bg-slate-200"></div>
          
          {/* Kartu Koordinator */}
          <div className="bg-white p-4 rounded-[1.5rem] border-2 border-blue-400 shadow-md w-48 md:w-56 text-center z-10 transition-transform hover:scale-105">
            <div className="w-16 h-16 mx-auto mb-2">
              <img 
                src={coord.photo_url || `https://ui-avatars.com/api/?name=${coord.name}&background=3b82f6&color=fff`} 
                className="w-full h-full rounded-xl object-cover border-2 border-slate-50" 
                alt={coord.name} 
              />
            </div>
            <p className="font-black text-[10px] uppercase text-slate-800 leading-tight">{coord.name}</p>
            <span className="text-[7px] bg-blue-600 text-white px-3 py-1 rounded-full font-black mt-2 inline-block uppercase italic">
              {coord.role}
            </span>
          </div>

          {/* Garis Cabang ke Anggota */}
          {matchedMembers.length > 0 && (
            <div className="flex flex-col items-center w-full mt-4">
              <div className="w-0.5 h-6 bg-blue-100"></div>
              <div className="flex flex-wrap justify-center gap-3 px-4">
                {matchedMembers.map(mem => (
                  <div key={mem.id} className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm w-32 text-center hover:shadow-md transition-all">
                    <div className="w-12 h-12 mx-auto mb-1.5">
                      <img 
                        src={mem.photo_url || `https://ui-avatars.com/api/?name=${mem.name}&background=f1f5f9&color=64748b`} 
                        className="w-full h-full rounded-lg object-cover grayscale hover:grayscale-0" 
                        alt={mem.name} 
                      />
                    </div>
                    <p className="font-bold text-[8px] text-slate-700 leading-tight">{mem.name}</p>
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
        
        {/* Header & Tabs */}
        <div className="text-center mb-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full mb-1">
            <Users2 size={10} className="animate-pulse" />
            <span className="text-[7px] font-black uppercase tracking-[0.2em]">Profil Organisasi</span>
          </div>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight uppercase leading-none italic">
            Tentang <span className="text-blue-600">Kami</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 mb-3 shrink-0">
          {['sejarah', 'visi-misi', 'fasilitas'].map((id) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`px-3 md:px-5 py-1.5 rounded-lg font-bold text-[8px] md:text-xs uppercase border-2 transition-all ${
                activeTab === id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100'
              }`}
            >
              {id.replace('-', ' ')}
            </button>
          ))}
          <button
            onClick={() => handleTabChange('organisasi')}
            className={`px-3 md:px-5 py-1.5 rounded-lg font-bold text-[8px] md:text-xs uppercase border-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'organisasi' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-900 text-white border-slate-900'
            }`}
          >
            Struktur <ArrowRight size={10} />
          </button>
        </div>

        {/* Kotak Konten Utama */}
        <div className={`flex-1 min-h-0 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 border border-slate-100 shadow-sm relative ${activeTab === 'organisasi' ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}>
          
          {activeTab === 'sejarah' && <div className="animate-in fade-in italic text-center py-20 text-slate-400">Memuat Konten Sejarah...</div>}
          {activeTab === 'visi-misi' && <div className="animate-in fade-in italic text-center py-20 text-slate-400">Memuat Konten Visi Misi...</div>}
          {activeTab === 'fasilitas' && <div className="animate-in fade-in italic text-center py-20 text-slate-400">Memuat Konten Fasilitas...</div>}

          {/* TAB ORGANISASI - STRUKTUR YANG TELAH DIPERBAIKI */}
          {activeTab === 'organisasi' && (
            <div className="w-full flex flex-col items-center py-8 animate-in slide-in-from-bottom-5 duration-700 pb-32">
              
              {/* LEVEL 1: PENANGGUNG JAWAB (CENTERED) */}
              <div className="relative flex flex-col items-center mb-12">
                {orgData.filter(m => m.level === 1).map(p => (
                  <div key={p.id} className="relative z-10 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-[2rem] border-4 border-amber-400 shadow-2xl text-center w-56 md:w-64 transform transition-all hover:scale-105">
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

              {/* LEVEL 2-4: PEMBINA & PENGURUS INTI (HORIZONTAL LAYOUT) */}
              <div className="relative flex flex-col items-center w-full mb-16">
                <div className="absolute top-0 h-0.5 bg-blue-100 w-2/3 left-1/6 right-1/6 hidden md:block"></div>
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 relative z-10">
                  {orgData.filter(m => m.level >= 2 && m.level <= 4).map(p => (
                    <div key={p.id} className="flex flex-col items-center">
                      <div className="w-0.5 h-4 bg-blue-100 hidden md:block"></div>
                      <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-lg text-center w-40 md:w-44">
                        <div className="w-16 h-16 mx-auto mb-2">
                          <img src={p.photo_url} className="w-full h-full rounded-xl object-cover" alt={p.name} />
                        </div>
                        <p className="font-bold text-[9px] uppercase text-slate-800 leading-tight mb-1">{p.name}</p>
                        <span className={`text-[7px] text-white px-3 py-0.5 rounded-md font-bold uppercase ${getLevelColor(p.level)}`}>
                          {p.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-0.5 h-12 bg-slate-200"></div>
              </div>

              {/* LEVEL 5: KEPALA PELATIH (FIXED CENTER) */}
              <div className="relative flex flex-col items-center mb-4 w-full">
                {orgData.filter(m => m.level === 5 || m.role.toLowerCase().includes('kepala pelatih')).map(p => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="bg-slate-900 p-5 rounded-[2.2rem] shadow-2xl text-center w-52 md:w-60 border-4 border-blue-500 relative transform transition-all hover:scale-105">
                      <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 relative">
                        <img src={p.photo_url} className="w-full h-full rounded-2xl object-cover border-2 border-white shadow-lg" alt={p.name} />
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl text-white shadow-xl">
                           <GraduationCap size={14} className="animate-pulse" />
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

              {/* GRUP BIDANG: KOORDINATOR + ANGGOTA (DYNAMIC LOGIC) */}
              <div className="w-full max-w-6xl flex flex-col items-center">
                {renderDepartmentGroups()}
              </div>

            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </section>
  );
}
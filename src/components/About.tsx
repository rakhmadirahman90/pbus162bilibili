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

  // Helper Warna Label
  const getLevelColor = (level: number) => {
    switch(level) {
      case 1: return 'bg-amber-500'; 
      case 2: return 'bg-emerald-500'; 
      case 3: return 'bg-blue-600'; 
      case 4: return 'bg-purple-600'; 
      default: return 'bg-slate-500';
    }
  };

  return (
    <section id="tentang-kami" className="relative w-full h-screen bg-white flex flex-col items-center overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col py-2 md:py-4">
        
        {/* Header & Tabs (Tetap sama seperti sebelumnya) */}
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
          
          {/* Render Sejarah, Visi Misi, Fasilitas (Sama seperti sebelumnya) */}
          {activeTab === 'sejarah' && <div className="animate-in fade-in italic text-center py-20 text-slate-400">Memuat Konten Sejarah...</div>}
          {/* ... (Tab lain diabaikan untuk fokus ke Struktur) ... */}

          {/* TAB ORGANISASI - DESAIN BARU DENGAN GARIS KOMANDO */}
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
                    {/* Garis Komando Vertikal ke Bawah */}
                    <div className="w-1 h-12 bg-gradient-to-b from-amber-400 to-blue-400"></div>
                  </div>
                ))}
              </div>

              {/* LEVEL 2 & 3: PEMBINA / PENASEHAT (HORIZONTAL LINE) */}
              <div className="relative flex flex-col items-center w-full mb-12">
                {/* Garis Koordinasi Horizontal */}
                <div className="absolute top-0 h-0.5 bg-blue-200 w-1/2 left-1/4 right-1/4 hidden md:block"></div>
                
                <div className="flex flex-wrap justify-center gap-4 md:gap-12 relative z-10">
                  {orgData.filter(m => m.level === 2 || m.level === 3).map(p => (
                    <div key={p.id} className="flex flex-col items-center">
                      {/* Garis penghubung kecil ke garis horizontal */}
                      <div className="w-0.5 h-4 bg-blue-200 hidden md:block"></div>
                      <div className="bg-white p-3 rounded-2xl border-2 border-emerald-100 shadow-xl text-center w-40 md:w-48">
                        <div className="w-16 h-16 mx-auto mb-2">
                          <img 
                            src={p.photo_url || `https://ui-avatars.com/api/?name=${p.name}&background=10b981&color=fff`} 
                            className="w-full h-full rounded-xl object-cover border border-slate-50" 
                            alt={p.name}
                          />
                        </div>
                        <p className="font-bold text-[9px] md:text-[10px] uppercase italic text-slate-800 leading-tight mb-1">{p.name}</p>
                        <span className={`text-[7px] text-white px-3 py-0.5 rounded-md font-bold uppercase ${getLevelColor(p.level)}`}>
                          {p.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Garis Komando Lanjut ke Bawah */}
                <div className="w-0.5 h-12 bg-blue-100"></div>
              </div>

              {/* LEVEL 4: KETUA UMUM (CENTERED) */}
              <div className="relative flex flex-col items-center mb-16 w-full">
                 {orgData.filter(m => m.level === 4).map(p => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="bg-blue-600 p-4 rounded-3xl shadow-2xl text-center w-48 md:w-56 transform border-4 border-white">
                      <div className="w-20 h-20 mx-auto mb-2">
                        <img 
                          src={p.photo_url || `https://ui-avatars.com/api/?name=${p.name}&background=fff&color=3b82f6`} 
                          className="w-full h-full rounded-2xl object-cover border-2 border-blue-400" 
                          alt={p.name}
                        />
                      </div>
                      <p className="font-black text-[10px] uppercase text-white leading-tight mb-1">{p.name}</p>
                      <span className="text-[8px] bg-white text-blue-600 px-3 py-0.5 rounded-full font-black uppercase">
                        {p.role}
                      </span>
                    </div>
                    <div className="w-0.5 h-12 bg-slate-200"></div>
                  </div>
                ))}
              </div>

              {/* LEVEL 5 - 7: PENGURUS & ANGGOTA (GRID SYSTEM) */}
              <div className="w-full max-w-6xl px-2 space-y-16">
                {[5, 6, 7].map(lvl => {
                  const members = orgData.filter(m => m.level === lvl);
                  if (members.length === 0) return null;
                  
                  return (
                    <div key={lvl} className="relative">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Bidang {lvl === 5 ? 'Inti' : lvl === 6 ? 'Departemen' : 'Anggota'}</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {members.map(p => (
                          <div key={p.id} className="group bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center">
                            <div className="w-14 h-14 md:w-16 md:h-16 mb-2 relative">
                              <img 
                                src={p.photo_url || `https://ui-avatars.com/api/?name=${p.name}&background=f1f5f9&color=64748b`} 
                                className="w-full h-full rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all border border-slate-50" 
                                alt={p.name}
                              />
                            </div>
                            <p className="font-bold text-[9px] uppercase text-slate-800 leading-tight h-8 flex items-center justify-center">
                              {p.name}
                            </p>
                            <p className="text-blue-500 font-black text-[7px] uppercase mt-1 tracking-tighter opacity-80">
                              {p.role}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
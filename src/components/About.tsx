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
      case 4: return 'bg-indigo-600'; 
      case 5: return 'bg-rose-500'; // Warna untuk Pengurus Inti
      default: return 'bg-slate-500';
    }
  };

  const renderDepartment = (title: string, roleKey: string) => {
    const coordinator = orgData.find(m => 
      m.level === 6 && 
      m.role.toLowerCase().includes(roleKey.toLowerCase())
    );
    const members = orgData.filter(m => 
      m.level === 7 && 
      m.role.toLowerCase().includes(roleKey.toLowerCase())
    );

    if (!coordinator && members.length === 0) return null;

    return (
      <div className="w-full mb-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{title}</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>

        {coordinator && (
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white p-4 rounded-[2rem] border-2 border-amber-400 shadow-lg text-center w-48 md:w-56">
              <div className="w-20 h-20 mx-auto mb-3">
                <img 
                  src={coordinator.photo_url || `https://ui-avatars.com/api/?name=${coordinator.name}&background=f59e0b&color=fff`} 
                  className="w-full h-full rounded-2xl object-cover border-2 border-slate-50 shadow-sm" 
                  alt={coordinator.name}
                />
              </div>
              <p className="font-black text-[9px] md:text-[10px] uppercase italic text-slate-900 leading-tight mb-2">{coordinator.name}</p>
              <span className="text-[7px] bg-amber-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                {coordinator.role}
              </span>
            </div>
            <div className="w-0.5 h-8 bg-slate-200"></div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {members.map(p => (
            <div key={p.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-14 md:h-14 mb-2">
                <img 
                  src={p.photo_url || `https://ui-avatars.com/api/?name=${p.name}&background=f1f5f9&color=64748b`} 
                  className="w-full h-full rounded-xl object-cover" 
                  alt={p.name}
                />
              </div>
              <p className="font-bold text-[8px] md:text-[9px] uppercase text-slate-800 leading-tight">{p.name}</p>
              <p className="text-blue-500 font-bold text-[6px] md:text-[7px] uppercase mt-1">{p.role}</p>
            </div>
          ))}
        </div>
      </div>
    );
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

        <div className={`flex-1 min-h-0 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 border border-slate-100 shadow-sm relative ${activeTab === 'organisasi' ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}>
          
          {activeTab === 'organisasi' && (
            <div className="w-full flex flex-col items-center py-8 animate-in slide-in-from-bottom-5 duration-700 pb-32">
              
              {/* LEVEL 1: PENANGGUNG JAWAB */}
              <div className="relative flex flex-col items-center mb-12">
                {orgData.filter(m => m.level === 1).map(p => (
                  <div key={p.id} className="relative z-10 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-[2.5rem] border-4 border-amber-400 shadow-2xl text-center w-60 md:w-72">
                      <div className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-3">
                        <img src={p.photo_url} className="w-full h-full rounded-[2rem] object-cover border-2 border-slate-50 shadow-md" alt={p.name} />
                      </div>
                      <p className="font-black text-[11px] md:text-sm uppercase italic text-slate-900 leading-tight mb-2">{p.name}</p>
                      <span className="text-[9px] bg-amber-500 text-white px-5 py-1.5 rounded-full font-black uppercase">{p.role}</span>
                    </div>
                    <div className="w-1 h-12 bg-gradient-to-b from-amber-400 to-blue-400"></div>
                  </div>
                ))}
              </div>

              {/* LEVEL 2 & 3: PEMBINA / PENASEHAT */}
              <div className="relative flex flex-col items-center w-full mb-12">
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 relative z-10">
                  {orgData.filter(m => m.level === 2 || m.level === 3).map(p => (
                    <div key={p.id} className="bg-white p-3 rounded-2xl border-2 border-emerald-100 shadow-xl text-center w-40 md:w-48">
                      <div className="w-16 h-16 mx-auto mb-2">
                        <img src={p.photo_url} className="w-full h-full rounded-xl object-cover" alt={p.name} />
                      </div>
                      <p className="font-bold text-[9px] md:text-[10px] uppercase italic text-slate-800 leading-tight mb-1">{p.name}</p>
                      <span className={`text-[7px] text-white px-3 py-0.5 rounded-md font-bold uppercase ${getLevelColor(p.level)}`}>{p.role}</span>
                    </div>
                  ))}
                </div>
                <div className="w-0.5 h-12 bg-blue-100"></div>
              </div>

              {/* LEVEL 4: KETUA UMUM */}
              <div className="relative flex flex-col items-center mb-8 w-full">
                 {orgData.filter(m => m.level === 4).map(p => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="bg-blue-600 p-4 rounded-3xl shadow-2xl text-center w-52 md:w-60 transform border-4 border-white">
                      <div className="w-24 h-24 mx-auto mb-2">
                        <img src={p.photo_url} className="w-full h-full rounded-2xl object-cover border-2 border-blue-400" alt={p.name} />
                      </div>
                      <p className="font-black text-[11px] uppercase text-white leading-tight mb-1">{p.name}</p>
                      <span className="text-[8px] bg-white text-blue-600 px-4 py-1 rounded-full font-black uppercase">{p.role}</span>
                    </div>
                    <div className="w-0.5 h-10 bg-slate-200"></div>
                  </div>
                ))}
              </div>

              {/* LEVEL 5: PENGURUS INTI (Sekretaris, Bendahara, Dll) - INI YANG TADI HILANG */}
              <div className="w-full max-w-5xl mb-16">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center items-center">
                  {orgData.filter(m => m.level === 5).map(p => (
                    <div key={p.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                      <div className="w-14 h-14 md:w-16 md:h-16 mb-2">
                        <img src={p.photo_url} className="w-full h-full rounded-xl object-cover border border-slate-50" alt={p.name} />
                      </div>
                      <p className="font-bold text-[9px] md:text-[10px] uppercase text-slate-800 leading-tight">{p.name}</p>
                      <p className="text-rose-500 font-black text-[7px] uppercase mt-1 tracking-tighter">{p.role}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* LEVEL 6 & 7: BERDASARKAN BIDANG */}
              <div className="w-full max-w-6xl px-2">
                {renderDepartment("Bidang Pertandingan", "Pertandingan")}
                {renderDepartment("Bidang Pembinaan Prestasi", "Binpres")}
                {renderDepartment("Bidang Humas", "Humas")}
                {renderDepartment("Bidang Rohani & Sarpras", "Rohani")}
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
import React, { useState, useEffect } from 'react'; 
import { 
  Target, Rocket, Shield, Users2, ArrowRight
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
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'about_content').maybeSingle();
      if (data) setDynamicContent(typeof data.value === 'string' ? JSON.parse(data.value) : data.value);
    } catch (err) { console.error(err); }
  };

  const fetchOrganizationalStructure = async () => {
    try {
      const { data } = await supabase.from('organizational_structure').select('*').order('level', { ascending: true });
      if (data) setOrgData(data);
    } catch (err) { console.error(err); }
  };

  const handleTabChange = (id: string) => {
    if (onTabChange) onTabChange(id);
    else setInternalTab(id);
  };

  // Logika Pengelompokan Bidang:
  // Mengambil Koordinator (Level 6) dan mencari anggota (Level 7) yang memiliki kata kunci role yang sama
  const renderDepartmentLogic = () => {
    const coordinators = orgData.filter(m => m.level === 6);
    const members = orgData.filter(m => m.level === 7);

    return coordinators.map(coord => {
      // Mencari kesamaan bidang (misal: "Humas" di Koordinator Humas dengan Anggota Humas)
      const bidangName = coord.role.toLowerCase().replace('koordinator', '').trim();
      const clusterMembers = members.filter(mem => mem.role.toLowerCase().includes(bidangName));

      return (
        <div key={coord.id} className="flex flex-col items-center gap-6 border-t border-slate-100 pt-8 w-full">
          {/* Koordinator Bidang */}
          <div className="flex flex-col items-center group">
            <div className="bg-white p-3 rounded-2xl border-2 border-blue-400 shadow-md w-40 text-center">
              <div className="w-16 h-16 mx-auto mb-2">
                <img src={coord.photo_url || `https://ui-avatars.com/api/?name=${coord.name}&background=3b82f6&color=fff`} className="w-full h-full rounded-xl object-cover" alt={coord.name} />
              </div>
              <p className="font-bold text-[10px] uppercase text-slate-800 leading-tight">{coord.name}</p>
              <span className="text-[7px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black mt-1 inline-block uppercase italic">{coord.role}</span>
            </div>
            {clusterMembers.length > 0 && <div className="w-0.5 h-6 bg-blue-200"></div>}
          </div>

          {/* Anggota di Bawah Koordinator */}
          <div className="flex flex-wrap justify-center gap-4">
            {clusterMembers.map(mem => (
              <div key={mem.id} className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm w-32 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto mb-1">
                  <img src={mem.photo_url || `https://ui-avatars.com/api/?name=${mem.name}&background=f1f5f9&color=64748b`} className="w-full h-full rounded-lg object-cover grayscale hover:grayscale-0" alt={mem.name} />
                </div>
                <p className="font-bold text-[8px] text-slate-700 leading-tight">{mem.name}</p>
                <p className="text-[6px] text-blue-500 font-bold uppercase">{mem.role}</p>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <section id="tentang-kami" className="relative w-full h-screen bg-white flex flex-col items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col py-4">
        
        {/* Header Section */}
        <div className="text-center mb-4 shrink-0">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 italic uppercase">Tentang <span className="text-blue-600">Kami</span></h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-2 mb-4 shrink-0">
          {['sejarah', 'visi-misi', 'fasilitas'].map((id) => (
            <button key={id} onClick={() => handleTabChange(id)} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase border-2 ${activeTab === id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400'}`}>
              {id.replace('-', ' ')}
            </button>
          ))}
          <button onClick={() => handleTabChange('organisasi')} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase border-2 flex items-center gap-2 ${activeTab === 'organisasi' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-900 text-white border-slate-900'}`}>
            Struktur <ArrowRight size={12} />
          </button>
        </div>

        {/* Content Box */}
        <div className={`flex-1 min-h-0 bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 shadow-sm overflow-y-auto custom-scrollbar`}>
          
          {activeTab === 'organisasi' && (
            <div className="w-full flex flex-col items-center py-4 animate-in slide-in-from-bottom-5 duration-700">
              
              {/* LEVEL 1: PENANGGUNG JAWAB (CENTER) */}
              <div className="flex flex-col items-center mb-16">
                {orgData.filter(m => m.level === 1).map(p => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="bg-white p-5 rounded-[2.5rem] border-4 border-amber-400 shadow-xl text-center w-64 transform transition-hover hover:scale-105">
                      <div className="w-24 h-24 mx-auto mb-3">
                        <img src={p.photo_url} className="w-full h-full rounded-2xl object-cover border shadow-sm" alt={p.name} />
                      </div>
                      <p className="font-black text-xs uppercase italic text-slate-900 leading-tight">{p.name}</p>
                      <span className="text-[8px] bg-amber-500 text-white px-3 py-1 rounded-full font-black mt-2 inline-block uppercase">PENANGGUNG JAWAB</span>
                    </div>
                    <div className="w-0.5 h-12 bg-gradient-to-b from-amber-400 to-blue-400"></div>
                  </div>
                ))}
              </div>

              {/* LEVEL 2-4: PEMBINA & KETUA (CENTERED) */}
              <div className="flex flex-wrap justify-center gap-12 mb-16">
                {orgData.filter(m => m.level >= 2 && m.level <= 4).map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-[2rem] border-2 border-blue-100 shadow-lg text-center w-48">
                    <div className="w-16 h-16 mx-auto mb-2">
                      <img src={p.photo_url} className="w-full h-full rounded-xl object-cover" alt={p.name} />
                    </div>
                    <p className="font-black text-[10px] uppercase italic text-slate-800 leading-tight">{p.name}</p>
                    <span className="text-[7px] text-blue-600 font-black uppercase mt-1 inline-block">{p.role}</span>
                  </div>
                ))}
              </div>

              {/* LEVEL 5: KEPALA PELATIH (FIXED CENTER) */}
              <div className="flex flex-col items-center mb-16 w-full">
                <div className="w-full flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Departemen Teknis</span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>
                {orgData.filter(m => m.role.toLowerCase().includes('kepala pelatih')).map(p => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="bg-slate-900 p-5 rounded-[2rem] shadow-2xl text-center w-56 border-4 border-blue-500">
                      <div className="w-20 h-20 mx-auto mb-3 relative">
                        <img src={p.photo_url} className="w-full h-full rounded-2xl object-cover border-2 border-white" alt={p.name} />
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 p-1.5 rounded-lg text-white shadow-lg"><Users2 size={12} /></div>
                      </div>
                      <p className="font-black text-[10px] uppercase text-white leading-tight">{p.name}</p>
                      <span className="text-[8px] bg-blue-600 text-white px-3 py-1 rounded-lg font-black mt-2 inline-block uppercase">KEPALA PELATIH</span>
                    </div>
                    <div className="w-0.5 h-12 bg-slate-200"></div>
                  </div>
                ))}
              </div>

              {/* LEVEL 6 & 7: KOORDINATOR & ANGGOTA (GROUPED BY BIDANG) */}
              <div className="w-full max-w-5xl flex flex-col gap-12">
                {renderDepartmentLogic()}
              </div>

            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </section>
  );
}
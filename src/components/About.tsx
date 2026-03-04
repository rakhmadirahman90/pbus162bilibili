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
      case 4: return 'bg-emerald-500'; 
      default: return 'bg-blue-600';
    }
  };

  // Helper untuk mengelompokkan anggota berdasarkan koordinator/bidang (Sesuai Preview Admin)
  const renderDepartment = (title: string, coordinatorRole: string, memberRole: string) => {
    const coordinator = orgData.find(m => m.role.toLowerCase().includes(coordinatorRole.toLowerCase()));
    const members = orgData.filter(m => m.role.toLowerCase().includes(memberRole.toLowerCase()) && m.id !== coordinator?.id);

    if (!coordinator && members.length === 0) return null;

    return (
      <div className="w-full flex flex-col items-center mb-20">
        {/* Label Bidang (Sesuai Gambar Admin) */}
        <div className="mb-8 px-8 py-1.5 border-2 border-blue-100 rounded-full">
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{title}</span>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center w-full max-w-4xl">
          {/* Koordinator */}
          {coordinator && (
            <div className="flex flex-col items-center mb-10">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-lg mb-4">
                <img src={coordinator.photo_url} className="w-full h-full object-cover" alt={coordinator.name} />
              </div>
              <h4 className="font-black text-xs md:text-sm text-slate-900 uppercase italic mb-2">{coordinator.name}</h4>
              <span className="bg-amber-500 text-white text-[8px] font-bold px-4 py-1 rounded-full uppercase">
                {coordinator.role}
              </span>
            </div>
          )}

          {/* Anggota Bidang (Grid Inside) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {members.map(m => (
              <div key={m.id} className="bg-slate-50/50 p-4 rounded-2xl border border-white flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl overflow-hidden mb-2 grayscale hover:grayscale-0 transition-all">
                  <img src={m.photo_url} className="w-full h-full object-cover" alt={m.name} />
                </div>
                <p className="text-[9px] font-bold text-slate-800 uppercase leading-tight">{m.name}</p>
                <p className="text-[7px] text-blue-500 font-black uppercase mt-1 opacity-70">{m.role}</p>
              </div>
            ))}
          </div>
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

        {/* Kotak Konten Utama */}
        <div className={`flex-1 min-h-0 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 border border-slate-100 shadow-sm relative ${activeTab === 'organisasi' ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}>
          
          {activeTab === 'sejarah' && <div className="animate-in fade-in italic text-center py-20 text-slate-400">Memuat Konten Sejarah...</div>}

          {/* TAB ORGANISASI - IMPLEMENTASI SESUAI GAMBAR ADMIN */}
          {activeTab === 'organisasi' && (
            <div className="w-full flex flex-col items-center py-8 animate-in slide-in-from-bottom-5 duration-700 pb-32">
              
              {/* LEVEL 1: PENANGGUNG JAWAB (SESUAI GAMBAR CA7343) */}
              <div className="relative flex flex-col items-center mb-16">
                {orgData.filter(m => m.level === 1).map(p => (
                  <div key={p.id} className="relative z-10 flex flex-col items-center">
                    <div className="bg-white p-6 rounded-[2.5rem] border-4 border-amber-400 shadow-2xl text-center w-64 md:w-72">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden shadow-inner">
                        <img src={p.photo_url} className="w-full h-full object-cover" alt={p.name} />
                      </div>
                      <p className="font-black text-xs md:text-sm uppercase italic text-slate-900 mb-2">{p.name}</p>
                      <span className="text-[9px] bg-amber-500 text-white px-6 py-1.5 rounded-full font-black uppercase tracking-widest">
                        {p.role}
                      </span>
                    </div>
                    <div className="w-1 h-16 bg-gradient-to-b from-amber-400 to-blue-200"></div>
                  </div>
                ))}
              </div>

              {/* LEVEL 4: KETUA UMUM (SESUAI GAMBAR CB3A1E) */}
              <div className="relative flex flex-col items-center mb-20 w-full">
                 {orgData.filter(m => m.level === 4).map(p => (
                  <div key={p.id} className="flex flex-col items-center">
                     <div className="mb-4 px-6 py-1 bg-emerald-500 rounded-full text-white text-[9px] font-black uppercase">Ketua Umum</div>
                    <div className="bg-white p-5 rounded-3xl shadow-xl text-center w-56 border-2 border-emerald-100">
                      <div className="w-24 h-24 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-emerald-500/20">
                        <img src={p.photo_url} className="w-full h-full object-cover" alt={p.name} />
                      </div>
                      <p className="font-black text-xs uppercase text-slate-900 mb-1">{p.name}</p>
                      <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-tighter">{p.role}</span>
                    </div>
                    <div className="w-0.5 h-16 bg-blue-100"></div>
                  </div>
                ))}
              </div>

              {/* DINAMIS: SECTIONS PER BIDANG (SESUAI GAMBAR ADMIN CA7381 - CA72EE) */}
              <div className="w-full max-w-5xl space-y-12">
                {renderDepartment("Bidang Pelatih", "Kepala Pelatih", "Pelatih")}
                {renderDepartment("Bidang Pertandingan", "Koordinator Pertandingan", "Anggota Pertandingan")}
                {renderDepartment("Bidang Pembinaan Prestasi", "Koordinator Binpres", "Anggota Binpres")}
                {renderDepartment("Bidang Humas", "Koordinator Humas", "Anggota Humas")}
                {renderDepartment("Lainnya", "Koordinator Rohani", "Anggota Rohani")}
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
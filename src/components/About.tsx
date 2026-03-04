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

  const getByRole = (roleName: string) => 
    orgData.filter(m => m.role.toLowerCase().includes(roleName.toLowerCase()));

  return (
    // PERBAIKAN: Menggunakan h-screen dan overflow-hidden untuk mencegah scroll body
    <section id="tentang-kami" className="relative w-full h-screen bg-white pt-10 pb-6 flex flex-col items-center overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col">
        
        {/* Header Section - Shrink-0 agar tidak tertekan */}
        <div className="text-center mb-6 shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full mb-2">
            <Users2 size={14} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Profil Organisasi</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight uppercase leading-none italic">
            Tentang <span className="text-blue-600">Kami</span>
          </h2>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full shadow-sm"></div>
        </div>

        {/* Tab Switcher - Shrink-0 */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 md:px-8 py-2.5 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 border-2 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200 hover:text-blue-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
          
          <button
            onClick={() => handleTabChange('organisasi')}
            className={`px-6 md:px-8 py-2.5 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 border-2 flex items-center gap-2 group ${
              activeTab === 'organisasi'
              ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200 scale-105'
              : 'bg-slate-900 text-white border-slate-900 hover:bg-blue-700 hover:border-blue-700'
            }`}
          >
            Struktur Organisasi
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Tab Content Box - PERBAIKAN: flex-grow dan overflow-hidden agar pas layar */}
        <div className="flex-grow bg-slate-50/50 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 border border-slate-100 shadow-sm overflow-hidden relative transition-all duration-500">
          
          {/* SEJARAH - FULL HEIGHT CONTAINER */}
          {activeTab === 'sejarah' && (
             <div className="h-full w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid lg:grid-cols-2 gap-10 items-center h-full">
                <div className="relative group hidden lg:block h-full py-4">
                  <div className="absolute inset-0 bg-blue-100/30 rounded-[2.5rem] blur-xl"></div>
                  <img 
                    src={dynamicContent.sejarah_img || "photo_2026-02-03_00-32-07.jpg"} 
                    className="relative w-full h-full object-cover rounded-[2.5rem] shadow-2xl border-4 border-white" 
                    alt="Sejarah" 
                  />
                </div>
                <div className="space-y-4 flex flex-col justify-center h-full">
                  <div className="inline-block w-fit px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest">Legacy & Spirit</div>
                  <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase leading-none italic">
                    {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">{dynamicContent.sejarah_accent || "LEGENDA"}</span> MASA DEPAN
                  </h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
                    {dynamicContent.sejarah_desc || "PB US 162 hadir sebagai pusat keunggulan bulutangkis yang mengintegrasikan sport-science dengan disiplin tinggi."}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {["Sport-science", "GOR Standar BWF", "Karier Pro", "Klasemen Digital"].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                        <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                        <span className="text-[9px] font-black text-slate-700 uppercase">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISI MISI - FULL HEIGHT FLEX */}
          {activeTab === 'visi-misi' && (
            <div className="h-full w-full animate-in fade-in duration-700 grid lg:grid-cols-2 gap-6 items-stretch">
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group flex flex-col justify-center">
                <div className="absolute -top-10 -right-10 opacity-5 text-blue-600"><Target size={200} /></div>
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg"><Target size={28} /></div>
                <span className="text-blue-600 font-black block mb-2 tracking-[0.2em] text-[10px] uppercase italic">Visi Utama</span>
                <p className="text-slate-800 text-xl md:text-3xl font-bold leading-tight italic relative z-10">"{dynamicContent.vision || "Menjadi klub rujukan nasional yang mencetak atlet berprestasi dunia."}"</p>
              </div>
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group flex flex-col justify-center">
                <div className="absolute -top-10 -right-10 opacity-5 text-slate-900"><Rocket size={200} /></div>
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg"><Rocket size={28} /></div>
                <span className="text-blue-600 font-black block mb-2 tracking-[0.2em] text-[10px] uppercase italic">Misi Strategis</span>
                <ul className="space-y-3 relative z-10">
                  {(dynamicContent.missions || ["Latihan terstruktur", "Fasilitas internasional", "Kompetisi rutin"]).map((misi: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-bold text-xs md:text-sm italic group/item">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></div>{misi}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* FASILITAS - GRID LAYOUT LOCK */}
          {activeTab === 'fasilitas' && (
            <div className="h-full w-full animate-in fade-in duration-500 grid lg:grid-cols-2 gap-8 items-center">
               <div className="space-y-6 flex flex-col justify-center">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase mb-1">Fasilitas Unggulan</h3>
                  <p className="text-xs text-slate-400 font-bold italic tracking-widest">STANDARDISASI INTERNASIONAL (BWF)</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {['Lapangan Karpet BWF', 'LED Anti-Silau', 'Fitness Center', 'Asrama Atlet'].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><Shield size={18} /></div>
                      <span className="text-[10px] md:text-xs font-black text-slate-700 uppercase tracking-tighter">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 h-full max-h-[450px]">
                <img src={dynamicContent.fasilitas_img1 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-[2rem] shadow-lg border-2 border-white" alt="Arena" />
                <div className="grid grid-rows-2 gap-3">
                   <img src={dynamicContent.fasilitas_img2 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-[1.5rem] shadow-md border-2 border-white" alt="Gym" />
                   <img src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&q=80" className="w-full h-full object-cover rounded-[1.5rem] shadow-md border-2 border-white" alt="Equipment" />
                </div>
              </div>
            </div>
          )}

          {/* ORGANISASI - SPECIAL CASE: Membutuhkan Scroll Internal karena jumlah person banyak */}
          {activeTab === 'organisasi' && (
            <div className="h-full w-full overflow-y-auto pr-4 custom-scrollbar animate-in fade-in slide-in-from-bottom-10 duration-1000 relative">
              <div className="absolute top-24 bottom-24 w-0.5 bg-gradient-to-b from-amber-200 via-blue-100 to-transparent left-1/2 -translate-x-1/2 hidden lg:block opacity-30"></div>
              <div className="relative flex flex-col items-center gap-16 pb-12">
                
                {/* 1. PENANGGUNG JAWAB */}
                <div className="flex flex-col items-center">
                  {getByRole('penanggung jawab').map(person => (
                    <div key={person.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-amber-200 shadow-xl text-center w-64 group">
                      <div className="w-28 h-28 mx-auto mb-4 rounded-3xl overflow-hidden border-4 border-amber-50">
                        <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-black text-slate-900 text-base italic uppercase mb-1">{person.name}</h4>
                      <span className="px-4 py-1.5 bg-amber-500 text-white text-[9px] font-black uppercase rounded-lg italic">{person.role}</span>
                    </div>
                  ))}
                </div>

                {/* 2. PENASEHAT */}
                <div className="w-full">
                  <p className="text-center text-slate-400 font-black uppercase tracking-[0.4em] text-[9px] mb-6">Jajaran Penasehat</p>
                  <div className="flex flex-wrap justify-center gap-6">
                    {getByRole('penasehat').map(person => (
                      <div key={person.id} className="bg-white p-4 rounded-[2rem] border border-amber-100 shadow-lg text-center w-52">
                        <div className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-amber-50">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-slate-800 text-[11px] italic uppercase leading-tight">{person.name}</h4>
                        <span className="text-amber-600 font-black text-[8px] uppercase">{person.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. KETUA UMUM */}
                <div className="flex flex-col items-center">
                  <ChevronDown className="text-slate-300 mb-6 animate-bounce" />
                  {getByRole('ketua umum').map(person => (
                    <div key={person.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-blue-600 shadow-2xl text-center w-64">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-3xl overflow-hidden border-4 border-blue-50">
                        <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-black text-slate-900 text-base italic uppercase mb-1">{person.name}</h4>
                      <span className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded-lg shadow-lg shadow-blue-200 italic">{person.role}</span>
                    </div>
                  ))}
                </div>

                {/* 6. KEPALA PELATIH */}
                <div className="flex flex-col items-center">
                   <p className="text-center text-slate-400 font-black uppercase tracking-[0.4em] text-[9px] mb-6">Bidang Teknis</p>
                   {getByRole('kepala pelatih').map(person => (
                    <div key={person.id} className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl text-center w-64">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-3xl overflow-hidden border-4 border-blue-600">
                        <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-black text-white text-base italic uppercase mb-1">{person.name}</h4>
                      <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded-lg italic">
                         <GraduationCap size={14} /> {person.role}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 7. BIDANG/KOORDINATOR */}
                <div className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {orgData.filter(m => m.level === 3 && m.role.toLowerCase().includes('koordinator')).map(koor => {
                      const category = koor.role.split(' ').pop(); 
                      const members = orgData.filter(m => m.level === 3 && m.role.toLowerCase().includes(category?.toLowerCase()) && m.id !== koor.id);
                      return (
                        <div key={koor.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
                          <div className="bg-blue-600 p-5 text-center">
                            <div className="w-16 h-16 mx-auto mb-2 rounded-xl overflow-hidden border-2 border-white/20 shadow-md">
                              <img src={koor.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(koor.name)}`} className="w-full h-full object-cover" />
                            </div>
                            <h4 className="text-white font-black text-xs italic uppercase leading-none mb-1">{koor.name}</h4>
                            <p className="text-blue-100 font-black text-[8px] uppercase tracking-widest">{koor.role}</p>
                          </div>
                          <div className="p-5 space-y-3 flex-1 bg-slate-50/30">
                            {members.map(mem => (
                              <div key={mem.id} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-50">
                                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border">
                                  <img src={mem.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mem.name)}`} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <p className="font-black text-slate-800 text-[9px] uppercase italic leading-none">{mem.name}</p>
                                   <p className="text-blue-500 font-bold text-[7px] uppercase mt-0.5">{mem.role}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Khusus untuk scrollbar internal organisasi saja */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </section>
  );
}
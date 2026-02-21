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

  return (
    <section id="tentang-kami" className="relative w-full h-auto bg-white pt-16 pb-12 flex flex-col items-center overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 w-full flex flex-col">
        
        {/* Header Section */}
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
        <div className="bg-slate-50/50 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 border border-slate-100 shadow-sm min-h-[600px] transition-all duration-500 overflow-hidden">
          
          {/* 1. SEJARAH, 2. VISI MISI, 3. FASILITAS (Content as previously defined) */}
          {activeTab === 'sejarah' && (
             <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="grid lg:grid-cols-2 gap-12 items-center">
                 <div className="relative group hidden md:block">
                   <div className="absolute -inset-4 bg-blue-100/50 rounded-[3rem] blur-2xl"></div>
                   <img src={dynamicContent.sejarah_img || "photo_2026-02-03_00-32-07.jpg"} className="relative w-full h-[450px] object-cover rounded-[2.5rem] shadow-2xl border-4 border-white" alt="Sejarah" />
                 </div>
                 <div className="space-y-6">
                   <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase">Sejarah <span className="text-blue-600">PB US 162</span></h3>
                   <p className="text-slate-500 text-lg font-medium leading-relaxed">{dynamicContent.sejarah_desc || "Membangun masa depan bulutangkis Indonesia melalui pembinaan usia dini yang profesional dan modern."}</p>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'visi-misi' && (
            <div className="grid lg:grid-cols-2 gap-8 w-full animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <Target className="text-blue-600 mb-6" size={48} />
                <h4 className="text-xl font-black mb-4 uppercase italic text-blue-600">Visi</h4>
                <p className="text-slate-800 text-2xl font-bold leading-tight italic">"{dynamicContent.vision || "Menjadi rujukan nasional mencetak atlet berprestasi dunia."}"</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <Rocket className="text-slate-900 mb-6" size={48} />
                <h4 className="text-xl font-black mb-4 uppercase italic text-blue-600">Misi</h4>
                <ul className="space-y-4 font-bold text-slate-700 italic">
                  {(dynamicContent.missions || ["Disiplin Tinggi", "Fasilitas Modern", "Latihan Sport-Science"]).map((m, i) => (
                    <li key={i} className="flex items-center gap-3"><CheckCircle2 className="text-blue-500" size={20}/> {m}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'fasilitas' && (
            <div className="w-full animate-in zoom-in-95 duration-500 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h3 className="text-3xl font-black text-slate-900 uppercase">Fasilitas <span className="text-blue-600">Juara</span></h3>
                <div className="grid gap-4">
                  {['Standardisasi BWF', 'Fitness Center', 'Asrama Atlet', 'Klinik Fisio'].map((f, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm"><Shield className="text-blue-600" /> <span className="font-black text-slate-700 uppercase">{f}</span></div>
                  ))}
                </div>
              </div>
              <img src={dynamicContent.fasilitas_img1 || "dpnkwabotttfihp7gf3r.jpg"} className="rounded-[2.5rem] shadow-xl border-4 border-white h-[400px] object-cover" />
            </div>
          )}

          {/* 4. STRUKTUR ORGANISASI (NEW REFINED HIERARCHY) */}
          {activeTab === 'organisasi' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000 relative">
              <div className="absolute top-24 bottom-24 w-0.5 bg-gradient-to-b from-amber-200 via-blue-100 to-transparent left-1/2 -translate-x-1/2 hidden lg:block opacity-40"></div>

              <div className="relative flex flex-col items-center">
                
                {/* --- 1. PENANGGUNG JAWAB (PUNCAK) --- */}
                <div className="relative z-10 mb-16">
                  {orgData.filter(m => m.role.toLowerCase().includes('penanggung jawab')).map(person => (
                    <div key={person.id} className="flex flex-col items-center">
                      <div className="bg-white p-10 rounded-[3.5rem] border-4 border-amber-200 shadow-[0_25px_60px_rgba(245,158,11,0.2)] text-center w-80 group hover:scale-105 transition-all duration-500">
                        <div className="w-36 h-36 mx-auto mb-6 rounded-[2.5rem] overflow-hidden border-4 border-amber-50 shadow-inner bg-slate-100">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-slate-900 text-xl italic uppercase leading-tight mb-2">{person.name}</h4>
                        <span className="px-5 py-2 bg-amber-500 text-white text-[11px] font-black uppercase rounded-xl shadow-lg italic">Penanggung Jawab</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- 2. PENASEHAT --- */}
                <div className="relative z-10 mb-16 w-full max-w-4xl">
                  <div className="text-center mb-8"><span className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Dewan Penasehat</span></div>
                  <div className="flex flex-wrap justify-center gap-8">
                    {orgData.filter(m => m.role.toLowerCase().includes('penasehat')).map(person => (
                      <div key={person.id} className="bg-white p-6 rounded-[2.5rem] border border-amber-100 shadow-xl text-center w-64 group hover:-translate-y-2 transition-all">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-3xl overflow-hidden border-2 border-amber-50">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-slate-800 text-[13px] italic uppercase leading-tight mb-1">{person.name}</h4>
                        <span className="text-amber-600 text-[9px] font-black uppercase italic tracking-widest">Penasehat</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- 3. PEMBINA --- */}
                <div className="relative z-10 mb-16 w-full max-w-4xl">
                  <div className="text-center mb-8"><span className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Dewan Pembina</span></div>
                  <div className="flex flex-wrap justify-center gap-8">
                    {orgData.filter(m => m.role.toLowerCase().includes('pembina')).map(person => (
                      <div key={person.id} className="bg-white p-6 rounded-[2.5rem] border border-blue-50 shadow-xl text-center w-64 group hover:-translate-y-2 transition-all">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-3xl overflow-hidden border-2 border-blue-50">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-slate-800 text-[13px] italic uppercase leading-tight mb-1">{person.name}</h4>
                        <span className="text-blue-600 text-[9px] font-black uppercase italic tracking-widest">Pembina</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- 4. KETUA UMUM (STAND ALONE) --- */}
                <div className="relative z-10 mb-20">
                  {orgData.filter(m => m.role.toLowerCase() === 'ketua umum').map(person => (
                    <div key={person.id} className="flex flex-col items-center">
                      <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-center w-72 group hover:scale-105 transition-all">
                        <div className="w-28 h-28 mx-auto mb-5 rounded-3xl overflow-hidden border-4 border-slate-700 shadow-xl">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-white text-[15px] italic uppercase leading-none mb-3">{person.name}</h4>
                        <span className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg italic tracking-widest shadow-lg">Ketua Umum</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- 5. PENGURUS INTI (GRID) --- */}
                <div className="relative z-10 mb-20 w-full max-w-5xl">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {orgData.filter(m => m.level === 2 && !m.role.toLowerCase().includes('ketua umum')).map(person => (
                      <div key={person.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-lg text-center hover:shadow-blue-200 transition-all">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-slate-900 text-[12px] italic uppercase leading-tight mb-2 tracking-tight">{person.name}</h4>
                        <span className="px-3 py-1 bg-slate-100 text-blue-600 text-[9px] font-black uppercase rounded-md tracking-widest">{person.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- 6. KEPALA PELATIH --- */}
                <div className="relative z-10 mb-20">
                  {orgData.filter(m => m.role.toLowerCase().includes('kepala pelatih')).map(person => (
                    <div key={person.id} className="flex flex-col items-center">
                      <div className="bg-blue-600 p-6 rounded-[2.5rem] shadow-xl text-center w-64 group hover:rotate-2 transition-all">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-3xl overflow-hidden border-4 border-blue-400">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-white text-[14px] italic uppercase mb-2">{person.name}</h4>
                        <span className="flex items-center justify-center gap-2 text-blue-100 text-[9px] font-black uppercase italic tracking-widest"><GraduationCap size={14}/> Kepala Pelatih</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- 7. KOORDINATOR & ANGGOTA (BIDANG-BIDANG) --- */}
                <div className="relative z-10 w-full">
                  <div className="flex items-center gap-4 mb-12">
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                    <span className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Bidang & Operasional</span>
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                  </div>
                  
                  {/* Grid Anggota Bidang */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {orgData.filter(m => m.level === 3).map(person => (
                      <div key={person.id} className="bg-white/70 backdrop-blur-sm p-4 rounded-[2rem] border border-slate-100 hover:border-blue-400 hover:shadow-xl transition-all flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 mb-3 group-hover:scale-105 transition-all">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-bold text-slate-800 text-[10px] uppercase italic leading-none mb-1">{person.name}</h4>
                        <p className="text-blue-500 font-black text-[8px] uppercase tracking-tighter">{person.role}</p>
                      </div>
                    ))}
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
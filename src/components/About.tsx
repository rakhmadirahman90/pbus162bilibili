import React, { useState, useEffect } from 'react'; 
import { 
  Target, Rocket, Shield, Award, 
  CheckCircle2, Users2, ArrowRight, User, ShieldCheck, 
  ChevronDown, Star, Trophy
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
    } catch (err) { console.error(err); }
  };

  const fetchOrganizationalStructure = async () => {
    try {
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('*')
        .order('level', { ascending: true });
      if (!error && data) setOrgData(data);
    } catch (err) { console.error(err); }
  };

  const handleTabChange = (id: string) => {
    if (onTabChange) onTabChange(id);
    else setInternalTab(id);
  };

  const tabs = [
    { id: 'sejarah', label: 'Sejarah' },
    { id: 'visi-misi', label: 'Visi & Misi' },
    { id: 'fasilitas', label: 'Fasilitas' }
  ];

  // Helper Card Component untuk konsistensi
  const MemberCard = ({ person, size = "md", theme = "blue" }: { person: any, size?: "sm" | "md" | "lg", theme?: "gold" | "blue" | "slate" }) => (
    <div className={`bg-white rounded-[2.5rem] border shadow-xl transition-all duration-500 hover:-translate-y-2 text-center flex flex-col items-center group
      ${size === 'lg' ? 'p-10 w-80 border-amber-200' : size === 'md' ? 'p-6 w-64 border-slate-100' : 'p-4 w-48 border-slate-50'}`}>
      <div className={`overflow-hidden rounded-[2rem] mb-4 border-4 shadow-inner transition-transform duration-500 group-hover:scale-105
        ${size === 'lg' ? 'w-32 h-32 border-amber-50' : size === 'md' ? 'w-24 h-24 border-blue-50' : 'w-16 h-16 border-slate-50'}`}>
        {person.photo_url ? (
          <img src={person.photo_url} className="w-full h-full object-cover" alt={person.name} />
        ) : (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300"><User size={size === 'lg' ? 40 : 24} /></div>
        )}
      </div>
      <h4 className={`font-black text-slate-900 uppercase italic leading-tight mb-2 ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>{person.name}</h4>
      <span className={`px-4 py-1.5 rounded-xl font-black uppercase tracking-wider text-[9px] italic shadow-sm
        ${theme === 'gold' ? 'bg-amber-500 text-white' : theme === 'blue' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'}`}>
        {person.role}
      </span>
    </div>
  );

  return (
    <section id="tentang-kami" className="relative w-full h-auto bg-white pt-16 pb-12 flex flex-col items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 w-full flex flex-col">
        
        {/* Header & Tabs (Tetap sama untuk konsistensi) */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 uppercase italic">Tentang <span className="text-blue-600">Kami</span></h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full mb-10"></div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border-2 ${activeTab === tab.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}>{tab.label}</button>
            ))}
            <button onClick={() => handleTabChange('organisasi')} className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border-2 flex items-center gap-2 group ${activeTab === 'organisasi' ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-slate-900 text-white border-slate-900'}`}>Struktur Organisasi <ArrowRight size={14} /></button>
          </div>
        </div>

        {/* Tab Content Box */}
        <div className="bg-slate-50/50 rounded-[3rem] md:rounded-[4rem] p-6 md:p-16 border border-slate-100 shadow-sm min-h-[600px]">
          
          {/* SEJARAH, VISI MISI, FASILITAS (Logic dipersingkat namun data tetap aman) */}
          {activeTab === 'sejarah' && (/* ... Kode Sejarah sama seperti sebelumnya ... */ <div className="animate-in fade-in duration-700"><h3 className="text-3xl font-black uppercase mb-6">Membina <span className="text-blue-600">Legenda</span></h3><p className="text-slate-500 leading-relaxed text-lg">{dynamicContent.sejarah_desc || "PB US 162 adalah wadah pembinaan atlet profesional..."}</p></div>)}
          {activeTab === 'visi-misi' && (/* ... Kode Visi Misi sama ... */ <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-right duration-700"><div className="bg-white p-10 rounded-3xl shadow-sm border border-blue-50"><Target className="text-blue-600 mb-4" size={40} /><h4 className="font-black uppercase mb-2">Visi</h4><p className="italic text-xl">"{dynamicContent.vision}"</p></div><div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100"><Rocket className="text-slate-900 mb-4" size={40} /><h4 className="font-black uppercase mb-2">Misi</h4><ul className="space-y-2">{dynamicContent.missions?.map((m:any, i:number)=>(<li key={i} className="flex gap-2 text-sm font-bold">✓ {m}</li>))}</ul></div></div>)}
          {activeTab === 'fasilitas' && (<div className="animate-in zoom-in duration-500"><h3 className="text-3xl font-black uppercase mb-8 text-center">Fasilitas Standar BWF</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><img src={dynamicContent.fasilitas_img1} className="rounded-3xl h-48 w-full object-cover" /><img src={dynamicContent.fasilitas_img2} className="rounded-3xl h-48 w-full object-cover" /><img src={dynamicContent.fasilitas_img3} className="rounded-3xl h-48 w-full object-cover" /><div className="bg-blue-600 rounded-3xl flex items-center justify-center text-white font-black p-4 text-center text-xs uppercase">Premium Court Lighting</div></div></div>)}

          {/* STRUKTUR ORGANISASI (NEW HIERARCHY LOGIC) */}
          {activeTab === 'organisasi' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="relative flex flex-col items-center">
                
                {/* Garis Vertikal Latar Belakang */}
                <div className="absolute top-20 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 via-blue-200 to-transparent left-1/2 -translate-x-1/2 hidden lg:block opacity-30"></div>

                {/* --- 1. TOP: PENANGGUNG JAWAB --- */}
                <div className="relative z-10 mb-16">
                  {orgData.filter(m => m.role.toLowerCase().includes('penanggung jawab')).map(p => (
                    <MemberCard key={p.id} person={p} size="lg" theme="gold" />
                  ))}
                </div>

                {/* --- 2. PENASEHAT --- */}
                <div className="relative z-10 mb-16 flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-600 mb-6 bg-amber-50 px-4 py-1 rounded-full">Dewan Penasehat</span>
                  <div className="flex flex-wrap justify-center gap-6">
                    {orgData.filter(m => m.role.toLowerCase().includes('penasehat')).map(p => (
                      <MemberCard key={p.id} person={p} size="md" theme="gold" />
                    ))}
                  </div>
                </div>

                {/* --- 3. PEMBINA --- */}
                <div className="relative z-10 mb-16 flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-6">Dewan Pembina</span>
                  <div className="flex flex-wrap justify-center gap-6">
                    {orgData.filter(m => m.role.toLowerCase().includes('pembina')).map(p => (
                      <MemberCard key={p.id} person={p} size="md" theme="slate" />
                    ))}
                  </div>
                </div>

                <div className="mb-10"><ChevronDown className="text-blue-400 animate-bounce" /></div>

                {/* --- 4. KETUA UMUM --- */}
                <div className="relative z-10 mb-16">
                  {orgData.filter(m => m.role.toLowerCase() === 'ketua umum').map(p => (
                    <MemberCard key={p.id} person={p} size="lg" theme="blue" />
                  ))}
                </div>

                {/* --- 5. PENGURUS INTI (Sekretaris, Bendahara) --- */}
                <div className="relative z-10 mb-20 flex flex-col items-center w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                    {orgData.filter(m => m.level === 2 && !m.role.toLowerCase().includes('ketua umum')).map(p => (
                      <MemberCard key={p.id} person={p} size="md" theme="blue" />
                    ))}
                  </div>
                </div>

                {/* --- 6. KEPALA PELATIH (Bridge to Athletes) --- */}
                <div className="relative z-10 mb-20">
                  <div className="flex flex-col items-center">
                    <Trophy className="text-blue-600 mb-4" size={32} />
                    {orgData.filter(m => m.role.toLowerCase().includes('pelatih')).map(p => (
                      <MemberCard key={p.id} person={p} size="md" theme="blue" />
                    ))}
                  </div>
                </div>

                {/* --- 7. KOORDINATOR & ANGGOTA (GRID SYSTEM) --- */}
                <div className="relative z-10 w-full">
                   <div className="flex items-center gap-4 mb-10">
                      <div className="h-[1px] flex-1 bg-slate-200"></div>
                      <span className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Koordinator Bidang & Anggota</span>
                      <div className="h-[1px] flex-1 bg-slate-200"></div>
                   </div>
                   
                   {/* Grid yang lebih padat untuk level operasional */}
                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {orgData.filter(m => m.level === 3).map(p => (
                      <div key={p.id} className="flex flex-col items-center text-center group">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 mb-3 group-hover:border-blue-400 transition-all">
                          {p.photo_url ? (
                            <img src={p.photo_url} className="w-full h-full object-cover" alt={p.name} />
                          ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200"><User size={24} /></div>
                          )}
                        </div>
                        <h5 className="font-black text-slate-800 text-[10px] uppercase leading-tight">{p.name}</h5>
                        <p className="text-blue-600 font-bold text-[8px] uppercase mt-1 italic">{p.role}</p>
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
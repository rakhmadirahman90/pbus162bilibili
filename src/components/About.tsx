import React, { useState, useEffect } from 'react'; 
import { 
  Target, Rocket, Shield, Award, 
  CheckCircle2, Users2, ArrowRight, User, ShieldCheck, 
  ChevronDown, Star
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
    if (onTabChange) onTabChange(id);
    else setInternalTab(id);
  };

  const tabs = [
    { id: 'sejarah', label: 'Sejarah' },
    { id: 'visi-misi', label: 'Visi & Misi' },
    { id: 'fasilitas', label: 'Fasilitas' }
  ];

  // Helper untuk memisahkan data berdasarkan peran spesifik
  const penanggungJawab = orgData.filter(m => m.role.toLowerCase().includes('penanggung jawab'));
  const penasehat = orgData.filter(m => m.role.toLowerCase().includes('penasehat'));
  const pembina = orgData.filter(m => m.role.toLowerCase().includes('pembina'));
  const ketuaUmum = orgData.filter(m => m.role.toLowerCase() === 'ketua umum' || m.role.toLowerCase() === 'ketua');
  const pengurusInti = orgData.filter(m => m.level === 2 && !ketuaUmum.find(k => k.id === m.id));
  const seksiBidang = orgData.filter(m => m.level === 3);

  return (
    <section id="tentang-kami" className="relative w-full h-auto bg-white pt-16 pb-12 flex flex-col items-center overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 w-full flex flex-col">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full mb-4">
            <Users2 size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Profil Organisasi</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase italic leading-none">
            Tentang <span className="text-blue-600">Kami</span>
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full shadow-sm"></div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={`px-6 md:px-10 py-3 rounded-2xl font-bold text-[11px] md:text-xs uppercase tracking-widest transition-all duration-300 border-2 ${
                activeTab === tab.id ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-white text-slate-400 border-slate-100'
              }`}>{tab.label}</button>
          ))}
          <button onClick={() => handleTabChange('organisasi')}
            className={`px-6 md:px-10 py-3 rounded-2xl font-bold text-[11px] md:text-xs uppercase tracking-widest transition-all duration-300 border-2 flex items-center gap-2 group shadow-xl ${
              activeTab === 'organisasi' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-900 text-white border-slate-900'
            }`}>Struktur Organisasi <ArrowRight size={14} /></button>
        </div>

        {/* Tab Content Box */}
        <div className="bg-slate-50/50 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 border border-slate-100 shadow-sm min-h-[600px] transition-all duration-500 overflow-hidden">
          
          {/* 1. SEJARAH */}
          {activeTab === 'sejarah' && (
             <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="grid lg:grid-cols-2 gap-12 items-center">
                 <div className="relative group hidden md:block">
                   <div className="absolute -inset-4 bg-blue-100/50 rounded-[3rem] blur-2xl"></div>
                   <img src={dynamicContent.sejarah_img || "photo_2026-02-03_00-32-07.jpg"} className="relative w-full h-[450px] object-cover rounded-[2.5rem] shadow-2xl border-4 border-white" alt="Sejarah" />
                 </div>
                 <div className="space-y-6">
                   <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic leading-none">{dynamicContent.sejarah_title || "Membina Legend"}</h3>
                   <p className="text-slate-500 text-base md:text-lg leading-relaxed">{dynamicContent.sejarah_desc || "Sejarah panjang PB US 162 dalam dunia bulutangkis..."}</p>
                 </div>
               </div>
             </div>
          )}

          {/* 2. VISI MISI */}
          {activeTab === 'visi-misi' && (
            <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100">
                <Target className="text-blue-600 mb-6" size={40} />
                <h4 className="text-blue-600 font-black uppercase text-xs mb-4">Visi Kami</h4>
                <p className="text-2xl font-bold italic">"{dynamicContent.vision || "Mencetak Atlet Juara."}"</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100">
                <Rocket className="text-slate-900 mb-6" size={40} />
                <h4 className="text-blue-600 font-black uppercase text-xs mb-4">Misi Kami</h4>
                <ul className="space-y-3 font-bold italic">
                  {(dynamicContent.missions || ["Latihan Disiplin"]).map((m, i) => <li key={i}>• {m}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* 3. FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div className="grid lg:grid-cols-2 gap-12 animate-in zoom-in-95 duration-500">
               <div className="space-y-6">
                 <h3 className="text-3xl font-black text-slate-900 uppercase">Fasilitas Standar BWF</h3>
                 <div className="grid gap-4">
                   {['Karpet Profesional', 'LED Anti-Silau', 'Ruang Fitness'].map((f, i) => (
                     <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"><ShieldCheck className="text-blue-600"/> <span className="font-bold uppercase text-sm">{f}</span></div>
                   ))}
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4 h-[400px]">
                  <img src={dynamicContent.fasilitas_img1 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-[2rem] shadow-lg border-2 border-white" alt="Arena" />
                  <img src={dynamicContent.fasilitas_img2 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-[2rem] shadow-lg border-2 border-white" alt="Gym" />
               </div>
            </div>
          )}

          {/* 4. STRUKTUR ORGANISASI (HIERARKI SPESIFIK) */}
          {activeTab === 'organisasi' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000 relative">
              {/* Central Line Connector */}
              <div className="absolute top-20 bottom-20 w-0.5 bg-gradient-to-b from-amber-300 via-blue-200 to-transparent left-1/2 -translate-x-1/2 hidden lg:block opacity-30"></div>

              <div className="relative flex flex-col items-center gap-20">
                
                {/* 1. PENANGGUNG JAWAB (Puncak Teratas) */}
                <div className="relative z-10 flex flex-col items-center">
                  {penanggungJawab.map(person => (
                    <div key={person.id} className="bg-white p-8 rounded-[3.5rem] border-4 border-amber-400 shadow-[0_30px_60px_rgba(245,158,11,0.2)] text-center w-80 group hover:scale-105 transition-all duration-500">
                      <div className="w-40 h-40 mx-auto mb-6 rounded-[2.5rem] overflow-hidden border-4 border-amber-50 shadow-inner">
                        <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-black text-slate-900 text-xl italic uppercase mb-2">{person.name}</h4>
                      <div className="bg-amber-500 text-white text-[11px] font-black uppercase py-2 px-6 rounded-xl italic tracking-widest">PENANGGUNG JAWAB</div>
                    </div>
                  ))}
                </div>

                {/* 2. PENASEHAT (Baris Kedua) */}
                <div className="relative z-10 w-full">
                  <h5 className="text-center text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mb-8 italic">Jajaran Penasehat</h5>
                  <div className="flex flex-wrap justify-center gap-8">
                    {penasehat.map(person => (
                      <div key={person.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-amber-100 shadow-xl text-center w-64 group hover:border-amber-400 transition-all">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-3xl overflow-hidden border-2 border-amber-50">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-slate-800 text-sm italic uppercase mb-1">{person.name}</h4>
                        <span className="text-amber-600 font-black text-[9px] uppercase tracking-widest">{person.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. PEMBINA (Baris Ketiga) */}
                <div className="relative z-10 w-full">
                   <h5 className="text-center text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mb-8 italic">Jajaran Pembina</h5>
                   <div className="flex flex-wrap justify-center gap-8">
                    {pembina.map(person => (
                      <div key={person.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-blue-100 shadow-xl text-center w-64 group hover:border-blue-400 transition-all">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-3xl overflow-hidden border-2 border-blue-50">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-slate-800 text-sm italic uppercase mb-1">{person.name}</h4>
                        <span className="text-blue-600 font-black text-[9px] uppercase tracking-widest">{person.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. KETUA UMUM (Mandiri Tengah) */}
                <div className="relative z-10">
                  {ketuaUmum.map(person => (
                    <div key={person.id} className="bg-slate-900 p-8 rounded-[3rem] shadow-[0_20px_40px_rgba(15,23,42,0.3)] text-center w-72 group hover:-translate-y-2 transition-all">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-[1.8rem] overflow-hidden border-4 border-white/10 group-hover:border-blue-500 transition-all">
                        <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-black text-white text-lg italic uppercase mb-1">{person.name}</h4>
                      <div className="bg-blue-600 text-white text-[10px] font-black uppercase py-1.5 px-4 rounded-lg italic tracking-widest">KETUA UMUM</div>
                    </div>
                  ))}
                </div>

                {/* 5. PENGURUS INTI (Sekretaris, Bendahara, dsb) */}
                <div className="relative z-10 w-full max-w-5xl">
                   <h5 className="text-center text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mb-8 italic">Pengurus Inti</h5>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {pengurusInti.map(person => (
                      <div key={person.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-lg text-center group hover:shadow-blue-100 transition-all">
                        <div className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden border border-slate-50">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-slate-900 text-[11px] italic uppercase leading-none mb-2">{person.name}</h4>
                        <span className="px-2 py-1 bg-slate-100 text-blue-600 text-[8px] font-black uppercase rounded-md tracking-tighter">{person.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. BAGIAN & SEKSI (Beserta Daftar Anggota) */}
                <div className="relative z-10 w-full">
                  <div className="flex items-center gap-4 mb-12">
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                    <span className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] italic">Koordinator & Anggota Bidang</span>
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Render per seksi/bidang jika data category tersedia, jika tidak render grid standar */}
                    {seksiBidang.map(person => (
                      <div key={person.id} className="bg-white/60 backdrop-blur-sm p-5 rounded-[2.5rem] border border-slate-100 flex items-center gap-4 hover:bg-white hover:shadow-xl transition-all">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-blue-50 group-hover:border-blue-500 transition-all">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-xs uppercase italic leading-tight">{person.name}</h4>
                          <p className="text-blue-600 font-bold text-[9px] uppercase tracking-wider mt-1">{person.role}</p>
                        </div>
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
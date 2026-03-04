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

  // Fungsi helper untuk filter role
  const getByRole = (roleName: string) => 
    orgData.filter(m => m.role.toLowerCase().includes(roleName.toLowerCase()));

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
          <div className="w-10 h-0.5 bg-blue-600 mx-auto mt-1 rounded-full opacity-50"></div>
        </div>

        {/* 2. Tab Switcher */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-3 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 md:px-5 py-1.5 rounded-lg font-bold text-[8px] md:text-xs uppercase transition-all duration-300 border-2 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => handleTabChange('organisasi')}
            className={`px-3 md:px-5 py-1.5 rounded-lg font-bold text-[8px] md:text-xs uppercase border-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'organisasi' 
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
              : 'bg-slate-900 text-white border-slate-900'
            }`}
          >
            Struktur <ArrowRight size={10} />
          </button>
        </div>

        {/* 3. Kotak Konten Utama */}
        {/* PERBAIKAN: Jika tab organisasi, biarkan overflow-y-auto aktif untuk scroll panjang */}
        <div className={`flex-1 min-h-0 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 border border-slate-100 shadow-sm relative ${activeTab === 'organisasi' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          
          {/* TAB SEJARAH */}
          {activeTab === 'sejarah' && (
            <div className="h-full w-full flex flex-col lg:flex-row items-center justify-center gap-4 animate-in fade-in duration-700">
              <div className="w-full lg:w-1/2 flex items-center justify-center shrink-0">
                <img 
                  src={dynamicContent.sejarah_img || "photo_2026-02-03_00-32-07.jpg"} 
                  className="max-h-[35vh] lg:max-h-[50vh] w-auto object-contain drop-shadow-2xl rounded-2xl" 
                  alt="Sejarah" 
                />
              </div>
              <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-2">
                <span className="text-blue-600 font-black text-[8px] uppercase tracking-widest">Legacy & Spirit</span>
                <h3 className="text-xl md:text-3xl font-black text-slate-900 uppercase leading-none italic">
                  {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">LEGENDA</span>
                </h3>
                <p className="text-slate-500 text-[10px] md:text-sm font-medium leading-relaxed">
                  {dynamicContent.sejarah_desc || "PB US 162 hadir sebagai pusat keunggulan bulutangkis yang mengintegrasikan sport-science dengan disiplin tinggi."}
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {["Sport-science", "BWF Standard", "Pro Career", "Digital System"].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <CheckCircle2 size={10} className="text-blue-600 shrink-0" />
                      <span className="text-[7px] font-black uppercase text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB VISI MISI */}
          {activeTab === 'visi-misi' && (
            <div className="h-full w-full grid lg:grid-cols-2 gap-3 items-stretch animate-in fade-in duration-500">
              <div className="bg-white p-4 md:p-6 rounded-[1.5rem] border border-slate-100 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-5 text-blue-600"><Target size={100} /></div>
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-2"><Target size={16} /></div>
                <h4 className="text-blue-600 font-black text-[8px] uppercase mb-1">Visi</h4>
                <p className="text-slate-800 text-sm md:text-lg font-bold italic leading-tight">"{dynamicContent.vision || "Menjadi klub rujukan nasional yang mencetak atlet berprestasi dunia."}"</p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-[1.5rem] border border-slate-100 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-5 text-slate-900"><Rocket size={100} /></div>
                <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-2"><Rocket size={16} /></div>
                <h4 className="text-blue-600 font-black text-[8px] uppercase mb-1">Misi</h4>
                <ul className="space-y-1">
                  {(dynamicContent.missions || ["Latihan terstruktur", "Fasilitas internasional", "Kompetisi rutin"]).map((m, i) => (
                    <li key={i} className="flex items-center gap-2 text-[9px] md:text-xs font-bold text-slate-700 italic">
                      <div className="w-1 h-1 bg-blue-500 rounded-full shrink-0" /> {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div className="h-full w-full flex flex-col lg:flex-row gap-4 animate-in fade-in duration-500 items-center justify-center">
              <div className="w-full lg:w-1/3 flex flex-col justify-center space-y-2 lg:order-1 order-2">
                <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase">Fasilitas <span className="text-blue-600">Pro</span></h3>
                <div className="space-y-1.5">
                  {['Karpet BWF', 'LED Anti-Silau', 'Gym Center'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <Shield size={12} className="text-blue-600 shrink-0" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-2/3 grid grid-cols-2 grid-rows-2 gap-2 max-h-[35vh] lg:max-h-[50vh] min-h-0 shrink-0 lg:order-2 order-1">
                <img src={dynamicContent.fasilitas_img1 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-contain col-span-1 row-span-2 rounded-xl border-2 border-white shadow-md bg-white p-1" alt="F1" />
                <img src={dynamicContent.fasilitas_img2 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-xl border-2 border-white shadow-sm" alt="F2" />
                <img src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400" className="w-full h-full object-cover rounded-xl border-2 border-white shadow-sm" alt="F3" />
              </div>
            </div>
          )}

          {/* TAB ORGANISASI - Scrollable & Menyesuaikan Preview Admin */}
          {activeTab === 'organisasi' && (
            <div className="w-full flex flex-col items-center gap-8 py-4 animate-in slide-in-from-bottom-5 duration-500 pb-20">
              
              {/* Tingkat 1: Penanggung Jawab */}
              <div className="flex justify-center w-full">
                {getByRole('penanggung jawab').map(p => (
                  <div key={p.id} className="group relative bg-white p-4 rounded-[2rem] border-2 border-amber-100 shadow-xl text-center w-52 transform transition-all hover:scale-105">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <div className="absolute inset-0 bg-amber-500 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform opacity-20"></div>
                      <img 
                        src={p.photo_url || `https://ui-avatars.com/api/?name=${p.name}&background=f59e0b&color=fff`} 
                        className="relative w-full h-full rounded-2xl object-cover border-2 border-white shadow-md" 
                        alt={p.name}
                      />
                    </div>
                    <p className="font-black text-xs uppercase italic text-slate-900 leading-tight mb-1">{p.name}</p>
                    <span className="text-[8px] bg-amber-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                      {p.role}
                    </span>
                  </div>
                ))}
              </div>

              {/* Garis Penghubung Sederhana */}
              <div className="w-px h-8 bg-slate-200"></div>

              {/* Tingkat 2: Pengurus Inti & Anggota (Grid Responsive) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full px-2">
                {orgData.filter(m => m.level >= 2).map(p => (
                  <div key={p.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                    <div className="w-16 h-16 mb-2">
                      <img 
                        src={p.photo_url || `https://ui-avatars.com/api/?name=${p.name}&background=3b82f6&color=fff`} 
                        className="w-full h-full rounded-xl object-cover border border-slate-50 shadow-sm" 
                        alt={p.name}
                      />
                    </div>
                    <p className="font-bold text-[9px] uppercase text-slate-800 leading-tight h-7 flex items-center justify-center">
                      {p.name}
                    </p>
                    <p className="text-blue-600 font-black text-[7px] uppercase mt-1 tracking-tighter">
                      {p.role}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
        
        /* Smooth scrolling untuk tab organisasi */
        .overflow-y-auto {
          scroll-behavior: smooth;
        }
      `}</style>
    </section>
  );
}
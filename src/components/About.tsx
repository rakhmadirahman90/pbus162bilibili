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
    // CONTAINER UTAMA: Paksa 100vh dan sembunyikan scroll body utama
    <section id="tentang-kami" className="relative w-full h-screen bg-white flex flex-col items-center overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col py-4 md:py-8">
        
        {/* 1. Header Section - Fixed Size (Shrink-0) */}
        <div className="text-center mb-4 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-1">
            <Users2 size={12} className="animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Profil Organisasi</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-1 tracking-tight uppercase leading-none italic">
            Tentang <span className="text-blue-600">Kami</span>
          </h2>
          <div className="w-12 h-1 bg-blue-600 mx-auto rounded-full shadow-sm"></div>
        </div>

        {/* 2. Tab Switcher - Fixed Size (Shrink-0) */}
        <div className="flex flex-wrap justify-center gap-2 mb-4 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 md:px-6 py-2 rounded-xl font-bold text-[9px] md:text-xs uppercase tracking-widest transition-all duration-300 border-2 ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => handleTabChange('organisasi')}
            className={`px-4 md:px-6 py-2 rounded-xl font-bold text-[9px] md:text-xs uppercase tracking-widest transition-all duration-300 border-2 flex items-center gap-2 ${
              activeTab === 'organisasi' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-900 text-white border-slate-900'
            }`}
          >
            Struktur <ArrowRight size={12} />
          </button>
        </div>

        {/* 3. Kotak Konten Utama - Menggunakan flex-1 dan min-h-0 untuk resize otomatis */}
        <div className="flex-1 min-h-0 bg-slate-50/50 rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          
          {/* SEJARAH - Auto Adjustment */}
          {activeTab === 'sejarah' && (
            <div className="h-full w-full flex flex-col lg:flex-row items-center gap-6 animate-in fade-in duration-700">
              <div className="w-full lg:w-1/2 h-1/3 lg:h-full flex items-center justify-center">
                <img 
                  src={dynamicContent.sejarah_img || "photo_2026-02-03_00-32-07.jpg"} 
                  className="max-w-full max-h-full object-contain rounded-[1.5rem] shadow-lg border-2 border-white" 
                  alt="Sejarah" 
                />
              </div>
              <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-3 overflow-y-auto max-h-full">
                <span className="text-blue-600 font-black text-[9px] uppercase tracking-widest">Legacy & Spirit</span>
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 uppercase leading-[0.9] italic">
                  {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">LEGENDA</span>
                </h3>
                <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">
                  {dynamicContent.sejarah_desc || "PB US 162 hadir sebagai pusat keunggulan bulutangkis yang mengintegrasikan sport-science dengan disiplin tinggi."}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["Sport-science", "BWF Standard", "Pro Career", "Digital System"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <CheckCircle2 size={12} className="text-blue-600" />
                      <span className="text-[8px] font-black uppercase text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VISI MISI - Responsive Grid */}
          {activeTab === 'visi-misi' && (
            <div className="h-full w-full grid lg:grid-cols-2 gap-4 items-stretch animate-in fade-in duration-500">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-center relative overflow-hidden shadow-sm">
                <div className="absolute -top-6 -right-6 opacity-5 text-blue-600"><Target size={140} /></div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-3"><Target size={20} /></div>
                <h4 className="text-blue-600 font-black text-[9px] uppercase mb-1">Visi</h4>
                <p className="text-slate-800 text-lg md:text-xl font-bold italic leading-tight">"{dynamicContent.vision || "Menjadi klub rujukan nasional yang mencetak atlet berprestasi dunia."}"</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-center relative overflow-hidden shadow-sm">
                <div className="absolute -top-6 -right-6 opacity-5 text-slate-900"><Rocket size={140} /></div>
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-3"><Rocket size={20} /></div>
                <h4 className="text-blue-600 font-black text-[9px] uppercase mb-1">Misi</h4>
                <ul className="space-y-2">
                  {(dynamicContent.missions || ["Latihan terstruktur", "Fasilitas internasional", "Kompetisi rutin"]).map((m, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-700 italic">
                      <div className="w-1 h-1 bg-blue-500 rounded-full" /> {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* FASILITAS - Layout Locking */}
          {activeTab === 'fasilitas' && (
            <div className="h-full w-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
              <div className="w-full lg:w-1/3 flex flex-col justify-center space-y-3">
                <h3 className="text-2xl font-black text-slate-900 uppercase">Fasilitas <span className="text-blue-600">Pro</span></h3>
                <div className="space-y-2">
                  {['Karpet BWF', 'LED Anti-Silau', 'Gym Center'].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <Shield size={14} className="text-blue-600" />
                      <span className="text-[9px] font-black uppercase text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-2/3 grid grid-cols-2 grid-rows-2 gap-2 h-full min-h-0">
                <img src={dynamicContent.fasilitas_img1 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-[1.5rem] col-span-1 row-span-2 border-2 border-white shadow-md" alt="F1" />
                <img src={dynamicContent.fasilitas_img2 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-[1.5rem] border-2 border-white shadow-md" alt="F2" />
                <img src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400" className="w-full h-full object-cover rounded-[1.5rem] border-2 border-white shadow-md" alt="F3" />
              </div>
            </div>
          )}

          {/* ORGANISASI - Scrollable Internal */}
          {activeTab === 'organisasi' && (
            <div className="h-full w-full overflow-y-auto pr-2 custom-scrollbar animate-in slide-in-from-bottom-5">
              <div className="flex flex-col items-center gap-8 py-4">
                {getByRole('penanggung jawab').map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-[2rem] border-2 border-amber-100 shadow-lg text-center w-48">
                    <img src={p.photo_url || `https://ui-avatars.com/api/?name=${p.name}`} className="w-20 h-20 mx-auto rounded-2xl object-cover mb-2 border-2 border-amber-50" />
                    <p className="font-black text-[10px] uppercase italic text-slate-900 leading-tight">{p.name}</p>
                    <p className="text-[7px] bg-amber-500 text-white inline-block px-2 py-1 rounded-md font-black uppercase mt-1">{p.role}</p>
                  </div>
                ))}
                <div className="flex flex-wrap justify-center gap-4">
                  {orgData.filter(m => m.level >= 2).map(p => (
                    <div key={p.id} className="bg-white p-3 rounded-[1.5rem] border border-slate-100 shadow-sm text-center w-36">
                      <img src={p.photo_url || `https://ui-avatars.com/api/?name=${p.name}`} className="w-14 h-14 mx-auto rounded-xl object-cover mb-2" />
                      <p className="font-black text-[8px] uppercase italic text-slate-800 leading-tight">{p.name}</p>
                      <p className="text-blue-600 font-black text-[7px] uppercase mt-1">{p.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @media (max-height: 600px) {
          h2 { font-size: 1.25rem !important; }
          .max-w-7xl { py: 2px !important; }
        }
      `}</style>
    </section>
  );
}
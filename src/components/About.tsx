import React, { useState, useEffect } from 'react'; 
import { 
  Target, Rocket, Shield, Award, 
  CheckCircle2, Users2, ArrowRight, User, ShieldCheck, 
  ChevronDown, Star, GraduationCap, Briefcase, History, Eye, Map
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
  const [loading, setLoading] = useState(true);
  
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
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setOrgData(data);
      }
    } catch (err) {
      console.error("Error fetching org structure:", err);
    } finally {
      setLoading(false);
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
      case 5: return 'bg-rose-500';
      case 6: return 'bg-orange-600';
      default: return 'bg-slate-500';
    }
  };

  const renderAllDepartments = () => {
    const level7Members = orgData.filter(m => m.level === 7);
    const groupedFields: { [key: string]: any[] } = {};
    
    level7Members.forEach(m => {
      const role = m.role.toLowerCase();
      let fieldName = "Bidang Umum";
      
      if (role.includes("humas")) fieldName = "Bidang Humas";
      else if (role.includes("pertandingan") || role.includes("wasit")) fieldName = "Bidang Pertandingan";
      else if (role.includes("sarana") || role.includes("prasarana")) fieldName = "Bidang Sarpras";
      else if (role.includes("prestasi") || role.includes("binpres")) fieldName = "Bidang Pembinaan Prestasi";
      else if (role.includes("pendanaan") || role.includes("usaha")) fieldName = "Bidang Dana & Usaha";

      if (!groupedFields[fieldName]) groupedFields[fieldName] = [];
      groupedFields[fieldName].push(m);
    });

    return Object.entries(groupedFields).map(([title, members]) => {
      const coordinator = members.find(m => m.role.toLowerCase().includes("koordinator"));
      const staffs = members.filter(m => !m.role.toLowerCase().includes("koordinator"));

      return (
        <div key={title} className="w-full mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{title}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          </div>
          {coordinator && (
            <div className="flex flex-col items-center mb-8">
              <div className="bg-white p-4 rounded-[2rem] border-2 border-amber-400 shadow-lg text-center w-48 md:w-56">
                <div className="w-20 h-20 mx-auto mb-3">
                  <img src={coordinator.photo_url} className="w-full h-full rounded-2xl object-cover" alt={coordinator.name} />
                </div>
                <p className="font-black text-[9px] uppercase text-slate-900 leading-tight mb-2">{coordinator.name}</p>
                <span className="text-[7px] bg-amber-500 text-white px-3 py-1 rounded-full font-black uppercase">{coordinator.role}</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {staffs.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 mb-2">
                  <img src={p.photo_url} className="w-full h-full rounded-xl object-cover" alt={p.name} />
                </div>
                <p className="font-bold text-[8px] md:text-[9px] uppercase text-slate-800">{p.name}</p>
                <p className="text-blue-500 font-bold text-[6px] md:text-[7px] uppercase mt-1">{p.role}</p>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <section id="tentang-kami" className="relative w-full h-screen bg-white flex flex-col items-center overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col py-2 md:py-4">
        
        {/* Header Section */}
        <div className="text-center mb-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full mb-1">
            <Users2 size={10} className="animate-pulse" />
            <span className="text-[7px] font-black uppercase tracking-[0.2em]">Profil Organisasi</span>
          </div>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight uppercase leading-none italic">
            Tentang <span className="text-blue-600">Kami</span>
          </h2>
        </div>

        {/* Navigation Tabs */}
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

        {/* Content Container */}
        <div className={`flex-1 min-h-0 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 border border-slate-100 shadow-sm relative overflow-y-auto custom-scrollbar`}>
          
          {/* RENDER TAB: SEJARAH */}
          {activeTab === 'sejarah' && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                  <History size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic">Sejarah Organisasi</h3>
              </div>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
                  {dynamicContent.sejarah || "Konten sejarah belum tersedia."}
                </p>
              </div>
            </div>
          )}

          {/* RENDER TAB: VISI-MISI */}
          {activeTab === 'visi-misi' && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500 text-white rounded-xl">
                      <Eye size={20} />
                    </div>
                    <h4 className="font-black text-slate-900 uppercase italic">Visi</h4>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{dynamicContent.visi || "Visi belum diatur."}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-500 text-white rounded-xl">
                      <Rocket size={20} />
                    </div>
                    <h4 className="font-black text-slate-900 uppercase italic">Misi</h4>
                  </div>
                  <ul className="space-y-3">
                    {dynamicContent.misi?.split('\n').map((item: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-600">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    )) || <li>Misi belum diatur.</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* RENDER TAB: FASILITAS */}
          {activeTab === 'fasilitas' && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                  <Map size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic">Fasilitas & Sarana</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {dynamicContent.fasilitas_list?.map((f: any, i: number) => (
                  <div key={i} className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                    <div className="aspect-video bg-slate-200 relative overflow-hidden">
                       <img src={f.image || 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=2070'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={f.title} />
                    </div>
                    <div className="p-5">
                      <h5 className="font-black text-slate-900 uppercase text-xs mb-2">{f.title}</h5>
                      <p className="text-slate-500 text-[10px] leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                )) || <p className="text-slate-500">Daftar fasilitas belum ditambahkan.</p>}
              </div>
            </div>
          )}

          {/* RENDER TAB: ORGANISASI (STRUKTUR) */}
          {activeTab === 'organisasi' && (
            <div className="w-full flex flex-col items-center py-8 animate-in slide-in-from-bottom-5 duration-700 pb-32">
              {/* Konten Struktur Organisasi seperti sebelumnya */}
              {/* Level 1 s/d Level 7 */}
              <div className="relative flex flex-col items-center mb-16">
                {orgData.filter(m => m.level === 1).map(p => (
                  <div key={p.id} className="relative z-10 flex flex-col items-center">
                    <div className="bg-white p-5 rounded-[2.5rem] border-4 border-amber-400 shadow-2xl text-center w-64 md:w-80">
                      <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-4">
                        <img src={p.photo_url} className="w-full h-full rounded-[2.5rem] object-cover border-4 border-slate-50 shadow-md" alt={p.name} />
                      </div>
                      <p className="font-black text-[12px] md:text-[15px] uppercase italic text-slate-900 leading-tight mb-2">{p.name}</p>
                      <span className="text-[10px] bg-amber-500 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest">{p.role}</span>
                    </div>
                    <div className="w-1 h-16 bg-gradient-to-b from-amber-400 to-transparent"></div>
                  </div>
                ))}
              </div>

              <div className="relative flex flex-col items-center w-full mb-16">
                <div className="flex flex-wrap justify-center gap-4 relative z-10">
                  {orgData.filter(m => m.level === 2 || m.level === 3).map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-xl text-center w-44 md:w-52">
                      <p className="font-bold text-[10px] uppercase italic text-slate-800 mb-2">{p.name}</p>
                      <span className={`text-[8px] text-white px-4 py-1 rounded-lg font-black uppercase ${getLevelColor(p.level)}`}>{p.role}</span>
                    </div>
                  ))}
                </div>
                <div className="w-0.5 h-12 bg-blue-100"></div>
              </div>

              <div className="relative flex flex-col items-center mb-10 w-full">
                 {orgData.filter(m => m.level === 4).map(p => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="bg-blue-600 p-5 rounded-[2.5rem] shadow-2xl text-center w-56 md:w-64 transform border-4 border-white">
                      <div className="w-24 h-24 mx-auto mb-3">
                        <img src={p.photo_url} className="w-full h-full rounded-2xl object-cover" alt={p.name} />
                      </div>
                      <p className="font-black text-white uppercase mb-2">{p.name}</p>
                      <span className="text-[9px] bg-white text-blue-600 px-5 py-1 rounded-full font-black uppercase">{p.role}</span>
                    </div>
                    <div className="w-0.5 h-12 bg-slate-200"></div>
                  </div>
                ))}
              </div>

              <div className="w-full max-w-5xl mb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {orgData.filter(m => m.level === 5).map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                      <p className="font-black text-[10px] uppercase text-slate-900 leading-tight mb-1">{p.name}</p>
                      <p className="text-rose-500 font-black text-[8px] uppercase">{p.role}</p>
                    </div>
                  ))}
                </div>
              </div>

              {renderAllDepartments()}
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
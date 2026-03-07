import React, { useState, useEffect } from 'react'; 
import { 
  Target, Rocket, Shield, Award, 
  CheckCircle2, Users2, ArrowRight, User, ShieldCheck, 
  ChevronDown, Star, GraduationCap, History, Eye, Map,
  CheckCircle, Zap
} from 'lucide-react'; 
import { supabase } from '../supabase'; 

// --- TAMBAHAN KODE: IMPORT FALLBACK DATA ---
import pageFallback from '../data/page_contents.json';
import orgFallback from '../data/org_fallback.json';
import siteFallback from '../data/site_fallback.json';

interface AboutProps {
  activeTab?: string;
  onTabChange?: (id: string) => void;
}

export default function About({ activeTab: propsActiveTab, onTabChange }: AboutProps) {
  const [internalTab, setInternalTab] = useState('sejarah');
  const [loading, setLoading] = useState(true);
  
  const [dynamicContent, setDynamicContent] = useState<Record<string, any>>({
    sejarah_title: "Jejak Langkah Kami",
    sejarah_accent: "",
    sejarah: `Didirikan dengan semangat dedikasi tinggi...`,
    sejarah_image: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=2070",
    visi: "Menjadi organisasi terdepan dalam mencetak generasi berprestasi...",
    misi: [], // Diubah menjadi array agar lebih fleksibel
    fasilitas_title: "Fasilitas Unggulan",
    fasilitas_main_image: "",
    fasilitas_img1: "",
    fasilitas_img2: "",
    fasilitas_list: [] 
  });
  
  const [orgData, setOrgData] = useState<any[]>([]);
  const activeTab = propsActiveTab || internalTab;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Ambil Konten dari site_settings (SUMBER UTAMA ADMIN)
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'about_content')
        .maybeSingle();

      // 2. Ambil data cadangan dari page_contents
      const { data: pagesData } = await supabase.from('page_contents').select('*');

      let finalMisi: any[] = [];
      let mappedSettings: any = {};

      // Proses data dari Admin (Site Settings)
      if (settingsData && settingsData.value) {
        const val = typeof settingsData.value === 'string' ? JSON.parse(settingsData.value) : settingsData.value;
        
        // Handle Misi (Bisa dari .missions atau .misi)
        const rawMissions = val.missions || val.misi;
        if (Array.isArray(rawMissions)) {
          finalMisi = rawMissions;
        } else if (typeof rawMissions === 'string') {
          finalMisi = rawMissions.split('\n').filter(m => m.trim() !== '');
        }

        mappedSettings = {
          sejarah_title: val.sejarah_title,
          sejarah_accent: val.sejarah_accent,
          sejarah: val.sejarah_desc,
          sejarah_image: val.sejarah_img,
          visi: val.vision || val.visi,
          misi: finalMisi,
          fasilitas_title: val.fasilitas_title,
          fasilitas_main_image: val.fasilitas_img1,
          fasilitas_img1: val.fasilitas_img2,
          fasilitas_img2: val.fasilitas_img3,
        };
      }

      // Jika site_settings tidak lengkap, isi dengan page_contents
      if (pagesData) {
        pagesData.forEach(p => {
          const t = p.title.toLowerCase();
          if (!mappedSettings.sejarah && t.includes('sejarah')) {
             mappedSettings.sejarah = p.content; 
             mappedSettings.sejarah_image = p.image_url;
          }
          if (!mappedSettings.visi && t.includes('visi')) mappedSettings.visi = p.content;
          if ((!mappedSettings.misi || mappedSettings.misi.length === 0) && t.includes('misi')) {
            mappedSettings.misi = p.content.split('\n').filter((m: string) => m.trim() !== '');
          }
        });
      }

      // Gabungkan ke state
      setDynamicContent(prev => ({
        ...prev,
        ...mappedSettings,
        // Pastikan misi selalu berbentuk array
        misi: Array.isArray(mappedSettings.misi) ? mappedSettings.misi : prev.misi
      }));

      // 3. Ambil Data Fasilitas List (Galeri)
      const { data: facilitiesData } = await supabase
        .from('galeri')
        .select('*')
        .or('category.ilike.%fasilitas%,title.ilike.%fasilitas%');

      if (facilitiesData && facilitiesData.length > 0) {
        setDynamicContent(prev => ({ ...prev, fasilitas_list: facilitiesData }));
      }

      // 4. Ambil Struktur Organisasi
      const { data: structData, error: orgError } = await supabase
        .from('organizational_structure')
        .select('*')
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true });

      if (!orgError && structData) {
        setOrgData(structData);
      } else {
        setOrgData(orgFallback || []);
      }

    } catch (err) {
      console.error("Error connecting to database:", err);
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
      default: return 'bg-slate-500';
    }
  };

  const renderDepartment = (title: string, roleKey: string) => {
    const coordinator = orgData.find(m => 
      m.level === 6 && m.role.toLowerCase().includes(roleKey.toLowerCase())
    );
    const members = orgData.filter(m => 
      m.level === 7 && m.role.toLowerCase().includes(roleKey.toLowerCase())
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
            <div key={p.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
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

        {/* Content Container */}
        <div className={`flex-1 min-h-0 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 border border-slate-100 shadow-sm relative overflow-y-auto custom-scrollbar`}>
          
          {loading ? (
              <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
          ) : (
            <>
              {activeTab === 'sejarah' && (
                <div className="max-w-4xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-1/3 shrink-0">
                      <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl rotate-3">
                        <img 
                          src={dynamicContent.sejarah_image} 
                          className="w-full h-full object-cover" 
                          alt="Sejarah" 
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-4 flex items-center gap-2">
                        <Zap className="text-amber-500" size={20} /> 
                        {dynamicContent.sejarah_title} <span className="text-blue-600">{dynamicContent.sejarah_accent}</span>
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-line font-medium">
                        {dynamicContent.sejarah}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'visi-misi' && (
                <div className="max-w-5xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase italic mb-4">Visi Utama</h3>
                      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-amber-50 shadow-sm font-black italic text-lg leading-relaxed">
                        "{dynamicContent.visi}"
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase italic mb-4">Misi Kami</h3>
                      <div className="space-y-4">
                        {/* PERBAIKAN UTAMA: Mapping Misi yang sudah diproses menjadi Array */}
                        {Array.isArray(dynamicContent.misi) && dynamicContent.misi.length > 0 ? (
                          dynamicContent.misi.map((item: any, i: number) => {
                            const textContent = typeof item === 'object' ? item.text || item.content : item;
                            if (!textContent) return null;
                            return (
                              <div key={i} className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <CheckCircle size={16} className="text-emerald-500 mt-1 shrink-0" />
                                <p className="text-slate-600 text-sm font-bold uppercase tracking-tight">
                                  {textContent.replace(/^[0-9.-]+\s*/, '')}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-10 text-slate-400 italic">Belum ada data misi.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fasilitas' && (
                <div className="max-w-6xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center text-center mb-10">
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg mb-4">
                      <Map size={24} />
                    </div>
                    <h3 className="text-2xl md:text-4xl font-black text-slate-900 uppercase italic leading-tight">
                      {dynamicContent.fasilitas_title || "Fasilitas Kami"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="h-64 rounded-[2rem] overflow-hidden shadow-lg border-4 border-white">
                      <img 
                        src={dynamicContent.fasilitas_main_image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070"} 
                        className="w-full h-full object-cover" 
                        alt="Fasilitas Utama" 
                      />
                    </div>
                    <div className="h-64 rounded-[2rem] overflow-hidden shadow-lg border-4 border-white">
                      <img 
                        src={dynamicContent.fasilitas_img1 || "https://images.unsplash.com/photo-1571902901105-d8c8d330bd46?q=80&w=1967"} 
                        className="w-full h-full object-cover" 
                        alt="Detail Fasilitas 1" 
                      />
                    </div>
                    <div className="h-64 rounded-[2rem] overflow-hidden shadow-lg border-4 border-white">
                      <img 
                        src={dynamicContent.fasilitas_img2 || "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070"} 
                        className="w-full h-full object-cover" 
                        alt="Detail Fasilitas 2" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {dynamicContent.fasilitas_list?.length > 0 && dynamicContent.fasilitas_list.map((f: any, i: number) => (
                      <div key={f.id || i} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="aspect-[4/3] relative overflow-hidden bg-slate-200">
                          <img src={f.image_url || f.image || f.url_gambar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={f.title} />
                        </div>
                        <div className="p-6">
                          <h4 className="font-black text-slate-900 uppercase text-sm mb-2">{f.title || f.judul}</h4>
                          <p className="text-slate-500 text-xs leading-relaxed font-medium">{f.description || f.deskripsi}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'organisasi' && (
                <div className="w-full flex flex-col items-center py-8 animate-in slide-in-from-bottom-5 duration-700 pb-32">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <div key={lvl} className={`flex flex-wrap justify-center gap-4 md:gap-8 mb-12 w-full`}>
                      {orgData.filter(m => m.level === lvl).map(p => (
                        <div key={p.id} className="relative flex flex-col items-center">
                          <div className={`bg-white p-3 rounded-2xl border-2 shadow-xl text-center ${lvl === 1 ? 'w-52 md:w-64 border-amber-500' : 'w-40 md:w-48 border-slate-100'}`}>
                            <div className={`${lvl === 1 ? 'w-24 h-24' : 'w-16 h-16'} mx-auto mb-2`}>
                              <img src={p.photo_url || `https://ui-avatars.com/api/?name=${p.name}`} className="w-full h-full rounded-xl object-cover shadow-sm" alt={p.name} />
                            </div>
                            <p className="font-bold text-[9px] md:text-[11px] uppercase italic text-slate-800 leading-tight mb-1">{p.name}</p>
                            <span className={`text-[7px] text-white px-3 py-0.5 rounded-md font-bold uppercase ${getLevelColor(p.level)}`}>{p.role}</span>
                          </div>
                          <div className="w-0.5 h-12 bg-slate-100"></div>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div className="w-full max-w-6xl px-2">
                    {renderDepartment("Bidang Pertandingan", "Pertandingan")}
                    {renderDepartment("Bidang Pembinaan Prestasi", "Binpres")}
                    {renderDepartment("Bidang Humas", "Humas")}
                    {renderDepartment("Bidang Rohani & Sarpras", "Rohani")}
                  </div>
                </div>
              )}
            </>
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
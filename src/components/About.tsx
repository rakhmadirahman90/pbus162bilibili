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
    sejarah: `Didirikan dengan semangat dedikasi tinggi...`,
    sejarah_image: "https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=2070",
    visi: "Menjadi organisasi terdepan dalam mencetak generasi berprestasi...",
    misi: "Mengembangkan potensi anggota secara maksimal.\nMembangun sinergi yang kuat.\nInovatif dan edukatif.\nIntegritas dan sportivitas.",
    fasilitas_title: "Fasilitas Unggulan", // Tambahan untuk judul fasilitas
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
      // 1. Ambil Konten dari page_contents (Sumber utama dari AdminAbout)
      const { data: pagesData, error: pagesError } = await supabase
        .from('page_contents')
        .select('*');

      if (!pagesError && pagesData && pagesData.length > 0) {
        const mappedContent: any = { ...dynamicContent };
        pagesData.forEach(page => {
          const title = page.title?.toLowerCase() || "";
          
          if (title.includes('sejarah')) {
            mappedContent.sejarah = page.content;
            mappedContent.sejarah_image = page.image_url || page.image;
          } else if (title.includes('visi')) {
            mappedContent.visi = page.content;
          } else if (title.includes('misi')) {
            mappedContent.misi = page.content;
          } else if (title.includes('fasilitas')) {
            // MENGAMBIL DATA FASILITAS DARI ADMINABOUT (page_contents)
            mappedContent.fasilitas_title = page.content; // Judul Fasilitas
            mappedContent.fasilitas_main_image = page.image_url; // Gambar Utama
          }
        });
        setDynamicContent(prev => ({ ...prev, ...mappedContent }));
      }

      // 2. Ambil Data Fasilitas List (Galeri)
      const { data: facilitiesData } = await supabase
        .from('galeri')
        .select('*')
        .or('category.ilike.%fasilitas%,title.ilike.%fasilitas%');

      if (facilitiesData && facilitiesData.length > 0) {
        setDynamicContent(prev => ({ ...prev, fasilitas_list: facilitiesData }));
      } else {
        const { data: galleryAlt } = await supabase.from('gallery').select('*').filter('category', 'ilike', '%fasilitas%');
        if (galleryAlt) setDynamicContent(prev => ({ ...prev, fasilitas_list: galleryAlt }));
      }

      // 3. Ambil Struktur Organisasi
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
      m.level === 6 && 
      m.role.toLowerCase().includes(roleKey.toLowerCase())
    );
    const members = orgData.filter(m => 
      m.level === 7 && 
      m.role.toLowerCase().includes(roleKey.toLowerCase())
    );

    if (!coordinator && members.length === 0) return null;

    return (
      <div className="w-full mb-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{title}</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        </div>
        {/* ... (render logic sama seperti kode Anda) */}
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
                        <Zap className="text-amber-500" size={20} /> Jejak Langkah Kami
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
                        {dynamicContent.misi?.split('\n').filter((t: string) => t.trim() !== '').map((item: string, i: number) => (
                          <div key={i} className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <CheckCircle size={16} className="text-emerald-500 mt-1" />
                            <p className="text-slate-600 text-sm font-bold uppercase tracking-tight">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAMPILAN FASILITAS LENGKAP */}
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

                  {/* Gambar Utama (Jika ada di page_contents) */}
                  {dynamicContent.fasilitas_main_image && (
                    <div className="w-full h-48 md:h-80 rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl border-4 border-white">
                      <img 
                        src={dynamicContent.fasilitas_main_image} 
                        className="w-full h-full object-cover" 
                        alt="Main Facility" 
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {dynamicContent.fasilitas_list?.length > 0 ? (
                      dynamicContent.fasilitas_list.map((f: any, i: number) => (
                        <div key={f.id || i} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                          <div className="aspect-[4/3] relative overflow-hidden bg-slate-200">
                            <img src={f.image_url || f.image || f.url_gambar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={f.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
                          </div>
                          <div className="p-6">
                            <h4 className="font-black text-slate-900 uppercase text-sm mb-2">{f.title || f.judul}</h4>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">{f.description || f.deskripsi}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Jika Galeri Fasilitas kosong, tampilkan placeholder/instruksi
                      <div className="col-span-full bg-white p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                        <p className="text-slate-400 font-black uppercase tracking-widest italic mb-2">Belum ada Galeri Fasilitas</p>
                        <p className="text-[10px] text-slate-400">Tambahkan foto dengan kategori 'Fasilitas' di menu Galeri Admin</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'organisasi' && (
                <div className="w-full flex flex-col items-center py-8 animate-in slide-in-from-bottom-5 duration-700 pb-32">
                  {/* ... (render logic organisasi tetap sama) */}
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
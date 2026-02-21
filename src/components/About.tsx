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

  // Helper untuk memfilter person berdasarkan role (case insensitive)
  const getByRole = (roleName: string) => 
    orgData.filter(m => m.role.toLowerCase().includes(roleName.toLowerCase()));

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
        <div className="bg-slate-50/50 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 border border-slate-100 shadow-sm min-h-[600px] transition-all duration-500">
          
          {/* CONTENT: SEJARAH, VISI MISI, FASILITAS (Tetap Sama) */}
          {activeTab === 'sejarah' && (
             <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative group hidden md:block">
                  <div className="absolute -inset-4 bg-blue-100/50 rounded-[3rem] blur-2xl group-hover:bg-blue-200/50 transition-colors"></div>
                  <img src={dynamicContent.sejarah_img || "photo_2026-02-03_00-32-07.jpg"} className="relative w-full h-[450px] object-cover rounded-[2.5rem] shadow-2xl border-4 border-white transition-transform duration-700 group-hover:scale-[1.02]" alt="Sejarah" />
                </div>
                <div className="space-y-6">
                  <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">Legacy & Spirit</div>
                  <h3 className="text-3xl md:text-5xl font-black text-slate-900 uppercase leading-[1.1]">
                    {dynamicContent.sejarah_title || "MEMBINA"} <span className="text-blue-600">{dynamicContent.sejarah_accent || "LEGENDA"}</span> MASA DEPAN
                  </h3>
                  <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                    {dynamicContent.sejarah_desc || "PB US 162 hadir sebagai pusat keunggulan bulutangkis yang mengintegrasikan sport-science dengan disiplin tinggi."}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {["Sport-science intensif", "GOR Standar BWF", "Karier Profesional", "Klasemen Digital"].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 uppercase">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visi-misi' && (
            <div className="w-full animate-in fade-in duration-700 grid lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-5 text-blue-600 transition-transform duration-700 group-hover:scale-110"><Target size={250} /></div>
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200"><Target size={32} /></div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase italic">Visi Utama</span>
                <p className="text-slate-800 text-2xl md:text-3xl font-bold leading-tight italic relative z-10">"{dynamicContent.vision || "Menjadi klub rujukan nasional yang mencetak atlet berprestasi dunia."}"</p>
              </div>
              <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-5 text-slate-900 transition-transform duration-700 group-hover:scale-110"><Rocket size={250} /></div>
                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg"><Rocket size={32} /></div>
                <span className="text-blue-600 font-black block mb-4 tracking-[0.2em] text-xs uppercase italic">Misi Strategis</span>
                <ul className="space-y-4 relative z-10">
                  {(dynamicContent.missions || ["Latihan terstruktur", "Fasilitas internasional", "Kompetisi rutin"]).map((misi: string, i: number) => (
                    <li key={i} className="flex items-center gap-4 text-slate-700 font-bold text-sm md:text-base italic group/item">
                      <div className="w-2 h-2 bg-blue-500 rounded-full group-hover/item:scale-150 transition-transform"></div>{misi}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'fasilitas' && (
            <div className="w-full animate-in fade-in duration-500 grid lg:grid-cols-2 gap-12 items-center">
               <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase mb-2">Fasilitas Unggulan</h3>
                  <p className="text-slate-500 font-medium italic">Standardisasi Internasional (BWF)</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {['Lapangan karpet standar BWF', 'Pencahayaan LED anti-silau', 'Fitness center', 'Asrama atlet'].map((item, index) => (
                    <div key={index} className="flex items-center gap-5 p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0"><Shield size={22} /></div>
                      <span className="text-sm md:text-base font-black text-slate-700 uppercase tracking-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 h-[400px]">
                <img src={dynamicContent.fasilitas_img1 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-[2.5rem] shadow-lg border-2 border-white" alt="Arena" />
                <div className="grid grid-rows-2 gap-4">
                   <img src={dynamicContent.fasilitas_img2 || "dpnkwabotttfihp7gf3r.jpg"} className="w-full h-full object-cover rounded-[2rem] shadow-md border-2 border-white" alt="Gym" />
                   <img src="https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&q=80" className="w-full h-full object-cover rounded-[2rem] shadow-md border-2 border-white" alt="Equipment" />
                </div>
              </div>
            </div>
          )}

          {/* 4. STRUKTUR ORGANISASI (HIERARKI LENGKAP) */}
          {activeTab === 'organisasi' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000 relative">
              {/* Garis Tengah Visual */}
              <div className="absolute top-24 bottom-24 w-0.5 bg-gradient-to-b from-amber-200 via-blue-100 to-transparent left-1/2 -translate-x-1/2 hidden lg:block opacity-30"></div>

              <div className="relative flex flex-col items-center gap-16">
                
                {/* 1. PENANGGUNG JAWAB (PUNCAK) */}
                <div className="flex flex-col items-center">
                  {getByRole('penanggung jawab').map(person => (
                    <div key={person.id} className="bg-white p-8 rounded-[3.5rem] border-2 border-amber-200 shadow-[0_25px_60px_rgba(245,158,11,0.15)] text-center w-80 group">
                      <div className="w-36 h-36 mx-auto mb-6 rounded-[2.5rem] overflow-hidden border-4 border-amber-50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                        <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-black text-slate-900 text-xl italic uppercase mb-2">{person.name}</h4>
                      <span className="px-5 py-2 bg-amber-500 text-white text-[11px] font-black uppercase rounded-xl italic">{person.role}</span>
                    </div>
                  ))}
                </div>

                {/* 2. PENASEHAT (BARIS KEDUA) */}
                <div className="w-full">
                  <p className="text-center text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mb-8">Jajaran Penasehat</p>
                  <div className="flex flex-wrap justify-center gap-8">
                    {getByRole('penasehat').map(person => (
                      <div key={person.id} className="bg-white p-6 rounded-[2.5rem] border border-amber-100 shadow-xl text-center w-64 group">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-[1.8rem] overflow-hidden border-2 border-amber-50">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-slate-800 text-sm italic uppercase leading-tight mb-2">{person.name}</h4>
                        <span className="text-amber-600 font-black text-[9px] uppercase italic">{person.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. PEMBINA (BARIS KETIGA) */}
                <div className="w-full">
                  <p className="text-center text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mb-8">Jajaran Pembina</p>
                  <div className="flex flex-wrap justify-center gap-8">
                    {getByRole('pembina').map(person => (
                      <div key={person.id} className="bg-white p-6 rounded-[2.5rem] border border-blue-100 shadow-xl text-center w-64 group">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-[1.8rem] overflow-hidden border-2 border-blue-50">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-slate-800 text-sm italic uppercase mb-2">{person.name}</h4>
                        <span className="text-blue-600 font-black text-[9px] uppercase italic">{person.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. KETUA UMUM (SENDIRI) */}
                <div className="flex flex-col items-center">
                  <ChevronDown className="text-slate-300 mb-8 animate-bounce" />
                  {getByRole('ketua umum').map(person => (
                    <div key={person.id} className="bg-white p-8 rounded-[3.5rem] border-2 border-blue-600 shadow-2xl text-center w-80 group">
                      <div className="w-32 h-32 mx-auto mb-6 rounded-[2.5rem] overflow-hidden border-4 border-blue-50 group-hover:scale-105 transition-transform duration-500">
                        <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-black text-slate-900 text-lg italic uppercase mb-2">{person.name}</h4>
                      <span className="px-5 py-2 bg-blue-600 text-white text-[11px] font-black uppercase rounded-xl italic shadow-lg shadow-blue-200">{person.role}</span>
                    </div>
                  ))}
                </div>

                {/* 5. PENGURUS INTI (HORIZONTAL) */}
                <div className="w-full">
                   <p className="text-center text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mb-8">Dewan Pengurus Inti</p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {orgData.filter(m => m.level === 2 && !m.role.toLowerCase().includes('ketua umum') && !m.role.toLowerCase().includes('pelatih')).map(person => (
                      <div key={person.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-lg text-center group hover:border-blue-400 transition-all">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-slate-50 group-hover:scale-105 transition-transform">
                          <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-black text-slate-900 text-[13px] italic uppercase leading-tight mb-2">{person.name}</h4>
                        <span className="text-blue-600 font-black text-[9px] uppercase tracking-widest">{person.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. KEPALA PELATIH */}
                <div className="flex flex-col items-center">
                   <p className="text-center text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mb-8">Bidang Teknis</p>
                   {getByRole('kepala pelatih').map(person => (
                    <div key={person.id} className="bg-slate-900 p-8 rounded-[3.5rem] shadow-2xl text-center w-80 group">
                      <div className="w-32 h-32 mx-auto mb-6 rounded-[2.5rem] overflow-hidden border-4 border-blue-600 group-hover:scale-105 transition-transform duration-500">
                        <img src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}`} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-black text-white text-lg italic uppercase mb-2">{person.name}</h4>
                      <div className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white text-[11px] font-black uppercase rounded-xl italic">
                         <GraduationCap size={16} /> {person.role}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 7. BIDANG/KOORDINATOR & ANGGOTA (SISTEM KARTU GRUP) */}
                <div className="w-full">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                    <span className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Koordinator & Anggota Bidang</span>
                    <div className="h-[1px] flex-1 bg-slate-200"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Logika: Ambil semua Koordinator di Level 3 sebagai Head of Group */}
                    {orgData.filter(m => m.level === 3 && m.role.toLowerCase().includes('koordinator')).map(koor => {
                      // Filter anggota yang memiliki kata kunci role yang sama (Misal: 'Humas' atau 'Perlengkapan')
                      const category = koor.role.split(' ').pop(); 
                      const members = orgData.filter(m => m.level === 3 && m.role.toLowerCase().includes(category?.toLowerCase()) && m.id !== koor.id);

                      return (
                        <div key={koor.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col group">
                          {/* Header Group (Koordinator) */}
                          <div className="bg-blue-600 p-6 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-white/20 shadow-lg">
                              <img src={koor.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(koor.name)}`} className="w-full h-full object-cover" />
                            </div>
                            <h4 className="text-white font-black text-sm italic uppercase leading-tight mb-1">{koor.name}</h4>
                            <p className="text-blue-100 font-black text-[9px] uppercase tracking-widest">{koor.role}</p>
                          </div>
                          {/* List Anggota */}
                          <div className="p-6 space-y-4 flex-1 bg-slate-50/50">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Daftar Anggota:</p>
                            {members.length > 0 ? members.map(mem => (
                              <div key={mem.id} className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-100 group/item hover:border-blue-300 transition-all">
                                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-50">
                                  <img src={mem.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mem.name)}`} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <p className="font-black text-slate-800 text-[10px] uppercase italic leading-none">{mem.name}</p>
                                   <p className="text-blue-500 font-bold text-[8px] uppercase mt-1">{mem.role}</p>
                                </div>
                              </div>
                            )) : <p className="text-center text-[9px] text-slate-300 italic">Belum ada anggota</p>}
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
    </section>
  );
}
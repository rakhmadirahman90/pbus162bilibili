import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, Award, Users, ChevronDown } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  role: string;
  category: string;
  level: number;
  photo_url: string;
}

export default function StrukturOrganisasi() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('organizational_structure')
          .select('*')
          .order('level', { ascending: true })
          .order('name', { ascending: true });
        
        if (error) throw error;
        setMembers(data || []);
      } catch (err) {
        console.error("Error fetching structure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic">Sinkronisasi Database...</p>
    </div>
  );

  // Helper untuk mengelompokkan level 3 berdasarkan role (Seksi)
  const renderSeksiGrid = () => {
    const seksiMembers = members.filter(m => m.level === 3);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 relative">
        {seksiMembers.map((m) => (
          <div key={m.id} className="relative group">
             {/* Card Seksi */}
             <div className="bg-white p-5 rounded-[2rem] shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-50 shrink-0">
                      <img 
                        src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0D8ABC&color=fff`} 
                        className="w-full h-full object-cover" 
                      />
                   </div>
                   <div className="text-left">
                      <h4 className="font-black text-slate-900 text-[11px] uppercase italic leading-tight">{m.name}</h4>
                      <p className="text-blue-600 font-bold text-[9px] uppercase tracking-wider mt-0.5">{m.role}</p>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-32 font-sans bg-[#FBFCFE]">
      {/* Header Elegan */}
      <div className="text-center mb-24 pt-10">
        <div className="inline-block px-4 py-1.5 mb-4 bg-blue-50 rounded-full border border-blue-100">
           <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Official Management</p>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 italic tracking-tighter mb-4 uppercase leading-none">
          Struktur <span className="text-blue-600">Organisasi</span>
        </h1>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">PB US 162 • Periode 2024 - 2028</p>
      </div>

      <div className="relative">
        {/* Garis Vertikal Utama Penghubung Seluruh Hirarki */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-200 via-blue-100 to-transparent -translate-x-1/2 hidden lg:block"></div>

        {/* --- LEVEL 1: TOP LEADERSHIP (Puncak) --- */}
        <div className="relative z-10 mb-24">
          <div className="flex flex-col items-center text-center">
            <div className="bg-amber-500 text-white p-2 rounded-xl mb-6 shadow-lg shadow-amber-200">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-slate-900 font-black uppercase tracking-[0.3em] text-[12px] mb-10">
              Penasehat & Penanggung Jawab
            </h2>
            
            <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
              {members.filter(m => m.level === 1).map(m => (
                <div key={m.id} className="relative group">
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-blue-50 text-center w-64 group-hover:border-blue-500 transition-all duration-500">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-[1.5rem] overflow-hidden border-4 border-slate-50 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                      <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0D8ABC&color=fff`} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-black text-slate-900 text-[13px] italic uppercase leading-tight">{m.name}</h3>
                    <div className="mt-3 px-3 py-1 bg-slate-50 rounded-full inline-block">
                       <p className="text-blue-600 font-black text-[9px] uppercase tracking-tighter">{m.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Icon Downstream */}
        <div className="flex justify-center mb-20 relative z-10">
           <div className="bg-white p-2 rounded-full shadow-md border border-slate-100">
              <ChevronDown className="text-blue-600 animate-bounce" size={20} />
           </div>
        </div>

        {/* --- LEVEL 2: CORE EXECUTIVE (Tengah) --- */}
        <div className="relative z-10 mb-24">
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 text-white p-2 rounded-xl mb-6 shadow-lg shadow-blue-200">
              <Award size={24} />
            </div>
            <h2 className="text-slate-900 font-black uppercase tracking-[0.3em] text-[12px] mb-10 text-center">
              Dewan Pengurus Inti
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {members.filter(m => m.level === 2).map(m => (
                <div key={m.id} className="bg-white p-8 rounded-[3rem] shadow-lg border border-slate-100 text-center group hover:shadow-blue-900/5 transition-all duration-500">
                  <div className="relative inline-block mb-4">
                    <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-blue-50 group-hover:border-blue-600 transition-all duration-500 shadow-lg">
                      <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-md">
                       <Award size={14} />
                    </div>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg italic uppercase leading-tight tracking-tighter">{m.name}</h3>
                  <p className="text-blue-600 font-black text-[10px] uppercase mt-2 tracking-widest">{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- LEVEL 3: DEPARTMENTS (Bawah) --- */}
        <div className="relative z-10">
          <div className="flex flex-col items-center">
             <div className="bg-slate-800 text-white p-2 rounded-xl mb-6 shadow-lg shadow-slate-200">
                <Users size={24} />
             </div>
             <h2 className="text-slate-900 font-black uppercase tracking-[0.3em] text-[12px] mb-4">
               Bidang & Koordinator
             </h2>
             <div className="w-full h-[1px] bg-slate-200 max-w-xs mb-10"></div>
             
             {renderSeksiGrid()}
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-32 text-center border-t border-slate-100 pt-10">
         <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em]">Professional Badminton Club Management</p>
      </div>
    </div>
  );
}
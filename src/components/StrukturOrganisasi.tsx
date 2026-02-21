import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, Users, Award, Star, Info } from 'lucide-react';
import { motion } from 'framer-motion';

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
          .order('level', { ascending: true });
        
        if (error) throw error;
        setMembers(data || []);
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold animate-pulse">MEMUAT STRUKTUR...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Info size={48} className="text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-800">Data Belum Tersedia</h3>
        <p className="text-slate-500">Silakan tambahkan pengurus melalui panel admin.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-12 px-4 md:px-8">
      {/* HEADER SECTION */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-black italic text-slate-900 tracking-tighter uppercase mb-4">
          STRUKTUR <span className="text-blue-600">ORGANISASI</span>
        </h2>
        <div className="w-20 h-2 bg-blue-600 mx-auto rounded-full"></div>
      </div>

      {/* TAMPILAN LEVEL 1 (PEMBINA / PENASEHAT) */}
      <section className="mb-16">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] w-12 bg-slate-300"></div>
          <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Dewan Pembina</span>
          <div className="h-[1px] w-12 bg-slate-300"></div>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {members.filter(m => m.level === 1).map(member => (
            <div key={member.id} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 w-64 text-center">
              <div className="w-20 h-20 mx-auto bg-blue-50 rounded-2xl mb-4 overflow-hidden border-2 border-blue-100">
                <img 
                  src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0D8ABC&color=fff`} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-black text-slate-900 text-sm uppercase leading-tight">{member.name}</h4>
              <p className="text-blue-600 font-bold text-[10px] uppercase mt-2">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TAMPILAN LEVEL 2 (PENGURUS INTI) */}
      <section className="mb-16">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] w-12 bg-slate-300"></div>
          <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Pengurus Inti</span>
          <div className="h-[1px] w-12 bg-slate-300"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.filter(m => m.level === 2).map(member => (
            <div key={member.id} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-50 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-xl mb-4 overflow-hidden">
                <img 
                  src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-black text-slate-900 text-[11px] uppercase italic">{member.name}</h4>
              <p className="text-slate-400 font-bold text-[9px] uppercase mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TAMPILAN LEVEL 3 (SEKSI / ANGGOTA) */}
      <section>
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] w-12 bg-slate-300"></div>
          <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Bidang & Seksi</span>
          <div className="h-[1px] w-12 bg-slate-300"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {members.filter(m => m.level === 3).map(member => (
            <div key={member.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
              <h4 className="font-black text-slate-800 text-[10px] uppercase text-center leading-none mb-1">{member.name}</h4>
              <p className="text-blue-500 font-bold text-[8px] uppercase">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
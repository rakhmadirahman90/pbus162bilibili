import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, Users, Award, Star, Trophy } from 'lucide-react';
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

  return (
    <div className="max-w-7xl mx-auto px-4 pb-32">
      {/* Header */}
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 italic tracking-tighter mb-4 uppercase">
          Struktur <span className="text-blue-600">Organisasi</span>
        </h1>
        <div className="w-24 h-2 bg-blue-600 mx-auto rounded-full mb-6"></div>
        <p className="text-slate-500 font-bold text-sm uppercase">Manajemen Profesional PB US 162</p>
      </div>

      {/* --- LEVEL 1: PIMPINAN --- */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-[1px] flex-1 bg-slate-200"></div>
          <h2 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-500" /> Penasehat & Penanggung Jawab
          </h2>
          <div className="h-[1px] flex-1 bg-slate-200"></div>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {members.filter(m => m.level === 1).map(m => (
            <div key={m.id} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 text-center w-64 group">
               <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-blue-50 group-hover:border-blue-600 transition-all shadow-inner">
                  <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0D8ABC&color=fff`} className="w-full h-full object-cover" />
               </div>
               <h3 className="font-black text-slate-900 text-sm italic uppercase leading-tight">{m.name}</h3>
               <p className="text-blue-600 font-black text-[9px] uppercase mt-2">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- LEVEL 2: PENGURUS INTI --- */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-[1px] flex-1 bg-slate-200"></div>
          <h2 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
            <Award size={16} className="text-blue-600" /> Dewan Pengurus Inti
          </h2>
          <div className="h-[1px] flex-1 bg-slate-200"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.filter(m => m.level === 2).map(m => (
            <div key={m.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 text-center group">
               <div className="w-28 h-28 mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-blue-50 group-hover:border-blue-600 transition-all">
                  <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} className="w-full h-full object-cover" />
               </div>
               <h3 className="font-black text-slate-900 text-lg italic uppercase leading-tight">{m.name}</h3>
               <p className="text-blue-600 font-black text-[10px] uppercase mt-1 tracking-widest">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- LEVEL 3: SEKSI-SEKSI --- */}
      <section>
        <div className="flex items-center gap-4 mb-10">
          <div className="h-[1px] flex-1 bg-slate-200"></div>
          <h2 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
            <Users size={16} className="text-slate-500" /> Koordinator & Anggota Bidang
          </h2>
          <div className="h-[1px] flex-1 bg-slate-200"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {members.filter(m => m.level === 3).map(m => (
            <div key={m.id} className="bg-slate-50 p-4 rounded-3xl border border-slate-200/50 text-center">
               <h4 className="font-black text-slate-800 text-[10px] uppercase italic leading-none mb-1">{m.name}</h4>
               <p className="text-blue-500 font-bold text-[8px] uppercase">{m.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
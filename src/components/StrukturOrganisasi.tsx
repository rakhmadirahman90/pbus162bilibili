import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, Users, Award, Star, Trophy, Briefcase } from 'lucide-react';
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
        if (data) setMembers(data);
      } catch (err) {
        console.error("Error fetching structure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic">Sinkronisasi Database...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
      {/* Header Halaman */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-24"
      >
        <div className="inline-block px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-lg shadow-blue-200">
          Official Management
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 italic tracking-tighter mb-6 leading-none uppercase">
          Line Up <span className="text-blue-600 underline decoration-slate-200 underline-offset-8">Pengurus</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-bold text-sm leading-relaxed uppercase">
          Sinergi profesional di balik layar <span className="text-blue-600">PB US 162</span> untuk melahirkan bintang masa depan.
        </p>
      </motion.div>

      {/* --- LEVEL 1: PUCUK PIMPINAN --- */}
      <section className="mb-24">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-200"></div>
          <h2 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
            <Star size={14} className="text-amber-500 fill-amber-500" /> Penanggung Jawab & Penasehat
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-200"></div>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {members.filter(m => m.level === 1).map(m => (
            <motion.div key={m.id} variants={itemVariants} className="w-64 bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 text-center group">
               <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-blue-50 group-hover:border-blue-600 transition-colors">
                  <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0D8ABC&color=fff`} className="w-full h-full object-cover" />
               </div>
               <h3 className="font-black text-slate-900 text-sm italic uppercase leading-tight">{m.name}</h3>
               <p className="text-blue-600 font-black text-[9px] uppercase mt-2 tracking-widest">{m.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- LEVEL 2: PENGURUS INTI --- */}
      <section className="mb-24">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-200"></div>
          <h2 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
            <Award size={14} className="text-blue-600" /> Dewan Pengurus Inti
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-200"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.filter(m => m.level === 2).map(m => (
            <motion.div key={m.id} variants={itemVariants} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 text-center group">
               <div className="w-28 h-28 mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-blue-50 group-hover:border-blue-600 transition-colors shadow-inner">
                  <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0D8ABC&color=fff`} className="w-full h-full object-cover" />
               </div>
               <h3 className="font-black text-slate-900 text-lg italic uppercase leading-tight">{m.name}</h3>
               <p className="text-blue-600 font-black text-[10px] uppercase mt-2 tracking-widest">{m.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- LEVEL 3: SEKSI & BIDANG --- */}
      <section>
        <div className="flex items-center gap-4 mb-12">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-200"></div>
          <h2 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
            <Users size={14} className="text-slate-500" /> Koordinator & Anggota Bidang
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-200"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {members.filter(m => m.level === 3).map(m => (
            <motion.div key={m.id} variants={itemVariants} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center">
               <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} className="w-16 h-16 rounded-xl object-cover mb-3 grayscale group-hover:grayscale-0 transition-all" />
               <h4 className="font-black text-slate-900 text-[10px] uppercase italic leading-none mb-1">{m.name}</h4>
               <p className="text-blue-600 font-bold text-[8px] uppercase tracking-tighter">{m.role}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
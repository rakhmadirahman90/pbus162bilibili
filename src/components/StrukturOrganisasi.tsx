import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, Users, Award, Star, ArrowLeft, Home } from 'lucide-react';
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
        if (data) setMembers(data);
      } catch (err) {
        console.error("Error fetching structure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
    // Scroll ke atas otomatis saat komponen dimuat
    window.scrollTo(0, 0);
  }, []);

  // Animasi Variabel
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const MemberCard = ({ member, variant = 'default' }: { member: Member, variant?: 'large' | 'default' | 'small' }) => (
    <motion.div 
      variants={itemVariants}
      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden flex flex-col items-center p-6"
    >
      <div className="relative mb-4">
        <div className={`rounded-2xl overflow-hidden border-4 border-blue-50 group-hover:border-blue-500 transition-colors duration-500 shadow-inner 
          ${variant === 'large' ? 'w-36 h-36' : variant === 'small' ? 'w-24 h-24' : 'w-28 h-28'}`}>
          <img 
            src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0D8ABC&color=fff`} 
            alt={member.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl text-white shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300">
          <ShieldCheck size={16} fill="white" className="text-blue-600" />
        </div>
      </div>
      <h3 className={`font-black text-slate-900 leading-tight mb-1 text-center italic tracking-tighter ${variant === 'large' ? 'text-xl' : 'text-sm'}`}>
        {member.name}
      </h3>
      <div className="px-3 py-1 bg-blue-50 rounded-full">
        <p className="text-blue-700 font-black text-[9px] uppercase tracking-[0.15em]">{member.role}</p>
      </div>
    </motion.div>
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Sinkronisasi Database...</p>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24">
      {/* Navigation Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <nav className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">
          <a href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <Home size={12} /> Home
          </a>
          <span>/</span>
          <span className="text-slate-900">Struktur Organisasi</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-block px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-lg shadow-blue-200">
            Official Management
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 italic tracking-tighter mb-6 leading-none">
            LINE UP <span className="text-blue-600 underline decoration-slate-200 underline-offset-8">PENGURUS</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto font-bold text-sm leading-relaxed uppercase tracking-tight">
            Sinergi profesional di balik layar <span className="text-blue-600">PB US 162</span> untuk melahirkan bintang bulutangkis masa depan.
          </p>
        </motion.div>

        

        {/* SECTION 1: PEMBINA (Level 1) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="h-[1px] flex-1 bg-slate-200"></div>
            <h2 className="flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
              <Star size={14} className="text-amber-500 fill-amber-500" /> Penasehat & Pembina
            </h2>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {members.filter(m => m.level === 1).map(m => <MemberCard key={m.id} member={m} variant="small" />)}
          </div>
        </motion.div>

        {/* SECTION 2: INTI (Level 2) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-24 relative"
        >
          {/* Decorative Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-100 to-transparent -z-10"></div>
          
          <div className="flex items-center gap-4 mb-12">
            <div className="h-[1px] flex-1 bg-slate-200"></div>
            <h2 className="flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
              <Award size={14} className="text-blue-600" /> Dewan Pengurus Inti
            </h2>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {members.filter(m => m.level === 2).map(m => <MemberCard key={m.id} member={m} variant="large" />)}
          </div>
        </motion.div>

        {/* SECTION 3: DIVISI (Level 3) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="h-[1px] flex-1 bg-slate-200"></div>
            <h2 className="flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
              <Users size={14} /> Divisi & Seksi Bidang
            </h2>
            <div className="h-[1px] flex-1 bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {members.filter(m => m.level === 3).map(m => (
              <motion.div 
                key={m.id} 
                variants={itemVariants}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-blue-500 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative mb-3">
                  <img 
                    src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} 
                    className="w-20 h-20 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                  />
                  <div className="absolute inset-0 border-2 border-blue-500/0 group-hover:border-blue-500/100 rounded-2xl transition-all duration-500"></div>
                </div>
                <h4 className="text-[12px] font-black text-slate-900 leading-tight mb-1 italic tracking-tighter uppercase">{m.name}</h4>
                <p className="text-[9px] text-blue-600 font-black uppercase tracking-tighter">{m.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer Branding Overlay */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600"></div>
    </div>
  );
}
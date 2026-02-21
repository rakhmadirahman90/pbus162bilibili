import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, Users, Award, Star, Home, ChevronRight } from 'lucide-react';
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
          .from('organizational_structure') // Sesuai dengan nama tabel di Supabase Anda
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
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Komponen Kartu Anggota
  const MemberCard = ({ member, size = 'default' }: { member: Member, size?: 'lg' | 'default' | 'sm' }) => (
    <motion.div 
      variants={itemVariants}
      className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 flex flex-col items-center p-5"
    >
      <div className="relative mb-3">
        <div className={`rounded-2xl overflow-hidden border-4 border-blue-50 group-hover:border-blue-500 transition-all duration-500 
          ${size === 'lg' ? 'w-32 h-32' : size === 'sm' ? 'w-20 h-20' : 'w-24 h-24'}`}>
          <img 
            src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0D8ABC&color=fff`} 
            alt={member.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        </div>
        {member.level === 1 && (
          <div className="absolute -bottom-2 -right-2 bg-amber-500 p-1.5 rounded-lg text-white shadow-lg">
            <Star size={14} fill="white" />
          </div>
        )}
      </div>
      <h3 className={`font-black text-slate-900 text-center italic tracking-tighter leading-tight mb-1 uppercase ${size === 'lg' ? 'text-lg' : 'text-xs'}`}>
        {member.name}
      </h3>
      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-black text-[8px] uppercase tracking-widest">
        {member.role}
      </span>
    </motion.div>
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Database...</p>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 font-sans">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <nav className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
          <a href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors"><Home size={12}/> Home</a>
          <ChevronRight size={10} />
          <span className="text-slate-900">Struktur Organisasi</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200">
            Management Team
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 italic tracking-tighter mt-6 mb-4">
            STRUKTUR <span className="text-blue-600">PENGURUS</span>
          </h1>
          <div className="w-24 h-2 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* 1. PUCUK PIMPINAN (Level 1) */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2 whitespace-nowrap">
              <ShieldCheck size={16} className="text-amber-500" /> Penanggung Jawab & Penasehat
            </h2>
            <div className="h-[1px] w-full bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {members.filter(m => m.category === 'Pucuk Pimpinan').map(m => (
              <MemberCard key={m.id} member={m} size="sm" />
            ))}
          </div>
        </section>

        {/* 2. PENGURUS INTI (Level 2) */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2 whitespace-nowrap">
              <Award size={16} className="text-blue-600" /> Dewan Pengurus Inti
            </h2>
            <div className="h-[1px] w-full bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {members.filter(m => m.category === 'Pengurus Inti').map(m => (
              <MemberCard key={m.id} member={m} size="lg" />
            ))}
          </div>
        </section>

        {/* 3. SEKSI-SEKSI (Level 3) */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2 whitespace-nowrap">
              <Users size={16} className="text-slate-600" /> Koordinator & Anggota Seksi
            </h2>
            <div className="h-[1px] w-full bg-slate-200"></div>
          </div>
          
          {/* Pengelompokan Seksi secara Dinamis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {['Binpres', 'Humas', 'Sarpras', 'Keanggotaan', 'Rohani', 'Pertandingan'].map(seksi => {
              const seksiMembers = members.filter(m => m.role.includes(seksi));
              if (seksiMembers.length === 0) return null;

              return (
                <div key={seksi} className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
                  <h3 className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6 border-b border-blue-100 pb-2 italic">
                    Seksi {seksi}
                  </h3>
                  <div className="space-y-4">
                    {seksiMembers.map(m => (
                      <div key={m.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                        <img 
                          src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} 
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="text-[10px] font-black text-slate-800 uppercase leading-none">{m.name}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
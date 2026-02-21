import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { ShieldCheck, Users, Award, Star } from 'lucide-react';

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
      const { data } = await supabase
        .from('organizational_structure')
        .select('*')
        .order('level', { ascending: true })
        .order('order_priority', { ascending: true });
      if (data) setMembers(data);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const MemberCard = ({ member, variant = 'default' }: { member: Member, variant?: 'large' | 'default' | 'small' }) => (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 overflow-hidden flex flex-col items-center p-6">
      <div className="relative mb-4">
        <div className={`rounded-full overflow-hidden border-4 border-blue-50 group-hover:border-blue-500 transition-colors duration-500 shadow-inner 
          ${variant === 'large' ? 'w-32 h-32' : variant === 'small' ? 'w-20 h-20' : 'w-24 h-24'}`}>
          <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="absolute -bottom-1 right-2 bg-blue-600 p-1.5 rounded-full text-white shadow-lg scale-0 group-hover:scale-100 transition-transform">
          <ShieldCheck size={14} />
        </div>
      </div>
      <h3 className={`font-bold text-slate-800 leading-tight mb-1 ${variant === 'large' ? 'text-lg' : 'text-sm'}`}>{member.name}</h3>
      <p className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.1em]">{member.role}</p>
    </div>
  );

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50">Mengambil data organisasi...</div>;

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter mb-4">
            STRUKTUR <span className="text-blue-600">ORGANISASI</span>
          </h1>
          <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full mb-6"></div>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
            Dedikasi dan sinergi para pengurus PB Bilibili 162 dalam membina atlet bulutangkis masa depan Indonesia.
          </p>
        </div>

        {/* SECTION 1: PUCUK PIMPINAN (Level 1) */}
        <div className="mb-20">
          <h2 className="flex items-center justify-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs mb-10">
            <Star size={16} /> Penasehat & Pembina
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {members.filter(m => m.level === 1).map(m => <MemberCard key={m.id} member={m} variant="small" />)}
          </div>
        </div>

        {/* SECTION 2: PENGURUS INTI (Level 2) */}
        <div className="mb-20">
          <h2 className="flex items-center justify-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs mb-10">
            <Award size={16} /> Pengurus Inti
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {members.filter(m => m.level === 2).map(m => <MemberCard key={m.id} member={m} variant="large" />)}
          </div>
        </div>

        {/* SECTION 3: SEKSI-SEKSI (Level 3) - Tampilan Grid yang Lebih Compact */}
        <div>
          <h2 className="flex items-center justify-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs mb-10">
            <Users size={16} /> Divisi & Seksi Bidang
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {members.filter(m => m.level === 3).map(m => (
              <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <img src={m.photo_url} className="w-16 h-16 rounded-full object-cover mb-3 grayscale hover:grayscale-0 transition-all" />
                <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1">{m.name}</h4>
                <p className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
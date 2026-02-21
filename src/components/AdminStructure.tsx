import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Plus, Trash2, Save, Image as ImageIcon, ArrowUpCircle, UserPlus } from 'lucide-react';

export default function AdminStructure() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', role: '', category: 'Seksi', level: 3, photo_url: ''
  });

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    const { data } = await supabase.from('organizational_structure').select('*').order('level', { ascending: true });
    if (data) setMembers(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('organizational_structure').insert([formData]);
    if (!error) {
      setFormData({ name: '', role: '', category: 'Seksi', level: 3, photo_url: '' });
      fetchMembers();
    }
  };

  const deleteMember = async (id: string) => {
    if (window.confirm('Hapus anggota ini?')) {
      await supabase.from('organizational_structure').delete().eq('id', id);
      fetchMembers();
    }
  };

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <UserPlus className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Kelola Struktur</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Manajemen Organisasi PB US 162</p>
          </div>
        </div>

        {/* Form Tambah */}
        <form onSubmit={handleSubmit} className="bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nama Lengkap</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all" placeholder="Contoh: H. Suardi" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Jabatan</label>
            <input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all" placeholder="Contoh: Ketua Umum" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tingkatan (Level)</label>
            <select value={formData.level} onChange={e => setFormData({...formData, level: parseInt(e.target.value)})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all">
              <option value={1}>Level 1 (Penasehat/Pembina)</option>
              <option value={2}>Level 2 (Pengurus Inti)</option>
              <option value={3}>Level 3 (Anggota/Seksi)</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
             <label className="text-[10px] font-black uppercase text-slate-400 ml-2">URL Foto</label>
             <input value={formData.photo_url} onChange={e => setFormData({...formData, photo_url: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all" placeholder="https://..." />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
              <Plus size={16} /> Tambah Anggota
            </button>
          </div>
        </form>

        {/* Tabel List Anggota */}
        <div className="bg-[#0F172A] rounded-[2.5rem] border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Anggota</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Jabatan</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Level</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={m.photo_url || `https://ui-avatars.com/api/?name=${m.name}`} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-bold text-sm">{m.name}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-blue-400">{m.role}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black tracking-widest uppercase">Lv {m.level}</span></td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteMember(m.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
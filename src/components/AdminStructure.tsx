import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Plus, Trash2, Save, Upload, UserPlus } from 'lucide-react';

export default function AdminStructure() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', role: '', category: 'Seksi', level: 3, photo_url: ''
  });

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    const { data } = await supabase.from('organizational_structure').select('*').order('level');
    if (data) setMembers(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('organizational_structure').insert([formData]);
    if (!error) {
      alert("Berhasil ditambahkan!");
      setFormData({ name: '', role: '', category: 'Seksi', level: 3, photo_url: '' });
      fetchMembers();
    }
  }

  async function deleteMember(id: string) {
    if (confirm('Hapus anggota ini?')) {
      await supabase.from('organizational_structure').delete().eq('id', id);
      fetchMembers();
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Kelola Organisasi</h1>
            <p className="text-slate-400 text-sm">Manajemen pengurus PB Bilibili 162</p>
          </div>
          <div className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20 text-xs font-bold">
            Total: {members.length} Pengurus
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* FORM TAMBAH */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl sticky top-8">
              <h3 className="flex items-center gap-2 font-bold mb-6 text-blue-400 uppercase text-xs tracking-widest">
                <UserPlus size={16} /> Tambah Anggota Baru
              </h3>
              <div className="space-y-4">
                <input 
                  placeholder="Nama Lengkap" 
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
                />
                <input 
                  placeholder="Jabatan (Contoh: Sekretaris)" 
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required
                />
                <select 
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-sm outline-none"
                  value={formData.level} onChange={e => setFormData({...formData, level: parseInt(e.target.value)})}
                >
                  <option value={1}>Level 1 (Penasehat/Pembina)</option>
                  <option value={2}>Level 2 (Pengurus Inti)</option>
                  <option value={3}>Level 3 (Seksi/Anggota)</option>
                </select>
                <input 
                  placeholder="URL Foto (Opsional)" 
                  className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-sm outline-none text-blue-300"
                  value={formData.photo_url} onChange={e => setFormData({...formData, photo_url: e.target.value})}
                />
                <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all">
                  <Plus size={18} /> Simpan ke Database
                </button>
              </div>
            </form>
          </div>

          {/* DAFTAR ANGGOTA */}
          <div className="lg:col-span-2 space-y-3">
            {members.map((m: any) => (
              <div key={m.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-blue-500/50 transition-all">
                <div className="flex items-center gap-4">
                  <img src={m.photo_url} className="w-12 h-12 rounded-full object-cover border border-slate-700" />
                  <div>
                    <h4 className="font-bold text-slate-200">{m.name}</h4>
                    <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest">{m.role}</p>
                  </div>
                </div>
                <button onClick={() => deleteMember(m.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
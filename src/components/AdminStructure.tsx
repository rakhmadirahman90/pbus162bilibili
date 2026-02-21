import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Plus, Trash2, Save, Shield, UserPlus, Edit3, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AdminStructure() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '', 
    role: '', 
    category: 'Seksi', 
    level: 3, 
    photo_url: ''
  });

  useEffect(() => { 
    fetchMembers(); 
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('organizational_structure')
      .select('*')
      .order('level', { ascending: true });
    if (data) setMembers(data);
    setLoading(false);
  };

  // FUNGSI UPLOAD FOTO KE SUPABASE STORAGE
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      
      // Validasi Ukuran (Maks 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 2MB.");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `org-structure/${fileName}`;

      // Upload ke bucket 'avatars'
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message === "Bucket not found") {
          throw new Error("Bucket 'avatars' belum dibuat di Supabase Storage. Silakan buat bucket bernama 'avatars' dan set ke Public.");
        }
        throw uploadError;
      }

      // Ambil Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setFormData({ ...formData, photo_url: data.publicUrl });
      alert('Foto berhasil diunggah!');

    } catch (error: any) {
      console.error("Upload error:", error);
      alert('Gagal upload: ' + error.message);
    } finally {
      setUploading(false);
      // Reset input file agar bisa pilih file yang sama lagi jika gagal
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // LOGIKA EDIT DATA
        const { error } = await supabase
          .from('organizational_structure')
          .update({
            name: formData.name,
            role: formData.role,
            category: formData.category,
            level: formData.level,
            photo_url: formData.photo_url
          })
          .eq('id', editingId);
        
        if (error) throw error;
        alert('Data pengurus berhasil diperbarui!');
        setEditingId(null);
      } else {
        // LOGIKA TAMBAH DATA
        const { error } = await supabase.from('organizational_structure').insert([formData]);
        if (error) throw error;
        alert('Berhasil menambah pengurus!');
      }

      // Reset Form
      setFormData({ name: '', role: '', category: 'Seksi', level: 3, photo_url: '' });
      fetchMembers();
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (member: any) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      category: member.category || 'Seksi',
      level: member.level,
      photo_url: member.photo_url || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', role: '', category: 'Seksi', level: 3, photo_url: '' });
  };

  const deleteMember = async (id: string) => {
    if (window.confirm('Hapus data ini? Foto di storage tidak akan terhapus otomatis.')) {
      const { error } = await supabase.from('organizational_structure').delete().eq('id', id);
      if (!error) fetchMembers();
    }
  };

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Shield className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                {editingId ? 'Edit Pengurus' : 'Kelola Struktur'}
              </h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Organizational Database</p>
            </div>
          </div>
          {editingId && (
            <button onClick={cancelEdit} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/20">
              <X size={14} /> Batal Edit
            </button>
          )}
        </header>

        {/* Form Tambah/Edit Data */}
        <form onSubmit={handleSubmit} className={`bg-[#0F172A] p-8 rounded-[2.5rem] border transition-all duration-500 ${editingId ? 'border-amber-500/50 shadow-2xl shadow-amber-500/10' : 'border-white/5'} mb-10 grid grid-cols-1 md:grid-cols-3 gap-6`}>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nama Lengkap</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all" placeholder="Contoh: H. Suardi" />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Jabatan</label>
            <input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all" placeholder="Ketua Umum / Humas" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tingkatan (Hierarki)</label>
            <select value={formData.level} onChange={e => setFormData({...formData, level: parseInt(e.target.value)})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all">
              <option value={1}>Level 1 (Penasehat/Pembina)</option>
              <option value={2}>Level 2 (Pengurus Inti)</option>
              <option value={3}>Level 3 (Anggota/Seksi)</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Foto Profil (Storage)</label>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  onChange={handleUpload} 
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className={`w-full bg-[#050505] border border-dashed rounded-2xl px-5 py-4 text-sm flex items-center gap-3 transition-all ${uploading ? 'border-blue-500 text-blue-500' : 'border-white/20 text-slate-400'}`}>
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  {formData.photo_url ? 'Foto Siap (Klik untuk ganti)' : 'Klik atau seret foto ke sini...'}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                {formData.photo_url ? (
                  <img src={formData.photo_url} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <ImageIcon size={20} className="text-slate-600" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={uploading || loading} 
              className={`w-full ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'} text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50`}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : editingId ? <Edit3 size={16} /> : <Plus size={16} />} 
              {editingId ? 'Simpan Perubahan' : 'Tambah Pengurus'}
            </button>
          </div>
        </form>

        {/* Tabel List */}
        <div className="bg-[#0F172A] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Nama & Foto</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400">Jabatan</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 text-center">Level</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && members.length === 0 ? (
                  <tr><td colSpan={4} className="p-20 text-center text-slate-500 font-black uppercase text-xs tracking-[0.2em]">Mengambil Data Database...</td></tr>
                ) : members.map(m => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/5">
                        <img src={m.photo_url || `https://ui-avatars.com/api/?name=${m.name}&background=0D8ABC&color=fff`} className="w-full h-full object-cover" alt="" />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{m.name}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-blue-400 uppercase tracking-widest">{m.role}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${m.level === 1 ? 'bg-amber-500/10 text-amber-500' : m.level === 2 ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-500'}`}>
                        Lvl {m.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(m)} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all" title="Edit Data">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => deleteMember(m.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Hapus Data">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
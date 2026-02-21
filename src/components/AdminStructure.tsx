import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';
import { Plus, Trash2, Shield, Edit3, X, Upload, Loader2, Image as ImageIcon, Search, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Cropper from 'react-easy-crop';

// --- KOMPONEN NOTIFIKASI ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right duration-300 ${
    type === 'success' ? 'bg-[#0F172A] border-emerald-500/50 text-emerald-400' : 'bg-[#0F172A] border-red-500/50 text-red-400'
  }`}>
    {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
    <span className="text-xs font-black uppercase tracking-widest">{message}</span>
    <button onClick={onClose} className="ml-4 hover:rotate-90 transition-transform">
      <X size={14} />
    </button>
  </div>
);

export default function AdminStructure() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  // Fitur Pencarian & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fitur Crop Foto
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '', role: '', category: 'Seksi', level: 3, photo_url: ''
  });

  useEffect(() => { fetchMembers(); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from('organizational_structure').select('*').order('level', { ascending: true });
    if (data) setMembers(data);
    setLoading(false);
  };

  // --- LOGIKA CROP FOTO ---
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result as string));
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: any, clippedAreaPixels: any) => {
    setCroppedAreaPixels(clippedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      setUploading(true);
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.src = imageSrc!;
      await new Promise((resolve) => (image.onload = resolve));

      const ctx = canvas.getContext('2d');
      canvas.width = 400;
      canvas.height = 400;

      ctx?.drawImage(
        image,
        croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0, 400, 400
      );

      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9));
      const fileName = `cropped-${Date.now()}.jpg`;
      const filePath = `org-structure/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, blob);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData({ ...formData, photo_url: data.publicUrl });
      setImageSrc(null);
      setToast({ msg: 'FOTO BERHASIL DIPROSES!', type: 'success' });
    } catch (e: any) {
      setToast({ msg: 'GAGAL PROSES FOTO', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('organizational_structure').update(formData).eq('id', editingId);
        if (error) throw error;
        setToast({ msg: 'DATA BERHASIL DIPERBARUI!', type: 'success' });
        setEditingId(null);
      } else {
        const { error } = await supabase.from('organizational_structure').insert([formData]);
        if (error) throw error;
        setToast({ msg: 'PENGURUS BARU DITAMBAHKAN!', type: 'success' });
      }
      setFormData({ name: '', role: '', category: 'Seksi', level: 3, photo_url: '' });
      fetchMembers();
    } catch (err: any) {
      setToast({ msg: 'TERJADI KESALAHAN!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* --- MODAL CROPPER --- */}
      {imageSrc && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-xl aspect-square bg-[#0F172A] rounded-3xl overflow-hidden border border-white/10">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="mt-8 w-full max-w-xl space-y-4">
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-blue-600" />
            <div className="flex gap-4">
              <button onClick={() => setImageSrc(null)} className="flex-1 py-4 rounded-2xl bg-white/5 font-black uppercase text-[10px] tracking-widest">Batal</button>
              <button onClick={createCroppedImage} disabled={uploading} className="flex-1 py-4 rounded-2xl bg-blue-600 font-black uppercase text-[10px] tracking-widest flex justify-center items-center gap-2">
                {uploading ? <Loader2 className="animate-spin" size={16} /> : 'Terapkan & Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20"><Shield /></div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">{editingId ? 'Edit Mode' : 'Admin Panel'}</h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Organizational Database</p>
            </div>
          </div>
          
          {/* Bar Pencarian */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="CARI NAMA / JABATAN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0F172A] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-black tracking-widest outline-none focus:border-blue-500/50 w-full md:w-80 transition-all"
            />
          </div>
        </header>

        {/* Form Tambah/Edit */}
        <form onSubmit={handleSubmit} className={`bg-[#0F172A] p-8 rounded-[2.5rem] border transition-all duration-500 ${editingId ? 'border-amber-500/50' : 'border-white/5'} mb-10 grid grid-cols-1 md:grid-cols-3 gap-6`}>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nama Lengkap</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Jabatan</label>
            <input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Level</label>
            <select value={formData.level} onChange={e => setFormData({...formData, level: parseInt(e.target.value)})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all">
              <option value={1}>Level 1</option><option value={2}>Level 2</option><option value={3}>Level 3</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Foto (Crop & Upload)</label>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="w-full bg-[#050505] border border-dashed border-white/20 rounded-2xl px-5 py-4 text-[10px] font-black uppercase flex items-center gap-3 text-slate-400 tracking-tighter">
                  <Upload size={16} /> Pilih Foto Baru
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                {formData.photo_url ? <img src={formData.photo_url} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-600" />}
              </div>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className={`flex-1 ${editingId ? 'bg-amber-600 shadow-amber-600/20' : 'bg-blue-600 shadow-blue-600/20'} text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg`}>
              {editingId ? <Save size={16} /> : <Plus size={16} />} {editingId ? 'Update' : 'Simpan'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', role:'', category:'Seksi', level:3, photo_url:''})}} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"><X size={16}/></button>
            )}
          </div>
        </form>

        {/* Tabel */}
        <div className="bg-[#0F172A] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400">Pengurus</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400">Jabatan</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedMembers.map(m => (
                <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-5 flex items-center gap-4">
                    <img src={m.photo_url || `https://ui-avatars.com/api/?name=${m.name}`} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/5" />
                    <span className="font-bold text-sm">{m.name}</span>
                  </td>
                  <td className="px-8 py-5"><span className="text-[10px] font-black uppercase text-blue-400 tracking-widest bg-blue-500/10 px-3 py-1 rounded-lg">{m.role}</span></td>
                  <td className="px-8 py-5 text-right flex justify-center gap-2">
                    <button onClick={() => {setEditingId(m.id); setFormData(m); window.scrollTo({top:0, behavior:'smooth'})}} className="p-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"><Edit3 size={16} /></button>
                    <button onClick={async () => { if(confirm('Hapus?')) { await supabase.from('organizational_structure').delete().eq('id', m.id); fetchMembers(); setToast({msg:'DATA TERHAPUS!', type:'success'}); }}} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="p-6 bg-white/[0.02] flex items-center justify-between border-t border-white/5">
            <span className="text-[10px] font-black uppercase text-slate-500">Page {currentPage} of {totalPages || 1}</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white/5 rounded-xl disabled:opacity-30"><ChevronLeft size={18}/></button>
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white/5 rounded-xl disabled:opacity-30"><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
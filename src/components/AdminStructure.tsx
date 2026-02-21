import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';
// Memastikan semua ikon diimport dengan benar untuk mencegah ReferenceError
import { 
  Plus, Trash2, Shield, Edit3, X, Upload, Loader2, 
  Image as ImageIcon, Search, ChevronLeft, ChevronRight, 
  CheckCircle2, AlertCircle, Save 
} from 'lucide-react';
import Cropper from 'react-easy-crop';

// --- KOMPONEN NOTIFIKASI (TOAST) ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className={`fixed top-5 right-5 z-[150] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
    type === 'success' ? 'bg-[#0F172A] border-emerald-500/50 text-emerald-400' : 'bg-[#0F172A] border-red-500/50 text-red-400'
  }`}>
    {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
    <span className="text-[10px] font-black uppercase tracking-widest">{message}</span>
    <button onClick={onClose} className="ml-4 hover:opacity-70 transition-opacity">
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
  
  // State Fitur Pencarian & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State Fitur Crop Foto
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', role: '', category: 'Seksi', level: 3, photo_url: ''
  });

  useEffect(() => { 
    fetchMembers(); 
  }, []);

  useEffect(() => { 
    if (toast) { 
      const t = setTimeout(() => setToast(null), 3000); 
      return () => clearTimeout(t); 
    } 
  }, [toast]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('*')
        .order('level', { ascending: true });
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA IMAGE PROCESSING (CROP & UPLOAD) ---
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleProcessImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve) => (image.onload = resolve));

      const ctx = canvas.getContext('2d');
      canvas.width = 500;
      canvas.height = 500;

      ctx?.drawImage(
        image,
        croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0, 500, 500
      );

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
      if (!blob) throw new Error("Gagal membuat blob gambar");

      const fileName = `admin-${Date.now()}.jpg`;
      const filePath = `photos/${fileName}`;

      const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, blob);
      if (upErr) throw upErr;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, photo_url: data.publicUrl }));
      setImageSrc(null);
      setToast({ msg: 'FOTO BERHASIL DIPROSES', type: 'success' });
    } catch (err: any) {
      setToast({ msg: 'GAGAL UPLOAD FOTO', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // --- LOGIKA CRUD ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('organizational_structure')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
        setToast({ msg: 'DATA BERHASIL DIPERBARUI!', type: 'success' });
        setEditingId(null);
      } else {
        const { error } = await supabase.from('organizational_structure').insert([formData]);
        if (error) throw error;
        setToast({ msg: 'PENGURUS BERHASIL DITAMBAHKAN!', type: 'success' });
      }
      setFormData({ name: '', role: '', category: 'Seksi', level: 3, photo_url: '' });
      fetchMembers();
    } catch (err) {
      setToast({ msg: 'TERJADI KESALAHAN SISTEM', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setFormData({
      name: m.name || '',
      role: m.role || '',
      category: m.category || 'Seksi',
      level: m.level || 3,
      photo_url: m.photo_url || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filtered = members.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* --- MODAL CROPPER --- */}
      {imageSrc && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-xl aspect-square bg-[#0F172A] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
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
          <div className="mt-8 w-full max-w-xl space-y-6 bg-[#0F172A] p-6 rounded-3xl border border-white/5">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400">Atur Skala Foto</p>
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setImageSrc(null)} className="flex-1 py-4 rounded-2xl bg-white/5 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">Batal</button>
              <button onClick={handleProcessImage} disabled={uploading} className="flex-1 py-4 rounded-2xl bg-blue-600 font-black uppercase text-[10px] tracking-widest flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                {uploading ? <Loader2 className="animate-spin" size={16} /> : 'Terapkan & Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20"><Shield className="text-white" /></div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                {editingId ? 'Edit Pengurus' : 'Admin Panel'}
              </h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Organizational Database</p>
            </div>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="CARI NAMA / JABATAN..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-[#0F172A] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-black tracking-widest outline-none focus:border-blue-500/50 w-full md:w-80 transition-all shadow-inner"
            />
          </div>
        </header>

        {/* --- FORM SECTION --- */}
        <form onSubmit={handleSubmit} className={`bg-[#0F172A] p-8 rounded-[2.5rem] border transition-all duration-500 ${editingId ? 'border-amber-500/50 shadow-2xl shadow-amber-500/10' : 'border-white/5 shadow-xl'} mb-10 grid grid-cols-1 md:grid-cols-3 gap-6`}>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Nama Lengkap</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-slate-700" placeholder="Contoh: Budi Santoso" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Jabatan</label>
            <input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all" placeholder="Ketua / Sekretaris" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Level Hierarki</label>
            <select value={formData.level} onChange={e => setFormData({...formData, level: parseInt(e.target.value)})} className="w-full bg-[#050505] border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
              <option value={1}>Level 1 (Penasehat)</option>
              <option value={2}>Level 2 (Inti)</option>
              <option value={3}>Level 3 (Seksi/Anggota)</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Foto Profil (Presisi 1:1)</label>
            <div className="flex gap-4">
              <div className="flex-1 relative group">
                <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="w-full h-full bg-[#050505] border border-dashed border-white/20 rounded-2xl px-5 py-4 text-[10px] font-black uppercase flex items-center gap-3 text-slate-400 group-hover:border-blue-500/50 transition-all tracking-tighter">
                  <Upload size={16} /> {formData.photo_url ? 'Ganti Foto Pengurus' : 'Klik Untuk Pilih File'}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                {formData.photo_url ? <img src={formData.photo_url} className="w-full h-full object-cover" alt="Avatar" /> : <ImageIcon className="text-slate-700" />}
              </div>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" disabled={loading} className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${editingId ? 'bg-amber-600 text-white shadow-amber-600/20' : 'bg-blue-600 text-white shadow-blue-600/20'}`}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : (editingId ? <Save size={16} /> : <Plus size={16} />)}
              {editingId ? 'Update Data' : 'Simpan Data'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', role:'', category:'Seksi', level:3, photo_url:''})}} className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all active:scale-90"><X size={18}/></button>
            )}
          </div>
        </form>

        {/* --- TABLE LIST SECTION --- */}
        <div className="bg-[#0F172A] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">Profil Pengurus</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">Jabatan</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 text-center">Hierarki</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && currentItems.length === 0 ? (
                  <tr><td colSpan={4} className="py-20 text-center text-slate-600 text-[10px] font-black uppercase animate-pulse">Memuat Data...</td></tr>
                ) : currentItems.map(m => (
                  <tr key={m.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white/5 group-hover:ring-blue-500/30 transition-all duration-500">
                        <img 
                          src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0D8ABC&color=fff`} 
                          className="w-full h-full object-cover" 
                          alt={m.name} 
                        />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{m.name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/10">
                        {m.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className={`text-[9px] font-black px-2 py-1 rounded-full inline-block ${m.level === 1 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-400'}`}>
                        LVL {m.level}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right flex justify-end gap-2">
                      <button onClick={() => startEdit(m)} className="p-3 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all active:scale-90" title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={async () => { if(confirm(`Hapus ${m.name}?`)) { await supabase.from('organizational_structure').delete().eq('id', m.id); fetchMembers(); setToast({msg:'DATA BERHASIL DIHAPUS!', type:'success'}); }}} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION CONTROLS --- */}
          {totalPages > 1 && (
            <div className="p-6 bg-white/[0.02] flex items-center justify-between border-t border-white/5">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">
                Halaman {currentPage} Dari {totalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  className="p-3 bg-white/5 rounded-xl disabled:opacity-20 hover:bg-white/10 transition-all border border-white/5 active:scale-90"
                >
                  <ChevronLeft size={18}/>
                </button>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  className="p-3 bg-white/5 rounded-xl disabled:opacity-20 hover:bg-white/10 transition-all border border-white/5 active:scale-90"
                >
                  <ChevronRight size={18}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
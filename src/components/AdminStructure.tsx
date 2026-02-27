import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';
import { 
  Plus, Trash2, Shield, Edit3, X, Upload, Loader2, 
  Image as ImageIcon, Search, ChevronLeft, ChevronRight, 
  CheckCircle2, AlertCircle, Save, GripVertical, Eye,
  Award, ShieldCheck, Users, ChevronDown, Crown
} from 'lucide-react';
import Cropper from 'react-easy-crop';

// --- IMPORT LIBRARY DND-KIT ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- KOMPONEN NOTIFIKASI (TOAST) ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className={`fixed top-5 right-5 z-[250] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
    type === 'success' ? 'bg-[#0F172A] border-emerald-500/50 text-emerald-400' : 'bg-[#0F172A] border-red-500/50 text-red-400'
  }`}>
    {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
    <span className="text-[10px] font-black uppercase tracking-widest">{message}</span>
    <button onClick={onClose} className="ml-4 hover:opacity-70 transition-opacity">
      <X size={14} />
    </button>
  </div>
);

// --- KOMPONEN SORTABLE ITEM UNTUK LIST ---
function SortableMemberRow({ member, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 100 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 mb-2 rounded-2xl border ${isDragging ? 'bg-blue-600/20 border-blue-500 shadow-2xl' : 'bg-white/5 border-white/5'} group transition-all`}>
      <button {...attributes} {...listeners} className="p-2 text-slate-600 hover:text-white cursor-grab active:cursor-grabbing">
        <GripVertical size={16} />
      </button>
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0">
        <img src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[11px] font-black uppercase italic truncate">{member.name}</h4>
        <p className="text-[9px] text-blue-400 font-bold uppercase tracking-tighter">{member.role}</p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(member)} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg"><Edit3 size={14} /></button>
        <button onClick={() => onDelete(member)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

export default function AdminStructure() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', role: '', category: 'Seksi', level: 1, photo_url: ''
  });

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => { fetchMembers(); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('*')
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: any, pixels: any) => { setCroppedAreaPixels(pixels); }, []);

  const handleProcessImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.src = imageSrc;
      await new Promise((resolve) => (image.onload = resolve));
      const ctx = canvas.getContext('2d');
      canvas.width = 500; canvas.height = 500;
      ctx?.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, 500, 500);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
      if (!blob) throw new Error("Gagal membuat blob");
      const fileName = `admin-${Date.now()}.jpg`;
      const filePath = `photos/${fileName}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, blob);
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, photo_url: data.publicUrl }));
      setImageSrc(null);
      setToast({ msg: 'FOTO BERHASIL DIPROSES', type: 'success' });
    } catch (err) { setToast({ msg: 'GAGAL UPLOAD FOTO', type: 'error' }); } finally { setUploading(false); }
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
        const { error } = await supabase.from('organizational_structure').insert([{...formData, sort_order: members.length}]);
        if (error) throw error;
        setToast({ msg: 'PENGURUS BERHASIL DITAMBAHKAN!', type: 'success' });
      }
      setFormData({ name: '', role: '', category: 'Seksi', level: 1, photo_url: '' });
      fetchMembers();
    } catch (err) { setToast({ msg: 'TERJADI KESALAHAN SISTEM', type: 'error' }); } finally { setLoading(false); }
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setFormData({ name: m.name, role: m.role, category: m.category, level: m.level, photo_url: m.photo_url });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMembers((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const saveNewOrder = async () => {
    setIsSavingOrder(true);
    try {
      const updates = members.map((m, index) => ({ 
        id: m.id, 
        sort_order: index, 
        name: m.name, 
        level: m.level, 
        role: m.role, 
        category: m.category,
        photo_url: m.photo_url
      }));
      const { error } = await supabase.from('organizational_structure').upsert(updates);
      if (error) throw error;
      setToast({ msg: 'URUTAN BERHASIL DIPUBLIKASIKAN!', type: 'success' });
    } catch (err) { setToast({ msg: 'GAGAL MENYIMPAN URUTAN', type: 'error' }); } finally { setIsSavingOrder(false); }
  };

  const filtered = members.filter(m => m.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#050505] text-white font-sans overflow-hidden">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* --- MODAL CROPPER --- */}
      {imageSrc && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-lg aspect-square bg-[#0F172A] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
          </div>
          <div className="mt-8 w-full max-w-lg space-y-6 bg-[#0F172A] p-6 rounded-3xl border border-white/5">
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-blue-600" />
            <div className="flex gap-4">
              <button onClick={() => setImageSrc(null)} className="flex-1 py-4 rounded-2xl bg-white/5 font-black uppercase text-[10px] tracking-widest">Batal</button>
              <button onClick={handleProcessImage} disabled={uploading} className="flex-1 py-4 rounded-2xl bg-blue-600 font-black uppercase text-[10px] tracking-widest flex justify-center items-center gap-2">
                {uploading ? <Loader2 className="animate-spin" size={16} /> : 'Terapkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PANEL KIRI: EDITOR --- */}
      <div className="w-full lg:w-[450px] h-screen overflow-y-auto border-r border-white/5 bg-[#0A0A0A] p-6">
        <header className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><Shield size={20} /></div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter">Structure Editor</h1>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">PB US 162 Database</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 mb-10 p-6 bg-[#0F172A] rounded-3xl border border-white/5 shadow-xl">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Nama Lengkap</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Jabatan</label>
              <input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Hierarki</label>
              <select value={formData.level} onChange={e => setFormData({...formData, level: parseInt(e.target.value)})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-xs outline-none">
                <option value={1}>Penanggung Jawab (Lvl 1)</option>
                <option value={2}>Penasehat (Lvl 2)</option>
                <option value={3}>Pembina (Lvl 3)</option>
                <option value={4}>Inti / Seksi (Lvl 4)</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-500 ml-1">Foto Profil</label>
            <div className="flex gap-3">
              <div className="flex-1 relative group h-12">
                <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="w-full h-full bg-[#050505] border border-dashed border-white/20 rounded-xl flex items-center justify-center text-[9px] font-black uppercase text-slate-500">
                  <Upload size={14} className="mr-2" /> Upload
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                {formData.photo_url ? <img src={formData.photo_url} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto text-slate-700 mt-3" size={18}/>}
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex justify-center items-center gap-2 ${editingId ? 'bg-amber-600' : 'bg-blue-600'}`}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : (editingId ? 'Update Data' : 'Tambah Pengurus')}
          </button>
          {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', role:'', category:'Seksi', level:1, photo_url:''})}} className="w-full text-[9px] font-black uppercase text-red-500">Batalkan Edit</button>}
        </form>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Urutan Tampil</h3>
             <button onClick={saveNewOrder} disabled={isSavingOrder} className="px-4 py-2 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all">
                {isSavingOrder ? <Loader2 className="animate-spin" size={12}/> : 'Publish Urutan'}
             </button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
            <input placeholder="CARI NAMA..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-[10px] uppercase font-black outline-none focus:border-blue-500/50" />
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
              {filtered.map(m => (
                <SortableMemberRow key={m.id} member={m} onEdit={startEdit} onDelete={async (member: any) => { if(confirm(`Hapus ${member.name}?`)) { await supabase.from('organizational_structure').delete().eq('id', member.id); fetchMembers(); setToast({msg:'DIHAPUS!', type:'success'}); }}} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* --- PANEL KANAN: LIVE PREVIEW (URUTAN SESUAI LANDING PAGE) --- */}
      <div className="flex-1 h-screen overflow-y-auto bg-[#FBFCFE] relative">
        <div className="sticky top-0 z-50 p-4 flex justify-center pointer-events-none">
           <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full border border-slate-200 shadow-xl flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Eye size={12}/> Live Preview Mode
              </span>
           </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-32 pt-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter mb-4 uppercase">
              Struktur <span className="text-blue-600">Organisasi</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">PB US 162 • Periode 2024 - 2028</p>
          </div>

          <div className="relative">
            {/* 1. PENANGGUNG JAWAB (LEVEL 1) */}
            <div className="relative z-10 mb-16 flex flex-col items-center">
              {members.filter(m => m.level === 1).map(m => (
                <div key={m.id} className="bg-white p-6 rounded-[2.5rem] shadow-2xl border-2 border-amber-100 text-center w-64 animate-in fade-in zoom-in duration-700">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-3xl overflow-hidden border-4 border-amber-50 shadow-md">
                    <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-black text-slate-900 text-[12px] italic uppercase">{m.name}</h3>
                  <div className="mt-2 inline-block px-3 py-1 bg-amber-500 rounded-lg shadow-sm">
                    <p className="text-white font-black text-[8px] uppercase">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. JAJARAN PENASEHAT (LEVEL 2) */}
            <div className="relative z-10 mb-16">
              <div className="text-center mb-8">
                <span className="px-4 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-200">Jajaran Penasehat</span>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {members.filter(m => m.level === 2).map(m => (
                  <div key={m.id} className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-blue-50 text-center w-52">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm">
                      <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-black text-slate-900 text-[10px] italic uppercase">{m.name}</h3>
                    <p className="text-blue-600 font-black text-[8px] uppercase mt-1">{m.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. JAJARAN PEMBINA (LEVEL 3) */}
            <div className="relative z-10 mb-16">
              <div className="text-center mb-8">
                <span className="px-4 py-1 bg-blue-50 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-full border border-blue-100">Jajaran Pembina</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-10">
                {members.filter(m => m.level === 3).map(m => (
                  <div key={m.id} className="bg-white p-5 rounded-[2.5rem] shadow-lg border border-slate-100 text-center">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-3xl overflow-hidden border-2 border-blue-50 shadow-md">
                      <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-black text-slate-900 text-[10px] italic uppercase tracking-tighter">{m.name}</h3>
                    <p className="text-blue-600 font-black text-[8px] uppercase mt-1">{m.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. INTI & SEKSI (LEVEL 4) */}
            <div className="relative z-10">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-10">
                 {members.filter(m => m.level === 4).map(m => (
                   <div key={m.id} className="bg-white p-4 rounded-3xl shadow-md border border-slate-50 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border shrink-0">
                        <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-black text-slate-900 text-[10px] uppercase italic">{m.name}</h4>
                        <p className="text-blue-600 font-bold text-[8px] uppercase tracking-wider">{m.role}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
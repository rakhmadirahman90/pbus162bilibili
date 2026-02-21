import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Plus, Trash2, Save, Upload, UserPlus, X, ZoomIn, ZoomOut, Camera } from 'lucide-react';
import AvatarEditor from 'react-avatar-editor';

export default function AdminStructure() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // State untuk Form
  const [formData, setFormData] = useState({
    name: '', role: '', category: 'Seksi', level: 3, photo_url: ''
  });

  // State untuk Image Editor
  const [image, setImage] = useState<File | null>(null);
  const [editorModal, setEditorModal] = useState(false);
  const [scale, setScale] = useState(1.2);
  const editorRef = useRef<AvatarEditor>(null);

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    const { data } = await supabase.from('organizational_structure').select('*').order('level');
    if (data) setMembers(data);
    setLoading(false);
  }

  // Fungsi Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
      setEditorModal(true);
    }
  };

  // Fungsi Upload Foto ke Storage & Ambil URL
  const handleSaveImage = async () => {
    if (editorRef.current && image) {
      try {
        setUploading(true);
        const canvas = editorRef.current.getImageScaledToCanvas();
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        
        if (!blob) return;

        const fileName = `member-${Date.now()}.jpg`;
        const { data, error } = await supabase.storage
          .from('avatars') // Pastikan bucket 'avatars' sudah ada di Supabase
          .upload(fileName, blob);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        
        setFormData({ ...formData, photo_url: publicUrl });
        setEditorModal(false);
        setImage(null);
      } catch (error: any) {
        alert("Gagal upload: " + error.message);
      } finally {
        setUploading(false);
      }
    }
  };

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
            <h1 className="text-3xl font-bold italic tracking-tighter">Kelola Organisasi</h1>
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
              
              {/* Preview & Upload Area */}
              <div className="mb-6 flex flex-col items-center">
                <div className="relative group w-24 h-24 mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 overflow-hidden flex items-center justify-center">
                    {formData.photo_url ? (
                      <img src={formData.photo_url} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <Camera className="text-slate-600" size={32} />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                    <Upload size={20} className="text-white" />
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Klik untuk upload foto</p>
              </div>

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
                <button 
                  disabled={uploading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                >
                  <Plus size={18} /> {uploading ? 'Mengunggah...' : 'Simpan ke Database'}
                </button>
              </div>
            </form>
          </div>

          {/* DAFTAR ANGGOTA */}
          <div className="lg:col-span-2 space-y-3">
            {members.map((m: any) => (
              <div key={m.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-blue-500/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                    <img src={m.photo_url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                  </div>
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

      {/* MODAL EDITOR GAMBAR */}
      {editorModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 w-full max-w-md text-center">
            <h3 className="text-xl font-black italic uppercase mb-6 flex items-center justify-center gap-3">
              <Camera className="text-blue-500" /> Sesuaikan Foto
            </h3>
            
            <div className="flex justify-center mb-6 overflow-hidden rounded-2xl bg-slate-800">
              <AvatarEditor
                ref={editorRef}
                image={image!}
                width={250}
                height={250}
                border={20}
                borderRadius={20}
                color={[15, 23, 42, 0.8]} 
                scale={scale}
                rotate={0}
              />
            </div>

            <div className="flex items-center gap-4 mb-8 bg-slate-800 p-4 rounded-2xl">
              <ZoomOut size={20} className="text-slate-400" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <ZoomIn size={20} className="text-slate-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setEditorModal(false)}
                className="py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveImage}
                className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
              >
                Gunakan Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
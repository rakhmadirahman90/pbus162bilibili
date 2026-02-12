import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Trash2, 
  RefreshCcw, 
  Search, 
  Phone, 
  MapPin, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  X,
  Save,
  User,
  Camera,
  Loader2,
  Users
} from 'lucide-react';

interface Registrant {
  id: string;
  created_at: string;
  nama: string;
  whatsapp: string;
  kategori: string;
  domisili: string;
  pengalaman: string;
  foto_url: string;
}

export default function ManajemenPendaftaran() {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Registrant | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRegistrants(data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('pendaftaran_changes')
      .on('postgres_changes', { event: '*', table: 'pendaftaran', schema: 'public' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') setRegistrants((prev) => [payload.new as Registrant, ...prev]);
          else if (payload.eventType === 'UPDATE') setRegistrants((prev) => prev.map((item) => item.id === payload.new.id ? (payload.new as Registrant) : item));
          else if (payload.eventType === 'DELETE') setRegistrants((prev) => prev.filter((item) => item.id !== payload.old.id));
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredData = registrants.filter(item => 
    item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.domisili?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const deleteOldFile = async (url: string) => {
    if (!url || !url.includes('atlet-photos/')) return;
    const fileName = url.split('atlet-photos/').pop();
    if (fileName) await supabase.storage.from('pendaftaran').remove([`atlet-photos/${fileName}`]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !editingItem) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `atlet-photos/${editingItem.id}-${Date.now()}.${fileExt}`;
    setUploading(true);
    try {
      if (editingItem.foto_url) await deleteOldFile(editingItem.foto_url);
      await supabase.storage.from('pendaftaran').upload(filePath, file);
      const { data: { publicUrl } } = supabase.storage.from('pendaftaran').getPublicUrl(filePath);
      setEditingItem({ ...editingItem, foto_url: publicUrl });
    } catch (error: any) { alert(error.message); } 
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string, nama: string, foto_url: string) => {
    if (window.confirm(`Hapus data ${nama}?`)) {
      try {
        if (foto_url) await deleteOldFile(foto_url);
        const { error } = await supabase.from('pendaftaran').delete().eq('id', id);
        if (error) throw error;
      } catch (error: any) { alert('Gagal menghapus: ' + error.message); }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').update({
        nama: editingItem.nama,
        whatsapp: editingItem.whatsapp,
        domisili: editingItem.domisili,
        kategori: editingItem.kategori,
        foto_url: editingItem.foto_url
      }).eq('id', editingItem.id);
      if (error) throw error;
      setIsEditModalOpen(false);
    } catch (error: any) { alert(error.message); } 
    finally { setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      <div className="max-w-[1400px] mx-auto px-4 py-10 md:px-8">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <Users className="text-white" size={24} />
              </div>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em]">Sistem Administrasi</h2>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase italic">
              Database <span className="text-blue-600">Atlet</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md">Kelola data pendaftaran dengan efisien dan real-time.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-6 py-3 bg-white border-2 border-blue-50 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 text-center">Total Terdaftar</p>
              <p className="text-2xl font-black text-blue-600 leading-none text-center">{filteredData.length}</p>
            </div>
            <button 
              onClick={fetchData} 
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
            >
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
              REFRESH
            </button>
          </div>
        </header>

        {/* SEARCH BAR */}
        <section className="mb-10 group">
          <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-slate-100 shadow-lg transition-all focus-within:border-blue-500">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            <input 
              type="text"
              placeholder="Cari nama atau kota..."
              className="w-full pl-16 pr-8 py-6 bg-transparent outline-none font-bold text-lg placeholder:text-slate-300"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </section>

        {/* TABLE SECTION - IMPROVED COLORS */}
        <section className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-2xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="pl-8 pr-4 py-6 font-bold uppercase text-[11px] tracking-widest w-20 text-center">No</th>
                  <th className="px-8 py-6 font-bold uppercase text-[11px] tracking-widest">Profil Atlet</th>
                  <th className="px-8 py-6 font-bold uppercase text-[11px] tracking-widest">Kategori</th>
                  <th className="px-8 py-6 font-bold uppercase text-[11px] tracking-widest text-center">WhatsApp</th>
                  <th className="px-8 py-6 font-bold uppercase text-[11px] tracking-widest">Domisili</th>
                  <th className="px-8 py-6 font-bold uppercase text-[11px] tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && registrants.length === 0 ? (
                  <tr><td colSpan={6} className="py-32 text-center text-slate-400 font-bold uppercase animate-pulse">Memuat Data...</td></tr>
                ) : currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 even:bg-slate-50/30 transition-all duration-200 group">
                    <td className="pl-8 pr-4 py-6 text-center">
                      <span className="text-sm font-black text-slate-400 group-hover:text-blue-600">
                        {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                      </span>
                    </td>
                    
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div 
                          onClick={() => item.foto_url && setPreviewImage(item.foto_url)}
                          className="w-12 h-12 rounded-xl bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex-shrink-0 cursor-zoom-in"
                        >
                          {item.foto_url ? (
                            <img src={item.foto_url} className="w-full h-full object-cover" alt={item.nama} />
                          ) : (
                            <User className="m-auto mt-2 text-slate-400" size={24} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 text-base uppercase leading-tight">{item.nama}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {item.id.slice(0,8)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span className="inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase italic shadow-md shadow-blue-100">
                        {item.kategori}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <a 
                          href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 font-black text-slate-700 hover:text-green-600 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-sm"
                        >
                          <Phone size={14} className="text-green-500" />
                          <span className="text-xs">{item.whatsapp}</span>
                        </a>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 font-bold text-slate-600 uppercase text-xs">
                        <MapPin size={14} className="text-rose-500" />
                        {item.domisili}
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id, item.nama, item.foto_url)}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PAGINATION */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 px-8 py-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Halaman {currentPage} Dari {totalPages || 1}</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white/10 rounded-xl disabled:opacity-20 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
               {[...Array(totalPages)].map((_, i) => (
                 <button 
                  key={i} 
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-white/60'}`}
                 >
                   {i + 1}
                 </button>
               ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 bg-white/10 rounded-xl disabled:opacity-20 hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </footer>
      </div>

      {/* MODAL EDIT - KEEP PREVIOUS LOGIC */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Edit Atlet</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-2xl text-slate-400 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleUpdate} className="p-10 space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden relative">
                    {editingItem.foto_url ? <img src={editingItem.foto_url} className="w-full h-full object-cover" /> : <User size={40} className="m-auto mt-8 text-slate-200" />}
                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-slate-900 transition-all">
                    <Camera size={18} />
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nama Lengkap</label>
                    <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase focus:border-blue-600 outline-none" value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} required />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">WhatsApp</label>
                  <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={editingItem.whatsapp} onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kategori</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={editingItem.kategori} onChange={e => setEditingItem({...editingItem, kategori: e.target.value})}>
                    {["Pra Dini (U-9)", "Dini (U-11)", "Anak (U-13)", "Pemula (U-15)", "Remaja (U-17)", "Taruna (U-19)", "Dewasa / Umum"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Domisili</label>
                  <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase" value={editingItem.domisili} onChange={e => setEditingItem({...editingItem, domisili: e.target.value})} required />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="submit" disabled={isSaving || uploading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl w-full animate-in zoom-in">
            <img src={previewImage} className="w-full h-auto rounded-[3rem] border-4 border-white/20 shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
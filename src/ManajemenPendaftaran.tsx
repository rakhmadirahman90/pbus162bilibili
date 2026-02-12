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
  ExternalLink,
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

  // Filter & Pagination Logic
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      <div className="max-w-[1400px] mx-auto px-4 py-10 md:px-8">
        
        {/* TOP BAR / HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <Users className="text-white" size={24} />
              </div>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em]">Management System</h2>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase italic">
              Database <span className="text-blue-600">Atlet</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-md">Kelola informasi pendaftaran, kategori atlet, dan dokumentasi secara real-time.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Terdaftar</p>
              <p className="text-xl font-black text-slate-900 leading-none">{filteredData.length} <span className="text-xs text-slate-400 font-normal uppercase ml-1">Orang</span></p>
            </div>
            <button 
              onClick={fetchData} 
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-xs tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
              SYNC DATA
            </button>
          </div>
        </header>

        {/* SEARCH BAR SECTION */}
        <section className="mb-10 group">
          <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-slate-100/50 transition-all focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
            <input 
              type="text"
              placeholder="Cari atlet berdasarkan nama atau domisili..."
              className="w-full pl-16 pr-8 py-6 bg-transparent outline-none font-semibold text-lg placeholder:text-slate-300"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </section>

        {/* DATA TABLE SECTION */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 font-bold uppercase text-[11px] text-slate-400 tracking-widest">Profil Atlet</th>
                  <th className="px-8 py-6 font-bold uppercase text-[11px] text-slate-400 tracking-widest">Kategori</th>
                  <th className="px-8 py-6 font-bold uppercase text-[11px] text-slate-400 tracking-widest">Informasi Kontak</th>
                  <th className="px-8 py-6 font-bold uppercase text-[11px] text-slate-400 tracking-widest">Asal Daerah</th>
                  <th className="px-8 py-6 font-bold uppercase text-[11px] text-slate-400 tracking-widest text-right">Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading && registrants.length === 0 ? (
                  <tr><td colSpan={5} className="py-32 text-center text-slate-400 font-bold uppercase tracking-[0.3em] animate-pulse">Memuat Data...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan={5} className="py-32 text-center text-slate-400 font-bold uppercase tracking-[0.2em]">Data Tidak Ditemukan</td></tr>
                ) : currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-all duration-300 group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div 
                          onClick={() => item.foto_url && setPreviewImage(item.foto_url)}
                          className="relative w-16 h-16 rounded-[1.25rem] bg-slate-100 border-2 border-white shadow-md overflow-hidden flex-shrink-0 cursor-zoom-in group-hover:scale-105 transition-transform"
                        >
                          {item.foto_url ? (
                            <img src={item.foto_url} className="w-full h-full object-cover" alt={item.nama} />
                          ) : (
                            <User className="m-auto mt-4 text-slate-300" size={32} />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors uppercase">{item.nama}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            <Calendar size={13} className="text-slate-300" />
                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center bg-white border border-slate-200 text-slate-700 px-4 py-1.5 rounded-full text-[11px] font-black uppercase italic tracking-wider shadow-sm">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <a 
                        href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`} 
                        target="_blank" 
                        className="flex items-center gap-2 font-bold text-slate-700 hover:text-green-600 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                          <Phone size={14} />
                        </div>
                        <span className="text-[13px]">{item.whatsapp}</span>
                      </a>
                    </td>
                    <td className="px-8 py-6 text-sm">
                      <div className="flex items-center gap-2 font-bold text-slate-500 uppercase italic">
                        <MapPin size={16} className="text-rose-400" />
                        {item.domisili}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }}
                          className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => { if(window.confirm(`Hapus ${item.nama}?`)) fetchData(); /* Simplified for example */ }}
                          className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-rose-600 hover:border-rose-200 hover:shadow-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PAGINATION COMPONENT */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 px-8 py-6 bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Halaman {currentPage} Dari {totalPages || 1}</p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1 px-4">
               {[...Array(totalPages)].map((_, i) => (
                 <button 
                  key={i} 
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}
                 >
                   {i + 1}
                 </button>
               ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-3 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </footer>
      </div>

      {/* MODAL EDIT - PREMIUM GLASSMORPHISM */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Edit Profil Atlet</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {editingItem.id.split('-')[0]}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 border-4 border-white shadow-2xl overflow-hidden relative">
                    {editingItem.foto_url ? <img src={editingItem.foto_url} className="w-full h-full object-cover" /> : <User size={60} className="m-auto mt-10 text-slate-200" />}
                    {uploading && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-4 bg-blue-600 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-slate-900 transition-all hover:scale-110">
                    <Camera size={20} />
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <div className="flex-1 space-y-6 w-full">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Nama Lengkap</label>
                      <input 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none uppercase transition-all"
                        value={editingItem.nama}
                        onChange={e => setEditingItem({...editingItem, nama: e.target.value})}
                      />
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">WhatsApp</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={editingItem.whatsapp} onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Kategori</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold appearance-none" value={editingItem.kategori} onChange={e => setEditingItem({...editingItem, kategori: e.target.value})}>
                    {["Pra Dini (U-9)", "Dini (U-11)", "Anak (U-13)", "Pemula (U-15)", "Remaja (U-17)", "Taruna (U-19)", "Dewasa / Umum"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Domisili (Kota/Kabupaten)</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase" value={editingItem.domisili} onChange={e => setEditingItem({...editingItem, domisili: e.target.value})} />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="submit" disabled={isSaving} className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl w-full animate-in zoom-in duration-300">
            <img src={previewImage} className="w-full h-auto rounded-[3rem] shadow-2xl border-4 border-white/20" alt="Preview" />
            <button className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold uppercase text-xs tracking-widest"><X size={20}/> Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
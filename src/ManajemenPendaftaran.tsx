import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Trash2, 
  RefreshCcw, 
  Search, 
  Phone, 
  MapPin, 
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
  
  // Menambah jumlah item per halaman agar pas dengan layar (6-8 biasanya ideal)
  const itemsPerPage = 8; 

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Container dikurangi padding vertikalnya (py-10 -> py-4) */}
      <div className="max-w-[1400px] mx-auto px-4 py-4 md:px-8">
        
        {/* HEADER - Dibuat lebih ringkas */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md shadow-blue-100">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase italic leading-none">
                Database <span className="text-blue-600">Atlet</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sistem Administrasi Real-time</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center">
              <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">Total</span>
              <span className="text-lg font-black text-blue-600 leading-none">{filteredData.length}</span>
            </div>
            <button 
              onClick={fetchData} 
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] tracking-widest hover:bg-blue-600 transition-all active:scale-95"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
              REFRESH
            </button>
          </div>
        </header>

        {/* SEARCH BAR - Dibuat lebih tipis (py-6 -> py-3) */}
        <section className="mb-4">
          <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm transition-all focus-within:border-blue-500">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Cari nama atau kota..."
              className="w-full pl-12 pr-6 py-3 bg-transparent outline-none font-bold text-sm placeholder:text-slate-300"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </section>

        {/* TABLE SECTION - Compact Padding (py-6 -> py-2) */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="pl-6 pr-2 py-3 font-bold uppercase text-[10px] tracking-widest w-12 text-center">No</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Profil Atlet</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Kategori</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest text-center">WhatsApp</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Domisili</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading && registrants.length === 0 ? (
                  <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase text-xs">Memuat Data...</td></tr>
                ) : currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 even:bg-slate-50/20 transition-all duration-150 group">
                    <td className="pl-6 pr-2 py-2 text-center">
                      <span className="text-xs font-black text-slate-400 group-hover:text-blue-600">
                        {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                      </span>
                    </td>
                    
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => item.foto_url && setPreviewImage(item.foto_url)}
                          className="w-10 h-10 rounded-lg bg-slate-200 border border-white shadow-sm overflow-hidden flex-shrink-0 cursor-zoom-in"
                        >
                          {item.foto_url ? (
                            <img src={item.foto_url} className="w-full h-full object-cover" alt={item.nama} />
                          ) : (
                            <User className="m-auto mt-1.5 text-slate-400" size={18} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs uppercase leading-tight">{item.nama}</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">ID: {item.id.slice(0,6)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2">
                      <span className="inline-flex items-center bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase italic shadow-sm">
                        {item.kategori}
                      </span>
                    </td>

                    <td className="px-4 py-2 text-center">
                      <a 
                        href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-green-600 bg-white border border-slate-100 px-3 py-1 rounded-lg transition-all text-[11px]"
                      >
                        <Phone size={12} className="text-green-500" />
                        {item.whatsapp}
                      </a>
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-600 uppercase text-[10px]">
                        <MapPin size={12} className="text-rose-500" />
                        {item.domisili}
                      </div>
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id, item.nama, item.foto_url)}
                          className="p-1.5 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-600 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PAGINATION - Diperkecil (py-6 -> py-3) */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-3 bg-slate-900 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Halaman {currentPage} Dari {totalPages || 1}</p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-white/10 rounded-lg disabled:opacity-20 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1.5">
               {[...Array(totalPages)].map((_, i) => (
                 <button 
                  key={i} 
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white/5 hover:bg-white/10 text-white/60'}`}
                 >
                   {i + 1}
                 </button>
               ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 bg-white/10 rounded-lg disabled:opacity-20 hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </div>

      {/* MODAL EDIT - Layout Dioptimalkan */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Edit Atlet</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-colors"><X size={18}/></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="flex items-center gap-6 mb-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-white shadow-md overflow-hidden flex-shrink-0">
                    {editingItem.foto_url ? <img src={editingItem.foto_url} className="w-full h-full object-cover" /> : <User size={30} className="m-auto mt-4 text-slate-200" />}
                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={20} /></div>}
                  </div>
                  <label className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-lg shadow-lg cursor-pointer hover:bg-slate-900 transition-all">
                    <Camera size={14} />
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Nama Lengkap</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-sm focus:border-blue-600 outline-none" value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">WhatsApp</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={editingItem.whatsapp} onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Kategori</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={editingItem.kategori} onChange={e => setEditingItem({...editingItem, kategori: e.target.value})}>
                    {["Pra Dini (U-9)", "Dini (U-11)", "Anak (U-13)", "Pemula (U-15)", "Remaja (U-17)", "Taruna (U-19)", "Dewasa / Umum"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Domisili</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-sm" value={editingItem.domisili} onChange={e => setEditingItem({...editingItem, domisili: e.target.value})} required />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSaving || uploading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-lg w-full">
            <img src={previewImage} className="w-full h-auto rounded-3xl border-4 border-white shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
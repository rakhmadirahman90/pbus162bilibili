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
  Loader2
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
  const itemsPerPage = 5;

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrants(data || []);
      setCurrentPage(1);
    } catch (error: any) {
      alert('Gagal mengambil data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // FUNGSI UNTUK MENGHAPUS FOTO LAMA DARI STORAGE
  const deleteOldFile = async (url: string) => {
    if (!url || !url.includes('atlet-photos/')) return;
    try {
      // Ekstrak nama file dari URL publik Supabase
      const fileName = url.split('atlet-photos/').pop();
      if (fileName) {
        await supabase.storage
          .from('pendaftaran')
          .remove([`atlet-photos/${fileName}`]);
      }
    } catch (err) {
      console.error("Gagal menghapus file lama:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingItem) return;
    
    const file = e.target.files[0];
    
    // Validasi Tipe & Ukuran (Opsional tapi disarankan)
    if (!file.type.startsWith('image/')) return alert("File harus berupa gambar!");
    if (file.size > 2 * 1024 * 1024) return alert("Ukuran maksimal 2MB!");

    const fileExt = file.name.split('.').pop();
    const fileName = `${editingItem.id}-${Date.now()}.${fileExt}`; // Menggunakan Date.now agar lebih unik
    const filePath = `atlet-photos/${fileName}`;

    setUploading(true);

    try {
      // 1. Jika ada foto lama, hapus dari storage (Cleanup)
      if (editingItem.foto_url) {
        await deleteOldFile(editingItem.foto_url);
      }

      // 2. Upload foto baru
      const { error: uploadError } = await supabase.storage
        .from('pendaftaran')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Ambil URL Publik baru
      const { data: { publicUrl } } = supabase.storage
        .from('pendaftaran')
        .getPublicUrl(filePath);

      // 4. Update state local
      setEditingItem({ ...editingItem, foto_url: publicUrl });

    } catch (error: any) {
      alert('Gagal upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, nama: string, foto_url: string) => {
    if (window.confirm(`Hapus data pendaftaran atas nama ${nama}? Semua data termasuk foto akan dihapus permanen.`)) {
      try {
        // Hapus file di storage dulu
        if (foto_url) await deleteOldFile(foto_url);
        
        // Hapus data di database
        const { error } = await supabase.from('pendaftaran').delete().eq('id', id);
        if (error) throw error;
        
        fetchData();
      } catch (error: any) {
        alert('Gagal menghapus: ' + error.message);
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('pendaftaran')
        .update({
          nama: editingItem.nama,
          whatsapp: editingItem.whatsapp,
          domisili: editingItem.domisili,
          kategori: editingItem.kategori,
          foto_url: editingItem.foto_url
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      setIsEditModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert('Gagal memperbarui data: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredData = registrants.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.domisili.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Panel Manajemen Atlet</h1>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mt-2 inline-block">
              Total {filteredData.length} Data
            </span>
          </div>
          
          <button onClick={fetchData} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            REFRESH DATABASE
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8 group">
          <Search className="absolute left-5 top-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
          <input 
            type="text"
            placeholder="CARI NAMA ATLET ATAU KOTA..."
            className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border-2 border-slate-200 font-black focus:border-blue-600 outline-none uppercase shadow-sm transition-all"
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-2xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="px-6 py-6 font-black uppercase text-[10px] text-center w-16 text-slate-400">No</th>
                  <th className="px-6 py-6 font-black uppercase text-[10px] text-slate-400">Nama & Foto</th>
                  <th className="px-6 py-6 font-black uppercase text-[10px] text-slate-400">Kategori</th>
                  <th className="px-6 py-6 font-black uppercase text-[10px] text-slate-400">Kontak & Domisili</th>
                  <th className="px-6 py-6 font-black uppercase text-[10px] text-right text-slate-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="py-24 text-center font-black text-slate-400 uppercase tracking-widest">Menyinkronkan database...</td></tr>
                ) : currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-6 py-7 text-center font-black text-slate-300">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-7">
                      <div className="flex items-center gap-4">
                        <div 
                          onClick={() => item.foto_url && setPreviewImage(item.foto_url)}
                          className={`w-14 h-14 rounded-2xl bg-slate-100 border-2 border-white shadow-md overflow-hidden flex-shrink-0 cursor-zoom-in transition-transform hover:scale-110`}
                        >
                          {item.foto_url ? <img src={item.foto_url} className="w-full h-full object-cover" /> : <User className="m-auto mt-3 text-slate-300" />}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 uppercase leading-tight mb-1">{item.nama}</div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                            <Calendar size={12}/> {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-7">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase italic border border-blue-100">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-7 text-xs font-black">
                      <div className="flex items-center gap-1.5 mb-1"><Phone size={12} className="text-green-500" /> {item.whatsapp}</div>
                      <div className="flex items-center gap-1.5 text-slate-400 italic uppercase"><MapPin size={12} className="text-red-400" /> {item.domisili}</div>
                    </td>
                    <td className="px-6 py-7">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.nama, item.foto_url)} className="p-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:text-red-600 hover:border-red-600 transition-all shadow-sm">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-8 py-4 bg-white rounded-3xl border-2 border-slate-100">
           <button onClick={goToPrevPage} disabled={currentPage === 1} className="p-3 border-2 border-slate-100 rounded-2xl disabled:opacity-30 hover:bg-slate-50 transition-all">
             <ChevronLeft size={20} className="text-slate-400" />
           </button>
           <span className="font-black text-slate-400 uppercase text-xs tracking-widest">Halaman {currentPage} / {totalPages}</span>
           <button onClick={goToNextPage} disabled={currentPage === totalPages} className="p-3 border-2 border-slate-100 rounded-2xl disabled:opacity-30 hover:bg-slate-50 transition-all">
             <ChevronRight size={20} className="text-slate-400" />
           </button>
        </div>
      </div>

      {/* LIGHTBOX PREVIEW */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md cursor-zoom-out" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl w-full animate-in zoom-in duration-300">
             <button className="absolute -top-12 right-0 text-white flex items-center gap-2 font-black uppercase text-xs tracking-widest">
              <X size={24} /> Tutup
            </button>
            <img src={previewImage} className="w-full h-auto rounded-[2rem] border-4 border-white shadow-2xl" />
          </div>
        </div>
      )}

      {/* MODAL EDIT & UPLOAD */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Edit Data Atlet</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-8 space-y-5 overflow-y-auto">
              {/* UPLOAD SECTION DENGAN CLEANUP */}
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative w-32 h-32 group">
                  <div className="w-full h-full rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden relative">
                    {editingItem.foto_url ? (
                      <img src={editingItem.foto_url} className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-slate-300 absolute inset-0 m-auto" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-slate-900 transition-all active:scale-90 shadow-blue-200">
                    <Camera size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {uploading ? 'Sedang mengunggah...' : 'Klik kamera untuk ganti foto'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Nama Lengkap</label>
                <input 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-blue-600 outline-none uppercase transition-all"
                  value={editingItem.nama}
                  onChange={(e) => setEditingItem({...editingItem, nama: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">WhatsApp</label>
                  <input 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-blue-600 outline-none"
                    value={editingItem.whatsapp}
                    onChange={(e) => setEditingItem({...editingItem, whatsapp: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Kategori</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-blue-600 outline-none uppercase"
                    value={editingItem.kategori}
                    onChange={(e) => setEditingItem({...editingItem, kategori: e.target.value})}
                  >
                    <option value="Pra Dini (U-9)">Pra Dini (U-9)</option>
                    <option value="Dini (U-11)">Dini (U-11)</option>
                    <option value="Anak (U-13)">Anak (U-13)</option>
                    <option value="Pemula (U-15)">Pemula (U-15)</option>
                    <option value="Remaja (U-17)">Remaja (U-17)</option>
                    <option value="Taruna (U-19)">Taruna (U-19)</option>
                    <option value="Dewasa / Umum">Dewasa / Umum</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Domisili</label>
                <input 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-blue-600 outline-none uppercase transition-all"
                  value={editingItem.domisili}
                  onChange={(e) => setEditingItem({...editingItem, domisili: e.target.value})}
                  required
                />
              </div>

              <div className="pt-4 flex gap-3 pb-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50">
                  Batal
                </button>
                <button type="submit" disabled={isSaving || uploading} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                  {isSaving ? 'Menyimpan...' : <><Save size={16}/> Simpan Perubahan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
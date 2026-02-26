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
  Users,
  FileSpreadsheet,
  FileText,
  Plus,
  Upload,
  Clock,
  Calendar,
  Download,
  Activity,
  ZoomIn, // Tambahan Icon
  ZoomOut, // Tambahan Icon
  Maximize // Tambahan Icon
} from 'lucide-react';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
// Import framer-motion untuk fitur zoom & drag yang smooth
import { motion, AnimatePresence } from 'framer-motion';

interface Registrant {
  id: string;
  created_at: string;
  nama: string;
  whatsapp: string;
  kategori: string;
  domisili: string;
  pengalaman: string;
  foto_url: string;
  jenis_kelamin: string;
  kategori_atlet: string; 
}

export default function ManajemenPendaftaran() {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Registrant | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- KODE BARU: STATE UNTUK ZOOM FOTO ---
  const [zoomScale, setZoomScale] = useState(1);

  // --- KODE BARU: PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchRegistrants();
  }, []);

  const fetchRegistrants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pendaftaran')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setRegistrants(data);
      }
    } catch (err) {
      console.error('Error fetching:', err);
      Swal.fire('Error', 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- KODE BARU: SINKRONISASI STATISTIK DENGAN DATABASE ---
  const stats = {
    total: registrants.length,
    senior: registrants.filter(r => r.kategori_atlet === 'Senior').length,
    muda: registrants.filter(r => r.kategori_atlet === 'Atlet Muda').length
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
          kategori: editingItem.kategori,
          kategori_atlet: editingItem.kategori_atlet,
          domisili: editingItem.domisili,
          pengalaman: editingItem.pengalaman,
          jenis_kelamin: editingItem.jenis_kelamin,
          foto_url: editingItem.foto_url
        })
        .eq('id', editingItem.id);

      if (error) {
        // Handling khusus error constraint database
        if (error.message.includes('check_kategori_atlet')) {
          throw new Error('Pilihan kategori harus sesuai: Senior atau Atlet Muda');
        }
        throw error;
      }
      
      Swal.fire('Berhasil', 'Data atlet telah diperbarui', 'success');
      setIsEditModalOpen(false);
      fetchRegistrants();
    } catch (err: any) {
      Swal.fire('Gagal', err.message || 'Gagal menyimpan perubahan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from('pendaftaran').delete().eq('id', id);
        if (error) throw error;
        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
        fetchRegistrants();
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `atlet-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pendaftaran-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('pendaftaran-files')
        .getPublicUrl(filePath);

      setEditingItem({ ...editingItem, foto_url: publicUrl });
    } catch (err) {
      Swal.fire('Error', 'Gagal upload foto', 'error');
    } finally {
      setUploading(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(registrants);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pendaftar");
    XLSX.writeFile(workbook, `Pendaftaran_PB_US162_${new Date().toLocaleDateString()}.xlsx`);
  };

  const filteredData = registrants.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.domisili.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <Users size={24} />
              </div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                Data <span className="text-blue-600">Pendaftar</span>
              </h1>
            </div>
            <p className="text-slate-500 font-medium">Manajemen data atlet dan proses pendaftaran klub</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button onClick={exportToExcel} className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100 active:scale-95">
              <FileSpreadsheet size={18} /> Excel
            </button>
            <button onClick={fetchRegistrants} className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:rotate-180 duration-500">
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>

        {/* --- KODE BARU: STATS CARDS TERKONEKSI TABEL --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Pendaftar</p>
              <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">{stats.total}</h3>
            </div>
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-orange-200 transition-all">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Atlet Senior</p>
              <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">{stats.senior}</h3>
            </div>
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity size={32} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:border-purple-200 transition-all">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Atlet Muda</p>
              <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">{stats.muda}</h3>
            </div>
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <User size={32} />
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Cari nama atau domisili..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Profil Atlet</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kategori</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Domisili & Pengalaman</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden cursor-zoom-in border-2 border-white shadow-sm hover:scale-105 transition-transform"
                          onClick={() => {
                            setPreviewImage(item.foto_url);
                            setZoomScale(1);
                          }}
                        >
                          <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase italic tracking-tight">{item.nama}</p>
                          <a href={`https://wa.me/${item.whatsapp}`} target="_blank" className="flex items-center gap-1.5 text-blue-600 font-bold text-xs mt-0.5 hover:underline">
                            <Phone size={12} /> {item.whatsapp}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest block w-fit">
                          {item.kategori}
                        </span>
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest block w-fit italic">
                          {item.kategori_atlet || 'Reguler'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-2 mb-1">
                        <MapPin className="text-rose-500 shrink-0" size={14} />
                        <span className="text-sm font-bold text-slate-600">{item.domisili}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic line-clamp-1 pl-6">"{item.pengalaman}"</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingItem(item);
                            setIsEditModalOpen(true);
                          }}
                          className="p-3 bg-white text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-100"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-3 bg-white text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-slate-100"
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

          {/* PAGINATION */}
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-3 bg-white rounded-xl border border-slate-200 disabled:opacity-50 hover:bg-slate-100 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-3 bg-white rounded-xl border border-slate-200 disabled:opacity-50 hover:bg-slate-100 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Edit <span className="text-blue-600">Atlet</span></h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 overflow-y-auto space-y-6">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-slate-50 shadow-inner group-hover:border-blue-100 transition-all">
                    {uploading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                        <Loader2 className="animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <img 
                        src={editingItem.foto_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover cursor-zoom-in"
                        onClick={() => {
                          setPreviewImage(editingItem.foto_url);
                          setZoomScale(1);
                        }}
                      />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nama Lengkap</label>
                  <input className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700" value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">WhatsApp</label>
                  <input className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700" value={editingItem.whatsapp} onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kategori Atlet</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700" 
                    value={editingItem.kategori_atlet} 
                    onChange={e => setEditingItem({...editingItem, kategori_atlet: e.target.value})}
                  >
                    <option value="Senior">Senior</option>
                    <option value="Atlet Muda">Atlet Muda</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Domisili</label>
                  <input className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700" value={editingItem.domisili} onChange={e => setEditingItem({...editingItem, domisili: e.target.value})} required />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button type="submit" disabled={isSaving || uploading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95">
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- KODE BARU: LIGHTBOX DENGAN FITUR ZOOM & DRAG --- */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
            
            {/* Control Zoom Bar */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-xl border border-white/20 z-[120]">
               <button onClick={() => setZoomScale(s => Math.max(0.5, s - 0.2))} className="text-white hover:text-blue-400 transition-colors">
                  <ZoomOut size={22} />
               </button>
               <span className="text-white font-black text-xs min-w-[40px] text-center">
                  {Math.round(zoomScale * 100)}%
               </span>
               <button onClick={() => setZoomScale(s => Math.min(3, s + 0.2))} className="text-white hover:text-blue-400 transition-colors">
                  <ZoomIn size={22} />
               </button>
               <div className="w-px h-6 bg-white/20 mx-1"></div>
               <button onClick={() => setZoomScale(1)} className="text-white hover:text-blue-400 transition-colors">
                  <Maximize size={20} />
               </button>
            </div>

            <button 
              onClick={() => {
                setPreviewImage(null);
                setZoomScale(1);
              }} 
              className="absolute top-12 right-12 text-white hover:text-rose-500 z-[130] flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all"
            >
              Tutup <X size={24} />
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <motion.div 
                drag
                dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                style={{ scale: zoomScale }}
                className="relative cursor-grab active:cursor-grabbing"
              >
                <img 
                  src={previewImage} 
                  className="max-w-[85vw] max-h-[85vh] rounded-3xl shadow-2xl border-2 border-white/20 pointer-events-none" 
                  alt="Full Preview" 
                />
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
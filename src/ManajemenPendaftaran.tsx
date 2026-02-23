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
  Activity,
  ZoomIn,
  ZoomOut,
  Maximize
} from 'lucide-react';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
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

  // Fitur Zoom & Scale
  const [zoomScale, setZoomScale] = useState(1);

  // Pagination
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
      if (data) setRegistrants(data);
    } catch (err) {
      console.error('Error fetching:', err);
      Swal.fire('Error', 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // KONEKSI STATISTIK OTOMATIS: Angka dihitung dari data terbaru di tabel
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
      // Perbaikan: Pastikan value sesuai dengan constraint database
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
        if (error.message.includes('check_kategori_atlet')) {
          throw new Error('Database hanya menerima kategori "Senior" atau "Atlet Muda". Periksa ejaan Anda.');
        }
        throw error;
      }
      
      Swal.fire('Berhasil', 'Data atlet telah diperbarui', 'success');
      setIsEditModalOpen(false);
      fetchRegistrants();
    } catch (err: any) {
      Swal.fire('Gagal Menyimpan', err.message, 'error');
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
      confirmButtonText: 'Ya, Hapus!'
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
    XLSX.writeFile(workbook, `Data_Atlet_PB_US162.xlsx`);
  };

  const filteredData = registrants.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.domisili.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg text-white"><Users size={24} /></div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                Data <span className="text-blue-600">Pendaftar</span>
              </h1>
            </div>
            <p className="text-slate-500 font-medium">Manajemen Atlet PB US 162</p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={exportToExcel} className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-xs uppercase hover:bg-emerald-100 transition-all">
              <FileSpreadsheet size={18} /> Excel
            </button>
            <button onClick={fetchRegistrants} className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>

        {/* STATS CARDS - REALTIME CONNECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Pendaftar</p>
              <h3 className="text-4xl font-black text-slate-900 italic">{stats.total}</h3>
            </div>
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center"><Users size={32} /></div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Atlet Senior</p>
              <h3 className="text-4xl font-black text-slate-900 italic">{stats.senior}</h3>
            </div>
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center"><Activity size={32} /></div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Atlet Muda</p>
              <h3 className="text-4xl font-black text-slate-900 italic">{stats.muda}</h3>
            </div>
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center"><User size={32} /></div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text" placeholder="Cari nama atau domisili..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-600"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400">Profil</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400">Kategori</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-slate-400">Domisili</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black uppercase text-slate-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.foto_url} 
                          className="w-14 h-14 rounded-2xl object-cover cursor-zoom-in border-2 border-white shadow-sm" 
                          onClick={() => {setPreviewImage(item.foto_url); setZoomScale(1);}}
                        />
                        <div>
                          <p className="font-black text-slate-900 uppercase italic tracking-tight">{item.nama}</p>
                          <p className="text-xs font-bold text-blue-600">{item.whatsapp}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-black uppercase italic">
                        {item.kategori_atlet || 'Belum Diatur'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-600">{item.domisili}</td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => {setEditingItem(item); setIsEditModalOpen(true);}} className="p-3 bg-white text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white border border-slate-100"><Edit3 size={18} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-3 bg-white text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white border border-slate-100"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-8 border-b flex justify-between items-center">
              <h3 className="text-xl font-black italic uppercase text-slate-900">Edit <span className="text-blue-600">Atlet</span></h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-rose-50 rounded-full"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 overflow-y-auto space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <img src={editingItem.foto_url} className="w-32 h-32 rounded-[2rem] object-cover border-4 border-slate-50 cursor-zoom-in" onClick={() => setPreviewImage(editingItem.foto_url)} />
                  <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl cursor-pointer hover:bg-blue-700 shadow-lg">
                    <Camera size={18} /><input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} placeholder="Nama Lengkap" required />
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={editingItem.whatsapp} onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})} placeholder="WhatsApp" required />
                
                {/* SELECT KATEGORI ATLET - PENTING: Value harus match dengan Database */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kategori Atlet (Database)</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700"
                    value={editingItem.kategori_atlet}
                    onChange={e => setEditingItem({...editingItem, kategori_atlet: e.target.value})}
                  >
                    <option value="Senior">Senior</option>
                    <option value="Atlet Muda">Atlet Muda</option>
                  </select>
                </div>

                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={editingItem.domisili} onChange={e => setEditingItem({...editingItem, domisili: e.target.value})} placeholder="Domisili" required />
              </div>

              <button type="submit" disabled={isSaving || uploading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">
                {isSaving ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX DENGAN ZOOM & DRAG (COMPLETELY NEW) */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
            
            {/* Control Bar */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 p-3 rounded-2xl backdrop-blur-xl border border-white/20 z-[120]">
              <button onClick={() => setZoomScale(s => Math.max(0.5, s - 0.25))} className="text-white hover:text-blue-400"><ZoomOut /></button>
              <span className="text-white font-black text-xs w-12 text-center">{Math.round(zoomScale * 100)}%</span>
              <button onClick={() => setZoomScale(s => Math.min(4, s + 0.25))} className="text-white hover:text-blue-400"><ZoomIn /></button>
              <div className="w-px h-6 bg-white/20"></div>
              <button onClick={() => setZoomScale(1)} className="text-white hover:text-blue-400"><Maximize size={20} /></button>
            </div>

            <button onClick={() => {setPreviewImage(null); setZoomScale(1);}} className="absolute top-8 right-8 text-white hover:text-rose-500 z-[130]">
              <X size={32} />
            </button>
            
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <motion.div 
                drag
                dragConstraints={{ left: -600, right: 600, top: -600, bottom: 600 }}
                style={{ scale: zoomScale }}
                className="relative cursor-grab active:cursor-grabbing transition-transform duration-200"
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
    </div>
  );
}
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
  ZoomIn,
  ZoomOut
} from 'lucide-react';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // KODE BARU: State untuk Zoom Foto
  const [zoomScale, setZoomScale] = useState(1);

  // Pagination states
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
      setRegistrants(data || []);
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // KODE BARU: Perhitungan statistik dinamis agar terhubung dengan data asli
  const stats = {
    total: registrants.length,
    senior: registrants.filter(r => r.kategori_atlet?.toLowerCase() === 'senior').length,
    muda: registrants.filter(r => r.kategori_atlet?.toLowerCase() === 'muda').length
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `pendaftar/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('atlet_photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('atlet_photos')
        .getPublicUrl(filePath);

      setEditingItem({ ...editingItem, foto_url: publicUrl });
      Swal.fire('Berhasil', 'Foto berhasil diunggah', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('pendaftaran')
        .update({
          nama: editingItem.nama,
          whatsapp: editingItem.whatsapp,
          domisili: editingItem.domisili,
          foto_url: editingItem.foto_url,
          kategori_atlet: editingItem.kategori_atlet
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      await fetchRegistrants();
      setIsEditModalOpen(false);
      Swal.fire('Berhasil', 'Data berhasil diperbarui', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Apakah anda yakin?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('pendaftaran')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setRegistrants(registrants.filter(r => r.id !== id));
        Swal.fire('Dihapus!', 'Data telah berhasil dihapus.', 'success');
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  // Filter & Pagination logic
  const filteredRegistrants = registrants.filter(r =>
    r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.domisili.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.kategori_atlet?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRegistrants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredRegistrants.slice(startIndex, startIndex + itemsPerPage);

  const exportToExcel = () => {
    const dataToExport = registrants.map(r => ({
      Nama: r.nama,
      WhatsApp: r.whatsapp,
      Kategori: r.kategori_atlet,
      Domisili: r.domisili,
      'Tanggal Daftar': new Date(r.created_at).toLocaleDateString('id-ID')
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pendaftar");
    XLSX.writeFile(wb, `Data_Pendaftar_PB_US_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
                Manajemen <span className="text-blue-600">Pendaftaran</span>
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">PB UNGGUL SELALU 162</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={fetchRegistrants} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95">
                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button onClick={exportToExcel} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 active:scale-95">
                <FileSpreadsheet size={18} />
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* STATS CARDS - Terhubung Otomatis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Pendaftar', value: stats.total, icon: Users, color: 'blue' },
            { label: 'Atlet Senior', value: stats.senior, icon: Activity, color: 'rose' },
            { label: 'Atlet Muda', value: stats.muda, icon: Clock, color: 'amber' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                <stat.icon size={32} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH BAR */}
        <div className="mb-8 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama, domisili, atau kategori atlet..."
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Pendaftar</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Kategori</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Domisili</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
                      <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Memproses Data...</p>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic font-bold">Tidak ada data ditemukan</td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative group/photo cursor-pointer" onClick={() => { setPreviewImage(item.foto_url); setZoomScale(1); }}>
                            <img src={item.foto_url} className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 group-hover/photo:ring-blue-500 transition-all" alt="" />
                            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-opacity">
                              <Search size={14} className="text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase italic text-sm">{item.nama}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {item.id.slice(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          item.kategori_atlet?.toLowerCase() === 'senior' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {item.kategori_atlet || 'UMUM'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin size={14} className="text-slate-400" />
                          <span className="text-xs font-bold uppercase tracking-tight">{item.domisili}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <a href={`https://wa.me/${item.whatsapp}`} target="_blank" className="flex items-center gap-2 text-blue-600 hover:underline transition-all">
                          <Phone size={14} />
                          <span className="text-xs font-black tracking-widest">{item.whatsapp}</span>
                        </a>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRegistrants.length)} of {filteredRegistrants.length}
            </p>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 disabled:opacity-50">
                <ChevronLeft size={20} />
              </button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 disabled:opacity-50">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900 uppercase italic">Edit <span className="text-blue-600">Pendaftar</span></h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-full transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Photo Update */}
                <div className="md:col-span-2 flex flex-col items-center">
                  <div className="relative group w-32 h-32 mb-4">
                    <img src={editingItem.foto_url} className="w-full h-full rounded-[2rem] object-cover ring-4 ring-slate-100 group-hover:ring-blue-500 transition-all shadow-xl" alt="" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Camera className="text-white" size={24} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                    {uploading && <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-[2rem]"><Loader2 className="animate-spin text-blue-600" size={24} /></div>}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Klik foto untuk mengganti</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nama Lengkap</label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition-all" value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">WhatsApp</label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition-all" value={editingItem.whatsapp} onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Kategori Atlet</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition-all" value={editingItem.kategori_atlet} onChange={e => setEditingItem({...editingItem, kategori_atlet: e.target.value})} required>
                    <option value="SENIOR">SENIOR</option>
                    <option value="MUDA">MUDA</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Domisili</label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-blue-500/20 transition-all" value={editingItem.domisili} onChange={e => setEditingItem({...editingItem, domisili: e.target.value})} required />
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

      {/* LIGHTBOX PREVIEW - KODE BARU: Dengan fitur Zoom */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute top-6 right-6 flex gap-4">
            <div className="flex items-center bg-white/10 rounded-full px-2 backdrop-blur-md border border-white/20">
              <button 
                onClick={(e) => { e.stopPropagation(); setZoomScale(prev => Math.max(0.5, prev - 0.25)); }}
                className="p-3 text-white hover:text-blue-400 transition-colors"
              >
                <ZoomOut size={24} />
              </button>
              <span className="text-white text-xs font-black min-w-[50px] text-center">{Math.round(zoomScale * 100)}%</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setZoomScale(prev => Math.min(3, prev + 0.25)); }}
                className="p-3 text-white hover:text-blue-400 transition-colors"
              >
                <ZoomIn size={24} />
              </button>
            </div>
            <button 
              onClick={() => setPreviewImage(null)} 
              className="p-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all shadow-xl"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="max-w-4xl max-h-[80vh] overflow-auto hide-scrollbar flex items-center justify-center p-10 cursor-zoom-out" onClick={() => setPreviewImage(null)}>
            <img 
              src={previewImage} 
              className="max-w-full h-auto rounded-2xl shadow-2xl transition-transform duration-200 ease-out" 
              style={{ transform: `scale(${zoomScale})` }} 
              alt="Preview" 
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
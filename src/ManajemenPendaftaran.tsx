import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Trash2, 
  RefreshCcw, 
  Search, 
  Phone, 
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
  Activity,
  Maximize2,
  Zap
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Registrant | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [newItem, setNewItem] = useState<Partial<Registrant>>({
    nama: '', whatsapp: '', kategori: 'Pra Dini (U-9)', domisili: '',
    jenis_kelamin: 'Putra', foto_url: '', kategori_atlet: 'Muda'
  });

  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pendaftaran').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRegistrants(data || []);
    } catch (error: any) { console.error(error.message); }
    finally { setLoading(false); }
  };

  // --- HELPER FORMAT WAKTU ---
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // --- LOGIKA EXPORT ---
  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ nama: '', whatsapp: '', kategori: '', domisili: '', jenis_kelamin: '', kategori_atlet: '' }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Pendaftaran.xlsx");
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(registrants);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Atlet");
    XLSX.writeFile(wb, "Database_Atlet.xlsx");
  };

  // --- LOGIKA UPLOAD FOTO ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'add' | 'edit') => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `atlet/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('identitas-atlet').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('identitas-atlet').getPublicUrl(filePath);

      if (mode === 'add') setNewItem({ ...newItem, foto_url: publicUrl });
      else setEditingItem(prev => prev ? { ...prev, foto_url: publicUrl } : null);
      
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setUploading(false);
    }
  };

  // --- SUBMIT HANDLERS ---
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').update({
        ...editingItem,
        nama: editingItem.nama.toUpperCase()
      }).eq('id', editingItem.id);
      if (error) throw error;
      setIsEditModalOpen(false);
      fetchData();
      Swal.fire("Tersimpan", "Data atlet berhasil diperbarui", "success");
    } catch (error: any) { Swal.fire("Error", error.message, "error"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({ title: 'Hapus data?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (res.isConfirmed) {
      await supabase.from('pendaftaran').delete().eq('id', id);
      fetchData();
    }
  };

  const filteredData = registrants.filter(item => item.nama.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-slate-900">
      <div className="max-w-[1440px] mx-auto px-6 py-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-blue-200">
              <Zap size={32} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                Pusat <span className="text-blue-600">Data Atlet</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sistem Manajemen Real-time</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[11px] tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">
              <Plus size={18} strokeWidth={3} /> TAMBAH ATLET
            </button>
            <button onClick={exportToExcel} className="flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-700 px-6 py-4 rounded-2xl font-black text-[11px] tracking-widest hover:border-blue-600 transition-all">
              <FileSpreadsheet size={18} className="text-emerald-600" /> EXPORT EXCEL
            </button>
            <button onClick={downloadTemplate} className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all">
              <Upload size={20} className="rotate-180" />
            </button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Registrasi</p>
            <div className="flex items-end gap-3">
              <h3 className="text-4xl font-black leading-none">{registrants.length}</h3>
              <span className="text-xs font-bold text-emerald-500 mb-1">Atlet Terdaftar</span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Kategori Muda</p>
            <h3 className="text-4xl font-black leading-none">{registrants.filter(r => r.kategori_atlet === 'Muda').length}</h3>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Kategori Senior</p>
            <h3 className="text-4xl font-black leading-none">{registrants.filter(r => r.kategori_atlet === 'Senior').length}</h3>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="relative mb-8 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={22} />
          <input 
            type="text" 
            placeholder="Cari nama atlet atau domisili..." 
            className="w-full pl-16 pr-8 py-6 bg-white border-2 border-transparent rounded-[24px] outline-none focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 shadow-sm font-bold text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* MAIN TABLE */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto lg:overflow-visible">
            <table className="w-full text-left min-w-[1000px] lg:min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-[0.2em] font-black">
                  <th className="px-8 py-7 text-center w-20">ID</th>
                  <th className="px-8 py-7">Identitas Atlet</th>
                  <th className="px-8 py-7">Kategori / Tipe</th>
                  <th className="px-8 py-7">Waktu Registrasi</th>
                  <th className="px-8 py-7">WhatsApp</th>
                  <th className="px-8 py-7 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item, idx) => {
                  const { date, time } = formatDateTime(item.created_at);
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-all group">
                      <td className="px-8 py-6 text-center font-black text-slate-200 text-xs">{(currentPage-1)*itemsPerPage + idx + 1}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div 
                            onClick={() => item.foto_url && setPreviewImage(item.foto_url)}
                            className="relative w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden cursor-zoom-in group-hover:scale-105 transition-transform duration-300 border-2 border-white shadow-md flex-shrink-0"
                          >
                            {item.foto_url ? (
                              <img src={item.foto_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <User size={24} className="m-auto mt-4 text-slate-300" />
                            )}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Maximize2 size={16} className="text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="font-black text-slate-800 uppercase text-sm tracking-tight mb-1">{item.nama}</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${item.jenis_kelamin === 'Putra' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                                {item.jenis_kelamin}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{item.domisili}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="font-black text-slate-600 text-[11px] uppercase">{item.kategori}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${item.kategori_atlet === 'Senior' ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}`}>
                            {item.kategori_atlet}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase">
                            <Calendar size={12} className="text-blue-500" /> {date}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5 uppercase tracking-widest">
                            <Clock size={12} /> {time}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <a href={`https://wa.me/${item.whatsapp}`} target="_blank" className="inline-flex items-center gap-2 font-black text-slate-700 text-xs hover:text-blue-600 transition-colors bg-slate-50 px-4 py-2 rounded-xl">
                          <Phone size={14} className="text-emerald-500" /> {item.whatsapp}
                        </a>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-3 bg-white border border-slate-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                            <Edit3 size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-3 bg-white border border-slate-100 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* PAGINATION */}
          <div className="px-8 py-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Halaman {currentPage} Dari {Math.ceil(filteredData.length / itemsPerPage)}</p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-4 bg-white border border-slate-200 rounded-2xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                disabled={currentPage >= Math.ceil(filteredData.length / itemsPerPage)}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-4 bg-white border border-slate-200 rounded-2xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDIT (UI Baru + Zoom Foto) */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">Edit <span className="text-blue-600">Atlet</span></h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {editingItem.id.slice(0,8)}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-4 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-10 space-y-8">
              <div className="flex justify-center">
                <div className="relative group">
                  <div 
                    onClick={() => editingItem.foto_url && setPreviewImage(editingItem.foto_url)}
                    className="w-32 h-32 rounded-[32px] bg-slate-100 border-4 border-white shadow-2xl overflow-hidden cursor-zoom-in"
                  >
                    {editingItem.foto_url ? (
                      <img src={editingItem.foto_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User size={48} className="m-auto mt-8 text-slate-200" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white font-black text-[9px] uppercase">Klik Zoom</div>
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-3.5 bg-blue-600 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-slate-900 transition-all active:scale-90">
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'edit')} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Lengkap</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold uppercase text-xs focus:border-blue-600 transition-all outline-none" value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">WhatsApp</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-xs focus:border-blue-600 transition-all outline-none" value={editingItem.whatsapp} onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tipe Atlet</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-xs focus:border-blue-600 outline-none appearance-none" value={editingItem.kategori_atlet} onChange={e => setEditingItem({...editingItem, kategori_atlet: e.target.value})}>
                    <option value="Muda">Muda</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Domisili</label>
                  <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold uppercase text-xs focus:border-blue-600 outline-none" value={editingItem.domisili} onChange={e => setEditingItem({...editingItem, domisili: e.target.value})} />
                </div>
              </div>

              <button type="submit" disabled={isSaving || uploading} className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} SIMPAN PERUBAHAN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW (Zoom Lengkap) */}
      {previewImage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl w-full flex flex-col items-center">
            <button className="absolute -top-16 right-0 text-white/60 hover:text-white transition-colors flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
              Tutup <X size={28} />
            </button>
            <img 
              src={previewImage} 
              className="w-full h-auto max-h-[80vh] rounded-[40px] border-4 border-white shadow-2xl animate-in zoom-in-95 duration-300 object-contain" 
              alt="Preview" 
            />
            <div className="mt-8 px-6 py-3 bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
              <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Tampilan Detail Identitas Atlet</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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
  Filter,
  CheckCircle2,
  AlertCircle
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
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Registrant | null>(null);
  const [newItem, setNewItem] = useState<Partial<Registrant>>({
    nama: '',
    whatsapp: '',
    kategori: 'Pra Dini (U-9)',
    domisili: '',
    jenis_kelamin: 'Putra',
    foto_url: '',
    kategori_atlet: 'Muda',
    pengalaman: '-'
  });
  
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const kategoriUmur = [
    "Pra Dini (U-9)", "Usia Dini (U-11)", "Anak-anak (U-13)", 
    "Pemula (U-15)", "Remaja (U-17)", "Taruna (U-19)", 
    "Dewasa / Umum", "Veteran (35+ / 40+)"
  ];

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // --- LOGIKA STATISTIK OTOMATIS (REAL-TIME) ---
  const stats = {
    total: registrants.length,
    putra: registrants.filter(r => r.jenis_kelamin === 'Putra').length,
    putri: registrants.filter(r => r.jenis_kelamin === 'Putri').length,
    muda: registrants.filter(r => r.kategori_atlet === 'Muda').length,
    senior: registrants.filter(r => r.kategori_atlet === 'Senior').length,
    mudaPutra: registrants.filter(r => r.kategori_atlet === 'Muda' && r.jenis_kelamin === 'Putra').length,
    mudaPutri: registrants.filter(r => r.kategori_atlet === 'Muda' && r.jenis_kelamin === 'Putri').length,
    seniorPutra: registrants.filter(r => r.kategori_atlet === 'Senior' && r.jenis_kelamin === 'Putra').length,
    seniorPutri: registrants.filter(r => r.kategori_atlet === 'Senior' && r.jenis_kelamin === 'Putri').length,
  };

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
      console.error(error.message);
      Toast.fire({ icon: 'error', title: 'Gagal mengambil data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => resolve(blob as Blob), 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'add' | 'edit') => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const compressedBlob = await compressImage(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `identitas/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('identitas-atlet').upload(filePath, compressedBlob);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('identitas-atlet').getPublicUrl(filePath);
      
      if (mode === 'add') setNewItem({...newItem, foto_url: publicUrl});
      else if (editingItem) setEditingItem({...editingItem, foto_url: publicUrl});
      
      Toast.fire({ icon: 'success', title: 'Foto berhasil diunggah' });
    } catch (error: any) {
      Swal.fire('Gagal', error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').insert([{
        ...newItem,
        nama: newItem.nama?.toUpperCase(),
        domisili: newItem.domisili?.toUpperCase()
      }]);
      if (error) throw error;
      setIsAddModalOpen(false);
      setNewItem({ nama: '', whatsapp: '', kategori: 'Pra Dini (U-9)', domisili: '', jenis_kelamin: 'Putra', foto_url: '', kategori_atlet: 'Muda', pengalaman: '-' });
      fetchData();
      Swal.fire('Berhasil!', 'Atlet telah terdaftar ke database.', 'success');
    } catch (error: any) { Swal.fire('Error', error.message, 'error'); } 
    finally { setIsSaving(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran')
        .update({
          ...editingItem, 
          nama: editingItem.nama.toUpperCase(),
          domisili: editingItem.domisili.toUpperCase()
        })
        .eq('id', editingItem.id);
      if (error) throw error;
      setIsEditModalOpen(false);
      fetchData();
      Toast.fire({ icon: 'success', title: 'Data berhasil diperbarui' });
    } catch (error: any) { Swal.fire('Error', error.message, 'error'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string, nama: string) => {
    const res = await Swal.fire({
      title: 'Hapus Data?',
      text: `Data atlet ${nama} akan dihapus permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!'
    });
    if(res.isConfirmed) {
      const { error } = await supabase.from('pendaftaran').delete().eq('id', id);
      if(!error) {
        fetchData();
        Toast.fire({ icon: 'success', title: 'Data dihapus' });
      }
    }
  };

  const exportToExcel = () => {
    const data = filteredData.map((item, index) => ({
      No: index + 1,
      Nama: item.nama,
      Gender: item.jenis_kelamin,
      Kategori_Atlet: item.kategori_atlet,
      Kategori_Umur: item.kategori,
      WhatsApp: item.whatsapp,
      Domisili: item.domisili
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Atlet");
    XLSX.writeFile(workbook, `Data_Atlet_${categoryFilter}.xlsx`);
  };

  const filteredData = registrants.filter(item => {
    const matchesSearch = (item.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.domisili || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = categoryFilter === 'Semua' || item.kategori_atlet === categoryFilter;
    return matchesSearch && matchesFilter;
  });

  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] shadow-xl shadow-blue-200 text-white">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase italic leading-none tracking-tight">
                Manajemen <span className="text-blue-600">Atlet</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <CheckCircle2 size={10} /> Database Active
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v3.0 Secure System</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-[11px] tracking-widest hover:bg-blue-600 shadow-xl active:scale-95 transition-all">
              <Plus size={18} /> TAMBAH ATLET BARU
            </button>
            <button onClick={exportToExcel} className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-4 rounded-2xl font-bold text-[11px] tracking-widest hover:bg-slate-50 shadow-sm active:scale-95 transition-all">
              <FileSpreadsheet size={18} className="text-emerald-600" /> EXPORT EXCEL
            </button>
            <button onClick={fetchData} className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm">
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* STATS CARDS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Atlet</p>
              <Users size={16} className="text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-900">{stats.total}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-bold text-blue-600">{stats.putra} Putra</span>
              <span className="text-slate-200">•</span>
              <span className="text-[9px] font-bold text-rose-500">{stats.putri} Putri</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border-l-4 border-l-emerald-500 shadow-sm">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Kategori Muda</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.muda}</h3>
            <div className="flex items-center gap-2 mt-1 text-[9px] font-bold uppercase">
              <span className="text-slate-500">{stats.mudaPutra} PA</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500">{stats.mudaPutri} PI</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border-l-4 border-l-indigo-500 shadow-sm">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Kategori Senior</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.senior}</h3>
            <div className="flex items-center gap-2 mt-1 text-[9px] font-bold uppercase">
              <span className="text-slate-500">{stats.seniorPutra} PA</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500">{stats.seniorPutri} PI</span>
            </div>
          </div>

          <div className="hidden xl:flex bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-[2rem] shadow-lg text-white flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Update Terakhir</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock size={16} />
              <p className="font-bold text-sm">Hari ini, {new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} WIB</p>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama atlet atau asal domisili..." 
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm font-bold text-sm transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="w-full md:w-72 relative">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              className="w-full pl-14 pr-10 py-5 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm font-bold text-sm appearance-none cursor-pointer transition-all"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Muda">Khusus Muda</option>
              <option value="Senior">Khusus Senior</option>
            </select>
          </div>
        </div>

        {/* MAIN TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-[0.15em] font-black">
                  <th className="w-[70px] px-8 py-6 text-center">No</th>
                  <th className="w-[300px] px-4 py-6">Informasi Atlet</th>
                  <th className="w-[120px] px-4 py-6">Gender</th>
                  <th className="w-[180px] px-4 py-6">Kategori Umur</th>
                  <th className="w-[140px] px-4 py-6 text-center">Tipe Atlet</th>
                  <th className="w-[180px] px-4 py-6">Domisili</th>
                  <th className="w-[140px] px-8 py-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.length > 0 ? currentItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-8 py-5 text-center font-black text-slate-300 text-xs">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-4">
                        <div 
                          onClick={() => item.foto_url && setPreviewImage(item.foto_url)} 
                          className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden cursor-zoom-in border border-slate-200 shadow-sm group-hover:border-blue-300 transition-all flex-shrink-0"
                        >
                          {item.foto_url ? (
                            <img src={item.foto_url} className="w-full h-full object-cover" alt="atlet" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20}/></div>
                          )}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="font-black text-slate-800 uppercase text-xs tracking-tight group-hover:text-blue-700 transition-colors">{item.nama}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Phone size={10} /> {item.whatsapp}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider ${item.jenis_kelamin === 'Putra' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.jenis_kelamin}
                      </span>
                    </td>
                    <td className="px-4 py-5 font-bold text-slate-600 uppercase text-[10px] tracking-tight">{item.kategori}</td>
                    <td className="px-4 py-5 text-center">
                      <span className={`px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest ${item.kategori_atlet === 'Senior' ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.kategori_atlet}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase">
                        <MapPin size={12} className="text-slate-300" /> {item.domisili}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-2.5 bg-white border border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all"><Edit3 size={16}/></button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="p-2.5 bg-white border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={48} className="text-slate-200" />
                        <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Tidak ada data atlet ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* PAGINATION */}
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Menampilkan <span className="text-slate-900">{currentItems.length}</span> dari <span className="text-slate-900">{filteredData.length}</span> Database
            </div>
            <div className="flex items-center gap-3">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)} 
                className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
              >
                <ChevronLeft size={20}/>
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages || totalPages === 0} 
                onClick={() => setCurrentPage(p => p + 1)} 
                className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
              >
                <ChevronRight size={20}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ADD ATLET */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic leading-none">Tambah <span className="text-blue-600">Atlet</span></h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registrasi Atlet Baru ke Database</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-500 hover:rotate-90 transition-all">
                <X size={24}/>
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[75vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    {newItem.foto_url ? (
                      <img src={newItem.foto_url} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200"><User size={50} /></div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-200 cursor-pointer hover:bg-slate-900 transition-colors">
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'add')} />
                  </label>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unggah Foto Identitas / Profile</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><User size={12}/> Nama Lengkap Atlet</label>
                  <input required placeholder="CONTOH: BUDI SANTOSO" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" value={newItem.nama} onChange={e => setNewItem({...newItem, nama: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Phone size={12}/> Nomor WhatsApp</label>
                  <input required placeholder="08XXXXXXXXXX" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" value={newItem.whatsapp} onChange={e => setNewItem({...newItem, whatsapp: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Filter size={12}/> Kategori Atlet</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:border-blue-500 transition-all cursor-pointer" value={newItem.kategori_atlet} onChange={e => setNewItem({...newItem, kategori_atlet: e.target.value})}>
                    <option value="Muda">Muda</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Users size={12}/> Jenis Kelamin</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:border-blue-500 transition-all cursor-pointer" value={newItem.jenis_kelamin} onChange={e => setNewItem({...newItem, jenis_kelamin: e.target.value})}>
                    <option value="Putra">Putra</option>
                    <option value="Putri">Putri</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Calendar size={12}/> Kategori Umur</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:border-blue-500 transition-all cursor-pointer" value={newItem.kategori} onChange={e => setNewItem({...newItem, kategori: e.target.value})}>
                    {kategoriUmur.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><MapPin size={12}/> Asal Domisili</label>
                  <input required placeholder="KOTA/KABUPATEN" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" value={newItem.domisili} onChange={e => setNewItem({...newItem, domisili: e.target.value})} />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button type="submit" disabled={isSaving || uploading} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95 group disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save className="group-hover:animate-bounce" size={20} />}
                  Daftarkan Atlet Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT ATLET */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                  <Edit3 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic leading-none">Edit <span className="text-amber-500">Data Atlet</span></h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {editingItem.id.substring(0,8)}</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-500 hover:rotate-90 transition-all">
                <X size={24}/>
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-10 space-y-8 overflow-y-auto max-h-[75vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    {editingItem.foto_url ? (
                      <img src={editingItem.foto_url} className="w-full h-full object-cover" alt="atlet" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200"><User size={50} /></div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-4 bg-amber-500 text-white rounded-[1.5rem] shadow-xl shadow-amber-200 cursor-pointer hover:bg-slate-900 transition-colors">
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'edit')} />
                  </label>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Update Foto Profil</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">Nama Lengkap</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all" value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">Nomor WhatsApp</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all" value={editingItem.whatsapp} onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">Kategori Atlet</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:border-amber-500 transition-all cursor-pointer" value={editingItem.kategori_atlet} onChange={e => setEditingItem({...editingItem, kategori_atlet: e.target.value})}>
                    <option value="Muda">Muda</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">Jenis Kelamin</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:border-amber-500 transition-all cursor-pointer" value={editingItem.jenis_kelamin} onChange={e => setEditingItem({...editingItem, jenis_kelamin: e.target.value})}>
                    <option value="Putra">Putra</option>
                    <option value="Putri">Putri</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">Kategori Umur</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:border-amber-500 transition-all cursor-pointer" value={editingItem.kategori} onChange={e => setEditingItem({...editingItem, kategori: e.target.value})}>
                    {kategoriUmur.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">Asal Domisili</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all" value={editingItem.domisili} onChange={e => setEditingItem({...editingItem, domisili: e.target.value})} />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button type="submit" disabled={isSaving || uploading} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3 active:scale-95 group">
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Simpan Perubahan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-xl w-full">
            <button className="absolute -top-12 right-0 text-white hover:text-rose-500 transition-colors flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
              Tutup <X size={20} />
            </button>
            <img src={previewImage} className="w-full h-auto rounded-[2rem] border-4 border-white shadow-2xl" alt="preview" />
          </div>
        </div>
      )}
    </div>
  );
}
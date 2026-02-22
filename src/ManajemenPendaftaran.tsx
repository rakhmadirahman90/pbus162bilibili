import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Trash2, RefreshCcw, Search, Phone, MapPin, ChevronLeft, ChevronRight,
  Edit3, X, Save, User, Camera, Loader2, Users, FileSpreadsheet,
  FileText, Plus, Upload, Clock, Calendar, Info
} from 'lucide-react';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- INTERFACES ---
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
}

export default function ManajemenPendaftaran() {
  // --- STATES ---
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [editingItem, setEditingItem] = useState<Registrant | null>(null);
  const [newItem, setNewItem] = useState<Partial<Registrant>>({
    nama: '', whatsapp: '', kategori: 'Pra Dini (U-9)', domisili: '',
    jenis_kelamin: 'Putra', foto_url: ''
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

  // --- UTILS ---
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

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
          canvas.toBlob((blob) => {
            resolve(blob as Blob);
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  // --- EXPORT FUNCTIONS ---
  const exportToExcel = () => {
    if (filteredData.length === 0) return Swal.fire("Opps!", "Tidak ada data untuk diekspor", "warning");
    const dataToExport = filteredData.map((item, index) => ({
      No: index + 1,
      Nama: (item.nama || '').toUpperCase(),
      Gender: item.jenis_kelamin || '-',
      Kategori: item.kategori || '-',
      WhatsApp: item.whatsapp || '-',
      Domisili: item.domisili || '-',
      Tanggal_Daftar: item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pendaftar");
    XLSX.writeFile(workbook, `Data_Atlet_${Date.now()}.xlsx`);
  };

  const exportToPDF = () => {
    if (filteredData.length === 0) return Swal.fire("Opps!", "Tidak ada data untuk diekspor", "warning");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("LAPORAN DATA PENDAFTARAN ATLET", 14, 15);
    const tableColumn = ["No", "Nama Atlet", "Gender", "Kategori", "Domisili", "WhatsApp"];
    const tableRows = filteredData.map((item, index) => [
      index + 1,
      (item.nama || '').toUpperCase(),
      item.jenis_kelamin || '-',
      item.kategori || '-',
      item.domisili || '-',
      item.whatsapp || '-'
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
    });
    doc.save(`Data_Atlet_${Date.now()}.pdf`);
  };

  // --- IMPORT EXCEL ---
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) throw new Error("File kosong");

        const formattedData = data.map((item: any) => ({
          nama: (item.Nama || item.nama || '').toUpperCase(),
          whatsapp: String(item.WhatsApp || item.whatsapp || ''),
          kategori: item.Kategori || item.kategori || 'Umum',
          domisili: (item.Domisili || item.domisili || '').toUpperCase(),
          jenis_kelamin: item.Gender || item.jenis_kelamin || 'Putra',
        }));

        const { error } = await supabase.from('pendaftaran').insert(formattedData);
        if (error) throw error;

        Toast.fire({ icon: 'success', title: `${data.length} Data berhasil diimport` });
        fetchData();
      } catch (err: any) {
        Swal.fire("Gagal Import", err.message, "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- CORE FUNCTIONS ---
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
          if (payload.eventType === 'INSERT') {
            setRegistrants((prev) => [payload.new as Registrant, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRegistrants((prev) => prev.map((item) => item.id === payload.new.id ? (payload.new as Registrant) : item));
          } else if (payload.eventType === 'DELETE') {
            setRegistrants((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredData = (registrants || []).filter(item => {
    const matchSearch =
      (item?.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item?.domisili || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item?.kategori || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchDate = filterDate
      ? new Date(item.created_at).toDateString() === filterDate.toDateString()
      : true;

    return matchSearch && matchDate;
  });
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const deleteOldFile = async (url: string) => {
    if (!url || !url.includes('identitas-atlet')) return;
    try {
      const parts = url.split('/');
      const fileName = parts[parts.length - 1];
      if (fileName) {
        await supabase.storage.from('identitas-atlet').remove([`identitas/${fileName}`]);
      }
    } catch (e) { console.error("Gagal hapus file lama", e); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'edit' | 'add') => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      const compressedBlob = await compressImage(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `identitas/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('identitas-atlet')
        .upload(filePath, compressedBlob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('identitas-atlet').getPublicUrl(filePath);
      
      if (mode === 'edit' && editingItem) {
        setEditingItem({ ...editingItem, foto_url: publicUrl });
      } else {
        setNewItem(prev => ({ ...prev, foto_url: publicUrl }));
      }
      
      Toast.fire({ icon: 'success', title: 'Foto berhasil diunggah' });
    } catch (error: any) { 
      Swal.fire("Gagal upload", error.message, "error"); 
    } finally { 
      setUploading(false); 
    }
  };

  const handleDelete = async (id: string, nama: string, foto_url: string) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `Apakah Anda yakin ingin menghapus data ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        if (foto_url) await deleteOldFile(foto_url);
        const { error } = await supabase.from('pendaftaran').delete().eq('id', id);
        if (error) throw error;
        Toast.fire({ icon: 'success', title: 'Data berhasil dihapus' });
      } catch (error: any) { 
        Swal.fire('Gagal', error.message, 'error'); 
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').insert([{
        ...newItem,
        nama: (newItem.nama || '').toUpperCase(),
        domisili: (newItem.domisili || '').toUpperCase()
      }]);
      if (error) throw error;
      
      setIsAddModalOpen(false);
      setNewItem({ nama: '', whatsapp: '', kategori: 'Pra Dini (U-9)', domisili: '', jenis_kelamin: 'Putra', foto_url: '' });
      Toast.fire({ icon: 'success', title: 'Atlet baru berhasil ditambahkan' });
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || uploading) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').update({
        nama: (editingItem.nama || '').toUpperCase(),
        whatsapp: editingItem.whatsapp,
        domisili: editingItem.domisili.toUpperCase(),
        kategori: editingItem.kategori,
        jenis_kelamin: editingItem.jenis_kelamin, 
        foto_url: editingItem.foto_url
      }).eq('id', editingItem.id);

      if (error) throw error;
      
      setIsEditModalOpen(false);
      Toast.fire({ icon: 'success', title: 'Data berhasil diperbarui' });
    } catch (error: any) { 
      Swal.fire("Gagal", error.message, "error"); 
    } finally { 
      setIsSaving(false); 
    }
  };

  // --- RENDER HELPERS ---
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
      <div className="p-6 bg-slate-50 rounded-full mb-4">
        <Users size={48} className="text-slate-300" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">Tidak ada data ditemukan</h3>
      <p className="text-sm text-slate-500 max-w-xs text-center">Coba ubah kata kunci pencarian atau filter tanggal Anda.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-8">
        
        {/* --- HEADER SECTION --- */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 rotate-3">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 uppercase italic leading-none">
                Manajemen <span className="text-blue-600">Atlet</span>
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                <Clock size={12} className="text-blue-500" /> Database Real-time v2.0
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button onClick={() => setIsAddModalOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-xl font-black text-[11px] tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-100 active:scale-95">
              <Plus size={18} /> TAMBAH ATLET
            </button>

            <label className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-amber-500 text-white px-6 py-3.5 rounded-xl font-black text-[11px] tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 cursor-pointer active:scale-95">
              <Upload size={18} /> IMPORT EXCEL
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
            </label>

            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <button onClick={() => fetchData()} className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all" title="Refresh Data">
                <RefreshCcw size={20} className={loading ? 'animate-spin text-blue-600' : ''} />
              </button>
              <div className="h-8 w-px bg-slate-200 mx-1"></div>
              <button onClick={exportToPDF} className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Ekspor PDF">
                <FileText size={20} />
              </button>
              <button onClick={exportToExcel} className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Ekspor Excel">
                <FileSpreadsheet size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* --- FILTER & SEARCH BAR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
          <div className="lg:col-span-8 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Cari Nama Atlet, Kategori, atau Domisili..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none font-bold text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="lg:col-span-4 flex gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
              <DatePicker
                selected={filterDate}
                onChange={(date) => { setFilterDate(date); setCurrentPage(1); }}
                dateFormat="dd MMM yyyy"
                placeholderText="Filter Tanggal Daftar"
                className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none font-bold text-sm focus:ring-4 focus:ring-blue-100 transition-all"
              />
              {filterDate && (
                <button onClick={() => setFilterDate(null)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- DATA DISPLAY (GRID CARDS) --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-500 font-black text-xs tracking-widest uppercase">Sinkronisasi Data...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              {currentItems.map((atlet) => (
                <div key={atlet.id} className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  
                  {/* Card Header (Photo) */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => atlet.foto_url && setPreviewImage(atlet.foto_url)}>
                    <img 
                      src={atlet.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(atlet.nama)}&background=random&size=200`} 
                      alt={atlet.nama}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all z-10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(atlet); setIsEditModalOpen(true); }} 
                        className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(atlet.id, atlet.nama, atlet.foto_url); }} 
                        className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-rose-600 hover:bg-rose-600 hover:text-white transition-all active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 z-10">
                      <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                        {atlet.kategori}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3 className="text-lg font-black text-slate-900 truncate mb-1 uppercase italic" title={atlet.nama}>{atlet.nama}</h3>
                    <div className="flex items-center gap-2 text-slate-400 mb-4">
                      <MapPin size={14} className="text-blue-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider truncate">{atlet.domisili}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase mb-0.5">Gender</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${atlet.jenis_kelamin === 'Putra' ? 'text-blue-600' : 'text-rose-600'}`}>
                          {atlet.jenis_kelamin}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase mb-0.5">WhatsApp</span>
                        <a href={`https://wa.me/${(atlet.whatsapp || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-700 hover:text-green-500 transition-colors">
                          {atlet.whatsapp}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-8 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <div className="flex flex-col">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Navigasi Data</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Menampilkan halaman {currentPage} dari {totalPages}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:hover:bg-slate-50 transition-all active:scale-95"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="hidden sm:flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setCurrentPage(i + 1)} 
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-transparent text-slate-400 hover:bg-slate-100'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:hover:bg-slate-50 transition-all active:scale-95"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* --- FLOATING STATUS --- */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Sistem Aktif</span>
        </div>
      </div>

      {/* =========================================
          MODALS SECTION (ADD, EDIT, PREVIEW) 
      ========================================= */}

      {/* MODAL TAMBAH (ADD) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Tambah <span className="text-blue-600">Atlet Baru</span></h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Registrasi Data Resmi</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2.5 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 rounded-xl text-slate-400 transition-all active:scale-90">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Photo Upload */}
                <div className="relative shrink-0">
                  <div className="w-32 h-32 rounded-3xl bg-slate-100 border-4 border-slate-50 shadow-inner overflow-hidden flex flex-col items-center justify-center relative">
                    {newItem.foto_url ? (
                      <img src={newItem.foto_url} className="w-full h-full object-cover object-top" alt="preview" /> 
                    ) : (
                      <>
                        <User size={36} className="text-slate-300 mb-1" />
                        <span className="text-[9px] font-black uppercase text-slate-400">No Photo</span>
                      </>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-600" size={28} />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-3 -right-3 p-3.5 bg-blue-600 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-slate-900 hover:-translate-y-1 transition-all border-4 border-white active:scale-95">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'add')} />
                  </label>
                </div>

                {/* Main Inputs */}
                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Lengkap</label>
                    <input 
                      required 
                      value={newItem.nama} 
                      onChange={e => setNewItem({...newItem, nama: e.target.value})} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-300" 
                      placeholder="CONTOH: JONATHAN CHRISTIE" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kategori Umur</label>
                    <select 
                      value={newItem.kategori} 
                      onChange={e => setNewItem({...newItem, kategori: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none cursor-pointer" 
                    >
                      {kategoriUmur.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nomor WhatsApp</label>
                  <input 
                    required 
                    value={newItem.whatsapp} 
                    onChange={e => setNewItem({...newItem, whatsapp: e.target.value})} 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-300" 
                    placeholder="081234567890" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kota Domisili</label>
                  <input 
                    required 
                    value={newItem.domisili} 
                    onChange={e => setNewItem({...newItem, domisili: e.target.value})} 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-sm focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-300" 
                    placeholder="MAKASSAR" 
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Jenis Kelamin</label>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    {['Putra', 'Putri'].map((g) => (
                      <button 
                        key={g} 
                        type="button" 
                        onClick={() => setNewItem({...newItem, jenis_kelamin: g})} 
                        className={`py-3.5 rounded-xl font-black text-[11px] tracking-widest transition-all ${newItem.jenis_kelamin === g ? 'bg-white shadow-sm border border-slate-100 text-blue-600 scale-[1.02]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                      >
                        {g.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button type="submit" disabled={isSaving || uploading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-blue-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Simpan Data Atlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT (EDIT) */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Edit Data <span className="text-amber-500">Atlet</span></h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Perbarui Profil & Administrasi</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2.5 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 rounded-xl text-slate-400 transition-all active:scale-90">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Photo Upload */}
                <div className="relative shrink-0">
                  <div className="w-32 h-32 rounded-3xl bg-slate-100 border-4 border-slate-50 shadow-inner overflow-hidden flex flex-col items-center justify-center relative">
                    {editingItem.foto_url ? (
                      <img src={editingItem.foto_url} className="w-full h-full object-cover object-top" alt="preview" /> 
                    ) : (
                      <>
                        <User size={36} className="text-slate-300 mb-1" />
                        <span className="text-[9px] font-black uppercase text-slate-400">No Photo</span>
                      </>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="animate-spin text-amber-500" size={28} />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-3 -right-3 p-3.5 bg-amber-500 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-slate-900 hover:-translate-y-1 transition-all border-4 border-white active:scale-95">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'edit')} />
                  </label>
                </div>

                {/* Main Inputs */}
                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Lengkap</label>
                    <input 
                      required 
                      value={editingItem.nama} 
                      onChange={e => setEditingItem({...editingItem, nama: e.target.value})} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-sm focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-50 outline-none transition-all placeholder:text-slate-300" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kategori Umur</label>
                    <select 
                      value={editingItem.kategori} 
                      onChange={e => setEditingItem({...editingItem, kategori: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-50 outline-none transition-all appearance-none cursor-pointer" 
                    >
                      {kategoriUmur.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nomor WhatsApp</label>
                  <input 
                    required 
                    value={editingItem.whatsapp} 
                    onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})} 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-50 outline-none transition-all placeholder:text-slate-300" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kota Domisili</label>
                  <input 
                    required 
                    value={editingItem.domisili} 
                    onChange={e => setEditingItem({...editingItem, domisili: e.target.value})} 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-sm focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-50 outline-none transition-all placeholder:text-slate-300" 
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Jenis Kelamin</label>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    {['Putra', 'Putri'].map((g) => (
                      <button 
                        key={g} 
                        type="button" 
                        onClick={() => setEditingItem({...editingItem, jenis_kelamin: g})} 
                        className={`py-3.5 rounded-xl font-black text-[11px] tracking-widest transition-all ${editingItem.jenis_kelamin === g ? 'bg-white shadow-sm border border-amber-100 text-amber-500 scale-[1.02]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                      >
                        {g.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button type="submit" disabled={isSaving || uploading} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-amber-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute -top-14 right-0 text-white/50 hover:text-white transition-colors flex items-center gap-2 font-black uppercase text-[10px] tracking-widest bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              Tutup <X size={16} />
            </button>
            <img src={previewImage} className="w-full h-auto rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 ring-4 ring-white/10" alt="Preview Atlet" />
          </div>
        </div>
      )}

      {/* CUSTOM SCROLLBAR UTILS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
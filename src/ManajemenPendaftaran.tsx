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
  Upload
} from 'lucide-react';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Registrant | null>(null);
  
  // State untuk Tambah Baru
  const [newItem, setNewItem] = useState<Partial<Registrant>>({
    nama: '',
    whatsapp: '',
    kategori: 'Pemula (U-15)',
    domisili: '',
    jenis_kelamin: 'Putra',
    foto_url: ''
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

  // --- EXPORT & IMPORT ---
  const exportToExcel = () => {
    if (filteredData.length === 0) return alert("Tidak ada data untuk diekspor");
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

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setLoading(true);
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const formattedData = data.map(row => ({
          nama: (row.Nama || row.nama || '').toUpperCase(),
          jenis_kelamin: row.Gender || row.jenis_kelamin || 'Putra',
          kategori: row.Kategori || row.kategori || 'Umum',
          whatsapp: String(row.WhatsApp || row.whatsapp || ''),
          domisili: (row.Domisili || row.domisili || '').toUpperCase(),
        }));

        const { error } = await supabase.from('pendaftaran').insert(formattedData);
        if (error) throw error;
        alert(`${formattedData.length} Data berhasil diimport!`);
        fetchData();
      } catch (err: any) {
        alert("Gagal import: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const exportToPDF = () => {
    if (filteredData.length === 0) return alert("Tidak ada data untuk diekspor");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("LAPORAN DATA PENDAFTARAN ATLET", 14, 15);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);
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
      styles: { fontSize: 8 },
    });
    doc.save(`Data_Atlet_${Date.now()}.pdf`);
  };

  // --- DATA FETCHING ---
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

  const filteredData = (registrants || []).filter(item => 
    (item?.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item?.domisili || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item?.kategori || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- STORAGE HELPERS ---
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
      const fileExt = 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `identitas/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('identitas-atlet')
        .upload(filePath, compressedBlob, { 
          contentType: 'image/jpeg',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('identitas-atlet').getPublicUrl(filePath);
      
      if (mode === 'edit' && editingItem) {
        setEditingItem({ ...editingItem, foto_url: publicUrl });
      } else {
        setNewItem(prev => ({ ...prev, foto_url: publicUrl }));
      }
      
    } catch (error: any) { 
      alert("Gagal upload: " + error.message); 
    } finally { 
      setUploading(false); 
    }
  };

  // --- ACTION HANDLERS ---
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').insert([
        { 
          ...newItem, 
          nama: (newItem.nama || '').toUpperCase(),
          domisili: (newItem.domisili || '').toUpperCase() 
        }
      ]);
      if (error) throw error;
      setIsAddModalOpen(false);
      setNewItem({ nama: '', whatsapp: '', kategori: 'Pemula (U-15)', domisili: '', jenis_kelamin: 'Putra', foto_url: '' });
      fetchData();
    } catch (err: any) {
      alert("Gagal menambah: " + err.message);
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
        domisili: editingItem.domisili,
        kategori: editingItem.kategori,
        jenis_kelamin: editingItem.jenis_kelamin, 
        foto_url: editingItem.foto_url
      }).eq('id', editingItem.id);

      if (error) throw error;
      setIsEditModalOpen(false);
      fetchData();
    } catch (error: any) { 
      alert("Gagal menyimpan: " + error.message); 
    } finally { 
      setIsSaving(false); 
    }
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 py-4 md:px-8">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-4">
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

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-[9px] tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-blue-100">
              <Plus size={14} /> TAMBAH ATLET
            </button>
            <label className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-[9px] tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 cursor-pointer">
              <Upload size={14} /> IMPORT EXCEL
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
            </label>
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
            <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2.5 rounded-xl font-bold text-[9px] tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100/50">
              <FileSpreadsheet size={14} /> EXCEL
            </button>
            <button onClick={exportToPDF} className="flex items-center gap-2 bg-rose-600 text-white px-3 py-2.5 rounded-xl font-bold text-[9px] tracking-widest hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-100/50">
              <FileText size={14} /> PDF
            </button>
            <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center">
              <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">Total</span>
              <span className="text-lg font-black text-blue-600 leading-none">{filteredData.length}</span>
            </div>
            <button onClick={fetchData} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200">
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> REFRESH
            </button>
          </div>
        </header>

        {/* SEARCH BAR */}
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

        {/* TABLE SECTION */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="pl-6 pr-2 py-3 font-bold uppercase text-[10px] tracking-widest w-12 text-center">No</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Profil Atlet</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Gender</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Kategori</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest text-center">WhatsApp</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Domisili</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading && registrants.length === 0 ? (
                  <tr><td colSpan={7} className="py-20 text-center text-slate-400 font-bold uppercase text-xs">Memuat Data...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan={7} className="py-20 text-center text-slate-400 font-bold uppercase text-xs">Data Tidak Ditemukan</td></tr>
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
                            <img 
                              src={item.foto_url} 
                              className="w-full h-full object-cover object-top" 
                              style={{ imageRendering: '-webkit-optimize-contrast' }} 
                              alt={item.nama || 'atlet'} 
                            />
                          ) : (
                            <User className="m-auto mt-1.5 text-slate-400" size={18} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs uppercase leading-tight">{item.nama || 'No Name'}</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">ID: {item.id ? item.id.slice(0,6) : 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2">
                      <span className={`text-[10px] font-bold uppercase ${item.jenis_kelamin === 'Putra' ? 'text-blue-600' : 'text-rose-500'}`}>
                        {item.jenis_kelamin || '-'}
                      </span>
                    </td>

                    <td className="px-4 py-2">
                      <span className="inline-flex items-center bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase italic shadow-sm">
                        {item.kategori || 'UMUM'}
                      </span>
                    </td>

                    <td className="px-4 py-2 text-center">
                      <a href={`https://wa.me/${(item.whatsapp || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-green-600 bg-white border border-slate-100 px-3 py-1 rounded-lg transition-all text-[11px]">
                        <Phone size={12} className="text-green-500" /> {item.whatsapp || '-'}
                      </a>
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-600 uppercase text-[10px]">
                        <MapPin size={12} className="text-rose-500" /> {item.domisili || '-'}
                      </div>
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.nama, item.foto_url)} className="p-1.5 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-600 hover:text-white transition-all">
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

        {/* PAGINATION */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-3 bg-slate-900 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Halaman {currentPage} Dari {totalPages || 1}</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 bg-white/10 rounded-lg disabled:opacity-20 hover:bg-white/20 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1.5 flex-wrap justify-center">
                {[...Array(totalPages || 0)].map((_, i) => (
                 <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white/5 hover:bg-white/10 text-white/60'}`}>
                    {i + 1}
                 </button>
                ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 bg-white/10 rounded-lg disabled:opacity-20 hover:bg-white/20 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </div>

      {/* MODAL ADD & EDIT (Reusable logic) */}
      {(isEditModalOpen || isAddModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); }} />
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">
                {isEditModalOpen ? 'Edit Atlet' : 'Tambah Atlet Baru'}
              </h2>
              <button onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); }} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-colors"><X size={18}/></button>
            </div>
            
            <form onSubmit={isEditModalOpen ? handleUpdate : handleAdd} className="p-6 space-y-4">
              {/* Profile Image Section */}
              <div className="flex items-center gap-6 mb-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-white shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {(isEditModalOpen ? editingItem?.foto_url : newItem.foto_url) ? (
                      <img src={isEditModalOpen ? editingItem?.foto_url : newItem.foto_url} className="w-full h-full object-cover object-top" alt="preview" /> 
                    ) : (
                      <User size={30} className="text-slate-200" />
                    )}
                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={20} /></div>}
                  </div>
                  <label className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-lg shadow-lg cursor-pointer hover:bg-slate-900 transition-all">
                    <Camera size={14} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, isEditModalOpen ? 'edit' : 'add')} />
                  </label>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Nama Lengkap</label>
                  <input 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-sm focus:border-blue-600 outline-none" 
                    value={isEditModalOpen ? editingItem?.nama : newItem.nama} 
                    onChange={e => isEditModalOpen ? setEditingItem({...editingItem!, nama: e.target.value}) : setNewItem({...newItem, nama: e.target.value})} 
                    placeholder="Contoh: BUDI SANTOSO"
                    required 
                  />
                </div>
              </div>

              {/* Gender selection */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Putra', 'Putri'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => isEditModalOpen ? setEditingItem({...editingItem!, jenis_kelamin: g}) : setNewItem({...newItem, jenis_kelamin: g})}
                      className={`py-2 rounded-xl font-bold text-xs border-2 transition-all ${(isEditModalOpen ? editingItem?.jenis_kelamin : newItem.jenis_kelamin) === g ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                    >
                      {g.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">WhatsApp</label>
                  <input 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" 
                    value={isEditModalOpen ? editingItem?.whatsapp : newItem.whatsapp} 
                    onChange={e => isEditModalOpen ? setEditingItem({...editingItem!, whatsapp: e.target.value}) : setNewItem({...newItem, whatsapp: e.target.value})} 
                    placeholder="0812..."
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Kategori Umur</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" 
                    value={isEditModalOpen ? editingItem?.kategori : newItem.kategori} 
                    onChange={e => isEditModalOpen ? setEditingItem({...editingItem!, kategori: e.target.value}) : setNewItem({...newItem, kategori: e.target.value})}
                  >
                    {kategoriUmur.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Domisili (Kota)</label>
                  <input 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-sm" 
                    value={isEditModalOpen ? editingItem?.domisili : newItem.domisili} 
                    onChange={e => isEditModalOpen ? setEditingItem({...editingItem!, domisili: e.target.value}) : setNewItem({...newItem, domisili: e.target.value})} 
                    placeholder="KOTA/KABUPATEN"
                    required 
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSaving || uploading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {isEditModalOpen ? 'Simpan Perubahan' : 'Daftarkan Atlet'}
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
            <img src={previewImage} className="w-full h-auto rounded-3xl border-4 border-white shadow-2xl" alt="preview-large" />
          </div>
        </div>
      )}
    </div>
  );
}
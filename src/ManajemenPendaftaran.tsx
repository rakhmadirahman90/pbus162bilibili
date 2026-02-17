import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Trash2, RefreshCcw, Search, Phone, MapPin, 
  ChevronLeft, ChevronRight, Edit3, X, Save, 
  User, Camera, Loader2, Users, FileSpreadsheet, 
  FileText, Plus, Upload, Calendar, Clock, Download
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
  pengalaman?: string;
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
  const [newItem, setNewItem] = useState<Partial<Registrant>>({
    nama: '', whatsapp: '', kategori: 'Dewasa / Umum', 
    domisili: '', jenis_kelamin: 'Putra', foto_url: ''
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

  // --- SWEETALERT NOTIFICATION ---
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });

  // --- DOWNLOAD TEMPLATE EXCEL ---
  const downloadTemplate = () => {
    const templateData = [
      { nama: "BUDI SANTOSO", whatsapp: "08123456789", kategori: "Dewasa / Umum", domisili: "JAKARTA", jenis_kelamin: "Putra" },
      { nama: "SITI AMINAH", whatsapp: "08987654321", kategori: "Remaja (U-17)", domisili: "SURABAYA", jenis_kelamin: "Putri" }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Import");
    XLSX.writeFile(wb, "Template_Import_Atlet.xlsx");
    Toast.fire({ icon: 'success', title: 'Template berhasil diunduh' });
  };

  // --- COMPRESS IMAGE ---
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

  // --- UPLOAD FOTO ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressedBlob = await compressImage(file);
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
      const filePath = `identitas/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('identitas-atlet')
        .upload(filePath, compressedBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('identitas-atlet').getPublicUrl(filePath);
      
      if (mode === 'add') setNewItem(prev => ({ ...prev, foto_url: publicUrl }));
      else setEditingItem(prev => prev ? { ...prev, foto_url: publicUrl } : null);

      Toast.fire({ icon: 'success', title: 'Foto berhasil diunggah' });
    } catch (err: any) {
      Swal.fire("Gagal", err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('pendaftaran').select('*').order('created_at', { ascending: false });
    if (!error) setRegistrants(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('pendaftaran_db').on('postgres_changes', 
      { event: '*', table: 'pendaftaran', schema: 'public' }, () => fetchData()
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- IMPORT MASSAL ---
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

        if (data.length === 0) throw new Error("Excel kosong");

        const formatted = data.map((item: any) => ({
          nama: String(item.nama || '').toUpperCase(),
          whatsapp: String(item.whatsapp || ''),
          kategori: item.kategori || 'Dewasa / Umum',
          domisili: String(item.domisili || '').toUpperCase(),
          jenis_kelamin: item.jenis_kelamin || 'Putra',
          foto_url: ''
        }));

        const { error } = await supabase.from('pendaftaran').insert(formatted);
        if (error) throw error;

        Toast.fire({ icon: 'success', title: `${data.length} Atlet berhasil diimport` });
      } catch (err: any) {
        Swal.fire("Gagal Import", err.message, "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- HANDLERS ---
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase.from('pendaftaran').insert([{
      ...newItem,
      nama: newItem.nama?.toUpperCase(),
      domisili: newItem.domisili?.toUpperCase()
    }]);
    if (!error) {
      setIsAddModalOpen(false);
      setNewItem({ nama: '', whatsapp: '', kategori: 'Dewasa / Umum', domisili: '', jenis_kelamin: 'Putra', foto_url: '' });
      Toast.fire({ icon: 'success', title: 'Atlet berhasil ditambahkan' });
    }
    setIsSaving(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    const { error } = await supabase.from('pendaftaran').update({
      nama: editingItem.nama.toUpperCase(),
      whatsapp: editingItem.whatsapp,
      domisili: editingItem.domisili.toUpperCase(),
      kategori: editingItem.kategori,
      jenis_kelamin: editingItem.jenis_kelamin,
      foto_url: editingItem.foto_url
    }).eq('id', editingItem.id);

    if (!error) {
      setIsEditModalOpen(false);
      Toast.fire({ icon: 'success', title: 'Data berhasil diperbarui' });
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string, nama: string) => {
    const res = await Swal.fire({
      title: 'Hapus Atlet?',
      text: `Hapus permanen data ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!'
    });
    if (res.isConfirmed) {
      await supabase.from('pendaftaran').delete().eq('id', id);
      Toast.fire({ icon: 'success', title: 'Data berhasil dihapus' });
    }
  };

  const filteredData = registrants.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.domisili.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 pb-20">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200">
              <Users className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Database <span className="text-blue-600">Atlet</span></h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Terdaftar: <span className="text-blue-600">{registrants.length}</span> Atlet</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs tracking-widest hover:bg-slate-900 transition-all shadow-lg active:scale-95">
              <Plus size={18} /> TAMBAH ATLET
            </button>
            <button onClick={downloadTemplate} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-3.5 rounded-2xl font-black text-xs tracking-widest hover:bg-slate-200 transition-all">
              <Download size={18} /> TEMPLATE
            </button>
            <label className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3.5 rounded-2xl font-black text-xs tracking-widest hover:bg-emerald-600 transition-all cursor-pointer shadow-lg active:scale-95">
              <Upload size={18} /> IMPORT MASSAL
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
            </label>
          </div>
        </header>

        {/* SEARCH & FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
            <input 
              type="text" placeholder="Cari Nama Atlet atau Domisili..." 
              className="w-full pl-16 pr-8 py-5 bg-white border-none rounded-[1.5rem] font-bold text-sm shadow-xl shadow-slate-200/50 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button onClick={fetchData} className="flex items-center justify-center gap-3 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> REFRESH
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-7 text-center">No</th>
                  <th className="px-6 py-7">Profil Atlet</th>
                  <th className="px-6 py-7 text-center">Gender</th>
                  <th className="px-6 py-7">Kategori</th>
                  <th className="px-6 py-7">Lokasi & Kontak</th>
                  <th className="px-6 py-7">Waktu Registrasi</th>
                  <th className="px-8 py-7 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-all group">
                    <td className="px-8 py-5 text-center font-black text-slate-300 group-hover:text-blue-600">
                      {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div onClick={() => item.foto_url && setPreviewImage(item.foto_url)} className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-md overflow-hidden flex-shrink-0 cursor-zoom-in">
                          {item.foto_url ? <img src={item.foto_url} className="w-full h-full object-cover" /> : <User className="m-auto mt-2 text-slate-300" />}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm uppercase leading-none mb-1">{item.nama}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {item.id.split('-')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${item.jenis_kelamin === 'Putra' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.jenis_kelamin}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase border border-slate-200">{item.kategori}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-2 text-[11px] font-bold text-slate-700"><Phone size={12} className="text-green-500" /> {item.whatsapp}</span>
                        <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase"><MapPin size={12} className="text-rose-500" /> {item.domisili}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2 text-[11px] font-black text-slate-800 uppercase italic"><Calendar size={12} className="text-blue-600" /> {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest"><Clock size={12} /> {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit3 size={16}/></button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* PAGINATION */}
          <div className="bg-slate-900 px-10 py-5 flex justify-between items-center text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Halaman {currentPage} / {totalPages || 1}</p>
            <div className="flex gap-3">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all disabled:opacity-20"><ChevronLeft size={20}/></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all disabled:opacity-20"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ADD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
             <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter">Tambah <span className="text-blue-600">Atlet</span></h2>
               <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-rose-100 text-rose-500 rounded-xl transition-all"><X size={20}/></button>
             </div>
             <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
               <div className="flex items-center gap-6 mb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden">
                      {newItem.foto_url ? <img src={newItem.foto_url} className="w-full h-full object-cover" /> : <User className="m-auto mt-6 text-slate-200" size={32} />}
                      {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-all">
                      <Camera size={16} />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'add')} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Nama Lengkap</label>
                    <input className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold uppercase text-sm focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Budi Santoso" value={newItem.nama} onChange={e => setNewItem({...newItem, nama: e.target.value})} required />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">WhatsApp</label>
                    <input className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500" placeholder="08..." value={newItem.whatsapp} onChange={e => setNewItem({...newItem, whatsapp: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Kategori</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500" value={newItem.kategori} onChange={e => setNewItem({...newItem, kategori: e.target.value})}>
                      {kategoriUmur.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Domisili</label>
                    <input className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold uppercase text-sm focus:ring-2 focus:ring-blue-500" placeholder="Kota" value={newItem.domisili} onChange={e => setNewItem({...newItem, domisili: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Gender</label>
                    <select className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500" value={newItem.jenis_kelamin} onChange={e => setNewItem({...newItem, jenis_kelamin: e.target.value})}>
                      <option value="Putra">PUTRA</option>
                      <option value="Putri">PUTRI</option>
                    </select>
                  </div>
               </div>
               <button type="submit" disabled={isSaving || uploading} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-3 active:scale-95">
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} SIMPAN ATLET
               </button>
             </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {previewImage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-full max-h-[80vh] rounded-[2rem] border-8 border-white shadow-2xl animate-in zoom-in duration-300" />
        </div>
      )}
    </div>
  );
}
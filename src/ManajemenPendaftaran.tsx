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
  UserPlus // Icon baru untuk tombol tambah
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State Modal Tambah
  const [editingItem, setEditingItem] = useState<Registrant | null>(null);
  
  // State untuk form tambah baru
  const [newItem, setNewItem] = useState({
    nama: '',
    whatsapp: '',
    kategori: 'Dewasa / Umum',
    domisili: 'Parepare',
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

  // --- KOMPRESI GAMBAR ---
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

  // --- FETCH DATA ---
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
  }, []);

  // --- HANDLE UPLOAD FOTO (Untuk Tambah & Edit) ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'add' | 'edit') => {
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
      
      if (mode === 'edit') {
        setEditingItem(prev => prev ? { ...prev, foto_url: publicUrl } : null);
      } else {
        setNewItem(prev => ({ ...prev, foto_url: publicUrl }));
      }
      
    } catch (error: any) { 
      alert("Gagal upload: " + error.message); 
    } finally { 
      setUploading(false); 
    }
  };

  // --- HANDLE SIMPAN ATLET BARU ---
  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').insert([
        { 
          nama: newItem.nama.toUpperCase(),
          whatsapp: newItem.whatsapp,
          kategori: newItem.kategori,
          domisili: newItem.domisili,
          jenis_kelamin: newItem.jenis_kelamin,
          foto_url: newItem.foto_url
        }
      ]);

      if (error) throw error;
      
      setIsAddModalOpen(false);
      setNewItem({ nama: '', whatsapp: '', kategori: 'Dewasa / Umum', domisili: 'Parepare', jenis_kelamin: 'Putra', foto_url: '' });
      fetchData();
      alert("Atlet berhasil didaftarkan!");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- KODE LAINNYA (Update, Delete, Export) tetap sama ---
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
    } catch (error: any) { alert("Gagal: " + error.message); } finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string, nama: string, foto_url: string) => {
    if (window.confirm(`Hapus data ${nama}?`)) {
      try {
        const { error } = await supabase.from('pendaftaran').delete().eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (error: any) { alert('Gagal: ' + error.message); }
    }
  };

  const exportToExcel = () => { /* ... isi sama ... */ };
  const exportToPDF = () => { /* ... isi sama ... */ };

  const filteredData = registrants.filter(item => 
    (item.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.domisili || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Registrasi & Pendaftaran</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* TOMBOL TAMBAH ATLET BARU */}
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              <UserPlus size={16} /> TAMBAH ATLET
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
            
            <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2.5 rounded-xl font-bold text-[9px] tracking-widest hover:bg-emerald-700 transition-all">
              <FileSpreadsheet size={14} /> EXCEL
            </button>
            <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* SEARCH BAR (isi sama) */}
        <section className="mb-4">
           <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm transition-all focus-within:border-blue-500">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input type="text" placeholder="Cari nama atau kota..." className="w-full pl-12 pr-6 py-3 bg-transparent outline-none font-bold text-sm placeholder:text-slate-300" onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
           </div>
        </section>

        {/* TABLE (isi sama) */}
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
                {currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-all group">
                    <td className="pl-6 pr-2 py-2 text-center text-xs font-black text-slate-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <img src={item.foto_url || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-lg object-cover" alt="foto" />
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs uppercase">{item.nama}</h4>
                          <span className="text-[9px] text-slate-400 font-bold">REG: {new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-[10px] font-bold uppercase text-blue-600">{item.jenis_kelamin}</td>
                    <td className="px-4 py-2"><span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-black italic">{item.kategori}</span></td>
                    <td className="px-4 py-2 text-center text-[11px] font-bold text-slate-700">{item.whatsapp}</td>
                    <td className="px-4 py-2 text-[10px] font-bold text-slate-600 uppercase"><MapPin size={12} className="inline mr-1 text-rose-500" />{item.domisili}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit3 size={14}/></button>
                        <button onClick={() => handleDelete(item.id, item.nama, item.foto_url)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* PAGINATION (isi sama) */}
        <footer className="flex justify-between items-center px-6 py-3 bg-slate-900 rounded-2xl text-white">
           <p className="text-[9px] font-bold uppercase opacity-60">Halaman {currentPage} Dari {totalPages}</p>
           <div className="flex gap-2">
             <button onClick={() => setCurrentPage(p => Math.max(p-1, 1))} className="p-1 bg-white/10 rounded"><ChevronLeft size={16}/></button>
             <button onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))} className="p-1 bg-white/10 rounded"><ChevronRight size={16}/></button>
           </div>
        </footer>
      </div>

      {/* --- MODAL TAMBAH ATLET BARU --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
              <h2 className="text-lg font-black uppercase italic tracking-tighter">Registrasi Atlet Baru</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleAddNew} className="p-6 space-y-4">
              <div className="flex flex-col items-center mb-2">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 border-4 border-slate-50 shadow-inner overflow-hidden flex items-center justify-center">
                    {newItem.foto_url ? (
                      <img src={newItem.foto_url} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <User size={40} className="text-slate-300" />
                    )}
                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-2xl shadow-xl cursor-pointer hover:scale-110 transition-all">
                    <Camera size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'add')} />
                  </label>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Unggah Foto Identitas</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Nama Lengkap</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                  placeholder="Contoh: BUDI SANTOSO"
                  value={newItem.nama} 
                  onChange={e => setNewItem({...newItem, nama: e.target.value})} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">WhatsApp</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" placeholder="0812..." value={newItem.whatsapp} onChange={e => setNewItem({...newItem, whatsapp: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Kategori Umur</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" value={newItem.kategori} onChange={e => setNewItem({...newItem, kategori: e.target.value})}>
                    {kategoriUmur.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Jenis Kelamin</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" value={newItem.jenis_kelamin} onChange={e => setNewItem({...newItem, jenis_kelamin: e.target.value})}>
                    <option value="Putra">PUTRA</option>
                    <option value="Putri">PUTRI</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Domisili</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-sm" placeholder="Parepare" value={newItem.domisili} onChange={e => setNewItem({...newItem, domisili: e.target.value})} required />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSaving || uploading} 
                className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Daftarkan Atlet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT (Isi tetap sama dengan penyesuaian sedikit agar seragam) */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h2 className="text-lg font-black text-slate-900 uppercase italic">Update Data Atlet</h2>
               <button onClick={() => setIsEditModalOpen(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
               {/* ... Form edit sama dengan yang Anda miliki ... */}
               <div className="flex items-center gap-4">
                  <img src={editingItem.foto_url} className="w-16 h-16 rounded-xl object-cover" />
                  <input className="flex-1 px-4 py-2 bg-slate-50 border rounded-xl font-bold uppercase" value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} />
               </div>
               <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold uppercase">Simpan Perubahan</button>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW (Tetap sama) */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-lg w-full rounded-3xl border-4 border-white shadow-2xl" alt="preview" />
        </div>
      )}
    </div>
  );
}
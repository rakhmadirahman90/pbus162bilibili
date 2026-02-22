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
  Activity
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
  const [newItem, setNewItem] = useState<Partial<Registrant>>({
    nama: '',
    whatsapp: '',
    kategori: 'Pra Dini (U-9)',
    domisili: '',
    jenis_kelamin: 'Putra',
    foto_url: '',
    kategori_atlet: 'Muda'
  });
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 8; 

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // --- STATISTIK ---
  const stats = {
    total: registrants.length,
    putra: registrants.filter(r => r.jenis_kelamin === 'Putra').length,
    putri: registrants.filter(r => r.jenis_kelamin === 'Putri').length,
    muda: registrants.filter(r => r.kategori_atlet === 'Muda').length,
    mudaPA: registrants.filter(r => r.kategori_atlet === 'Muda' && r.jenis_kelamin === 'Putra').length,
    mudaPI: registrants.filter(r => r.kategori_atlet === 'Muda' && r.jenis_kelamin === 'Putri').length,
    senior: registrants.filter(r => r.kategori_atlet === 'Senior').length,
    seniorPA: registrants.filter(r => r.kategori_atlet === 'Senior' && r.jenis_kelamin === 'Putra').length,
    seniorPI: registrants.filter(r => r.kategori_atlet === 'Senior' && r.jenis_kelamin === 'Putri').length,
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
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = registrants.filter(item => 
    (item.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.domisili || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // --- EXPORT & IMPORT FUNCTIONS ---
  const exportToExcel = () => {
    if (filteredData.length === 0) return Swal.fire("Opps!", "Tidak ada data", "warning");
    const dataToExport = filteredData.map((item, index) => ({
      No: index + 1,
      Nama: (item.nama || '').toUpperCase(),
      Gender: item.jenis_kelamin,
      Kategori_Umur: item.kategori,
      Kategori_Atlet: item.kategori_atlet,
      WhatsApp: item.whatsapp,
      Domisili: item.domisili,
      Tanggal_Daftar: new Date(item.created_at).toLocaleDateString('id-ID')
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pendaftar");
    XLSX.writeFile(workbook, `Data_Atlet_${Date.now()}.xlsx`);
  };

  const exportToPDF = () => {
    if (filteredData.length === 0) return Swal.fire("Opps!", "Tidak ada data", "warning");
    const doc = new jsPDF();
    doc.text("LAPORAN DATA PENDAFTARAN ATLET", 14, 15);
    const tableRows = filteredData.map((item, index) => [
      index + 1, item.nama.toUpperCase(), item.jenis_kelamin, item.kategori_atlet, item.kategori, item.domisili, item.whatsapp
    ]);
    autoTable(doc, {
      head: [["No", "Nama", "Gender", "Kat. Atlet", "Kat. Umur", "Domisili", "WhatsApp"]],
      body: tableRows,
      startY: 25,
      theme: 'grid'
    });
    doc.save(`Data_Atlet_${Date.now()}.pdf`);
  };

  const downloadTemplate = () => {
    const templateData = [{ Nama: "CONTOH NAMA", WhatsApp: "0812345678", Kategori_Umur: "Dewasa", Kategori_Atlet: "Senior", Domisili: "KOTA", Gender: "Putra" }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Import_Atlet.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        const formatted = data.map((item: any) => ({
          nama: (item.Nama || '').toUpperCase(),
          whatsapp: String(item.WhatsApp || ''),
          kategori: item.Kategori_Umur || 'Umum',
          kategori_atlet: item.Kategori_Atlet || 'Muda',
          domisili: (item.Domisili || '').toUpperCase(),
          jenis_kelamin: item.Gender || 'Putra',
        }));
        const { error } = await supabase.from('pendaftaran').insert(formatted);
        if (error) throw error;
        Toast.fire({ icon: 'success', title: 'Data berhasil diimport' });
        fetchData();
      } catch (err: any) { Swal.fire("Gagal", err.message, "error"); }
    };
    reader.readAsBinaryString(file);
  };

  // --- CRUD HANDLERS ---
  const handleDelete = async (id: string, nama: string) => {
    const result = await Swal.fire({
      title: 'Hapus data?',
      text: `Hapus data ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus'
    });
    if (result.isConfirmed) {
      const { error } = await supabase.from('pendaftaran').delete().eq('id', id);
      if (!error) {
        Toast.fire({ icon: 'success', title: 'Terhapus' });
        fetchData();
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').insert([{...newItem, nama: newItem.nama?.toUpperCase(), domisili: newItem.domisili?.toUpperCase()}]);
      if (error) throw error;
      setIsAddModalOpen(false);
      fetchData();
      Toast.fire({ icon: 'success', title: 'Berhasil didaftarkan' });
    } catch (error: any) { Swal.fire('Error', error.message, 'error'); }
    finally { setIsSaving(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').update({...editingItem, nama: editingItem.nama.toUpperCase()}).eq('id', editingItem.id);
      if (error) throw error;
      setIsEditModalOpen(false);
      fetchData();
      Toast.fire({ icon: 'success', title: 'Data diperbarui' });
    } catch (error: any) { Swal.fire('Error', error.message, 'error'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        
        {/* HEADER & ACTIONS (KEMBALI LENGKAP) */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg text-white"><Users size={28} /></div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase italic">Manajemen <span className="text-blue-600">Atlet</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Database Administrasi</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-[10px] tracking-widest hover:bg-slate-900 transition-all">
              <Plus size={16} /> TAMBAH ATLET
            </button>
            <button onClick={downloadTemplate} className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-3 rounded-xl font-bold text-[10px] tracking-widest hover:bg-indigo-600 transition-all">
              <Download size={16} /> TEMPLATE
            </button>
            <label className="flex items-center gap-2 bg-amber-500 text-white px-4 py-3 rounded-xl font-bold text-[10px] tracking-widest hover:bg-amber-600 cursor-pointer transition-all">
              <Upload size={16} /> IMPORT EXCEL
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
            </label>
            <div className="flex gap-1 border-l pl-2 border-slate-200">
              <button onClick={exportToExcel} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><FileSpreadsheet size={18} /></button>
              <button onClick={exportToPDF} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><FileText size={18} /></button>
              <button onClick={fetchData} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all"><RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /></button>
            </div>
          </div>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase">Total</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.total}</h3>
          </div>
          <div className="bg-white p-5 rounded-3xl border-l-4 border-l-blue-500 shadow-sm">
            <p className="text-[9px] font-black text-blue-500 uppercase">Putra</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.putra}</h3>
          </div>
          <div className="bg-white p-5 rounded-3xl border-l-4 border-l-rose-500 shadow-sm">
            <p className="text-[9px] font-black text-rose-500 uppercase">Putri</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.putri}</h3>
          </div>
          <div className="bg-white p-5 rounded-3xl border-l-4 border-l-indigo-500 shadow-sm">
            <p className="text-[9px] font-black text-indigo-500 uppercase">Muda</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.muda}</h3>
            <p className="text-[8px] font-bold text-slate-400">PA:{stats.mudaPA} PI:{stats.mudaPI}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border-l-4 border-l-emerald-500 shadow-sm">
            <p className="text-[9px] font-black text-emerald-500 uppercase">Senior</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.senior}</h3>
            <p className="text-[8px] font-bold text-slate-400">PA:{stats.seniorPA} PI:{stats.seniorPI}</p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Cari nama atau domisili..." className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 shadow-sm font-bold text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[1100px] lg:min-w-full">
              <thead>
                <tr className="bg-slate-900 text-white text-[9px] uppercase tracking-widest">
                  <th className="w-[50px] px-4 py-5 text-center">No</th>
                  <th className="w-[220px] px-4 py-5">Nama Atlet</th>
                  <th className="w-[100px] px-2 py-5">Gender</th>
                  <th className="w-[150px] px-2 py-5">Kategori Umur</th>
                  <th className="w-[120px] px-2 py-5">Kat. Atlet</th>
                  <th className="w-[140px] px-2 py-5">WhatsApp</th>
                  <th className="w-[140px] px-2 py-5">Domisili</th>
                  <th className="w-[100px] px-4 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors text-[11px]">
                    <td className="px-4 py-3 text-center font-bold text-slate-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-3 font-black text-slate-800 uppercase truncate">{item.nama}</td>
                    <td className="px-2 py-3"><span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${item.jenis_kelamin === 'Putra' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>{item.jenis_kelamin}</span></td>
                    <td className="px-2 py-3 font-bold text-slate-600 uppercase">{item.kategori}</td>
                    <td className="px-2 py-3 font-black uppercase text-indigo-600">{item.kategori_atlet}</td>
                    <td className="px-2 py-3 font-bold text-slate-500">{item.whatsapp}</td>
                    <td className="px-2 py-3 font-bold text-slate-500 uppercase truncate">{item.domisili}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit3 size={14}/></button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50 border-t flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total {filteredData.length} Atlet</p>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white border rounded-lg disabled:opacity-50"><ChevronLeft size={16}/></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white border rounded-lg disabled:opacity-50"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ADD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center">
              <h2 className="text-xl font-black uppercase italic">Tambah <span className="text-blue-600">Atlet</span></h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={24}/></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nama Lengkap</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-xs" onChange={e => setNewItem({...newItem, nama: e.target.value})} required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Kategori Atlet</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs" onChange={e => setNewItem({...newItem, kategori_atlet: e.target.value})}>
                    <option value="Muda">Muda</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Jenis Kelamin</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs" onChange={e => setNewItem({...newItem, jenis_kelamin: e.target.value})}>
                    <option value="Putra">Putra</option>
                    <option value="Putri">Putri</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">WhatsApp</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs" onChange={e => setNewItem({...newItem, whatsapp: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">
                {isSaving ? 'Menyimpan...' : 'Daftarkan Atlet'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
             <div className="p-8 border-b flex justify-between items-center">
              <h2 className="text-xl font-black uppercase italic">Edit <span className="text-blue-600">Atlet</span></h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={24}/></button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nama Lengkap</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-xs" value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Kategori Atlet</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs" value={editingItem.kategori_atlet} onChange={e => setEditingItem({...editingItem, kategori_atlet: e.target.value})}>
                    <option value="Muda">Muda</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase text-slate-400">Jenis Kelamin</label>
                   <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs" value={editingItem.jenis_kelamin} onChange={e => setEditingItem({...editingItem, jenis_kelamin: e.target.value})}>
                    <option value="Putra">Putra</option>
                    <option value="Putri">Putri</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
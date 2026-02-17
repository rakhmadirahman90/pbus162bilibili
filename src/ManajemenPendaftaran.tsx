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
  const notify = (title: string, icon: 'success' | 'error' | 'warning') => {
    Swal.fire({
      title: title,
      icon: icon,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      timerProgressBar: true,
    });
  };

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
    notify("Template Berhasil Diunduh", "success");
  };

  // --- IMPORT MASSAL EXCEL ---
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) throw new Error("File Excel kosong atau format salah");

        const formattedData = data.map((item: any) => ({
          nama: String(item.nama || '').toUpperCase(),
          whatsapp: String(item.whatsapp || ''),
          kategori: item.kategori || 'Dewasa / Umum',
          domisili: String(item.domisili || '').toUpperCase(),
          jenis_kelamin: item.jenis_kelamin || 'Putra',
          foto_url: '' // Default kosong untuk import massal
        }));

        const { error } = await supabase.from('pendaftaran').insert(formattedData);
        if (error) throw error;

        notify(`${data.length} Atlet Berhasil Diimport`, "success");
        fetchData();
      } catch (err: any) {
        Swal.fire("Gagal Import", err.message, "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('pendaftaran').select('*').order('created_at', { ascending: false });
    if (!error) setRegistrants(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('pendaftaran_realtime').on('postgres_changes', 
      { event: '*', table: 'pendaftaran', schema: 'public' }, () => fetchData()
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDelete = async (id: string, nama: string) => {
    const confirm = await Swal.fire({
      title: `Hapus ${nama}?`,
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      const { error } = await supabase.from('pendaftaran').delete().eq('id', id);
      if (!error) notify("Data Terhapus", "success");
    }
  };

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
      notify("Atlet Berhasil Ditambahkan", "success");
    }
    setIsSaving(false);
  };

  const filteredData = registrants.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.domisili.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200">
              <Users className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">Database <span className="text-blue-600">Atlet</span></h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Terdaftar: {registrants.length} Orang</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-100">
              <Plus size={18} /> TAMBAH MANUAL
            </button>
            
            <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <button onClick={downloadTemplate} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 px-3 py-1.5 font-bold text-[10px] uppercase">
                <Download size={14} /> Template
              </button>
              <label className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer hover:bg-emerald-600 transition-all uppercase">
                <Upload size={14} /> Import Massal
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
              </label>
            </div>
          </div>
        </header>

        {/* SEARCH & REFRESH */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" placeholder="Cari Nama Atlet atau Domisili..." 
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm shadow-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button onClick={fetchData} className="flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> Segarkan Data
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-6 text-center">No</th>
                  <th className="px-6 py-6">Profil Atlet</th>
                  <th className="px-6 py-6">Kategori</th>
                  <th className="px-6 py-6">Lokasi & Kontak</th>
                  <th className="px-6 py-6">Waktu Registrasi</th>
                  <th className="px-8 py-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-5 text-center font-black text-slate-300 group-hover:text-blue-600 transition-colors">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                          {item.foto_url ? <img src={item.foto_url} className="w-full h-full object-cover" /> : <User className="m-auto mt-2 text-slate-300" />}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm uppercase">{item.nama}</p>
                          <p className={`text-[9px] font-black uppercase ${item.jenis_kelamin === 'Putra' ? 'text-blue-500' : 'text-rose-500'}`}>{item.jenis_kelamin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 uppercase border border-slate-200">{item.kategori}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-[11px] font-bold text-slate-600"><Phone size={12} className="text-green-500" /> {item.whatsapp}</span>
                        <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase"><MapPin size={12} className="text-rose-500" /> {item.domisili}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2 text-[11px] font-black text-slate-700 uppercase italic"><Calendar size={12} className="text-blue-500" /> {new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                        <span className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest"><Clock size={12} /> {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit3 size={16}/></button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* PAGINATION */}
          <div className="bg-slate-900 px-8 py-4 flex justify-between items-center text-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hal {currentPage} / {totalPages || 1}</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={20}/></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH MASUKKAN DISINI SEPERTI KODE SEBELUMNYA ... */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
             <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter">Tambah <span className="text-blue-600">Atlet Baru</span></h2>
               <div className="space-y-4">
                  <input className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-sm" placeholder="Nama Lengkap" value={newItem.nama} onChange={e => setNewItem({...newItem, nama: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-4">
                    <input className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" placeholder="WhatsApp" value={newItem.whatsapp} onChange={e => setNewItem({...newItem, whatsapp: e.target.value})} required />
                    <select className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" value={newItem.kategori} onChange={e => setNewItem({...newItem, kategori: e.target.value})}>
                      {kategoriUmur.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <input className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-sm" placeholder="Domisili (Kota)" value={newItem.domisili} onChange={e => setNewItem({...newItem, domisili: e.target.value})} required />
               </div>
               <button type="submit" disabled={isSaving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all">
                  {isSaving ? <Loader2 className="animate-spin mx-auto" /> : "Simpan Atlet"}
               </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
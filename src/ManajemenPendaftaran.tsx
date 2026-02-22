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
  TrendingUp,
  CheckCircle2
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
  kategori_atlet: string; // Tambahan kolom kategori_atlet
}

export default function ManajemenPendaftaran() {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Registrant | null>(null);
  
  // State untuk Tambah Data Baru
  const [newItem, setNewItem] = useState<Partial<Registrant>>({
    nama: '',
    whatsapp: '',
    kategori: 'Pra Dini (U-9)',
    domisili: '',
    jenis_kelamin: 'Putra',
    foto_url: '',
    kategori_atlet: 'Muda' // Default kategori
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

  // --- LOGIKA STATISTIK (SENIOR & MUDA PER GENDER) ---
  const stats = {
    total: registrants.length,
    muda: {
      total: registrants.filter(r => r.kategori_atlet === 'Muda').length,
      pa: registrants.filter(r => r.kategori_atlet === 'Muda' && r.jenis_kelamin === 'Putra').length,
      pi: registrants.filter(r => r.kategori_atlet === 'Muda' && r.jenis_kelamin === 'Putri').length,
    },
    senior: {
      total: registrants.filter(r => r.kategori_atlet === 'Senior').length,
      pa: registrants.filter(r => r.kategori_atlet === 'Senior' && r.jenis_kelamin === 'Putra').length,
      pi: registrants.filter(r => r.kategori_atlet === 'Senior' && r.jenis_kelamin === 'Putri').length,
    }
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
      console.error('Error fetching:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      setNewItem({ nama: '', whatsapp: '', kategori: 'Pra Dini (U-9)', domisili: '', jenis_kelamin: 'Putra', foto_url: '', kategori_atlet: 'Muda' });
      fetchData();
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Atlet berhasil ditambahkan', timer: 2000 });
    } catch (error: any) {
      Swal.fire('Gagal', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredData = registrants.filter(item => 
    item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.domisili?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-100 text-white">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                Manajemen <span className="text-blue-600">Pendaftaran</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Sistem Database Atlet Terintegrasi</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[11px] tracking-widest hover:bg-blue-600 shadow-lg transition-all active:scale-95">
              <Plus size={18} /> TAMBAH ATLET
            </button>
            <button onClick={fetchData} className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* STATS CARDS (SENIOR & MUDA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Activity size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pendaftar</p>
              <h3 className="text-2xl font-black text-slate-900">{stats.total} <span className="text-xs font-bold text-slate-400">Atlet</span></h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Kategori Muda</p>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-slate-800">{stats.muda.total}</h3>
              <div className="flex gap-3 text-[10px] font-black uppercase">
                <span className="text-blue-500">{stats.muda.pa} Putra</span>
                <span className="text-rose-500">{stats.muda.pi} Putri</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Kategori Senior</p>
              <TrendingUp size={16} className="text-indigo-500" />
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-slate-800">{stats.senior.total}</h3>
              <div className="flex gap-3 text-[10px] font-black uppercase">
                <span className="text-blue-500">{stats.senior.pa} Putra</span>
                <span className="text-rose-500">{stats.senior.pi} Putri</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama atlet atau asal domisili..." 
            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm font-bold text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE SECTION - RESPONSIVE OPTIMIZED */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="w-full overflow-x-auto lg:overflow-x-visible">
            <table className="w-full text-left border-collapse min-w-[900px] lg:min-w-full">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-6 py-6 text-center w-16">No</th>
                  <th className="px-6 py-6">Informasi Atlet</th>
                  <th className="px-6 py-6">Kategori Umur</th>
                  <th className="px-6 py-6">Tipe Atlet</th>
                  <th className="px-6 py-6">Domisili</th>
                  <th className="px-6 py-6">WhatsApp</th>
                  <th className="px-6 py-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5 text-center font-black text-slate-300 text-xs">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div onClick={() => item.foto_url && setPreviewImage(item.foto_url)} className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden cursor-zoom-in border border-slate-200 flex-shrink-0 shadow-sm">
                          {item.foto_url ? <img src={item.foto_url} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-3 text-slate-300"/>}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 uppercase text-xs tracking-tight">{item.nama}</span>
                          <span className={`text-[9px] font-black uppercase ${item.jenis_kelamin === 'Putra' ? 'text-blue-500' : 'text-rose-500'}`}>{item.jenis_kelamin}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-600 uppercase text-[10px]">{item.kategori}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest ${item.kategori_atlet === 'Senior' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        {item.kategori_atlet || 'Muda'}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-500 uppercase text-xs">{item.domisili}</td>
                    <td className="px-6 py-5">
                      <a href={`https://wa.me/${item.whatsapp}`} target="_blank" className="flex items-center gap-2 font-bold text-slate-700 text-xs hover:text-blue-600 transition-colors">
                        <Phone size={14} className="text-emerald-500"/> {item.whatsapp}
                      </a>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"><Edit3 size={16}/></button>
                        <button onClick={() => {/* Fungsi Hapus */}} className="p-2.5 text-rose-600 hover:bg-rose-100 rounded-xl transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* PAGINATION */}
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Halaman {currentPage} dari {totalPages || 1}</p>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm"><ChevronLeft size={18}/></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm"><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ADD ATLET */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200"><Plus size={24} /></div>
                <h2 className="text-xl font-black uppercase italic leading-none text-slate-900">Tambah <span className="text-blue-600">Atlet</span></h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 text-slate-400 hover:text-rose-500 transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nama Lengkap</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs outline-none focus:border-blue-500 transition-all" value={newItem.nama} onChange={e => setNewItem({...newItem, nama: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">WhatsApp</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:border-blue-500 transition-all" value={newItem.whatsapp} onChange={e => setNewItem({...newItem, whatsapp: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tipe Atlet</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none cursor-pointer" value={newItem.kategori_atlet} onChange={e => setNewItem({...newItem, kategori_atlet: e.target.value})}>
                    <option value="Muda">Muda</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Jenis Kelamin</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none cursor-pointer" value={newItem.jenis_kelamin} onChange={e => setNewItem({...newItem, jenis_kelamin: e.target.value})}>
                    <option value="Putra">Putra</option>
                    <option value="Putri">Putri</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kategori Umur</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none cursor-pointer" value={newItem.kategori} onChange={e => setNewItem({...newItem, kategori: e.target.value})}>
                    {kategoriUmur.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Asal Domisili</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs outline-none focus:border-blue-500 transition-all" value={newItem.domisili} onChange={e => setNewItem({...newItem, domisili: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} SIMPAN DATA ATLET
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-xl w-full">
            <button className="absolute -top-12 right-0 text-white flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">Tutup <X size={20} /></button>
            <img src={previewImage} className="w-full h-auto rounded-[2rem] border-4 border-white shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
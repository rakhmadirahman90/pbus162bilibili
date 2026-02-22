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
  Download,
  Activity
} from 'lucide-react';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

[cite_start]// 1. Definisi Interface Lengkap dengan kategori_atlet [cite: 5, 102]
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
  
  [cite_start]// 2. Default State untuk Atlet Baru [cite: 7, 104]
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

  const kategoriUmur = [
    "Pra Dini (U-9)", "Usia Dini (U-11)", "Anak-anak (U-13)", 
    "Pemula (U-15)", "Remaja (U-17)", "Taruna (U-19)", 
    "Dewasa / Umum", "Veteran (35+ / 40+)"
  ];

  [cite_start]// 3. Logika Statistik Real-time (Muda & Senior per Gender) [cite: 10, 11, 12, 13, 14, 15]
  const stats = {
    total: registrants.length,
    putra: registrants.filter(r => r.jenis_kelamin === 'Putra').length,
    putri: registrants.filter(r => r.jenis_kelamin === 'Putri').length,
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

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // --- CORE FUNCTIONS (Supabase) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pendaftaran').select('*').order('created_at', { ascending: false });
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

  [cite_start]// 4. Perbaikan pada handleAddSubmit untuk menyimpan kategori_atlet [cite: 53, 54, 161]
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
      setNewItem({ nama: '', whatsapp: '', kategori: 'Pra Dini (U-9)', domisili: '', jenis_kelamin: 'Putra', foto_url: '', kategori_atlet: 'Muda' });
      fetchData();
      Toast.fire({ icon: 'success', title: 'Atlet berhasil ditambahkan' });
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  [cite_start]// 5. Filter data yang juga mencari berdasarkan kategori_atlet [cite: 38, 141]
  const filteredData = registrants.filter(item => 
    (item.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.domisili || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.kategori_atlet || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 text-white">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">
                Manajemen <span className="text-blue-600">Atlet</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Database Pendaftaran Aktif</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[11px] tracking-widest hover:bg-blue-600 shadow-xl transition-all active:scale-95">
              <Plus size={18} /> TAMBAH ATLET
            </button>
            <button onClick={fetchData} className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        [cite_start]{/* 6. STATISTIK MUDA & SENIOR (Responsive Grid) [cite: 62, 63, 64] */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
            <h3 className="text-2xl font-black">{stats.total}</h3>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Atlet Muda</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.muda.total}</h3>
            <div className="flex gap-2 text-[9px] font-bold uppercase mt-1">
              <span className="text-blue-500">{stats.muda.pa} PA</span>
              <span className="text-rose-500">{stats.muda.pi} PI</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm border-l-4 border-l-indigo-500">
            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Atlet Senior</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.senior.total}</h3>
            <div className="flex gap-2 text-[9px] font-bold uppercase mt-1">
              <span className="text-blue-500">{stats.senior.pa} PA</span>
              <span className="text-rose-500">{stats.senior.pi} PI</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm col-span-1">
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Total Putra</p>
            <h3 className="text-2xl font-black">{stats.putra}</h3>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm col-span-1">
            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Total Putri</p>
            <h3 className="text-2xl font-black">{stats.putri}</h3>
          </div>
        </section>

        {/* SEARCH */}
        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama, domisili atau tipe atlet (muda/senior)..." 
            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm font-bold text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        [cite_start]{/* 7. TABEL MANAJEMEN - OPTIMASI RESPONSIVE (No Scroll di Desktop) [cite: 170] */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="w-full overflow-x-auto lg:overflow-visible">
            <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-full">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest font-black">
                  <th className="px-6 py-6 text-center w-16">No</th>
                  <th className="px-6 py-6">Atlet</th>
                  <th className="px-6 py-6">Kategori Umur</th>
                  <th className="px-6 py-6">Tipe Atlet</th>
                  <th className="px-6 py-6">WhatsApp</th>
                  <th className="px-6 py-6">Domisili</th>
                  <th className="px-6 py-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-5 text-center font-black text-slate-300 text-xs">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                          {item.foto_url ? <img src={item.foto_url} className="w-full h-full object-cover" /> : <User className="m-auto mt-2 text-slate-300" size={20}/>}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 uppercase text-xs">{item.nama}</p>
                          <p className={`text-[9px] font-bold uppercase ${item.jenis_kelamin === 'Putra' ? 'text-blue-500' : 'text-rose-500'}`}>{item.jenis_kelamin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-600 text-[10px] uppercase">{item.kategori}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider ${item.kategori_atlet === 'Senior' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.kategori_atlet}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-500 text-xs">{item.whatsapp}</td>
                    <td className="px-6 py-5 font-bold text-slate-500 uppercase text-xs">{item.domisili}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"><Edit3 size={16}/></button>
                        <button className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      [cite_start]{/* 8. MODAL ADD - DENGAN KOLOM KATEGORI_ATLET [cite: 162] */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black uppercase italic text-slate-900">Tambah <span className="text-blue-600">Atlet Baru</span></h2>
              <button onClick={() => setIsAddModalOpen(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nama Lengkap</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs focus:border-blue-500 outline-none" value={newItem.nama} onChange={e => setNewItem({...newItem, nama: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nomor WhatsApp</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs focus:border-blue-500 outline-none" value={newItem.whatsapp} onChange={e => setNewItem({...newItem, whatsapp: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tipe Atlet</label>
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none" value={newItem.kategori_atlet} onChange={e => setNewItem({...newItem, kategori_atlet: e.target.value})}>
                  <option value="Muda">Muda</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Jenis Kelamin</label>
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none" value={newItem.jenis_kelamin} onChange={e => setNewItem({...newItem, jenis_kelamin: e.target.value})}>
                  <option value="Putra">Putra</option>
                  <option value="Putri">Putri</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Domisili</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs focus:border-blue-500 outline-none" value={newItem.domisili} onChange={e => setNewItem({...newItem, domisili: e.target.value})} />
              </div>
              <button type="submit" disabled={isSaving} className="md:col-span-2 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} SIMPAN DATA ATLET
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
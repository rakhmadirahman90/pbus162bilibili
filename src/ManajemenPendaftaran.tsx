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
  TrendingUp
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
  kategori_atlet: string; // Penambahan sesuai Database
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

  const kategoriUmur = [
    "Pra Dini (U-9)", "Usia Dini (U-11)", "Anak-anak (U-13)", 
    "Pemula (U-15)", "Remaja (U-17)", "Taruna (U-19)", 
    "Dewasa / Umum", "Veteran (35+ / 40+)"
  ];

  // --- LOGIKA STATISTIK BERDASARKAN DATABASE ---
  const stats = {
    total: registrants.length,
    muda: {
      total: registrants.filter(r => r.kategori_atlet === 'Muda').length,
      putra: registrants.filter(r => r.kategori_atlet === 'Muda' && r.jenis_kelamin === 'Putra').length,
      putri: registrants.filter(r => r.kategori_atlet === 'Muda' && r.jenis_kelamin === 'Putri').length,
    },
    senior: {
      total: registrants.filter(r => r.kategori_atlet === 'Senior').length,
      putra: registrants.filter(r => r.kategori_atlet === 'Senior' && r.jenis_kelamin === 'Putra').length,
      putri: registrants.filter(r => r.kategori_atlet === 'Senior' && r.jenis_kelamin === 'Putri').length,
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
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'add' | 'edit') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `identitas/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('identitas-atlet').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('identitas-atlet').getPublicUrl(filePath);
      
      if (mode === 'add') setNewItem({ ...newItem, foto_url: publicUrl });
      else if (editingItem) setEditingItem({ ...editingItem, foto_url: publicUrl });
      
      Swal.fire({ icon: 'success', title: 'Foto berhasil diunggah', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (error: any) {
      Swal.fire('Gagal!', error.message, 'error');
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
      setNewItem({ nama: '', whatsapp: '', kategori: 'Pra Dini (U-9)', domisili: '', jenis_kelamin: 'Putra', foto_url: '', kategori_atlet: 'Muda' });
      fetchData();
      Swal.fire('Berhasil!', 'Atlet baru telah ditambahkan.', 'success');
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
      Swal.fire({ icon: 'success', title: 'Data diperbarui', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (error: any) { Swal.fire('Error', error.message, 'error'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string, nama: string) => {
    const res = await Swal.fire({
      title: 'Hapus Data?',
      text: `Data atlet ${nama} akan dihapus secara permanen.`,
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
        Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
      }
    }
  };

  const filteredData = registrants.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.domisili.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 text-white">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">
                Manajemen <span className="text-blue-600">Atlet</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Database Pendaftaran Real-time</p>
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

        {/* STATS SECTION (SENIOR & MUDA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Users size={28} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pendaftar</p>
              <h3 className="text-3xl font-black text-slate-900">{stats.total} <span className="text-sm font-bold text-slate-400">Atlet</span></h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Kategori Muda</p>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <div className="flex justify-between items-end">
              <h3 className="text-3xl font-black text-slate-900">{stats.muda.total}</h3>
              <div className="flex gap-3 text-[11px] font-black uppercase">
                <span className="text-blue-600">{stats.muda.putra} PA</span>
                <span className="text-rose-500">{stats.muda.putri} PI</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Kategori Senior</p>
              <Activity size={16} className="text-indigo-500" />
            </div>
            <div className="flex justify-between items-end">
              <h3 className="text-3xl font-black text-slate-900">{stats.senior.total}</h3>
              <div className="flex gap-3 text-[11px] font-black uppercase">
                <span className="text-blue-600">{stats.senior.putra} PA</span>
                <span className="text-rose-500">{stats.senior.putri} PI</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama atlet atau domisili..." 
            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm font-bold text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE CONTAINER - OPTIMIZED FOR NO SCROLL */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="w-full overflow-x-auto lg:overflow-x-visible">
            <table className="w-full text-left border-collapse min-w-[900px] lg:min-w-full">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest font-black">
                  <th className="px-6 py-6 text-center w-16">No</th>
                  <th className="px-6 py-6">Profil Atlet</th>
                  <th className="px-6 py-6">Kategori</th>
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
                      <div className="flex items-center gap-4">
                        <div onClick={() => item.foto_url && setPreviewImage(item.foto_url)} className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden cursor-zoom-in border border-slate-200 flex-shrink-0">
                          {item.foto_url ? <img src={item.foto_url} className="w-full h-full object-cover" /> : <User size={18} className="m-auto mt-3 text-slate-300"/>}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 uppercase text-xs tracking-tight group-hover:text-blue-600 transition-colors">{item.nama}</span>
                          <span className={`text-[9px] font-black uppercase ${item.jenis_kelamin === 'Putra' ? 'text-blue-500' : 'text-rose-500'}`}>{item.jenis_kelamin}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-600 uppercase text-[10px]">{item.kategori}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest ${item.kategori_atlet === 'Senior' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.kategori_atlet}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-500 text-xs">{item.whatsapp}</td>
                    <td className="px-6 py-5 font-bold text-slate-500 uppercase text-xs">{item.domisili}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"><Edit3 size={16}/></button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="p-2.5 text-rose-600 hover:bg-rose-100 rounded-xl transition-all"><Trash2 size={16}/></button>
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
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all shadow-sm"><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ADD */}
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
                <div className="md:col-span-2 flex justify-center pb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden">
                      {newItem.foto_url ? <img src={newItem.foto_url} className="w-full h-full object-cover" /> : <User size={40} className="m-auto mt-6 text-slate-200"/>}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-slate-900 transition-all">
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'add')} />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nama Lengkap</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs outline-none focus:border-blue-500 transition-all" value={newItem.nama} onChange={e => setNewItem({...newItem, nama: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nomor WhatsApp</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:border-blue-500 transition-all" value={newItem.whatsapp} onChange={e => setNewItem({...newItem, whatsapp: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tipe Atlet</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none" value={newItem.kategori_atlet} onChange={e => setNewItem({...newItem, kategori_atlet: e.target.value})}>
                    <option value="Muda">Muda</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Jenis Kelamin</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none" value={newItem.jenis_kelamin} onChange={e => setNewItem({...newItem, jenis_kelamin: e.target.value})}>
                    <option value="Putra">Putra</option>
                    <option value="Putri">Putri</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kategori Umur</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none" value={newItem.kategori} onChange={e => setNewItem({...newItem, kategori: e.target.value})}>
                    {kategoriUmur.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Domisili</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs outline-none focus:border-blue-500 transition-all" value={newItem.domisili} onChange={e => setNewItem({...newItem, domisili: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={isSaving || uploading} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} DAFTARKAN ATLET
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200"><Edit3 size={24} /></div>
                <h2 className="text-xl font-black uppercase italic leading-none text-slate-900">Edit <span className="text-indigo-600">Data Atlet</span></h2>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-3 text-slate-400 hover:text-rose-500 transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex justify-center pb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden">
                      {editingItem.foto_url ? <img src={editingItem.foto_url} className="w-full h-full object-cover" /> : <User size={40} className="m-auto mt-6 text-slate-200"/>}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-slate-900 transition-all">
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'edit')} />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nama Lengkap</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs outline-none focus:border-indigo-500 transition-all" value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nomor WhatsApp</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:border-indigo-500 transition-all" value={editingItem.whatsapp} onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tipe Atlet</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none" value={editingItem.kategori_atlet} onChange={e => setEditingItem({...editingItem, kategori_atlet: e.target.value})}>
                    <option value="Muda">Muda</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Domisili</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs outline-none focus:border-indigo-500 transition-all" value={editingItem.domisili} onChange={e => setEditingItem({...editingItem, domisili: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={isSaving || uploading} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} SIMPAN PERUBAHAN
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
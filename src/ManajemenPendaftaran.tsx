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
  kategori_atlet: string; // Penambahan kolom kategori atlet sesuai database
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

  // --- LOGIKA PERHITUNGAN STATISTIK (SINKRON DENGAN DATABASE) ---
  const totalPendaftar = registrants.length;
  
  const getStats = () => {
    const muda = registrants.filter(r => r.kategori_atlet === 'Muda');
    const senior = registrants.filter(r => r.kategori_atlet === 'Senior');
    
    return {
      totalMuda: muda.length,
      mudaPA: muda.filter(r => r.jenis_kelamin === 'Putra').length,
      mudaPI: muda.filter(r => r.jenis_kelamin === 'Putri').length,
      totalSenior: senior.length,
      seniorPA: senior.filter(r => r.jenis_kelamin === 'Putra').length,
      seniorPI: senior.filter(r => r.jenis_kelamin === 'Putri').length,
    };
  };

  const stats = getStats();

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

  const filteredData = registrants.filter(item => 
    (item.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.domisili || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.kategori_atlet || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- CORE FUNCTIONS (CRUD) ---
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
      
      if (mode === 'add') setNewItem({...newItem, foto_url: publicUrl});
      else if (editingItem) setEditingItem({...editingItem, foto_url: publicUrl});
      
      Swal.fire({ icon: 'success', title: 'Foto berhasil diunggah', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (error: any) {
      Swal.fire('Gagal Upload', error.message, 'error');
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
      fetchData();
      Swal.fire('Berhasil', 'Data atlet telah ditambahkan', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').update({
        ...editingItem,
        nama: editingItem.nama.toUpperCase(),
        domisili: editingItem.domisili.toUpperCase()
      }).eq('id', editingItem.id);
      if (error) throw error;
      setIsEditModalOpen(false);
      fetchData();
      Swal.fire('Berhasil', 'Informasi atlet diperbarui', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus data?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!'
    });
    if (result.isConfirmed) {
      const { error } = await supabase.from('pendaftaran').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 text-white">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black italic uppercase leading-none">Manajemen <span className="text-blue-600">Atlet</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Sistem Informasi Pendaftaran Terpadu</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-black text-[10px] tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-100 uppercase">
              <Plus size={16} /> Tambah Atlet
            </button>
            <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* STATISTICS CARDS (RESPONSIVE & SINKRON) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Pendaftar</p>
            <h3 className="text-3xl font-black mt-1 text-slate-900">{totalPendaftar}</h3>
          </div>
          
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm border-l-4 border-l-indigo-500">
            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Atlet Muda</p>
            <h3 className="text-3xl font-black mt-1 text-slate-900">{stats.totalMuda}</h3>
            <div className="flex gap-2 mt-1 text-[9px] font-bold uppercase text-slate-400">
              <span>PA: <b className="text-blue-500">{stats.mudaPA}</b></span>
              <span>PI: <b className="text-rose-500">{stats.mudaPI}</b></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Atlet Senior</p>
            <h3 className="text-3xl font-black mt-1 text-slate-900">{stats.totalSenior}</h3>
            <div className="flex gap-2 mt-1 text-[9px] font-bold uppercase text-slate-400">
              <span>PA: <b className="text-blue-500">{stats.seniorPA}</b></span>
              <span>PI: <b className="text-rose-500">{stats.seniorPI}</b></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gender Mix</p>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-xl font-black text-blue-600">♂ {registrants.filter(r => r.jenis_kelamin === 'Putra').length}</span>
              <span className="text-xl font-black text-rose-500">♀ {registrants.filter(r => r.jenis_kelamin === 'Putri').length}</span>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Cari berdasarkan nama, domisili, atau kategori..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* TABLE SECTION (FIT LAYOUT) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left border-collapse table-fixed min-w-[1100px] lg:min-w-full">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
                  <th className="w-[50px] px-4 py-6 font-bold text-center">No</th>
                  <th className="w-[250px] px-4 py-6 font-bold">Profil Atlet</th>
                  <th className="w-[100px] px-2 py-6 font-bold">Gender</th>
                  <th className="w-[150px] px-2 py-6 font-bold">Kat. Umur</th>
                  <th className="w-[130px] px-2 py-6 font-bold">Kat. Atlet</th>
                  <th className="w-[150px] px-2 py-6 font-bold">Kontak</th>
                  <th className="w-[150px] px-2 py-6 font-bold">Domisili</th>
                  <th className="w-[120px] px-2 py-6 font-bold">Terdaftar</th>
                  <th className="w-[100px] px-6 py-6 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={9} className="py-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest">Memuat database...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan={9} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">Tidak ada data ditemukan</td></tr>
                ) : currentItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-4 py-4 text-center font-black text-slate-300">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {item.foto_url ? (
                            <img src={item.foto_url} className="w-full h-full object-cover object-top" alt="" />
                          ) : (
                            <User size={20} className="m-auto mt-2 text-slate-300" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-black text-[11px] text-slate-800 uppercase truncate" title={item.nama}>{item.nama || 'Tanpa Nama'}</p>
                          <p className="text-[9px] text-slate-400 font-bold">ID-{item.id.slice(0, 5)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${item.jenis_kelamin === 'Putra' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                        {item.jenis_kelamin}
                      </span>
                    </td>
                    <td className="px-2 py-4 font-bold text-slate-600 text-[10px] uppercase">{item.kategori}</td>
                    <td className="px-2 py-4">
                      <span className={`flex items-center gap-1.5 font-black text-[10px] uppercase ${item.kategori_atlet === 'Senior' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        <Activity size={12} /> {item.kategori_atlet}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      <a href={`https://wa.me/${item.whatsapp}`} className="inline-flex items-center gap-1.5 font-bold text-slate-500 hover:text-blue-600 transition-colors">
                        <Phone size={12} className="text-green-500" /> <span className="text-[10px]">{item.whatsapp}</span>
                      </a>
                    </td>
                    <td className="px-2 py-4 font-bold text-slate-500 text-[10px] uppercase truncate" title={item.domisili}>{item.domisili}</td>
                    <td className="px-2 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-600">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                        <span className="text-[8px] font-medium text-slate-400 italic">{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit3 size={16}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* PAGINATION */}
          <footer className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Halaman {currentPage} dari {totalPages || 1} — Total {filteredData.length} Atlet
            </p>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <ChevronLeft size={18} />
              </button>
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* MODAL TAMBAH (ADD) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Pendaftaran <span className="text-blue-600">Atlet Baru</span></h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nama Lengkap</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs focus:border-blue-500 outline-none" placeholder="Masukkan nama..." onChange={e => setNewItem({...newItem, nama: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kategori Atlet</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" value={newItem.kategori_atlet} onChange={e => setNewItem({...newItem, kategori_atlet: e.target.value})}>
                    <option value="Muda">Muda</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Jenis Kelamin</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" value={newItem.jenis_kelamin} onChange={e => setNewItem({...newItem, jenis_kelamin: e.target.value})}>
                    <option value="Putra">Putra</option>
                    <option value="Putri">Putri</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kategori Umur</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" onChange={e => setNewItem({...newItem, kategori: e.target.value})}>
                    {kategoriUmur.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nomor WhatsApp</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" placeholder="08..." onChange={e => setNewItem({...newItem, whatsapp: e.target.value})} required />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kota Domisili</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs" placeholder="Contoh: Jakarta" onChange={e => setNewItem({...newItem, domisili: e.target.value})} required />
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-slate-900 transition-all">
                {isSaving ? 'Memproses...' : 'Daftarkan Atlet'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Edit Data <span className="text-blue-600">Atlet</span></h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden border-4 border-white shadow-xl">
                    {editingItem.foto_url ? (
                      <img src={editingItem.foto_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User size={40} className="m-auto mt-6 text-slate-200" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Camera size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'edit')} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nama Lengkap</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs" value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kategori Atlet</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" value={editingItem.kategori_atlet} onChange={e => setEditingItem({...editingItem, kategori_atlet: e.target.value})}>
                    <option value="Muda">Muda</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Jenis Kelamin</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" value={editingItem.jenis_kelamin} onChange={e => setEditingItem({...editingItem, jenis_kelamin: e.target.value})}>
                    <option value="Putra">Putra</option>
                    <option value="Putri">Putri</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-600 transition-all">
                {isSaving ? 'Menyimpan...' : 'Perbarui Data'}
              </button>
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
            <img src={previewImage} className="w-full h-auto rounded-[2rem] border-4 border-white shadow-2xl animate-in zoom-in duration-300" alt="preview" />
          </div>
        </div>
      )}
    </div>
  );
}
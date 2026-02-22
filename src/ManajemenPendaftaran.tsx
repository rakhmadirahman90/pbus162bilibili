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
  kategori_atlet: string; // Penambahan kolom sesuai database
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

  // --- LOGIKA STATISTIK (SINKRON DENGAN TABEL) ---
  const stats = {
    total: registrants.length,
    muda: registrants.filter(r => r.kategori_atlet === 'Muda').length,
    mudaPA: registrants.filter(r => r.kategori_atlet === 'Muda' && r.jenis_kelamin === 'Putra').length,
    mudaPI: registrants.filter(r => r.kategori_atlet === 'Muda' && r.jenis_kelamin === 'Putri').length,
    senior: registrants.filter(r => r.kategori_atlet === 'Senior').length,
    seniorPA: registrants.filter(r => r.kategori_atlet === 'Senior' && r.jenis_kelamin === 'Putra').length,
    seniorPI: registrants.filter(r => r.kategori_atlet === 'Senior' && r.jenis_kelamin === 'Putri').length,
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

  // --- CRUD HANDLERS ---
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
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').insert([newItem]);
      if (error) throw error;
      setIsAddModalOpen(false);
      fetchData();
      Swal.fire('Berhasil', 'Atlet berhasil didaftarkan', 'success');
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
      const { error } = await supabase.from('pendaftaran').update(editingItem).eq('id', editingItem.id);
      if (error) throw error;
      setIsEditModalOpen(false);
      fetchData();
      Swal.fire('Berhasil', 'Data diperbarui', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus data?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus'
    });
    if (result.isConfirmed) {
      const { error } = await supabase.from('pendaftaran').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        
        {/* HEADER & ACTIONS */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg text-white">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase italic">Manajemen <span className="text-blue-600">Pendaftaran</span></h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Database Atlet Terpusat</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-[11px] hover:bg-slate-900 transition-all uppercase tracking-wider">
              <Plus size={16} /> Tambah Atlet
            </button>
            <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* STATS CARDS - AUTO SYNC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase">Total Atlet</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.total}</h3>
          </div>
          <div className="bg-white p-5 rounded-3xl border-l-4 border-l-indigo-500 shadow-sm">
            <p className="text-[10px] font-black text-indigo-500 uppercase">Atlet Muda</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.muda}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">PA: {stats.mudaPA} | PI: {stats.mudaPI}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border-l-4 border-l-emerald-500 shadow-sm">
            <p className="text-[10px] font-black text-emerald-500 uppercase">Atlet Senior</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.senior}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">PA: {stats.seniorPA} | PI: {stats.seniorPI}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase">Gender Mix</p>
            <div className="flex gap-3 mt-2">
              <span className="text-blue-600 font-black">♂ {stats.mudaPA + stats.seniorPA}</span>
              <span className="text-rose-500 font-black">♀ {stats.mudaPI + stats.seniorPI}</span>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atau domisili..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* DATA TABLE - RESPONSIVE FIT */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px] lg:min-w-full">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-tighter">
                  <th className="w-[50px] px-4 py-5 text-center">No</th>
                  <th className="w-[220px] px-4 py-5">Nama Atlet</th>
                  <th className="w-[100px] px-2 py-5">Gender</th>
                  <th className="w-[150px] px-2 py-5">Kategori Umur</th>
                  <th className="w-[120px] px-2 py-5">Kat. Atlet</th>
                  <th className="w-[140px] px-2 py-5">WhatsApp</th>
                  <th className="w-[140px] px-2 py-5">Domisili</th>
                  <th className="w-[120px] px-2 py-5">Tgl Daftar</th>
                  <th className="w-[100px] px-4 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors text-[11px]">
                    <td className="px-4 py-3 text-center font-bold text-slate-400">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.foto_url || 'https://via.placeholder.com/40'} 
                          className="w-8 h-8 rounded-lg object-cover bg-slate-100" 
                          alt="" 
                        />
                        <span className="font-black text-slate-800 uppercase truncate block">{item.nama}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${item.jenis_kelamin === 'Putra' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.jenis_kelamin}
                      </span>
                    </td>
                    <td className="px-2 py-3 font-bold text-slate-600 uppercase">{item.kategori}</td>
                    <td className="px-2 py-3">
                      <span className={`font-black uppercase ${item.kategori_atlet === 'Senior' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {item.kategori_atlet}
                      </span>
                    </td>
                    <td className="px-2 py-3 font-bold text-slate-500">{item.whatsapp}</td>
                    <td className="px-2 py-3 font-bold text-slate-500 uppercase truncate">{item.domisili}</td>
                    <td className="px-2 py-3 text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit3 size={14}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* PAGINATION */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Menampilkan {currentItems.length} dari {filteredData.length} Atlet</p>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50"><ChevronLeft size={16}/></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ADD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
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
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-100">
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
             <div className="p-8 border-b border-slate-100 flex justify-between items-center">
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
              <button type="submit" disabled={isSaving} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl">
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
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
  UserCheck,
  VenetianMask,
  Male,
  Female
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
  const [editingItem, setEditingItem] = useState<Registrant | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrants();
  }, []);

  const fetchRegistrants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pendaftaran_atlet')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrants(data || []);
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC STATISTIK ---
  const stats = {
    total: registrants.length,
    atlet: registrants.filter(r => r.kategori === 'Atlet').length,
    umum: registrants.filter(r => r.kategori === 'Umum').length,
    pria: registrants.filter(r => r.jenis_kelamin === 'Laki-laki').length,
    wanita: registrants.filter(r => r.jenis_kelamin === 'Perempuan').length,
  };

  const filteredData = registrants.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.domisili.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Apakah anda yakin?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('pendaftaran_atlet')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setRegistrants(registrants.filter(r => r.id !== id));
        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  const handleEdit = (item: Registrant) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('pendaftaran_atlet')
        .update({
          nama: editingItem.nama,
          whatsapp: editingItem.whatsapp,
          kategori: editingItem.kategori,
          domisili: editingItem.domisili,
          pengalaman: editingItem.pengalaman,
          jenis_kelamin: editingItem.jenis_kelamin,
          kategori_atlet: editingItem.kategori_atlet
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      setRegistrants(registrants.map(r => r.id === editingItem.id ? editingItem : r));
      setIsEditModalOpen(false);
      Swal.fire('Berhasil!', 'Data telah diperbarui.', 'success');
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredData.map(r => ({
      Nama: r.nama,
      WhatsApp: r.whatsapp,
      Gender: r.jenis_kelamin,
      Kategori: r.kategori,
      Sub_Kategori: r.kategori_atlet,
      Domisili: r.domisili,
      Pengalaman: r.pengalaman,
      Tanggal_Daftar: new Date(r.created_at).toLocaleDateString('id-ID')
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pendaftar");
    XLSX.writeFile(wb, "Data_Pendaftar.xlsx");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Users className="text-blue-600" size={28} />
              MANAJEMEN PENDAFTARAN
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Kelola dan pantau data peserta yang masuk.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchRegistrants}
              className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
            >
              <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"
            >
              <FileSpreadsheet size={18} /> EXPORT EXCEL
            </button>
          </div>
        </div>

        {/* STATS CARDS - REALTIME DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Total</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900">{stats.total}</h3>
            <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-tighter">Pendaftar Masuk</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Activity size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Kategori</span>
            </div>
            <div className="flex gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">{stats.atlet}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Atlet</p>
              </div>
              <div className="border-l border-slate-100 pl-4">
                <h3 className="text-xl font-black text-slate-900">{stats.umum}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Umum</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <UserCheck size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Gender</span>
            </div>
            <div className="flex gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">{stats.pria}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase">L-Laki</p>
              </div>
              <div className="border-l border-slate-100 pl-4">
                <h3 className="text-xl font-black text-slate-900">{stats.wanita}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Prpuan</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/10 text-white rounded-2xl">
                <Calendar size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Update</span>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
            </h3>
            <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-tighter">Status: System Online</p>
          </div>
        </div>

        {/* SEARCH & TABLE SECTION */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Cari nama atau domisili..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
              Menampilkan {filteredData.length} Peserta
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profil</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Info Peserta</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Domisili</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <p className="text-slate-400 font-bold text-sm tracking-widest animate-pulse">MEMUAT DATA...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div 
                          className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden cursor-pointer border-2 border-white shadow-sm"
                          onClick={() => setPreviewImage(item.foto_url)}
                        >
                          {item.foto_url ? (
                            <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <User size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900 text-sm uppercase tracking-tight">{item.nama}</div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1 font-medium">
                          <Phone size={12} className="text-blue-500" /> {item.whatsapp}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">{item.jenis_kelamin}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          item.kategori === 'Atlet' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.kategori}
                        </span>
                        <div className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase italic">{item.kategori_atlet || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-1.5 text-slate-600 text-xs font-bold uppercase">
                          <MapPin size={14} className="text-rose-500 mt-0.5" />
                          {item.domisili}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-2.5 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2.5 bg-white text-rose-500 rounded-xl border border-slate-200 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="font-black text-xs tracking-[0.3em] uppercase">Edit Data Peserta</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Lengkap</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold" value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">WhatsApp</label>
                    <input className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold" value={editingItem.whatsapp} onChange={e => setEditingItem({...editingItem, whatsapp: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Kategori</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold" value={editingItem.kategori} onChange={e => setEditingItem({...editingItem, kategori: e.target.value})}>
                      <option value="Umum">Umum</option>
                      <option value="Atlet">Atlet</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Domisili</label>
                  <input className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold" value={editingItem.domisili} onChange={e => setEditingItem({...editingItem, domisili: e.target.value})} required />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button type="submit" disabled={isSaving} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95">
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Simpan Perubahan
                </button>
              </div>
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
            <img src={previewImage} alt="Preview" className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white/10" />
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Trash2, 
  RefreshCcw, 
  Search, 
  Phone, 
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
  Calendar,
  Activity,
  TrendingUp,
  Maximize2
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [newItem, setNewItem] = useState<Partial<Registrant>>({
    nama: '', whatsapp: '', kategori: 'Pra Dini (U-9)', domisili: '',
    jenis_kelamin: 'Putra', foto_url: '', kategori_atlet: 'Muda'
  });

  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pendaftaran').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRegistrants(data || []);
    } catch (error: any) { console.error(error.message); }
    finally { setLoading(false); }
  };

  // --- FORMAT TANGGAL ---
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // --- EXPORT & DOWNLOAD ---
  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ nama: '', whatsapp: '', kategori: '', domisili: '', jenis_kelamin: '', kategori_atlet: '' }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Import_Atlet.xlsx");
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(registrants);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Atlet");
    XLSX.writeFile(wb, "Data_Pendaftaran_Atlet.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Nama', 'WhatsApp', 'Kategori Umur', 'Domisili', 'Registrasi']],
      body: registrants.map(r => [r.nama, r.whatsapp, r.kategori, r.domisili, formatDate(r.created_at)]),
    });
    doc.save("Data_Atlet.pdf");
  };

  // --- UPLOAD FOTO ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'add' | 'edit') => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `atlet/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('identitas-atlet').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('identitas-atlet').getPublicUrl(filePath);
      
      if (mode === 'add') setNewItem({ ...newItem, foto_url: publicUrl });
      else setEditingItem(prev => prev ? { ...prev, foto_url: publicUrl } : null);
    } catch (error: any) { 
      Swal.fire("Gagal", "Gagal upload: " + error.message, "error"); 
    } finally { setUploading(false); }
  };

  // --- CRUD HANDLERS ---
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').insert([{ ...newItem, nama: newItem.nama?.toUpperCase() }]);
      if (error) throw error;
      setIsAddModalOpen(false);
      setNewItem({ nama: '', whatsapp: '', kategori: 'Pra Dini (U-9)', domisili: '', jenis_kelamin: 'Putra', foto_url: '', kategori_atlet: 'Muda' });
      fetchData();
      Swal.fire("Berhasil", "Atlet baru ditambahkan", "success");
    } catch (error: any) { Swal.fire("Error", error.message, "error"); }
    finally { setIsSaving(false); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').update({ ...editingItem, nama: editingItem.nama.toUpperCase() }).eq('id', editingItem.id);
      if (error) throw error;
      setIsEditModalOpen(false);
      fetchData();
      Swal.fire("Sukses", "Data diperbarui", "success");
    } catch (error: any) { Swal.fire("Error", error.message, "error"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({ title: 'Hapus?', text: "Data tidak bisa kembali!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#e11d48' });
    if (result.isConfirmed) {
      await supabase.from('pendaftaran').delete().eq('id', id);
      fetchData();
    }
  };

  // --- FILTER & STATS ---
  const filteredData = registrants.filter(item => item.nama.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const stats = {
    total: registrants.length,
    muda: registrants.filter(r => r.kategori_atlet === 'Muda').length,
    senior: registrants.filter(r => r.kategori_atlet === 'Senior').length
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-200"><Users size={32} /></div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase italic leading-none">Manajemen <span className="text-blue-600">Database</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Atlet Muda & Senior PB. Persada</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] tracking-widest hover:bg-blue-600 transition-all"><Plus size={16}/> TAMBAH ATLET</button>
            <button onClick={downloadTemplate} className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3.5 rounded-2xl font-black text-[10px] tracking-widest hover:bg-slate-100 transition-all"><Upload size={16}/> TEMPLATE</button>
            <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl font-black text-[10px] tracking-widest hover:bg-emerald-700 transition-all shadow-md"><FileSpreadsheet size={16}/> EXCEL</button>
            <button onClick={exportToPDF} className="flex items-center gap-2 bg-rose-600 text-white px-5 py-3.5 rounded-2xl font-black text-[10px] tracking-widest hover:bg-rose-700 transition-all shadow-md"><FileText size={16}/> PDF</button>
          </div>
        </header>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Activity size={24}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Atlet</p><h3 className="text-2xl font-black">{stats.total}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><TrendingUp size={24}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Atlet Muda</p><h3 className="text-2xl font-black">{stats.muda}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><TrendingUp size={24}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Atlet Senior</p><h3 className="text-2xl font-black">{stats.senior}</h3></div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input type="text" placeholder="Cari nama atlet..." className="w-full pl-12 pr-6 py-3.5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={fetchData} className="p-3.5 text-slate-400 hover:text-blue-600 transition-all"><RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/></button>
          </div>

          <div className="overflow-x-auto lg:overflow-visible">
            <table className="w-full text-left min-w-[1000px] lg:min-w-full">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-6 py-6 text-center w-16">No</th>
                  <th className="px-6 py-6">Profil Atlet</th>
                  <th className="px-6 py-6">Waktu Registrasi</th>
                  <th className="px-6 py-6">Kategori</th>
                  <th className="px-6 py-6">WhatsApp</th>
                  <th className="px-6 py-6">Status</th>
                  <th className="px-6 py-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-all group">
                    <td className="px-6 py-5 text-center font-black text-slate-300 text-xs">{(currentPage-1)*itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div onClick={() => item.foto_url && setPreviewImage(item.foto_url)} className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden cursor-zoom-in border-2 border-transparent group-hover:border-blue-200 transition-all shadow-sm">
                          {item.foto_url ? <img src={item.foto_url} className="w-full h-full object-cover" /> : <User size={20} className="m-auto mt-3 text-slate-300"/>}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all"><Maximize2 size={14}/></div>
                        </div>
                        <div>
                          <p className="font-black text-slate-800 uppercase text-xs leading-none mb-1">{item.nama}</p>
                          <p className={`text-[9px] font-black uppercase ${item.jenis_kelamin === 'Putra' ? 'text-blue-500' : 'text-rose-500'}`}>{item.jenis_kelamin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px]">
                        <Calendar size={12} className="text-blue-500"/> {formatDate(item.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-600 uppercase text-[10px]">{item.kategori}</td>
                    <td className="px-6 py-5">
                      <a href={`https://wa.me/${item.whatsapp}`} target="_blank" className="flex items-center gap-2 font-bold text-slate-700 text-xs hover:text-blue-600 transition-all">
                        <Phone size={14} className="text-emerald-500"/> {item.whatsapp}
                      </a>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider ${item.kategori_atlet === 'Senior' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        {item.kategori_atlet}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }} className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl"><Edit3 size={18}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2.5 text-rose-600 hover:bg-rose-100 rounded-xl"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH & EDIT (Digabung logikanya agar ringkas namun lengkap) */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black uppercase italic text-slate-900">{isAddModalOpen ? 'Tambah' : 'Edit'} <span className="text-blue-600">Atlet</span></h2>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-3 text-slate-400 hover:text-rose-500"><X size={24}/></button>
            </div>
            
            <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="p-8 space-y-6">
              {/* Foto Upload dengan Preview Kecil */}
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                    {(isAddModalOpen ? newItem.foto_url : editingItem?.foto_url) ? (
                      <img src={isAddModalOpen ? newItem.foto_url : editingItem?.foto_url} className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-slate-200"/>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-slate-900 transition-all">
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, isAddModalOpen ? 'add' : 'edit')} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nama Lengkap</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase text-xs focus:border-blue-500 outline-none" value={isAddModalOpen ? newItem.nama : editingItem?.nama} onChange={e => isAddModalOpen ? setNewItem({...newItem, nama: e.target.value}) : setEditingItem({...editingItem!, nama: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">WhatsApp</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs focus:border-blue-500 outline-none" value={isAddModalOpen ? newItem.whatsapp : editingItem?.whatsapp} onChange={e => isAddModalOpen ? setNewItem({...newItem, whatsapp: e.target.value}) : setEditingItem({...editingItem!, whatsapp: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Tipe Atlet</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none" value={isAddModalOpen ? newItem.kategori_atlet : editingItem?.kategori_atlet} onChange={e => isAddModalOpen ? setNewItem({...newItem, kategori_atlet: e.target.value}) : setEditingItem({...editingItem!, kategori_atlet: e.target.value})}>
                    <option value="Muda">Muda</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Jenis Kelamin</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs outline-none" value={isAddModalOpen ? newItem.jenis_kelamin : editingItem?.jenis_kelamin} onChange={e => isAddModalOpen ? setNewItem({...newItem, jenis_kelamin: e.target.value}) : setEditingItem({...editingItem!, jenis_kelamin: e.target.value})}>
                    <option value="Putra">Putra</option>
                    <option value="Putri">Putri</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={isSaving || uploading} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} {isAddModalOpen ? 'SIMPAN ATLET' : 'PERBARUI DATA'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW (Fungsi Zoom Foto) */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-xl w-full flex flex-col items-center">
            <button className="absolute -top-12 right-0 text-white flex items-center gap-2 font-black uppercase text-[10px] tracking-widest bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all">
              Tutup <X size={20} />
            </button>
            <img src={previewImage} className="w-full h-auto max-h-[80vh] object-contain rounded-[2.5rem] border-4 border-white/20 shadow-2xl animate-in zoom-in-95 duration-300" />
            <div className="mt-8 flex gap-6">
              <button className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all border border-white/10"><ChevronLeft size={24}/></button>
              <button className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all border border-white/10"><ChevronRight size={24}/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
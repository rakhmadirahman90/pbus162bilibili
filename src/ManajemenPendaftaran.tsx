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
  Activity,
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

  const kategoriUmur = [
    "Pra Dini (U-9)", "Usia Dini (U-11)", "Anak-anak (U-13)", 
    "Pemula (U-15)", "Remaja (U-17)", "Taruna (U-19)", 
    "Dewasa / Umum", "Veteran (35+ / 40+)"
  ];

  // --- STATISTIK ---
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

  // --- FITUR DOWNLOAD & EXPORT ---
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
      head: [['Nama', 'WhatsApp', 'Kategori Umur', 'Tipe', 'Domisili']],
      body: registrants.map(r => [r.nama, r.whatsapp, r.kategori, r.kategori_atlet, r.domisili]),
    });
    doc.save("Data_Atlet.pdf");
  };

  // --- FOTO UPLOAD ---
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
    } catch (error: any) { Swal.fire("Gagal", error.message, "error"); }
    finally { setUploading(false); }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').insert([{ ...newItem, nama: newItem.nama?.toUpperCase(), domisili: newItem.domisili?.toUpperCase() }]);
      if (error) throw error;
      setIsAddModalOpen(false);
      fetchData();
      Swal.fire("Berhasil", "Atlet ditambahkan", "success");
    } catch (error: any) { Swal.fire("Gagal", error.message, "error"); }
    finally { setIsSaving(false); }
  };

  const filteredData = registrants.filter(item => item.nama.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        
        {/* HEADER & ACTIONS */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-200"><Users size={32} /></div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase italic">Manajemen <span className="text-blue-600">Atlet</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kontrol Pendaftaran & Export Data</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-black text-[10px] tracking-widest hover:bg-blue-600 transition-all"><Plus size={16}/> TAMBAH ATLET</button>
            <button onClick={downloadTemplate} className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-xl font-black text-[10px] tracking-widest hover:bg-slate-50 transition-all"><Upload size={16}/> TEMPLATE</button>
            <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-black text-[10px] tracking-widest hover:bg-emerald-700 transition-all"><FileSpreadsheet size={16}/> EXCEL</button>
            <button onClick={exportToPDF} className="flex items-center gap-2 bg-rose-600 text-white px-5 py-3 rounded-xl font-black text-[10px] tracking-widest hover:bg-rose-700 transition-all"><FileText size={16}/> PDF</button>
          </div>
        </header>

        {/* STATS SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Activity size={24}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase">Total Atlet</p><h3 className="text-2xl font-black">{stats.total}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2"><TrendingUp size={14}/> Kategori Muda</p>
            <div className="flex justify-between items-end mt-1">
              <h3 className="text-2xl font-black">{stats.muda.total}</h3>
              <div className="flex gap-2 text-[10px] font-bold uppercase"><span className="text-blue-500">{stats.muda.pa} PA</span><span className="text-rose-500">{stats.muda.pi} PI</span></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-2"><TrendingUp size={14}/> Kategori Senior</p>
            <div className="flex justify-between items-end mt-1">
              <h3 className="text-2xl font-black">{stats.senior.total}</h3>
              <div className="flex gap-2 text-[10px] font-bold uppercase"><span className="text-blue-500">{stats.senior.pa} PA</span><span className="text-rose-500">{stats.senior.pi} PI</span></div>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <div className="relative mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
          <input type="text" placeholder="Cari nama atlet..." className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {/* TABLE - RESPONSIVE NO SCROLL DESKTOP */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto lg:overflow-visible">
            <table className="w-full text-left min-w-[900px] lg:min-w-full">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest font-black">
                  <th className="px-6 py-5 text-center w-16">No</th>
                  <th className="px-6 py-5">Profil Atlet</th>
                  <th className="px-6 py-5">Kategori Umur</th>
                  <th className="px-6 py-5">Tipe</th>
                  <th className="px-6 py-5">WhatsApp</th>
                  <th className="px-6 py-5">Domisili</th>
                  <th className="px-6 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-all group">
                    <td className="px-6 py-4 text-center font-black text-slate-300 text-xs">{(currentPage-1)*itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div onClick={() => item.foto_url && setPreviewImage(item.foto_url)} className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden cursor-zoom-in border border-slate-200 flex-shrink-0">
                          {item.foto_url ? <img src={item.foto_url} className="w-full h-full object-cover" /> : <User size={16} className="m-auto mt-2 text-slate-300"/>}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 uppercase text-xs leading-none">{item.nama}</p>
                          <p className={`text-[9px] font-bold uppercase mt-1 ${item.jenis_kelamin === 'Putra' ? 'text-blue-500' : 'text-rose-500'}`}>{item.jenis_kelamin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-600 uppercase text-[10px]">{item.kategori}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md font-black text-[9px] uppercase ${item.kategori_atlet === 'Senior' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.kategori_atlet}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-500 text-xs">{item.whatsapp}</td>
                    <td className="px-6 py-4 font-bold text-slate-500 uppercase text-xs">{item.domisili}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => {setEditingItem(item); setIsEditModalOpen(true);}} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit3 size={16}/></button>
                        <button className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL ADD ATLET */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black uppercase italic text-slate-900">Tambah <span className="text-blue-600">Atlet</span></h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500"><X size={24}/></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                    {newItem.foto_url ? <img src={newItem.foto_url} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-200"/>}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-slate-900 transition-all">
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'add')} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Nama Lengkap</label><input required className="w-full p-3 bg-slate-50 border rounded-xl font-bold uppercase text-xs outline-none focus:border-blue-500" value={newItem.nama} onChange={e => setNewItem({...newItem, nama: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">WhatsApp</label><input required className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-xs outline-none focus:border-blue-500" value={newItem.whatsapp} onChange={e => setNewItem({...newItem, whatsapp: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Tipe Atlet</label><select className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-xs outline-none" value={newItem.kategori_atlet} onChange={e => setNewItem({...newItem, kategori_atlet: e.target.value})}><option value="Muda">Muda</option><option value="Senior">Senior</option></select></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Jenis Kelamin</label><select className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-xs outline-none" value={newItem.jenis_kelamin} onChange={e => setNewItem({...newItem, jenis_kelamin: e.target.value})}><option value="Putra">Putra</option><option value="Putri">Putri</option></select></div>
              </div>
              <button type="submit" disabled={isSaving || uploading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} SIMPAN DATA ATLET
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX PREVIEW */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-xl w-full flex flex-col items-center">
             <button className="absolute -top-10 right-0 text-white flex items-center gap-2 font-black uppercase text-[10px]">Tutup <X size={20}/></button>
             <img src={previewImage} className="max-h-[80vh] w-auto rounded-3xl border-4 border-white shadow-2xl animate-in zoom-in-95 duration-300" />
             <div className="mt-4 flex gap-4">
                <button className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all" onClick={(e) => e.stopPropagation()}><ChevronLeft size={24}/></button>
                <button className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all" onClick={(e) => e.stopPropagation()}><ChevronRight size={24}/></button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
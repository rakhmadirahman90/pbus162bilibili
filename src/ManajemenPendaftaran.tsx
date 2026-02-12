import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Trash2, RefreshCcw, Search, Phone, MapPin, ChevronLeft, ChevronRight,
  Edit3, X, Save, User, Camera, Loader2, Users, Download, FileText, Table
} from 'lucide-react';

// Import untuk Eksport
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
}

export default function ManajemenPendaftaran() {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Registrant | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- LOGIKA EKSPORT EXCEL ---
  const exportToExcel = () => {
    const dataToExport = filteredData.map((item, index) => ({
      No: index + 1,
      Nama: item.nama,
      Gender: item.jenis_kelamin,
      WhatsApp: item.whatsapp,
      Kategori: item.kategori,
      Domisili: item.domisili,
      Pengalaman: item.pengalaman,
      Tanggal_Daftar: new Date(item.created_at).toLocaleDateString('id-ID')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Atlet");
    XLSX.writeFile(workbook, `Data_Atlet_${Date.now()}.xlsx`);
  };

  // --- LOGIKA EKSPORT PDF ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("DAFTAR PENDAFTARAN ATLET", 14, 15);
    
    const tableColumn = ["No", "Nama", "Gender", "WhatsApp", "Kategori", "Domisili"];
    const tableRows = filteredData.map((item, index) => [
      index + 1,
      item.nama.toUpperCase(),
      item.jenis_kelamin,
      item.whatsapp,
      item.kategori,
      item.domisili
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      headStyles: { fillStyle: [37, 99, 235] } // Warna Biru
    });

    doc.save(`Data_Atlet_${Date.now()}.pdf`);
  };

  // (Fungsi fetchData, useEffect, handleDelete, handleUpdate tetap sama seperti sebelumnya...)
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pendaftaran').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRegistrants(data || []);
    } catch (error: any) { console.error(error.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = registrants.filter(item => 
    item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.domisili?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 py-4 md:px-8">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md shadow-blue-100">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase italic leading-none">
                Database <span className="text-blue-600">Atlet</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Panel Administrasi</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Tombol Eksport Excel */}
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
            >
              <Table size={14} /> EXCEL
            </button>

            {/* Tombol Eksport PDF */}
            <button 
              onClick={exportToPDF}
              className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] tracking-widest hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-100"
            >
              <FileText size={14} /> PDF
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            <button 
              onClick={fetchData} 
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] tracking-widest hover:bg-blue-600 transition-all active:scale-95"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> REFRESH
            </button>
          </div>
        </header>

        {/* ... (Sisanya: Search Bar, Table, Pagination, Modal sama seperti kode sebelumnya) ... */}
        
        <section className="mb-4">
          <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm transition-all focus-within:border-blue-500">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Cari nama atau kota..."
              className="w-full pl-12 pr-6 py-3 bg-transparent outline-none font-bold text-sm"
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </section>

        {/* TABLE (Sesuai kode sebelumnya) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden mb-4">
           {/* ... kode tabel Anda ... */}
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="pl-6 py-3 font-bold uppercase text-[10px] tracking-widest w-12">No</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Atlet</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Gender</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Kategori</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest">Domisili</th>
                  <th className="px-4 py-3 font-bold uppercase text-[10px] tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-all group">
                    <td className="pl-6 py-3 text-xs font-bold text-slate-400">{(currentPage-1)*itemsPerPage + index + 1}</td>
                    <td className="px-4 py-3 font-bold text-xs uppercase">{item.nama}</td>
                    <td className="px-4 py-3 text-[10px] font-bold">{item.jenis_kelamin}</td>
                    <td className="px-4 py-3 text-[10px] font-bold text-blue-600">{item.kategori}</td>
                    <td className="px-4 py-3 text-[10px] font-bold uppercase">{item.domisili}</td>
                    <td className="px-4 py-3 text-right">
                       <button onClick={() => handleDelete(item.id, item.nama, item.foto_url)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
// ==========================
// MANajemen Pendaftaran Lengkap + Fitur Tambahan
// ==========================

import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Trash2, RefreshCcw, Search, Phone, MapPin,
  ChevronLeft, ChevronRight, Edit3, X, Save,
  User, Camera, Loader2, Users,
  FileSpreadsheet, FileText, Plus, Upload,
  Clock, Calendar
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
}

export default function ManajemenPendaftaran() {

  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pendaftaran')
      .select('*')
      .order('created_at', { ascending: false });

    setRegistrants(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // FILTERING
  // =========================
  const filteredData = registrants.filter(item => {
    const matchSearch =
      item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.domisili?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDate = filterDate
      ? new Date(item.created_at).toISOString().split('T')[0] === filterDate
      : true;

    return matchSearch && matchDate;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // =========================
  // STATISTICS BARU
  // =========================
  const totalPutra = registrants.filter(r => r.jenis_kelamin === 'Putra').length;
  const totalPutri = registrants.filter(r => r.jenis_kelamin === 'Putri').length;
  const totalHariIni = registrants.filter(r =>
    new Date(r.created_at).toDateString() === new Date().toDateString()
  ).length;

  // =========================
  // EXPORT
  // =========================
  const exportToExcel = () => {
    if (!filteredData.length) return;

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Atlet");
    XLSX.writeFile(workbook, "Data_Atlet.xlsx");
  };

  const exportToPDF = () => {
    if (!filteredData.length) return;

    const doc = new jsPDF();
    const tableColumn = ["No", "Nama", "Gender", "Kategori", "Domisili"];
    const tableRows = filteredData.map((item, index) => [
      index + 1,
      item.nama,
      item.jenis_kelamin,
      item.kategori,
      item.domisili
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("Data_Atlet.pdf");
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl font-black uppercase">
          Manajemen <span className="text-blue-600">Atlet</span>
        </h1>

        <div className="flex gap-2">
          <button onClick={exportToExcel} className="p-2 bg-emerald-500 text-white rounded-lg">
            <FileSpreadsheet size={18} />
          </button>
          <button onClick={exportToPDF} className="p-2 bg-rose-500 text-white rounded-lg">
            <FileText size={18} />
          </button>
          <button onClick={fetchData} className="p-2 bg-slate-900 text-white rounded-lg">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* STATISTICS BARU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xs font-bold uppercase text-slate-400">Total Putra</p>
          <p className="text-2xl font-black text-blue-600">{totalPutra}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xs font-bold uppercase text-slate-400">Total Putri</p>
          <p className="text-2xl font-black text-rose-600">{totalPutri}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-xs font-bold uppercase text-slate-400">Daftar Hari Ini</p>
          <p className="text-2xl font-black text-emerald-600">{totalHariIni}</p>
        </div>
      </div>

      {/* SEARCH + FILTER DATE */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Cari nama/kategori/domisi..."
          className="flex-1 px-4 py-2 border rounded-lg"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="date"
          className="px-4 py-2 border rounded-lg"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <button
          onClick={() => { setFilterDate(''); setSearchTerm(''); }}
          className="px-4 py-2 bg-slate-200 rounded-lg"
        >
          Reset
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-3 text-left">No</th>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Gender</th>
              <th className="p-3 text-left">Kategori</th>
              <th className="p-3 text-left">Domisili</th>
              <th className="p-3 text-left">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={item.id} className="border-b">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-bold">{item.nama}</td>
                <td className="p-3">{item.jenis_kelamin}</td>
                <td className="p-3">{item.kategori}</td>
                <td className="p-3">{item.domisili}</td>
                <td className="p-3">
                  {new Date(item.created_at).toLocaleDateString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          className="px-3 py-1 bg-slate-200 rounded"
        >
          <ChevronLeft size={16}/>
        </button>

        <span className="px-3 py-1 font-bold">
          {currentPage} / {totalPages || 1}
        </span>

        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          className="px-3 py-1 bg-slate-200 rounded"
        >
          <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );
}
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
  Calendar
} from 'lucide-react';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

/* ================= TYPE ================= */

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

/* ================= COMPONENT ================= */

export default function ManajemenPendaftaran() {

  /* ================= STATE ================= */

  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  /* ================= TOAST ================= */

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
  });

  /* ================= FETCH ================= */

  const fetchData = async () => {
    setLoading(true);

    try {

      const { data, error } = await supabase
        .from('pendaftaran')
        .select('*')
        .order('created_at', { ascending: false }); // SORT TERBARU

      if (error) throw error;

      setRegistrants(data || []);

    } catch (err: any) {

      Swal.fire("Error", err.message, "error");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= FILTER + SEARCH + DATE ================= */

  const filteredData = registrants

    // SEARCH
    .filter(item =>
      item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.domisili?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // FILTER TANGGAL
    .filter(item => {

      if (!startDate && !endDate) return true;

      const itemDate = new Date(item.created_at).toISOString().split('T')[0];

      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;

      return true;
    });

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= EXPORT ================= */

  const exportToExcel = () => {

    if (filteredData.length === 0) {
      return Swal.fire("Opps!", "Tidak ada data", "warning");
    }

    const data = filteredData.map((item, i) => ({

      No: i + 1,
      Nama: item.nama,
      Gender: item.jenis_kelamin,
      Kategori: item.kategori,
      Domisili: item.domisili,
      WhatsApp: item.whatsapp,
      Tanggal: new Date(item.created_at).toLocaleString('id-ID')

    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Data Atlet");

    XLSX.writeFile(wb, "data_atlet.xlsx");
  };

  const exportToPDF = () => {

    if (filteredData.length === 0) {
      return Swal.fire("Opps!", "Tidak ada data", "warning");
    }

    const doc = new jsPDF();

    doc.text("DATA ATLET", 14, 15);

    const rows = filteredData.map((item, i) => ([
      i + 1,
      item.nama,
      item.jenis_kelamin,
      item.kategori,
      item.domisili,
      new Date(item.created_at).toLocaleString('id-ID')
    ]));

    autoTable(doc, {
      head: [["No", "Nama", "Gender", "Kategori", "Domisili", "Tanggal"]],
      body: rows,
      startY: 25
    });

    doc.save("data_atlet.pdf");
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: string, nama: string) => {

    const confirm = await Swal.fire({
      title: "Hapus?",
      text: `Hapus ${nama}?`,
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {

      const { error } = await supabase
        .from('pendaftaran')
        .delete()
        .eq('id', id);

      if (error) throw error;

      Toast.fire({ icon: "success", title: "Dihapus" });

      fetchData();

    } catch (err: any) {

      Swal.fire("Error", err.message, "error");

    }
  };

  /* ================= UI ================= */

  return (

    <div className="min-h-screen bg-slate-50 p-6">

      {/* ================= HEADER ================= */}

      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">

        <div className="flex items-center gap-3">

          <Users className="text-blue-600" />

          <h1 className="text-2xl font-black uppercase">
            Manajemen Atlet
          </h1>

        </div>

        <div className="flex gap-2">

          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            <FileSpreadsheet size={16} />
          </button>

          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            <FileText size={16} />
          </button>

          <button
            onClick={fetchData}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            <RefreshCcw size={16} />
          </button>

        </div>

      </div>

      {/* ================= FILTER ================= */}

      <div className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="relative">

          <Search className="absolute left-3 top-3 text-gray-400" size={16} />

          <input
            className="w-full pl-9 py-2 border rounded-lg"
            placeholder="Cari..."
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

        </div>

        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />

        <button
          onClick={() => {
            setStartDate('');
            setEndDate('');
          }}
          className="bg-slate-200 rounded-lg font-bold"
        >
          Reset
        </button>

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-black text-white">

            <tr>

              <th className="p-3">No</th>
              <th>Nama</th>
              <th>Gender</th>
              <th>Kategori</th>
              <th>Kontak</th>
              <th>Tanggal Daftar</th>
              <th>Aksi</th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td colSpan={7} className="text-center py-20">
                  Loading...
                </td>
              </tr>

            ) : currentItems.length === 0 ? (

              <tr>
                <td colSpan={7} className="text-center py-20">
                  Data kosong
                </td>
              </tr>

            ) : currentItems.map((item, i) => (

              <tr key={item.id} className="border-b hover:bg-slate-50">

                <td className="p-3 text-center">
                  {(currentPage - 1) * itemsPerPage + i + 1}
                </td>

                <td className="font-bold">
                  {item.nama}
                </td>

                <td>
                  {item.jenis_kelamin}
                </td>

                <td>
                  {item.kategori}
                </td>

                <td>

                  <a
                    href={`https://wa.me/${item.whatsapp}`}
                    target="_blank"
                    className="text-green-600"
                  >
                    {item.whatsapp}
                  </a>

                  <div className="text-xs text-gray-400 flex gap-1">
                    <MapPin size={12} />
                    {item.domisili}
                  </div>

                </td>

                {/* ======== WAKTU DIGABUNG ======== */}

                <td>

                  <div className="flex flex-col">

                    <span className="font-bold text-slate-700">

                      {new Date(item.created_at)
                        .toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}

                    </span>

                    <span className="text-xs text-slate-400">

                      Pukul {new Date(item.created_at)
                        .toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} WIB

                    </span>

                  </div>

                </td>

                {/* ================= AKSI ================= */}

                <td className="text-center">

                  <button
                    onClick={() => handleDelete(item.id, item.nama)}
                    className="bg-red-100 text-red-600 p-2 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* ================= PAGINATION ================= */}

      <div className="flex justify-center items-center gap-3 mt-6">

        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          <ChevronLeft />
        </button>

        <span className="font-bold">
          {currentPage} / {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          <ChevronRight />
        </button>

      </div>

    </div>
  );
}

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
  Calendar
} from 'lucide-react';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

/* ================= INTERFACE ================= */

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

  /* ========== STATE ========== */

  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<Registrant | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const itemsPerPage = 8;

  /* ========== DATA BARU ========== */

  const [newItem, setNewItem] = useState<Partial<Registrant>>({
    nama: '',
    whatsapp: '',
    kategori: 'Pra Dini (U-9)',
    domisili: '',
    jenis_kelamin: 'Putra',
    foto_url: ''
  });

  /* ========== KATEGORI ========== */

  const kategoriUmur = [
    "Pra Dini (U-9)", "Usia Dini (U-11)", "Anak-anak (U-13)",
    "Pemula (U-15)", "Remaja (U-17)", "Taruna (U-19)",
    "Dewasa / Umum", "Veteran (35+ / 40+)"
  ];

  /* ================= TOAST ================= */

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000
  });

  /* ================= FETCH DATA ================= */

  const fetchData = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRegistrants(data || []);

    } catch (e: any) {
      console.error(e.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= FILTER + SORT ================= */

  const filteredData = registrants
    .filter(item => {
      const text =
        item.nama?.toLowerCase() +
        item.domisili?.toLowerCase() +
        item.kategori?.toLowerCase();

      return text.includes(searchTerm.toLowerCase());
    })
    .filter(item => {

      if (!startDate && !endDate) return true;

      const itemDate = new Date(item.created_at).toISOString().slice(0, 10);

      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;

      return true;
    })
    .sort((a, b) => {

      const d1 = new Date(a.created_at).getTime();
      const d2 = new Date(b.created_at).getTime();

      if (sortOrder === 'newest') return d2 - d1;
      return d1 - d2;
    });

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= DELETE ================= */

  const handleDelete = async (id: string, nama: string) => {

    const res = await Swal.fire({
      title: "Hapus Data?",
      text: `Hapus ${nama}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya"
    });

    if (!res.isConfirmed) return;

    const { error } = await supabase
      .from('pendaftaran')
      .delete()
      .eq('id', id);

    if (!error) {
      Toast.fire({ icon: 'success', title: 'Terhapus' });
      fetchData();
    }
  };

  /* ================= RETURN ================= */

  return (

    <div className="min-h-screen bg-slate-50 pb-20">

      <div className="max-w-[1400px] mx-auto px-6 py-6">

        {/* ================= HEADER ================= */}

        <header className="flex flex-col lg:flex-row justify-between gap-4 mb-6">

          <div className="flex items-center gap-3">

            <div className="p-3 bg-blue-600 rounded-xl">
              <Users className="text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-black uppercase">
                Manajemen Atlet
              </h1>
              <p className="text-xs text-slate-400">
                Database Real-time
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              <Plus size={14} /> Tambah
            </button>

            <button
              onClick={fetchData}
              className="bg-slate-900 text-white p-2 rounded-xl"
            >
              <RefreshCcw size={18} />
            </button>

          </div>

        </header>

        {/* ================= FILTER ================= */}

        <div className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">

          <input
            type="text"
            placeholder="Cari..."
            className="border px-3 py-2 rounded-lg text-sm"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            className="border px-3 py-2 rounded-lg text-sm"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>

          <input
            type="date"
            className="border px-3 py-2 rounded-lg text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="border px-3 py-2 rounded-lg text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

        </div>

        {/* ================= TABLE ================= */}

        <div className="bg-white rounded-xl shadow overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-slate-900 text-white text-xs">

              <tr>
                <th className="p-4">No</th>
                <th>Nama</th>
                <th>Gender</th>
                <th>Kategori</th>
                <th>Kontak</th>
                <th>Waktu Registrasi</th>
                <th>Aksi</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    Loading...
                  </td>
                </tr>

              ) : currentItems.length === 0 ? (

                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    Data kosong
                  </td>
                </tr>

              ) : (

                currentItems.map((item, i) => (

                  <tr key={item.id} className="border-b hover:bg-slate-50">

                    <td className="p-3 text-center">
                      {(currentPage - 1) * itemsPerPage + i + 1}
                    </td>

                    <td className="font-bold uppercase">
                      {item.nama}
                    </td>

                    <td>{item.jenis_kelamin}</td>

                    <td>{item.kategori}</td>

                    <td>
                      <div className="flex flex-col text-xs">

                        <span>{item.whatsapp}</span>

                        <span className="text-slate-400">
                          {item.domisili}
                        </span>

                      </div>
                    </td>

                    {/* ===== GABUNG TANGGAL + JAM ===== */}

                    <td>

                      <div className="flex flex-col text-xs font-bold">

                        <span className="flex gap-1 items-center">
                          <Calendar size={12} />
                          {new Date(item.created_at)
                            .toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                        </span>

                        <span className="flex gap-1 items-center text-slate-400">

                          <Clock size={12} />
                          {new Date(item.created_at)
                            .toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} WIB

                        </span>

                      </div>

                    </td>

                    <td>

                      <div className="flex gap-2">

                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsEditModalOpen(true);
                          }}
                          className="bg-blue-100 text-blue-600 p-2 rounded-lg"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id, item.nama)}
                          className="bg-rose-100 text-rose-600 p-2 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>

        {/* ================= PAGINATION ================= */}

        <div className="flex justify-center gap-2 mt-6">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-2 bg-slate-200 rounded"
          >
            <ChevronLeft size={18} />
          </button>

          {[...Array(totalPages)].map((_, i) => (

            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 rounded ${currentPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200'
                }`}
            >
              {i + 1}
            </button>

          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-2 bg-slate-200 rounded"
          >
            <ChevronRight size={18} />
          </button>

        </div>

      </div>

    </div>
  );
}

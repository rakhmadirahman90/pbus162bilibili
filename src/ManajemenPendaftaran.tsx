// ======================= IMPORT =======================

import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Trash2, RefreshCcw, Search, Phone, MapPin, ChevronLeft,
  ChevronRight, Edit3, X, Save, User, Camera, Loader2,
  Users, FileSpreadsheet, FileText, Plus, Upload,
  Clock, Calendar, Download
} from 'lucide-react';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';


// ======================= INTERFACE =======================

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


// ======================= COMPONENT =======================

export default function ManajemenPendaftaran() {


// ======================= STATE =======================

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
    foto_url: ''
  });

  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;


// ======================= DATA =======================

  const kategoriUmur = [
    "Pra Dini (U-9)", "Usia Dini (U-11)", "Anak-anak (U-13)", 
    "Pemula (U-15)", "Remaja (U-17)", "Taruna (U-19)", 
    "Dewasa / Umum", "Veteran (35+ / 40+)"
  ];


// ======================= TOAST =======================

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
  });


// ======================= TEMPLATE EXCEL (BARU) =======================

  const downloadExcelTemplate = () => {

    const templateData = [
      {
        Nama: "BUDI SANTOSO",
        WhatsApp: "08123456789",
        Kategori: "Pra Dini (U-9)",
        Domisili: "SURABAYA",
        Gender: "Putra"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [["Nama", "WhatsApp", "Kategori", "Domisili", "Gender"]],
      { origin: "A1" }
    );

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Template Import"
    );

    XLSX.writeFile(workbook, "Template_Import_Atlet.xlsx");
  };


// ======================= EXPORT =======================

  const exportToExcel = () => {

    if (filteredData.length === 0) {
      return Swal.fire("Oops!", "Tidak ada data", "warning");
    }

    const data = filteredData.map((item, i) => ({
      No: i + 1,
      Nama: item.nama,
      Gender: item.jenis_kelamin,
      Kategori: item.kategori,
      WhatsApp: item.whatsapp,
      Domisili: item.domisili,
      Tanggal: new Date(item.created_at).toLocaleDateString('id-ID')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Data Atlet");

    XLSX.writeFile(wb, `Data_Atlet_${Date.now()}.xlsx`);
  };


// ======================= IMPORT =======================

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {

      try {

        const bstr = evt.target?.result;

        const wb = XLSX.read(bstr, { type: 'binary' });

        const ws = wb.Sheets[wb.SheetNames[0]];

        const data = XLSX.utils.sheet_to_json(ws);

        if (!data.length) throw new Error("File kosong");

        const formatted = data.map((d: any) => ({
          nama: (d.Nama || '').toUpperCase(),
          whatsapp: String(d.WhatsApp || ''),
          kategori: d.Kategori || 'Umum',
          domisili: (d.Domisili || '').toUpperCase(),
          jenis_kelamin: d.Gender || 'Putra'
        }));

        const { error } = await supabase
          .from('pendaftaran')
          .insert(formatted);

        if (error) throw error;

        Toast.fire({
          icon: "success",
          title: "Import berhasil"
        });

        fetchData();

      } catch (err: any) {

        Swal.fire("Gagal Import", err.message, "error");

      }
    };

    reader.readAsBinaryString(file);
  };


// ======================= FETCH =======================

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

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchData();
  }, []);


// ======================= FILTER =======================

  const filteredData = (registrants || []).filter(item =>

    (item.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.domisili || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.kategori || '').toLowerCase().includes(searchTerm.toLowerCase())

  );


// ======================= PAGINATION =======================

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


// ======================= UI =======================

  return (

    <div className="min-h-screen bg-slate-50 pb-20">

      <div className="max-w-[1400px] mx-auto px-6 py-6">

{/* ================= HEADER ================= */}

<header className="flex flex-wrap justify-between gap-4 mb-6">

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

{/* DOWNLOAD TEMPLATE */}

<button
  onClick={downloadExcelTemplate}
  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700"
>
  <Download size={14} />
  TEMPLATE
</button>

{/* IMPORT */}

<label className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
  <Upload size={14} />
  IMPORT
  <input type="file" hidden accept=".xlsx,.xls" onChange={handleImportExcel} />
</label>

{/* EXPORT */}

<button
  onClick={exportToExcel}
  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
>
  <FileSpreadsheet size={14} />
</button>

<button
  onClick={fetchData}
  className="bg-slate-900 text-white p-2 rounded-xl"
>
  <RefreshCcw size={18} />
</button>

  </div>

</header>


{/* ================= SEARCH ================= */}

<section className="mb-6">

  <div className="relative bg-white border rounded-xl">

    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

    <input
      type="text"
      placeholder="Cari data..."
      className="w-full pl-12 pr-4 py-3 rounded-xl outline-none font-bold text-sm"
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }}
    />

  </div>

</section>


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
  <th>Waktu</th>
</tr>

</thead>

<tbody>

{loading ? (

<tr>
  <td colSpan={6} className="p-20 text-center">
    Loading...
  </td>
</tr>

) : currentItems.length === 0 ? (

<tr>
  <td colSpan={6} className="p-20 text-center">
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

<td>{item.whatsapp}</td>

<td className="text-xs">

<div className="flex gap-1 items-center">
  <Calendar size={12} />
  {new Date(item.created_at).toLocaleDateString('id-ID')}
</div>

<div className="flex gap-1 items-center text-slate-400">
  <Clock size={12} />
  {new Date(item.created_at).toLocaleTimeString('id-ID')} WIB
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
  className={`px-3 py-2 rounded ${
    currentPage === i + 1
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

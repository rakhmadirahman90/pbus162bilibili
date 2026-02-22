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
  Download
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Registrant | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const [newItem, setNewItem] = useState<Partial<Registrant>>({
    nama: '',
    whatsapp: '',
    kategori: 'Pra Dini (U-9)',
    domisili: '',
    jenis_kelamin: 'Putra',
    foto_url: ''
  });

  const kategoriUmur = [
    "Pra Dini (U-9)", "Usia Dini (U-11)", "Anak-anak (U-13)", 
    "Pemula (U-15)", "Remaja (U-17)", "Taruna (U-19)", 
    "Dewasa / Umum", "Veteran (35+ / 40+)"
  ];

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // ================= DOWNLOAD TEMPLATE =================
  const downloadTemplateExcel = () => {
    const templateData = [
      {
        Nama: "BUDI SANTOSO",
        WhatsApp: "081234567890",
        Kategori: "Pemula (U-15)",
        Domisili: "SURABAYA",
        Gender: "Putra"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Import");

    XLSX.writeFile(workbook, "Template_Import_Pendaftaran_Atlet.xlsx");
  };

  // ================= IMPORT EXCEL (VALIDASI LENGKAP) =================
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rawData.length) {
          throw new Error("File Excel kosong.");
        }

        const requiredHeaders = ["Nama", "WhatsApp", "Kategori", "Domisili", "Gender"];
        const fileHeaders = Object.keys(rawData[0]);
        const missingHeaders = requiredHeaders.filter(h => !fileHeaders.includes(h));

        if (missingHeaders.length > 0) {
          throw new Error(`Format salah. Kolom berikut tidak ditemukan: ${missingHeaders.join(", ")}`);
        }

        const formattedData = rawData.map((item, index) => {

          const gender = (item.Gender || "").trim();
          if (!["Putra", "Putri"].includes(gender)) {
            throw new Error(`Baris ${index + 2}: Gender harus Putra atau Putri`);
          }

          return {
            nama: (item.Nama || "").toUpperCase().trim(),
            whatsapp: String(item.WhatsApp || "").trim(),
            kategori: item.Kategori || "Dewasa / Umum",
            domisili: (item.Domisili || "").toUpperCase().trim(),
            jenis_kelamin: gender,
          };
        });

        const confirm = await Swal.fire({
          title: "Konfirmasi Import",
          text: `${formattedData.length} data akan diimport ke database.`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Ya, Import Sekarang",
          cancelButtonText: "Batal"
        });

        if (!confirm.isConfirmed) return;

        const { error } = await supabase.from('pendaftaran').insert(formattedData);
        if (error) throw error;

        Swal.fire("Berhasil!", `${formattedData.length} data berhasil diimport.`, "success");
        fetchData();

      } catch (err: any) {
        Swal.fire("Gagal Import", err.message, "error");
      }
    };

    reader.readAsBinaryString(file);
  };

  // ================= FETCH DATA =================
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
      console.error(error.message);
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
    (item.kategori || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <div className="max-w-[1400px] mx-auto px-4 py-4 md:px-8">

        {/* HEADER */}
        <header className="flex flex-wrap gap-3 justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" size={30} />
            <h1 className="text-2xl font-black uppercase">
              Manajemen <span className="text-blue-600">Atlet</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
              <Plus size={16}/> TAMBAH
            </button>

            <label className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
              <Upload size={16}/> IMPORT
              <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleImportExcel}/>
            </label>

            <button onClick={downloadTemplateExcel}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
              <Download size={16}/> TEMPLATE
            </button>

            <button onClick={fetchData}
              className="p-2 bg-slate-900 text-white rounded-xl">
              <RefreshCcw size={18}/>
            </button>
          </div>
        </header>

        {/* SEARCH */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 text-slate-400"/>
          <input
            type="text"
            placeholder="Cari nama, kategori, domisili..."
            className="pl-10 pr-4 py-2 w-full border rounded-xl"
            onChange={(e)=>{setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-3">No</th>
                <th>Nama</th>
                <th>Gender</th>
                <th>Kategori</th>
                <th>Domisili</th>
                <th>WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item,index)=>(
                <tr key={item.id} className="border-b">
                  <td className="p-3">{(currentPage-1)*itemsPerPage+index+1}</td>
                  <td>{item.nama}</td>
                  <td>{item.jenis_kelamin}</td>
                  <td>{item.kategori}</td>
                  <td>{item.domisili}</td>
                  <td>{item.whatsapp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
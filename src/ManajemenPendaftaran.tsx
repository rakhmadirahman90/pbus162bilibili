import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Trash2, RefreshCcw, Search, Phone, MapPin, ChevronLeft,
  ChevronRight, Edit3, X, Save, User, Camera, Loader2,
  Users, FileSpreadsheet, FileText, Plus, Upload, Clock,
  Calendar, Download, Activity
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

  // --- STATISTIK ---
  const totalPendaftar = registrants.length;
  const totalPutra = registrants.filter(r => r.jenis_kelamin === 'Putra').length;
  const totalPutri = registrants.filter(r => r.jenis_kelamin === 'Putri').length;
  const totalMuda = registrants.filter(r => r.kategori_atlet === 'Muda').length;
  const totalSenior = registrants.filter(r => r.kategori_atlet === 'Senior').length;

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => { resolve(blob as Blob); }, 'image/jpeg', 0.8);
        };
      };
    });
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

  const filteredData = (registrants || []).filter(item => 
    (item?.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item?.domisili || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'edit' | 'add') => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const compressedBlob = await compressImage(file);
      const fileName = `${Date.now()}.jpg`;
      const filePath = `identitas/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('identitas-atlet').upload(filePath, compressedBlob);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('identitas-atlet').getPublicUrl(filePath);
      if (mode === 'edit' && editingItem) setEditingItem({ ...editingItem, foto_url: publicUrl });
      else setNewItem(prev => ({ ...prev, foto_url: publicUrl }));
      Toast.fire({ icon: 'success', title: 'Foto berhasil diunggah' });
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').insert([{
        ...newItem,
        nama: newItem.nama?.toUpperCase(),
        domisili: newItem.domisili?.toUpperCase()
      }]);
      if (error) throw error;
      setIsAddModalOpen(false);
      fetchData();
      Toast.fire({ icon: 'success', title: 'Atlet berhasil ditambahkan' });
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('pendaftaran').update({
        ...editingItem,
        nama: editingItem.nama.toUpperCase(),
        domisili: editingItem.domisili.toUpperCase()
      }).eq('id', editingItem.id);
      if (error) throw error;
      setIsEditModalOpen(false);
      fetchData();
      Toast.fire({ icon: 'success', title: 'Data diperbarui' });
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `Hapus data ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!'
    });
    if (result.isConfirmed) {
      await supabase.from('pendaftaran').delete().eq('id', id);
      fetchData();
      Toast.fire({ icon: 'success', title: 'Terhapus' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* HEADER & STATS */}
      <header className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-black uppercase italic">Manajemen <span className="text-blue-600">Atlet</span></h1>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-900 transition-all">
          <Plus size={18} /> TAMBAH ATLET
        </button>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
          <p className="text-2xl font-black">{totalPendaftar}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-blue-400 uppercase">Putra</p>
          <p className="text-2xl font-black text-blue-600">{totalPutra}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-rose-400 uppercase">Putri</p>
          <p className="text-2xl font-black text-rose-600">{totalPutri}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-indigo-400 uppercase">Atlet Muda</p>
          <p className="text-2xl font-black text-indigo-600">{totalMuda}</p>
        </div>
      </section>

      {/* SEARCH */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input type="text" placeholder="Cari atlet..." className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-100 outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-4">No</th>
              <th className="p-4">Profil</th>
              <th className="p-4">Gender</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Domisili</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentItems.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-300">{(currentPage-1)*itemsPerPage + index + 1}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={item.foto_url || '/placeholder.png'} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                    <span className="font-black uppercase">{item.nama}</span>
                  </div>
                </td>
                <td className="p-4 uppercase font-bold">{item.jenis_kelamin}</td>
                <td className="p-4 text-blue-600 font-bold">{item.kategori}</td>
                <td className="p-4 font-bold">{item.domisili}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => {setEditingItem(item); setIsEditModalOpen(true);}} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"><Edit3 size={16}/></button>
                    <button onClick={() => handleDelete(item.id, item.nama)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="mt-4 flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400">Hal {currentPage} dari {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-50"><ChevronLeft size={18}/></button>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-50"><ChevronRight size={18}/></button>
        </div>
      </div>

      {/* MODAL EDIT (Contoh Satu Modal) */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase">Edit Atlet</h2>
              <button onClick={() => setIsEditModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input value={editingItem.nama} onChange={e => setEditingItem({...editingItem, nama: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200" placeholder="Nama Lengkap" />
              <select value={editingItem.kategori} onChange={e => setEditingItem({...editingItem, kategori: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200">
                {kategoriUmur.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase hover:bg-blue-600">
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
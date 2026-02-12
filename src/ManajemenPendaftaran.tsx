import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Trash2, 
  ExternalLink, 
  RefreshCcw, 
  Search, 
  Phone, 
  MapPin, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  X,
  Save
} from 'lucide-react';

interface Registrant {
  id: string;
  created_at: string;
  nama: string;
  whatsapp: string;
  kategori: string;
  domisili: string;
  pengalaman: string;
  foto_url: string;
}

export default function ManajemenPendaftaran() {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Registrant | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrants(data || []);
      setCurrentPage(1);
    } catch (error: any) {
      alert('Gagal mengambil data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, nama: string) => {
    if (window.confirm(`Hapus data pendaftaran atas nama ${nama}?`)) {
      const { error } = await supabase.from('pendaftaran').delete().eq('id', id);
      if (error) {
        alert('Gagal menghapus');
      } else {
        fetchData();
      }
    }
  };

  // Fungsi untuk membuka modal edit
  const openEditModal = (item: Registrant) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  // Fungsi untuk menyimpan perubahan
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('pendaftaran')
        .update({
          nama: editingItem.nama,
          whatsapp: editingItem.whatsapp,
          domisili: editingItem.domisili,
          kategori: editingItem.kategori,
          pengalaman: editingItem.pengalaman
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      
      setIsEditModalOpen(false);
      fetchData(); // Refresh data setelah update
    } catch (error: any) {
      alert('Gagal memperbarui data: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredData = registrants.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.domisili.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Data Calon Atlet</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                Total {filteredData.length} Pendaftar
              </span>
            </div>
          </div>
          
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            REFRESH DATABASE
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 group">
          <Search className="absolute left-5 top-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
          <input 
            type="text"
            placeholder="CARI NAMA ATLET ATAU KOTA..."
            className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border-2 border-slate-200 bg-white text-slate-900 font-black placeholder-slate-400 outline-none focus:border-blue-600 transition-all shadow-sm text-lg uppercase"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Identitas Atlet</th>
                  <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Kategori Umur</th>
                  <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">Lokasi & WA</th>
                  <th className="px-8 py-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center text-slate-400 font-black uppercase tracking-widest">
                      Menyinkronkan data...
                    </td>
                  </tr>
                ) : currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-xl font-black text-slate-300">
                          {item.foto_url ? <img src={item.foto_url} alt="" className="w-full h-full object-cover" /> : item.nama[0]}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-xl uppercase leading-none mb-1">{item.nama}</div>
                          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase">
                            <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7 font-black text-blue-600 uppercase italic text-xs tracking-wider">
                      {item.kategori}
                    </td>
                    <td className="px-8 py-7">
                      <div className="font-black text-slate-900 text-sm">{item.whatsapp}</div>
                      <div className="text-slate-400 font-bold text-xs italic uppercase">{item.domisili}</div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(item)} className="p-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="p-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:border-red-600 hover:text-red-600 transition-all shadow-sm">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="flex justify-between items-center px-8 py-4">
           <button onClick={goToPrevPage} disabled={currentPage === 1} className="p-3 border-2 rounded-2xl disabled:opacity-30">
             <ChevronLeft />
           </button>
           <span className="font-black text-slate-400 uppercase text-xs">Hal {currentPage} / {totalPages}</span>
           <button onClick={goToNextPage} disabled={currentPage === totalPages} className="p-3 border-2 rounded-2xl disabled:opacity-30">
             <ChevronRight />
           </button>
        </div>

      </div>

      {/* MODAL EDIT DATA */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b-2 border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Edit Data Atlet</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Nama Lengkap</label>
                <input 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 uppercase transition-all"
                  value={editingItem.nama}
                  onChange={(e) => setEditingItem({...editingItem, nama: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Nomor WA</label>
                  <input 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all"
                    value={editingItem.whatsapp}
                    onChange={(e) => setEditingItem({...editingItem, whatsapp: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Kategori</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all uppercase"
                    value={editingItem.kategori}
                    onChange={(e) => setEditingItem({...editingItem, kategori: e.target.value})}
                  >
                    <option value="Pra Dini (U-9)">Pra Dini (U-9)</option>
                    <option value="Dini (U-11)">Dini (U-11)</option>
                    <option value="Anak (U-13)">Anak (U-13)</option>
                    <option value="Pemula (U-15)">Pemula (U-15)</option>
                    <option value="Remaja (U-17)">Remaja (U-17)</option>
                    <option value="Taruna (U-19)">Taruna (U-19)</option>
                    <option value="Dewasa / Umum">Dewasa / Umum</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Domisili (Kota)</label>
                <input 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 outline-none focus:border-blue-600 uppercase transition-all"
                  value={editingItem.domisili}
                  onChange={(e) => setEditingItem({...editingItem, domisili: e.target.value})}
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Menyimpan...' : <><Save size={16}/> Simpan Perubahan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
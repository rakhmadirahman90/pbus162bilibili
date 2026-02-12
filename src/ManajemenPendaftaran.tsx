import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
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
  MoreVertical
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
  
  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah data yang tampil per halaman

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pendaftaran')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrants(data || []);
      setCurrentPage(1); // Reset ke halaman 1 setiap refresh data
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

  // 1. Filter data berdasarkan pencarian
  const filteredData = registrants.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.domisili.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Logic Pagination
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
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                Halaman {currentPage} dari {totalPages || 1}
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

        {/* Search Bar - Font Diperjelas */}
        <div className="relative mb-8 group">
          <Search className="absolute left-5 top-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
          <input 
            type="text"
            placeholder="CARI NAMA ATLET ATAU KOTA..."
            className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] border-2 border-slate-200 bg-white text-slate-900 font-black placeholder-slate-400 outline-none focus:border-blue-600 transition-all shadow-sm text-lg uppercase"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset halaman saat mencari
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
                    <td colSpan={4} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-black text-slate-400 text-xs tracking-widest">MENYINKRONKAN DATA...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                            {item.foto_url ? (
                              <img src={item.foto_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-black text-slate-300 text-xl">{item.nama[0]}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-xl uppercase leading-none mb-1">{item.nama}</div>
                            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase">
                              <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase italic tracking-wider">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="px-8 py-7">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase">
                            <Phone size={14} className="text-green-500" /> {item.whatsapp}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase italic">
                            <MapPin size={14} className="text-red-400" /> {item.domisili}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex justify-end gap-3">
                          <a 
                            href={item.foto_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
                            title="Buka Foto"
                          >
                            <ExternalLink size={18} />
                          </a>
                          <button 
                            onClick={() => handleDelete(item.id, item.nama)}
                            className="p-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:border-red-600 hover:text-red-600 transition-all shadow-sm"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-32 text-center">
                      <div className="max-w-xs mx-auto opacity-20 grayscale mb-4">
                         <Search size={64} className="mx-auto" />
                      </div>
                      <p className="font-black text-slate-300 text-xs tracking-[0.3em] uppercase">Data Pendaftar Tidak Ditemukan</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - Footer */}
          <div className="bg-slate-50/50 px-8 py-6 border-t-2 border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} atlet
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="p-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-12 h-12 rounded-2xl font-black text-sm transition-all shadow-sm ${
                      currentPage === i + 1 
                      ? 'bg-blue-600 text-white scale-110' 
                      : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-blue-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

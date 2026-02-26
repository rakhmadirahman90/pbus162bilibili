import React, { useState, useEffect } from 'react';
// Path '../' karena file ini di dalam folder components
import { supabase } from '../supabase'; 
import { 
  Plus, FileText, Download, Trash2, Search, Mail, X, Send, Loader2 
} from 'lucide-react';

export function KelolaSurat() {
  // State untuk Data & UI
  const [suratList, setSuratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk Modal Tambah
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nomor_surat: '',
    perihal: '',
    file_url: '' // Opsional jika Anda ingin simpan link file nanti
  });

  // Load Data dari Supabase
  const fetchSurat = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('arsip_surat')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) setSuratList(data);
    } catch (err) {
      console.error("Error fetching surat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurat();
  }, []);

  // Fungsi Simpan Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('arsip_surat')
        .insert([
          { 
            nomor_surat: formData.nomor_surat, 
            perihal: formData.perihal,
            created_at: new Date()
          }
        ]);

      if (error) throw error;

      // Reset form dan refresh data
      setFormData({ nomor_surat: '', perihal: '', file_url: '' });
      setIsModalOpen(false);
      fetchSurat();
      alert("Surat berhasil diarsipkan!");
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Pencarian
  const filteredSurat = suratList.filter(s => 
    s.nomor_surat?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.perihal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 text-white max-w-7xl mx-auto min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500">
            <Mail size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Kelola Surat</h1>
            <p className="text-slate-400 text-sm font-medium">Arsip dan Manajemen Surat Organisasi</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> Tambah Surat Baru
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
          <FileText className="text-blue-500 mb-4" size={24} />
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Arsip</h3>
          <p className="text-4xl font-black mt-2 tracking-tighter">{suratList.length}</p>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nomor surat atau perihal..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-5">Tanggal</th>
                <th className="px-8 py-5">Nomor Surat</th>
                <th className="px-8 py-5">Perihal</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic">
                    <div className="flex justify-center items-center gap-2">
                       <Loader2 className="animate-spin" size={20} /> Memuat data...
                    </div>
                  </td>
                </tr>
              ) : filteredSurat.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic">Data tidak ditemukan.</td>
                </tr>
              ) : (
                filteredSurat.map((surat) => (
                  <tr key={surat.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6 text-sm font-medium text-slate-300">
                      {new Date(surat.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-white">{surat.nomor_surat}</td>
                    <td className="px-8 py-6 text-sm text-slate-400">{surat.perihal}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 hover:bg-blue-600/20 text-blue-500 rounded-lg"><Download size={16} /></button>
                        <button className="p-2 hover:bg-rose-600/20 text-rose-500 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH SURAT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Arsipkan Surat Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nomor Surat</label>
                <input 
                  required
                  type="text"
                  placeholder="Contoh: 001/SK/PBSI/2024"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-sm"
                  value={formData.nomor_surat}
                  onChange={(e) => setFormData({...formData, nomor_surat: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Perihal / Keterangan</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Tuliskan perihal surat di sini..."
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-sm resize-none"
                  value={formData.perihal}
                  onChange={(e) => setFormData({...formData, perihal: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {isSubmitting ? "Sedang Menyimpan..." : "Simpan Arsip"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { supabase } from "../supabase";
import { 
  Newspaper, Plus, Trash2, Edit3, Save, X, 
  Image as ImageIcon, Calendar, Tag, Loader2, Zap, Search
} from 'lucide-react';

interface Berita {
  id: string;
  judul: string;
  ringkasan: string;
  konten: string;
  kategori: string;
  gambar_url: string;
  tanggal: string;
  created_at?: string;
}

export default function AdminBerita() {
  const [news, setNews] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State Form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Berita>>({
    judul: '',
    ringkasan: '',
    konten: '',
    kategori: 'Prestasi',
    gambar_url: '',
    tanggal: new Date().toISOString().split('T')[0]
  });

  // State Notifikasi
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('berita')
      .select('*')
      .order('tanggal', { ascending: false });
    
    if (data) setNews(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingId) {
        await supabase.from('berita').update(formData).eq('id', editingId);
      } else {
        await supabase.from('berita').insert([formData]);
      }

      await fetchNews();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      closeModal();
    } catch (err) {
      alert("Gagal menyimpan berita");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Hapus berita ini secara permanen?")) {
      await supabase.from('berita').delete().eq('id', id);
      fetchNews();
    }
  };

  const openModal = (item?: Berita) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        judul: '',
        ringkasan: '',
        konten: '',
        kategori: 'Prestasi',
        gambar_url: '',
        tanggal: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredNews = news.filter(n => 
    n.judul.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500">
                  <Newspaper size={20} />
               </div>
               <p className="text-zinc-500 text-[10px] font-black tracking-[0.3em] uppercase">Content Management</p>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">
              UPDATE <span className="text-blue-600">BERITA TERKINI</span>
            </h1>
          </div>

          <button 
            onClick={() => openModal()}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus size={18} /> Tulis Berita Baru
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10 group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="CARI JUDUL BERITA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-blue-600 transition-all font-bold text-xs tracking-widest"
          />
        </div>

        {/* News Table/Grid */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="py-20 text-center text-zinc-600 font-black uppercase tracking-[0.3em] italic">Memuat Berita...</div>
          ) : filteredNews.map((item) => (
            <div key={item.id} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 group hover:border-blue-600/30 transition-all">
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-zinc-800 shrink-0">
                <img src={item.gambar_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="flex-grow space-y-2">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600/10 text-blue-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/20">{item.kategori}</span>
                  <span className="text-zinc-500 text-[10px] font-bold">{item.tanggal}</span>
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-blue-500 transition-colors">{item.judul}</h3>
                <p className="text-zinc-400 text-sm line-clamp-1">{item.ringkasan}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openModal(item)} className="p-4 bg-zinc-800/50 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-all border border-transparent hover:border-blue-500/20">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-4 bg-zinc-800/50 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL EDITOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#111] w-full max-w-3xl rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                {editingId ? 'Edit' : 'Tulis'} <span className="text-blue-600">Berita</span>
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Judul Berita</label>
                  <input required type="text" className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm transition-all" value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Kategori</label>
                  <select className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm transition-all cursor-pointer" value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})}>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Fasilitas">Fasilitas</option>
                    <option value="Program">Program</option>
                    <option value="Turnamen">Turnamen</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">URL Gambar (Gunakan link dari internet/hosting)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input required type="text" placeholder="https://..." className="w-full pl-14 pr-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm transition-all" value={formData.gambar_url} onChange={e => setFormData({...formData, gambar_url: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Ringkasan (Tampil di halaman depan)</label>
                <input required type="text" className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-blue-600 outline-none font-bold text-sm transition-all" value={formData.ringkasan} onChange={e => setFormData({...formData, ringkasan: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Isi Berita Lengkap</label>
                <textarea rows={5} className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/5 focus:border-blue-600 outline-none font-medium text-sm transition-all" value={formData.konten} onChange={e => setFormData({...formData, konten: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isSaving} className="flex-grow py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95">
                  {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                  Simpan Publikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS NOTIF (Glassmorphism) */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] transition-all duration-700 transform ${
        showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-zinc-900/90 backdrop-blur-2xl border border-blue-500/50 px-10 py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6">
          <div className="bg-blue-600 p-3 rounded-2xl animate-bounce">
            <Zap size={24} className="text-white fill-white" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-xl italic leading-none mb-1">PUBLIKASI BERHASIL!</h4>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest opacity-80">Berita telah diperbarui di Landing Page</p>
          </div>
        </div>
      </div>
    </div>
  );
}
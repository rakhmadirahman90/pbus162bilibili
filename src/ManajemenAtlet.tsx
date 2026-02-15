import React, { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import { 
  Search, User, X, Award, TrendingUp, Users, 
  MapPin, Phone, ShieldCheck, Star, Trophy, Save, Loader2, Edit3,
  ChevronLeft, ChevronRight, Zap, Sparkles, RefreshCcw
} from 'lucide-react';

interface Registrant {
  id: string;
  nama: string;
  whatsapp: string;
  kategori: string;
  domisili: string;
  foto_url: string;
  jenis_kelamin: string;
  rank: number;
  points: number;
  seed: string;
  bio: string;
  prestasi: string;
  status?: string;
}

export default function ManajemenAtlet() {
  const [atlets, setAtlets] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAtlet, setSelectedAtlet] = useState<Registrant | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStats, setEditingStats] = useState<Partial<Registrant> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');

  useEffect(() => {
    fetchAtlets();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchAtlets = async () => {
    setLoading(true);
    try {
      // 1. Ambil data dari tabel pendaftaran
      // 2. Lakukan JOIN ke tabel atlet_stats untuk data performa
      const { data, error } = await supabase
        .from('pendaftaran')
        .select(`
          *,
          atlet_stats (
            rank,
            points,
            seed,
            bio,
            prestasi_terakhir
          )
        `)
        .order('nama', { ascending: true });
      
      if (error) throw error;

      if (data) {
        // MAPPING DATA: Menggabungkan data pendaftaran dengan data stats dari array join
        const formattedData = data.map((item: any) => ({
          ...item,
          // Mengambil data dari array atlet_stats (index 0) jika ada, jika tidak gunakan default
          rank: item.atlet_stats?.[0]?.rank || 0,
          points: item.atlet_stats?.[0]?.points || 0,
          seed: item.atlet_stats?.[0]?.seed || 'UNSEEDED',
          bio: item.atlet_stats?.[0]?.bio || "Profil atlet profesional.",
          prestasi: item.atlet_stats?.[0]?.prestasi_terakhir || "NEW CONTENDER"
        }));
        setAtlets(formattedData);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStats || !editingStats.id) return;
    
    setIsSaving(true);
    try {
      // 1. Cek apakah record sudah ada di atlet_stats
      const { data: existingStats } = await supabase
        .from('atlet_stats')
        .select('id')
        .eq('pendaftaran_id', editingStats.id)
        .maybeSingle();

      const statsPayload = {
        pendaftaran_id: editingStats.id,
        rank: editingStats.rank,
        points: editingStats.points,
        seed: editingStats.seed,
        bio: editingStats.bio,
        prestasi_terakhir: editingStats.prestasi 
      };

      // Simpan/Update ke atlet_stats
      if (existingStats) {
        await supabase.from('atlet_stats').update(statsPayload).eq('pendaftaran_id', editingStats.id);
      } else {
        await supabase.from('atlet_stats').insert([statsPayload]);
      }

      // 2. Sinkronisasi ke tabel Rankings (untuk Landing Page)
      await supabase
        .from('rankings')
        .upsert({
          player_name: editingStats.nama,
          category: editingStats.kategori,
          seed: editingStats.seed,
          total_points: editingStats.points,
          rank: editingStats.rank?.toString()
        }, { onConflict: 'player_name' });

      // 3. Update status pendaftaran secara opsional
      await supabase.from('pendaftaran').update({ status: 'Active' }).eq('id', editingStats.id);

      // REFRESH DATA
      await fetchAtlets();
      
      setNotifMessage("Data Terintegrasi!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setIsEditModalOpen(false);
      setSelectedAtlet(null);
    } catch (err) {
      console.error("Update Error:", err);
      alert("Gagal memperbarui data");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAtlets = atlets.filter(a => 
    a.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAtlets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAtlets.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans relative overflow-hidden">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-blue-600 animate-pulse" />
              <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase">Pro Database System</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">
              Manajemen <span className="text-blue-600">Atlet</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">Manajemen pendaftaran dan prestasi atlet dalam satu dashboard.</p>
          </div>
          <div className="bg-white px-8 py-4 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center gap-6">
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Registrasi</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{atlets.length}</p>
             </div>
             <div className="w-[1px] h-10 bg-slate-100"></div>
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aktif</p>
                <p className="text-2xl font-black text-blue-600 leading-none">{atlets.filter(a => a.points > 0).length}</p>
             </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative mb-10 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={22} />
          <input 
            type="text"
            placeholder="CARI NAMA ATLET..."
            className="w-full pl-14 pr-8 py-5 bg-white rounded-[2rem] border-none shadow-sm focus:ring-4 focus:ring-blue-100 transition-all font-black uppercase text-sm tracking-widest placeholder:text-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ATLET GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-32 text-center">
               <Loader2 className="animate-spin m-auto text-blue-600 mb-4" size={40} />
               <p className="font-black text-slate-300 uppercase italic tracking-[0.3em]">Menyinkronkan Data...</p>
            </div>
          ) : currentItems.map((atlet) => (
            <div 
              key={atlet.id}
              onClick={() => setSelectedAtlet(atlet)}
              className="bg-white p-5 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group border border-slate-100 relative overflow-hidden"
            >
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-5 bg-slate-100 shadow-inner">
                {atlet.foto_url ? (
                  <img src={atlet.foto_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={atlet.nama} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200"><User className="text-slate-400" size={60} /></div>
                )}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xl text-white text-[9px] font-black px-4 py-1.5 rounded-full border border-white/20 uppercase tracking-tighter">
                  #{atlet.rank || '??'} GLOBAL
                </div>
              </div>
              <div className="px-2">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{atlet.kategori}</p>
                <h3 className="text-lg font-black text-slate-900 uppercase italic truncate mb-4 leading-tight">{atlet.nama}</h3>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Points</p>
                    <p className="text-sm font-black text-slate-900 tracking-tighter">{atlet.points.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Seed</p>
                    <p className="text-[10px] font-black text-emerald-600 italic tracking-tighter uppercase">{atlet.seed}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-16">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all group"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`w-12 h-12 rounded-xl font-black text-sm transition-all ${
                    currentPage === i + 1 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 disabled:opacity-20 hover:bg-blue-600 hover:text-white transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {selectedAtlet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">
            <button 
              onClick={() => setSelectedAtlet(null)}
              className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-red-500 text-white rounded-full transition-all border border-white/10"
            >
              <X size={24} />
            </button>

            <div className="w-full md:w-[45%] relative bg-zinc-900 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10"></div>
              {selectedAtlet.foto_url ? (
                <img src={selectedAtlet.foto_url} className="w-full h-full object-cover scale-105" alt={selectedAtlet.nama} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={150} className="text-white/5" /></div>
              )}
              <div className="absolute bottom-10 left-10 z-20">
                 <div className="bg-blue-600 text-white text-[10px] font-black px-5 py-2 rounded-full mb-3 inline-block border border-blue-400/30 uppercase tracking-[0.2em] italic shadow-xl">
                    PRO ATHLETE STATUS
                 </div>
                 <div className="bg-amber-400 text-black font-black text-[11px] px-5 py-2 rounded-xl flex items-center gap-3 shadow-2xl italic uppercase tracking-tighter">
                    <Trophy size={16} /> {selectedAtlet.prestasi}
                 </div>
              </div>
            </div>

            <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-8">
                <div className="flex gap-2">
                  <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-lg border border-blue-600/30 uppercase tracking-widest italic">
                    {selectedAtlet.kategori}
                  </span>
                  <span className="bg-white/5 text-white/40 text-[10px] font-black px-4 py-1.5 rounded-lg border border-white/10 uppercase tracking-widest italic">
                    {selectedAtlet.seed}
                  </span>
                </div>
                <button 
                  onClick={() => { setEditingStats(selectedAtlet); setIsEditModalOpen(true); }}
                  className="group flex items-center gap-2 text-white/30 hover:text-blue-400 text-[10px] font-black transition-all uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full hover:bg-white/5"
                >
                  <Edit3 size={14} className="group-hover:rotate-12 transition-transform" /> UPDATE STATISTICS
                </button>
              </div>

              <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-10 leading-[0.85]">
                {selectedAtlet.nama.split(' ')[0]}<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent">{selectedAtlet.nama.split(' ').slice(1).join(' ')}</span>
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-blue-500/20 transition-colors">
                    <TrendingUp className="text-blue-500 mb-3" size={24} />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Global Standing</p>
                    <p className="text-3xl font-black text-white italic leading-none">#{selectedAtlet.rank}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-amber-500/20 transition-colors">
                    <Zap className="text-amber-500 mb-3" size={24} />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Total Points</p>
                    <p className="text-3xl font-black text-white italic leading-none">{selectedAtlet.points.toLocaleString()}</p>
                  </div>
              </div>

              {/* DATA TAMBAHAN DARI PENDAFTARAN */}
              <div className="grid grid-cols-2 gap-8 mb-10 border-t border-white/5 pt-8">
                 <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Domisili</p>
                    <p className="text-white font-bold text-sm uppercase">{selectedAtlet.domisili}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Kontak</p>
                    <p className="text-white font-bold text-sm uppercase">{selectedAtlet.whatsapp}</p>
                 </div>
              </div>

              <div className="bg-blue-600/5 p-8 rounded-3xl border border-blue-600/10 relative">
                  <div className="absolute -top-3 left-6 px-3 bg-blue-600 text-[9px] font-black uppercase tracking-widest italic rounded text-white py-1">Athlete Bio</div>
                  <p className="text-slate-400 text-sm leading-relaxed italic font-medium">
                    "{selectedAtlet.bio}"
                  </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT STATS */}
      {isEditModalOpen && editingStats && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-2xl uppercase italic tracking-tighter">Edit <span className="text-blue-600">Performance</span></h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={handleUpdateStats} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rank Position</label>
                  <input type="number" className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-black text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" value={editingStats.rank} onChange={e => setEditingStats({...editingStats, rank: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Poin</label>
                  <input type="number" className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-black text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" value={editingStats.points} onChange={e => setEditingStats({...editingStats, points: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seed Category (A/B/UNSEEDED)</label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-black text-slate-900 uppercase tracking-widest shadow-inner" value={editingStats.seed} onChange={e => setEditingStats({...editingStats, seed: e.target.value})} />
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prestasi Terakhir</label>
                  <input type="text" className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-black text-slate-900 uppercase italic shadow-inner" placeholder="Contoh: WINNER INTERNAL CUP IV" value={editingStats.prestasi} onChange={e => setEditingStats({...editingStats, prestasi: e.target.value})} />
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biografi & Karakter</label>
                  <textarea rows={4} className="w-full px-6 py-4 bg-slate-100 rounded-2xl border-none font-bold text-slate-700 text-sm shadow-inner" value={editingStats.bio} onChange={e => setEditingStats({...editingStats, bio: e.target.value})} />
              </div>
              <button disabled={isSaving} className="w-full py-5 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:bg-slate-200">
                {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                Publish & Synchronize
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] transition-all duration-700 transform ${
        showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-blue-500/50 px-10 py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(37,99,235,0.2)] flex items-center gap-6 min-w-[380px] overflow-hidden relative">
          <div className="absolute bottom-0 left-0 h-1 bg-blue-600" style={{ width: showSuccess ? '100%' : '0%', transition: 'width 3s linear' }} />
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-600/40 animate-bounce">
            <Zap size={24} className="text-white fill-white" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-xl italic leading-none mb-1 text-nowrap">{notifMessage}</h4>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Sync Successful</p>
          </div>
        </div>
      </div>

    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase'; 
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import News from './components/News';
import Athletes from './components/Players'; 
import Ranking from './components/Rankings'; 
import Gallery from './components/Gallery';
import RegistrationForm from './components/RegistrationForm'; 
import Contact from './components/Contact'; 
import Footer from './components/Footer';

// --- KOMPONEN LOGIN ---
const AdminLogin = ({ onLoginSuccess }: { onLoginSuccess: (session: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      onLoginSuccess(data.session);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 text-white">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-3xl text-slate-900 shadow-2xl">
        <h2 className="text-2xl font-black mb-6 uppercase italic tracking-tighter">Admin Login</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Email Address</label>
            <input 
              type="email" placeholder="admin@pbus162.com" 
              className="w-full p-3 bg-slate-100 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-slate-400 ml-1">Password</label>
            <input 
              type="password" placeholder="••••••••" 
              className="w-full p-3 bg-slate-100 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-500/20"
          >
            {loading ? 'Memverifikasi...' : 'Masuk Dashboard'}
          </button>
        </div>
      </form>
    </div>
  );
};
const AdminDashboard = ({ session }: { session: any }) => {
  const [activeTab, setActiveTab] = useState('pendaftaran');
  const [registrants, setRegistrants] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [rankingAthletes, setRankingAthletes] = useState<any[]>([]);
  
  // State UI & Loading (Hanya satu dideklarasikan di sini)
  const [loading, setLoading] = useState(false);
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [isAthleteLoading, setIsAthleteLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPendaftar, setSelectedPendaftar] = useState<any>(null);
  const [editingRegistrant, setEditingRegistrant] = useState<any>(null);

  // --- FUNGSI AMBIL DATA ---
  const fetchRegistrants = async () => {
    setIsFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from('pendaftaran') // Sesuaikan dengan nama tabel di Supabase Anda
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRegistrants(data || []);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
    } finally {
      setIsFetchLoading(false);
    }
  };

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .order('points', { ascending: false });
      if (error) throw error;
      setRankingAthletes(data || []);
      setAthletes(data || []);
    } catch (err: any) {
      console.error("Gagal sinkronisasi data:", err.message);
    }
  };

  // --- FUNGSI MIGRASI (TERIMA ATLET) ---
  const handleConfirmAcceptance = async () => {
    if (!selectedPendaftar) return;
    
    // Proteksi error toUpperCase: Cek semua kemungkinan nama kolom
    const namaMentah = selectedPendaftar.nama || selectedPendaftar.nama_lengkap || "Tanpa Nama";
    
    setIsAthleteLoading(true);
    try {
      // 1. Masukkan ke tabel rankings
      const { error: insertError } = await supabase
        .from('rankings')
        .insert([{
          player_name: namaMentah.toUpperCase(),
          category: selectedPendaftar.kategori || 'Dewasa / Umum',
          points: 0,
          seed: 'Non-Seed',
          image_url: selectedPendaftar.foto_url || selectedPendaftar.foto_identitas_url || '',
          bio: `Atlet terdaftar via online (${selectedPendaftar.whatsapp || '-'})`
        }]);

      if (insertError) throw insertError;

      // 2. Hapus dari pendaftaran
      const { error: deleteError } = await supabase
        .from('pendaftaran')
        .delete()
        .eq('id', selectedPendaftar.id);

      if (deleteError) throw deleteError;

      alert("Sukses! Atlet berhasil diterima.");
      setShowConfirmModal(false);
      setSelectedPendaftar(null);
      fetchRegistrants();
      fetchAthletes();
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setIsAthleteLoading(false);
    }
  };

  // --- FUNGSI DELETE & UPDATE ---
  const handleDeleteRegistrant = async (id: string) => {
    if (!confirm("Hapus pendaftaran ini?")) return;
    try {
      const { error } = await supabase.from('pendaftaran').delete().eq('id', id);
      if (error) throw error;
      setRegistrants(registrants.filter(r => r.id !== id));
    } catch (err: any) { alert(err.message); }
  };

  const handleUpdateRegistrant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('pendaftaran')
        .update({
          nama: editingRegistrant.nama,
          whatsapp: editingRegistrant.whatsapp,
          kategori: editingRegistrant.kategori
        })
        .eq('id', editingRegistrant.id);
      if (error) throw error;
      alert('Data diperbarui!');
      setShowEditModal(false);
      fetchRegistrants();
    } catch (err: any) { alert(err.message); }
  };

  useEffect(() => {
    fetchAthletes();
    if (activeTab === 'pendaftaran') fetchRegistrants();
  }, [activeTab]);

  // --- RENDER TAB CONTENT ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'pendaftaran':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-20">
             {/* Gunakan kode UI yang Anda miliki di sini, pastikan memanggil handleConfirmAcceptance */}
             {/* ... (Tabel Anda sudah cukup bagus, pastikan tombol 'Ya, Terima' memanggil handleConfirmAcceptance) ... */}
          </div>
        );
      // case lainnya...
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Anda di sini */}
      <main className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </main>
    </div>
  );
};
     case 'atlet':
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-20">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
            Manajemen Profil Atlet
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
              Sinkronisasi Data Kartu Profil & Rangking
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setAthleteForm({ name: '', global_rank: '', bio: '', category: 'Senior', seed: 'Non-Seed', points: 0, image_url: '' })}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Reset Form
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANEL INPUT DATA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest ml-1">Nama Lengkap Atlet</label>
                <input 
                  type="text" placeholder="Contoh: AGUSTILAAR" 
                  value={athleteForm.name}
                  onChange={handleNameChange}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 font-bold uppercase transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Global Rank (Nomor #)</label>
                <input 
                  type="text" placeholder="Contoh: 1" 
                  value={athleteForm.global_rank}
                  onChange={(e) => setAthleteForm({...athleteForm, global_rank: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 font-bold transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Profil Singkat (Bio)</label>
              <textarea 
                placeholder="Tuliskan bio singkat atlet..." 
                rows={3}
                value={athleteForm.bio}
                onChange={(e) => setAthleteForm({...athleteForm, bio: e.target.value})}
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 text-sm italic transition-all"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kategori</label>
                <select 
                  value={athleteForm.category}
                  onChange={(e) => setAthleteForm({...athleteForm, category: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold cursor-pointer"
                >
                  <option value="Senior">Senior</option>
                  <option value="Muda">Muda (U-19)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Seed</label>
                <select 
                  value={athleteForm.seed}
                  onChange={(e) => setAthleteForm({...athleteForm, seed: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold cursor-pointer"
                >
                  <option value="Seed A">Seed A</option>
                  <option value="Seed B">Seed B</option>
                  <option value="Non-Seed">Non-Seed</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Poin Saat Ini</label>
                <input 
                  type="number" value={athleteForm.points}
                  onChange={(e) => setAthleteForm({...athleteForm, points: parseInt(e.target.value) || 0})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-blue-600 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PANEL MEDIA & ACTION */}
        <div className="space-y-6">
          <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest ml-1">Link Foto Atlet (PNG)</label>
              <input 
                type="text" placeholder="https://..." 
                value={athleteForm.image_url}
                onChange={(e) => setAthleteForm({...athleteForm, image_url: e.target.value})}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-white text-[10px]"
              />
            </div>
            
            <button 
              onClick={handleSaveAthlete}
              disabled={isAthleteLoading || !athleteForm.name}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-green-500 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {isAthleteLoading ? 'Processing...' : 'Simpan Profil Atlet'}
            </button>
          </div>

          {/* PREVIEW CARD */}
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Live Preview</label>
             <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden flex items-center">
                <div className="flex gap-5 items-center w-full">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                    {athleteForm.image_url ? (
                      <img src={athleteForm.image_url} className="w-full h-full object-contain" alt="Preview" />
                    ) : (
                      <span className="text-2xl grayscale opacity-20">👤</span>
                    )}
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="font-black text-slate-800 uppercase text-sm leading-tight">
                      {athleteForm.name || 'NAMA ATLET'}
                    </h4>
                    <div className="flex gap-2">
                       <span className={`text-[8px] px-2 py-0.5 rounded-md font-bold uppercase ${athleteForm.category === 'Senior' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                         {athleteForm.category}
                       </span>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- DATABASE TABLE SECTION --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 mt-10">
           <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Database Atlet Terdaftar</h3>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Total: {rankingAthletes.length} Atlet
           </span>
        </div>
        
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-blue-600">Atlet</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Kategori</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Seed / Rank</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            {/* Ganti athletes.map menjadi rankingAthletes.map atau currentAthletes.map */}
<tbody className="divide-y divide-slate-50">
  {rankingAthletes && rankingAthletes.length > 0 ? (
    rankingAthletes.map((atlet) => (
      <tr key={atlet.id} className="hover:bg-slate-50/50 transition-all group">
        <td className="p-5">
          <div className="flex items-center gap-3">
            {/* Circle Inisial */}
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white font-black shrink-0">
              {atlet.player_name ? atlet.player_name.substring(0, 3) : '???'}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm uppercase">{atlet.player_name}</p>
              <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest">
                {atlet.points} POINTS
              </p>
            </div>
          </div>
        </td>
        <td className="p-5 text-center">
          <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase ${
            atlet.category === 'Senior' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
          }`}>
            {atlet.category}
          </span>
        </td>
        <td className="p-5 text-center">
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-700 uppercase">{atlet.seed}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Rank #{atlet.global_rank || '-'}</span>
          </div>
        </td>
        <td className="p-5">
          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={() => setAthleteForm({
                ...atlet,
                name: atlet.player_name // Mapping kembali ke field form
              })}
              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button 
              onClick={() => handleDeleteAthlete(atlet.id)}
              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={4} className="p-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest italic">
        Data atlet tidak ditemukan. Pastikan koneksi database aktif.
      </td>
    </tr>
  )}
</tbody>
          </table>

          {/* FOOTER NAVIGATION (PAGINATION SHEET) */}
          <div className="flex items-center justify-between px-8 py-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Sheet:</span>
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      currentPage === num ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-blue-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase italic">
              Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, rankingAthletes.length)} dari {rankingAthletes.length} Atlet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
    case 'berita':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 uppercase italic tracking-tighter">Publikasi Berita Klub</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Editor Artikel PB US 162</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">Live Editor</span>
                <span className="text-[10px] bg-slate-100 text-slate-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">v1.0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* KOLOM KIRI: EDITOR UTAMA */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Judul Artikel</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Tim Putri Raih Medali Emas..." 
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                    className="w-full p-5 bg-slate-50 border-none rounded-[1.5rem] outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-bold text-xl text-slate-800 transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Ringkasan (Deskripsi Pendek)</label>
                  <textarea 
                    placeholder="Ringkasan singkat yang muncul di kartu berita depan..." 
                    rows={2}
                    value={newsForm.summary}
                    onChange={(e) => setNewsForm({...newsForm, summary: e.target.value})}
                    className="w-full p-5 bg-slate-50 border-none rounded-[1.5rem] outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm text-slate-600 leading-relaxed"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Isi Berita Lengkap</label>
                  <textarea 
                    placeholder="Tuliskan detail berita secara mendalam di sini..." 
                    rows={12}
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                    className="w-full p-6 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm text-slate-700 leading-7"
                  ></textarea>
                </div>
              </div>

              {/* KOLOM KANAN: METADATA & PUBLISH */}
              <div className="space-y-6">
                <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl space-y-6 border border-white/5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest ml-1">Kategori Berita</label>
                    <select 
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({...newsForm, category: e.target.value})}
                      className="w-full p-4 bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-white text-xs font-bold appearance-none cursor-pointer hover:bg-white/10 transition-all"
                    >
                      <option value="Prestasi" className="text-slate-900">🏆 Prestasi</option>
                      <option value="Fasilitas" className="text-slate-900">🏢 Fasilitas</option>
                      <option value="Program" className="text-slate-900">📅 Program</option>
                      <option value="Turnamen" className="text-slate-900">🏸 Turnamen</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest ml-1">Link Gambar Cover</label>
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/..." 
                      value={newsForm.image_url}
                      onChange={(e) => setNewsForm({...newsForm, image_url: e.target.value})}
                      className="w-full p-4 bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-white text-[10px] transition-all" 
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={handlePublishNews}
                      disabled={isNewsLoading}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
                        isNewsLoading 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-green-500 hover:shadow-green-500/20'
                      }`}
                    >
                      {isNewsLoading ? 'MENYIMPAN...' : 'PUBLISH SEKARANG'}
                    </button>
                  </div>
                </div>

                {/* LIVE PREVIEW MINI */}
                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Preview Tampilan Kartu:</p>
                  <div className="overflow-hidden rounded-xl bg-slate-100 aspect-video mb-2">
                    {newsForm.image_url && <img src={newsForm.image_url} alt="preview" className="w-full h-full object-cover" />}
                  </div>
                  <span className="text-[8px] bg-blue-600 text-white px-2 py-1 rounded font-bold uppercase">{newsForm.category}</span>
                  <h4 className="font-bold text-xs line-clamp-2">{newsForm.title || "Judul Berita Baru..."}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{newsForm.summary || "Ringkasan berita akan muncul di sini..."}</p>
                </div>
              </div>
            </div>
          </div>
        );
        case 'peringkat':
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-900 uppercase italic">Update Poin Klasemen</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Standard Point System PB US 162</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FORM INPUT */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Atlet</label>
            <select 
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(e.target.value)}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Cari Nama Atlet --</option>
              {/* Cek apakah athletes ada sebelum di-map */}
              {Array.isArray(athletes) && athletes.map((a: any) => (
                <option key={a.id} value={a.player_name}>{a.player_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kegiatan</label>
              <select 
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none"
              >
                <option value="Harian">Main Rutin</option>
                <option value="Sparing">Sparing</option>
                <option value="Internal">Turnamen Internal</option>
                <option value="Eksternal">Turnamen Eksternal</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasil</label>
              <select 
                value={matchResult}
                onChange={(e) => setMatchResult(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none"
              >
                <option value="Win">Win</option>
                <option value="Draw">Draw</option>
                <option value="Loss">Loss</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleUpdateRank}
            disabled={isRankingLoading || !selectedAthlete}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isRankingLoading ? 'Memproses...' : 'SIMPAN DATA POIN'}
          </button>
        </div>

        {/* PREVIEW KALKULATOR */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-between">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Kalkulasi Poin Otomatis</p>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400 text-xs">Kegiatan:</span>
                <span className="font-bold text-sm">{activityType}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400 text-xs">Status:</span>
                <span className={`font-bold text-sm ${matchResult === 'Win' ? 'text-green-400' : 'text-red-400'}`}>{matchResult}</span>
              </div>
            </div>
          </div>
          <div className="pt-10">
            <span className="text-slate-400 text-[10px] uppercase font-black block">Poin yang didapat:</span>
            <span className="text-6xl font-black text-blue-400 italic">
              +{pointTable[activityType]?.[matchResult] || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
      case 'galeri':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Manajemen Galeri Media</h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setGalleryType('foto')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${galleryType === 'foto' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  Foto
                </button>
                <button 
                  onClick={() => setGalleryType('video')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${galleryType === 'video' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  Video
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`bg-slate-50 p-6 rounded-[2rem] space-y-4 border border-slate-100 transition-all ${galleryType === 'video' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">01. Update Foto (Lensa PB US 162)</p>
                <div className="border-2 border-dashed border-slate-200 bg-white rounded-3xl p-8 text-center hover:border-blue-500 transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-all">
                    <svg className="w-6 h-6 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Klik untuk unggah foto kegiatan</p>
                  <input type="file" className="hidden" accept="image/*" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Keterangan Foto</label>
                  <input type="text" placeholder="Contoh: Latihan rutin atlet junior..." className="w-full mt-2 p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
                </div>
                <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all">Simpan Foto ke Galeri</button>
              </div>

              <div className={`bg-slate-900 p-6 rounded-[2rem] space-y-4 text-white shadow-xl shadow-slate-900/20 transition-all ${galleryType === 'foto' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">02. Update Video (Youtube Embed)</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">URL Video (Youtube Embed Link)</label>
                    <input type="text" placeholder="https://www.youtube.com/embed/..." className="w-full mt-2 p-4 bg-white/10 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-600 shadow-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Judul & Detail Video</label>
                    <textarea placeholder="Jelaskan isi video atau momentum pertandingan..." className="w-full mt-2 p-4 bg-white/10 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-xs text-blue-200 shadow-sm"></textarea>
                  </div>
                  <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all">Simpan Video ke Galeri</button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Preview Galeri Terkini ({galleryType === 'foto' ? 'Foto' : 'Video'})</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-slate-200 rounded-[1.5rem] relative overflow-hidden group border border-slate-100">
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform">
                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                       </button>
                    </div>
                    {galleryType === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="aspect-square border-2 border-dashed border-slate-200 rounded-[1.5rem] flex items-center justify-center text-slate-300 font-bold text-[10px] uppercase tracking-tighter">Slot Kosong</div>
              </div>
            </div>
          </div>
        );
      case 'tentang':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Edit Informasi Klub</h3>
              <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">Konten & Fasilitas</span>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">01. Sejarah & Visi Misi</p>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Sejarah Klub</label>
                  <textarea placeholder="Masukkan sejarah PB US 162..." className="w-full mt-2 p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] shadow-sm transition-all"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Visi</label>
                    <textarea placeholder="Visi klub..." className="w-full mt-2 p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] shadow-sm transition-all"></textarea>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Misi</label>
                    <textarea placeholder="Misi klub..." className="w-full mt-2 p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] shadow-sm transition-all"></textarea>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">02. Update Fasilitas</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Fasilitas</label>
                      <input type="text" placeholder="Contoh: 8 Lapangan Karpet BWF" className="w-full mt-2 p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Keterangan Fasilitas</label>
                      <textarea placeholder="Jelaskan detail fasilitas..." className="w-full mt-2 p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] shadow-sm"></textarea>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Foto Fasilitas</label>
                    <div className="mt-2 border-2 border-dashed border-slate-200 bg-white rounded-3xl p-8 text-center hover:border-blue-500 transition-all cursor-pointer group">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-all">
                        <svg className="w-6 h-6 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unggah Foto Fasilitas</p>
                      <input type="file" className="hidden" accept="image/*" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20">
              Update Seluruh Informasi
            </button>
          </div>
        );
      case 'kontak':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Informasi Kontak & Alamat</h3>
              <span className="text-[10px] bg-green-100 text-green-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">Live On Landing Page</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">01. Akses Cepat</p>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nomor WhatsApp Admin</label>
                    <input type="text" placeholder="Contoh: 08123456789" className="w-full mt-2 p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Instansi</label>
                    <input type="email" placeholder="admin@pbus162.com" className="w-full mt-2 p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">02. Detail Markas Besar</p>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Alamat Lengkap (Markas Utama)</label>
                    <textarea placeholder="Jl. Andi Makkasau No.171..." className="w-full mt-2 p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] shadow-sm"></textarea>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Jam Operasional</label>
                    <input type="text" placeholder="Contoh: Senin - Sabtu: 08.00 - 22.00 WITA" className="w-full mt-2 p-4 bg-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-[2rem] space-y-4 text-white">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">03. Integrasi Google Maps</p>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">URL Google Maps (Link Tombol Navigasi)</label>
                    <input type="text" placeholder="https://maps.google.com/..." className="w-full mt-2 p-4 bg-white/10 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500 shadow-sm" />
                    <p className="text-[9px] text-slate-500 mt-2 italic">*Digunakan untuk tombol "Buka di Google Maps".</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Iframe Embed Map (Tampilan Visual)</label>
                    <textarea placeholder='Tempel kode <iframe> di sini...' className="w-full mt-2 p-4 bg-white/10 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] text-xs font-mono text-blue-300 shadow-sm"></textarea>
                    {/* PERBAIKAN DI BARIS BAWAH INI */}
                    <p className="text-[9px] text-slate-500 mt-2 italic">*Dapatkan dari Google Maps {' > '} Share {' > '} Embed Map.</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                   <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                     Preview Visual Map
                   </p>
                   <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase border-2 border-dashed border-slate-300">
                      Tampilan Map Interaktif
                   </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">Simpan Perubahan Kontak</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      <aside className="w-72 bg-slate-900 text-white p-8 flex flex-col fixed h-full shadow-2xl">
        <div className="mb-12">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">PB US 162<br/><span className="text-blue-500 text-xs tracking-[0.3em]">Bilibili Admin</span></h1>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {[
            { id: 'pendaftaran', label: 'Manajemen pendaftaran' },
            { id: 'atlet', label: 'Manajemen Atlet' },
            { id: 'berita', label: 'Update Berita' },
            { id: 'peringkat', label: 'Update Ranking' },
            { id: 'galeri', label: 'Galeri Media' },
            { id: 'tentang', label: 'Update Tentang Kami' },
            { id: 'kontak', label: 'Update Kontak' }
          ].map((t) => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id)}
              className={`w-full text-left p-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all ${
                activeTab === t.id ? 'bg-blue-600 shadow-xl shadow-blue-600/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="pt-8 border-t border-white/5">
          <p className="text-[10px] text-slate-500 uppercase font-black mb-4 tracking-widest">Akun Petugas</p>
          <div className="bg-white/5 p-4 rounded-2xl mb-6">
            <p className="text-xs font-bold truncate">{session?.user?.email}</p>
          </div>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.hash = '';
            }}
            className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-72 p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10 flex justify-between items-end">
            <div>
              <p className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-2">Internal Management</p>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900">Dashboard</h2>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Status Server</p>
              <p className="text-green-500 text-xs font-bold uppercase tracking-widest flex items-center justify-end gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Terhubung Supabase
              </p>
            </div>
          </header>
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[600px]">
              {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [aboutActiveTab, setAboutActiveTab] = useState('sejarah');
  const [playerActiveTab, setPlayerActiveTab] = useState('Semua');

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminPage(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleNavigation = (sectionId: string, tabId?: string) => {
    if (isAdminPage) {
        window.location.hash = '';
        setTimeout(() => {
            executeScroll(sectionId, tabId);
        }, 100);
    } else {
        executeScroll(sectionId, tabId);
    }
  };

  const executeScroll = (sectionId: string, tabId?: string) => {
    if (sectionId === 'about' && tabId) setAboutActiveTab(tabId);
    if (sectionId === 'atlet') setPlayerActiveTab(tabId || 'Semua');

    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (isAdminPage) {
    return !session ? (
      <AdminLogin onLoginSuccess={setSession} />
    ) : (
      <AdminDashboard session={session} />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-600 selection:text-white antialiased">
      <Navbar onNavigate={handleNavigation} />
      <main className="relative">
        <section id="home">
          <Hero onNavigate={handleNavigation} />
        </section>
        <section id="news" className="scroll-mt-20">
          <News />
        </section>
        <section id="atlet" className="scroll-mt-20">
          <Athletes activeTab={playerActiveTab} />
        </section>
        <section id="rankings" className="scroll-mt-20">
          <Ranking />
        </section>
        <section id="gallery" className="scroll-mt-20">
          <Gallery />
        </section>
        <section id="register" className="scroll-mt-20">
          <RegistrationForm />
        </section>
        <section id="about" className="scroll-mt-20">
          <About 
            activeTab={aboutActiveTab} 
            onTabChange={(id) => setAboutActiveTab(id)} 
          />
        </section>
        <section id="contact" className="scroll-mt-20">
          <Contact />
        </section>
      </main>
      <Footer onNavigate={handleNavigation} />
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { supabase } from "../supabase";
import { 
  Trophy, User, Activity, CheckCircle2, 
  Plus, Loader2, Trash2, Send, Clock, AlertCircle
} from 'lucide-react';

const AdminMatch: React.FC = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [kategori, setKategori] = useState('Harian');
  const [hasil, setHasil] = useState('Menang');

  const CATEGORIES = [
    { id: 'Harian', label: 'Latihan Harian', points: '20/10/5' },
    { id: 'Sparing', label: 'Sparing Partner', points: '100/50/25' },
    { id: 'Internal', label: 'Turnamen Internal', points: '300/--/50' },
    { id: 'Eksternal', label: 'Turnamen Eksternal', points: '500/--/100' },
  ];

  useEffect(() => {
    fetchPlayers();
    fetchRecentMatches();

    // Realtime listener agar riwayat terupdate otomatis
    const channel = supabase
      .channel('admin_realtime')
      .on('postgres_changes', { event: '*', table: 'pertandingan', schema: 'public' }, () => {
        fetchRecentMatches();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('pendaftaran').select('id, nama').order('nama');
    if (data) setPlayers(data);
  };

  const fetchRecentMatches = async () => {
    const { data } = await supabase
      .from('pertandingan')
      .select(`
        id,
        kategori_kegiatan,
        hasil,
        created_at,
        pendaftaran ( nama )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setRecentMatches(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return alert("Pilih Atlet terlebih dahulu!");

    setIsSubmitting(true);
    try {
      // PERBAIKAN: Menggunakan insert biasa tanpa onConflict untuk menghindari error database
      const { error } = await supabase
        .from('pertandingan')
        .insert([
          { 
            pendaftaran_id: selectedPlayer, 
            kategori_kegiatan: kategori, 
            hasil: hasil 
          }
        ]);

      if (error) throw error;
      
      // KODE BARU: Reset form dan fetch ulang data agar instan
      setSelectedPlayer('');
      setHasil('Menang');
      setKategori('Harian');
      await fetchRecentMatches(); // Refresh daftar di bawah
      
      alert("Skor berhasil dicatat! Poin atlet telah diperbarui.");
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMatch = async (id: string) => {
    if (!confirm("Hapus pertandingan ini? Poin atlet akan otomatis berkurang kembali.")) return;
    try {
      const { error } = await supabase.from('pertandingan').delete().eq('id', id);
      if (error) throw error;
      await fetchRecentMatches(); // Refresh daftar setelah hapus
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
            MANAJEMEN <span className="text-blue-600">SKOR & POIN</span>
          </h1>
          <p className="text-zinc-500 text-sm font-bold tracking-widest uppercase">
            Input Hasil Pertandingan PB US 162
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Form Utama */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
                    <User size={14} /> Pilih Atlet
                  </label>
                  <select 
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-5 focus:border-blue-600 outline-none transition-all text-sm appearance-none"
                  >
                    <option value="">-- Pilih Nama Atlet --</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
                      <Activity size={14} /> Jenis Kegiatan
                    </label>
                    <select 
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-5 focus:border-blue-600 outline-none transition-all text-sm"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
                      <Trophy size={14} /> Hasil Akhir
                    </label>
                    <select 
                      value={hasil}
                      onChange={(e) => setHasil(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-2xl py-4 px-5 focus:border-blue-600 outline-none transition-all text-sm"
                    >
                      <option value="Menang">Menang</option>
                      <option value="Seri">Seri</option>
                      <option value="Kalah">Kalah</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                  {isSubmitting ? "MENGIRIM..." : "SUBMIT HASIL"}
                </button>
              </form>
            </div>

            {/* Live History List */}
            <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-[2.5rem]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  <Clock size={14} /> 5 Input Terakhir
                </h3>
              </div>
              
              <div className="space-y-3">
                {recentMatches.length === 0 && (
                  <p className="text-zinc-600 text-xs italic">Belum ada riwayat pertandingan.</p>
                )}
                {recentMatches.map((match: any) => (
                  <div key={match.id} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 group">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white uppercase">{match.pendaftaran?.nama}</span>
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                        {match.kategori_kegiatan} • <span className={match.hasil === 'Menang' ? 'text-emerald-500' : 'text-zinc-500'}>{match.hasil}</span>
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteMatch(match.id)}
                      className="p-3 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            <div className="bg-blue-600/10 border border-blue-600/20 p-6 rounded-[2rem]">
              <h3 className="text-[10px] font-black tracking-widest uppercase mb-4 text-blue-500">Standar Poin PB US 162</h3>
              <div className="space-y-3">
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">{cat.label}</span>
                    <span className="text-xs font-mono font-bold text-white bg-white/5 px-2 py-1 rounded-md">{cat.points}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] flex gap-4">
              <AlertCircle className="text-amber-500 shrink-0" size={20} />
              <p className="text-[10px] text-amber-500/80 leading-relaxed font-medium">
                Sistem menghitung poin secara <strong>Realtime</strong>. Menghapus data di sini akan secara otomatis mengupdate posisi ranking atlet di Landing Page.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminMatch;
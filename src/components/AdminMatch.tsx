import React, { useState, useEffect } from 'react';
import { supabase } from "../supabase";
import { 
  Trophy, User, Activity, CheckCircle2, 
  Plus, Loader2, Trash2, Send 
} from 'lucide-react';

const AdminMatch: React.FC = () => {
  const [players, setPlayers] = useState<any[]>([]);
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
  }, []);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('pendaftaran').select('id, nama').order('nama');
    if (data) setPlayers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return alert("Pilih Atlet terlebih dahulu!");

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('pertandingan').insert([
        { 
          pendaftaran_id: selectedPlayer, 
          kategori_kegiatan: kategori, 
          hasil: hasil 
        }
      ]);

      if (error) throw error;
      
      alert("Skor berhasil dicatat! Poin atlet akan terupdate otomatis.");
      setSelectedPlayer('');
    } catch (err: any) {
      alert("Gagal: " + err.message);
    } finally {
      setIsSubmitting(false);
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
          <div className="md:col-span-2 bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Pilih Atlet */}
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

              {/* Kategori & Hasil */}
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

          {/* Sidebar Info Poin */}
          <div className="space-y-4">
            <div className="bg-blue-600/10 border border-blue-600/20 p-6 rounded-[2rem]">
              <h3 className="text-[10px] font-black tracking-widest uppercase mb-4 text-blue-500">Info Poin</h3>
              <div className="space-y-3">
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">{cat.id}</span>
                    <span className="text-xs font-mono font-bold text-white">{cat.points}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem]">
              <p className="text-[9px] text-zinc-500 leading-relaxed italic">
                *Sistem akan menghitung poin secara otomatis di database menggunakan Trigger PostgreSQL. Lencana Winner akan muncul jika menang di Turnamen Internal.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminMatch;
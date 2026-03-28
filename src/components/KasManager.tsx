import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase'; // Sesuaikan path ke file supabase config Anda
import { 
  Wallet, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface Atlet {
  id: string;
  player_name: string; // Mengikuti kolom di database atlet_stats
}

interface KasEntry {
  id: string;
  created_at: string;
  tanggal_transaksi: string;
  nama_pembayar: string;
  kategori: string;
  jumlah_bayar: number; // DIPERBAIKI: Menggunakan nama kolom database yang benar
  tipe_anggota: string; 
}

export default function KasManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kasData, setKasData] = useState<KasEntry[]>([]);
  const [atlets, setAtlets] = useState<Atlet[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    nama_pembayar: '',
    kategori: 'Iuran Bulanan Tetap (10k)',
    jumlah_bayar: 10000, // DIPERBAIKI: Menggunakan nama kolom database yang benar
    tanggal_transaksi: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Ambil Data Kas
      const { data: kas, error: kasError } = await supabase
        .from('kas_pb')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Ambil Data Atlet
      const { data: atletData, error: atletError } = await supabase
        .from('atlet_stats') 
        .select('id, player_name')
        .order('player_name', { ascending: true });

      if (kasError) throw kasError;
      if (atletError) throw atletError;

      setKasData(kas || []);
      
      if (atletData && atletData.length > 0) {
        setAtlets(atletData);
        // Set default pembayar ke nama atlet pertama
        setFormData(prev => ({ ...prev, nama_pembayar: atletData[0].player_name }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_pembayar) return alert("Pilih nama atlet terlebih dahulu!");

    setSaving(true);
    try {
      // PROSES SIMPAN: Properti disesuaikan dengan constraint NOT NULL 'jumlah_bayar'
      const { error } = await supabase.from('kas_pb').insert([
        {
          nama_pembayar: formData.nama_pembayar,
          kategori: formData.kategori,
          jumlah_bayar: formData.jumlah_bayar, // DIPERBAIKI
          tanggal_transaksi: formData.tanggal_transaksi,
          tipe_anggota: 'Reguler' 
        }
      ]);

      if (error) {
        console.error('Supabase Error Detail:', error);
        throw error;
      }

      alert('Transaksi Berhasil Disimpan!');
      // Reset form nominal ke default setelah berhasil
      setFormData(prev => ({ ...prev, jumlah_bayar: 10000 }));
      fetchData(); // Refresh list data
      
    } catch (error: any) {
      console.error('Error saving:', error);
      alert(`Gagal menyimpan: ${error.message || 'Periksa koneksi atau database'}`);
    } finally {
      setSaving(false);
    }
  };

  // Menghitung saldo menggunakan kolom jumlah_bayar
  const totalSaldo = kasData.reduce((acc, curr) => acc + (curr.jumlah_bayar || 0), 0);

  return (
    <div className="p-6 lg:p-10 bg-[#050505] min-h-screen text-white font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Wallet className="text-emerald-400" size={28} />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-emerald-400">
              Financial <span className="text-white">Reports</span>
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase ml-1">
            PB. BILI BILI 162 INTERNAL TREASURY
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-xs font-black uppercase tracking-widest">
          <FileText size={16} /> Export PDF Report
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Total Saldo
          </p>
          <h2 className="text-2xl font-black italic text-emerald-400">Rp {totalSaldo.toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM LEFT */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem]">
            <h3 className="text-emerald-400 font-black italic uppercase tracking-tighter text-xl mb-6 flex items-center gap-2">
              <Plus size={20} /> New Entry
            </h3>
            
            <form onSubmit={handleSave} className="space-y-5">
              {/* KATEGORI */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Kategori</label>
                <select 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none transition-all"
                  value={formData.kategori}
                  onChange={(e) => {
                    const val = e.target.value;
                    let nominal = 10000;
                    if (val === 'Pembayaran Shuttlecock') nominal = 5000;
                    if (val === 'Pendaftaran Atlet Baru') nominal = 50000;
                    setFormData({...formData, kategori: val, jumlah_bayar: nominal});
                  }}
                >
                  <option value="Iuran Bulanan Tetap (10k)">Iuran Bulanan Tetap (10k)</option>
                  <option value="Pembayaran Shuttlecock">Pembayaran Shuttlecock</option>
                  <option value="Pendaftaran Atlet Baru">Pendaftaran Atlet Baru</option>
                  <option value="Sumbangan Sukarela">Sumbangan Sukarela</option>
                  <option value="Denda Terlambat">Denda Terlambat</option>
                </select>
              </div>

              {/* TANGGAL TRANSAKSI */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Tanggal Transaksi</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="date"
                    required
                    className="w-full bg-black border border-white/10 rounded-xl p-4 pl-12 text-sm focus:border-emerald-500 outline-none transition-all"
                    value={formData.tanggal_transaksi}
                    onChange={(e) => setFormData({...formData, tanggal_transaksi: e.target.value})}
                  />
                </div>
              </div>

              {/* SELECT NAMA ATLET */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nama Pembayar (Atlet)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <select 
                    required
                    className="w-full bg-black border border-white/10 rounded-xl p-4 pl-12 text-sm focus:border-emerald-500 outline-none appearance-none transition-all"
                    value={formData.nama_pembayar}
                    onChange={(e) => setFormData({...formData, nama_pembayar: e.target.value})}
                  >
                    {loading ? (
                      <option>Loading atlet...</option>
                    ) : atlets.length === 0 ? (
                      <option>Tidak ada data atlet</option>
                    ) : (
                      atlets.map((atlet) => (
                        <option key={atlet.id} value={atlet.player_name} className="bg-black">
                          {atlet.player_name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* NOMINAL */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nominal (Rp)</label>
                <input 
                  type="number"
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none transition-all"
                  value={formData.jumlah_bayar}
                  onChange={(e) => setFormData({...formData, jumlah_bayar: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl text-center">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Dibayar</p>
                <h4 className="text-3xl font-black italic">Rp {formData.jumlah_bayar.toLocaleString()}</h4>
              </div>

              <button 
                type="submit"
                disabled={saving || loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                {saving ? 'Processing...' : 'Simpan Transaksi'}
              </button>
            </form>
          </div>
        </div>

        {/* TABLE RIGHT */}
        <div className="lg:col-span-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Financial_Ledger.sh</h3>
              <Search size={16} className="text-slate-500" />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <th className="p-6">Date</th>
                    <th className="p-6">Member</th>
                    <th className="p-6">Category</th>
                    <th className="p-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-slate-500 font-bold italic">Loading Ledger...</td>
                    </tr>
                  ) : kasData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-slate-500 font-bold italic">Belum ada data kas.</td>
                    </tr>
                  ) : (
                    kasData.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-all">
                        <td className="p-6 text-xs text-slate-400 font-mono">
                          {item.tanggal_transaksi ? new Date(item.tanggal_transaksi).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="p-6 font-bold text-sm tracking-tight">{item.nama_pembayar}</td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                            item.kategori === 'Pembayaran Shuttlecock' 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                            : 'bg-white/5 text-white border-white/10'
                          }`}>
                            {item.kategori}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="text-sm font-black italic flex items-center justify-end gap-2 text-emerald-400">
                            <ArrowUpRight size={14} />
                            Rp {(item.jumlah_bayar || 0).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
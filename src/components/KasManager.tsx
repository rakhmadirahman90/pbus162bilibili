import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Wallet, Plus, Database, Clock, ChevronRight, Zap, Info, 
  TrendingUp, Calendar, BarChart3, ArrowUpCircle, FileText, Share2 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function KasManager() {
  const [loading, setLoading] = useState(false);
  const [kasLogs, setKasLogs] = useState<any[]>([]);
  const [kategori, setKategori] = useState<'IURAN_TETAP' | 'IURAN_BINAAN' | 'SHUTTLECOCK' | 'LAINNYA'>('IURAN_TETAP');
  const [tipeAnggota, setTipeAnggota] = useState<'TETAP' | 'TIDAK_TETAP'>('TETAP');
  const [namaAnggota, setNamaAnggota] = useState('');
  const [jumlahBola, setJumlahBola] = useState(1);
  const [nominal, setNominal] = useState(10000);
  const [stats, setStats] = useState({ harian: 0, mingguan: 0, bulanan: 0, total: 0 });

  useEffect(() => {
    fetchKasData();
    const channel = supabase
      .channel('kas-updates')
      .on('postgres_changes', { event: '*', table: 'kas_pb', schema: 'public' }, () => fetchKasData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchKasData = async () => {
    const { data, error } = await supabase.from('kas_pb').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setKasLogs(data);
      calculateStats(data);
    }
  };

  const calculateStats = (data: any[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    let h = 0, m = 0, b = 0, t = 0;
    data.forEach(item => {
      const itemDate = new Date(item.created_at).getTime();
      const val = parseFloat(item.jumlah_bayar);
      if (itemDate >= today) h += val;
      if (itemDate >= startOfWeek) m += val;
      if (itemDate >= startOfMonth) b += b + val; // Fix logic
      t += val;
    });
    setStats({ harian: h, mingguan: m, bulanan: b, total: t });
  };

  // FUNGSI EXPORT PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('id-ID', { dateStyle: 'long' });

    // Header Kop Surat
    doc.setFontSize(18);
    doc.text('LAPORAN KAS PB. BILI BILI 162', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${dateStr}`, 105, 22, { align: 'center' });
    doc.line(20, 25, 190, 25);

    // Ringkasan Keuangan
    doc.setFontSize(12);
    doc.text('RINGKASAN SALDO:', 20, 35);
    doc.setFontSize(10);
    doc.text(`Total Saldo Keseluruhan: Rp ${stats.total.toLocaleString()}`, 20, 42);
    doc.text(`Pemasukan Bulan Ini: Rp ${stats.bulanan.toLocaleString()}`, 20, 47);

    // Tabel Transaksi
    const tableData = kasLogs.map(log => [
      new Date(log.created_at).toLocaleDateString('id-ID'),
      log.nama_pembayar,
      log.kategori.replace('_', ' '),
      log.tipe_anggota,
      `Rp ${parseFloat(log.jumlah_bayar).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['Tanggal', 'Nama', 'Kategori', 'Status', 'Jumlah']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] } // Warna Emerald
    });

    doc.save(`Laporan_Kas_PB162_${new Date().getTime()}.pdf`);
  };

  useEffect(() => {
    if (kategori === 'IURAN_TETAP') setNominal(10000);
    else if (kategori === 'IURAN_BINAAN') setNominal(100000);
    else if (kategori === 'SHUTTLECOCK') {
      const hargaPerBola = tipeAnggota === 'TETAP' ? 4000 : 5000;
      setNominal(hargaPerBola * jumlahBola);
    }
  }, [kategori, tipeAnggota, jumlahBola]);

  const handleSimpanKas = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('kas_pb').insert([{ 
      nama_pembayar: namaAnggota, kategori, tipe_anggota: tipeAnggota,
      jumlah_bola: kategori === 'SHUTTLECOCK' ? jumlahBola : 0,
      jumlah_bayar: nominal
    }]);
    if (!error) { setNamaAnggota(''); setJumlahBola(1); }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-[#050505] min-h-screen text-white font-sans relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[150px] rounded-full -z-10" />

      {/* Header & Stats */}
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-600 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Wallet size={24} className="text-white" />
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                FINANCIAL <span className="text-emerald-500">REPORTS</span>
              </h1>
            </div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] ml-1">PB. Bili Bili 162 Internal Treasury</p>
          </div>

          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-white/5 hover:bg-emerald-600 border border-white/10 hover:border-emerald-500 px-6 py-3 rounded-xl transition-all group"
          >
            <FileText size={16} className="text-emerald-500 group-hover:text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest">Export PDF Report</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Harian', val: stats.harian, icon: <TrendingUp size={14}/>, color: 'text-emerald-400' },
            { label: 'Mingguan', val: stats.mingguan, icon: <Calendar size={14}/>, color: 'text-blue-400' },
            { label: 'Bulanan', val: stats.bulanan, icon: <BarChart3 size={14}/>, color: 'text-purple-400' },
            { label: 'Total Saldo', val: stats.total, icon: <ArrowUpCircle size={14}/>, color: 'text-white' },
          ].map((card, i) => (
            <div key={i} className="bg-zinc-900/50 border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-2 mb-3 text-zinc-500 uppercase font-black text-[9px] tracking-widest">
                {card.icon} {card.label}
              </div>
              <p className={`text-xl font-black italic ${card.color}`}>Rp {card.val.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Input Section */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md">
            <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2 text-emerald-500">
              <Plus size={18} /> New Entry
            </h3>
            <form onSubmit={handleSimpanKas} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block tracking-widest">Kategori</label>
                <select className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-emerald-500 text-white cursor-pointer"
                  value={kategori} onChange={(e: any) => setKategori(e.target.value)}>
                  <option value="IURAN_TETAP">Iuran Bulanan Tetap (10k)</option>
                  <option value="IURAN_BINAAN">Iuran Anak Binaan (100k)</option>
                  <option value="SHUTTLECOCK">Shuttlecock</option>
                  <option value="LAINNYA">Lain-lain</option>
                </select>
              </div>

              {kategori === 'SHUTTLECOCK' && (
                <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block">Tipe</label>
                    <select className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-xs font-bold focus:border-emerald-500 outline-none"
                      value={tipeAnggota} onChange={(e: any) => setTipeAnggota(e.target.value)}>
                      <option value="TETAP">TETAP (4k)</option>
                      <option value="TIDAK_TETAP">NON-TETAP (5k)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block">Qty</label>
                    <input type="number" className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-xs font-bold focus:border-emerald-500 outline-none"
                      value={jumlahBola} onChange={(e) => setJumlahBola(parseInt(e.target.value) || 1)} />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block tracking-widest">Nama Pembayar</label>
                <input type="text" className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-xs font-bold focus:border-emerald-500 outline-none placeholder:text-zinc-700"
                  placeholder="Masukkan nama..." value={namaAnggota} onChange={(e) => setNamaAnggota(e.target.value)} required />
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <p className="text-[9px] font-black text-emerald-500 uppercase mb-1 tracking-[0.2em]">Payable Amount</p>
                <p className="text-2xl font-black italic text-white">Rp {nominal.toLocaleString()}</p>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[11px] py-4 rounded-xl transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2">
                {loading ? <Clock className="animate-spin" size={14} /> : <Database size={14} />} SIMPAN TRANSAKSI
              </button>
            </form>
          </div>
        </div>

        {/* Audit Trail Section */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
            <div className="bg-black/40 px-8 py-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Financial_Ledger.sh</span>
              </div>
              <Share2 size={14} className="text-zinc-700" />
            </div>
            
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-zinc-900 z-10">
                  <tr className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Member</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {kasLogs.map((log) => (
                    <tr key={log.id} className="group hover:bg-emerald-600/[0.03] transition-all">
                      <td className="px-8 py-5">
                        <p className="text-[11px] font-bold text-white">{new Date(log.created_at).toLocaleDateString('id-ID')}</p>
                        <p className="text-[9px] text-zinc-600 font-black uppercase">{new Date(log.created_at).toLocaleTimeString('id-ID')}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-[11px] font-black uppercase italic tracking-tighter text-white">{log.nama_pembayar}</p>
                        <p className="text-[9px] text-zinc-600 uppercase font-bold">{log.tipe_anggota}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[9px] font-black px-2 py-1 bg-zinc-800 text-emerald-500 rounded border border-white/5 uppercase">
                          {log.kategori.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-emerald-500 text-[11px]">
                        Rp {parseFloat(log.jumlah_bayar).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
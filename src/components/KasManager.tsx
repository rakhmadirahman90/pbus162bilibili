import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Wallet, Plus, Search, Calendar, User, 
  ArrowUpRight, ArrowDownLeft, FileText,
  Loader2, CheckCircle2, Hash 
} from 'lucide-react';
// Import jsPDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Atlet {
  id: string;
  player_name: string;
}

interface KasEntry {
  id: string;
  created_at: string;
  tanggal_transaksi: string;
  nama_pembayar: string;
  kategori: string;
  jumlah_bayar: number;
  jumlah_bola: number;
  tipe_anggota: string; 
}

export default function KasManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kasData, setKasData] = useState<KasEntry[]>([]);
  const [atlets, setAtlets] = useState<Atlet[]>([]);

  const [formData, setFormData] = useState({
    nama_pembayar: '',
    kategori: 'Iuran Bulanan Tetap (10k)',
    jumlah_bayar: 10000, 
    jumlah_bola: 0,
    tipe_anggota: 'Anggota Tetap',
    tanggal_transaksi: new Date().toISOString().split('T')[0] 
  });

  // FUNGSI EXPORT PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('id-ID');

    // Header Laporan
    doc.setFontSize(18);
    doc.text('LAPORAN KAS PB. BILI BILI 162', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Tanggal Cetak: ${dateStr}`, 14, 30);

    // Pembuatan Tabel
    const tableColumn = ["Tanggal", "Nama Member", "Kategori", "Bola", "Total Bayar"];
    const tableRows: any[] = [];

    kasData.forEach(item => {
      const rowData = [
        new Date(item.tanggal_transaksi).toLocaleDateString('id-ID'),
        item.nama_pembayar,
        item.kategori,
        item.jumlah_bola || '-',
        `Rp ${item.jumlah_bayar.toLocaleString()}`
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillStyle: [16, 185, 129] }, // Warna Emerald-500
    });

    // Ringkasan Saldo
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Saldo: Rp ${totalSaldo.toLocaleString()}`, 14, finalY);

    doc.save(`Laporan_Kas_PB162_${new Date().getTime()}.pdf`);
  };

  useEffect(() => {
    if (formData.kategori === 'Pembayaran Shuttlecock') {
      const hargaPerBola = formData.tipe_anggota === 'Anggota Tetap' ? 4000 : 5000;
      setFormData(prev => ({ 
        ...prev, 
        jumlah_bayar: prev.jumlah_bola * hargaPerBola 
      }));
    }
  }, [formData.jumlah_bola, formData.tipe_anggota, formData.kategori]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: kas, error: kasError } = await supabase
        .from('kas_pb')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: atletData, error: atletError } = await supabase
        .from('atlet_stats') 
        .select('id, player_name')
        .order('player_name', { ascending: true });

      if (kasError) throw kasError;
      if (atletError) throw atletError;

      setKasData(kas || []);
      
      if (atletData && atletData.length > 0) {
        setAtlets(atletData);
        if (!formData.nama_pembayar) {
          setFormData(prev => ({ ...prev, nama_pembayar: atletData[0].player_name }));
        }
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
      const { error } = await supabase.from('kas_pb').insert([
        {
          nama_pembayar: formData.nama_pembayar,
          kategori: formData.kategori,
          jumlah_bayar: formData.jumlah_bayar,
          jumlah_bola: formData.jumlah_bola,
          tanggal_transaksi: formData.tanggal_transaksi,
          tipe_anggota: formData.tipe_anggota
        }
      ]);

      if (error) throw error;

      alert('Transaksi Berhasil Disimpan!');
      setFormData(prev => ({ ...prev, jumlah_bola: 0, jumlah_bayar: 10000 }));
      fetchData(); 
      
    } catch (error: any) {
      console.error('Error saving:', error);
      alert(`Gagal menyimpan: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

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
        {/* BUTTON DIHUBUNGKAN KE FUNGSI EXPORT */}
        <button 
          onClick={exportToPDF}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
        >
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
                    if (val === 'Pembayaran Shuttlecock') nominal = 0;
                    if (val === 'Pendaftaran Atlet Baru') nominal = 50000;
                    setFormData({...formData, kategori: val, jumlah_bayar: nominal, jumlah_bola: 0});
                  }}
                >
                  <option value="Iuran Bulanan Tetap (10k)">Iuran Bulanan Tetap (10k)</option>
                  <option value="Pembayaran Shuttlecock">Pembayaran Shuttlecock</option>
                  <option value="Pendaftaran Atlet Baru">Pendaftaran Atlet Baru</option>
                  <option value="Sumbangan Sukarela">Sumbangan Sukarela</option>
                </select>
              </div>

              {/* TAMPILAN KHUSUS SHUTTLECOCK */}
              {formData.kategori === 'Pembayaran Shuttlecock' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Tipe</label>
                    <select 
                      className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs focus:border-emerald-500 outline-none"
                      value={formData.tipe_anggota}
                      onChange={(e) => setFormData({...formData, tipe_anggota: e.target.value})}
                    >
                      <option value="Anggota Tetap">Tetap (4k)</option>
                      <option value="Anggota Tidak Tetap">Tidak Tetap (5k)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Jml Bola</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input 
                        type="number"
                        className="w-full bg-black border border-white/10 rounded-xl p-4 pl-10 text-xs focus:border-emerald-500 outline-none"
                        placeholder="0"
                        value={formData.jumlah_bola || ''}
                        onChange={(e) => setFormData({...formData, jumlah_bola: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TANGGAL */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Tanggal</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="date"
                    required
                    className="w-full bg-black border border-white/10 rounded-xl p-4 pl-12 text-sm focus:border-emerald-500 outline-none"
                    value={formData.tanggal_transaksi}
                    onChange={(e) => setFormData({...formData, tanggal_transaksi: e.target.value})}
                  />
                </div>
              </div>

              {/* NAMA ATLET */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nama Pembayar</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <select 
                    required
                    className="w-full bg-black border border-white/10 rounded-xl p-4 pl-12 text-sm focus:border-emerald-500 outline-none appearance-none"
                    value={formData.nama_pembayar}
                    onChange={(e) => setFormData({...formData, nama_pembayar: e.target.value})}
                  >
                    {atlets.map((atlet) => (
                      <option key={atlet.id} value={atlet.player_name} className="bg-black">
                        {atlet.player_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* NOMINAL AKHIR */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nominal (Rp)</label>
                <input 
                  type="number"
                  readOnly={formData.kategori === 'Pembayaran Shuttlecock'}
                  className={`w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none ${formData.kategori === 'Pembayaran Shuttlecock' ? 'opacity-50' : ''}`}
                  value={formData.jumlah_bayar}
                  onChange={(e) => setFormData({...formData, jumlah_bayar: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl text-center">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Tagihan</p>
                <h4 className="text-3xl font-black italic">Rp {formData.jumlah_bayar.toLocaleString()}</h4>
              </div>

              <button 
                type="submit"
                disabled={saving || loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>

        {/* TABLE LEDGER */}
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
                    <th className="p-6">Member</th>
                    <th className="p-6">Category</th>
                    <th className="p-6 text-center">Bola</th>
                    <th className="p-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {kasData.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-all">
                      <td className="p-6">
                        <p className="font-bold text-sm tracking-tight">{item.nama_pembayar}</p>
                        <p className="text-[9px] text-slate-500 uppercase">{item.tipe_anggota}</p>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                          item.kategori === 'Pembayaran Shuttlecock' 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                          : 'bg-white/5 text-white border-white/10'
                        }`}>
                          {item.kategori}
                        </span>
                      </td>
                      <td className="p-6 text-center font-mono text-xs">{item.jumlah_bola || '-'}</td>
                      <td className="p-6 text-right font-black italic text-emerald-400">
                        Rp {item.jumlah_bayar.toLocaleString()}
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
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Wallet, Plus, Search, FileText, Loader2, CheckCircle2, Filter
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// LOGO PB BILI BILI 162
const pbLogoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACCcAAAAA..."; 

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
  
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().substring(0, 7));

  const [formData, setFormData] = useState({
    nama_pembayar: '',
    kategori: 'Iuran Bulanan Tetap (10k)',
    jumlah_bayar: 10000, 
    jumlah_bola: 0,
    tipe_anggota: 'Anggota Tetap',
    tanggal_transaksi: new Date().toISOString().split('T')[0] 
  });

  const filteredData = kasData.filter(item => item.tanggal_transaksi.startsWith(filterMonth));
  const totalSaldoFiltered = filteredData.reduce((acc, curr) => acc + (curr.jumlah_bayar || 0), 0);
  const totalSaldoGlobal = kasData.reduce((acc, curr) => acc + (curr.jumlah_bayar || 0), 0);

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const dateStr = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      // 1. Logo Handling
      try {
        if (pbLogoBase64.length > 100) {
          doc.addImage(pbLogoBase64, 'PNG', 14, 10, 25, 25);
        }
      } catch (logoError) {
        console.error("Logo gagal dimuat:", logoError);
      }

      // 2. Header Alamat (Kop Surat)
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 64, 175); 
      doc.text('PB. BILI BILI 162', 42, 18);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text('Jl. Bili-Bili No. 162, Kel. Lapadde, Kec. Ujung', 42, 24);
      doc.text('Kota Parepare, Sulawesi Selatan 91121', 42, 29);
      doc.text(`Periode Laporan: ${filterMonth}`, 42, 34);

      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(0.8);
      doc.line(14, 38, 196, 38);

      // Judul Laporan
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text('LAPORAN PERTANGGUNGJAWABAN KAS', 14, 48);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100);
      doc.text(`Dicetak pada: ${dateStr}`, 14, 53);

      // 3. Pembuatan Tabel
      const tableColumn = ["Tanggal", "Nama Member", "Kategori", "Bola", "Total Bayar"];
      const tableRows = filteredData.map(item => [
        new Date(item.tanggal_transaksi).toLocaleDateString('id-ID'),
        item.nama_pembayar,
        item.kategori,
        item.jumlah_bola || '-',
        `Rp ${item.jumlah_bayar.toLocaleString()}`
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 58,
        theme: 'grid',
        headStyles: { 
          fillColor: [30, 64, 175],
          fontSize: 10,
          halign: 'center',
          fontStyle: 'bold'
        },
        columnStyles: {
          3: { halign: 'center' }, 
          4: { halign: 'right' }
        },
        styles: { fontSize: 9 }
      });

      // 4. Ringkasan Saldo & Tanda Tangan
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      
      doc.setFillColor(239, 246, 255);
      doc.rect(120, finalY - 6, 76, 10, 'F');
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 64, 175);
      doc.text(`SUBTOTAL PERIODE: Rp ${totalSaldoFiltered.toLocaleString()}`, 192, finalY, { align: 'right' });

      const signY = finalY + 20;
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text('Mengetahui,', 150, signY);
      doc.text('Bendahara PB162', 150, signY + 5);
      doc.text('( ___________________ )', 150, signY + 25);

      doc.save(`Laporan_Kas_PB162_${filterMonth}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Terjadi kesalahan saat membuat PDF.");
    }
  };

  // Logic Perhitungan Otomatis
  useEffect(() => {
    if (formData.kategori === 'Pembayaran Shuttlecock') {
      const hargaPerBola = formData.tipe_anggota === 'Anggota Tetap' ? 4000 : 5000;
      setFormData(prev => ({ 
        ...prev, 
        jumlah_bayar: (prev.jumlah_bola || 0) * hargaPerBola 
      }));
    }
  }, [formData.jumlah_bola, formData.tipe_anggota, formData.kategori]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kasResponse, atletResponse] = await Promise.all([
        supabase.from('kas_pb').select('*').order('tanggal_transaksi', { ascending: false }),
        supabase.from('atlet_stats').select('id, player_name').order('player_name', { ascending: true })
      ]);

      if (kasResponse.error) throw kasResponse.error;
      if (atletResponse.error) throw atletResponse.error;

      setKasData(kasResponse.data || []);
      setAtlets(atletResponse.data || []);
      
      // Set default nama pembayar jika belum ada
      if (atletResponse.data && atletResponse.data.length > 0 && !formData.nama_pembayar) {
        setFormData(prev => ({ ...prev, nama_pembayar: atletResponse.data[0].player_name }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_pembayar) return alert("Pilih nama atlet terlebih dahulu!");

    setSaving(true);
    try {
      const { error } = await supabase.from('kas_pb').insert([formData]);
      if (error) throw error;

      alert('Transaksi Berhasil Disimpan!');
      // Reset form ke state awal tapi tetap mempertahankan tanggal dan nama untuk input beruntun (optional)
      setFormData(prev => ({ 
        ...prev, 
        kategori: 'Iuran Bulanan Tetap (10k)',
        jumlah_bola: 0, 
        jumlah_bayar: 10000 
      }));
      fetchData(); 
    } catch (error: any) {
      alert(`Gagal menyimpan: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 bg-[#050505] min-h-screen text-white font-sans">
      {/* HEADER UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Wallet className="text-blue-400" size={28} />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-blue-400">
              Financial <span className="text-white">Reports</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase ml-1">
            PB. BILI BILI 162 INTERNAL TREASURY
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
             <Filter size={14} className="text-blue-400" />
             <input 
                type="month" 
                className="bg-transparent text-xs font-bold outline-none border-none text-white uppercase"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
             />
          </div>
          
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20"
          >
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Kas Periode Ini ({filterMonth})
          </p>
          <h2 className="text-2xl font-black italic text-blue-400">Rp {totalSaldoFiltered.toLocaleString()}</h2>
        </div>
        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Total Saldo Keseluruhan
          </p>
          <h2 className="text-2xl font-black italic text-white">Rp {totalSaldoGlobal.toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM SECTION */}
        <div className="lg:col-span-4">
          <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem]">
            <h3 className="text-blue-400 font-black italic uppercase tracking-tighter text-xl mb-6 flex items-center gap-2">
              <Plus size={20} /> New Entry
            </h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Kategori</label>
                <select 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none transition-all"
                  value={formData.kategori}
                  onChange={(e) => {
                    const val = e.target.value;
                    let nominal = 10000;
                    if (val === 'Pembayaran Shuttlecock') nominal = 0;
                    if (val === 'Pendaftaran Atlet Baru') nominal = 50000;
                    if (val === 'Sumbangan Sukarela') nominal = 0;
                    setFormData({...formData, kategori: val, jumlah_bayar: nominal, jumlah_bola: 0});
                  }}
                >
                  <option value="Iuran Bulanan Tetap (10k)">Iuran Bulanan Tetap (10k)</option>
                  <option value="Pembayaran Shuttlecock">Pembayaran Shuttlecock</option>
                  <option value="Pendaftaran Atlet Baru">Pendaftaran Atlet Baru</option>
                  <option value="Sumbangan Sukarela">Sumbangan Sukarela</option>
                </select>
              </div>

              {formData.kategori === 'Pembayaran Shuttlecock' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Tipe</label>
                    <select 
                      className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs focus:border-blue-500 outline-none"
                      value={formData.tipe_anggota}
                      onChange={(e) => setFormData({...formData, tipe_anggota: e.target.value})}
                    >
                      <option value="Anggota Tetap">Tetap (4k)</option>
                      <option value="Anggota Tidak Tetap">Tidak Tetap (5k)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Jml Bola</label>
                    <input 
                      type="number"
                      min="0"
                      className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs focus:border-blue-500 outline-none"
                      placeholder="0"
                      value={formData.jumlah_bola || ''}
                      onChange={(e) => setFormData({...formData, jumlah_bola: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Tanggal</label>
                <input 
                  type="date"
                  required
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none"
                  value={formData.tanggal_transaksi}
                  onChange={(e) => setFormData({...formData, tanggal_transaksi: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nama Pembayar</label>
                <select 
                  required
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none"
                  value={formData.nama_pembayar}
                  onChange={(e) => setFormData({...formData, nama_pembayar: e.target.value})}
                >
                  <option value="" disabled>Pilih Atlet...</option>
                  {atlets.map((atlet) => (
                    <option key={atlet.id} value={atlet.player_name} className="bg-black text-white">
                      {atlet.player_name}
                    </option>
                  ))}
                </select>
              </div>

              {(formData.kategori === 'Sumbangan Sukarela' || formData.kategori === 'Pembayaran Shuttlecock') && formData.kategori !== 'Iuran Bulanan Tetap (10k)' && (
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Nominal Custom (Rp)</label>
                   <input 
                     type="number"
                     className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none"
                     value={formData.jumlah_bayar}
                     onChange={(e) => setFormData({...formData, jumlah_bayar: parseInt(e.target.value) || 0})}
                   />
                 </div>
              )}

              <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl text-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Tagihan</p>
                <h4 className="text-3xl font-black italic">Rp {formData.jumlah_bayar.toLocaleString()}</h4>
              </div>

              <button 
                type="submit"
                disabled={saving || loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="lg:col-span-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Ledger_Entry_{filterMonth}.log</h3>
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
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-blue-500" size={32} />
                      </td>
                    </tr>
                  ) : filteredData.length > 0 ? filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-all">
                      <td className="p-6">
                        <p className="font-bold text-sm tracking-tight">{item.nama_pembayar}</p>
                        <p className="text-[9px] text-slate-500 uppercase">{new Date(item.tanggal_transaksi).toLocaleDateString('id-ID')}</p>
                      </td>
                      <td className="p-6">
                        <span className="bg-white/5 text-white border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="p-6 text-center font-mono text-xs">{item.jumlah_bola || '-'}</td>
                      <td className="p-6 text-right font-black italic text-blue-400">
                        Rp {item.jumlah_bayar.toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-slate-500 text-xs italic">Tidak ada data untuk periode ini.</td>
                    </tr>
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
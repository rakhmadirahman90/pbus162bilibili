import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Calendar, Download, Filter, FileText, 
  TrendingUp, Users, Zap, Newspaper, Image,
  ChevronDown, Search, Loader2, BarChart3,
  Printer, FileSpreadsheet, History, CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx'; // Pastikan install: npm install xlsx

export default function AdminLaporan() {
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'harian' | 'bulanan' | 'tahunan'>('harian');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // States untuk menampung data rekap
  const [stats, setStats] = useState({
    pendaftaran: 0,
    pertandingan: 0,
    poinTerdistribusi: 0,
    beritaBaru: 0,
    galeriBaru: 0
  });

  const [detailLogs, setDetailLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchRekapData();
  }, [filterType, selectedDate]);

  const fetchRekapData = async () => {
    setLoading(true);
    try {
      let startDate, endDate;
      const date = new Date(selectedDate);

      if (filterType === 'harian') {
        startDate = new Date(date.setHours(0,0,0,0)).toISOString();
        endDate = new Date(date.setHours(23,59,59,999)).toISOString();
      } else if (filterType === 'bulanan') {
        startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();
      } else {
        startDate = new Date(date.getFullYear(), 0, 1).toISOString();
        endDate = new Date(date.getFullYear(), 11, 31, 23, 59, 59).toISOString();
      }

      // 1. Hitung Pendaftaran
      const { count: regCount } = await supabase.from('pendaftaran')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate).lte('created_at', endDate);

      // 2. Hitung Pertandingan
      const { count: matchCount } = await supabase.from('pertandingan')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate).lte('created_at', endDate);

      // 3. Hitung Berita & Galeri
      const { count: newsCount } = await supabase.from('berita')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate).lte('created_at', endDate);
      
      const { count: galleryCount } = await supabase.from('galeri')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate).lte('created_at', endDate);

      // 4. Hitung Audit Poin & Detail Logs
      const { data: auditData } = await supabase.from('audit_poin')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      const totalPoin = auditData?.reduce((acc, curr) => acc + Math.abs(curr.perubahan), 0) || 0;
      setDetailLogs(auditData || []);

      setStats({
        pendaftaran: regCount || 0,
        pertandingan: matchCount || 0,
        poinTerdistribusi: totalPoin,
        beritaBaru: newsCount || 0,
        galeriBaru: galleryCount || 0
      });

    } catch (error) {
      console.error("Gagal memuat laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- KODE BARU: FUNGSI EXPORT EXCEL ---
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(detailLogs.map(log => ({
      Waktu: new Date(log.created_at).toLocaleString('id-ID'),
      Admin: log.admin_email,
      Atlet: log.atlet_nama,
      Poin_Sebelum: log.poin_sebelum,
      Perubahan: log.perubahan,
      Poin_Sesudah: log.poin_sesudah
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Audit Poin");
    XLSX.writeFile(workbook, `Rekap_Poin_${selectedDate}.xlsx`);
  };

  // --- KODE BARU: FUNGSI CETAK LAPORAN ---
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-12 bg-[#050505] min-h-screen text-white font-sans print:bg-white print:text-black">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 print:hidden">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            REKAPITULASI <span className="text-blue-600">SISTEM</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <BarChart3 size={12} className="text-blue-500" /> Periode Laporan & Monitoring
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 bg-zinc-900/50 p-2 rounded-[2rem] border border-white/5 shadow-2xl">
          <select 
            value={filterType} 
            onChange={(e: any) => setFilterType(e.target.value)}
            className="bg-zinc-800 text-[10px] font-black uppercase px-4 py-2 rounded-full outline-none border border-transparent focus:border-blue-600"
          >
            <option value="harian">Harian</option>
            <option value="bulanan">Bulanan</option>
            <option value="tahunan">Tahunan</option>
          </select>
          
          <input 
            type={filterType === 'tahunan' ? 'number' : filterType === 'bulanan' ? 'month' : 'date'}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-black/40 text-[10px] font-black uppercase px-4 py-2 rounded-full border border-zinc-800 outline-none focus:border-blue-600"
          />

          <div className="flex gap-2 ml-2 border-l border-white/10 pl-4">
            <button 
              onClick={exportToExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 px-4 rounded-full transition-all flex items-center gap-2 text-[10px] font-black uppercase"
            >
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button 
              onClick={handlePrint}
              className="bg-zinc-100 hover:bg-white text-black p-2 px-4 rounded-full transition-all flex items-center gap-2 text-[10px] font-black uppercase"
            >
              <Printer size={14} /> Cetak
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 print:grid-cols-4 print:text-black">
        {[
          { label: 'Pendaftaran Baru', value: stats.pendaftaran, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Pertandingan', value: stats.pertandingan, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Poin Tersirkulasi', value: stats.poinTerdistribusi, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Update Konten', value: stats.beritaBaru + stats.galeriBaru, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((item, idx) => (
          <div key={idx} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-blue-600/30 transition-all print:border-zinc-200">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${item.bg} blur-3xl rounded-full print:hidden`} />
            <item.icon className={`${item.color} mb-4 print:text-zinc-400`} size={24} />
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">{item.label}</p>
            <h2 className="text-4xl font-black italic mt-1">{loading ? '...' : item.value.toLocaleString()}</h2>
          </div>
        ))}
      </div>

      {/* Main Content: Audit Log Table */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] overflow-hidden print:border-zinc-300">
        <div className="p-8 border-b border-white/5 flex justify-between items-center print:border-zinc-200">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 print:text-black">
            <History size={14} className="text-blue-500 print:text-zinc-400" /> Log Aktivitas Audit Poin
          </h3>
          <span className="text-[9px] font-bold text-zinc-500 uppercase">Periode: {selectedDate}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20 text-zinc-500 text-[9px] font-black uppercase tracking-widest print:bg-zinc-100 print:text-zinc-600">
                <th className="px-8 py-6">Waktu</th>
                <th className="px-8 py-6">Admin</th>
                <th className="px-8 py-6">Aktivitas Atlet</th>
                <th className="px-8 py-6">Perubahan Poin</th>
                <th className="px-8 py-6 print:hidden">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="animate-spin inline-block text-blue-600" size={30} />
                  </td>
                </tr>
              ) : detailLogs.length > 0 ? (
                detailLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-white/5 transition-all print:text-black">
                    <td className="px-8 py-6 text-[10px] font-bold text-zinc-400 print:text-zinc-600">
                      {new Date(log.created_at).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black text-blue-500 uppercase">{log.admin_email.split('@')[0]}</td>
                    <td className="px-8 py-6 text-[11px] font-black uppercase tracking-tighter italic">{log.atlet_nama}</td>
                    <td className="px-8 py-6">
                      <span className={`text-[11px] font-black ${log.perubahan > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {log.perubahan > 0 ? `+${log.perubahan}` : log.perubahan} PTS
                      </span>
                    </td>
                    <td className="px-8 py-6 print:hidden">
                      <div className="flex items-center gap-2 text-zinc-500 text-[9px] font-black uppercase">
                        <CheckCircle2 size={12} className="text-emerald-500" /> Recorded
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-zinc-600 font-black uppercase text-[10px] tracking-[0.2em]">
                    Tidak ada aktivitas pada periode ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block mt-12 text-center border-t border-zinc-200 pt-8">
        <p className="text-[10px] font-black uppercase tracking-widest">Dokumen Resmi PB US 162 - Dicetak pada {new Date().toLocaleString()}</p>
      </div>

      {/* CSS untuk Media Print */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .print\\:text-black { color: black !important; }
          .print\\:border-zinc-200 { border-color: #e4e4e7 !important; }
          @page { margin: 2cm; }
        }
      `}</style>
    </div>
  );
}
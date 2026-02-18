import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Calendar, Download, Filter, FileText, 
  TrendingUp, Users, Zap, Newspaper, Image,
  ChevronDown, Search, Loader2, BarChart3,
  Printer, FileSpreadsheet, History, CheckCircle2,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminLaporan() {
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'harian' | 'bulanan' | 'tahunan'>('harian');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
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

      const { count: regCount } = await supabase.from('pendaftaran')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate).lte('created_at', endDate);

      const { count: matchCount } = await supabase.from('pertandingan')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate).lte('created_at', endDate);

      const { count: newsCount } = await supabase.from('berita')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate).lte('created_at', endDate);
      
      const { count: galleryCount } = await supabase.from('galeri')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate).lte('created_at', endDate);

      const { data: auditData } = await supabase.from('audit_poin')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      // Hitung total perubahan poin secara absolut (gain + loss)
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

  const exportToExcel = () => {
    // Format data yang lebih profesional untuk Excel
    const worksheet = XLSX.utils.json_to_sheet(detailLogs.map(log => ({
      'TANGGAL': new Date(log.created_at).toLocaleDateString('id-ID'),
      'WAKTU': new Date(log.created_at).toLocaleTimeString('id-ID'),
      'ADMIN': log.admin_email,
      'ATLET': log.atlet_nama.toUpperCase(),
      'KEGIATAN': log.tipe_kegiatan || 'Penyesuaian Poin',
      'POIN AWAL': log.poin_sebelum,
      'PERUBAHAN': log.perubahan > 0 ? `+${log.perubahan}` : log.perubahan,
      'SALDO AKHIR': log.poin_sesudah,
      'STATUS': 'VERIFIED'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Audit Poin");
    
    // Auto-size columns (Sederhana)
    const wscols = [{wch:15}, {wch:12}, {wch:25}, {wch:25}, {wch:20}, {wch:12}, {wch:12}, {wch:12}, {wch:10}];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `LAPORAN_POIN_${filterType.toUpperCase()}_${selectedDate}.xlsx`);
  };

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
          <div className="flex items-center gap-4 mt-2">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <BarChart3 size={12} className="text-blue-500" /> Monitoring & Audit Center
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 bg-zinc-900/50 p-2 rounded-[2rem] border border-white/5 shadow-2xl">
          <select 
            value={filterType} 
            onChange={(e: any) => setFilterType(e.target.value)}
            className="bg-zinc-800 text-[10px] font-black uppercase px-4 py-2 rounded-full outline-none border border-transparent focus:border-blue-600 cursor-pointer"
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
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 px-4 rounded-full transition-all flex items-center gap-2 text-[10px] font-black uppercase shadow-lg shadow-emerald-600/20"
            >
              <FileSpreadsheet size={14} /> Export Excel
            </button>
            <button 
              onClick={handlePrint}
              className="bg-zinc-100 hover:bg-white text-black p-2 px-4 rounded-full transition-all flex items-center gap-2 text-[10px] font-black uppercase"
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 print:grid-cols-4 print:text-black print:gap-2">
        {[
          { label: 'Pendaftaran Baru', value: stats.pendaftaran, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Pertandingan', value: stats.pertandingan, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Poin Tersirkulasi', value: stats.poinTerdistribusi, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Update Konten', value: stats.beritaBaru + stats.galeriBaru, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((item, idx) => (
          <div key={idx} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-blue-600/30 transition-all print:border-zinc-200 print:p-4">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${item.bg} blur-3xl rounded-full print:hidden`} />
            <item.icon className={`${item.color} mb-4 print:text-zinc-400 print:mb-1`} size={24} />
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">{item.label}</p>
            <h2 className="text-4xl font-black italic mt-1 print:text-2xl">{loading ? '...' : item.value.toLocaleString()}</h2>
          </div>
        ))}
      </div>

      {/* Main Content: Audit Log Table */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] overflow-hidden print:border-zinc-300 print:rounded-xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center print:border-zinc-200 print:p-4">
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 print:text-black">
              <History size={14} className="text-blue-500 print:text-zinc-400" /> Log Aktivitas Audit Poin
            </h3>
            <p className="text-zinc-500 text-[8px] font-bold uppercase mt-1 print:block hidden">Status: Dokumen Terverifikasi Sistem</p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-zinc-500 uppercase px-3 py-1 bg-zinc-800 rounded-full print:bg-zinc-100">
              Periode: {selectedDate}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20 text-zinc-500 text-[9px] font-black uppercase tracking-widest print:bg-zinc-100 print:text-zinc-600">
                <th className="px-8 py-6">Waktu</th>
                <th className="px-8 py-6">Admin & Atlet</th>
                <th className="px-8 py-6">Tipe Kegiatan</th>
                <th className="px-8 py-6 text-right">Perubahan Poin</th>
                <th className="px-8 py-6 text-center print:hidden">Audit Status</th>
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
                detailLogs.map((log) => {
                  const isGain = log.perubahan > 0;
                  return (
                    <tr key={log.id} className={`group transition-all print:text-black ${isGain ? 'hover:bg-emerald-500/[0.02]' : 'hover:bg-red-500/[0.02]'}`}>
                      <td className="px-8 py-6 text-[10px] font-bold text-zinc-400 print:text-zinc-600">
                        <div className="flex flex-col">
                          <span>{new Date(log.created_at).toLocaleDateString('id-ID')}</span>
                          <span className="text-[9px] opacity-60 italic">{new Date(log.created_at).toLocaleTimeString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black uppercase tracking-tighter italic group-hover:text-blue-500 transition-colors">
                            {log.atlet_nama}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-600 uppercase">
                            By: {log.admin_email.split('@')[0]}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black uppercase text-zinc-500 italic">
                          {log.tipe_kegiatan || 'Penyesuaian Poin'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-[12px] font-black flex items-center gap-1 ${isGain ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isGain ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {isGain ? `+${log.perubahan}` : log.perubahan}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-600 uppercase">Final: {log.poin_sesudah}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 print:hidden">
                        <div className="flex items-center justify-center gap-2 text-zinc-500 text-[9px] font-black uppercase bg-black/20 py-2 rounded-xl border border-white/5 group-hover:border-emerald-500/20">
                          <CheckCircle2 size={12} className="text-emerald-500" /> SECURED
                        </div>
                      </td>
                    </tr>
                  );
                })
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
        <p className="text-[10px] font-black uppercase tracking-widest">Dokumen Resmi PB US 162 - Digitalized Audit System</p>
        <p className="text-[8px] text-zinc-400 mt-1 uppercase">Dicetak pada {new Date().toLocaleString('id-ID')}</p>
      </div>

      {/* CSS untuk Media Print */}
      <style>{`
        @media print {
          @page { size: A4; margin: 1cm; }
          body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:text-black { color: black !important; }
          .print\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .print\\:border-zinc-200 { border-color: #e4e4e7 !important; }
          .print\\:border-zinc-300 { border-color: #d4d4d8 !important; }
          .print\\:divide-zinc-200 > * + * { border-top-color: #e4e4e7 !important; }
          .bg-zinc-900\\/40, .bg-black\\/20 { background: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th { background: #f4f4f5 !important; color: #52525b !important; }
        }
      `}</style>
    </div>
  );
}
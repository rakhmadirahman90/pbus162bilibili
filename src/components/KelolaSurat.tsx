import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase'; 
import { 
  Plus, FileText, Download, Trash2, Search, Mail, X, Send, Loader2, Eye, Printer 
} from 'lucide-react';

export function KelolaSurat() {
  const [suratList, setSuratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // State Form disesuaikan dengan isi dokumen PB Bilibili 162
  const [formData, setFormData] = useState({
    nomor_surat: '001/PB-Bilibili162/II/2026',
    lampiran: '-',
    perihal: 'Permohonan Menjadi Narasumber (Penceramah) Kajian Ramadan Online',
    tempat_tanggal: 'Parepare, 24 Februari 2026',
    tujuan_yth: 'Al Hafidz Ustadz Prof. Dr. KH. Muamar Bakry, Lc., M.A',
    jabatan_tujuan: 'Rektor UIM Al-Ghazali Makassar',
    isi_surat: `Segala puji bagi Allah SWT atas segala nikmat dan karunia-Nya yang senantiasa menyertai aktivitas kita. Shalawat serta salam semoga tetap tercurah kepada teladan kita Nabi Muhammad SAW, keluarga, serta para sahabatnya.

Dalam rangka menyemarakkan syiar Islam dan memperdalam pemahaman keagamaan di bulan suci Ramadan 1447 H, kami dari PB Bilibili 162 bermaksud menyelenggarakan kegiatan kajian rutin secara daring. Mengingat kapasitas keilmuan dan ketokohan Bapak, kami dengan kerendahan hati memohon kesediaan Bapak untuk menjadi narasumber pada kegiatan tersebut.`,
    hari_tanggal: 'Jumat, 27 Februari 2026',
    waktu: '05.30 - 06.30 WITA',
    tempat_kegiatan: 'Virtual Meeting Zoom',
    tema: 'Ramadan sebagai Madrasah Integritas dan Spiritual',
    nama_ketua: 'H. Wawan',
    nama_sekretaris: 'H. Barhaman Muin S.Ag'
  });

  const fetchSurat = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('arsip_surat').select('*').order('created_at', { ascending: false });
      if (!error && data) setSuratList(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchSurat(); }, []);

  const handlePrint = () => {
    const content = printRef.current;
    const printWindow = window.open('', '_blank');
    if (printWindow && content) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak Surat - PB Bilibili 162</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print { @page { size: A4; margin: 0; } body { margin: 1.5cm; } }
              .font-serif { font-family: 'Times New Roman', Times, serif; }
            </style>
          </head>
          <body class="bg-white">
            ${content.innerHTML}
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="p-6 md:p-10 text-white max-w-7xl mx-auto min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500"><Mail size={32} /></div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Administrasi Surat</h1>
            <p className="text-slate-400 text-sm font-medium">PB Bilibili 162 Parepare</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
          <Plus size={18} /> Buat Surat Baru
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-white/10">
            <input type="text" placeholder="Cari nomor atau perihal..." className="w-full max-w-md pl-5 pr-6 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-sm" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-5">No. Surat</th>
                <th className="px-8 py-5">Perihal</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {suratList.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6 font-bold">{s.nomor_surat}</td>
                  <td className="px-8 py-6 text-slate-400">{s.perihal}</td>
                  <td className="px-8 py-6 text-right"><button className="p-2 text-rose-500"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL LENGKAP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-[95%] h-[90vh] rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden">
            
            {/* FORM INPUT */}
            <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r border-white/5 space-y-4">
              <h2 className="text-xl font-black uppercase italic border-b border-white/10 pb-4">Edit Isi Surat</h2>
              
              <div className="grid grid-cols-1 gap-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Surat</label>
                <input type="text" className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs" value={formData.nomor_surat} onChange={(e)=>setFormData({...formData, nomor_surat: e.target.value})} />
                
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tujuan (Yth)</label>
                <input type="text" className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs" value={formData.tujuan_yth} onChange={(e)=>setFormData({...formData, tujuan_yth: e.target.value})} />
                
                <label className="text-[10px] font-bold text-slate-500 uppercase">Jabatan Tujuan</label>
                <input type="text" className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs" value={formData.jabatan_tujuan} onChange={(e)=>setFormData({...formData, jabatan_tujuan: e.target.value})} />

                <label className="text-[10px] font-bold text-slate-500 uppercase">Perihal</label>
                <textarea className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs h-20" value={formData.perihal} onChange={(e)=>setFormData({...formData, perihal: e.target.value})} />
                
                <label className="text-[10px] font-bold text-slate-500 uppercase">Isi Paragraf</label>
                <textarea className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs h-32" value={formData.isi_surat} onChange={(e)=>setFormData({...formData, isi_surat: e.target.value})} />
              </div>

              <div className="flex gap-2 pt-4">
                  <button onClick={handlePrint} className="flex-1 py-3 bg-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2"><Printer size={14}/> Print PDF</button>
                  <button onClick={()=>setIsModalOpen(false)} className="flex-1 py-3 bg-rose-600 rounded-xl font-bold text-xs">Tutup</button>
              </div>
            </div>

            {/* LIVE PREVIEW (KOP SURAT PB BILIBILI 162) */}
            <div className="hidden md:block flex-1 bg-slate-800 p-8 overflow-y-auto">
              <div ref={printRef} className="bg-white text-black p-[1.5cm] mx-auto w-[21cm] min-h-[29.7cm] shadow-2xl font-serif text-[11pt]">
                
                {/* KOP SURAT PERSIS FILE */}
                <div className="flex items-center border-b-[4px] border-black pb-2 mb-6">
                  <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center font-bold text-3xl border-4 border-black rounded-full italic mr-4">PB</div>
                  <div className="text-center flex-1">
                    <h1 className="text-2xl font-bold uppercase leading-tight tracking-tighter">PB BILIBILI 162</h1>
                    <p className="text-[8pt] leading-tight font-sans">Sekertariat: Jl. Andi Makkasau No.171, Ujung Lare, Kec. Soreang, Kota Parepare, Sulawesi Selatan 91131</p>
                    <p className="text-[8pt] font-sans">Telepon: 081219027234 | Email: pbilibili162@gmail.com</p>
                  </div>
                </div>

                {/* HEADER INFO */}
                <div className="flex justify-between mb-6">
                    <div className="space-y-0.5">
                        <p>Nomor : {formData.nomor_surat}</p>
                        <p>Lampiran : {formData.lampiran}</p>
                        <p>Perihal : <strong>{formData.perihal}</strong></p>
                    </div>
                    <div><p>{formData.tempat_tanggal}</p></div>
                </div>

                <div className="mb-6">
                    <p>Kepada Yth.</p>
                    <p className="font-bold">{formData.tujuan_yth}</p>
                    <p>{formData.jabatan_tujuan}</p>
                    <p>Di - Tempat</p>
                </div>

                <div className="space-y-4 text-justify">
                    <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
                    <p className="font-bold">Dengan hormat,</p>
                    <p>{formData.isi_surat}</p>
                    
                    <div className="pl-8 space-y-1">
                        <p>Hari/Tanggal : {formData.hari_tanggal}</p>
                        <p>Waktu : {formData.waktu}</p>
                        <p>Tempat : {formData.tempat_kegiatan}</p>
                        <p>Tema : "{formData.tema}"</p>
                    </div>

                    <p>Demikian permohonan ini kami sampaikan. Atas perhatian, perkenan, dan kerja sama Bapak, kami ucapkan terima kasih yang sebesar-besarnya. Jazakumullahu khairan katsiran.</p>
                    <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh.</p>
                </div>

                {/* TANDA TANGAN DOUBLE */}
                <div className="mt-12 flex justify-between px-10">
                    <div className="text-center">
                        <p className="mb-20">Ketua,</p>
                        <p className="font-bold underline uppercase">{formData.nama_ketua}</p>
                    </div>
                    <div className="text-center">
                        <p className="mb-20">Sekretaris,</p>
                        <p className="font-bold underline uppercase">{formData.nama_sekretaris}</p>
                    </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
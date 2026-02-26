import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase'; 
import { 
  Plus, FileText, Download, Trash2, Search, Mail, X, Send, Loader2, Printer, Upload, Image as ImageIcon
} from 'lucide-react';

export function KelolaSurat() {
  const [suratList, setSuratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // State Form disesuaikan persis dengan dokumen PB Bilibili 162 [cite: 1, 4, 5, 15]
  const [formData, setFormData] = useState({
    nomor_surat: '001/PB-Bilibili162/II/2026',
    lampiran: '-',
    perihal: 'Permohonan Menjadi Narasumber (Penceramah) Kajian Ramadan Online',
    tempat_tanggal: 'Parepare, 24 Februari 2026',
    tujuan_yth: 'Al Hafidz Ustadz Prof. Dr. KH. Muamar Bakry, Lc., M.A',
    jabatan_tujuan: 'Rektor UIM Al-Ghazali Makassar',
    isi_surat: `Segala puji bagi Allah SWT atas segala nikmat dan karunia-Nya yang senantiasa menyertai aktivitas kita. Shalawat serta salam semoga tetap tercurah kepada teladan kita Nabi Muhammad SAW, keluarga, serta para sahabatnya. [cite: 11, 12]

Dalam rangka menyemarakkan syiar Islam dan memperdalam pemahaman keagamaan di bulan suci Ramadan 1447 H, kami dari PB Bilibili 162 bermaksud menyelenggarakan kegiatan kajian rutin secara daring. Mengingat kapasitas keilmuan dan ketokohan Bapak, kami dengan kerendahan hati memohon kesediaan Bapak untuk menjadi narasumber pada kegiatan tersebut. [cite: 13, 14]`,
    hari_tanggal: 'Jumat, 27 Februari 2026',
    waktu: '05.30 - 06.30 WITA',
    tempat_kegiatan: 'Virtual Meeting Zoom',
    tema: 'Ramadan sebagai Madrasah Integritas dan Spiritual',
    nama_ketua: 'H. Wawan', // Default sesuai dokumen [cite: 27]
    nama_sekretaris: 'H. Barhaman Muin S.Ag', // Default sesuai dokumen [cite: 29]
    ttd_ketua: null as string | null,
    ttd_sekretaris: null as string | null
  });

  const fetchSurat = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('arsip_surat').select('*').order('created_at', { ascending: false });
      if (!error && data) setSuratList(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchSurat(); }, []);

  // Fungsi Unggah Tanda Tangan
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'ketua' | 'sekretaris') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [type === 'ketua' ? 'ttd_ketua' : 'ttd_sekretaris']: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

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
              .stamp-container { position: relative; }
              .signature-overlay { position: absolute; top: -40px; left: 50%; transform: translateX(-50%); width: 120px; z-index: 10; opacity: 0.9; }
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
      {/* HEADER UTAMA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500"><Mail size={32} /></div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Administrasi Surat</h1>
            <p className="text-slate-400 text-sm font-medium">PB Bilibili 162 Parepare [cite: 1, 4]</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
          <Plus size={18} /> Buat Surat Baru
        </button>
      </div>

      {/* MODAL LENGKAP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-[98%] h-[95vh] rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden shadow-2xl">
            
            {/* PANEL KIRI: FORM EDITOR */}
            <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r border-white/5 space-y-6 custom-scrollbar">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Editor Surat</h2>
                <button onClick={() => setIsModalOpen(false)} className="hover:text-rose-500"><X /></button>
              </div>
              
              <div className="space-y-4">
                {/* Input Fields Dasar */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Surat [cite: 5]</label>
                    <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm" value={formData.nomor_surat} onChange={(e)=>setFormData({...formData, nomor_surat: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Perihal [cite: 5]</label>
                    <textarea className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm h-20" value={formData.perihal} onChange={(e)=>setFormData({...formData, perihal: e.target.value})} />
                  </div>
                </div>

                {/* Input Pengurus */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Ketua [cite: 27]</label>
                    <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm" value={formData.nama_ketua} onChange={(e)=>setFormData({...formData, nama_ketua: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Sekretaris [cite: 29]</label>
                    <input type="text" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm" value={formData.nama_sekretaris} onChange={(e)=>setFormData({...formData, nama_sekretaris: e.target.value})} />
                  </div>
                </div>

                {/* Upload Tanda Tangan */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-2xl hover:bg-white/5 cursor-pointer">
                    <Upload size={18} className="text-blue-500 mb-2" />
                    <span className="text-[9px] font-bold uppercase text-slate-400">TTD Ketua</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'ketua')} />
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-2xl hover:bg-white/5 cursor-pointer">
                    <Upload size={18} className="text-blue-500 mb-2" />
                    <span className="text-[9px] font-bold uppercase text-slate-400">TTD Sekre</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'sekretaris')} />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button onClick={handlePrint} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                  <Printer size={16}/> Print PDF
                </button>
              </div>
            </div>

            {/* PANEL KANAN: LIVE PREVIEW (IDENTIK PDF) [cite: 1, 4, 15] */}
            <div className="hidden md:block flex-1 bg-slate-900/50 p-10 overflow-y-auto custom-scrollbar">
              <div ref={printRef} className="bg-white text-black p-[2cm] mx-auto w-[21cm] min-h-[29.7cm] shadow-2xl font-serif text-[11.5pt] leading-relaxed">
                
                {/* KOP SURAT PERSIS DOKUMEN [cite: 1, 4] */}
                <div className="flex items-center border-b-[4px] border-black pb-3 mb-8 relative">
                  {/* LOGO PB BILIBILI 162 [cite: 1, 25] */}
                  <div className="w-28 h-28 flex-shrink-0 flex items-center justify-center border-[5px] border-black rounded-full mr-6">
                    <div className="text-center">
                        <span className="block text-4xl font-black italic -mb-2">PB</span>
                        <span className="block text-sm font-bold tracking-tighter">162</span>
                    </div>
                  </div>
                  <div className="text-center flex-1 pr-10">
                    <h1 className="text-[28pt] font-black uppercase leading-none tracking-tighter mb-1">PB BILI-BILI 162</h1>
                    <p className="text-[9pt] leading-tight font-sans font-medium mb-1">
                      Sekertariat: Jl. Andi Makkasau No.171, Ujung Lare, Kec. Soreang, Kota Parepare, Sulawesi Selatan 91131 
                    </p>
                    <p className="text-[9pt] font-sans font-semibold">
                      Telepon: 081219027234 | Email: pbilibili162@gmail.com 
                    </p>
                  </div>
                </div>

                {/* DETAIL SURAT [cite: 5] */}
                <div className="flex justify-between mb-8">
                    <div className="space-y-0.5">
                        <p><span className="inline-block w-20">Nomor</span> : {formData.nomor_surat}</p>
                        <p><span className="inline-block w-20">Lampiran</span> : {formData.lampiran}</p>
                        <p><span className="inline-block w-20">Perihal</span> : <strong>{formData.perihal}</strong></p>
                    </div>
                    <div className="text-right"><p>{formData.tempat_tanggal}</p></div>
                </div>

                <div className="mb-8">
                    <p>Kepada Yth. [cite: 6]</p>
                    <p className="font-bold">{formData.tujuan_yth} [cite: 7]</p>
                    <p>{formData.jabatan_tujuan} [cite: 7]</p>
                    <p>Di - Tempat [cite: 8]</p>
                </div>

                <div className="space-y-5 text-justify">
                    <p>Assalamu'alaikum Warahmatullahi Wabarakatuh, [cite: 9]</p>
                    <p className="font-bold">Dengan hormat, [cite: 10]</p>
                    <p>{formData.isi_surat} [cite: 11, 13, 14]</p>
                    
                    {/* DETAIL KEGIATAN [cite: 15, 16] */}
                    <div className="pl-10 space-y-1">
                        <p><span className="inline-block w-32">Hari/Tanggal</span> : {formData.hari_tanggal}</p>
                        <p><span className="inline-block w-32">Waktu</span> : {formData.waktu}</p>
                        <p><span className="inline-block w-32">Tempat</span> : {formData.tempat_kegiatan}</p>
                        <p><span className="inline-block w-32">Tema</span> : "{formData.tema}"</p>
                    </div>

                    <p>Demikian permohonan ini kami sampaikan. Atas perhatian, perkenan, dan kerja sama Bapak, kami ucapkan terima kasih yang sebesar-besarnya. Jazakumullahu khairan katsiran. [cite: 20, 21]</p>
                    <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh. [cite: 22]</p>
                </div>

                {/* AREA TANDA TANGAN DOUBLE [cite: 23, 27, 28, 29] */}
                <div className="mt-16 flex justify-between px-12 relative">
                    <div className="text-center w-64 relative stamp-container">
                        <p className="mb-24 relative z-20">Ketua, [cite: 23]</p>
                        {formData.ttd_ketua && (
                          <img src={formData.ttd_ketua} className="signature-overlay" alt="TTD Ketua" />
                        )}
                        <p className="font-bold underline uppercase relative z-20">{formData.nama_ketua}</p>
                    </div>
                    
                    <div className="text-center w-64 relative stamp-container">
                        <p className="mb-24 relative z-20">Sekretaris, [cite: 28]</p>
                        {formData.ttd_sekretaris && (
                          <img src={formData.ttd_sekretaris} className="signature-overlay" alt="TTD Sekre" />
                        )}
                        <p className="font-bold underline uppercase relative z-20">{formData.nama_sekretaris}</p>
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
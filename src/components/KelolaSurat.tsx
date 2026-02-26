import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase'; 
import { 
  Plus, FileText, Download, Trash2, Search, Mail, X, Send, Loader2, Eye, Printer, Upload, Image as ImageIcon, Move, Edit, MessageCircle 
} from 'lucide-react';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas'; 
import { jsPDF } from 'jspdf'; 

export function KelolaSurat() {
  const [suratList, setSuratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isPreviewOnly, setIsPreviewOnly] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [stempelPos, setStempelPos] = useState({ x: -40, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // --- FITUR PERBAIKAN: KIRIM WA DENGAN INSTRUKSI JELAS & AUTO DOWNLOAD ---
  const handleSendWhatsApp = async (surat: any) => {
    setIsSubmitting(true);
    
    // Tampilkan loading karena proses html2canvas butuh waktu
    Swal.fire({
      title: 'Sedang Memproses PDF...',
      text: 'Mohon tunggu sebentar, file sedang disiapkan.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // 1. PROSES GENERATE & DOWNLOAD PDF OTOMATIS
      const element = printRef.current;
      // Gunakan nama file yang unik agar mudah dicari di folder Download
      const safeNomor = surat.nomor_surat.replace(/\//g, '-');
      const pdfFileName = `Surat_PB162_${safeNomor}.pdf`;

      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff"
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(pdfFileName);
      }

      // 2. BUAT PESAN WA DENGAN FORMAT RAPI
      const message = `*SURAT UNDANGAN NARASUMBER*\n` +
        `*PB BILIBILI 162 PAREPARE*\n\n` +
        `Yth. *${surat.tujuan_yth}*\n` +
        `${surat.jabatan_tujuan}\n\n` +
        `Assalamu'alaikum Wr. Wb.\n\n` +
        `Bersama pesan ini, kami bermaksud memohon kesediaan Bapak untuk menjadi narasumber pada:\n\n` +
        `🗓️ *Tgl:* ${surat.hari_tanggal}\n` +
        `⏰ *Waktu:* ${surat.waktu}\n` +
        `📍 *Tempat:* ${surat.tempat_kegiatan}\n` +
        `📚 *Tema:* "${surat.tema}"\n\n` +
        `_Catatan: File PDF resmi telah kami unduh otomatis dan akan kami lampirkan berikut ini._\n\n` +
        `Terima kasih.\n*Admin PB Bilibili 162*`;

      const encodedMessage = encodeURIComponent(message);
      
      // Tutup loading
      Swal.close();

      // 3. KONFIRMASI DENGAN INSTRUKSI VISUAL
      Swal.fire({
        title: 'File Berhasil Diunduh!',
        html: `
          <div style="text-align: left; font-size: 14px; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <p>Langkah selanjutnya:</p>
            <ol style="margin-top: 8px; margin-left: 20px;">
              <li>Klik tombol <b>"Buka WhatsApp"</b> di bawah.</li>
              <li>Pilih kontak tujuan (jika belum terbuka).</li>
              <li>Klik ikon <b>📎 (Klip/Lampiran)</b> di WhatsApp.</li>
              <li>Pilih file: <br><b style="color: #2563eb;">${pdfFileName}</b></li>
            </ol>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'Buka WhatsApp',
        confirmButtonColor: '#25D366',
        showCancelButton: true,
        cancelButtonText: 'Tutup'
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        }
      });

    } catch (error) {
      Swal.close();
      console.error("Gagal memproses WA:", error);
      Swal.fire('Error', 'Gagal membuat file PDF otomatis', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LOGIKA DATABASE & FORM (TETAP SAMA) ---
  const defaultForm = {
    nomor_surat: '',
    lampiran: '-',
    perihal: 'Permohonan Menjadi Narasumber (Penceramah) Kajian Ramadan Online',
    tempat_tanggal: `Parepare, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    tujuan_yth: 'Al Hafidz Ustadz Prof. Dr. KH. Muamar Bakry, Lc., M.A',
    jabatan_tujuan: 'Rektor UIM Al-Ghazali Makassar',
    isi_surat: `Segala puji bagi Allah SWT atas segala nikmat dan karunia-Nya yang senantiasa menyertai aktivitas kita. Shalawat serta salam semoga tetap tercurah kepada teladan kita Nabi Muhammad SAW, keluarga, serta para sahabatnya. Dalam rangka menyemarakkan syiar Islam dan memperdalam pemahaman keagamaan di bulan suci Ramadan 1447 H, kami dari PB Bilibili 162 bermaksud menyelenggarakan kegiatan kajian rutin secara daring. Mengingat kapasitas keilmuan dan ketokohan Bapak, kami dengan kerendahan hati memohon kesediaan Bapak untuk menjadi narasumber pada kegiatan tersebut.`,
    hari_tanggal: 'Jumat, 27 Februari 2026',
    waktu: '05.30 - 06.30 WITA',
    tempat_kegiatan: 'Virtual Meeting Zoom',
    tema: 'Ramadan sebagai Madrasah Integritas dan Spiritual',
    nama_ketua: 'H. Wawan',
    nama_sekretaris: 'H. Barhaman Muin S.Ag',
    logo_url: '', 
    ttd_ketua_url: '', 
    ttd_sekretaris_url: '',
    cap_stempel_url: ''    
  };

  const [formData, setFormData] = useState(defaultForm);

  const fetchSurat = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('arsip_surat').select('*').order('created_at', { ascending: false });
      if (!error && data) setSuratList(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchSurat(); }, []);

  const prepareNewSurat = () => {
    setEditId(null);
    setIsPreviewOnly(false);
    if (suratList.length > 0) {
      const lastSurat = suratList[0];
      const lastNomor = lastSurat.nomor_surat.split('/')[0];
      const nextNumber = (parseInt(lastNomor) + 1).toString().padStart(3, '0');
      const newFullNomor = `${nextNumber}${lastSurat.nomor_surat.substring(3)}`;
      setFormData({
        ...lastSurat,
        nomor_surat: newFullNomor,
        tempat_tanggal: `Parepare, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      });
    } else {
      setFormData({ ...defaultForm, nomor_surat: '001/PB-Bilibili162/II/2026' });
    }
    setIsModalOpen(true);
  };

  const handleEdit = (surat: any) => {
    setEditId(surat.id);
    setIsPreviewOnly(false);
    setFormData(surat);
    setIsModalOpen(true);
  };

  const handlePreview = (surat: any) => {
    setEditId(null);
    setIsPreviewOnly(true);
    setFormData(surat);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const { id, created_at, ...payload } = formData as any;
    try {
      if (editId) {
        const { error } = await supabase.from('arsip_surat').update(payload).eq('id', editId);
        if (error) throw error;
        Swal.fire('Berhasil', 'Surat diperbarui!', 'success');
      } else {
        const { error } = await supabase.from('arsip_surat').insert([payload]);
        if (error) throw error;
        Swal.fire('Berhasil', 'Surat disimpan!', 'success');
      }
      setIsModalOpen(false);
      fetchSurat();
    } catch (err: any) {
      Swal.fire('Error Database', 'Error: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Surat?',
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus!'
    });
    if (result.isConfirmed) {
      await supabase.from('arsip_surat').delete().eq('id', id);
      fetchSurat();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (isPreviewOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setStempelPos({ x: stempelPos.x + e.movementX, y: stempelPos.y + e.movementY });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handlePrint = () => {
    const content = printRef.current;
    const printWindow = window.open('', '_blank');
    if (printWindow && content) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak Surat</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print { @page { size: A4; margin: 0; } body { margin: 1.5cm; } }
              .font-serif { font-family: 'Times New Roman', Times, serif; }
            </style>
          </head>
          <body>
            <div class="font-serif">${content.innerHTML}</div>
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const filteredSurat = suratList.filter(s => 
    s.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.perihal.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <button onClick={prepareNewSurat} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg">
          <Plus size={18} /> Buat Surat Baru
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-white/10">
            <input type="text" placeholder="Cari nomor..." className="w-full max-w-md pl-5 pr-6 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="px-8 py-5">No. Surat</th>
                <th className="px-8 py-5">Perihal</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSurat.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6 font-bold text-blue-400">{s.nomor_surat}</td>
                  <td className="px-8 py-6 text-slate-400 max-w-xs truncate">{s.perihal}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => handleSendWhatsApp(s)} title="Kirim WA" className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all"><MessageCircle size={14}/></button>
                        <button onClick={() => handlePreview(s)} title="Preview" className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><Eye size={14}/></button>
                        <button onClick={() => handleEdit(s)} title="Edit" className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Edit size={14}/></button>
                        <button onClick={() => handleDelete(s.id)} title="Hapus" className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-[95%] h-[90vh] rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden shadow-2xl">
            
            {!isPreviewOnly && (
              <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r border-white/5 space-y-4 custom-scrollbar">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h2 className="text-xl font-black uppercase italic">{editId ? 'Edit Surat' : 'Buat Surat Baru'}</h2>
                  <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col items-center justify-center p-2 border-2 border-dashed border-white/10 rounded-xl hover:bg-white/5 cursor-pointer">
                      <ImageIcon size={14} className="mb-1 text-slate-400"/>
                      <span className="text-[7px] uppercase font-bold text-slate-500">Logo Kop</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo_url')} />
                    </label>
                    <label className="flex flex-col items-center justify-center p-2 border-2 border-dashed border-white/10 rounded-xl hover:bg-white/5 cursor-pointer">
                      <Upload size={14} className="mb-1 text-slate-400"/>
                      <span className="text-[7px] uppercase font-bold text-slate-500">Stempel</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cap_stempel_url')} />
                    </label>
                    <label className="flex flex-col items-center justify-center p-2 border-2 border-dashed border-white/10 rounded-xl hover:bg-white/5 cursor-pointer">
                      <Upload size={14} className="mb-1 text-slate-400"/>
                      <span className="text-[7px] uppercase font-bold text-slate-500">TTD Ketua</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'ttd_ketua_url')} />
                    </label>
                    <label className="flex flex-col items-center justify-center p-2 border-2 border-dashed border-white/10 rounded-xl hover:bg-white/5 cursor-pointer">
                      <Upload size={14} className="mb-1 text-slate-400"/>
                      <span className="text-[7px] uppercase font-bold text-slate-500">TTD Sekr</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'ttd_sekretaris_url')} />
                    </label>
                </div>

                <input type="text" className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs" placeholder="Nomor Surat" value={formData.nomor_surat} onChange={(e)=>setFormData({...formData, nomor_surat: e.target.value})} />
                <input type="text" className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs" placeholder="Nama Ketua" value={formData.nama_ketua} onChange={(e)=>setFormData({...formData, nama_ketua: e.target.value})} />
                <input type="text" className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs" placeholder="Nama Sekretaris" value={formData.nama_sekretaris} onChange={(e)=>setFormData({...formData, nama_sekretaris: e.target.value})} />
                <input type="text" className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs" placeholder="Tujuan Yth" value={formData.tujuan_yth} onChange={(e)=>setFormData({...formData, tujuan_yth: e.target.value})} />
                <textarea className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-xs h-32" placeholder="Isi Paragraf" value={formData.isi_surat} onChange={(e)=>setFormData({...formData, isi_surat: e.target.value})} />

                <button onClick={handleSave} disabled={isSubmitting} className="w-full py-3 bg-blue-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>} Simpan Arsip
                </button>
              </div>
            )}

            <div className="flex-1 bg-slate-800 p-8 overflow-y-auto relative" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
              <div className="absolute top-6 right-10 flex gap-3 z-50">
                  <button onClick={() => handleSendWhatsApp(formData)} disabled={isSubmitting} className="px-4 py-2 bg-green-600 rounded-lg font-bold text-xs flex items-center gap-2 shadow-xl hover:bg-green-500 transition-all disabled:opacity-50">
                    {isSubmitting ? <Loader2 size={14} className="animate-spin"/> : <MessageCircle size={14}/>} Kirim WA
                  </button>
                  <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 rounded-lg font-bold text-xs flex items-center gap-2 shadow-xl hover:bg-blue-500 transition-all"><Printer size={14}/> Cetak</button>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"><X size={20}/></button>
              </div>

              {/* KERTAS A4 */}
              <div ref={printRef} className="bg-white text-black p-[1.5cm] mx-auto w-[21cm] min-h-[29.7cm] shadow-2xl font-serif text-[11pt] leading-relaxed relative overflow-hidden">
                <div className="flex items-center border-b-[4px] border-black pb-2 mb-6">
                  <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center mr-4">
                    {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-contain" /> : <div className="font-bold text-3xl border-4 border-black rounded-full p-2 italic">PB</div>}
                  </div>
                  <div className="text-center flex-1">
                    <h1 className="text-2xl font-bold uppercase tracking-tighter">PB BILIBILI 162</h1>
                    <p className="text-[8pt] font-sans">Sekertariat: Jl. Andi Makkasau No.171, Kota Parepare</p>
                    <p className="text-[8pt] font-sans">081219027234 | pbilibili162@gmail.com</p>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                    <div>
                        <p>Nomor : {formData.nomor_surat}</p>
                        <p>Perihal : <strong>{formData.perihal}</strong></p>
                    </div>
                    <p>{formData.tempat_tanggal}</p>
                </div>

                <div className="mb-6">
                    <p>Kepada Yth. <b>{formData.tujuan_yth}</b></p>
                    <p>{formData.jabatan_tujuan}</p>
                    <p>Di - Tempat</p>
                </div>

                <div className="space-y-4 text-justify">
                    <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
                    <p className="whitespace-pre-line">{formData.isi_surat}</p>
                    <div className="pl-8">
                        <p>Tgl: {formData.hari_tanggal}</p>
                        <p>Waktu: {formData.waktu}</p>
                        <p>Tempat: {formData.tempat_kegiatan}</p>
                        <p>Tema: "{formData.tema}"</p>
                    </div>
                    <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh.</p>
                </div>

                <div className="mt-20 flex justify-between px-10 relative">
                    <div className="text-center w-48 relative">
                        <p className="mb-16">Ketua,</p>
                        {formData.ttd_ketua_url && <img src={formData.ttd_ketua_url} className="absolute top-6 left-1/2 -translate-x-1/2 h-20 mix-blend-multiply object-contain" />}
                        {formData.cap_stempel_url && (
                            <div onMouseDown={handleMouseDown} style={{ transform: `translate(${stempelPos.x}px, ${stempelPos.y}px)` }} className="absolute top-4 left-1/2 w-28 h-28 cursor-move z-20">
                                <img src={formData.cap_stempel_url} className="w-full h-full object-contain opacity-80 mix-blend-darken" />
                            </div>
                        )}
                        <p className="font-bold underline uppercase">{formData.nama_ketua}</p>
                    </div>
                    <div className="text-center w-48 relative">
                        <p className="mb-16">Sekretaris,</p>
                        {formData.ttd_sekretaris_url && <img src={formData.ttd_sekretaris_url} className="absolute top-6 left-1/2 -translate-x-1/2 h-20 mix-blend-multiply object-contain" />}
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
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

  // --- PERBAIKAN LOGIKA: PENGECEKAN ELEMEN OTOMATIS ---
  const handleSendWhatsApp = async (surat: any) => {
    // Jika modal belum terbuka atau data di modal berbeda dengan surat yang diklik
    if (!isModalOpen || formData.nomor_surat !== surat.nomor_surat) {
      setFormData(surat);
      setIsPreviewOnly(true);
      setIsModalOpen(true);
      
      // Berikan jeda waktu (500ms) agar React selesai merender elemen pratinjau ke DOM
      setTimeout(() => {
        executeGenerateAndSend(surat);
      }, 600);
    } else {
      executeGenerateAndSend(surat);
    }
  };

  // Fungsi inti untuk memproses PDF dan Upload
  const executeGenerateAndSend = async (surat: any) => {
    setIsSubmitting(true);
    try {
      const element = printRef.current;
      if (!element) {
        throw new Error("Sistem gagal mendeteksi pratinjau. Pastikan modal pratinjau muncul di layar.");
      }

      // 1. GENERATE PDF
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
      const pdfBlob = pdf.output('blob');

      const fileName = `surat_${surat.nomor_surat.replace(/[/\\?%*:|"<>]/g, '-')}_${Date.now()}.pdf`;

      // 2. UPLOAD KE STORAGE (Pastikan bucket 'surat-pdf' sudah ada)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('surat-pdf')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 3. AMBIL PUBLIC URL
      const { data: { publicUrl } } = supabase.storage
        .from('surat-pdf')
        .getPublicUrl(fileName);

      // 4. PESAN WHATSAPP
      const message = `*UNDANGAN NARASUMBER - PB BILIBILI 162*\n\n` +
        `Yth. *${surat.tujuan_yth}*\n` +
        `Assalamu'alaikum Wr. Wb.\n` +
        `Berikut kami lampirkan surat resmi yang dapat diunduh pada tautan berikut:\n\n` +
        `🔗 *Link Download:* \n${publicUrl}\n\n` +
        `Terima kasih.`;

      const encodedMessage = encodeURIComponent(message);
      
      Swal.fire({
        title: 'Link Berhasil Dibuat!',
        text: 'File PDF sudah siap di server.',
        icon: 'success',
        confirmButtonText: 'Kirim ke WhatsApp',
        confirmButtonColor: '#25D366',
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        }
      });

    } catch (error: any) {
      console.error(error);
      Swal.fire('Gagal', error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultForm = {
    nomor_surat: '',
    lampiran: '-',
    perihal: 'Permohonan Menjadi Narasumber (Penceramah) Kajian Ramadan Online',
    tempat_tanggal: `Parepare, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    tujuan_yth: 'Al Hafidz Ustadz Prof. Dr. KH. Muamar Bakry, Lc., M.A',
    jabatan_tujuan: 'Rektor UIM Al-Ghazali Makassar',
    isi_surat: `Segala puji bagi Allah SWT atas segala nikmat dan karunia-Nya yang senantiasa menyertai aktivitas kita...`,
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
      if (error) throw error;
      if (data) setSuratList(data);
    } catch (err: any) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSurat(); }, []);

  const prepareNewSurat = () => {
    setEditId(null);
    setIsPreviewOnly(false);
    if (suratList.length > 0) {
      const lastSurat = suratList[0];
      const lastNomor = lastSurat.nomor_surat.split('/')[0];
      const nextNumber = (parseInt(lastNomor) + 1).toString().padStart(3, '0');
      setFormData({ ...lastSurat, nomor_surat: `${nextNumber}${lastSurat.nomor_surat.substring(3)}` });
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
        await supabase.from('arsip_surat').update(payload).eq('id', editId);
        Swal.fire('Berhasil', 'Surat diperbarui!', 'success');
      } else {
        await supabase.from('arsip_surat').insert([payload]);
        Swal.fire('Berhasil', 'Surat disimpan!', 'success');
      }
      setIsModalOpen(false);
      fetchSurat();
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({ title: 'Hapus?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      await supabase.from('arsip_surat').delete().eq('id', id);
      fetchSurat();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => setIsDragging(true);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setStempelPos({ x: stempelPos.x + e.movementX, y: stempelPos.y + e.movementY });
    }
  };
  const handleMouseUp = () => setIsDragging(false);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`<html><head><script src="https://cdn.tailwindcss.com"></script></head><body>${content.innerHTML}</body></html>`);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    }
  };

  return (
    <div className="p-6 md:p-10 text-white max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold italic uppercase tracking-tighter">Administrasi Surat</h1>
        <button onClick={prepareNewSurat} className="px-6 py-2 bg-blue-600 rounded-xl font-bold flex items-center gap-2"><Plus size={18}/> Buat Baru</button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="bg-white/5 text-[10px] uppercase text-slate-400"><th className="px-8 py-4">No. Surat</th><th className="px-8 py-4">Perihal</th><th className="px-8 py-4 text-right">Aksi</th></tr></thead>
          <tbody>
            {suratList.map((s) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-8 py-4 font-bold text-blue-400">{s.nomor_surat}</td>
                <td className="px-8 py-4 text-slate-400">{s.perihal}</td>
                <td className="px-8 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleSendWhatsApp(s)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all">
                      {isSubmitting ? <Loader2 size={14} className="animate-spin"/> : <MessageCircle size={14}/>}
                    </button>
                    <button onClick={() => handlePreview(s)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Eye size={14}/></button>
                    <button onClick={() => handleEdit(s)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Edit size={14}/></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4 overflow-y-auto" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
          <div className="bg-[#0F172A] w-full max-w-[95%] h-[90vh] rounded-3xl flex flex-col md:flex-row overflow-hidden border border-white/10 shadow-2xl">
            
            {!isPreviewOnly && (
              <div className="w-full md:w-1/3 p-6 border-r border-white/10 overflow-y-auto space-y-4">
                <h2 className="text-xl font-bold mb-4 uppercase italic">Editor Surat</h2>
                <div className="grid grid-cols-2 gap-2">
                  <label className="p-2 border border-dashed rounded-lg text-center cursor-pointer text-[10px] text-slate-400">
                    Logo Kop <input type="file" className="hidden" onChange={(e)=>handleImageUpload(e, 'logo_url')}/>
                  </label>
                  <label className="p-2 border border-dashed rounded-lg text-center cursor-pointer text-[10px] text-slate-400">
                    Stempel <input type="file" className="hidden" onChange={(e)=>handleImageUpload(e, 'cap_stempel_url')}/>
                  </label>
                </div>
                <input type="text" value={formData.nomor_surat} onChange={(e)=>setFormData({...formData, nomor_surat: e.target.value})} className="w-full bg-white/5 p-2 rounded text-xs border border-white/10" placeholder="Nomor Surat"/>
                <textarea value={formData.isi_surat} onChange={(e)=>setFormData({...formData, isi_surat: e.target.value})} className="w-full bg-white/5 p-2 rounded text-xs h-32 border border-white/10"/>
                <button onClick={handleSave} className="w-full py-2 bg-blue-600 rounded-lg font-bold text-sm">Simpan</button>
              </div>
            )}

            <div className="flex-1 bg-slate-800 p-8 overflow-y-auto relative">
              <div className="absolute top-4 right-4 flex gap-2 z-50">
                <button onClick={() => executeGenerateAndSend(formData)} disabled={isSubmitting} className="px-4 py-2 bg-green-600 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg">
                   {isSubmitting ? <Loader2 className="animate-spin" size={14}/> : <MessageCircle size={14}/>} Kirim Link WA
                </button>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/10 rounded-lg"><X size={18}/></button>
              </div>

              <div ref={printRef} className="bg-white text-black p-[1.5cm] mx-auto w-[21cm] min-h-[29.7cm] font-serif leading-relaxed relative shadow-lg">
                <div className="border-b-4 border-black pb-2 mb-4 flex items-center">
                  <div className="w-20 h-20 mr-4 overflow-hidden">
                    {formData.logo_url && <img src={formData.logo_url} className="w-full h-full object-contain"/>}
                  </div>
                  <div className="text-center flex-1">
                    <h1 className="text-xl font-bold uppercase">PB BILIBILI 162</h1>
                    <p className="text-[8pt]">Sekertariat: Jl. Andi Makkasau No.171, Kota Parepare</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p>Nomor : {formData.nomor_surat}</p>
                  <p>Perihal : <b>{formData.perihal}</b></p>
                </div>
                <div className="text-justify mb-8">
                  <p>Assalamu'alaikum Wr. Wb.</p>
                  <p className="mt-2 whitespace-pre-line text-sm">{formData.isi_surat}</p>
                </div>
                <div className="mt-12 flex justify-between relative px-10">
                   <div className="text-center relative w-40">
                     <p className="mb-14">Ketua,</p>
                     {formData.ttd_ketua_url && <img src={formData.ttd_ketua_url} className="absolute top-4 left-1/2 -translate-x-1/2 h-16 mix-blend-multiply"/>}
                     {formData.cap_stempel_url && (
                        <div 
                          onMouseDown={handleMouseDown}
                          style={{ transform: `translate(${stempelPos.x}px, ${stempelPos.y}px)` }} 
                          className="absolute -top-4 -left-4 w-24 h-24 opacity-80 mix-blend-darken cursor-move"
                        >
                          <img src={formData.cap_stempel_url} className="w-full h-full object-contain"/>
                        </div>
                     )}
                     <p className="font-bold underline text-sm uppercase">{formData.nama_ketua}</p>
                   </div>
                   <div className="text-center relative w-40">
                     <p className="mb-14">Sekretaris,</p>
                     {formData.ttd_sekretaris_url && <img src={formData.ttd_sekretaris_url} className="absolute top-4 left-1/2 -translate-x-1/2 h-16 mix-blend-multiply"/>}
                     <p className="font-bold underline text-sm uppercase">{formData.nama_sekretaris}</p>
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
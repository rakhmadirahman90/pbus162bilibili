import { useState } from 'react';
import { User, Phone, MapPin, Award, Send, CheckCircle2, MessageSquare, Image as ImageIcon } from 'lucide-react';

export default function RegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    kategori: 'Anak-anak (U-11/U-13)',
    domisili: '',
    pengalaman: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const sendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    // --- PENGATURAN NOMOR PENGURUS ---
    const adminPhoneNumber = "6281234567890"; // GANTI DENGAN NOMOR ANDA
    
    // Format pesan
    const message = `Halo Pengurus PB US 162, saya ingin mendaftar sebagai atlet:%0A%0A` +
      `*Nama:* ${formData.nama}%0A` +
      `*WhatsApp:* ${formData.whatsapp}%0A` +
      `*Kategori:* ${formData.kategori}%0A` +
      `*Domisili:* ${formData.domisili}%0A` +
      `*Pengalaman:* ${formData.pengalaman || '-'}%0A%0A` +
      `_(Saya akan melampirkan foto identitas setelah pesan ini terkirim)_`;

    // Kirim ke WhatsApp
    window.open(`https://wa.me/${adminPhoneNumber}?text=${message}`, '_blank');
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-blue-50 rounded-[2.5rem] border-2 border-blue-200 text-center animate-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <CheckCircle2 size={80} className="text-blue-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">LANGKAH TERAKHIR!</h2>
        <p className="text-slate-600 mb-8">Pesan data sudah dikirim ke WhatsApp. **Mohon jangan lupa lampirkan foto identitas** yang tadi Anda pilih di dalam chat WhatsApp tersebut.</p>
        <button 
          onClick={() => { setSubmitted(false); setFileName(""); }}
          className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition-all"
        >
          Daftar Kembali
        </button>
      </div>
    );
  }

  return (
    <section id="register" className="py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
             <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <MessageSquare size={28} />
             </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Pendaftaran Atlet</h2>
          <p className="text-lg text-slate-600">Lengkapi berkas untuk bergabung dengan PB US 162.</p>
        </div>

        <form onSubmit={sendToWhatsApp} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Nama & WhatsApp (Tetap sama) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <User size={16} className="text-blue-600" /> Nama Lengkap
              </label>
              <input required name="nama" type="text" onChange={handleInputChange} placeholder="Nama sesuai identitas" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <Phone size={16} className="text-blue-600" /> WhatsApp
              </label>
              <input required name="whatsapp" type="tel" onChange={handleInputChange} placeholder="0812xxxx" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none transition-all" />
            </div>

            {/* Upload Foto Identitas */}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <ImageIcon size={16} className="text-blue-600" /> Foto Identitas (KTP/KIA/Kartu Pelajar)
              </label>
              <div className="relative">
                <input 
                  required
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full px-6 py-4 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-between group-hover:border-blue-400 transition-all">
                  <span className="text-slate-500 italic">
                    {fileName ? `File terpilih: ${fileName}` : "Klik atau seret foto ke sini..."}
                  </span>
                  <ImageIcon size={20} className="text-blue-400" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">*Foto ini akan Anda lampirkan secara manual di WhatsApp setelah menekan tombol kirim.</p>
            </div>

            {/* Kategori & Domisili */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <Award size={16} className="text-blue-600" /> Kategori Umur
              </label>
              <select name="kategori" onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none">
                <option>Anak-anak (U-11/U-13)</option>
                <option>Remaja (U-15/U-17)</option>
                <option>Taruna / Dewasa</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <MapPin size={16} className="text-blue-600" /> Domisili
              </label>
              <input required name="domisili" type="text" onChange={handleInputChange} placeholder="Contoh: Makassar" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none transition-all" />
            </div>

            {/* Pengalaman */}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <Award size={16} className="text-blue-600" /> Pengalaman Bertanding (Opsional)
              </label>
              <textarea name="pengalaman" rows={3} onChange={handleInputChange} placeholder="Prestasi yang pernah diraih..." className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none transition-all"></textarea>
            </div>
          </div>

          <div className="mt-12">
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98]"
            >
              Kirim Pendaftaran <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
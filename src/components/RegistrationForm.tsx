import React, { useState } from 'react';
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
    
    // Format pesan untuk WhatsApp
    const message = `*PENDAFTARAN ATLET BARU PB US 162*%0A%0A` +
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
      <div className="max-w-2xl mx-auto my-12 p-10 bg-blue-50 rounded-[3rem] border-2 border-blue-100 text-center animate-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <CheckCircle2 size={80} className="text-blue-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Langkah Terakhir!</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Pesan pendaftaran telah disiapkan. Silakan tekan **"Kirim"** di aplikasi WhatsApp Anda dan **lampirkan foto identitas** yang tadi Anda pilih.
        </p>
        <button 
          onClick={() => { setSubmitted(false); setFileName(""); }}
          className="bg-slate-900 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
        >
          Daftar Kembali
        </button>
      </div>
    );
  }

  // Common Input Class to fix visibility issue (White text on White background)
  const inputClass = "w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400";

  return (
    <section id="register" className="py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
             <div className="bg-blue-600 p-3 rounded-full text-white shadow-lg">
                <MessageSquare size={28} />
             </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">Pendaftaran Atlet</h2>
          <p className="text-lg text-slate-600">Gabung dan raih prestasimu bersama PB US 162</p>
        </div>

        {/* Card Form */}
        <form onSubmit={sendToWhatsApp} className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            
            {/* Nama Lengkap */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                <User size={14} className="text-blue-600" /> Nama Lengkap
              </label>
              <input 
                required 
                name="nama" 
                type="text" 
                onChange={handleInputChange} 
                placeholder="Masukkan nama lengkap" 
                className={inputClass} 
              />
            </div>

            {/* Nomor WhatsApp */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                <Phone size={14} className="text-blue-600" /> Nomor WhatsApp
              </label>
              <input 
                required 
                name="whatsapp" 
                type="tel" 
                onChange={handleInputChange} 
                placeholder="Contoh: 08123456789" 
                className={inputClass} 
              />
            </div>

            {/* Upload Foto Identitas */}
            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                <ImageIcon size={14} className="text-blue-600" /> Foto Identitas (KTP/KIA/Kartu Pelajar)
              </label>
              <div className="relative group">
                <input 
                  required
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full px-6 py-5 rounded-2xl bg-blue-50/50 border-2 border-dashed border-blue-200 group-hover:border-blue-500 group-hover:bg-blue-50 transition-all flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    {fileName ? `File: ${fileName}` : "Klik untuk pilih foto..."}
                  </span>
                  <ImageIcon size={20} className="text-blue-500" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">*Foto identitas wajib Anda lampirkan manual di WhatsApp nanti.</p>
            </div>

            {/* Kategori Umur */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                <Award size={14} className="text-blue-600" /> Kategori Umur
              </label>
              <select 
                name="kategori" 
                onChange={handleInputChange} 
                className={`${inputClass} cursor-pointer`}
              >
                <option>Anak-anak (U-11/U-13)</option>
                <option>Remaja (U-15/U-17)</option>
                <option>Taruna / Dewasa</option>
                <option>Veteran</option>
              </select>
            </div>

            {/* Domisili */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                <MapPin size={14} className="text-blue-600" /> Domisili / Alamat
              </label>
              <input 
                required 
                name="domisili" 
                type="text" 
                onChange={handleInputChange} 
                placeholder="Contoh: Makassar" 
                className={inputClass} 
              />
            </div>

            {/* Pengalaman */}
            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                <Award size={14} className="text-blue-600" /> Pengalaman Bertanding (Opsional)
              </label>
              <textarea 
                name="pengalaman" 
                rows={3} 
                onChange={handleInputChange} 
                placeholder="Sebutkan prestasi atau klub sebelumnya..." 
                className={inputClass}
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-12">
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:shadow-none transition-all active:scale-[0.98]"
            >
              Kirim Pendaftaran <Send size={20} />
            </button>
            <p className="text-center text-slate-400 text-[10px] mt-6 font-bold uppercase tracking-tighter">
              Admin akan merespon pendaftaran Anda melalui WhatsApp.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
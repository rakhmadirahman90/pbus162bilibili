import { useState } from 'react';
import { User, Phone, MapPin, Award, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function RegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
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

  const sendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    // --- PENGATURAN NOMOR PENGURUS ---
    const adminPhoneNumber = "6281219027234"; // Ganti dengan nomor WhatsApp pengurus (awali dengan 62)
    
    // Format pesan
    const message = `Halo Pengurus PB US 162, saya ingin mendaftar sebagai atlet:%0A%0A` +
      `*Nama:* ${formData.nama}%0A` +
      `*WhatsApp:* ${formData.whatsapp}%0A` +
      `*Kategori:* ${formData.kategori}%0A` +
      `*Domisili:* ${formData.domisili}%0A` +
      `*Pengalaman:* ${formData.pengalaman || '-'}`;

    // Kirim ke WhatsApp
    window.open(`https://wa.me/${adminPhoneNumber}?text=${message}`, '_blank');
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-green-50 rounded-[2.5rem] border-2 border-green-200 text-center animate-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <CheckCircle2 size={80} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">PENDAFTARAN TERKIRIM!</h2>
        <p className="text-slate-600 mb-8">Pesan WhatsApp pendaftaran telah disiapkan. Silakan tekan "Kirim" pada aplikasi WhatsApp Anda.</p>
        <button 
          onClick={() => setSubmitted(false)}
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
          <p className="text-lg text-slate-600">Lengkapi formulir di bawah untuk bergabung dengan PB US 162.</p>
        </div>

        <form onSubmit={sendToWhatsApp} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <User size={16} className="text-blue-600" /> Nama Lengkap
              </label>
              <input 
                required
                name="nama"
                type="text" 
                value={formData.nama}
                onChange={handleInputChange}
                placeholder="Nama sesuai identitas"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Nomor WhatsApp */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <Phone size={16} className="text-blue-600" /> WhatsApp
              </label>
              <input 
                required
                name="whatsapp"
                type="tel" 
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="0812xxxx"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <Award size={16} className="text-blue-600" /> Kategori Umur
              </label>
              <select 
                name="kategori"
                value={formData.kategori}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none"
              >
                <option>Anak-anak (U-11/U-13)</option>
                <option>Remaja (U-15/U-17)</option>
                <option>Taruna / Dewasa</option>
                <option>Veteran</option>
              </select>
            </div>

            {/* Domisili */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <MapPin size={16} className="text-blue-600" /> Domisili
              </label>
              <input 
                required
                name="domisili"
                type="text" 
                value={formData.domisili}
                onChange={handleInputChange}
                placeholder="Contoh: Makassar"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Pengalaman */}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <Award size={16} className="text-blue-600" /> Pengalaman Bertanding (Opsional)
              </label>
              <textarea 
                name="pengalaman"
                rows={4}
                value={formData.pengalaman}
                onChange={handleInputChange}
                placeholder="Sebutkan klub sebelumnya atau prestasi yang pernah diraih..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none transition-all"
              ></textarea>
            </div>
          </div>

          <div className="mt-12">
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98]"
            >
              Kirim via WhatsApp <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
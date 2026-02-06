import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    kategori: 'Anak-anak (U-11/U-13)',
    domisili: '',
    pengalaman: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let publicUrl = "";

      // 1. PROSES UPLOAD FOTO
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('identitas-atlet')
          .upload(filePath, file);

        if (uploadError) throw new Error("Gagal upload foto: " + uploadError.message);

        const { data: urlData } = supabase.storage
          .from('identitas-atlet')
          .getPublicUrl(filePath);
        
        publicUrl = urlData.publicUrl;
      }

      // 2. SIMPAN DATA KE TABEL
      const { error: dbError } = await supabase
        .from('pendaftaran')
        .insert([{ 
          nama: formData.nama, 
          whatsapp: formData.whatsapp, 
          kategori: formData.kategori,
          domisili: formData.domisili,
          pengalaman: formData.pengalaman,
          foto_url: publicUrl 
        }]);

      if (dbError) throw new Error("Gagal simpan teks: " + dbError.message);

      // 3. JIKA BERHASIL, BUKA WA
      const message = `Halo Admin, saya sudah mendaftar melalui web.%0A*Nama:* ${formData.nama}%0A*Link Foto:* ${publicUrl}`;
      window.open(`https://wa.me/6281219027234text=${message}`, '_blank');
      
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message); // INI AKAN MEMBERITAHU KITA ERRORNYA APA
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <div className="p-20 text-center"> <CheckCircle2 className="mx-auto text-green-500" size={60}/> <h2 className="text-2xl font-bold mt-4">BERHASIL DISIMPAN!</h2> </div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-lg">
      <h2 className="text-xl font-bold mb-6">Formulir Pendaftaran</h2>
      <input required className="w-full mb-4 p-3 border rounded-xl" placeholder="Nama Lengkap" onChange={e => setFormData({...formData, nama: e.target.value})} />
      <input required className="w-full mb-4 p-3 border rounded-xl" placeholder="Nomor WA" onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
      <input required type="file" accept="image/*" className="mb-4" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">
        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Kirim Sekarang"}
      </button>
    </form>
  );
}
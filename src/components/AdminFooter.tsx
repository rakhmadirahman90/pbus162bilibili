import React, { useState, useEffect } from 'react';
import { Save, Globe, MapPin, Phone, Mail, Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import { supabase } from '../supabase'; // Pastikan path sesuai struktur project Anda

export default function AdminFooter() {
  const [loading, setLoading] = useState(false);
  const [footerConfig, setFooterConfig] = useState({
    description: '',
    address: '',
    phone: '',
    email: '',
    copyright: '',
    socials: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    }
  });

  // Fetch data awal dari tabel site_settings
  useEffect(() => {
    async function getFooterData() {
      const { data } = await supabase.from('site_settings').select('footer_config').single();
      if (data?.footer_config) setFooterConfig(data.footer_config);
    }
    getFooterData();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .update({ footer_config: footerConfig })
      .eq('id', 1); // Asumsi ID setting adalah 1

    if (!error) alert("Data Footer Berhasil Disinkronisasi!");
    setLoading(false);
  };

  return (
    <div className="p-6 bg-[#0f111a] min-h-screen text-white">
      <div className="max-w-4xl mx-auto bg-[#161925] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
          KELOLA FOOTER WEBSITE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sisi Kiri: Informasi Umum */}
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 block">Deskripsi Klub</label>
              <textarea 
                className="w-full bg-[#0f111a] border border-white/10 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none h-32"
                value={footerConfig.description}
                onChange={(e) => setFooterConfig({...footerConfig, description: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 block">Alamat Kantor</label>
              <input 
                className="w-full bg-[#0f111a] border border-white/10 rounded-xl p-4 text-sm"
                value={footerConfig.address}
                onChange={(e) => setFooterConfig({...footerConfig, address: e.target.value})}
              />
            </div>
          </div>

          {/* Sisi Kanan: Kontak & Sosial Media */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">WhatsApp</label>
                <input className="w-full bg-[#0f111a] border border-white/10 rounded-xl p-3 text-sm" value={footerConfig.phone} onChange={(e) => setFooterConfig({...footerConfig, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2 block">Email</label>
                <input className="w-full bg-[#0f111a] border border-white/10 rounded-xl p-3 text-sm" value={footerConfig.email} onChange={(e) => setFooterConfig({...footerConfig, email: e.target.value})} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase text-slate-500 tracking-widest block">Media Sosial (Link)</label>
              <div className="flex items-center gap-3 bg-[#0f111a] p-2 rounded-xl border border-white/5">
                <Instagram size={18} className="text-pink-500" />
                <input className="bg-transparent flex-1 text-sm outline-none" placeholder="Instagram URL" value={footerConfig.socials.instagram} onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, instagram: e.target.value}})} />
              </div>
              <div className="flex items-center gap-3 bg-[#0f111a] p-2 rounded-xl border border-white/5">
                <Facebook size={18} className="text-blue-500" />
                <input className="bg-transparent flex-1 text-sm outline-none" placeholder="Facebook URL" value={footerConfig.socials.facebook} onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, facebook: e.target.value}})} />
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <button 
          onClick={handleUpdate}
          disabled={loading}
          className="w-full mt-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 transition-all"
        >
          {loading ? 'Processing...' : <><Save size={18} /> SINKRONISASI PERUBAHAN</>}
        </button>
      </div>
    </div>
  );
}
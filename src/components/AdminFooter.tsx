import React, { useState, useEffect } from 'react';
import { Save, MapPin, Phone, Mail, Instagram, Facebook, Youtube, Twitter, Eye, Link } from 'lucide-react';
import { supabase } from '../supabase'; 

export default function AdminFooter() {
  const [loading, setLoading] = useState(false);
  const [footerConfig, setFooterConfig] = useState({
    description: '',
    address: '',
    phone: '',
    email: '',
    copyright: '© 2026 PB US 162 BILIBILI. ALL RIGHTS RESERVED.',
    navigation: [
      { name: 'Beranda', id: 'home' },
      { name: 'Berita', id: 'news' },
      { name: 'Atlet', id: 'players' },
      { name: 'Peringkat', id: 'rankings' },
      { name: 'Galeri', id: 'gallery' },
      { name: 'Tentang', id: 'about' },
      { name: 'Hubungi Kami', id: 'contact' }
    ],
    socials: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: ''
    }
  });

  useEffect(() => {
    async function getFooterData() {
      const { data } = await supabase.from('site_settings').select('footer_config').single();
      if (data?.footer_config) {
        setFooterConfig({
          ...footerConfig,
          ...data.footer_config,
          socials: { ...footerConfig.socials, ...data.footer_config.socials },
          // Jika navigasi di DB berbeda jumlahnya, kita utamakan struktur 7 menu ini
          navigation: data.footer_config.navigation || footerConfig.navigation
        });
      }
    }
    getFooterData();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .update({ footer_config: footerConfig })
      .eq('id', 1);

    if (!error) alert("Perubahan Berhasil Disimpan!");
    setLoading(false);
  };

  const updateNavigation = (index: number, newName: string) => {
    const newNav = [...footerConfig.navigation];
    newNav[index].name = newName;
    setFooterConfig({ ...footerConfig, navigation: newNav });
  };

  return (
    <div className="p-6 bg-[#0f111a] min-h-screen text-white space-y-10">
      <div className="max-w-6xl mx-auto bg-[#161925] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
          PENGATURAN FOOTER LENGKAP
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* KOLOM 1: INFO UTAMA & COPYRIGHT */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-3 block">Deskripsi Klub</label>
              <textarea 
                className="w-full bg-[#0f111a] border border-white/10 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none h-32 transition-all"
                value={footerConfig.description}
                onChange={(e) => setFooterConfig({...footerConfig, description: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-3 block">Teks Hak Cipta</label>
              <input 
                className="w-full bg-[#0f111a] border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none font-mono text-[10px]"
                value={footerConfig.copyright}
                onChange={(e) => setFooterConfig({...footerConfig, copyright: e.target.value})}
              />
            </div>
          </div>

          {/* KOLOM 2: KONTAK & SOSMED */}
          <div className="space-y-6">
            <div className="p-4 bg-[#0f111a] rounded-2xl border border-white/5 space-y-4">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] block">Kontak & Alamat</label>
              <input className="w-full bg-[#161925] border border-white/5 rounded-xl p-3 text-xs outline-none" placeholder="Alamat" value={footerConfig.address} onChange={(e) => setFooterConfig({...footerConfig, address: e.target.value})} />
              <input className="w-full bg-[#161925] border border-white/5 rounded-xl p-3 text-xs outline-none" placeholder="WhatsApp" value={footerConfig.phone} onChange={(e) => setFooterConfig({...footerConfig, phone: e.target.value})} />
              <input className="w-full bg-[#161925] border border-white/5 rounded-xl p-3 text-xs outline-none" placeholder="Email" value={footerConfig.email} onChange={(e) => setFooterConfig({...footerConfig, email: e.target.value})} />
            </div>

            <div className="p-4 bg-[#0f111a] rounded-2xl border border-white/5 space-y-3">
              <label className="text-[10px] font-black uppercase text-pink-500 tracking-[0.2em] block">Media Sosial</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-[#161925] p-2 rounded-lg border border-white/5">
                  <Instagram size={14} className="text-pink-500" />
                  <input className="bg-transparent flex-1 text-[10px] outline-none" value={footerConfig.socials.instagram} onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, instagram: e.target.value}})} />
                </div>
                <div className="flex items-center gap-2 bg-[#161925] p-2 rounded-lg border border-white/5">
                  <Facebook size={14} className="text-blue-500" />
                  <input className="bg-transparent flex-1 text-[10px] outline-none" value={footerConfig.socials.facebook} onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, facebook: e.target.value}})} />
                </div>
                <div className="flex items-center gap-2 bg-[#161925] p-2 rounded-lg border border-white/5">
                  <Twitter size={14} className="text-sky-400" />
                  <input className="bg-transparent flex-1 text-[10px] outline-none" value={footerConfig.socials.twitter} onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, twitter: e.target.value}})} />
                </div>
                <div className="flex items-center gap-2 bg-[#161925] p-2 rounded-lg border border-white/5">
                  <Youtube size={14} className="text-red-600" />
                  <input className="bg-transparent flex-1 text-[10px] outline-none" value={footerConfig.socials.youtube} onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, youtube: e.target.value}})} />
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM 3: NAVIGASI (7 MENU) */}
          <div className="p-4 bg-[#0f111a] rounded-2xl border border-white/5 space-y-3">
            <label className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] block">Menu Navigasi</label>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {footerConfig.navigation.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-[#161925] p-2 rounded-xl border border-white/5">
                  <div className="w-5 h-5 bg-blue-600/20 rounded flex items-center justify-center text-[10px] font-bold text-blue-500">{idx + 1}</div>
                  <input className="bg-transparent flex-1 text-xs outline-none" value={item.name} onChange={(e) => updateNavigation(idx, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleUpdate}
          disabled={loading}
          className="w-full mt-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 shadow-xl transition-all"
        >
          {loading ? 'MENYINKRONKAN...' : <><Save size={18} /> SINKRONISASI PERUBAHAN</>}
        </button>
      </div>

      {/* LIVE PREVIEW (Sesuai Gambar Landing Page Anda) */}
      <div className="max-w-6xl mx-auto space-y-4 pb-20">
        <h3 className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest ml-4">
          <Eye size={14} /> Live Preview (Halaman Depan)
        </h3>
        <div className="bg-[#0a0c14] rounded-[3rem] p-12 border border-white/10 opacity-90 pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg"></div>
                <span className="font-black text-xl italic tracking-tighter uppercase">Bilibili <span className="text-blue-500">162</span></span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{footerConfig.description}</p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] mb-6 text-blue-500 uppercase">Navigasi</h4>
              <ul className="text-slate-400 text-xs space-y-3">
                {footerConfig.navigation.map((nav, idx) => (
                  <li key={idx}>{nav.name}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] mb-6 text-blue-500 uppercase">Hubungi Kami</h4>
              <div className="text-slate-400 text-xs space-y-4">
                <p className="flex gap-3 items-start"><MapPin size={14} className="text-blue-500 shrink-0"/> {footerConfig.address}</p>
                <p className="flex gap-3 items-center"><Phone size={14} className="text-blue-500 shrink-0"/> {footerConfig.phone}</p>
                <p className="flex gap-3 items-center"><Mail size={14} className="text-blue-500 shrink-0"/> {footerConfig.email}</p>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] mb-6 text-blue-500 uppercase">Ikuti Kami</h4>
              <div className="flex gap-3">
                <div className="p-3 bg-white/5 rounded-full border border-white/5"><Facebook size={14}/></div>
                <div className="p-3 bg-white/5 rounded-full border border-white/5"><Instagram size={14}/></div>
                <div className="p-3 bg-white/5 rounded-full border border-white/5"><Twitter size={14}/></div>
                <div className="p-3 bg-white/5 rounded-full border border-white/5"><Youtube size={14}/></div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-[9px] text-slate-500 font-bold tracking-[0.4em]">
            {footerConfig.copyright}
          </div>
        </div>
      </div>
    </div>
  );
}
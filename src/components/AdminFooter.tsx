import React, { useState, useEffect } from 'react';
import { Save, MapPin, Phone, Mail, Instagram, Facebook, Youtube, Twitter, Eye } from 'lucide-react';
import { supabase } from '../supabase'; 

export default function AdminFooter() {
  const [loading, setLoading] = useState(false);
  const [footerConfig, setFooterConfig] = useState({
    description: '',
    address: '',
    phone: '',
    email: '',
    socials: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '' // KODE BARU: Pastikan youtube masuk dalam state awal
    }
  });

  useEffect(() => {
    async function getFooterData() {
      const { data } = await supabase.from('site_settings').select('footer_config').single();
      if (data?.footer_config) {
        // Gabungkan data dari DB dengan struktur default agar tidak error jika ada field baru
        setFooterConfig({
          ...footerConfig,
          ...data.footer_config,
          socials: {
            ...footerConfig.socials,
            ...data.footer_config.socials
          }
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

  return (
    <div className="p-6 bg-[#0f111a] min-h-screen text-white space-y-10">
      {/* FORM EDIT */}
      <div className="max-w-5xl mx-auto bg-[#161925] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
          PENGATURAN FOOTER
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-3 block">Alamat Lengkap</label>
              <input 
                className="w-full bg-[#0f111a] border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none"
                value={footerConfig.address}
                onChange={(e) => setFooterConfig({...footerConfig, address: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 block">No. WhatsApp</label>
                <input className="w-full bg-[#0f111a] border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" value={footerConfig.phone} onChange={(e) => setFooterConfig({...footerConfig, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2 block">Email Resmi</label>
                <input className="w-full bg-[#0f111a] border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" value={footerConfig.email} onChange={(e) => setFooterConfig({...footerConfig, email: e.target.value})} />
              </div>
            </div>

            <div className="p-4 bg-[#0f111a] rounded-2xl border border-white/5 space-y-4">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] block">Tautan Media Sosial</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Instagram */}
                <div className="flex items-center gap-3 bg-[#161925] p-2 rounded-xl border border-white/5">
                  <Instagram size={16} className="text-pink-500" />
                  <input className="bg-transparent flex-1 text-xs outline-none" placeholder="Instagram URL" value={footerConfig.socials.instagram} onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, instagram: e.target.value}})} />
                </div>
                
                {/* Facebook */}
                <div className="flex items-center gap-3 bg-[#161925] p-2 rounded-xl border border-white/5">
                  <Facebook size={16} className="text-blue-500" />
                  <input className="bg-transparent flex-1 text-xs outline-none" placeholder="Facebook URL" value={footerConfig.socials.facebook} onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, facebook: e.target.value}})} />
                </div>

                {/* Twitter / X (KODE BARU) */}
                <div className="flex items-center gap-3 bg-[#161925] p-2 rounded-xl border border-white/5">
                  <Twitter size={16} className="text-sky-400" />
                  <input className="bg-transparent flex-1 text-xs outline-none" placeholder="Twitter URL" value={footerConfig.socials.twitter} onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, twitter: e.target.value}})} />
                </div>

                {/* Youtube (KODE BARU) */}
                <div className="flex items-center gap-3 bg-[#161925] p-2 rounded-xl border border-white/5">
                  <Youtube size={16} className="text-red-600" />
                  <input className="bg-transparent flex-1 text-xs outline-none" placeholder="Youtube URL" value={footerConfig.socials.youtube} onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, youtube: e.target.value}})} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleUpdate}
          disabled={loading}
          className="w-full mt-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 shadow-xl transition-all"
        >
          {loading ? 'SINKRONISASI...' : <><Save size={18} /> SINKRONISASI PERUBAHAN</>}
        </button>
      </div>

      {/* LIVE PREVIEW SECTION */}
      <div className="max-w-6xl mx-auto space-y-4">
        <h3 className="flex items-center gap-2 text-slate-500 font-bold text-sm ml-4">
          <Eye size={16} /> LIVE PREVIEW (Tampilan Halaman Depan)
        </h3>
        <div className="bg-[#0a0c14] rounded-[3rem] p-12 border border-white/10 pointer-events-none opacity-80">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg"></div>
                <span className="font-black text-xl italic tracking-tighter">BILIBILI <span className="text-blue-500">162</span></span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{footerConfig.description || "Deskripsi akan muncul di sini..."}</p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] mb-6 text-white/40 uppercase">Navigasi</h4>
              <ul className="text-slate-500 text-xs space-y-3 font-bold uppercase tracking-widest">
                <li>Beranda</li>
                <li>Berita</li>
                <li>Atlet</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] mb-6 text-white/40 uppercase">Hubungi Kami</h4>
              <div className="text-slate-400 text-xs space-y-4">
                <p className="flex gap-3 items-start"><MapPin size={14} className="text-blue-500 shrink-0"/> {footerConfig.address || "Alamat belum diatur"}</p>
                <p className="flex gap-3 items-center"><Phone size={14} className="text-blue-500 shrink-0"/> {footerConfig.phone || "-"}</p>
                <p className="flex gap-3 items-center"><Mail size={14} className="text-blue-500 shrink-0"/> {footerConfig.email || "-"}</p>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] mb-6 text-white/40 uppercase">Ikuti Kami</h4>
              <div className="flex gap-3">
                <div className={`p-3 rounded-full border border-white/5 ${footerConfig.socials.facebook ? 'bg-blue-600/20' : 'bg-white/5'}`}><Facebook size={14}/></div>
                <div className={`p-3 rounded-full border border-white/5 ${footerConfig.socials.instagram ? 'bg-pink-600/20' : 'bg-white/5'}`}><Instagram size={14}/></div>
                <div className={`p-3 rounded-full border border-white/5 ${footerConfig.socials.twitter ? 'bg-sky-600/20' : 'bg-white/5'}`}><Twitter size={14}/></div>
                <div className={`p-3 rounded-full border border-white/5 ${footerConfig.socials.youtube ? 'bg-red-600/20' : 'bg-white/5'}`}><Youtube size={14}/></div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-[9px] text-slate-600 font-bold tracking-[0.4em]">
            © 2026 PB US 162 BILIBILI. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </div>
  );
}
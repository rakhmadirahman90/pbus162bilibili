import React, { useState, useEffect } from 'react';
import { Save, MapPin, Phone, Mail, Instagram, Facebook, Youtube, Twitter, Eye, Link, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../supabase'; 

export default function AdminFooter() {
  const [loading, setLoading] = useState(false);
  const [footerConfig, setFooterConfig] = useState({
    description: '',
    address: '',
    phone: '',
    email: '',
    copyright: '© 2026 PB US 162 BILIBILI. ALL RIGHTS RESERVED.',
    // Inisialisasi dengan 7 menu lengkap sesuai landing page Anda
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
        // Melakukan merge data untuk memastikan navigasi dari database yang diambil
        setFooterConfig({
          ...footerConfig,
          ...data.footer_config,
          socials: { ...footerConfig.socials, ...data.footer_config.socials },
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

    if (!error) alert("Perubahan Berhasil Disimpan & Disinkronkan ke Landing Page!");
    setLoading(false);
  };

  // --- LOGIKA MANAJEMEN NAVIGASI (TAMBAH, EDIT, HAPUS) ---
  const updateNavigation = (index: number, newName: string) => {
    const newNav = [...footerConfig.navigation];
    newNav[index].name = newName;
    newNav[index].id = newName.toLowerCase().replace(/\s+/g, '-');
    setFooterConfig({ ...footerConfig, navigation: newNav });
  };

  const addNavigation = () => {
    const newMenuName = "Menu Baru";
    setFooterConfig({
      ...footerConfig,
      navigation: [
        ...footerConfig.navigation, 
        { name: newMenuName, id: newMenuName.toLowerCase().replace(/\s+/g, '-') }
      ]
    });
  };

  const removeNavigation = (index: number) => {
    const newNav = footerConfig.navigation.filter((_, i) => i !== index);
    setFooterConfig({ ...footerConfig, navigation: newNav });
  };

  return (
    <div className="p-6 bg-[#0f111a] min-h-screen text-white space-y-10 font-sans">
      <div className="max-w-5xl mx-auto bg-[#161925] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
            PENGATURAN FOOTER DINAMIS
          </h2>
          <div className="px-4 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded-full text-[10px] text-blue-500 font-black tracking-widest uppercase">
            {footerConfig.navigation.length} Menu Aktif
          </div>
        </div>

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
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-3 block">Teks Hak Cipta</label>
              <input 
                className="w-full bg-[#0f111a] border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none font-mono text-[11px]"
                value={footerConfig.copyright}
                onChange={(e) => setFooterConfig({...footerConfig, copyright: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* AREA MANAJEMEN 7+ NAVIGASI */}
            <div className="p-5 bg-[#0f111a] rounded-3xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <label className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">List Menu Navigasi</label>
                <button 
                  onClick={addNavigation}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all"
                >
                  <Plus size={12} /> TAMBAH MENU
                </button>
              </div>
              
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                {footerConfig.navigation.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 group animate-in fade-in slide-in-from-right-1">
                    <div className="flex items-center gap-3 bg-[#161925] flex-1 p-2 rounded-xl border border-white/5 group-hover:border-blue-500/40 transition-all">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {idx + 1}
                      </div>
                      <input 
                        className="bg-transparent flex-1 text-xs outline-none text-slate-200 focus:text-white" 
                        value={item.name} 
                        onChange={(e) => updateNavigation(idx, e.target.value)} 
                        placeholder="Nama Menu..."
                      />
                    </div>
                    <button 
                      onClick={() => removeNavigation(idx)} 
                      className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Hapus Menu"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <input placeholder="WhatsApp (62...)" className="w-full bg-[#0f111a] border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-blue-500" value={footerConfig.phone} onChange={(e) => setFooterConfig({...footerConfig, phone: e.target.value})} />
               <input placeholder="Email Resmi" className="w-full bg-[#0f111a] border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-blue-500" value={footerConfig.email} onChange={(e) => setFooterConfig({...footerConfig, email: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-[#0f111a] p-2 rounded-xl border border-white/5">
                  <Instagram size={14} className="text-pink-500" />
                  <input className="bg-transparent flex-1 text-[10px] outline-none" placeholder="Link Instagram" value={footerConfig.socials.instagram} onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, instagram: e.target.value}})} />
                </div>
                <div className="flex items-center gap-3 bg-[#0f111a] p-2 rounded-xl border border-white/5">
                  <Facebook size={14} className="text-blue-500" />
                  <input className="bg-transparent flex-1 text-[10px] outline-none" placeholder="Link Facebook" value={footerConfig.socials.facebook} onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, facebook: e.target.value}})} />
                </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleUpdate}
          disabled={loading}
          className="w-full mt-8 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all"
        >
          {loading ? 'PROSES SINKRONISASI...' : <><Save size={18} /> SIMPAN PERUBAHAN FOOTER</>}
        </button>
      </div>

      {/* LIVE PREVIEW - MENAMPILKAN HASIL REAL-TIME */}
      <div className="max-w-6xl mx-auto space-y-4 pb-20">
        <h3 className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] ml-4">
          <Eye size={14} /> Tampilan Halaman Depan (Preview)
        </h3>
        <div className="bg-[#0a0c14] rounded-[3rem] p-12 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)]"></div>
                <span className="font-black text-lg italic tracking-tighter uppercase">PB US 162 <span className="text-blue-500">Bilibili</span></span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">{footerConfig.description || 'Deskripsi belum diisi...'}</p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] mb-6 text-blue-500 uppercase">Navigasi</h4>
              <ul className="text-slate-400 text-[11px] space-y-3 font-medium">
                {footerConfig.navigation.map((nav, idx) => (
                  <li key={idx} className="hover:text-blue-500 transition-colors cursor-default">• {nav.name}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] mb-6 text-blue-500 uppercase">Hubungi Kami</h4>
              <div className="text-slate-400 text-[11px] space-y-4">
                <p className="flex gap-3 items-start"><MapPin size={14} className="text-blue-600 shrink-0"/> {footerConfig.address || 'Alamat...'}</p>
                <p className="flex gap-3 items-center"><Phone size={14} className="text-blue-600 shrink-0"/> {footerConfig.phone || 'Nomor HP...'}</p>
                <p className="flex gap-3 items-center"><Mail size={14} className="text-blue-600 shrink-0"/> {footerConfig.email || 'Email...'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] mb-6 text-blue-500 uppercase">Ikuti Kami</h4>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/5"><Facebook size={12}/></div>
                <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/5"><Instagram size={12}/></div>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/5 text-center text-[9px] text-slate-600 font-bold tracking-[0.3em] uppercase">
            {footerConfig.copyright}
          </div>
        </div>
      </div>
    </div>
  );
}
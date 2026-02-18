import React, { useState, useEffect } from 'react';
import { Save, MapPin, Phone, Mail, Instagram, Facebook, Youtube, Twitter, Eye, Plus, Trash2, ArrowUp, ArrowDown, MessageCircle } from 'lucide-react';
import { supabase } from '../supabase'; 

// PERBAIKAN: Gunakan Fixed UUID untuk menghindari error "invalid input syntax for type uuid"
const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export default function AdminFooter() {
  const [loading, setLoading] = useState(false);
  const [footerConfig, setFooterConfig] = useState({
    description: 'Membina legenda masa depan dengan fasilitas standar nasional dan sport-science.',
    address: 'Jl. Andi Makkasau No. 171, Parepare, Indonesia',
    phone: '+62 812 1902 7234',
    email: 'info@pbus162bilibili.id',
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

  // Ambil data saat komponen dimuat
  useEffect(() => {
    async function getFooterData() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('footer_config')
          .eq('id', SETTINGS_ID) // Menggunakan SETTINGS_ID (UUID)
          .maybeSingle();
          
        if (data?.footer_config) {
          const config = data.footer_config;
          setFooterConfig(prev => ({
            ...prev,
            ...config,
            socials: { ...prev.socials, ...(config.socials || {}) },
            navigation: config.navigation || prev.navigation
          }));
        }
      } catch (err) {
        console.log("Memulai dengan data default...");
      }
    }
    getFooterData();
  }, []);

  // Fungsi Simpan dengan Logika UPSERT (Update or Insert)
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          id: SETTINGS_ID, // MENGGUNAKAN UUID, BUKAN ANGKA 1
          footer_config: footerConfig,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
      alert("🚀 Perubahan Berhasil Disimpan & Disinkronkan ke Landing Page!");
    } catch (error: any) {
      console.error("Error update footer:", error);
      // Memberikan pesan edukatif jika kolom belum di-refresh di schema cache
      if (error.message?.includes('footer_config')) {
        alert("Gagal: Kolom 'footer_config' belum dikenali. Jalankan 'NOTIFY pgrst, reload schema;' di SQL Editor Supabase.");
      } else {
        alert("Gagal menyimpan: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

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

  const moveNavigation = (index: number, direction: 'up' | 'down') => {
    const newNav = [...footerConfig.navigation];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newNav.length) return;
    [newNav[index], newNav[targetIndex]] = [newNav[targetIndex], newNav[index]];
    setFooterConfig({ ...footerConfig, navigation: newNav });
  };

  return (
    <div className="p-6 bg-[#0f111a] min-h-screen text-white space-y-10 font-sans">
      <div className="max-w-5xl mx-auto bg-[#161925] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3 italic">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
            PENGATURAN FOOTER DINAMIS
          </h2>
          <div className="px-4 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded-full text-[10px] text-blue-500 font-black tracking-widest uppercase">
            {footerConfig.navigation.length} Menu Aktif
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SISI KIRI: INFORMASI UTAMA */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-3 block">Deskripsi Klub</label>
              <textarea 
                className="w-full bg-[#0f111a] border border-white/10 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none h-32 transition-all focus:ring-2 focus:ring-blue-500/20"
                value={footerConfig.description}
                onChange={(e) => setFooterConfig({...footerConfig, description: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-3 block">Alamat Kantor Pusat</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-blue-500" size={18} />
                <input 
                  className="w-full bg-[#0f111a] border border-white/10 rounded-xl p-4 pl-12 text-sm focus:border-blue-500 outline-none"
                  value={footerConfig.address}
                  onChange={(e) => setFooterConfig({...footerConfig, address: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-3 block">Teks Hak Cipta (Copyright)</label>
              <input 
                className="w-full bg-[#0f111a] border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500 outline-none font-mono text-[11px]"
                value={footerConfig.copyright}
                onChange={(e) => setFooterConfig({...footerConfig, copyright: e.target.value})}
              />
            </div>
          </div>

          {/* SISI KANAN: NAVIGASI & KONTAK */}
          <div className="space-y-6">
            <div className="p-5 bg-[#0f111a] rounded-3xl border border-white/5 space-y-4 shadow-inner">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <label className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">Susunan Menu</label>
                <button onClick={addNavigation} className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all">
                  <Plus size={12} /> TAMBAH
                </button>
              </div>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {footerConfig.navigation.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveNavigation(idx, 'up')} disabled={idx === 0} className="text-slate-600 hover:text-blue-500 disabled:opacity-10"><ArrowUp size={12} /></button>
                      <button onClick={() => moveNavigation(idx, 'down')} disabled={idx === footerConfig.navigation.length - 1} className="text-slate-600 hover:text-blue-500 disabled:opacity-10"><ArrowDown size={12} /></button>
                    </div>
                    <div className="flex items-center gap-3 bg-[#161925] flex-1 p-2 rounded-xl border border-white/5 group-hover:border-blue-500/40 transition-all">
                      <input 
                        className="bg-transparent flex-1 text-xs outline-none text-slate-200 focus:text-white" 
                        value={item.name} 
                        onChange={(e) => updateNavigation(idx, e.target.value)} 
                      />
                    </div>
                    <button onClick={() => removeNavigation(idx)} className="p-2 text-slate-600 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* KONTAK & SOSMED */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-[9px] font-black uppercase text-slate-500 mb-2 block">WhatsApp (Admin)</label>
                 <div className="flex items-center gap-2 bg-[#0f111a] border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500 transition-all">
                    <MessageCircle size={14} className="text-green-500" />
                    <input className="bg-transparent flex-1 text-xs outline-none" value={footerConfig.phone} onChange={(e) => setFooterConfig({...footerConfig, phone: e.target.value})} />
                 </div>
               </div>
               <div>
                 <label className="text-[9px] font-black uppercase text-slate-500 mb-2 block">Email Support</label>
                 <div className="flex items-center gap-2 bg-[#0f111a] border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500 transition-all">
                    <Mail size={14} className="text-blue-400" />
                    <input className="bg-transparent flex-1 text-xs outline-none" value={footerConfig.email} onChange={(e) => setFooterConfig({...footerConfig, email: e.target.value})} />
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               {[
                 { key: 'instagram', icon: Instagram, color: 'text-pink-500', label: 'Instagram' },
                 { key: 'facebook', icon: Facebook, color: 'text-blue-500', label: 'Facebook' },
                 { key: 'twitter', icon: Twitter, color: 'text-sky-400', label: 'Twitter/X' },
                 { key: 'youtube', icon: Youtube, color: 'text-red-600', label: 'YouTube' }
               ].map((soc) => (
                <div key={soc.key} className="flex items-center gap-3 bg-[#0f111a] p-2 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <soc.icon size={14} className={soc.color} />
                  <input 
                    className="bg-transparent flex-1 text-[10px] outline-none placeholder:text-slate-700" 
                    placeholder={`Link ${soc.label}`} 
                    value={(footerConfig.socials as any)[soc.key]} 
                    onChange={(e) => setFooterConfig({...footerConfig, socials: {...footerConfig.socials, [soc.key]: e.target.value}})} 
                  />
                </div>
               ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleUpdate}
          disabled={loading}
          className="w-full mt-8 py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all"
        >
          {loading ? 'MENYINKRONKAN DATA...' : <><Save size={18} /> SIMPAN SEMUA PERUBAHAN</>}
        </button>
      </div>

      {/* PREVIEW SECTION */}
      <div className="max-w-6xl mx-auto space-y-4 pb-20">
        <h3 className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] ml-4">
          <Eye size={14} /> LIVE PREVIEW (Tampilan Akhir)
        </h3>
        <div className="bg-[#0a0c14] rounded-[3rem] p-12 border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left relative z-10">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)]"></div>
                <span className="font-black text-lg italic tracking-tighter uppercase">PB US 162 <span className="text-blue-500">Bilibili</span></span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed italic">"{footerConfig.description}"</p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] mb-6 text-blue-500 uppercase">Navigasi Utama</h4>
              <ul className="text-slate-400 text-[11px] space-y-3 font-medium">
                {footerConfig.navigation.map((nav, idx) => (
                  <li key={idx} className="hover:text-blue-500 transition-colors cursor-pointer flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div> {nav.name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] mb-6 text-blue-500 uppercase">Hubungi Kami</h4>
              <div className="text-slate-400 text-[11px] space-y-4">
                <div className="flex gap-3 items-start"><MapPin size={14} className="text-blue-600 shrink-0"/> {footerConfig.address}</div>
                <div className="flex gap-3 items-center"><Phone size={14} className="text-blue-600 shrink-0"/> {footerConfig.phone}</div>
                <div className="flex gap-3 items-center"><Mail size={14} className="text-blue-600 shrink-0"/> {footerConfig.email}</div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] mb-6 text-blue-500 uppercase">Ikuti Kami</h4>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(footerConfig.socials).map(([key, val]) => (
                  val && (
                    <div key={key} className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all cursor-pointer">
                      {key === 'instagram' && <Instagram size={14}/>}
                      {key === 'facebook' && <Facebook size={14}/>}
                      {key === 'twitter' && <Twitter size={14}/>}
                      {key === 'youtube' && <Youtube size={14}/>}
                    </div>
                  )
                ))}
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
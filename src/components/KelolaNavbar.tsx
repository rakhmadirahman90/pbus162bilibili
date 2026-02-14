import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "../supabase";
import { 
  Menu, Plus, Trash2, MoveUp, MoveDown, 
  Link as LinkIcon, Layers, RefreshCcw, CheckCircle2,
  ChevronRight, CornerDownRight, GripVertical, Settings, Globe, Image as ImageIcon,
  Upload, X, AlertCircle
} from 'lucide-react';

const KelolaNavbar: React.FC = () => {
  const [navItems, setNavItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // --- STATE UNTUK BRANDING & BAHASA ---
  const [brandSettings, setBrandSettings] = useState({
    logo_url: '',
    brand_name_main: 'US 162',
    brand_name_accent: 'BILIBILI',
    sub_text: 'Professional Badminton',
    default_lang: 'ID'
  });
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE UNTUK DRAG & DROP ---
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // State Form Lengkap
  const [label, setLabel] = useState('');
  const [path, setPath] = useState('');
  const [type, setType] = useState('link');
  const [parentId, setParentId] = useState<string>('none');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchNavbar();
    fetchBrandSettings();
  }, []);

  const fetchNavbar = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('navbar_settings')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (!error && data) setNavItems(data);
    setIsLoading(false);
  };

  // --- PERBAIKAN FETCH: Menangani tipe data String/Object dari JSONB ---
  const fetchBrandSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'navbar_branding')
      .maybeSingle();
    
    if (!error && data && data.value) {
      try {
        const parsedValue = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setBrandSettings(parsedValue);
      } catch (e) {
        console.error("Gagal parse data branding:", e);
      }
    }
  };

  // --- PERBAIKAN UPLOAD: Memastikan URL Publik didapatkan dengan benar ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets') 
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
      
      if (data?.publicUrl) {
        const newSettings = { ...brandSettings, logo_url: data.publicUrl };
        setBrandSettings(newSettings);
        // Langsung simpan ke state_settings agar sinkron
        await supabase.from('site_settings').upsert({ 
          key: 'navbar_branding', 
          value: newSettings,
          label: 'Pengaturan Header & Branding'
        });
        triggerSuccess();
      }
    } catch (err: any) {
      alert("Gagal upload: " + err.message + ". Pastikan bucket 'assets' sudah dibuat dan diatur ke PUBLIC.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBrand = async () => {
    setIsSavingBrand(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ 
        key: 'navbar_branding', 
        value: brandSettings,
        label: 'Pengaturan Header & Branding'
      }, { onConflict: 'key' });

    if (!error) {
      triggerSuccess();
    } else {
      alert("Error simpan branding: " + error.message);
    }
    setIsSavingBrand(false);
  };

  // --- LOGIC DRAG AND DROP ---
  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) return;

    const mainMenusTemp = [...navItems.filter(item => !item.parent_id)];
    const draggedItem = mainMenusTemp[draggedItemIndex];
    
    mainMenusTemp.splice(draggedItemIndex, 1);
    mainMenusTemp.splice(dropIndex, 0, draggedItem);

    const finalUpdates = mainMenusTemp.map((item, idx) => ({
      ...item,
      order_index: idx
    }));

    const { error } = await supabase
      .from('navbar_settings')
      .upsert(finalUpdates);

    if (!error) {
      triggerSuccess();
      fetchNavbar();
    }
    setDraggedItemIndex(null);
  };

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!label || !path) {
      setFormError("Label dan Path wajib diisi");
      return;
    }

    const payload = {
      label,
      path: path.startsWith('/') ? path : `/${path}`,
      type,
      parent_id: parentId === 'none' ? null : parentId,
      order_index: navItems.length
    };

    const { error } = await supabase
      .from('navbar_settings')
      .insert([payload]);

    if (!error) {
      setLabel(''); 
      setPath('');
      setParentId('none');
      fetchNavbar();
      triggerSuccess();
    } else {
      setFormError(error.message);
    }
  };

  const updateOrder = async (id: string, currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentMainMenus = navItems.filter(item => !item.parent_id);
    
    if (targetIndex < 0 || targetIndex >= currentMainMenus.length) return;

    const targetItem = currentMainMenus[targetIndex];
    const currentItem = currentMainMenus[currentIndex];

    await supabase.from('navbar_settings').update({ order_index: targetIndex }).eq('id', currentItem.id);
    await supabase.from('navbar_settings').update({ order_index: currentIndex }).eq('id', targetItem.id);
    
    fetchNavbar();
  };

  const deleteMenu = async (id: string) => {
    if (!window.confirm("Hapus menu ini? Jika ini adalah parent, semua sub-menu juga akan terhapus.")) return;
    await supabase.from('navbar_settings').delete().eq('id', id);
    fetchNavbar();
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const mainMenus = navItems.filter(item => !item.parent_id);
  const getSubMenus = (id: string) => navItems.filter(item => item.parent_id === id);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
              KELOLA <span className="text-blue-600">NAVBAR & BRAND</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
              Identitas Visual & Sistem Navigasi Terpadu
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchNavbar} 
              className="group flex items-center gap-2 px-6 py-3 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-all border border-white/5 active:scale-95"
            >
              <RefreshCcw size={16} className={`${isLoading ? 'animate-spin text-blue-500' : 'text-zinc-400 group-hover:text-white'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">Refresh Data</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          
          <div className="md:col-span-4 space-y-6">
            
            {/* --- SECTION PENGATURAN BRAND --- */}
            <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Settings size={64} />
              </div>
              
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-blue-500">
                <Layers size={16} /> Identitas & Logo
              </h3>
              
              <div className="space-y-4">
                <div className="relative group/logo">
                  <label className="text-[9px] font-black uppercase text-zinc-500 block mb-1.5 ml-1">Official Logo</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500/50 transition-all overflow-hidden relative"
                  >
                    {brandSettings.logo_url ? (
                      <>
                        <img 
                          key={brandSettings.logo_url} // Force re-render saat URL berubah
                          src={brandSettings.logo_url} 
                          alt="Logo Preview" 
                          className="h-20 w-auto object-contain z-10" 
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity z-20">
                          <Upload size={20} />
                        </div>
                      </>
                    ) : (
                      <div className="text-zinc-600 flex flex-col items-center gap-1 text-center px-4">
                        <ImageIcon size={24} />
                        <span className="text-[8px] font-bold uppercase">Klik untuk Upload Logo</span>
                      </div>
                    )}
                    {isUploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30"><RefreshCcw className="animate-spin text-blue-500" /></div>}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-black uppercase text-zinc-500 block mb-1.5 ml-1">Nama Utama</label>
                    <input 
                      type="text" value={brandSettings.brand_name_main}
                      onChange={(e) => setBrandSettings({...brandSettings, brand_name_main: e.target.value})}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-zinc-500 block mb-1.5 ml-1">Aksen (Warna)</label>
                    <input 
                      type="text" value={brandSettings.brand_name_accent}
                      onChange={(e) => setBrandSettings({...brandSettings, brand_name_accent: e.target.value})}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-blue-500 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-zinc-500 block mb-1.5 ml-1">Pilihan Bahasa Default</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-4 top-3.5 text-zinc-500" />
                    <select 
                      value={brandSettings.default_lang}
                      onChange={(e) => setBrandSettings({...brandSettings, default_lang: e.target.value})}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-10 py-3 text-xs font-bold outline-none cursor-pointer appearance-none focus:border-blue-600 transition-all"
                    >
                      <option value="ID">Bahasa Indonesia (ID)</option>
                      <option value="EN">English (EN)</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleSaveBrand}
                  disabled={isSavingBrand}
                  className="w-full bg-white text-black hover:bg-zinc-200 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all disabled:opacity-50"
                >
                  {isSavingBrand ? 'Menyimpan...' : 'Update Konfigurasi'}
                </button>
              </div>
            </div>

            {/* Form Tambah Menu */}
            <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-blue-500">
                <Plus size={16} /> Item Navigasi Baru
              </h3>
              <form onSubmit={handleAddMenu} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-[9px] font-bold uppercase tracking-wider">
                    <AlertCircle size={14} /> {formError}
                  </div>
                )}
                <input 
                  type="text" value={label} onChange={(e) => setLabel(e.target.value)}
                  placeholder="Nama Menu"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold focus:border-blue-600 outline-none"
                />
                <input 
                  type="text" value={path} onChange={(e) => setPath(e.target.value)}
                  placeholder="Path (contoh: /news)"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold focus:border-blue-600 outline-none font-mono"
                />
                <select 
                  value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="link">Single Link</option>
                  <option value="dropdown">Dropdown Group</option>
                </select>
                <select 
                  value={parentId} onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-blue-400 cursor-pointer"
                >
                  <option value="none">Set Sebagai Menu Utama</option>
                  {mainMenus.filter(m => m.type === 'dropdown').map(parent => (
                    <option key={parent.id} value={parent.id}>Sub dari: {parent.label}</option>
                  ))}
                </select>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                  Tambahkan ke Navbar
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-8 space-y-6">
            {mainMenus.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-[3rem] bg-zinc-900/10">
                <Menu size={48} className="mx-auto text-zinc-800 mb-4" />
                <p className="text-zinc-600 font-bold uppercase text-xs tracking-tighter">Navigasi Belum Diatur.</p>
              </div>
            ) : (
              mainMenus.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`space-y-3 transition-all duration-300 ${draggedItemIndex === index ? 'opacity-20 scale-95' : 'opacity-100'}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                >
                  <div className="group flex items-center justify-between bg-zinc-900 border border-white/5 p-5 rounded-[1.5rem] hover:border-blue-600/50 transition-all shadow-xl cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-4">
                      <GripVertical size={20} className="text-zinc-700 group-hover:text-blue-500 transition-colors" />
                      <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-blue-500 font-black text-xs border border-white/5">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black uppercase italic text-sm tracking-tight">{item.label}</h4>
                          {item.type === 'dropdown' && <span className="px-2 py-0.5 bg-blue-600/10 text-blue-500 text-[8px] font-black rounded-full uppercase">Group</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase flex items-center gap-1">
                            <LinkIcon size={10} /> {item.path}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateOrder(item.id, index, 'up')} className="p-2 text-zinc-600 hover:text-white transition-all"><MoveUp size={16}/></button>
                      <button onClick={() => updateOrder(item.id, index, 'down')} className="p-2 text-zinc-600 hover:text-white transition-all"><MoveDown size={16}/></button>
                      <button onClick={() => deleteMenu(item.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="ml-12 space-y-2 border-l-2 border-zinc-800 pl-6">
                    {getSubMenus(item.id).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between bg-zinc-900/40 border border-white/5 p-3 rounded-2xl hover:bg-zinc-800 transition-all">
                        <div className="flex items-center gap-3">
                          <CornerDownRight size={14} className="text-zinc-600" />
                          <div>
                            <p className="text-[11px] font-black uppercase text-zinc-300 tracking-tight">{sub.label}</p>
                            <p className="text-[8px] text-zinc-600 font-mono">path: {sub.path}</p>
                          </div>
                        </div>
                        <button onClick={() => deleteMenu(sub.id)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pop-up Success Toast */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${showSuccess ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-50 pointer-events-none'}`}>
        <div className="bg-blue-600 px-8 py-4 rounded-[2rem] flex items-center gap-4 shadow-[0_20px_50px_rgba(37,99,235,0.3)] border border-white/20">
          <div className="bg-white/20 p-1.5 rounded-full text-white">
            <CheckCircle2 size={20} />
          </div>
          <span className="font-black uppercase text-[11px] tracking-[0.2em]">Data Berhasil Disinkronkan</span>
        </div>
      </div>
    </div>
  );
};

export default KelolaNavbar;
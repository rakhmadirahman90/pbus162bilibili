import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Trash2, Save, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';

interface HeroSlide {
  id: number | string;
  title: string;
  subtitle: string;
  image: string;
}

export default function HeroAdmin() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // State untuk form tambah baru
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Ambil data saat komponen dimuat
  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_config')
        .single();

      if (data && data.value) {
        setSlides(data.value.slides || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadHero = async () => {
    if (!selectedFile || !newTitle) return alert("Pilih gambar dan isi judul!");
    
    setUploading(true);
    try {
      // 1. Upload Gambar
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(`hero/${fileName}`, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(`hero/${fileName}`);

      // 2. Update Array local dan DB
      const newSlide: HeroSlide = {
        id: Date.now(),
        title: newTitle,
        subtitle: newSubtitle,
        image: publicUrl
      };

      const updatedSlides = [...slides, newSlide];
      await saveToDatabase(updatedSlides);
      
      // Reset Form
      setNewTitle('');
      setNewSubtitle('');
      setSelectedFile(null);
      alert("Slide berhasil ditambahkan!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSlideText = async (id: number | string, title: string, subtitle: string) => {
    const updatedSlides = slides.map(s => s.id === id ? { ...s, title, subtitle } : s);
    await saveToDatabase(updatedSlides);
    alert("Perubahan teks disimpan!");
  };

  const handleDeleteSlide = async (id: number | string) => {
    if (!confirm("Hapus slide ini secara permanen?")) return;
    const updatedSlides = slides.filter(s => s.id !== id);
    await saveToDatabase(updatedSlides);
  };

  const saveToDatabase = async (updatedSlides: HeroSlide[]) => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'hero_config',
        value: { settings: { duration: 7 }, slides: updatedSlides },
        updated_at: new Date()
      });

    if (error) throw error;
    setSlides(updatedSlides);
  };

  if (loading) return <div className="p-10 text-white flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-black text-white min-h-screen">
      <header className="mb-10 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Manajemen Hero Slider</h1>
        <p className="text-zinc-500 text-sm">Kelola konten visual dan teks utama landing page Anda.</p>
      </header>

      {/* FORM TAMBAH SLIDE BARU */}
      <section className="mb-12 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Plus size={20} className="text-blue-500" /> Tambah Slide Baru
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Judul Slide</label>
              <input 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                placeholder="Contoh: Juara Masa Depan"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Sub-judul</label>
              <textarea 
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none h-24"
                placeholder="Deskripsi singkat..."
              />
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-500/50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <ImageIcon className="text-zinc-600 mb-2" size={32} />
              <p className="text-sm text-zinc-400">{selectedFile ? selectedFile.name : "Klik untuk pilih gambar latar"}</p>
            </div>
            <button 
              onClick={handleUploadHero}
              disabled={uploading}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all flex justify-center items-center gap-2"
            >
              {uploading ? <Loader2 className="animate-spin" size={16} /> : "Simpan Slide Baru"}
            </button>
          </div>
        </div>
      </section>

      {/* LIST SLIDE YANG ADA */}
      <section>
        <h2 className="text-lg font-bold mb-6">Slide Aktif ({slides.length})</h2>
        <div className="space-y-4">
          {slides.map((slide) => (
            <div key={slide.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col md:flex-row gap-6 p-4">
              <div className="w-full md:w-48 h-32 flex-shrink-0">
                <img src={slide.image} className="w-full h-full object-cover rounded-lg" alt="Preview" />
              </div>
              <div className="flex-grow space-y-4">
                <input 
                  defaultValue={slide.title}
                  onBlur={(e) => (slide.title = e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none font-bold"
                />
                <textarea 
                  defaultValue={slide.subtitle}
                  onBlur={(e) => (slide.subtitle = e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:border-blue-500 outline-none h-16 text-zinc-400"
                />
              </div>
              <div className="flex md:flex-col gap-2 justify-end">
                <button 
                  onClick={() => handleUpdateSlideText(slide.id, slide.title, slide.subtitle)}
                  className="p-3 bg-zinc-800 hover:bg-green-600 rounded-xl transition-colors text-white"
                  title="Simpan Perubahan Teks"
                >
                  <Save size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteSlide(slide.id)}
                  className="p-3 bg-zinc-800 hover:bg-red-600 rounded-xl transition-colors text-white"
                  title="Hapus Slide"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {slides.length === 0 && <p className="text-center text-zinc-600 py-10">Belum ada slide. Tambahkan satu di atas.</p>}
        </div>
      </section>
    </div>
  );
}
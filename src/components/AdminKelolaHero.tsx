import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Trash2, Save, Plus, Image as ImageIcon, Loader2, X, Check, ZoomIn, ZoomOut } from 'lucide-react';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';

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

  // State Form
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  
  // State Cropping
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropper, setShowCropper] = useState(false);

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
        .maybeSingle();

      if (data && data.value) {
        setSlides(data.value.slides || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- PERBAIKAN 1: Logika Pemilihan File yang Diisolasi ---
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Mohon pilih file gambar (JPG/PNG)");
      return;
    }

    // Validasi input teks SEBELUM crop muncul
    if (!newTitle.trim()) {
      alert("Mohon isi Judul Slide terlebih dahulu sebelum memilih gambar.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropper(true); // Memaksa modal muncul
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
    
    // Reset input agar bisa pilih file yang sama jika batal
    e.target.value = "";
  };

  const onCropComplete = useCallback((_: any, clippedPixels: any) => {
    setCroppedAreaPixels(clippedPixels);
  }, []);

  // --- PERBAIKAN 2: Pemisahan Fungsi Upload (Hanya dipanggil dari Modal) ---
  const processAndUpload = async (e: React.MouseEvent) => {
    // Mencegah trigger aksi apapun di luar modal
    e.preventDefault();
    e.stopPropagation();

    if (!imageSrc || !croppedAreaPixels) return;

    setUploading(true);
    try {
      const image = new Image();
      image.src = imageSrc;
      await new Promise((res) => (image.onload = res));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Gunakan dimensi dari hasil crop
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx?.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9));
      
      const compressedFile = await imageCompression(new File([blob], "hero_slide.jpg"), {
        maxSizeMB: 0.7,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const fileName = `hero-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(`hero/${fileName}`, compressedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(`hero/${fileName}`);

      const newSlide: HeroSlide = {
        id: Date.now(),
        title: newTitle,
        subtitle: newSubtitle,
        image: publicUrl
      };

      const updatedSlides = [...slides, newSlide];
      await saveToDatabase(updatedSlides);

      // RESET SEMUA STATE SETELAH BERHASIL
      setShowCropper(false);
      setImageSrc(null);
      setNewTitle('');
      setNewSubtitle('');
      alert("Slide Berhasil Ditambahkan!");

    } catch (err: any) {
      alert("Gagal memproses gambar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSlideText = async (id: number | string, title: string, subtitle: string) => {
    const updatedSlides = slides.map(s => s.id === id ? { ...s, title, subtitle } : s);
    await saveToDatabase(updatedSlides);
    alert("Data slide diperbarui!");
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
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) throw error;
    setSlides(updatedSlides);
  };

  if (loading) return <div className="p-10 text-white flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="relative max-w-6xl mx-auto p-6 bg-black text-white min-h-screen">
      
      {/* --- PERBAIKAN: MODAL CROP DENGAN TINGGI EKSPLISIT --- */}
      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-[999999] flex flex-col bg-black">
          {/* Header Modal */}
          <div className="flex justify-between items-center p-4 bg-zinc-900 border-b border-zinc-800 z-50">
            <h3 className="font-bold flex items-center gap-2 text-blue-400 uppercase italic">
              <ImageIcon size={20} /> Potong Gambar (16:9)
            </h3>
            <button 
              type="button"
              onClick={() => { setShowCropper(false); setImageSrc(null); }} 
              className="p-2 hover:bg-red-600 rounded-full transition-colors"
            >
              <X size={32} />
            </button>
          </div>
          
          {/* Area Kerja Cropper (Diberi W&H 100% agar muncul) */}
          <div className="relative flex-grow bg-zinc-950 overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { width: '100%', height: '100%', position: 'absolute' },
                cropAreaStyle: { border: '2px solid #3b82f6' }
              }}
            />
          </div>

          {/* Kontrol Zoom & Simpan */}
          <div className="p-8 bg-zinc-900 border-t border-zinc-800 flex flex-col items-center gap-6 z-50">
            <div className="flex items-center gap-6 w-full max-w-lg">
              <ZoomOut size={24} className="text-zinc-500" />
              <input
                type="range"
                min={1} max={3} step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 accent-blue-600 cursor-pointer appearance-none bg-zinc-700 rounded-lg"
              />
              <ZoomIn size={24} className="text-zinc-500" />
            </div>
            
            <div className="flex gap-4 w-full max-w-lg">
              <button
                type="button"
                onClick={() => { setShowCropper(false); setImageSrc(null); }}
                className="flex-1 bg-zinc-800 py-4 rounded-2xl font-bold border border-zinc-700 hover:bg-zinc-700 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={processAndUpload}
                disabled={uploading}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-xl shadow-blue-900/20 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <><Loader2 className="animate-spin" /> Memproses...</>
                ) : (
                  <><Check size={22} /> Simpan & Upload</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD UI */}
      <header className="mb-10 border-b border-zinc-800 pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Hero Admin Pro</h1>
        <p className="text-zinc-500 text-sm mt-1">Sistem manajemen slider beranda dengan editor gambar.</p>
      </header>

      {/* FORM INPUT */}
      <section className="mb-12 bg-zinc-900/40 p-8 rounded-3xl border border-white/5 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <div>
              <label className="text-[11px] text-zinc-500 uppercase tracking-widest block mb-2 font-bold">Judul Slide</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all"
                placeholder="Contoh: Promo Spesial Ramadhan"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-500 uppercase tracking-widest block mb-2 font-bold">Deskripsi</label>
              <textarea
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 outline-none h-28 resize-none focus:border-blue-500 transition-all"
                placeholder="Tulis deskripsi singkat di sini..."
              />
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <label className="text-[11px] text-zinc-500 uppercase tracking-widest block mb-2 font-bold">Pilih Gambar</label>
            <div 
              onClick={() => {
                if(!newTitle.trim()) alert("Mohon isi judul terlebih dahulu!");
                else document.getElementById('file-input')?.click();
              }}
              className="group border-2 border-dashed border-zinc-800 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-600/5 transition-all h-full"
            >
              <input 
                id="file-input"
                type="file" 
                accept="image/*" 
                onChange={onFileChange} 
                className="hidden" 
              />
              <div className="bg-zinc-800 p-5 rounded-full group-hover:bg-blue-600 transition-all mb-4">
                <ImageIcon className="text-zinc-400 group-hover:text-white" size={36} />
              </div>
              <p className="text-base font-semibold text-zinc-400 group-hover:text-zinc-200 uppercase">Klik untuk Pilih & Potong</p>
            </div>
          </div>
        </div>
      </section>

      {/* LIST SLIDES */}
      <h2 className="text-xl font-bold italic uppercase mb-8 flex items-center gap-2">
        Slide Aktif <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">{slides.length}</span>
      </h2>

      <div className="grid grid-cols-1 gap-5">
        {slides.map((slide) => (
          <div key={slide.id} className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 flex flex-col md:flex-row gap-8 hover:border-zinc-600 transition-all group overflow-hidden">
            <div className="w-full md:w-64 h-36 flex-shrink-0 overflow-hidden rounded-2xl bg-black border border-white/5">
              <img src={slide.image} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-500" alt="Hero" />
            </div>
            
            <div className="flex-grow space-y-4">
              <input
                defaultValue={slide.title}
                onBlur={(e) => (slide.title = e.target.value)}
                className="w-full bg-black/40 border border-zinc-800/50 rounded-xl px-4 py-2 font-bold outline-none focus:border-blue-500 transition-all"
              />
              <textarea
                defaultValue={slide.subtitle}
                onBlur={(e) => (slide.subtitle = e.target.value)}
                className="w-full bg-black/40 border border-zinc-800/50 rounded-xl px-4 py-2 text-xs h-16 text-zinc-400 outline-none focus:border-blue-500 transition-all resize-none"
              />
            </div>

            <div className="flex md:flex-col gap-3 justify-center">
              <button onClick={() => handleUpdateSlideText(slide.id, slide.title, slide.subtitle)} className="p-4 bg-zinc-800 hover:bg-green-600/20 hover:text-green-500 rounded-2xl transition-all"><Save size={20} /></button>
              <button onClick={() => handleDeleteSlide(slide.id)} className="p-4 bg-zinc-800 hover:bg-red-600/20 hover:text-red-500 rounded-2xl transition-all"><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
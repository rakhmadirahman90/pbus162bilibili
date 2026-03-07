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

  // --- PERBAIKAN 1: FUNGSI PILIH FILE (HANYA UNTUK MODAL) ---
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        alert("Mohon pilih file gambar (JPG/PNG)");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCropper(true); // Memunculkan modal pemotong
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
      
      // Reset input agar file yang sama bisa dipilih kembali
      e.target.value = "";
    }
  };

  const onCropComplete = useCallback((_: any, clippedPixels: any) => {
    setCroppedAreaPixels(clippedPixels);
  }, []);

  // --- PERBAIKAN 2: FUNGSI PROSES & UPLOAD (DIPANGGIL OLEH TOMBOL MODAL) ---
  const processAndUpload = async () => {
    // Validasi sebelum lanjut
    if (!imageSrc || !croppedAreaPixels) return;
    if (!newTitle.trim()) {
      alert("Harap isi Judul Slide terlebih dahulu di form sebelum memproses gambar!");
      setShowCropper(false); // Tutup cropper agar user bisa isi judul
      return;
    }

    setUploading(true);
    try {
      // 1. PROSES CROP (Menggunakan Canvas)
      const image = new Image();
      image.src = imageSrc;
      await new Promise((res) => (image.onload = res));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

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

      // 2. Konversi Canvas ke Blob
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9));
      
      // 3. PROSES KOMPRESI
      const compressedFile = await imageCompression(new File([blob], "hero_slide.jpg"), {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      // 4. UPLOAD KE STORAGE
      const fileName = `hero-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(`hero/${fileName}`, compressedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(`hero/${fileName}`);

      // 5. UPDATE DATABASE (Upsert)
      const newSlide: HeroSlide = {
        id: Date.now(),
        title: newTitle,
        subtitle: newSubtitle,
        image: publicUrl
      };

      const updatedSlides = [...slides, newSlide];
      await saveToDatabase(updatedSlides);

      // 6. Reset State
      setShowCropper(false);
      setImageSrc(null);
      setNewTitle('');
      setNewSubtitle('');
      alert("Slide berhasil ditambahkan!");
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
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
    <div className="max-w-6xl mx-auto p-6 bg-black text-white min-h-screen">
      
      {/* MODAL CROPPER - Z-Index 99999 agar pasti muncul di atas */}
      {showCropper && imageSrc && (
        <div 
          className="fixed inset-0 flex flex-col bg-black"
          style={{ zIndex: 99999 }}
        >
          <div className="flex justify-between items-center p-4 bg-zinc-900 border-b border-zinc-800">
            <h3 className="font-bold flex items-center gap-2 text-blue-400 text-lg uppercase tracking-tighter italic">
              <ImageIcon size={20} /> Crop Image 16:9
            </h3>
            <button onClick={() => setShowCropper(false)} className="p-2 hover:bg-red-600 rounded-full transition-colors">
              <X size={28} />
            </button>
          </div>
          
          <div className="relative flex-grow bg-zinc-950 w-full">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="p-8 bg-zinc-900 flex flex-col items-center gap-6 border-t border-zinc-800 shadow-2xl">
            <div className="flex items-center gap-6 w-full max-w-lg">
              <ZoomOut size={24} className="text-zinc-500" />
              <input
                type="range"
                min={1} max={3} step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <ZoomIn size={24} className="text-zinc-500" />
            </div>
            
            <div className="flex gap-4 w-full max-w-lg">
              <button
                onClick={() => setShowCropper(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-4 rounded-2xl font-bold text-zinc-300 transition-all border border-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={processAndUpload}
                disabled={uploading}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 py-4 rounded-2xl font-bold flex justify-center items-center gap-2 transition-all shadow-xl shadow-blue-900/20"
              >
                {uploading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={22} /> Save & Upload</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-10 border-b border-zinc-800 pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Hero Admin Pro</h1>
        <p className="text-zinc-500 text-sm mt-1">Sistem manajemen slider beranda dengan kompresi cerdas.</p>
      </header>

      {/* FORM INPUT UTAMA */}
      <section className="mb-12 bg-zinc-900/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <div>
              <label className="text-[11px] text-zinc-500 uppercase tracking-widest block mb-2 font-bold">Slide Title</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all"
                placeholder="Isi judul dulu sebelum pilih gambar..."
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-500 uppercase tracking-widest block mb-2 font-bold">Slide Subtitle</label>
              <textarea
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 outline-none h-28 focus:border-blue-500 transition-all resize-none"
                placeholder="Masukkan deskripsi singkat..."
              />
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <label className="text-[11px] text-zinc-500 uppercase tracking-widest block mb-2 font-bold">Image Source</label>
            <label className="group border-2 border-dashed border-zinc-800 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-600/5 transition-all h-full">
              <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              <div className="bg-zinc-800 p-5 rounded-full group-hover:bg-blue-600 transition-all mb-4">
                <ImageIcon className="text-zinc-400 group-hover:text-white" size={36} />
              </div>
              <p className="text-base font-semibold text-zinc-400 group-hover:text-zinc-200">Klik untuk Pilih Foto</p>
              <p className="text-[11px] text-zinc-600 mt-2 italic text-center leading-relaxed">Format didukung: JPG, PNG, WEBP.<br/>Editor potong akan terbuka otomatis.</p>
            </label>
          </div>
        </div>
      </section>

      {/* DAFTAR SLIDE AKTIF */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold flex items-center gap-3 italic uppercase tracking-tighter">
          Current Slides 
          <span className="bg-blue-600/10 text-blue-500 text-xs px-3 py-1 rounded-full border border-blue-500/20 not-italic font-medium">{slides.length}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {slides.map((slide) => (
          <div key={slide.id} className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 flex flex-col md:flex-row gap-8 hover:border-zinc-600 transition-all group overflow-hidden">
            <div className="w-full md:w-64 h-36 flex-shrink-0 overflow-hidden rounded-2xl bg-black border border-white/5 shadow-inner">
              <img src={slide.image} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt="Hero" />
            </div>
            
            <div className="flex-grow space-y-4 py-1">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-600 uppercase font-bold">Title</label>
                <input
                  defaultValue={slide.title}
                  onBlur={(e) => (slide.title = e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800/50 rounded-xl px-4 py-2 font-bold outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-600 uppercase font-bold">Description</label>
                <textarea
                  defaultValue={slide.subtitle}
                  onBlur={(e) => (slide.subtitle = e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800/50 rounded-xl px-4 py-2 text-xs h-16 text-zinc-400 outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex md:flex-col gap-3 justify-center">
              <button 
                onClick={() => handleUpdateSlideText(slide.id, slide.title, slide.subtitle)} 
                className="p-4 bg-zinc-800 hover:bg-green-600/20 hover:text-green-500 rounded-2xl transition-all shadow-lg"
              >
                <Save size={20} />
              </button>
              <button 
                onClick={() => handleDeleteSlide(slide.id)} 
                className="p-4 bg-zinc-800 hover:bg-red-600/20 hover:text-red-500 rounded-2xl transition-all shadow-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        
        {slides.length === 0 && (
          <div className="text-center py-24 bg-zinc-900/20 border-2 border-dashed border-zinc-800 rounded-[40px]">
            <p className="text-zinc-600 font-medium italic">No active slides. Upload your first image above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
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

  // 1. Pilih File & Baca sebagai DataURL untuk Cropper
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: any, clippedPixels: any) => {
    setCroppedAreaPixels(clippedPixels);
  }, []);

  // 2. Fungsi Kompresi & Pemrosesan Gambar (Crop + Compress)
  const processAndUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setUploading(true);
    try {
      // Create Canvas untuk hasil crop
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

      // Convert Canvas ke Blob
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9));
      
      // KOMPRESI OTOMATIS
      const options = {
        maxSizeMB: 0.5, // Max 500KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(new File([blob], "hero.jpg"), options);

      // UPLOAD KE SUPABASE
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

      // Reset
      setShowCropper(false);
      setImageSrc(null);
      setNewTitle('');
      setNewSubtitle('');
      alert("Slide berhasil ditambahkan dengan gambar optimal!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSlideText = async (id: number | string, title: string, subtitle: string) => {
    const updatedSlides = slides.map(s => s.id === id ? { ...s, title, subtitle } : s);
    await saveToDatabase(updatedSlides);
    alert("Teks diperbarui!");
  };

  const handleDeleteSlide = async (id: number | string) => {
    if (!confirm("Hapus permanen?")) return;
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
      {/* MODAL CROPPER */}
      {showCropper && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-zinc-800">
            <h3 className="font-bold">Sesuaikan Area Gambar (16:9)</h3>
            <button onClick={() => setShowCropper(false)} className="p-2 hover:bg-zinc-800 rounded-full"><X /></button>
          </div>
          
          <div className="relative flex-grow bg-zinc-900">
            <Cropper
              image={imageSrc!}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="p-6 bg-zinc-900 space-y-4">
            <div className="flex items-center gap-4 max-w-md mx-auto">
              <ZoomOut size={20} />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
              />
              <ZoomIn size={20} />
            </div>
            <button
              onClick={processAndUpload}
              disabled={uploading}
              className="w-full max-w-md mx-auto flex justify-center items-center gap-2 bg-blue-600 py-3 rounded-xl font-bold"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <><Check size={20} /> Gunakan & Upload Gambar</>}
            </button>
          </div>
        </div>
      )}

      <header className="mb-10 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic italic">Hero Admin Pro</h1>
        <p className="text-zinc-500 text-sm">Dilengkapi Auto-Crop & Smart Compression.</p>
      </header>

      {/* FORM INPUT */}
      <section className="mb-12 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Judul Slide"
            />
            <textarea
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none h-24 focus:border-blue-500"
              placeholder="Sub-judul..."
            />
          </div>
          <div className="flex flex-col">
            <label className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all">
              <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              <ImageIcon className="text-zinc-600 mb-2" size={32} />
              <p className="text-sm text-zinc-400">Pilih Gambar Latar</p>
              <span className="text-[10px] text-zinc-600 mt-2">Sistem akan otomatis mengompres ke format ringan</span>
            </label>
          </div>
        </div>
      </section>

      {/* LIST SLIDES */}
      <section className="space-y-4">
        {slides.map((slide) => (
          <div key={slide.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-6">
            <img src={slide.image} className="w-full md:w-48 h-28 object-cover rounded-lg bg-black" />
            <div className="flex-grow space-y-3">
              <input
                defaultValue={slide.title}
                onBlur={(e) => (slide.title = e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 font-bold"
              />
              <textarea
                defaultValue={slide.subtitle}
                onBlur={(e) => (slide.subtitle = e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs h-14 text-zinc-400"
              />
            </div>
            <div className="flex md:flex-col gap-2 justify-end">
              <button onClick={() => handleUpdateSlideText(slide.id, slide.title, slide.subtitle)} className="p-3 bg-zinc-800 hover:bg-green-600 rounded-xl transition-all"><Save size={18} /></button>
              <button onClick={() => handleDeleteSlide(slide.id)} className="p-3 bg-zinc-800 hover:bg-red-600 rounded-xl transition-all"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
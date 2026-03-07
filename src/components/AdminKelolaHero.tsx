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

  // 1. Fungsi Pilih Gambar & Trigger Modal Crop
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validasi file gambar
      if (!file.type.startsWith('image/')) {
        alert("Mohon pilih file gambar (JPG/PNG)");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCropper(true); // Memunculkan modal
        setZoom(1); // Reset zoom ke awal
      };
    }
  };

  const onCropComplete = useCallback((_: any, clippedPixels: any) => {
    setCroppedAreaPixels(clippedPixels);
  }, []);

  // 2. Proses Pemotongan, Kompresi, dan Upload
  const processAndUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    if (!newTitle) {
      alert("Harap isi Judul Slide sebelum menyimpan!");
      return;
    }

    setUploading(true);
    try {
      // PROSES CROP (Menggunakan Canvas)
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

      // Konversi Canvas ke Blob
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9));
      
      // PROSES KOMPRESI (Max 500KB)
      const compressionOptions = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(new File([blob], "hero_slide.jpg"), compressionOptions);

      // UPLOAD KE STORAGE
      const fileName = `hero-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(`hero/${fileName}`, compressedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(`hero/${fileName}`);

      // UPDATE DATABASE (Upsert)
      const newSlide: HeroSlide = {
        id: Date.now(),
        title: newTitle,
        subtitle: newSubtitle,
        image: publicUrl
      };

      const updatedSlides = [...slides, newSlide];
      await saveToDatabase(updatedSlides);

      // Reset State
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
      
      {/* MODAL CROPPER (Diletakkan paling atas dengan Z-Index Tinggi) */}
      {showCropper && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
          <div className="flex justify-between items-center p-4 bg-zinc-900 border-b border-zinc-800">
            <h3 className="font-bold flex items-center gap-2 text-blue-400">
              <ImageIcon size={20} /> Sesuaikan Foto Slider (16:9)
            </h3>
            <button 
              onClick={() => setShowCropper(false)} 
              className="p-2 hover:bg-red-600 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="relative flex-grow bg-zinc-950">
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

          <div className="p-6 bg-zinc-900 flex flex-col items-center gap-6 border-t border-zinc-800">
            <div className="flex items-center gap-4 w-full max-w-md">
              <ZoomOut size={20} className="text-zinc-500" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <ZoomIn size={20} className="text-zinc-500" />
            </div>
            
            <div className="flex gap-4 w-full max-w-md">
              <button
                onClick={() => setShowCropper(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl font-bold transition-all"
              >
                Batal
              </button>
              <button
                onClick={processAndUpload}
                disabled={uploading}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
              >
                {uploading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Simpan & Upload</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-10 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic italic">Hero Admin Pro</h1>
        <p className="text-zinc-500 text-sm">Update konten slider dengan kompresi otomatis & fitur crop.</p>
      </header>

      {/* FORM INPUT UTAMA */}
      <section className="mb-12 bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2 font-bold">Judul Slide</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
                placeholder="Masukkan judul..."
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2 font-bold">Sub-judul / Deskripsi</label>
              <textarea
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none h-24 focus:border-blue-500 transition-all resize-none"
                placeholder="Masukkan deskripsi singkat..."
              />
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2 font-bold">Upload Gambar</label>
            <label className="group border-2 border-dashed border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all h-full">
              <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              <div className="bg-zinc-800 p-4 rounded-full group-hover:bg-blue-600 transition-all mb-4">
                <ImageIcon className="text-zinc-400 group-hover:text-white" size={32} />
              </div>
              <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200">Klik untuk pilih gambar</p>
              <p className="text-[10px] text-zinc-600 mt-2 italic">Rasio 16:9 akan diterapkan secara otomatis</p>
            </label>
          </div>
        </div>
      </section>

      {/* DAFTAR SLIDE AKTIF */}
      <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
        Daftar Slide Aktif 
        <span className="bg-zinc-800 text-xs px-2 py-1 rounded-md text-zinc-400">{slides.length} Slide</span>
      </h2>

      <div className="space-y-4">
        {slides.map((slide) => (
          <div key={slide.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-6 hover:border-zinc-700 transition-all group">
            <div className="w-full md:w-56 h-32 flex-shrink-0 overflow-hidden rounded-xl bg-black border border-white/5">
              <img src={slide.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Preview" />
            </div>
            
            <div className="flex-grow space-y-3">
              <input
                defaultValue={slide.title}
                onBlur={(e) => (slide.title = e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 font-bold outline-none focus:border-blue-500 transition-all"
              />
              <textarea
                defaultValue={slide.subtitle}
                onBlur={(e) => (slide.subtitle = e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-xs h-14 text-zinc-400 outline-none focus:border-blue-500 transition-all resize-none"
              />
            </div>

            <div className="flex md:flex-col gap-2 justify-end">
              <button 
                onClick={() => handleUpdateSlideText(slide.id, slide.title, slide.subtitle)} 
                className="p-3 bg-zinc-800 hover:bg-green-600/20 hover:text-green-500 rounded-xl transition-all"
                title="Simpan Perubahan"
              >
                <Save size={18} />
              </button>
              <button 
                onClick={() => handleDeleteSlide(slide.id)} 
                className="p-3 bg-zinc-800 hover:bg-red-600/20 hover:text-red-500 rounded-xl transition-all"
                title="Hapus Slide"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/20 border-2 border-dashed border-zinc-900 rounded-3xl">
            <p className="text-zinc-600 italic">Belum ada slide yang ditambahkan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
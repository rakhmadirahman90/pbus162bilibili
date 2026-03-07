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
  const [tempPreview, setTempPreview] = useState<string | null>(null);

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

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropper(true); // Munculkan modal besar untuk crop
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onCropComplete = useCallback((_: any, clippedPixels: any) => {
    setCroppedAreaPixels(clippedPixels);
  }, []);

  // Fungsi untuk memproses potong gambar secara lokal sebelum upload
  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
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

      const base64Image = canvas.toDataURL('image/jpeg');
      setTempPreview(base64Image); // Tampilkan hasil potong di kotak preview kecil
      setShowCropper(false); // Tutup modal crop
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublish = async () => {
    if (!tempPreview || !newTitle) {
      alert("Isi judul dan pilih gambar!");
      return;
    }

    setUploading(true);
    try {
      // Ubah base64 preview ke blob untuk upload
      const response = await fetch(tempPreview);
      const blob = await response.blob();
      
      const compressedFile = await imageCompression(new File([blob], "hero.jpg"), {
        maxSizeMB: 0.8,
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

      setTempPreview(null);
      setImageSrc(null);
      setNewTitle('');
      setNewSubtitle('');
      alert("Berhasil publish!");
    } catch (err) {
      alert("Gagal upload");
    } finally {
      setUploading(false);
    }
  };

  const saveToDatabase = async (updatedSlides: HeroSlide[]) => {
    await supabase.from('site_settings').upsert({
      key: 'hero_config',
      value: { settings: { duration: 7 }, slides: updatedSlides },
      updated_at: new Date().toISOString()
    });
    setSlides(updatedSlides);
  };

  const handleDeleteSlide = async (id: number | string) => {
    if (!confirm("Hapus slide ini?")) return;
    const updatedSlides = slides.filter(s => s.id !== id);
    await saveToDatabase(updatedSlides);
  };

  return (
    <div className="relative max-w-7xl mx-auto p-6 bg-[#0a0a0c] text-white min-h-screen font-sans">
      
      {/* ==========================================================
          MODAL CROPPER FULLSCREEN (INI YANG MEMASTIKAN FITUR MUNCUL)
          ========================================================== */}
      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
          <div className="p-4 bg-[#111] border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-blue-400 font-bold italic uppercase tracking-tighter">Adjust Image</h2>
            <button onClick={() => setShowCropper(false)} className="text-zinc-400 hover:text-white"><X size={30}/></button>
          </div>

          <div className="relative flex-grow bg-[#050505]">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { width: '100%', height: '100%' }
              }}
            />
          </div>

          <div className="p-8 bg-[#111] border-t border-zinc-800 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 w-full max-w-md">
              <ZoomOut size={20} />
              <input 
                type="range" min={1} max={3} step={0.1} value={zoom} 
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1 bg-zinc-700 accent-blue-600 appearance-none rounded-lg"
              />
              <ZoomIn size={20} />
            </div>
            <button 
              onClick={handleConfirmCrop}
              className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-3 rounded-full font-bold uppercase tracking-widest transition-all"
            >
              Apply Crop
            </button>
          </div>
        </div>
      )}

      {/* DASHBOARD UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: REGISTER FORM */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111114] border border-white/5 p-6 rounded-[2rem] shadow-2xl">
            <h3 className="text-blue-500 font-black italic uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
              <Plus size={14}/> Register New Slide
            </h3>

            {/* Kotak Preview / Upload */}
            <div 
              onClick={() => document.getElementById('file-input')?.click()}
              className="relative aspect-video bg-black border-2 border-dashed border-zinc-800 rounded-3xl overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all mb-6"
            >
              {tempPreview ? (
                <img src={tempPreview} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                  <ImageIcon size={40} className="mb-2 opacity-20" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Select & Compress Visual</span>
                </div>
              )}
              <input id="file-input" type="file" hidden accept="image/*" onChange={onFileChange} />
            </div>

            <div className="space-y-4">
              <input 
                placeholder="Title Line" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
              />
              <textarea 
                placeholder="Subtitle detail description..." 
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm h-24 resize-none focus:border-blue-500 outline-none transition-all"
              />
              <button 
                onClick={handlePublish}
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-900/20 flex justify-center items-center"
              >
                {uploading ? <Loader2 className="animate-spin" /> : "Publish To Hero"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIST SLIDES */}
        <div className="lg:col-span-8 space-y-4">
          {slides.map((slide, index) => (
            <div key={slide.id} className="bg-[#111114] border border-white/5 p-4 rounded-[2rem] flex items-center gap-6 group hover:border-zinc-700 transition-all">
              <div className="relative w-48 aspect-video rounded-2xl overflow-hidden flex-shrink-0">
                <img src={slide.image} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-blue-600 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                  {index + 1}
                </div>
              </div>
              <div className="flex-grow">
                <h4 className="font-black italic uppercase text-lg leading-tight mb-1">{slide.title}</h4>
                <p className="text-zinc-500 text-xs line-clamp-2 uppercase tracking-tighter">{slide.subtitle}</p>
              </div>
              <div className="flex flex-col gap-2 pr-4">
                <button onClick={() => handleDeleteSlide(slide.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
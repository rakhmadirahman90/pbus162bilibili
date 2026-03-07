import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase'; 

// Data Statis Original (Sebagai Fallback)
const defaultSlides = [
  { id: 1, image: '/whatsapp_image_2026-02-02_at_08.39.03.jpeg' },
  { id: 2, image: '/whatsapp_image_2026-02-02_at_09.53.05_(1).jpeg' },
  { id: 3, image: '/whatsapp_image_2026-02-02_at_09.53.05_(2).jpeg' },
  { id: 4, image: '/whatsapp_image_2026-02-02_at_09.53.05_(3).jpeg' },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [settings, setSettings] = useState({ duration: 7 });

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'hero_config')
          .single();

        if (data?.value) {
          const config = data.value;
          if (config.slides && Array.isArray(config.slides)) {
            setSlides(config.slides);
            setSettings(config.settings || { duration: 7 });
          } else if (Array.isArray(config)) {
            setSlides(config);
          }
        }
      } catch (err) {
        console.error("Error fetching hero data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroData();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => handleNext(), settings.duration * 1000);
    return () => clearInterval(timer);
  }, [slides, currentSlide, settings.duration]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1500);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1500);
  };

  return (
    <section id="home" className="relative w-full h-[100dvh] overflow-hidden bg-black">
      
      {/* Background Visual Layer */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              index === currentSlide ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            {/* PERBAIKAN FOKUS VISUAL MOBILE (KUNCI):
              1. object-cover: Tetap digunakan agar memenuhi layar penuh.
              2. object-top: KHUSUS MOBILE, kita paksa gambar "tumbuh" dari atas. 
                 Ini akan memastikan area 'kepala' dan 'wajah' dari crop 16:9 admin 
                 selalu muncul bersih dan tidak terpotong oleh notch/status bar HP.
              3. md:object-center: Kembali ke tengah pada desktop.
            */}
            <img
              src={slide.image}
              alt=""
              className={`w-full h-full object-cover object-top md:object-center transition-transform duration-[15000ms] ease-out ${
                index === currentSlide ? 'scale-110' : 'scale-100'
              }`}
            />
            {/* Overlay Gradasi Dinamis: Memberikan shadow di bawah agar kontrol UI navigasi 'pop' */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent via-50% to-black/80 z-10" />
          </div>
        ))}
      </div>

      {/* Navigasi Samping (Progress Dots) */}
      <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isTransitioning && setCurrentSlide(index)}
            className={`transition-all duration-700 rounded-full ${
              index === currentSlide 
                ? 'h-8 md:h-10 w-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]' 
                : 'h-1.5 w-1 bg-white/20 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Main Controls - Diperhalus agar minimalis */}
      <div className="absolute bottom-10 left-0 right-0 px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-black/40 backdrop-blur-xl rounded-full border border-white/10 p-1">
            <button onClick={handlePrev} className="p-3 text-white/70 hover:text-white transition-all active:scale-75">
              <ChevronLeft size={22} className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="w-[1px] h-6 bg-white/10" />
            <button onClick={handleNext} className="p-3 text-white/70 hover:text-white transition-all active:scale-75">
              <ChevronRight size={22} className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          <span className="text-[10px] text-white/50 font-mono tracking-widest hidden xs:inline">
            <span className="text-white">{(currentSlide + 1).toString().padStart(2, '0')}</span> / {slides.length.toString().padStart(2, '0')}
          </span>
        </div>
        
        {/* Branding Tipis */}
        <div className="hidden md:block text-[8px] text-white/20 tracking-[0.5em] uppercase font-bold italic">
          PB US 162 <span className="text-blue-500/50">AUTHORITY</span>
        </div>
      </div>

      {/* Loading Engine Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center gap-5">
          <div className="w-10 h-10 border border-white/5 border-t-blue-600 rounded-full animate-spin shadow-[0_0_30px_rgba(37,99,235,0.2)]" />
        </div>
      )}
    </section>
  );
}
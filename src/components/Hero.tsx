import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase'; 

// Data Statis Original (Sebagai Fallback)
const defaultSlides = [
  {
    id: 1,
    image: '/whatsapp_image_2026-02-02_at_08.39.03.jpeg',
  },
  {
    id: 2,
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(1).jpeg',
  },
  {
    id: 3,
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(2).jpeg',
  },
  {
    id: 4,
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(3).jpeg',
  },
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

        if (data && data.value) {
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
    const timer = setInterval(() => {
      handleNext();
    }, settings.duration * 1000);
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
    // Menggunakan h-[100dvh] agar benar-benar memenuhi 1 layar penuh di HP (Dynamic Viewport Height)
    <section id="home" className="relative w-full h-[100dvh] overflow-hidden bg-black">
      
      {/* Container Gambar Utama */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              index === currentSlide ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            {/* PENTING: 
               object-cover memastikan gambar memenuhi layar.
               object-center memastikan fokus cropping tengah yang Anda buat di admin tetap terjaga.
            */}
            <img
              src={slide.image}
              alt=""
              className={`w-full h-full object-cover object-center transition-transform duration-[15000ms] ease-out ${
                index === currentSlide ? 'scale-110' : 'scale-100'
              }`}
            />
            
            {/* Overlay Gradasi agar transisi ke section bawah lebih halus */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-10" />
          </div>
        ))}
      </div>

      {/* Navigasi Titik Samping (Desktop & Mobile) */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isTransitioning && setCurrentSlide(index)}
            className={`transition-all duration-500 rounded-full ${
              index === currentSlide 
                ? 'h-10 w-1.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' 
                : 'h-1.5 w-1.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Kontrol Navigasi Bawah */}
      <div className="absolute bottom-10 left-6 right-6 md:left-12 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-black/30 backdrop-blur-xl rounded-full border border-white/10 p-1.5">
            <button 
              onClick={handlePrev} 
              className="p-3 text-white/80 hover:text-white transition-all active:scale-75"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="w-[1px] h-5 bg-white/10" />
            <button 
              onClick={handleNext} 
              className="p-3 text-white/80 hover:text-white transition-all active:scale-75"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          {/* Indikator Angka */}
          <span className="text-white/50 font-mono text-xs tracking-tighter">
            <span className="text-white">0{currentSlide + 1}</span> / 0{slides.length}
          </span>
        </div>

        {/* Branding (Disembunyikan di HP sangat kecil) */}
        <div className="hidden sm:block">
           <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-white/30">
             PB US 162 AUTHORITY
           </p>
        </div>
      </div>

      {/* Loading Screen */}
      {loading && (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </section>
  );
}
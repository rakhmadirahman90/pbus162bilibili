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

  // FETCHING DATA
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

  // Timer Auto-slide
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
    <section 
      id="home" 
      className="relative w-full h-screen min-h-screen overflow-hidden bg-[#050505]"
    >
      {/* Container Utama menggunakan h-screen untuk memastikan 
        saat HP dibuka, slider memenuhi 100% layar.
      */}
      <div className="relative w-full h-full">
        
        {/* Background Slides */}
        <div className="absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                index === currentSlide ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={slide.image}
                  alt="" 
                  className={`w-full h-full object-cover object-center transition-transform duration-[12000ms] ease-out ${
                    index === currentSlide ? 'scale-110' : 'scale-100'
                  }`}
                />
                
                {/* Overlay Gradasi: Dibuat lebih pekat di bawah agar menyatu dengan section berikutnya */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
              </div>
            </div>
          ))}
        </div>

        {/* Side Navigation Dots - Dioptimalkan untuk posisi Full Screen */}
        <div className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 md:gap-4 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => !isTransitioning && setCurrentSlide(index)}
              className={`w-1 md:w-1.5 rounded-full transition-all duration-500 ${
                index === currentSlide 
                  ? 'h-8 md:h-12 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.8)]' 
                  : 'h-2 bg-white/20 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Bottom Navigation Area - Dibuat lebih tinggi sedikit (bottom-12) agar tidak terpotong address bar HP */}
        <div className="absolute bottom-12 left-6 right-6 md:left-12 md:right-12 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            {/* Navigasi Panah Glassmorphism */}
            <div className="flex items-center bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-1">
              <button 
                onClick={handlePrev} 
                className="p-4 hover:bg-white/10 text-white rounded-xl transition-all active:scale-90"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="w-[1px] h-6 bg-white/10 mx-1" />
              <button 
                onClick={handleNext} 
                className="p-4 hover:bg-white/10 text-white rounded-xl transition-all active:scale-90"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Slide Counter - Muncul di HP dalam bentuk ringkas */}
            <div className="text-white/60 font-mono text-[11px] tracking-[0.2em] ml-2">
              <span className="text-white font-bold">{(currentSlide + 1).toString().padStart(2, '0')}</span>
              <span className="mx-2 text-white/20">/</span>
              {slides.length.toString().padStart(2, '0')}
            </div>
          </div>

          {/* Branding Aesthetic - Hanya muncul di layar besar */}
          <div className="hidden lg:block">
             <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 italic">
               PB US 162 <span className="text-blue-600/40">Elite Performance</span>
             </p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[#050505] z-[200] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-2 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-[9px] font-black uppercase tracking-[1em] text-blue-600/50 animate-pulse">Loading</p>
          </div>
        </div>
      )}
    </section>
  );
}
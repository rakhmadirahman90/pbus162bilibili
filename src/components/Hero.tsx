import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase'; 

// Data Statis Original (Sebagai Fallback)
const defaultSlides = [
  {
    id: 1,
    title: 'Pusat Pelatihan PB US 162 Bilibili',
    image: '/whatsapp_image_2026-02-02_at_08.39.03.jpeg',
  },
  {
    id: 2,
    title: 'Keluarga Besar Atlet Kami',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(1).jpeg',
  },
  {
    id: 3,
    title: 'Talenta Muda Terpadu',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(2).jpeg',
  },
  {
    id: 4,
    title: 'Semangat Juara Bersama',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(3).jpeg',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [settings, setSettings] = useState({ duration: 7 });

  // FETCHING DATA: Mengambil konfigurasi dinamis dari Supabase
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

  // Timer Auto-slide dinamis
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, settings.duration * 1000);
    return () => clearInterval(timer);
  }, [slides, currentSlide, settings.duration]);

  // Fungsi Navigasi Manual
  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  return (
    <section id="home" className="relative h-[100dvh] w-full overflow-hidden bg-black">
      
      {/* Background Section (Ken Burns Effect) */}
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
                alt={slide.title || "Hero Image"}
                className={`w-full h-full object-cover object-center transition-transform duration-[12000ms] ease-out ${
                  index === currentSlide ? 'scale-110' : 'scale-100'
                }`}
              />
              
              {/* Overlay Halus untuk membantu kontras navigasi */}
              <div className="absolute inset-0 bg-black/20 z-10" />
            </div>
          </div>
        ))}
      </div>

      {/* Side Navigation Dots */}
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-4 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'h-8 bg-white' : 'bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Bottom Navigation Area (Panah Kiri/Kanan) */}
      <div className="absolute bottom-10 left-6 right-6 md:left-12 flex items-end justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 p-1">
            <button 
              onClick={handlePrev} 
              className="p-3 hover:bg-white/10 text-white rounded-full transition-all active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="w-[1px] h-4 bg-white/10" />
            <button 
              onClick={handleNext} 
              className="p-3 hover:bg-white/10 text-white rounded-full transition-all active:scale-90"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Branding Tipis untuk Estetika */}
        <div className="hidden lg:block">
           <p className="text-[8px] font-medium uppercase tracking-[0.5em] text-white/30">
             PB US 162 AUTHORITY
           </p>
        </div>
      </div>

      {/* Loading Overlay Minimalis */}
      {loading && (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </section>
  );
}
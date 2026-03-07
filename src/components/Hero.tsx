import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase'; 

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
          setSlides(config.slides || config);
          setSettings(config.settings || { duration: 7 });
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

  const scrollToAbout = () => {
    const nextSection = document.getElementById('tentang-kami') || document.getElementById('about');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative w-full h-[100dvh] overflow-hidden bg-black flex flex-col items-center justify-center">
      
      {/* Background Visual Layer */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              index === currentSlide ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            {/* LAYER 1: Background Blur (Full Screen di HP) */}
            <div 
              className="absolute inset-0 scale-150 blur-[80px] opacity-40 md:hidden"
              style={{ 
                backgroundImage: `url(${slide.image})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center' 
              }}
            />

            {/* LAYER 2: Gambar Utama dengan Efek Membesar (Zoom)
                - object-contain: Menjaga wajah UTUH di HP.
                - scale-125: Memulai dari ukuran lebih besar.
                - animate-slow-zoom: CSS custom untuk pergerakan halus.
            */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={slide.image}
                alt=""
                className={`w-full h-full md:object-cover object-contain relative z-10 transition-transform duration-[20000ms] ease-linear
                  ${index === currentSlide ? 'scale-125 translate-y-0' : 'scale-100'}
                `}
              />
            </div>

            {/* Layer 3: Overlay Gelap Sinematik */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent via-50% to-black/90 z-20" />
          </div>
        ))}
      </div>

      {/* Navigasi Samping */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isTransitioning && setCurrentSlide(index)}
            className={`transition-all duration-700 rounded-full ${
              index === currentSlide ? 'h-8 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'h-1.5 w-1 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Kontrol Navigasi & Discovery */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center gap-6 z-40">
        <div className="w-full flex items-center justify-between max-w-7xl">
          <div className="flex items-center bg-black/40 backdrop-blur-xl rounded-full border border-white/10 p-1">
            <button onClick={handlePrev} className="p-3 text-white/70 active:scale-75 transition-transform">
              <ChevronLeft size={22} />
            </button>
            <div className="w-[1px] h-6 bg-white/10" />
            <button onClick={handleNext} className="p-3 text-white/70 active:scale-75 transition-transform">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* Scroll Discovery */}
        <button 
          onClick={scrollToAbout}
          className="group flex flex-col items-center gap-2 transition-all hover:scale-110"
        >
          <span className="text-[7px] font-bold uppercase tracking-[0.4em] text-white/70">Discovery</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-blue-500 to-transparent relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-scroll-line" />
          </div>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      <style>{`
        @keyframes scroll-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-scroll-line {
          animation: scroll-line 2.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
      `}</style>
    </section>
  );
}
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, ArrowRight, MousePointer2 } from 'lucide-react';
import { supabase } from '../supabase'; 

// Data Statis Original (Sebagai Fallback)
const defaultSlides = [
  {
    id: 1,
    title: 'Pusat Pelatihan PB US 162 Bilibili',
    subtitle: 'Fasilitas lapangan berkualitas internasional dengan standar karpet BWF.',
    image: '/whatsapp_image_2026-02-02_at_08.39.03.jpeg',
    titleSize: 48,
    subtitleSize: 16,
    fontFamily: 'font-sans'
  },
  {
    id: 2,
    title: 'Keluarga Besar Atlet Kami',
    subtitle: 'Membangun komunitas solid dengan dedikasi tinggi terhadap bulutangkis.',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(1).jpeg',
    titleSize: 48,
    subtitleSize: 16,
    fontFamily: 'font-sans'
  },
  {
    id: 3,
    title: 'Talenta Muda Terpadu',
    subtitle: 'Program pembinaan terstruktur untuk mencetak juara masa depan.',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(2).jpeg',
    titleSize: 48,
    subtitleSize: 16,
    fontFamily: 'font-sans'
  },
  {
    id: 4,
    title: 'Semangat Juara Bersama',
    subtitle: 'Komitmen menciptakan ekosistem olahraga yang kompetitif dan kekeluargaan.',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(3).jpeg',
    titleSize: 48,
    subtitleSize: 16,
    fontFamily: 'font-sans'
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper untuk menentukan jenis font (Font Family)
  const getFontClass = (fontFamily?: string) => {
    switch (fontFamily) {
      case 'font-serif': return 'font-serif';
      case 'font-mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  return (
    <section id="home" className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Background Section dengan Ken Burns Effect */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover object-center transition-transform duration-[10000ms] ease-out ${
                  index === currentSlide ? 'scale-110' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-start">
        <div className="w-full max-w-3xl pt-20"> 
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-white font-bold uppercase text-[9px] tracking-[0.4em]">
              Professional Club
            </p>
          </div>
          
          {/* TITLE: Case Sensitivity diperbaiki (Class 'uppercase' Dihapus agar mengikuti input Admin) */}
          <h1 
            key={`h1-${currentSlide}`}
            className={`font-bold text-white leading-[1.1] tracking-tight mb-6 animate-in fade-in slide-in-from-left-8 duration-1000 ${getFontClass(slides[currentSlide].fontFamily)}`}
            style={{ 
                fontSize: slides[currentSlide].titleSize 
                  ? `clamp(2rem, ${slides[currentSlide].titleSize / 16}vw, ${slides[currentSlide].titleSize}px)` 
                  : 'clamp(2.5rem, 8vw, 4.5rem)' 
            }}
          >
            {slides[currentSlide].title}
          </h1>
          
          {/* SUBTITLE: Case Sensitivity diperbaiki (Class 'normal-case' ditambahkan) */}
          <p 
            key={`p-${currentSlide}`}
            className={`text-white/90 mb-10 max-w-lg leading-relaxed font-normal normal-case animate-in fade-in slide-in-from-left-12 duration-1000 delay-150 ${getFontClass(slides[currentSlide].fontFamily)}`}
            style={{ 
                fontSize: slides[currentSlide].subtitleSize 
                  ? `${slides[currentSlide].subtitleSize}px` 
                  : '1rem' 
            }}
          >
            {slides[currentSlide].subtitle}
          </p>
          
          <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <button 
              onClick={() => window.open('https://wa.me/628123456789', '_blank')}
              className="group relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-full font-bold uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95"
            >
              Join
            </button>
            
            <button 
              onClick={() => scrollToSection('about')}
              className="group flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-full font-bold uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95"
            >
              Info
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Navigation Dots */}
      <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-4 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'h-8 bg-white' : 'bg-white/30 hover:bg-white/60'}`}
          />
        ))}
      </div>

      {/* Bottom Navigation Area */}
      <div className="absolute bottom-10 left-6 right-6 md:left-12 flex items-end justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-xl rounded-full border border-white/10 p-1">
            <button onClick={handlePrev} className="p-3 hover:bg-white/10 text-white rounded-full transition-all active:scale-90">
              <ChevronLeft size={20} />
            </button>
            <div className="w-[1px] h-4 bg-white/10" />
            <button onClick={handleNext} className="p-3 hover:bg-white/10 text-white rounded-full transition-all active:scale-90">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
           <p className="text-[8px] font-medium uppercase tracking-[0.5em] text-white/30">
             PB US 162 AUTHORITY
           </p>
        </div>
      </div>

      {/* Background Watermark */}
      <div className="absolute -bottom-10 -right-10 select-none pointer-events-none opacity-[0.02] overflow-hidden">
        <h2 className="text-[12rem] md:text-[20rem] font-black text-white leading-none uppercase tracking-tighter">
          BILIBILI
        </h2>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 opacity-30 hover:opacity-60 transition-opacity cursor-pointer" onClick={() => scrollToSection('about')}>
        <div className="w-[1px] h-10 bg-gradient-to-b from-white to-transparent" />
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </section>
  );
}
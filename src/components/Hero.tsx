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
          .maybeSingle(); // Menggunakan maybeSingle agar tidak error jika kosong

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
    setTimeout(() => setIsTransitioning(false), 1500); // Sinkron dengan durasi transisi opacity
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1500);
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
            {/* PERBAIKAN VISUAL: 
                Menggunakan h-full dan w-full dengan object-cover. 
                Karena gambar yang diupload dari Admin sudah di-crop dengan rasio 16:9 HD, 
                maka saat ditampilkan di layar manapun (Full Screen), 
                titik fokus (center) akan tetap terjaga sesuai hasil crop.
            */}
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={slide.image}
                alt={slide.title || "Hero Image"}
                className={`w-full h-full object-cover object-center transition-transform duration-[12000ms] ease-out ${
                  index === currentSlide ? 'scale-110' : 'scale-100'
                }`}
              />
              
              {/* Overlay Gradient: Memperjelas Teks dan Navigasi */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-10" />
            </div>

            {/* Teks Konten (Opsional: Menampilkan judul slide di Landing Page) */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-24">
               <div className={`max-w-4xl transition-all duration-1000 delay-500 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                  <h2 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-sm md:text-lg text-white/70 font-medium max-w-xl uppercase tracking-widest leading-relaxed">
                    {slide.subtitle || ""}
                  </p>
               </div>
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
              index === currentSlide ? 'h-8 bg-blue-600' : 'bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Bottom Navigation Area */}
      <div className="absolute bottom-10 left-6 right-6 md:left-24 flex items-end justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 p-1.5 shadow-2xl">
            <button 
              onClick={handlePrev} 
              className="p-4 hover:bg-white/10 text-white rounded-full transition-all active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="w-[1px] h-6 bg-white/10" />
            <button 
              onClick={handleNext} 
              className="p-4 hover:bg-white/10 text-white rounded-full transition-all active:scale-90"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          {/* Slide Counter */}
          <div className="ml-4 font-black italic text-white/40 tracking-tighter text-2xl hidden md:block">
            <span className="text-white">{(currentSlide + 1).toString().padStart(2, '0')}</span> / {slides.length.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Branding */}
        <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 mb-1">
              PB US 162 OFFICIAL ENGINE
            </p>
            <div className="h-1 w-20 bg-blue-600 ml-auto" />
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[#050505] z-[200] flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
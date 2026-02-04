import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Pusat Pelatihan PB US 162 Bilibili',
    subtitle: 'Fasilitas lapangan berkualitas internasional dengan standar karpet BWF.',
    image: '/whatsapp_image_2026-02-02_at_08.39.03.jpeg',
  },
  {
    id: 2,
    title: 'Keluarga Besar Atlet Kami',
    subtitle: 'Membangun komunitas solid dengan dedikasi tinggi terhadap bulutangkis.',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(1).jpeg',
  },
  {
    id: 3,
    title: 'Talenta Muda Terpadu',
    subtitle: 'Program pembinaan terstruktur untuk mencetak juara masa depan.',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(2).jpeg',
  },
  {
    id: 4,
    title: 'Semangat Juara Bersama',
    subtitle: 'Komitmen menciptakan ekosistem olahraga yang kompetitif dan kekeluargaan.',
    image: '/whatsapp_image_2026-02-02_at_09.53.05_(3).jpeg',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative h-[85vh] md:h-screen w-full overflow-hidden bg-slate-950">
      {/* Background Section */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Intelligent Overlays: Only darkens the areas where text resides */}
            <div className="absolute inset-0 bg-slate-950/20" /> {/* Global dimming */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent w-full md:w-2/3" /> {/* Left-side focus */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" /> {/* Bottom fade */}
          </div>
        ))}
      </div>

      {/* Content Section - Adjusted for better spacing */}
      <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-8 flex items-end md:items-center pb-24 md:pb-0">
        <div className="max-w-2xl lg:max-w-3xl">
          <div className="overflow-hidden mb-2">
            <p key={`lbl-${currentSlide}`} className="text-blue-400 font-bold tracking-[0.4em] uppercase text-xs md:text-sm animate-in slide-in-from-bottom-full duration-700">
              Professional Club
            </p>
          </div>
          
          <h1 key={`ttl-${currentSlide}`} className="text-4xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.1] animate-in fade-in slide-in-from-left-8 duration-700 tracking-tight">
            {slides[currentSlide].title}
          </h1>
          
          <p key={`desc-${currentSlide}`} className="text-base md:text-xl text-slate-300 mb-8 md:mb-10 max-w-lg leading-relaxed animate-in fade-in slide-in-from-left-12 duration-1000">
            {slides[currentSlide].subtitle}
          </p>
          
          <div className="flex flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <button 
              onClick={() => window.open('https://wa.me/628123456789', '_blank')}
              className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition-all shadow-xl active:scale-95 text-sm md:text-base"
            >
              <MessageCircle size={18} />
              Join
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="group flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold transition-all text-sm md:text-base"
            >
              Info
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Minimalist Navigation Indicators */}
      <div className="absolute bottom-10 left-6 right-6 md:left-auto md:right-12 flex flex-col items-start md:items-end gap-6">
        <div className="flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`group relative h-1 transition-all duration-500 ${
                index === currentSlide ? 'w-12 bg-blue-500' : 'w-6 bg-white/30 hover:bg-white/50'
              }`}
            >
              <span className="absolute -top-4 left-0 text-[10px] font-bold text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">0{index + 1}</span>
            </button>
          ))}
        </div>
        
        {/* Navigation Arrows with Border effect */}
        <div className="flex gap-2">
          <button onClick={prevSlide} className="p-3 rounded-full border border-white/10 text-white hover:bg-blue-600 hover:border-blue-600 transition-all backdrop-blur-sm active:scale-90">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextSlide} className="p-3 rounded-full border border-white/10 text-white hover:bg-blue-600 hover:border-blue-600 transition-all backdrop-blur-sm active:scale-90">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Aesthetic Counter Text */}
      <div className="absolute top-1/2 -right-12 -translate-y-1/2 rotate-90 hidden xl:block pointer-events-none">
        <span className="text-white/5 text-[12rem] font-black leading-none uppercase">PB US 162</span>
      </div>
    </section>
  );
}
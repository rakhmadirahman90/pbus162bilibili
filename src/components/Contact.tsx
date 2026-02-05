import React from 'react';
import { MapPin, Clock, Phone, Mail, ExternalLink } from 'lucide-react';

export default function Contact() {
  // Link yang telah diperbarui sesuai permintaan Anda
  const googleMapEmbedUrl = "https://maps.app.goo.gl/2iqvqSC7QaFLrnZy9";

  return (
    <section id="contact" className="py-24 bg-[#050505] text-white relative overflow-hidden scroll-mt-20">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -mr-64 -mt-64"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            HUBUNGI <span className="text-blue-500">KAMI</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto uppercase tracking-widest text-[10px] md:text-xs font-bold">
            Kunjungi markas besar PB US 162 BILIBILI dan mulailah perjalanan profesionalmu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* --- INFO CARD --- */}
          <div className="space-y-8">
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/10 backdrop-blur-sm shadow-xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Informasi Markas
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/20">
                    <MapPin className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-400 text-sm uppercase tracking-wider mb-1">Alamat Utama</h4>
                    <p className="text-slate-100 leading-relaxed">
                      Jl. Bilibili Raya No. 162, Kompleks Olahraga Profesional, <br />
                      Jakarta Selatan, DKI Jakarta 12345
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Clock className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-400 text-sm uppercase tracking-wider mb-1">Jam Operasional</h4>
                    <p className="text-slate-100 font-medium">Senin - Sabtu: 08.00 - 22.00 WIB</p>
                    <p className="text-slate-500 text-sm italic">Minggu: Khusus Pertandingan Internal</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <a href="tel:+628123456789" className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-blue-600/20 transition-all border border-white/5 group">
                    <Phone size={18} className="text-blue-400 group-hover:rotate-12 transition-transform" />
                    <span className="text-sm font-semibold">+62 812-3456-789</span>
                  </a>
                  <a href="mailto:info@us162bilibili.com" className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-blue-600/20 transition-all border border-white/5 group">
                    <Mail size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold">info@us162bilibili.com</span>
                  </a>
                </div>
              </div>
            </div>

            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 group"
            >
              Buka di Google Maps
              <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>

          {/* --- GOOGLE MAPS EMBED --- */}
          <div className="w-full h-[450px] lg:h-full min-h-[450px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group">
            <iframe 
              src={googleMapEmbedUrl}
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'grayscale(0.5) invert(0.9) contrast(1.2)' }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi PB US 162 BILIBILI"
              className="grayscale-[50%] group-hover:grayscale-0 transition-all duration-700"
            ></iframe>
            {/* Overlay Mask */}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-3xl"></div>
          </div>

        </div>
      </div>
    </section>
  );
}
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  // Fungsi helper untuk scroll halus saat link diklik
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/photo_2026-02-03_00-32-07.jpg"
                alt="PB US 162 Parepare Logo"
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
              />
              <div>
                <h3 className="text-xl font-bold">PB US 162 Bilibili</h3>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Pusat pembinaan atlet bulutangkis terbaik dengan fasilitas berstandar
              internasional dan pelatih berpengalaman.
            </p>
          </div>

          {/* Navigation - FIXED & WORKING */}
          <div>
            <h4 className="text-lg font-bold mb-4 uppercase tracking-wider text-blue-400">Navigasi</h4>
            <ul className="space-y-3">
              {[
                { name: 'Beranda', id: 'home' },
                { name: 'Berita', id: 'news' },
                { name: 'Atlet', id: 'atlet' },
                { name: 'Peringkat', id: 'ranking' },
                { name: 'Galeri', id: 'gallery' },
                { name: 'Tentang Kami', id: 'about' }
              ].map((item) => (
                <li key={item.id}>
                  <a 
                    href={`#${item.id}`}
                    onClick={(e) => handleScroll(e, item.id)}
                    className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-sm"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-lg font-bold mb-4 uppercase tracking-wider text-blue-400">Kontak</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 group">
                <MapPin size={20} className="text-blue-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 text-sm leading-snug">
                  Jl. Andi Makkasau no. 171 kel. Uj. Lare kec. Soreang kota Parepare, Indonesia
                </span>
              </li>
              <li className="flex items-center space-x-3 group">
                <Phone size={20} className="text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+6281219027234" className="text-gray-400 hover:text-white text-sm transition-colors">
                  +62 812 1902 7234
                </a>
              </li>
              <li className="flex items-center space-x-3 group">
                <Mail size={20} className="text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:info@pbus162bilibili.id" className="text-gray-400 hover:text-white text-sm transition-colors">
                  info@pbus162bilibili.id
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-bold mb-4 uppercase tracking-wider text-blue-400">Ikuti Kami</h4>
            <div className="flex space-x-4 mb-6">
              {[
                { Icon: Facebook, href: "https://facebook.com" },
                { Icon: Instagram, href: "https://instagram.com" },
                { Icon: Twitter, href: "https://twitter.com" },
                { Icon: Youtube, href: "https://youtube.com" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1 shadow-lg"
                >
                  <social.Icon size={18} />
                </a>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              Dapatkan update terbaru tentang prestasi dan kegiatan klub kami.
            </p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-xs text-center md:text-left">
              &copy; {new Date().getFullYear()} PB US 162 Bilibili Badminton Club. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#privacy" className="text-gray-500 hover:text-white text-xs transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#terms" className="text-gray-500 hover:text-white text-xs transition-colors">
                Syarat & Ketentuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
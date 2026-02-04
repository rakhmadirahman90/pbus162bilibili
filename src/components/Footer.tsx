import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
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

          {/* Navigation */}
          <div>
            <h4 className="text-lg font-bold mb-4">Navigasi</h4>
            <ul className="space-y-2">
              {['Beranda', 'Berita', 'Atlet', 'Peringkat', 'Galeri', 'Tentang'].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section - FIXED syntax here */}
          <div>
            <h4 className="text-lg font-bold mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-blue-400 mt-1 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  jl. Andi Makkasau no. 171 kel. Uj. Lare kec. Soreang kota Parepare, Indonesia
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-blue-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">+62 812 1902 7234</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-blue-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">info@pbus162bilibili.id</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-bold mb-4">Ikuti Kami</h4>
            <div className="flex space-x-4 mb-6">
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Youtube, href: "#" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="bg-slate-800 hover:bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                >
                  <social.Icon size={20} />
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
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} PB US 162 Bilibili Badminton Club. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Syarat & Ketentuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
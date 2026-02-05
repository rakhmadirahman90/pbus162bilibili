{/* Lightbox / Player Modal */}
{activeMedia && (
  <div 
    className="fixed inset-0 bg-slate-950/98 z-[200] flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300"
    onClick={() => setSelectedId(null)} // Klik di area gelap untuk menutup
  >
    {/* Konten Utama */}
    <div 
      className="relative max-w-5xl w-full flex flex-col items-center" 
      onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat konten di-klik
    >
      {activeMedia.type === 'video' ? (
        <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10">
          <iframe 
            className="w-full h-full"
            src={activeMedia.videoUrl}
            title={activeMedia.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <img 
          src={activeMedia.image} 
          alt={activeMedia.title} 
          className="max-w-full max-h-[65vh] object-contain rounded-3xl shadow-2xl border border-white/10" 
        />
      )}

      {/* Box Deskripsi */}
      <div className="mt-8 bg-slate-900 p-8 rounded-[2rem] border border-slate-800 max-w-3xl w-full text-center shadow-2xl">
        <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
          {activeMedia.category}
        </span>
        <h3 className="text-white text-3xl font-black mb-4">{activeMedia.title}</h3>
        <p className="text-slate-400 leading-relaxed italic text-lg">"{activeMedia.description}"</p>
      </div>
    </div>

    {/* Tombol Close (Dipindah ke bawah agar z-index lebih tinggi secara natural) */}
    <button 
      onClick={() => setSelectedId(null)}
      className="absolute top-8 right-8 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all hover:rotate-90 z-[210] cursor-pointer"
      title="Tutup"
    >
      <X size={32} strokeWidth={3} />
    </button>
  </div>
)}
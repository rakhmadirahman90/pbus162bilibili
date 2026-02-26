const cetakSuratPDF = (surat: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. KOP SURAT (Header)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PENGURUS CABANG PERSATUAN BULUTANGKIS SELURUH INDONESIA", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(16);
  doc.text("PBSI KOTA / KABUPATEN ANDA", pageWidth / 2, 28, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Sekretariat: Jl. Alamat Lengkap No. 123, Email: pbsi@email.com, WA: 0812...", pageWidth / 2, 34, { align: "center" });
  
  // Garis Double Kop
  doc.setLineWidth(0.8);
  doc.line(15, 37, pageWidth - 15, 37);
  doc.setLineWidth(0.2);
  doc.line(15, 38, pageWidth - 15, 38);

  // 2. BODY SURAT
  doc.text(`Nomor  : ${surat.nomor_surat}`, 20, 50);
  doc.text(`Perihal : ${surat.perihal}`, 20, 56);
  doc.text(`${surat.tanggal_surat}`, pageWidth - 20, 50, { align: "right" });

  doc.text("Kepada Yth,", 20, 75);
  doc.setFont("helvetica", "bold");
  doc.text(surat.tujuan_instansi, 20, 81);
  
  doc.setFont("helvetica", "normal");
  doc.text("Dengan hormat,", 20, 95);
  const isiSplit = doc.splitTextToSize(surat.isi_surat, pageWidth - 40);
  doc.text(isiSplit, 20, 102);

  // 3. TANDA TANGAN (Footer)
  const footerY = 200;
  doc.text("Ketua Umum,", 30, footerY);
  doc.text("Sekretaris,", pageWidth - 70, footerY);

  // TEMPAT TANDA TANGAN DIGITAL (IMAGE)
  // doc.addImage(imgData_TTD, 'PNG', 25, footerY + 5, 30, 20); 

  doc.setFont("helvetica", "bold");
  doc.text(surat.nama_ketua, 30, footerY + 35);
  doc.text(surat.nama_sekretaris, pageWidth - 70, footerY + 35);

  doc.save(`Surat_${surat.nomor_surat}.pdf`);
};
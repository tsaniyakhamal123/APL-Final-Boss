import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';

const PDF_DIR = './storage/surat_tugas';

// Pastikan folder storage ada
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

const generateNomorSurat = (projectId) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `ST/APL/${projectId.slice(0, 6).toUpperCase()}/${month}/${year}`;
};

export const generateSuratTugas = async (payload) => {
  const { event_id, project_id, project_title, members } = payload;

  // Idempotency check
  const existing = await pool.query(
    'SELECT id, pdf_path FROM surat_tugas WHERE event_id = $1',
    [event_id]
  );
  if (existing.rows.length > 0) {
    console.log(`[Idempotency] Surat Tugas untuk event ${event_id} sudah dibuat.`);
    return existing.rows[0];
  }

  const nomor_surat = generateNomorSurat(project_id);
  const filename = `surat_tugas_${project_id}_${Date.now()}.pdf`;
  const pdf_path = path.join(PDF_DIR, filename);

  // Generate PDF
  await createPDF({ nomor_surat, project_title, members, pdf_path });

  // Simpan ke DB
  const result = await pool.query(
    `INSERT INTO surat_tugas (event_id, nomor_surat, project_id, project_title, members, pdf_path)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [event_id, nomor_surat, project_id, project_title, JSON.stringify(members), pdf_path]
  );

  console.log(`[SuratTugas] PDF berhasil digenerate: ${filename}`);
  return result.rows[0];
};

const createPDF = ({ nomor_surat, project_title, members, pdf_path }) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const stream = fs.createWriteStream(pdf_path);

    doc.pipe(stream);

    // ── HEADER ──────────────────────────────────────────────
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('UNIVERSITAS GADJAH MADA', { align: 'center' })
      .fontSize(11)
      .font('Helvetica')
      .text('Fakultas Teknik — Program Studi Teknologi Informasi', { align: 'center' })
      .moveDown(0.5);

    doc
      .moveTo(60, doc.y)
      .lineTo(535, doc.y)
      .lineWidth(2)
      .stroke()
      .moveDown(0.8);

    // ── JUDUL ────────────────────────────────────────────────
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('SURAT TUGAS', { align: 'center' })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Nomor: ${nomor_surat}`, { align: 'center' })
      .moveDown(1.2);

    // ── ISI SURAT ────────────────────────────────────────────
    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    doc
      .fontSize(11)
      .font('Helvetica')
      .text(
        `Yang bertanda tangan di bawah ini, dengan ini menugaskan tim berikut untuk mengerjakan proyek dalam rangka Program Capstone / Freelance Project Hub:`,
        { align: 'justify', lineGap: 4 }
      )
      .moveDown(1);

    // ── INFO PROYEK ──────────────────────────────────────────
    doc
      .font('Helvetica-Bold')
      .text('Nama Proyek  : ', { continued: true })
      .font('Helvetica')
      .text(project_title)
      .moveDown(1);

    // ── TABEL ANGGOTA TIM ────────────────────────────────────
    doc
      .font('Helvetica-Bold')
      .text('Susunan Tim:', { underline: true })
      .moveDown(0.5);

    // Header tabel
    const tableTop = doc.y;
    const col = { no: 60, nim: 90, name: 200, role: 390 };

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('No.', col.no, tableTop)
      .text('NIM', col.nim, tableTop)
      .text('Nama', col.name, tableTop)
      .text('Role', col.role, tableTop);

    doc
      .moveTo(60, doc.y + 2)
      .lineTo(535, doc.y + 2)
      .stroke();

    // Rows anggota
    doc.font('Helvetica').fontSize(10);
    members.forEach((member, i) => {
      const y = doc.y + 6;
      doc
        .text(`${i + 1}.`, col.no, y)
        .text(member.nim || '-', col.nim, y)
        .text(member.name, col.name, y)
        .text(member.role, col.role, y);
    });

    doc.moveDown(2);

    // ── TANDA TANGAN ─────────────────────────────────────────
    doc
      .fontSize(11)
      .text(`Yogyakarta, ${today}`, { align: 'right' })
      .moveDown(0.5)
      .text('Koordinator Program', { align: 'right' })
      .moveDown(3.5)
      .font('Helvetica-Bold')
      .text('Dr. M. Aidiel Rachman Putra', { align: 'right' })
      .font('Helvetica')
      .fontSize(10)
      .text('NIP. xxxxxxxxxxxxxx', { align: 'right' });

    // ── FOOTER ───────────────────────────────────────────────
    doc
      .moveTo(60, 760)
      .lineTo(535, 760)
      .stroke();

    doc
      .fontSize(8)
      .text(
        `Dokumen ini digenerate secara otomatis oleh Communication & Automation Service — Kelompok 5`,
        60, 768,
        { align: 'center', color: 'grey' }
      );

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
};
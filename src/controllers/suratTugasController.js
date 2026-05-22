import pool from '../config/db.js';
import fs from 'fs';
import { generateSuratTugas } from '../services/suratTugasService.js';
import { randomUUID } from 'crypto';

export const getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nomor_surat, project_title, members, issued_at FROM surat_tugas ORDER BY issued_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const download = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM surat_tugas WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
    const surat = result.rows[0];
    if (!fs.existsSync(surat.pdf_path)) return res.status(404).json({ success: false, message: 'File PDF tidak ada' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="surat_tugas_${surat.project_id}.pdf"`);
    fs.createReadStream(surat.pdf_path).pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generate = async (req, res) => {
  try {
    const payload = { event_id: randomUUID(), ...req.body };
    const result = await generateSuratTugas(payload);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
import { Router } from 'express';
import { getAllNotifications } from '../repositories/notificationRepo.js';
import { publishEvent } from '../events/notificationPublisher.js';
import { generateSuratTugas } from '../services/suratTugasService.js';
import pool from '../config/db.js';
import fs from 'fs';

const router = Router();

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await getAllNotifications();
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notifications/surat-tugas — list semua surat tugas
router.get('/surat-tugas', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nomor_surat, project_title, members, issued_at FROM surat_tugas ORDER BY issued_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/notifications/surat-tugas/:id/download — download PDF
router.get('/surat-tugas/:id/download', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM surat_tugas WHERE id = $1',
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Surat Tugas tidak ditemukan' });
    }

    const surat = result.rows[0];

    if (!fs.existsSync(surat.pdf_path)) {
      return res.status(404).json({ success: false, message: 'File PDF tidak ditemukan' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="surat_tugas_${surat.project_id}.pdf"`);
    fs.createReadStream(surat.pdf_path).pipe(res);

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notifications/test — testing manual
router.post('/test', async (req, res) => {
  try {
    const { channel, payload } = req.body;
    await publishEvent(channel, payload);
    res.json({ success: true, message: `Event published ke channel: ${channel}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notifications/surat-tugas/generate — generate manual (tanpa Redis)
router.post('/surat-tugas/generate', async (req, res) => {
  try {
    const { randomUUID } = await import('crypto');
    const payload = { event_id: randomUUID(), ...req.body };
    const result = await generateSuratTugas(payload);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
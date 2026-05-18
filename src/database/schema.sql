CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  event_id    VARCHAR(255) UNIQUE NOT NULL,
  user_id     VARCHAR(255) NOT NULL,
  user_email  VARCHAR(255) NOT NULL,
  type        VARCHAR(100) NOT NULL,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      VARCHAR(50) DEFAULT 'PENDING',
  sent_at     TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Tabel baru untuk Surat Tugas
CREATE TABLE IF NOT EXISTS surat_tugas (
  id            SERIAL PRIMARY KEY,
  event_id      VARCHAR(255) UNIQUE NOT NULL,
  nomor_surat   VARCHAR(100) NOT NULL,
  project_id    VARCHAR(255) NOT NULL,
  project_title TEXT NOT NULL,
  members       JSONB NOT NULL,        -- array of { user_id, name, nim, role }
  issued_at     TIMESTAMP DEFAULT NOW(),
  pdf_path      VARCHAR(500)           -- path file PDF yang disimpan
);
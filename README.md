````
# Project APL - Communication & Automation Service

**Kelompok 5 — "Broadcaster"**

Communication & Automation Service adalah salah satu microservice dalam ekosistem ProjectHub, sebuah platform terintegrasi berbasis microservices untuk mengelola proses bidding di lingkungan akademik.

Service ini berperan sebagai pusat komunikasi sistem yang menangani:

- Notifikasi otomatis ketika terjadi perubahan status bidding
- Otomatisasi generate dokumen Surat Tugas (PDF)
- Logging seluruh notifikasi untuk audit & idempotency

---

## 🚀 Fitur Utama

### MVP
- Notifikasi email otomatis saat status bidding berubah
- Logging notifikasi ke database

### Medium
- Idempotency check — event yang sama tidak diproses dua kali
- Deduplikasi notifikasi

### Maximum
- Generate Surat Tugas PDF otomatis saat deal dikonfirmasi
- Download Surat Tugas via REST API

---

## 🏗 Arsitektur

Service ini menggunakan pola **Event-Driven Architecture (EDA)** — tidak dipanggil langsung oleh service lain, melainkan mendengarkan event yang dipublish ke message broker.

```
Service Lain (Kelompok 1–4)
        │
        │  publish event
        ▼
   RabbitMQ Exchange
   (tracker.events, type: topic)
        │
        │  consume queue
        ▼
 Notification Subscriber
   ┌────┴────┐
   │         │
   ▼         ▼
Email      Surat Tugas
Service    Generator (PDF)
   │         │
   ▼         ▼
PostgreSQL  Disk Storage
```

### Routing Keys yang Disubscribe

| Routing Key | Trigger | Aksi |
|---|---|---|
| `bidding.project.created` | Proyek baru dibuat | Kirim email notifikasi ke klien |
| `bidding.bid.status.updated` | Bid diterima / ditolak | Kirim email ke freelancer |
| `bidding.bid.deal.confirmed` | Deal dikonfirmasi | Kirim email + generate Surat Tugas PDF |
| `bidding.bid.counter.offered` | Ada counter offer | Kirim email notifikasi ke user |

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Node.js + Express v5 |
| Message Broker | RabbitMQ (topic exchange) |
| Database | PostgreSQL |
| PDF Generator | PDFKit |
| Email Service | Nodemailer (Gmail) |
| Containerization | Docker + Docker Compose |

---

## 📌 Business Role

Service ini berfungsi sebagai **Communication & Automation Layer** pada ekosistem ProjectHub:

- Subscribe event dari service lain
- Trigger notifikasi otomatis ke user
- Generate dokumen administratif (Surat Tugas)

---

## 🧩 Functional Requirements

### Notification Module
- Terima event perubahan status bidding
- Kirim email otomatis Accepted / Rejected
- Logging notifikasi dan deduplikasi event

### Automation Module
- Generate Surat Tugas PDF otomatis
- Download surat tugas

---

## REST API

Base URL: `http://localhost:3000/api/notifications`

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/health` | Health check service |
| `GET` | `/notifications` | Ambil semua notifikasi |
| `GET` | `/surat-tugas` | Ambil semua surat tugas |
| `POST` | `/surat-tugas/generate` | Generate surat tugas manual |
| `GET` | `/surat-tugas/:id/download` | Download PDF surat tugas |

### Contoh request generate surat tugas

```json
POST /api/notifications/surat-tugas/generate
Content-Type: application/json

{
  "project_id": "proj-abc123",
  "project_title": "Pengembangan Website E-Commerce",
  "members": [
    { "name": "Budi Santoso", "nim": "21/123456/TIF/001", "role": "Backend Developer" },
    { "name": "Sari Dewi", "nim": "21/123457/TIF/002", "role": "Frontend Developer" }
  ]
}
```

---

## Penamaan Branching

### main branch
Branch yang terintegrasi dengan kelompok lain.

### develop branch
Internal testing branch.

### fitur branch

```
<type>/<short_description>.<nama>
```

Contoh: `feature/email-notif.tsaniya`

---

## Prerequisites

Pastikan sudah terinstall:

- Docker & Docker Compose
- Node.js v18+
- PostgreSQL
- RabbitMQ

---

## Authors

Anggota Kelompok 5:

- Hanifah
- Abe
- Tsaniya
- Danella
- Rafa
- Athaya

> Kalo ada yang bingung WA Niya aja 😄
````

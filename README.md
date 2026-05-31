# Project APL - Communication & Automation Service  
**Kelompok 5 — “Broadcaster”**

Communication & Automation Service adalah salah satu microservice dalam ekosistem ProjectHub, sebuah platform terintegrasi berbasis microservices untuk mengelola proses bidding judul Capstone di lingkungan akademik.

Service ini berperan sebagai pusat komunikasi sistem yang menangani:

- Pengumuman resmi dari panitia/dosen
- Notifikasi otomatis ketika terjadi perubahan status bidding
- Otomatisasi generate dokumen Surat Tugas (PDF)

---

# 🚀 Fitur Utama

## MVP
- Manajemen dan distribusi pengumuman
- Download dokumen pengumuman PDF

## Medium
- Email notifikasi otomatis ketika status bidding berubah
- Logging notifikasi untuk audit & idempotency

## Maximum
- Generate Surat Tugas otomatis dalam format PDF
- Download Surat Tugas

---

Arsitektur
Service ini menggunakan pola Event-Driven Architecture (EDA) — ia tidak dipanggil langsung oleh service lain, melainkan mendengarkan event yang dipublish ke message broker.
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


Tech Stack
Layer
Teknologi
Backend
Node.js + Express v5
Message Broker
RabbitMQ (topic exchange)
Database
PostgreSQL
PDF Generator
PDFKit
Email Service
Nodemailer (Gmail)
Containerization
Docker + Docker Compose


REST API
Base URL: http://localhost:3000/api/notifications
Method
Endpoint
Deskripsi
GET
/health
Health check service
GET
/notifications
Ambil semua notifikasi
GET
/surat-tugas
Ambil semua surat tugas
POST
/surat-tugas/generate
Generate surat tugas manual
GET
/surat-tugas/:id/download
Download PDF surat tugas

Contoh request generate surat tugas
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

Communication & Automation Service — Kelompok 5 "Broadcaster" · APL 2026


# Penamaan Branching

### main branch
branch yang terintegrasi dengan kelompok lain.

### develop branch
internal testing branch

### fitur branch
```bash
<type>/<short_description>.<nama>
```
contoh: feature/navbar.joko

---

# 📌 Business Role
Service ini berfungsi sebagai **Communication & Automation Layer** pada ekosistem ProjectHub:

- Broadcast pengumuman ke seluruh pengguna
- Subscribe event dari service lain
- Trigger notifikasi otomatis
- Generate dokumen administratif

---

# 🧩 Functional Requirements

## Announcement Module
- Upload dokumen pengumuman
- Lihat daftar pengumuman
- Download pengumuman

## Notification Module
- Terima event perubahan status bidding
- Kirim email otomatis Accepted / Rejected
- Logging notifikasi dan deduplikasi event

## Automation Module
- Generate Surat Tugas PDF
- Download surat tugas

---

## Prerequisites
Pastikan terinstall:

- Docker
- Docker Compose
- Node.js
- PostgreSQL
- Redis

---

# Authors
Anggota Kelompok 5  

- Hanifah 
- Abe
- Tsaniya
- Danella
- Rafa
- Athaya

Kalo ada yang bingung WA niya aja

# Sistem QR Code Statis POWERS

## 📋 Overview

Sistem QR code statis untuk anggota POWERS memungkinkan setiap anggota memiliki kode unik yang dapat digunakan untuk absensi di event. Sistem ini menggantikan QR code dinamis per-event dengan QR code personal yang lebih praktis dan mudah digunakan.

## 🎯 Fitur Utama

### 1. **QR Code Statis Personal**

- Setiap anggota POWERS mendapat kode unik 7 karakter (format: `PWR` + 4 digit)
- QR code bersifat permanen dan dapat disimpan di galeri HP
- Mudah diingat dan dapat diinput manual jika diperlukan

### 2. **Dual Mode Scanning**

- **Kamera Scanner**: Admin dapat scan QR code dengan kamera HP/laptop
- **Input Manual**: Backup input kode secara manual (contoh: `PWR2301`)

### 3. **Format Kode**

#### Prioritas Generate Kode:

1. **Berbasis NIM** (jika tersedia)
   - Format: `PWR` + 4 digit terakhir NIM
   - Contoh: NIM `20232345` → `PWR2345`

2. **Sequential berdasarkan Angkatan**
   - Format: `PWR` + 2 digit tahun + 2 digit urutan
   - Contoh: Angkatan 2023, urutan 1 → `PWR2301`

3. **Berbasis Nama** (fallback)
   - Format: `PWR` + huruf pertama nama + 3 digit random
   - Contoh: Ahmad → `PWRA123`

## 🚀 Setup & Instalasi

### 1. Database Migration

Jalankan migration untuk menambahkan field `memberCode`:

```bash
npx prisma migrate dev --name add-member-code
```

### 2. Generate Member Codes untuk Existing Users

Jalankan script untuk generate kode anggota:

```bash
npx tsx scripts/generate-member-codes.ts
```

Script ini akan:

- Mengambil semua user yang belum punya member code
- Generate kode unik untuk setiap user
- Update database dengan kode baru
- Menampilkan progress dan hasil

### 3. Regenerate Prisma Client

```bash
npx prisma generate
```

## 📡 API Endpoints

### 1. Generate QR Code (GET)

**Endpoint:** `GET /api/users/qrcode`

**Deskripsi:** Generate QR code untuk user yang sedang login

**Response:**

```json
{
  "memberCode": "PWR2301",
  "qrCodeDataURL": "data:image/png;base64,...",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "nim": "20232301",
    "angkatan": "2023"
  }
}
```

### 2. Generate QR Code untuk User Lain (POST) - Admin Only

**Endpoint:** `POST /api/users/qrcode`

**Body:**

```json
{
  "userId": "user_id_here"
}
```

**Response:** Sama dengan GET endpoint

### 3. Scan QR Code untuk Absensi (POST)

**Endpoint:** `POST /api/attendance/scan`

**Body:**

```json
{
  "memberCode": "PWR2301",
  "sessionId": "session_id_here",
  "eventId": "event_id_here" // optional
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "John Doe berhasil diabsen masuk",
  "data": {
    "attendance": {
      "checkInAt": "2025-01-07T08:30:00Z",
      "status": "PRESENT"
    },
    "user": {
      "name": "John Doe",
      "memberCode": "PWR2301",
      "nim": "20232301",
      "role": "CORE",
      "division": "Teknologi Informasi"
    },
    "session": {
      "title": "Opening Ceremony",
      "event": "POWERS Summit 2025"
    },
    "scannedBy": "Admin User"
  }
}
```

**Response (Already Attended):**

```json
{
  "success": false,
  "message": "John Doe sudah tercatat hadir di session ini",
  "data": {
    "attendance": {
      "checkInAt": "2025-01-07T08:15:00Z",
      "status": "PRESENT"
    },
    "user": { ... }
  }
}
```

### 4. Validasi Member Code (GET)

**Endpoint:** `GET /api/attendance/scan?memberCode=PWR2301`

**Deskripsi:** Validasi kode anggota tanpa melakukan absensi

**Response:**

```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "memberCode": "PWR2301",
    "nim": "20232301",
    "role": "CORE",
    "division": "Teknologi Informasi",
    "angkatan": "2023",
    "status": "ACTIVE"
  }
}
```

## 🎨 Komponen React

### 1. MemberQRCode Component

Menampilkan QR code anggota dengan fitur download dan copy kode.

**Usage:**

```tsx
import MemberQRCode from '@/components/molecules/MemberQRCode';

// Untuk user yang sedang login
<MemberQRCode />

// Untuk user lain (admin only)
<MemberQRCode userId="user_id_here" />
```

**Features:**

- ✅ Auto-generate QR code saat load
- ✅ Download QR code sebagai PNG
- ✅ Copy member code ke clipboard
- ✅ Tampilkan info user (nama, NIM, angkatan)
- ✅ Instruksi penggunaan
- ✅ Loading & error states

### 2. QRCodeScanner Component

Scanner QR code untuk admin dengan dual mode (camera + manual input).

**Usage:**

```tsx
import QRCodeScanner from "@/components/molecules/QRCodeScanner";

<QRCodeScanner
  sessionId="session_id_here"
  eventId="event_id_here" // optional
  onScanSuccess={(result) => {
    console.log("Scan result:", result);
  }}
/>;
```

**Features:**

- ✅ Camera scanner dengan highlight QR region
- ✅ Manual input dengan auto-uppercase
- ✅ Real-time scan result display
- ✅ Recent scans history (5 terakhir)
- ✅ Success/error feedback dengan toast
- ✅ Loading states
- ✅ Access control (Admin & Core only)

## 📱 Penggunaan

### Untuk Anggota POWERS:

1. **Mendapatkan QR Code:**
   - Login ke dashboard
   - Buka halaman Profile (`/dashboard/profile`)
   - Klik "Tampilkan QR Code"
   - Download QR code dan simpan di galeri HP

2. **Saat Absensi di Event:**
   - Tunjukkan QR code kepada admin/core
   - Alternatif: berikan kode manual (contoh: `PWR2301`)

### Untuk Admin/Core:

1. **Melakukan Scan Absensi:**
   - Buka halaman event session
   - Klik tombol "Kamera" untuk scan QR code
   - Atau klik "Manual" untuk input kode secara manual
   - Scan QR code anggota atau ketik kode manual
   - Sistem akan otomatis record attendance

2. **Mode Scanner:**
   - **Kamera Mode**: Real-time scanning dengan kamera
   - **Manual Mode**: Input kode manual jika QR code rusak/tidak bisa scan

## 🔒 Security & Access Control

### Permission Levels:

- **Semua User**:
  - Dapat generate dan view QR code sendiri
  - Endpoint: `GET /api/users/qrcode`

- **Admin & Core**:
  - Dapat melakukan scan untuk absensi
  - Endpoint: `POST /api/attendance/scan`

- **Admin Only**:
  - Dapat generate QR code untuk user lain
  - Endpoint: `POST /api/users/qrcode`

## 🛠️ Utility Functions

### `generateUniqueMemberCode()`

Generate kode unik dengan prioritas: NIM → Sequential → Name-based

```typescript
import { generateUniqueMemberCode } from "@/lib/member-code";

const memberCode = await generateUniqueMemberCode({
  nim: "20232345",
  name: "John Doe",
  angkatan: "2023",
});
// Returns: "PWR2345"
```

### `isMemberCodeExists()`

Check apakah kode sudah digunakan

```typescript
import { isMemberCodeExists } from "@/lib/member-code";

const exists = await isMemberCodeExists("PWR2301");
// Returns: true/false
```

## 📊 Database Schema

```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String
  password    String
  role        Role      @default(RANGERS)

  // Member Code untuk QR Code statis
  memberCode  String?   @unique // Format: PWR + 4 digit
  nim         String?   @unique
  phone       String?
  angkatan    String?
  status      String    @default("ACTIVE")

  // ... relations
}
```

## 🎯 Best Practices

1. **QR Code Management:**
   - Generate kode saat user pertama kali dibuat
   - Jangan regenerate kode kecuali benar-benar diperlukan
   - QR code bersifat permanen untuk konsistensi

2. **Scanning:**
   - Selalu validasi member code sebelum record attendance
   - Check status user (ACTIVE/INACTIVE)
   - Prevent duplicate scan untuk session yang sama

3. **Error Handling:**
   - Provide clear error messages
   - Offer manual input sebagai backup
   - Log scan attempts untuk audit

4. **Performance:**
   - Cache QR code generation results
   - Optimize camera scanner settings
   - Implement debounce untuk manual input

## 🐛 Troubleshooting

### QR Code tidak ter-generate:

- Check database connection
- Pastikan field `memberCode` sudah ada di schema
- Run migration: `npx prisma migrate dev`

### Camera tidak bisa akses:

- Check browser permissions
- Gunakan HTTPS (required untuk camera access)
- Fallback ke manual input mode

### Scan gagal:

- Pastikan QR code tidak blur/rusak
- Check lighting conditions
- Coba manual input sebagai alternatif

### Member code conflict:

- System otomatis handle dengan fallback strategy
- Check logs untuk duplicate attempts
- Manual intervention jika diperlukan

## 📝 Future Enhancements

- [ ] QR code dengan custom branding/logo POWERS
- [ ] Export QR codes dalam batch (untuk print)
- [ ] Analytics dashboard untuk attendance patterns
- [ ] Integration dengan ID card system
- [ ] Offline mode support untuk scanner

## 📞 Support

Untuk pertanyaan atau issue, hubungi:

- Tech Team POWERS
- Email: tech@powerspolnep.id
- GitHub Issues: [Repository Link]

---

**Last Updated:** 2025-01-07
**Version:** 1.0.0

# 🚀 Quick Start: Sistem QR Code Statis POWERS

## 📝 Ringkasan

Sistem QR code statis memungkinkan setiap anggota POWERS memiliki kode unik (format: `PWR` + 4 digit) yang dapat digunakan untuk absensi di semua event.

## ⚡ Setup Cepat

### 1. Jalankan Migration

```bash
npx prisma migrate dev --name add-member-code
npx prisma generate
```

### 2. Generate Member Codes

```bash
npx tsx scripts/generate-member-codes.ts
```

### 3. Selesai! 🎉

Sistem sudah siap digunakan.

## 💡 Cara Penggunaan

### Untuk Anggota:

1. Login → Profile → Klik "Tampilkan QR Code"
2. Download dan simpan QR code di HP
3. Tunjukkan QR code saat absensi event

### Untuk Admin/Core:

1. Buka halaman event session
2. Klik "Kamera" atau "Manual"
3. Scan QR code anggota atau input kode manual
4. Selesai! Attendance tercatat otomatis

## 📦 File-file Penting

### Backend:

- `src/lib/member-code.ts` - Utility generate kode
- `src/app/api/users/qrcode/route.ts` - API generate QR
- `src/app/api/attendance/scan/route.ts` - API scan QR

### Frontend:

- `src/components/molecules/MemberQRCode.tsx` - Komponen QR code
- `src/components/molecules/QRCodeScanner.tsx` - Komponen scanner
- `src/app/dashboard/profile/page.tsx` - Halaman profile

### Database:

- `prisma/schema.prisma` - Schema dengan field `memberCode`

### Scripts:

- `scripts/generate-member-codes.ts` - Generate kode untuk existing users

### Docs:

- `docs/QRCODE_SYSTEM.md` - Dokumentasi lengkap

## 🎯 Format Kode

**Prioritas:**

1. NIM: `PWR` + 4 digit terakhir NIM (contoh: `PWR2345`)
2. Sequential: `PWR` + tahun + urutan (contoh: `PWR2301`)
3. Name-based: `PWR` + huruf + 3 digit (contoh: `PWRA123`)

## 🔧 API Endpoints

- `GET /api/users/qrcode` - Generate QR sendiri
- `POST /api/users/qrcode` - Generate QR user lain (admin)
- `POST /api/attendance/scan` - Scan untuk absensi
- `GET /api/attendance/scan?memberCode=PWR2301` - Validasi kode

## ✨ Fitur Utama

✅ QR code statis & permanen per anggota
✅ Dual mode: Camera scanner + Input manual
✅ Download QR code sebagai PNG
✅ Copy kode ke clipboard
✅ Real-time scan validation
✅ Recent scans history
✅ Access control (Admin & Core)

## 🔍 Testing

### Test Generate QR Code:

```bash
# Login sebagai user
curl http://localhost:3000/api/users/qrcode
```

### Test Scan:

```bash
# Login sebagai admin/core
curl -X POST http://localhost:3000/api/attendance/scan \
  -H "Content-Type: application/json" \
  -d '{"memberCode":"PWR2301","sessionId":"session_id"}'
```

## 📚 Dokumentasi Lengkap

Lihat `docs/QRCODE_SYSTEM.md` untuk dokumentasi detail.

## ❓ Troubleshooting

**QR Code tidak muncul?**
→ Check console, pastikan API `/api/users/qrcode` berhasil

**Camera tidak bisa akses?**
→ Gunakan HTTPS atau gunakan input manual

**Member code tidak unik?**
→ Run script `generate-member-codes.ts` lagi

**Scan tidak tercatat?**
→ Check permission (harus Admin atau Core)

---

**Need Help?** Lihat dokumentasi lengkap atau hubungi Tech Team POWERS.

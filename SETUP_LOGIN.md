# 🔐 Committee Login System - Quick Start Guide

Panduan singkat untuk setup dan menggunakan sistem login committee.

## ⚡ Quick Start (5 Steps)

### Step 0: Setup PostgreSQL Database

**PENTING**: Sebelum menjalankan aplikasi, setup PostgreSQL terlebih dahulu.

Lihat file `DATABASE_SETUP.md` untuk instruksi lengkap.

Ringkas:

1. Install PostgreSQL
2. Buat database: `CREATE DATABASE powerspolnep;`
3. Verify connection sudah bisa

### Step 1: Setup Environment

File `.env` dan `.env.local` sudah dikonfigurasi dengan PostgreSQL. Lihat isinya:

```bash
cat .env
```

**DATABASE_URL** harus sesuai dengan kredensial PostgreSQL Anda:

```
DATABASE_URL="postgresql://postgres:delapandelapan@localhost:5432/powerspolnep?schema=public"
```

Ubah kredensial jika berbeda. Jika perlu, ubah `JWT_SECRET` ke string yang lebih panjang untuk production.

### Step 2: Run Prisma Migrations

```bash
# Create tables di PostgreSQL
npx prisma migrate dev --name init

# (Optional) Lihat data dengan Prisma Studio
npx prisma studio
```

### Step 3: Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### Step 4: Test Sistem Login

1. **Register** - Buat akun baru: `http://localhost:3000/register`
2. **Login** - Login dengan akun: `http://localhost:3000/login`
3. **Dashboard** - Akses dashboard: `http://localhost:3000/dashboard`

### Step 5: Lihat Database

```bash
# Buka Prisma Studio untuk manage data
npx prisma studio
```

---

## 📁 File Structure

### Authentication System

```
src/
├── app/
│   ├── api/auth/          # API endpoints
│   ├── login/             # Login page
│   ├── register/          # Register page
│   └── dashboard/         # Protected page
├── lib/
│   ├── auth.ts            # JWT & password utilities
│   └── db.ts              # Database operations
├── types/
│   └── auth.ts            # TypeScript types
└── middleware.ts          # Route protection
```

### Database (PostgreSQL + Prisma)

```
prisma/
├── schema.prisma          # Prisma schema (PostgreSQL)
└── migrations/            # Database migrations
```

---

## 🧪 Test dengan cURL

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response akan berisi `token` yang bisa digunakan untuk request authenticated.

### Test Protected Endpoint

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/dashboard
```

---

## 🔐 Security

✅ **Password Hashing**: bcryptjs dengan 10 salt rounds  
✅ **Token**: JWT dengan 24 jam expiration  
✅ **Storage**: HTTP-only cookies + localStorage  
✅ **Validation**: Email & password validation  
✅ **Middleware**: Automatic route protection

---

## 📝 Default Test Account

Setelah first register, Anda bisa gunakan:

- **Email**: `test@example.com`
- **Password**: `password123`

---

## 🔧 Customization

### Ubah Halaman Login/Register UI

Edit file:

- `src/app/login/page.tsx`
- `src/app/register/page.tsx`

### Tambah Protected Routes

Edit `src/middleware.ts` - tambah route ke `protectedRoutes` array:

```typescript
const protectedRoutes = ["/dashboard", "/your-new-route"];
```

### Ubah Database ke PostgreSQL

Database sudah dikonfigurasi menggunakan PostgreSQL + Prisma.

Jika ingin mengubah database provider (ke MySQL, dll):

1. Edit `prisma/schema.prisma` - ubah provider
2. Edit `.env` DATABASE_URL - ubah connection string
3. Jalankan: `npx prisma migrate dev --name change_db`

---

## 🚀 Deploy ke Production

Sebelum deploy:

1. **Generate JWT_SECRET**:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Setup Production PostgreSQL Database**:
   - Gunakan managed service (AWS RDS, Google Cloud SQL, dll)
   - Update `DATABASE_URL` dengan production connection string

3. **Set Environment Variables**:
   - `JWT_SECRET` = generated secret
   - `NODE_ENV` = production
   - `DATABASE_URL` = production PostgreSQL

4. **Run Migrations**:

   ```bash
   npx prisma migrate deploy
   ```

5. **Build & Start**:
   ```bash
   npm run build
   npm start
   ```

---

## 📚 Complete Documentation

Lihat `AUTHENTICATION.md` untuk dokumentasi lengkap.

---

## 🎯 Features

✅ User Registration  
✅ User Login  
✅ JWT Token Management  
✅ Protected Routes  
✅ Password Hashing  
✅ Logout  
✅ Beautiful UI  
✅ Error Handling

---

## 💡 Tips

- Token disimpan di **HTTP-only cookie** (aman dari XSS)
- Token juga dikembalikan di response untuk `localStorage`
- Gunakan token di header: `Authorization: Bearer <token>`
- Middleware auto-redirect ke login jika token expired

---

**Happy Coding! 🚀**

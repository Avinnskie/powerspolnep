# 🔐 Login Credentials - POWERS Committee System

## Test Accounts

Semua akun menggunakan password yang sama: **`password123`**

### 1. Admin Account

- **Email**: `admin@powerspolnep.com`
- **Password**: `password123`
- **Name**: Admin POWERS

### 2. Ketua Committee

- **Email**: `ketua@powerspolnep.com`
- **Password**: `password123`
- **Name**: Ketua Committee

### 3. Sekretaris Committee

- **Email**: `sekretaris@powerspolnep.com`
- **Password**: `password123`
- **Name**: Sekretaris Committee

### 4. Bendahara Committee

- **Email**: `bendahara@powerspolnep.com`
- **Password**: `password123`
- **Name**: Bendahara Committee

### 5. Test User

- **Email**: `test@example.com`
- **Password**: `password123`
- **Name**: Test User

---

## Quick Start

1. **Start development server:**

   ```bash
   npm run dev
   ```

2. **Access aplikasi:**
   - Login: http://localhost:3000/login
   - Register: http://localhost:3000/register
   - Dashboard: http://localhost:3000/dashboard (protected)

3. **Login dengan salah satu akun di atas**

---

## Features

✅ **Session-based Authentication** dengan HTTP-only cookies
✅ **JWT Tokens** dengan 24 jam expiration
✅ **Password Hashing** menggunakan bcryptjs
✅ **Protected Routes** dengan middleware
✅ **Modern Dashboard** dengan stats dan user info
✅ **PostgreSQL Database** dengan Prisma ORM

---

## Database Management

### View Database dengan Prisma Studio

```bash
npx prisma studio
```

Buka http://localhost:5555 untuk melihat data

### Reset & Re-seed Database

```bash
npx prisma migrate reset
npm run db:seed
```

### Add More Users

Edit `prisma/seed.ts` dan tambah users, lalu:

```bash
npm run db:seed
```

---

## API Endpoints

### Register

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123"
}
```

### Login

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@powerspolnep.com",
  "password": "password123"
}
```

### Logout

```bash
POST http://localhost:3000/api/auth/logout
```

---

## Security Notes

⚠️ **IMPORTANT**: Credentials ini hanya untuk development/testing!

Untuk production:

1. Generate JWT_SECRET baru:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update `.env` dengan secret yang baru
3. Ganti semua test passwords
4. Setup proper user management
5. Enable HTTPS
6. Add rate limiting
7. Implement password reset

---

**Happy Testing! 🚀**

# Committee Login System Documentation

Sistem login yang aman dan lengkap untuk para committee members.

## 📋 Fitur

- ✅ User registration dengan validasi email dan password
- ✅ User login dengan JWT authentication
- ✅ Password hashing dengan bcryptjs
- ✅ Protected routes dengan middleware
- ✅ HTTP-only cookies untuk token storage
- ✅ Logout functionality
- ✅ Beautiful UI dengan Tailwind CSS
- ✅ Error handling dan validation

## 🗂️ Struktur Proyek

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts      # Login endpoint
│   │       ├── register/route.ts   # Register endpoint
│   │       └── logout/route.ts     # Logout endpoint
│   ├── login/
│   │   └── page.tsx                # Login page UI
│   ├── register/
│   │   └── page.tsx                # Register page UI
│   └── dashboard/
│       └── page.tsx                # Protected dashboard page
├── lib/
│   ├── auth.ts                     # Auth utilities (JWT, password)
│   ├── db.ts                       # Database operations (Prisma)
│   ├── prisma.ts                   # Prisma client singleton
│   └── utils.ts                    # Common utilities
├── types/
│   └── auth.ts                     # TypeScript interfaces
├── middleware.ts                   # Route protection middleware
├── prisma/
│   ├── schema.prisma               # Prisma schema (PostgreSQL)
│   └── migrations/                 # Database migrations
└── .env                            # Environment variables
```

## 🚀 Getting Started

### 1. Install Dependencies

Dependencies sudah diinstall:

- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `js-cookie` - Cookie handling

### 2. Setup Environment Variables

Edit `.env.local`:

```env
# JWT Secret - GANTI INI DENGAN STRING RANDOM PANJANG DI PRODUCTION!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-to-a-random-string

# Node Environment
NODE_ENV=development

# Database Type
DATABASE_TYPE=file
```

**⚠️ PENTING**: Untuk production, generate JWT_SECRET yang kuat:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan tersedia di `http://localhost:3000`

## 📱 Usage

### Register Committee Member

1. Kunjungi `/register`
2. Isi form:
   - Full Name
   - Email Address
   - Password (minimal 6 karakter)
   - Confirm Password
3. Klik "Create Account"

### Login

1. Kunjungi `/login`
2. Isi form:
   - Email Address
   - Password
3. Klik "Sign In"
4. Otomatis redirect ke `/dashboard`

### Protected Routes

Routes yang dilindungi (membutuhkan login):

- `/dashboard` - Committee dashboard
- `/committee/*` - Committee management pages
- `/api/committee/*` - API endpoints untuk committee

Public routes:

- `/login` - Login page
- `/register` - Register page
- `/` - Homepage

## 🔐 Security Features

### Password Security

- Password di-hash menggunakan bcryptjs (10 salt rounds)
- Minimum 6 karakter
- Password tidak pernah disimpan dalam plain text

### JWT Token

- Token expire dalam 24 jam
- Signed dengan JWT_SECRET
- Disimpan dalam HTTP-only cookie (secure dari XSS)
- Juga dikirim dalam response untuk localStorage

### Request Validation

- Email validation
- Required fields validation
- Duplicate email prevention
- CORS-friendly JSON API

### Middleware Protection

- Token verification di setiap request
- Invalid token handling
- Auto redirect ke login jika tidak authenticated
- User info injected ke request headers

## 📡 API Endpoints

### POST `/api/auth/register`

Register committee member baru.

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Committee registered successfully",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2024-10-29T...",
    "updatedAt": "2024-10-29T..."
  }
}
```

### POST `/api/auth/login`

Login dengan email dan password.

**Request:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2024-10-29T...",
    "updatedAt": "2024-10-29T..."
  }
}
```

Set cookie: `auth_token` (HTTP-only, 24 hours)

### POST `/api/auth/logout`

Logout dan clear token.

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

Clear cookie: `auth_token`

## 💾 Database (PostgreSQL + Prisma)

Sistem menggunakan PostgreSQL dengan Prisma ORM.

### Struktur Tabel

```sql
CREATE TABLE "committees" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Setup

1. Konfigurasi PostgreSQL (lihat `DATABASE_SETUP.md`)
2. Update `DATABASE_URL` di `.env`
3. Jalankan migrations: `npx prisma migrate dev --name init`

### Development

```bash
# Lihat data dengan UI
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Reset database
npx prisma migrate reset
```

### Production

Gunakan managed PostgreSQL:

- AWS RDS
- Google Cloud SQL
- Azure Database for PostgreSQL
- DigitalOcean

Update `DATABASE_URL` dengan production connection string.

## 🔧 Customization

### Ubah JWT Expiration

Edit `src/lib/auth.ts`:

```typescript
// Line 24: Ubah expiresIn value
{
  expiresIn: "24h";
} // 24 jam
{
  expiresIn: "7d";
} // 7 hari
{
  expiresIn: "30d";
} // 30 hari
```

### Ubah Password Requirements

Edit `src/app/api/auth/register/route.ts`:

```typescript
// Line 36: Ubah minimum password length
if (password.length < 6) {  // Ubah 6 ke nilai lain
```

### Tambah Protected Routes

Edit `src/middleware.ts`:

```typescript
// Line 15: Tambah routes baru
const protectedRoutes = [
  "/dashboard",
  "/committee",
  "/api/committee",
  "/your-new-route",
];
```

### Customize UI

Edit login/register pages:

- `src/app/login/page.tsx`
- `src/app/register/page.tsx`

Gunakan Tailwind CSS classes untuk styling.

## 🧪 Testing

### Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Route

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/dashboard
```

## ⚠️ Production Checklist

- [ ] Change JWT_SECRET ke string random yang panjang
- [ ] Set NODE_ENV=production
- [ ] Ganti file-based database dengan database yang proper
- [ ] Enable HTTPS
- [ ] Setup proper CORS configuration
- [ ] Add rate limiting untuk API endpoints
- [ ] Setup logging dan monitoring
- [ ] Test security dengan tools seperti OWASP ZAP
- [ ] Setup email verification untuk registration
- [ ] Setup password reset functionality
- [ ] Add 2FA (Two Factor Authentication)
- [ ] Setup proper error handling dan logging

## 🚨 Troubleshooting

### Token Tidak Valid

**Error:** "Token verification failed"

**Solution:**

- Clear cookies di browser
- Hapus localStorage (auth_token)
- Login ulang

### Register dengan Email Sudah Ada

**Error:** "Email already registered"

**Solution:**

- Gunakan email yang berbeda
- atau reset data dengan menghapus `data/committees.json`

### Build Error dengan UUID

**Error:** "Cannot find module 'uuid'"

**Solution:**

```bash
npm install uuid
npm install --save-dev @types/uuid
```

atau gunakan `crypto.randomUUID()` dari Node.js built-in.

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [JWT.io](https://jwt.io)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [Tailwind CSS](https://tailwindcss.com)

## 📝 License

Gunakan sistem ini sesuai dengan kebutuhan Anda.

---

**Last Updated:** October 29, 2024

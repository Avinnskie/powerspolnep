# User Management System - POWERS POLNEP

## ✅ Implementasi Selesai

Sistem manajemen user dengan role-based access control telah berhasil diimplementasikan!

## 🎯 Fitur yang Telah Dibuat

### 1. Database Schema

- ✅ Model User dengan field lengkap:
  - Basic info: email, name, password, role
  - Data anggota: NIM, phone, avatar, divisi, jabatan, angkatan
  - Status: ACTIVE, INACTIVE, ALUMNI
- ✅ Enum Role: ADMIN, CORE, MEMBER
- ✅ Unique constraints untuk email dan NIM

### 2. Authentication System

- ✅ JWT-based authentication
- ✅ Role included in token
- ✅ Cookie-based session management
- ✅ Login/Register/Logout endpoints

### 3. Role-Based Authorization

- ✅ Middleware untuk validasi role
- ✅ Permission logic:
  - **ADMIN**: Full access
  - **CORE**: Manage members, create users
  - **MEMBER**: Read-only access

### 4. User Management API

- ✅ GET `/api/users` - List users dengan filtering
- ✅ GET `/api/users/:id` - Get user detail
- ✅ POST `/api/users` - Create user (Admin/Core only)
- ✅ PUT `/api/users/:id` - Update user
- ✅ DELETE `/api/users/:id` - Delete user (Admin only)

### 5. Seed Data

- ✅ 1 Admin
- ✅ 6 Core members (Ketua, Sekretaris, Bendahara, 3 Ketua Divisi)
- ✅ 6 Members dari berbagai divisi (Programming, Design, Multimedia)

## 📁 File Structure

```
D:\coder\powerspolnep\
├── prisma/
│   ├── schema.prisma          # Database schema dengan User model
│   ├── seed.ts                # Seed data untuk testing
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── auth/          # Auth endpoints (login, register, logout)
│   │       └── users/         # User management endpoints
│   │           ├── route.ts   # GET, POST /api/users
│   │           └── [id]/
│   │               └── route.ts # GET, PUT, DELETE /api/users/:id
│   ├── lib/
│   │   ├── auth.ts           # Auth utilities (hash, verify, JWT)
│   │   ├── db.ts             # Database queries
│   │   └── prisma.ts         # Prisma client
│   ├── types/
│   │   └── auth.ts           # TypeScript types (User, Role, etc)
│   └── middleware.ts         # Role-based authorization middleware
├── API_DOCUMENTATION.md       # Complete API documentation
└── USER_MANAGEMENT_README.md # This file
```

## 🚀 Quick Start

### 1. Setup Database

```bash
# Run migration
npx prisma migrate dev

# Seed sample data
npm run db:seed
```

### 2. Login dengan Sample Users

**Admin:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@powerspolnep.com",
    "password": "password123"
  }'
```

**Core (Ketua):**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ketua@powerspolnep.com",
    "password": "password123"
  }'
```

**Member:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member1@powerspolnep.com",
    "password": "password123"
  }'
```

### 3. Test User Management

**List all users:**

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Filter by divisi:**

```bash
curl "http://localhost:3000/api/users?divisi=Programming" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create new user (Admin/Core only):**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@powerspolnep.com",
    "name": "New User",
    "password": "password123",
    "role": "MEMBER",
    "nim": "2401007",
    "divisi": "Programming",
    "jabatan": "Anggota",
    "angkatan": "2024"
  }'
```

## 🔐 Role Permissions

| Action             | ADMIN | CORE | MEMBER |
| ------------------ | ----- | ---- | ------ |
| Login              | ✅    | ✅   | ✅     |
| View users         | ✅    | ✅   | ✅     |
| Create user        | ✅    | ✅   | ❌     |
| Update any user    | ✅    | ✅   | ❌     |
| Update own profile | ✅    | ✅   | ✅     |
| Change role        | ✅    | ❌   | ❌     |
| Delete user        | ✅    | ❌   | ❌     |

## 📝 Database Schema

```prisma
enum Role {
  ADMIN
  CORE
  MEMBER
}

model User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String
  password    String
  role        Role      @default(MEMBER)

  // Data Anggota POWERS
  nim         String?   @unique
  phone       String?
  avatar      String?
  divisi      String?   // Programming, Design, Multimedia
  jabatan     String?   // Ketua Umum, Ketua Divisi, Anggota, dll
  angkatan    String?   // 2023, 2024, dll
  status      String    @default("ACTIVE") // ACTIVE, INACTIVE, ALUMNI

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("users")
}
```

## 🔄 Migration History

```bash
# Latest migration
20251029083755_add_user_role_management

Changes:
- Drop table `committees`
- Create enum `Role` (ADMIN, CORE, MEMBER)
- Create table `users` with full member data
```

## 🧪 Sample Data (Seeded)

### Admin (1)

- admin@powerspolnep.com

### Core (6)

- ketua@powerspolnep.com - Ketua Umum
- sekretaris@powerspolnep.com - Sekretaris
- bendahara@powerspolnep.com - Bendahara
- kadiv.programming@powerspolnep.com - Ketua Divisi Programming
- kadiv.design@powerspolnep.com - Ketua Divisi Design
- kadiv.multimedia@powerspolnep.com - Ketua Divisi Multimedia

### Members (6)

- member1@powerspolnep.com - Programming
- member2@powerspolnep.com - Programming
- member3@powerspolnep.com - Design
- member4@powerspolnep.com - Design
- member5@powerspolnep.com - Multimedia
- member6@powerspolnep.com - Multimedia

**Default password:** `password123`

## 📚 Documentation

Lihat **API_DOCUMENTATION.md** untuk:

- Complete API reference
- Request/Response examples
- Error handling
- Next steps & roadmap

## 🎯 Next Steps

Setelah user management selesai, langkah selanjutnya:

1. **Sistem Pembelajaran (Priority High)**
   - Course & Lesson model
   - Quiz & Questions
   - Gamification (points, badges)
   - Progress tracking

2. **Event Management**
   - Event model dengan QR/Barcode
   - Registration system
   - Attendance tracking

3. **Dashboard & Analytics**
   - User statistics
   - Learning metrics
   - Event reports

4. **Frontend Development**
   - User list page
   - User profile page
   - User management (CRUD) interface
   - Role-based UI

## 💡 Tips

1. **Testing dengan Postman/Thunder Client:**
   - Import collection dari API_DOCUMENTATION.md
   - Set environment variable untuk token

2. **Prisma Studio:**

   ```bash
   npx prisma studio
   ```

   GUI untuk explore database

3. **View Database:**

   ```bash
   # Connect to PostgreSQL
   psql -U postgres -d powerspolnep

   # List users
   SELECT email, name, role, divisi FROM users;
   ```

## 🐛 Troubleshooting

**Error: P2002 (Unique constraint failed)**

- Email atau NIM sudah digunakan
- Cek dengan query: `SELECT * FROM users WHERE email = '...'`

**Error: 403 Forbidden**

- Role tidak memiliki permission
- Cek token dan role di JWT

**Error: 401 Unauthorized**

- Token expired atau invalid
- Login ulang untuk get new token

---

## ✨ Summary

Sistem user management dengan role-based access control telah selesai diimplementasikan dengan:

- ✅ 3 role levels (ADMIN, CORE, MEMBER)
- ✅ Complete CRUD operations
- ✅ Role-based authorization
- ✅ Proper validation & error handling
- ✅ Sample data untuk testing
- ✅ Complete documentation

Ready untuk development fitur selanjutnya! 🚀

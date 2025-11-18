# API Documentation - POWERS POLNEP

## Authentication System

### Roles

- **ADMIN**: Full access, dapat manage semua user dan settings
- **CORE**: Dapat manage member, menambahkan member, manage event
- **MEMBER**: Hanya dapat akses fitur pembelajaran dan lihat event

---

## Auth Endpoints

### Login

**POST** `/api/auth/login`

Request Body:

```json
{
  "email": "admin@powerspolnep.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "clxxx...",
    "email": "admin@powerspolnep.com",
    "name": "Admin POWERS",
    "role": "ADMIN",
    "nim": null,
    "phone": "081234567890",
    "avatar": null,
    "divisi": null,
    "jabatan": "Administrator",
    "angkatan": null,
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Register

**POST** `/api/auth/register`

Request Body:

```json
{
  "email": "newuser@powerspolnep.com",
  "password": "password123",
  "name": "New User"
}
```

Response:

```json
{
  "success": true,
  "message": "Committee registered successfully",
  "user": {
    "id": "clxxx...",
    "email": "newuser@powerspolnep.com",
    "name": "New User",
    "role": "MEMBER",
    ...
  }
}
```

### Logout

**POST** `/api/auth/logout`

Response:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Management Endpoints

### Get All Users

**GET** `/api/users`

Query Parameters:

- `role` (optional): Filter by role (ADMIN, CORE, MEMBER)
- `divisi` (optional): Filter by divisi (Programming, Design, Multimedia)
- `status` (optional): Filter by status (ACTIVE, INACTIVE, ALUMNI)

Headers:

```
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "email": "admin@powerspolnep.com",
      "name": "Admin POWERS",
      "role": "ADMIN",
      "nim": null,
      "phone": "081234567890",
      "avatar": null,
      "divisi": null,
      "jabatan": "Administrator",
      "angkatan": null,
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 13
}
```

### Get User by ID

**GET** `/api/users/:id`

Headers:

```
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "ketua@powerspolnep.com",
    "name": "Ahmad Fauzi",
    "role": "CORE",
    "nim": "2301001",
    "phone": "081234567891",
    "avatar": null,
    "divisi": null,
    "jabatan": "Ketua Umum",
    "angkatan": "2023",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create User

**POST** `/api/users`

**Permission**: ADMIN or CORE only

Headers:

```
Authorization: Bearer <token>
```

Request Body:

```json
{
  "email": "newmember@powerspolnep.com",
  "name": "New Member",
  "password": "password123",
  "role": "MEMBER",
  "nim": "2401007",
  "phone": "081234567903",
  "avatar": null,
  "divisi": "Programming",
  "jabatan": "Anggota",
  "angkatan": "2024",
  "status": "ACTIVE"
}
```

Response:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "clxxx...",
    "email": "newmember@powerspolnep.com",
    "name": "New Member",
    ...
  }
}
```

### Update User

**PUT** `/api/users/:id`

**Permission**:

- ADMIN and CORE can update any user
- Users can update themselves

Headers:

```
Authorization: Bearer <token>
```

Request Body (semua field optional):

```json
{
  "name": "Updated Name",
  "phone": "081234567999",
  "divisi": "Design",
  "jabatan": "Ketua Divisi"
}
```

**Note**:

- Only ADMIN can change `role`
- Email and NIM must be unique

Response:

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "clxxx...",
    "email": "user@powerspolnep.com",
    "name": "Updated Name",
    ...
  }
}
```

### Delete User

**DELETE** `/api/users/:id`

**Permission**: ADMIN only

Headers:

```
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Sample Users (Seeded Data)

Default password untuk semua user: `password123`

### Admin

- Email: `admin@powerspolnep.com`
- Role: ADMIN
- Jabatan: Administrator

### Core Team

1. **Ketua Umum**
   - Email: `ketua@powerspolnep.com`
   - NIM: 2301001
2. **Sekretaris**
   - Email: `sekretaris@powerspolnep.com`
   - NIM: 2301002

3. **Bendahara**
   - Email: `bendahara@powerspolnep.com`
   - NIM: 2301003

4. **Ketua Divisi Programming**
   - Email: `kadiv.programming@powerspolnep.com`
   - NIM: 2301004

5. **Ketua Divisi Design**
   - Email: `kadiv.design@powerspolnep.com`
   - NIM: 2301005

6. **Ketua Divisi Multimedia**
   - Email: `kadiv.multimedia@powerspolnep.com`
   - NIM: 2301006

### Members

- `member1@powerspolnep.com` - Divisi Programming
- `member2@powerspolnep.com` - Divisi Programming
- `member3@powerspolnep.com` - Divisi Design
- `member4@powerspolnep.com` - Divisi Design
- `member5@powerspolnep.com` - Divisi Multimedia
- `member6@powerspolnep.com` - Divisi Multimedia

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Email, name, and password are required"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Unauthorized: Admin or Core access required"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "User not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Role Permissions Summary

| Action             | ADMIN | CORE | MEMBER |
| ------------------ | ----- | ---- | ------ |
| Login              | ✅    | ✅   | ✅     |
| View all users     | ✅    | ✅   | ✅     |
| View user detail   | ✅    | ✅   | ✅     |
| Create user        | ✅    | ✅   | ❌     |
| Update any user    | ✅    | ✅   | ❌     |
| Update own profile | ✅    | ✅   | ✅     |
| Change user role   | ✅    | ❌   | ❌     |
| Delete user        | ✅    | ❌   | ❌     |

---

## Next Steps

### Fitur yang perlu dikembangkan selanjutnya:

1. **Sistem Pembelajaran**
   - Model untuk Course, Lesson, Quiz
   - Gamifikasi (points, badges, leaderboard)
   - Progress tracking

2. **Manajemen Event**
   - Model untuk Event, EventRegistration
   - Barcode generation untuk absensi
   - QR code scanner integration

3. **Dashboard Analytics**
   - User statistics
   - Learning progress
   - Event attendance reports

4. **File Upload**
   - Avatar upload
   - Course materials
   - Event media

5. **Notifications**
   - Email notifications
   - In-app notifications
   - Push notifications (PWA)

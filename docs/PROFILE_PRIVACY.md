# Profile Privacy System

## 📋 Overview

Sistem profile POWERS mendukung dua jenis tampilan:

1. **Private Profile** (`/dashboard/profile`) - Profile sendiri dengan QR code
2. **Public Profile** (`/dashboard/profile/[userId]`) - Profile orang lain tanpa QR code

## 🔒 Privacy Rules

### Private Profile (Own Profile)

**URL:** `/dashboard/profile`

**Accessible by:** User yang login (diri sendiri)

**Displayed Information:**

- ✅ Full profile information
- ✅ **QR Code Card** (dengan download & copy)
- ✅ Member code
- ✅ Email
- ✅ Phone (jika ada)
- ✅ All personal details
- ✅ Edit profile button
- ✅ Quick actions
- ✅ QR Code information & tips

### Public Profile (Other User's Profile)

**URL:** `/dashboard/profile/[userId]`

**Accessible by:** Semua authenticated users

**Displayed Information:**

- ✅ Basic profile information
- ✅ Name, avatar, role, status
- ✅ NIM, angkatan
- ✅ Powers Division
- ✅ Position
- ✅ Member code (visible, but no QR)
- ✅ Join date
- ✅ Gamification stats (public)
- ❌ **NO QR Code**
- ❌ NO personal QR code download
- ❌ NO edit profile button
- ❌ NO quick actions for other user

## 🎯 Use Cases

### Viewing Own Profile

```
1. User clicks "Profile" in sidebar
2. Navigate to /dashboard/profile
3. See full profile with QR code
4. Can download QR code
5. Can edit profile
```

### Viewing Other User's Profile

```
1. User clicks on member name (from member list, etc.)
2. Navigate to /dashboard/profile/[userId]
3. See public profile information
4. NO QR code displayed
5. Cannot edit profile
6. See "Back" button to return
```

## 📐 UI Differences

### Private Profile Components:

```
┌──────────────────────────────┐
│ Header: "Profil Saya"        │
│ - Edit Profile button        │
├──────────────────────────────┤
│ Profile Information Card     │
│ - Full details               │
├──────────────────────────────┤
│ QR Code Card ✅              │
│ - Toggle show/hide           │
│ - QR code display            │
│ - Download button            │
│ - Copy code button           │
├──────────────────────────────┤
│ Gamification Preview         │
├──────────────────────────────┤
│ Sidebar:                     │
│ - Quick Actions              │
│ - Member Statistics          │
│ - QR Code Info & Tips        │
└──────────────────────────────┘
```

### Public Profile Components:

```
┌──────────────────────────────┐
│ Header: "Profil Anggota"     │
│ - Back button                │
├──────────────────────────────┤
│ Profile Information Card     │
│ - Public details only        │
├──────────────────────────────┤
│ ❌ NO QR Code Card           │
├──────────────────────────────┤
│ Gamification Preview         │
├──────────────────────────────┤
│ Sidebar:                     │
│ - Member Statistics          │
│ - Info: "Profil Publik"      │
└──────────────────────────────┘
```

## 🔐 Security & Privacy

### What's Protected:

- ✅ QR Code image (hanya pemilik)
- ✅ QR Code download feature
- ✅ Member code actions (copy)
- ✅ Edit profile capability
- ✅ Sensitive personal settings

### What's Public:

- ✅ Basic profile info (name, role, status)
- ✅ Member code text (visible tapi tidak bisa generate QR)
- ✅ Division & position
- ✅ NIM & angkatan
- ✅ Join date
- ✅ Public gamification stats

### Why Member Code is Visible but QR is Not:

- Member code text bersifat **semi-public** untuk identifikasi
- QR code adalah **private** karena untuk scan attendance
- Admin bisa validasi member code secara manual
- Tapi hanya user sendiri yang bisa punya QR code fisik

## 🛠️ Implementation

### Route Structure:

```
/dashboard/profile/
├── page.tsx          → Own profile (with QR code)
└── [userId]/
    └── page.tsx      → Public profile (no QR code)
```

### API Endpoints Used:

**Private Profile:**

```typescript
GET /api/auth/me
- Returns full user data including sensitive info
- Used for own profile page
```

**Public Profile:**

```typescript
GET /api/users/[userId]
- Returns public user data
- Used for viewing other users
```

### Component Reusability:

- Both pages share similar UI components
- MemberQRCode component only imported di private profile
- Public profile intentionally omits QR code imports

## 📱 Navigation Flow

### To Own Profile:

1. Click "Profile" in sidebar → `/dashboard/profile`
2. Click user card at bottom of sidebar → `/dashboard/profile`

### To Other User's Profile:

1. From member list: Click user name → `/dashboard/profile/[userId]`
2. From event participants: Click participant → `/dashboard/profile/[userId]`
3. From division members: Click member → `/dashboard/profile/[userId]`

### Return from Public Profile:

- "Kembali" button uses `router.back()`
- Returns to previous page

## 🎨 Visual Indicators

### Private Profile:

- Title: "Profil Saya"
- Has QR Code section with toggle
- Edit button visible
- Quick actions available

### Public Profile:

- Title: "Profil Anggota"
- Back button in header
- Info card: "Anda sedang melihat profil publik..."
- No edit capabilities

## 🔄 Future Enhancements

Possible improvements:

- [ ] Privacy settings per user (hide email, phone, etc.)
- [ ] Public profile sharing link
- [ ] Profile visibility toggle (public/private/friends)
- [ ] Activity feed on public profile
- [ ] Endorsements/recommendations from team
- [ ] Public achievements showcase

## ✅ Best Practices

### When Linking to Profiles:

```tsx
// Link to own profile
<Link href="/dashboard/profile">My Profile</Link>

// Link to other user's profile
<Link href={`/dashboard/profile/${user.id}`}>
  {user.name}
</Link>
```

### Checking if Viewing Own Profile:

```typescript
const currentUserId = getCurrentUserId(); // from auth
const isOwnProfile = userId === currentUserId;

// Then conditionally render
{isOwnProfile && <MemberQRCode />}
```

## 📊 Privacy Matrix

| Feature              | Own Profile | Public Profile |
| -------------------- | ----------- | -------------- |
| Full Name            | ✅          | ✅             |
| Email                | ✅          | ✅             |
| NIM                  | ✅          | ✅             |
| Member Code Text     | ✅          | ✅             |
| **QR Code Image**    | ✅          | ❌             |
| **QR Code Download** | ✅          | ❌             |
| Phone                | ✅          | ❌             |
| Edit Button          | ✅          | ❌             |
| Quick Actions        | ✅          | ❌             |
| Division             | ✅          | ✅             |
| Position             | ✅          | ✅             |
| Stats                | ✅          | ✅             |

---

**Status**: ✅ Implemented  
**Last Updated**: 2025-01-07  
**Version**: 1.0

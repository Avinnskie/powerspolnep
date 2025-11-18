# Panduan Mengambil Informasi User yang Login

## Cara Mengambil Username dari Token JWT

Untuk mengambil informasi user yang sedang login, Anda perlu decode token JWT yang tersimpan di localStorage.

### 1. Setup State dan useEffect

```typescript
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/types/auth";

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export default function YourComponent() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Decode JWT token
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );

      const decoded = JSON.parse(jsonPayload);

      // Set user info
      setCurrentUser({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      });
    } catch (error) {
      console.error("Token decode error:", error);
      router.push("/login");
    }
  }, [router]);

  return (
    <div>
      {currentUser && (
        <div>
          <h1>Welcome, {currentUser.name}!</h1>
          <p>Email: {currentUser.email}</p>
          <p>Role: {currentUser.role}</p>
        </div>
      )}
    </div>
  );
}
```

### 2. Struktur Token JWT

Token JWT yang disimpan di localStorage memiliki struktur:

```
header.payload.signature
```

Yang kita decode adalah bagian **payload** yang berisi:

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "ADMIN" | "CORE" | "MEMBER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 3. Contoh Implementasi di Component

#### Menampilkan Username di Header

```typescript
{currentUser && (
  <header>
    <h1>Welcome back, {currentUser.name}!</h1>
  </header>
)}
```

#### Conditional Rendering Berdasarkan Role

```typescript
{currentUser?.role === "ADMIN" && (
  <button>Admin Only Action</button>
)}

{(currentUser?.role === "ADMIN" || currentUser?.role === "CORE") && (
  <button>Edit Member</button>
)}
```

#### Menampilkan Avatar dengan Initial

```typescript
<div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
  <span className="text-white font-bold">
    {currentUser?.name.charAt(0).toUpperCase()}
  </span>
</div>
```

### 4. Best Practices

1. **Selalu cek token existence** sebelum decode
2. **Gunakan try-catch** untuk handle error saat decode
3. **Redirect ke login** jika token invalid atau tidak ada
4. **Loading state** untuk UX yang lebih baik saat fetch user info
5. **Type safety** dengan TypeScript interface

### 5. Contoh dengan Loading State

```typescript
const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    router.push("/login");
    return;
  }

  try {
    // Decode token logic...
    setCurrentUser(decoded);
  } catch (error) {
    console.error("Error:", error);
    router.push("/login");
  } finally {
    setLoading(false);
  }
}, [router]);

if (loading) {
  return <LoadingSpinner />;
}

return <YourContent user={currentUser} />;
```

### 6. Alternatif: Custom Hook

Buat custom hook untuk reusability:

```typescript
// hooks/useCurrentUser.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/types/auth";

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export function useCurrentUser() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const decoded = JSON.parse(jsonPayload);
      setCurrentUser({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      });
    } catch (error) {
      console.error("Token decode error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { currentUser, loading };
}

// Usage:
function MyComponent() {
  const { currentUser, loading } = useCurrentUser();

  if (loading) return <LoadingSpinner />;

  return <div>Hello, {currentUser?.name}!</div>;
}
```

## Keamanan

⚠️ **Penting**: Token JWT di localStorage bisa diakses oleh JavaScript, jadi:

- Jangan simpan data sensitive di payload
- Gunakan HTTPS di production
- Set expiry time yang reasonable (misal 24 jam)
- Implement refresh token untuk session yang lebih panjang

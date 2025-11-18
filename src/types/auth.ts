export type Role = "ADMIN" | "CORE" | "COMMITTEE" | "RANGERS";

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: Role;

  // Data Anggota POWERS
  nim?: string | null;
  memberCode?: string | null;
  phone?: string | null;
  avatar?: string | null;
  position?: string | null; // Posisi/Jabatan (wajib untuk CORE & COMMITTEE)
  powersDivisionId?: string | null;
  angkatan?: string | null;
  status?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Omit<User, "password">;
}

export interface DecodedToken {
  id: string;
  email: string;
  name: string;
  role: Role;
  iat: number;
  exp: number;
}

// For backward compatibility
export type Committee = User;

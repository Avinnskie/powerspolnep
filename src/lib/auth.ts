import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import { User, DecodedToken } from "@/types/auth";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export function generateToken(user: Omit<User, "password">): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  );
}

// For server-side token verification (Node.js)
export function verifyTokenSync(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// For edge runtime (Next.js API routes) - async with jose
export async function verifyToken(request: NextRequest): Promise<{
  userId: string;
  email: string;
  name: string;
  role: string;
} | null> {
  try {
    // Get token from cookie or Authorization header
    const cookieStore = await cookies();
    const token =
      cookieStore.get("auth_token")?.value ||
      extractTokenFromHeader(request.headers.get("Authorization") || undefined);

    if (!token) {
      return null;
    }

    // Verify token with jose (edge-compatible)
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);

    return {
      userId: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export function extractTokenFromHeader(
  authHeader: string | undefined,
): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production",
);

function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes yang tidak perlu authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
    "/",
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Routes yang perlu authentication
  const protectedRoutes = [
    "/dashboard",
    "/users",
    "/api/users",
    "/api/auth/me",
  ];

  // Routes khusus untuk ADMIN dan CORE
  const adminCoreOnlyRoutes = ["/api/users"];

  // Routes khusus untuk ADMIN only
  const adminOnlyRoutes = ["/admin"];

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // Get token from cookie or Authorization header
    const token =
      request.cookies.get("auth_token")?.value ||
      extractTokenFromHeader(request.headers.get("Authorization") || undefined);

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verify token with jose (edge-compatible)
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = payload.role as string;

      // Check role-based access
      if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
        if (userRole !== "ADMIN") {
          return NextResponse.json(
            { error: "Unauthorized: Admin access required" },
            { status: 403 },
          );
        }
      }

      if (adminCoreOnlyRoutes.some((route) => pathname.startsWith(route))) {
        const isAdminOrCore = userRole === "ADMIN" || userRole === "CORE";

        if (!isAdminOrCore) {
          // Allow GET requests for all authenticated users
          if (request.method === "GET") {
            // GET is allowed for all authenticated users
          } else {
            // Allow change-password for all authenticated users
            if (pathname === "/api/users/change-password") {
              // Allow all authenticated users to change their password
            } else {
              // For non-GET requests, check if user is updating themselves
              // Pattern: /api/users/[userId]
              const userIdMatch = pathname.match(/^\/api\/users\/([^\/]+)$/);
              const targetUserId = userIdMatch ? userIdMatch[1] : null;
              const currentUserId = payload.id as string;

              // Allow if user is updating their own profile
              const isSelfUpdate =
                targetUserId && targetUserId === currentUserId;

              if (!isSelfUpdate) {
                return NextResponse.json(
                  { error: "Unauthorized: Admin or Core access required" },
                  { status: 403 },
                );
              }
            }
          }
        }
      }

      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.id as string);
      requestHeaders.set("x-user-email", payload.email as string);
      requestHeaders.set("x-user-name", payload.name as string);
      requestHeaders.set("x-user-role", userRole);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error("Token verification error:", error);
      // Clear invalid token
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("auth_token", "", { maxAge: 0 });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};

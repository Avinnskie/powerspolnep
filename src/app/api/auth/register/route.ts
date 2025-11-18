import { NextRequest, NextResponse } from "next/server";
import { createCommittee } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { AuthResponse, Role } from "@/types/auth";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<AuthResponse>> {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password, and name are required",
        },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 },
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new committee
    const committee = await createCommittee({
      id: "", // Prisma will generate CUID automatically
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      role: "RANGERS",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Committee registered successfully",
        user: {
          id: committee.id,
          email: committee.email,
          name: committee.name,
          role: committee.role,
          createdAt: committee.createdAt,
          updatedAt: committee.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);

    if (error instanceof Error && error.message === "Email already exists") {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCommitteeByEmail } from "@/lib/db";
import { verifyPassword, generateToken } from "@/lib/auth";
import { LoginRequest, AuthResponse } from "@/types/auth";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<AuthResponse>> {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 },
      );
    }

    const committee = await getCommitteeByEmail(email);
    if (!committee) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    if (
      !committee.password ||
      !(await verifyPassword(password, committee.password))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    const token = generateToken({
      id: committee.id,
      email: committee.email,
      name: committee.name,
      role: committee.role,
      nim: committee.nim,
      phone: committee.phone,
      avatar: committee.avatar,
      powersDivisionId: committee.powersDivisionId,
      position: committee.position,
      angkatan: committee.angkatan,
      status: committee.status,
      createdAt: committee.createdAt,
      updatedAt: committee.updatedAt,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: committee.id,
          email: committee.email,
          name: committee.name,
          role: committee.role,
          nim: committee.nim,
          phone: committee.phone,
          avatar: committee.avatar,
          powersDivisionId: committee.powersDivisionId,
          position: committee.position,
          angkatan: committee.angkatan,
          status: committee.status,
          createdAt: committee.createdAt,
          updatedAt: committee.updatedAt,
        },
      },
      { status: 200 },
    );

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

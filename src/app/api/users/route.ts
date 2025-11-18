import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { Role } from "@/types/auth";
import { Role as PrismaRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const powersDivisionId = searchParams.get("powersDivisionId");
    const status = searchParams.get("status");

    const where: {
      role?: PrismaRole;
      powersDivisionId?: string;
      status?: string;
    } = {};
    if (role) where.role = role as PrismaRole;
    if (powersDivisionId) where.powersDivisionId = powersDivisionId;
    if (status) where.status = status;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nim: true,
        phone: true,
        avatar: true,
        position: true,
        angkatan: true,
        status: true,
        powersDivision: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "ADMIN" && userRole !== "CORE") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      email,
      name,
      password,
      role,
      nim,
      phone,
      avatar,
      position,
      powersDivisionId,
      angkatan,
      status,
    } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, message: "Email, name, and password are required" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 },
      );
    }

    if (nim) {
      const existingNim = await prisma.user.findUnique({
        where: { nim },
      });

      if (existingNim) {
        return NextResponse.json(
          { success: false, message: "NIM already exists" },
          { status: 400 },
        );
      }
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || "RANGERS",
        nim,
        phone,
        avatar,
        position,
        powersDivisionId: powersDivisionId || null,
        angkatan,
        status: status || "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nim: true,
        phone: true,
        avatar: true,
        position: true,
        angkatan: true,
        status: true,
        powersDivision: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 },
    );
  }
}

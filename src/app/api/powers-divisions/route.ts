import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// GET - List all powers divisions
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "Token tidak ditemukan" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const divisions = await prisma.powersDivision.findMany({
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            status: true,
          },
          where: {
            status: "ACTIVE",
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      message: "Divisi berhasil diambil",
      data: divisions,
    });
  } catch (error) {
    console.error("Error fetching divisions:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data divisi" },
      { status: 500 },
    );
  }
}

// POST - Create new powers division (Admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "Token tidak ditemukan" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Akses ditolak. Hanya admin yang dapat membuat divisi" },
        { status: 403 },
      );
    }

    const { name, description, headId } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: "Nama divisi harus diisi" },
        { status: 400 },
      );
    }

    // Check if division name already exists
    const existingDivision = await prisma.powersDivision.findUnique({
      where: { name },
    });

    if (existingDivision) {
      return NextResponse.json(
        { message: "Nama divisi sudah digunakan" },
        { status: 400 },
      );
    }

    // If headId provided, check if user exists and is not already a head
    if (headId) {
      const user = await prisma.user.findUnique({
        where: { id: headId },
      });

      if (!user) {
        return NextResponse.json(
          { message: "User tidak ditemukan" },
          { status: 400 },
        );
      }

      const existingHead = await prisma.powersDivision.findFirst({
        where: { headId },
      });

      if (existingHead) {
        return NextResponse.json(
          { message: "User sudah menjadi kepala divisi lain" },
          { status: 400 },
        );
      }
    }

    const division = await prisma.powersDivision.create({
      data: {
        name,
        description,
        headId,
      },
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Divisi berhasil dibuat",
        data: division,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating division:", error);
    return NextResponse.json(
      { message: "Gagal membuat divisi" },
      { status: 500 },
    );
  }
}

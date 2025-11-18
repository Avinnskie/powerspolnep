import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// POST - Add member to division (Admin and Core)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "Token tidak ditemukan" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.role !== "ADMIN" && decoded.role !== "CORE") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User ID harus diisi" },
        { status: 400 },
      );
    }

    // Check if division exists
    const division = await prisma.powersDivision.findUnique({
      where: { id },
    });

    if (!division) {
      return NextResponse.json(
        { message: "Divisi tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if user is already in a division
    if (user.powersDivisionId) {
      return NextResponse.json(
        {
          message: "User sudah tergabung dalam divisi lain",
        },
        { status: 400 },
      );
    }

    // Add user to division
    await prisma.user.update({
      where: { id: userId },
      data: {
        powersDivisionId: id,
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        powersDivision: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Anggota berhasil ditambahkan ke divisi",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error adding member to division:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan anggota ke divisi" },
      { status: 500 },
    );
  }
}

// DELETE - Remove member from division (Admin and Core)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "Token tidak ditemukan" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.role !== "ADMIN" && decoded.role !== "CORE") {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User ID harus diisi" },
        { status: 400 },
      );
    }

    // Check if division exists
    const division = await prisma.powersDivision.findUnique({
      where: { id },
    });

    if (!division) {
      return NextResponse.json(
        { message: "Divisi tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if user exists and is in this division
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    if (user.powersDivisionId !== id) {
      return NextResponse.json(
        {
          message: "User tidak tergabung dalam divisi ini",
        },
        { status: 400 },
      );
    }

    // Check if user is the head of the division
    if (division.headId === userId) {
      return NextResponse.json(
        {
          message:
            "Tidak dapat mengeluarkan kepala divisi. Ganti kepala divisi terlebih dahulu.",
        },
        { status: 400 },
      );
    }

    // Remove user from division
    await prisma.user.update({
      where: { id: userId },
      data: {
        powersDivisionId: null,
      },
    });

    return NextResponse.json({
      message: "Anggota berhasil dikeluarkan dari divisi",
    });
  } catch (error) {
    console.error("Error removing member from division:", error);
    return NextResponse.json(
      { message: "Gagal mengeluarkan anggota dari divisi" },
      { status: 500 },
    );
  }
}

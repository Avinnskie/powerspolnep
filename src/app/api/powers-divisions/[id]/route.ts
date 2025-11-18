import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// GET - Get specific powers division
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { message: "Token tidak ditemukan" },
        { status: 401 },
      );
    }

    jwt.verify(token, process.env.JWT_SECRET!);

    const { id } = await params;
    const division = await prisma.powersDivision.findUnique({
      where: { id },
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
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
            position: true,
            nim: true,
            phone: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!division) {
      return NextResponse.json(
        { message: "Divisi tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Divisi berhasil diambil",
      data: division,
    });
  } catch (error) {
    console.error("Error fetching division:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data divisi" },
      { status: 500 },
    );
  }
}

// PUT - Update powers division (Admin and Core)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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

    const { name, description, headId } = await request.json();
    const { id } = await params;

    // Check if division exists
    const existingDivision = await prisma.powersDivision.findUnique({
      where: { id },
    });

    if (!existingDivision) {
      return NextResponse.json(
        { message: "Divisi tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if name is already used by another division
    if (name && name !== existingDivision.name) {
      const duplicateName = await prisma.powersDivision.findFirst({
        where: {
          name,
          id: { not: id },
        },
      });

      if (duplicateName) {
        return NextResponse.json(
          { message: "Nama divisi sudah digunakan" },
          { status: 400 },
        );
      }
    }

    // If headId provided, check if user exists and is not already a head
    if (headId && headId !== existingDivision.headId) {
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
        where: {
          headId,
          id: { not: id },
        },
      });

      if (existingHead) {
        return NextResponse.json(
          { message: "User sudah menjadi kepala divisi lain" },
          { status: 400 },
        );
      }
    }

    const updatedDivision = await prisma.powersDivision.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(headId !== undefined && { headId }),
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

    return NextResponse.json({
      message: "Divisi berhasil diperbarui",
      data: updatedDivision,
    });
  } catch (error) {
    console.error("Error updating division:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui divisi" },
      { status: 500 },
    );
  }
}

// DELETE - Delete powers division (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
        { message: "Akses ditolak. Hanya admin yang dapat menghapus divisi" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Check if division exists
    const existingDivision = await prisma.powersDivision.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!existingDivision) {
      return NextResponse.json(
        { message: "Divisi tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if division has members
    if (existingDivision._count.members > 0) {
      return NextResponse.json(
        {
          message:
            "Tidak dapat menghapus divisi yang memiliki anggota. Pindahkan anggota terlebih dahulu.",
        },
        { status: 400 },
      );
    }

    await prisma.powersDivision.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Divisi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting division:", error);
    return NextResponse.json(
      { message: "Gagal menghapus divisi" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { generateUniqueMemberCode } from "@/lib/member-code";
import { verifyToken } from "@/lib/auth";

// GET /api/users/qrcode - Get QR code untuk user yang sedang login
export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await verifyToken(request);

    if (!tokenPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        nim: true,
        memberCode: true,
        angkatan: true,
        status: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate member code jika belum ada
    let memberCode = user.memberCode;
    if (!memberCode) {
      memberCode = await generateUniqueMemberCode({
        nim: user.nim,
        name: user.name,
        angkatan: user.angkatan,
      });

      // Update user dengan member code baru
      await prisma.user.update({
        where: { id: user.id },
        data: { memberCode },
      });
    }

    // Generate QR Code
    const qrCodeDataURL = await QRCode.toDataURL(memberCode, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return NextResponse.json({
      memberCode,
      qrCodeDataURL,
      user: {
        name: user.name,
        email: user.email,
        nim: user.nim,
        angkatan: user.angkatan,
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/users/qrcode - Generate QR code untuk user tertentu (admin only)
export async function POST(request: NextRequest) {
  try {
    const tokenPayload = await verifyToken(request);

    if (!tokenPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Get target user data
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        nim: true,
        memberCode: true,
        angkatan: true,
        status: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 },
      );
    }

    // Generate member code jika belum ada
    let memberCode = targetUser.memberCode;
    if (!memberCode) {
      memberCode = await generateUniqueMemberCode({
        nim: targetUser.nim,
        name: targetUser.name,
        angkatan: targetUser.angkatan,
      });

      // Update user dengan member code baru
      await prisma.user.update({
        where: { id: targetUser.id },
        data: { memberCode },
      });
    }

    // Generate QR Code
    const qrCodeDataURL = await QRCode.toDataURL(memberCode, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return NextResponse.json({
      memberCode,
      qrCodeDataURL,
      user: {
        name: targetUser.name,
        email: targetUser.email,
        nim: targetUser.nim,
        angkatan: targetUser.angkatan,
      },
    });
  } catch (error) {
    console.error("Error generating QR code for user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

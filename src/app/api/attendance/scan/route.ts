import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// POST /api/attendance/scan
// Body: { code: string, eventId: string }
export async function POST(request: NextRequest) {
  try {
    const tokenPayload = await verifyToken(request);

    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Check if user is admin or core (yang bisa melakukan scan)
    const currentUser = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      select: {
        role: true,
        name: true,
      },
    });

    if (!currentUser || !["ADMIN", "CORE"].includes(currentUser.role)) {
      return NextResponse.json(
        { success: false, message: "Admin atau Core access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { code, eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "eventId is required" },
        { status: 400 },
      );
    }

    // Validasi code (member code) wajib ada
    if (!code) {
      return NextResponse.json(
        { success: false, message: "code is required" },
        { status: 400 },
      );
    }

    // Find user by member code
    const targetUser = await prisma.user.findUnique({
      where: { memberCode: code.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        nim: true,
        memberCode: true,
        role: true,
        status: true,
        powersDivision: {
          select: { name: true },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: `Anggota tidak ditemukan dengan kode: ${code}`,
        },
        { status: 404 },
      );
    }

    if (targetUser.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: `Anggota tidak aktif: ${targetUser.name}` },
        { status: 400 },
      );
    }

    const userId = targetUser.id;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        sessions: {
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event tidak ditemukan" },
        { status: 404 },
      );
    }

    // Get or create default session for event
    let session = event.sessions[0];

    if (!session) {
      // Create default session if none exists
      session = await prisma.eventSession.create({
        data: {
          eventId: eventId,
          title: `Absensi ${event.name}`,
          description: "Session absensi default",
        },
      });
    }

    // Check if already attended any session in this event
    const existingAttendance = await prisma.sessionAttendance.findFirst({
      where: {
        userId: userId,
        session: {
          eventId: eventId,
        },
      },
      include: {
        session: {
          select: {
            title: true,
            event: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json({
        success: false,
        message: `${targetUser.name} sudah tercatat hadir di event ini`,
        data: {
          attendance: {
            checkInAt: existingAttendance.checkInAt,
            status: existingAttendance.status,
          },
          user: {
            name: targetUser.name,
            memberCode: targetUser.memberCode,
            nim: targetUser.nim,
            role: targetUser.role,
            division: targetUser.powersDivision?.name,
          },
          event: {
            name: event.name,
          },
        },
      });
    }

    // Create attendance record
    const attendance = await prisma.sessionAttendance.create({
      data: {
        sessionId: session.id,
        userId: userId,
        checkInAt: new Date(),
        status: "PRESENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: `${targetUser.name} berhasil diabsen masuk`,
      data: {
        id: attendance.id,
        userId: userId,
        checkInAt: attendance.checkInAt,
        attendance: {
          checkInAt: attendance.checkInAt,
          status: attendance.status,
        },
        user: {
          name: targetUser.name,
          memberCode: targetUser.memberCode,
          nim: targetUser.nim,
          role: targetUser.role,
          division: targetUser.powersDivision?.name,
        },
        event: {
          name: event.name,
        },
        scannedBy: currentUser.name,
      },
    });
  } catch (error) {
    console.error("Scan attendance error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to scan attendance" },
      { status: 500 },
    );
  }
}

// GET /api/attendance/scan/validate - Validasi member code
export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await verifyToken(request);

    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const memberCode = searchParams.get("memberCode");

    if (!memberCode) {
      return NextResponse.json(
        { success: false, message: "memberCode parameter is required" },
        { status: 400 },
      );
    }

    // Find user berdasarkan member code
    const user = await prisma.user.findUnique({
      where: { memberCode },
      select: {
        id: true,
        name: true,
        email: true,
        nim: true,
        memberCode: true,
        angkatan: true,
        status: true,
        role: true,
        powersDivision: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Member tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        memberCode: user.memberCode,
        nim: user.nim,
        role: user.role,
        division: user.powersDivision?.name,
        angkatan: user.angkatan,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Error validating member code:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

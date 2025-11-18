import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractTokenFromHeader, verifyTokenSync } from "@/lib/auth";
import { generatePassCode } from "@/lib/barcode";

// POST /api/events/[id]/passes/generate
// Body: { userIds?: string[] } - if omitted, generate for all participants
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeader = request.headers.get("Authorization") || "";
    const token = extractTokenFromHeader(authHeader);
    const decoded = token ? verifyTokenSync(token) : null;
    if (!decoded || (decoded.role !== "ADMIN" && decoded.role !== "CORE")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const userIds: string[] | undefined = body.userIds;

    // Get all POWERS members (excluding ADMIN) as participants
    const participants = await prisma.user.findMany({
      where: {
        role: { not: "ADMIN" },
        ...(userIds ? { id: { in: userIds } } : {}),
      },
      select: { id: true },
    });

    if (participants.length === 0) {
      return NextResponse.json(
        { success: false, message: "No POWERS members found" },
        { status: 400 },
      );
    }

    const ops = participants.map(async (p) => {
      const existing = await prisma.attendancePass.findUnique({
        where: { eventId_userId: { eventId: id, userId: p.id } },
      });
      if (existing) return existing;
      const code = generatePassCode(20);
      return prisma.attendancePass.create({
        data: { eventId: id, userId: p.id, code },
      });
    });

    const passes = await Promise.all(ops);
    return NextResponse.json({ success: true, data: passes });
  } catch (error) {
    console.error("Generate passes error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate passes" },
      { status: 500 },
    );
  }
}

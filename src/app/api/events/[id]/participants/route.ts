import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractTokenFromHeader, verifyTokenSync } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const participants = await prisma.eventParticipant.findMany({
      where: { eventId: id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, data: participants });
  } catch (error) {
    console.error("List participants error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to list participants" },
      { status: 500 },
    );
  }
}

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
    const body = await request.json();
    const { userId, role } = body;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 },
      );
    }

    const participant = await prisma.eventParticipant.upsert({
      where: { eventId_userId: { eventId: id, userId } },
      create: { eventId: id, userId, role: role || "COMMITTEE" },
      update: { role: role || "COMMITTEE" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: participant },
      { status: 201 },
    );
  } catch (error) {
    console.error("Add participant error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add participant" },
      { status: 500 },
    );
  }
}

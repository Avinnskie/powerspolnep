import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractTokenFromHeader, verifyTokenSync } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; divisionId: string }> },
) {
  try {
    const { divisionId } = await params;
    const members = await prisma.eventDivisionMember.findMany({
      where: { eventDivisionId: divisionId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error("List division members error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to list division members" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; divisionId: string }> },
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

    const { divisionId } = await params;
    const body = await request.json();
    const { userId, role } = body;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 },
      );
    }

    const member = await prisma.eventDivisionMember.upsert({
      where: {
        eventDivisionId_userId: { eventDivisionId: divisionId, userId },
      },
      create: { eventDivisionId: divisionId, userId, role: role || "MEMBER" },
      update: { role: role || "MEMBER" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    console.error("Add division member error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add division member" },
      { status: 500 },
    );
  }
}

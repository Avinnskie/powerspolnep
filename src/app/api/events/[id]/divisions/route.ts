import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractTokenFromHeader, verifyTokenSync } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const divisions = await prisma.eventDivision.findMany({
      where: { eventId: id },
      include: { head: { select: { id: true, name: true } }, members: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, data: divisions });
  } catch (error) {
    console.error("List divisions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to list divisions" },
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
    const { name, headId } = body;
    if (!name) {
      return NextResponse.json(
        { success: false, message: "name is required" },
        { status: 400 },
      );
    }

    const division = await prisma.eventDivision.create({
      data: { name, eventId: id, headId: headId || null },
      include: { head: { select: { id: true, name: true } } },
    });

    return NextResponse.json(
      { success: true, data: division },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create division error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create division" },
      { status: 500 },
    );
  }
}

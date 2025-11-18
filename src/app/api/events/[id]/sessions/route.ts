import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractTokenFromHeader, verifyTokenSync } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const sessions = await prisma.eventSession.findMany({
      where: { eventId: id },
      orderBy: { startAt: "asc" },
    });
    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error("List sessions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to list sessions" },
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
    const { title, description, location, startAt, endAt } = body;
    if (!title) {
      return NextResponse.json(
        { success: false, message: "title is required" },
        { status: 400 },
      );
    }

    const session = await prisma.eventSession.create({
      data: {
        eventId: id,
        title,
        description,
        location,
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
      },
    });

    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create session" },
      { status: 500 },
    );
  }
}

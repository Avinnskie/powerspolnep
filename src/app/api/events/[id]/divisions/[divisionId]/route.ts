import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractTokenFromHeader, verifyTokenSync } from "@/lib/auth";

export async function DELETE(
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

    // Delete all division members first (cascade delete)
    await prisma.eventDivisionMember.deleteMany({
      where: { eventDivisionId: divisionId },
    });

    // Delete the division
    await prisma.eventDivision.delete({
      where: { id: divisionId },
    });

    return NextResponse.json({
      success: true,
      message: "Division deleted successfully",
    });
  } catch (error) {
    console.error("Delete division error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete division" },
      { status: 500 },
    );
  }
}

export async function PUT(
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
    const { name, headId } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    const division = await prisma.eventDivision.update({
      where: { id: divisionId },
      data: { name, headId: headId || null },
      include: { head: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ success: true, data: division });
  } catch (error) {
    console.error("Update division error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update division" },
      { status: 500 },
    );
  }
}

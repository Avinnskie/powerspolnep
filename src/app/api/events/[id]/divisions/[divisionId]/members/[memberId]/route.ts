import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractTokenFromHeader, verifyTokenSync } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; divisionId: string; memberId: string }> },
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

    const { memberId } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { success: false, message: "Role is required" },
        { status: 400 },
      );
    }

    const member = await prisma.eventDivisionMember.update({
      where: { id: memberId },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error("Update division member error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update division member" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; divisionId: string; memberId: string }> },
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

    const { memberId } = await params;

    await prisma.eventDivisionMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Delete division member error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete division member" },
      { status: 500 },
    );
  }
}

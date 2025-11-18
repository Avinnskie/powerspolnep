import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get event details with divisions and sessions
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        chair: { select: { id: true, name: true, email: true } },
        divisions: {
          include: {
            head: { select: { id: true, name: true, email: true } },
            members: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
        sessions: {
          include: {
            attendances: {
              select: {
                userId: true,
                checkInAt: true,
                status: true,
              },
            },
          },
        },
        passes: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!event)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );

    // Get all attendance records for this event (from all sessions)
    const eventAttendances = event.sessions.flatMap(
      (session) => session.attendances,
    );

    // Get all POWERS members (excluding ADMIN) as participants
    const allMembers = await prisma.user.findMany({
      where: {
        role: { not: "ADMIN" },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        powersDivision: {
          select: { name: true },
        },
      },
    });

    // Create participants array with attendance status
    const participantsWithAttendance = allMembers.map((member) => ({
      id: member.id,
      user: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        powersDivision: member.powersDivision,
      },
      hasAttended: eventAttendances.some(
        (attendance) => attendance.userId === member.id,
      ),
      attendancePass: event.passes.find((pass) => pass.userId === member.id),
    }));

    // Add participants to event data
    const eventWithParticipants = {
      ...event,
      participants: participantsWithAttendance,
    };

    return NextResponse.json({ success: true, data: eventWithParticipants });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { success: false, message: "Failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // You can add token verification here if needed
    const { id } = await params;

    // Delete related data first (cascade delete)
    // Delete attendance passes
    await prisma.attendancePass.deleteMany({ where: { eventId: id } });

    // Delete session attendances
    const sessions = await prisma.eventSession.findMany({
      where: { eventId: id },
    });
    for (const session of sessions) {
      await prisma.sessionAttendance.deleteMany({
        where: { sessionId: session.id },
      });
    }

    // Delete sessions
    await prisma.eventSession.deleteMany({ where: { eventId: id } });

    // Delete division members
    const divisions = await prisma.eventDivision.findMany({
      where: { eventId: id },
    });
    for (const division of divisions) {
      await prisma.eventDivisionMember.deleteMany({
        where: { eventDivisionId: division.id },
      });
    }

    // Delete divisions
    await prisma.eventDivision.deleteMany({ where: { eventId: id } });

    // Delete participants
    await prisma.eventParticipant.deleteMany({ where: { eventId: id } });

    // Finally, delete the event
    await prisma.event.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete event" },
      { status: 500 },
    );
  }
}

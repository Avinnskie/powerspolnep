import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET() {
  try {
    // Get total count of POWERS members (excluding ADMIN)
    const totalMembers = await prisma.user.count({
      where: {
        role: { not: "ADMIN" },
      },
    });

    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        chair: { select: { id: true, name: true, email: true } },
        sessions: {
          select: {
            id: true,
            attendances: {
              select: {
                userId: true,
              },
            },
          },
        },
        _count: {
          select: {
            divisions: true,
            sessions: true,
          },
        },
      },
    });

    // Add total participants count and attendees count to each event
    const eventsWithCounts = events.map((event) => {
      // Get unique user IDs who attended any session in this event
      const attendedUserIds = new Set(
        event.sessions.flatMap((session) =>
          session.attendances.map((attendance) => attendance.userId),
        ),
      );

      return {
        ...event,
        sessions: undefined, // Remove sessions from response to keep it clean
        _count: {
          ...event._count,
          participants: totalMembers,
          attendees: attendedUserIds.size, // Unique count of users who attended
        },
      };
    });

    return NextResponse.json({ success: true, data: eventsWithCounts });
  } catch (error) {
    console.error("Error listing events:", error);
    return NextResponse.json(
      { success: false, message: "Failed to list events" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded || (decoded.role !== "ADMIN" && decoded.role !== "CORE")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, theme, description, chairId, startAt, endAt } = body;
    if (!name || !chairId) {
      return NextResponse.json(
        { success: false, message: "name and chairId are required" },
        { status: 400 },
      );
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let i = 1;
    // ensure unique slug
    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const event = await prisma.event.create({
      data: {
        name,
        theme,
        description,
        slug,
        chairId,
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
      },
      include: { chair: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create event" },
      { status: 500 },
    );
  }
}

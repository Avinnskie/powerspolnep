import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { CreateLessonRequest } from "@/types/learning";

export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("moduleId");

    const where: any = {};

    if (moduleId) {
      where.moduleId = moduleId;
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        module: {
          select: {
            id: true,
            title: true,
          },
        },
        questions: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and core members can create lessons
    const user = await prisma.user.findUnique({
      where: { id: token.userId },
    });

    if (!user || !["ADMIN", "CORE"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: CreateLessonRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.content || !body.moduleId) {
      return NextResponse.json(
        { error: "Missing required fields: title, content, moduleId" },
        { status: 400 },
      );
    }

    // Check if module exists
    const module = await prisma.learningModule.findUnique({
      where: { id: body.moduleId },
    });

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: body.title,
        content: body.content,
        order: body.order,
        moduleId: body.moduleId,
        xpReward: body.xpReward || 20,
      },
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and core members can update lessons
    const user = await prisma.user.findUnique({
      where: { id: token.userId },
    });

    if (!user || !["ADMIN", "CORE"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 },
      );
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ lesson });
  } catch (error: any) {
    console.error("Error updating lesson:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and core members can delete lessons
    const user = await prisma.user.findUnique({
      where: { id: token.userId },
    });

    if (!user || !["ADMIN", "CORE"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 },
      );
    }

    await prisma.lesson.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting lesson:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

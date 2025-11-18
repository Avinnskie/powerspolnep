import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { CreateModuleRequest } from "@/types/learning";

export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const published = searchParams.get("published");

    const where: any = {};

    if (difficulty) {
      where.difficulty = difficulty.toUpperCase();
    }

    if (published !== null) {
      where.isPublished = published === "true";
    }

    const modules = await prisma.learningModule.findMany({
      where,
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: {
            userProgress: {
              where: { userId: token.userId },
            },
            questions: true,
          },
        },
        userProgress: {
          where: { userId: token.userId },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("Error fetching modules:", error);
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

    // Only admins and core members can create modules
    const user = await prisma.user.findUnique({
      where: { id: token.userId },
    });

    if (!user || !["ADMIN", "CORE"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: CreateModuleRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.slug || !body.difficulty) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, difficulty" },
        { status: 400 },
      );
    }

    const module = await prisma.learningModule.create({
      data: {
        title: body.title,
        description: body.description,
        slug: body.slug,
        difficulty: body.difficulty,
        order: body.order,
        thumbnail: body.thumbnail,
        xpReward: body.xpReward || 100,
      },
    });

    return NextResponse.json({ module }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating module:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Module with this slug already exists" },
        { status: 409 },
      );
    }

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

    // Only admins and core members can update modules
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
        { error: "Module ID is required" },
        { status: 400 },
      );
    }

    const module = await prisma.learningModule.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ module });
  } catch (error: any) {
    console.error("Error updating module:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
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

    // Only admins and core members can delete modules
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
        { error: "Module ID is required" },
        { status: 400 },
      );
    }

    await prisma.learningModule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting module:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

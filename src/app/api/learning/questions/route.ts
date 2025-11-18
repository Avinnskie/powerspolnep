import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { CreateQuestionRequest } from "@/types/learning";

export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const type = searchParams.get("type");

    const where: any = {};

    if (lessonId) {
      where.lessonId = lessonId;
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
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

    // Only admins and core members can create questions
    const user = await prisma.user.findUnique({
      where: { id: token.userId },
    });

    if (!user || !["ADMIN", "CORE"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: CreateQuestionRequest = await request.json();

    // Validate required fields
    if (!body.question || !body.correctAnswer || !body.lessonId || !body.type) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: question, correctAnswer, lessonId, type",
        },
        { status: 400 },
      );
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: body.lessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const question = await prisma.question.create({
      data: {
        lessonId: body.lessonId,
        type: body.type,
        question: body.question,
        options: body.options,
        correctAnswer: body.correctAnswer,
        explanation: body.explanation,
        order: body.order,
        points: body.points || 10,
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating question:", error);
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

    // Only admins and core members can update questions
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
        { error: "Question ID is required" },
        { status: 400 },
      );
    }

    const question = await prisma.question.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ question });
  } catch (error: any) {
    console.error("Error updating question:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
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

    // Only admins and core members can delete questions
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
        { error: "Question ID is required" },
        { status: 400 },
      );
    }

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting question:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

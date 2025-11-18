import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { LearningService } from "@/lib/learning";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: lessonId } = await params;
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await LearningService.completeLessonAndEarnXP(
      token.userId,
      lessonId,
    );

    return NextResponse.json({
      message: "Lesson completed successfully",
      ...result,
    });
  } catch (error: any) {
    console.error("Error completing lesson:", error);

    if (error.message === "Lesson not found") {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

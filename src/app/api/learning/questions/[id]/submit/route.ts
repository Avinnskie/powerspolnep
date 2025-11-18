import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { LearningService } from "@/lib/learning";
import { SubmitAnswerRequest } from "@/types/learning";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: questionId } = await params;
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SubmitAnswerRequest = await request.json();

    if (!body.answer) {
      return NextResponse.json(
        { error: "Answer is required" },
        { status: 400 },
      );
    }

    const result = await LearningService.submitQuestionAnswer(
      token.userId,
      questionId,
      body.answer,
      body.timeSpent,
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error submitting answer:", error);

    if (error.message === "Question not found") {
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

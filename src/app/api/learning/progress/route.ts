import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { LearningService } from "@/lib/learning";

export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user progress
    let userProgress = await LearningService.getUserProgress(token.userId);
    if (!userProgress) {
      userProgress = await LearningService.createUserProgress(token.userId);
    }

    // Get module progress
    const moduleProgress = await prisma.userModuleProgress.findMany({
      where: { userId: token.userId },
      include: {
        module: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get lesson progress
    const lessonProgress = await prisma.userLessonProgress.findMany({
      where: { userId: token.userId },
      include: {
        lesson: {
          include: {
            module: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get recent achievements
    const recentAchievements = await prisma.userAchievement.findMany({
      where: { userId: token.userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: "desc" },
      take: 5,
    });

    // Calculate progress to next level
    const nextLevel = await prisma.level.findFirst({
      where: { number: userProgress.level.number + 1 },
    });

    let progressToNextLevel = 100; // Max if at highest level
    if (nextLevel) {
      const currentLevelMinXp = userProgress.level.minXp;
      const nextLevelMinXp = nextLevel.minXp;
      const userXp = userProgress.totalXp;

      const totalXpNeeded = nextLevelMinXp - currentLevelMinXp;
      const userProgressInLevel = userXp - currentLevelMinXp;
      progressToNextLevel = Math.min(
        100,
        (userProgressInLevel / totalXpNeeded) * 100,
      );
    }

    return NextResponse.json({
      userProgress,
      moduleProgress,
      lessonProgress,
      recentAchievements,
      nextLevel,
      progressToNextLevel: Math.round(progressToNextLevel),
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

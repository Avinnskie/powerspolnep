import { prisma } from "@/lib/prisma";
import { Level, Achievement, UserProgress } from "@/types/learning";

export class LearningService {
  // Level and XP Management
  static async calculateLevel(totalXp: number): Promise<Level | null> {
    const level = await prisma.level.findFirst({
      where: {
        minXp: { lte: totalXp },
        OR: [{ maxXp: null }, { maxXp: { gte: totalXp } }],
      },
      orderBy: { number: "desc" },
    });

    return level;
  }

  static async getUserProgress(userId: string): Promise<UserProgress | null> {
    const progress = await prisma.userProgress.findUnique({
      where: { userId },
      include: { level: true },
    });

    return progress;
  }

  static async createUserProgress(userId: string): Promise<UserProgress> {
    // Find the first level (level 1)
    const firstLevel = await prisma.level.findFirst({
      orderBy: { number: "asc" },
    });

    if (!firstLevel) {
      throw new Error(
        "No levels found. Please seed the database with initial levels.",
      );
    }

    const progress = await prisma.userProgress.create({
      data: {
        userId,
        totalXp: 0,
        levelId: firstLevel.id,
        streak: 0,
        lastActiveAt: new Date(),
      },
      include: { level: true },
    });

    return progress;
  }

  static async addXP(
    userId: string,
    xpToAdd: number,
  ): Promise<{
    newProgress: UserProgress;
    levelUp?: {
      newLevel: Level;
      previousLevel: Level;
    };
    achievementsUnlocked?: Achievement[];
  }> {
    // Get or create user progress
    let userProgress = await this.getUserProgress(userId);
    if (!userProgress) {
      userProgress = await this.createUserProgress(userId);
    }

    const previousLevel = userProgress.level;
    const newTotalXp = userProgress.totalXp + xpToAdd;

    // Calculate new level
    const newLevel = await this.calculateLevel(newTotalXp);
    if (!newLevel) {
      throw new Error("Unable to calculate level for XP amount: " + newTotalXp);
    }

    // Update streak if user was active today
    const today = new Date();
    const lastActive = userProgress.lastActiveAt
      ? new Date(userProgress.lastActiveAt)
      : null;
    let newStreak = userProgress.streak;

    if (lastActive) {
      const daysSinceLastActive = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceLastActive === 1) {
        // Consecutive day, increment streak
        newStreak++;
      } else if (daysSinceLastActive > 1) {
        // Streak broken, reset to 1
        newStreak = 1;
      }
      // If daysSinceLastActive === 0, they were already active today, keep current streak
    } else {
      // First time active
      newStreak = 1;
    }

    // Update user progress
    const updatedProgress = await prisma.userProgress.update({
      where: { userId },
      data: {
        totalXp: newTotalXp,
        levelId: newLevel.id,
        streak: newStreak,
        lastActiveAt: today,
      },
      include: { level: true },
    });

    const result: any = {
      newProgress: updatedProgress,
    };

    // Check if user leveled up
    if (newLevel.id !== previousLevel.id) {
      result.levelUp = {
        newLevel,
        previousLevel,
      };
    }

    // Check for new achievements
    const achievementsUnlocked = await this.checkAchievements(
      userId,
      updatedProgress,
    );
    if (achievementsUnlocked.length > 0) {
      result.achievementsUnlocked = achievementsUnlocked;
    }

    return result;
  }

  static async checkAchievements(
    userId: string,
    userProgress: UserProgress,
  ): Promise<Achievement[]> {
    // Get all achievements user doesn't have yet
    const unlockedAchievementIds = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });

    const unlockedIds = unlockedAchievementIds.map((ua) => ua.achievementId);

    const availableAchievements = await prisma.achievement.findMany({
      where: {
        id: { notIn: unlockedIds },
      },
    });

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of availableAchievements) {
      if (
        await this.checkAchievementCriteria(userId, achievement, userProgress)
      ) {
        // Unlock achievement
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });

        newlyUnlocked.push(achievement);

        // Add XP reward for achievement
        if (achievement.xpReward > 0) {
          await prisma.userProgress.update({
            where: { userId },
            data: {
              totalXp: { increment: achievement.xpReward },
            },
          });
        }
      }
    }

    return newlyUnlocked;
  }

  static async checkAchievementCriteria(
    userId: string,
    achievement: Achievement,
    userProgress: UserProgress,
  ): Promise<boolean> {
    const criteria = achievement.criteria as any;

    // Example criteria checking logic
    switch (criteria.type) {
      case "TOTAL_XP":
        return userProgress.totalXp >= criteria.value;

      case "LEVEL_REACHED":
        return userProgress.level.number >= criteria.value;

      case "STREAK_DAYS":
        return userProgress.streak >= criteria.value;

      case "MODULES_COMPLETED":
        const completedModules = await prisma.userModuleProgress.count({
          where: {
            userId,
            isCompleted: true,
          },
        });
        return completedModules >= criteria.value;

      case "QUESTIONS_CORRECT":
        const correctAnswers = await prisma.questionAttempt.count({
          where: {
            userId,
            isCorrect: true,
          },
        });
        return correctAnswers >= criteria.value;

      default:
        return false;
    }
  }

  // Module Progress
  static async updateModuleProgress(
    userId: string,
    moduleId: string,
  ): Promise<void> {
    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      include: {
        userProgress: {
          where: { userId },
        },
      },
    });

    const completedLessons = lessons.filter(
      (lesson) =>
        lesson.userProgress.length > 0 && lesson.userProgress[0].isCompleted,
    );

    const progress =
      lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0;
    const isCompleted = progress === 100;

    // Calculate XP earned from completed lessons
    const xpEarned = completedLessons.reduce((total, lesson) => {
      const userProgress = lesson.userProgress[0];
      return total + (userProgress?.xpEarned || 0);
    }, 0);

    await prisma.userModuleProgress.upsert({
      where: {
        userId_moduleId: { userId, moduleId },
      },
      create: {
        userId,
        moduleId,
        progress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        xpEarned,
      },
      update: {
        progress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        xpEarned,
      },
    });
  }

  // Lesson Completion
  static async completeLessonAndEarnXP(
    userId: string,
    lessonId: string,
  ): Promise<{
    xpEarned: number;
    levelUp?: any;
    achievementsUnlocked?: Achievement[];
  }> {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    // Mark lesson as completed
    await prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      create: {
        userId,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
        xpEarned: lesson.xpReward,
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
        xpEarned: lesson.xpReward,
      },
    });

    // Add XP to user
    const result = await this.addXP(userId, lesson.xpReward);

    // Update module progress
    await this.updateModuleProgress(userId, lesson.moduleId);

    return {
      xpEarned: lesson.xpReward,
      levelUp: result.levelUp,
      achievementsUnlocked: result.achievementsUnlocked,
    };
  }

  // Question Submission
  static async submitQuestionAnswer(
    userId: string,
    questionId: string,
    answer: string,
    timeSpent?: number,
  ): Promise<{
    isCorrect: boolean;
    points: number;
    explanation?: string | null;
    xpEarned: number;
    levelUp?: any;
    achievementsUnlocked?: Achievement[];
  }> {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    const isCorrect =
      answer.toLowerCase().trim() ===
      question.correctAnswer.toLowerCase().trim();
    const points = isCorrect ? question.points : 0;

    // Record the attempt
    await prisma.questionAttempt.create({
      data: {
        userId,
        questionId,
        answer,
        isCorrect,
        points,
        timeSpent,
      },
    });

    let xpEarned = 0;
    let levelUpResult;
    let achievementsUnlocked;

    if (isCorrect) {
      // Award XP for correct answer
      xpEarned = points;
      const result = await this.addXP(userId, xpEarned);
      levelUpResult = result.levelUp;
      achievementsUnlocked = result.achievementsUnlocked;
    }

    return {
      isCorrect,
      points,
      explanation: question.explanation,
      xpEarned,
      levelUp: levelUpResult,
      achievementsUnlocked,
    };
  }
}

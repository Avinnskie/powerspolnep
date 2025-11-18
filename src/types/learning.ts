export interface Level {
  id: string;
  number: number;
  name: string;
  description?: string | null;
  minXp: number;
  maxXp?: number | null;
  color: string;
  icon?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LearningModule {
  id: string;
  title: string;
  description?: string;
  slug: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  order: number;
  isPublished: boolean;
  thumbnail?: string;
  xpReward: number;
  lessons?: Lesson[];
  userProgress?: UserModuleProgress;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  moduleId: string;
  module?: LearningModule;
  xpReward: number;
  questions?: Question[];
  userProgress?: UserLessonProgress;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  lessonId: string;
  lesson?: Lesson;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "MATCHING";
  question: string;
  options?: any; // JSON data for multiple choice questions
  correctAnswer: string;
  explanation?: string;
  order: number;
  points: number;
  attempts?: QuestionAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string | null;
  color: string;
  criteria: any; // JSON data for achievement criteria
  xpReward: number;
  isSecret: boolean;
  userAchievements?: UserAchievement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  id: string;
  userId: string;
  totalXp: number;
  levelId: string;
  level: Level;
  streak: number;
  lastActiveAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserModuleProgress {
  id: string;
  userId: string;
  moduleId: string;
  module?: LearningModule;
  isCompleted: boolean;
  completedAt?: Date;
  progress: number; // 0-100
  xpEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  lesson?: Lesson;
  isCompleted: boolean;
  completedAt?: Date;
  xpEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionAttempt {
  id: string;
  userId: string;
  questionId: string;
  question?: Question;
  answer: string;
  isCorrect: boolean;
  points: number;
  timeSpent?: number; // in seconds
  createdAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: Date;
}

// API Request/Response types
export interface CreateModuleRequest {
  title: string;
  description?: string;
  slug: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  order: number;
  thumbnail?: string;
  xpReward?: number;
}

export interface CreateLessonRequest {
  title: string;
  content: string;
  order: number;
  moduleId: string;
  xpReward?: number;
}

export interface CreateQuestionRequest {
  lessonId: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "MATCHING";
  question: string;
  options?: any;
  correctAnswer: string;
  explanation?: string;
  order: number;
  points?: number;
}

export interface SubmitAnswerRequest {
  questionId: string;
  answer: string;
  timeSpent?: number;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  points: number;
  explanation?: string | null;
  xpEarned: number;
  levelUp?: {
    newLevel: Level;
    previousLevel: Level;
  };
  achievementsUnlocked?: Achievement[];
}

export interface LearningDashboardData {
  userProgress: UserProgress;
  modules: LearningModule[];
  recentAchievements: UserAchievement[];
  streak: number;
  nextLevel?: Level;
  progressToNextLevel: number; // 0-100 percentage
}

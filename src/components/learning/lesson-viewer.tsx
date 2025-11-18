"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lesson, Question, SubmitAnswerResponse } from "@/types/learning";
import { Quiz } from "./quiz";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  Award,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface LessonViewerProps {
  lesson: Lesson;
  onLessonComplete?: (lesson: Lesson) => void;
  onNavigate?: (direction: "prev" | "next") => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  className?: string;
}

export function LessonViewer({
  lesson,
  onLessonComplete,
  onNavigate,
  hasPrev = false,
  hasNext = false,
  className,
}: LessonViewerProps) {
  const [currentView, setCurrentView] = useState<"content" | "quiz">("content");
  const [isCompleting, setIsCompleting] = useState(false);

  const lessonProgress = Array.isArray(lesson.userProgress)
    ? lesson.userProgress[0]
    : lesson.userProgress;
  const isCompleted = lessonProgress?.isCompleted || false;
  const hasQuestions = lesson.questions && lesson.questions.length > 0;

  const handleStartQuiz = () => {
    setCurrentView("quiz");
  };

  const handleQuizComplete = async (results: SubmitAnswerResponse[]) => {
    // Mark lesson as completed
    await handleCompleteLesson();
  };

  const handleCompleteLesson = async () => {
    setIsCompleting(true);
    try {
      const response = await fetch(
        `/api/learning/lessons/${lesson.id}/complete`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to complete lesson");
      }

      const result = await response.json();

      toast.success(`Lesson completed! +${result.xpEarned} XP`);

      if (result.levelUp) {
        toast.success(`Level up! You're now ${result.levelUp.newLevel.name}!`);
      }

      if (
        result.achievementsUnlocked &&
        result.achievementsUnlocked.length > 0
      ) {
        result.achievementsUnlocked.forEach((achievement: any) => {
          toast.success(`Achievement unlocked: ${achievement.name}!`);
        });
      }

      if (onLessonComplete) {
        onLessonComplete(lesson);
      }
    } catch (error) {
      toast.error("Failed to complete lesson");
    } finally {
      setIsCompleting(false);
    }
  };

  const renderContent = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {lesson.title}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">Lesson {lesson.order}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Award className="w-4 h-4" />
                    {lesson.xpReward} XP
                  </div>
                  {isCompleted && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => onNavigate?.("prev")}
            disabled={!hasPrev}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous Lesson
          </Button>

          <div className="flex gap-2">
            {hasQuestions && !isCompleted && (
              <Button onClick={handleStartQuiz}>
                <Play className="w-4 h-4 mr-1" />
                Start Quiz
              </Button>
            )}

            {!hasQuestions && !isCompleted && (
              <Button onClick={handleCompleteLesson} disabled={isCompleting}>
                {isCompleting ? "Completing..." : "Complete Lesson"}
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => onNavigate?.("next")}
            disabled={!hasNext}
          >
            Next Lesson
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!lesson.questions || lesson.questions.length === 0) {
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setCurrentView("content")}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Lesson
          </Button>

          <Badge variant="outline">
            {lesson.questions.length} Question
            {lesson.questions.length > 1 ? "s" : ""}
          </Badge>
        </div>

        <Quiz
          questions={lesson.questions}
          onQuizComplete={handleQuizComplete}
        />
      </div>
    );
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {currentView === "content" && renderContent()}
      {currentView === "quiz" && renderQuiz()}
    </div>
  );
}

interface ModuleLessonNavigatorProps {
  lessons: Lesson[];
  currentLessonId: string;
  onLessonSelect: (lesson: Lesson) => void;
  className?: string;
}

export function ModuleLessonNavigator({
  lessons,
  currentLessonId,
  onLessonSelect,
  className,
}: ModuleLessonNavigatorProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Lessons</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lessons.map((lesson) => {
            const lessonProgress = Array.isArray(lesson.userProgress)
              ? lesson.userProgress[0]
              : lesson.userProgress;
            const isCompleted = lessonProgress?.isCompleted || false;
            const isCurrent = lesson.id === currentLessonId;

            return (
              <button
                key={lesson.id}
                onClick={() => onLessonSelect(lesson)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-colors",
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/20",
                  "flex items-center justify-between",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>

                  <div>
                    <div className="font-medium">{lesson.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Lesson {lesson.order}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4" />
                  {lesson.xpReward}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

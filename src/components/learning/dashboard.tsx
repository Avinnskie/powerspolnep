"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LearningModule,
  UserProgress,
  UserAchievement,
  Level,
} from "@/types/learning";
import {
  LevelIndicator,
  XPBar,
  AchievementBadge,
  StreakIndicator,
  ProgressCircle,
} from "./gamification";
import {
  BookOpen,
  Award,
  TrendingUp,
  Target,
  PlayCircle,
  CheckCircle,
  Star,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface LearningDashboardProps {
  className?: string;
}

interface DashboardData {
  userProgress: UserProgress;
  moduleProgress: any[];
  lessonProgress: any[];
  recentAchievements: UserAchievement[];
  nextLevel?: Level;
  progressToNextLevel: number;
}

export function LearningDashboard({ className }: LearningDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchModules();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/learning/progress");
      if (response.ok) {
        const data = await response.json();
        setData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch("/api/learning/modules?published=true");
      if (response.ok) {
        const result = await response.json();
        setModules(result.modules);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
          className,
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-8 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  const completedModules =
    data.moduleProgress?.filter((mp) => mp.isCompleted).length || 0;
  const totalModules = modules.length;
  const recentLessons = data.lessonProgress?.slice(0, 5) || [];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">
                  {data.userProgress.totalXp.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Modules Completed
                </p>
                <p className="text-2xl font-bold">
                  {completedModules}/{totalModules}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">
                  {data.userProgress.streak} days
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">
                  {data.recentAchievements?.length || 0}
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <LevelIndicator level={data.userProgress.level} />
              <XPBar
                currentXp={data.userProgress.totalXp}
                level={data.userProgress.level}
                nextLevel={data.nextLevel}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Learning Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module) => {
                  const moduleProgress = data.moduleProgress?.find(
                    (mp) => mp.moduleId === module.id,
                  );
                  const progress = moduleProgress?.progress || 0;
                  const isCompleted = moduleProgress?.isCompleted || false;

                  return (
                    <Card key={module.id} className="relative overflow-hidden">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{module.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {module.description}
                              </p>
                            </div>
                            {isCompleted && (
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <Badge
                                variant={
                                  module.difficulty === "BEGINNER"
                                    ? "default"
                                    : module.difficulty === "INTERMEDIATE"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {module.difficulty}
                              </Badge>
                              <span className="text-muted-foreground">
                                {Math.round(progress)}% Complete
                              </span>
                            </div>

                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="h-2 bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <Link href={`/learning/modules/${module.id}`}>
                            <Button size="sm" className="w-full">
                              <PlayCircle className="w-4 h-4 mr-1" />
                              {isCompleted ? "Review" : "Start Learning"}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <StreakIndicator
                streak={data.userProgress.streak}
                lastActiveAt={data.userProgress.lastActiveAt || undefined}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentAchievements && data.recentAchievements.length > 0 ? (
                <div className="space-y-3">
                  {data.recentAchievements.map((userAchievement) => (
                    <AchievementBadge
                      key={userAchievement.id}
                      achievement={userAchievement.achievement}
                      unlockedAt={userAchievement.unlockedAt}
                      showDetails
                      size="sm"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Star className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Complete lessons to unlock achievements!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLessons.length > 0 ? (
                <div className="space-y-2">
                  {recentLessons.map((lessonProgress) => (
                    <div
                      key={lessonProgress.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <span className="font-medium">
                          {lessonProgress.lesson.title}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          in {lessonProgress.lesson.module.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        +{lessonProgress.xpEarned} XP
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Start learning to see your activity!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

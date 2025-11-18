"use client";

import { cn } from "@/lib/utils";
import { Level, Achievement, UserProgress } from "@/types/learning";
import { Trophy, Star, Zap, Target, Medal } from "lucide-react";

interface LevelIndicatorProps {
  level: Level;
  className?: string;
}

export function LevelIndicator({ level, className }: LevelIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white"
        style={{ backgroundColor: level.color }}
      >
        {level.number}
      </div>
      <div>
        <div className="font-semibold">{level.name}</div>
        {level.description && (
          <div className="text-sm text-muted-foreground">
            {level.description}
          </div>
        )}
      </div>
    </div>
  );
}

interface XPBarProps {
  currentXp: number;
  level: Level;
  nextLevel?: Level;
  className?: string;
}

export function XPBar({ currentXp, level, nextLevel, className }: XPBarProps) {
  const currentLevelMinXp = level.minXp;
  const nextLevelMinXp = nextLevel ? nextLevel.minXp : level.maxXp || currentXp;

  const totalXpNeeded = nextLevelMinXp - currentLevelMinXp;
  const userProgressInLevel = currentXp - currentLevelMinXp;
  const progressPercentage = Math.min(
    100,
    Math.max(0, (userProgressInLevel / totalXpNeeded) * 100),
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Level {level.number}</span>
        <span className="font-medium">
          {currentXp.toLocaleString()} XP
          {nextLevel && (
            <span className="text-muted-foreground">
              {" "}
              / {nextLevelMinXp.toLocaleString()} XP
            </span>
          )}
        </span>
      </div>

      <div className="w-full bg-muted rounded-full h-3">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {nextLevel && (
        <div className="text-xs text-muted-foreground text-center">
          {Math.round(totalXpNeeded - userProgressInLevel).toLocaleString()} XP
          to level {nextLevel.number}
        </div>
      )}
    </div>
  );
}

interface AchievementBadgeProps {
  achievement: Achievement;
  unlockedAt?: Date;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
}

export function AchievementBadge({
  achievement,
  unlockedAt,
  size = "md",
  showDetails = false,
  className,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const isUnlocked = !!unlockedAt;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full",
          sizeClasses[size],
          isUnlocked
            ? "text-white shadow-lg"
            : "bg-muted text-muted-foreground border-2 border-dashed",
        )}
        style={isUnlocked ? { backgroundColor: achievement.color } : {}}
        title={achievement.description}
      >
        {achievement.icon === "trophy" && (
          <Trophy className={iconSizeClasses[size]} />
        )}
        {achievement.icon === "star" && (
          <Star className={iconSizeClasses[size]} />
        )}
        {achievement.icon === "medal" && (
          <Medal className={iconSizeClasses[size]} />
        )}
        {achievement.icon === "target" && (
          <Target className={iconSizeClasses[size]} />
        )}
        {!achievement.icon && <Trophy className={iconSizeClasses[size]} />}
      </div>

      {showDetails && (
        <div className="flex-1">
          <div className="font-medium">{achievement.name}</div>
          <div className="text-sm text-muted-foreground">
            {achievement.description}
          </div>
          {isUnlocked && unlockedAt && (
            <div className="text-xs text-green-600">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </div>
          )}
          {!isUnlocked && achievement.isSecret && (
            <div className="text-xs text-muted-foreground">
              Secret Achievement
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface StreakIndicatorProps {
  streak: number;
  lastActiveAt?: Date;
  className?: string;
}

export function StreakIndicator({
  streak,
  lastActiveAt,
  className,
}: StreakIndicatorProps) {
  const isActiveToday =
    lastActiveAt &&
    new Date(lastActiveAt).toDateString() === new Date().toDateString();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full",
          isActiveToday
            ? "bg-orange-500 text-white"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Zap className="w-5 h-5" />
      </div>
      <div>
        <div className="font-semibold">{streak} Day Streak</div>
        <div className="text-sm text-muted-foreground">
          {isActiveToday ? "Active today!" : "Keep it up!"}
        </div>
      </div>
    </div>
  );
}

interface ProgressCircleProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressCircle({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  children,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

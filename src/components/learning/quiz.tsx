"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question, SubmitAnswerResponse } from "@/types/learning";
import { CheckCircle, XCircle, Clock, Award } from "lucide-react";
import { toast } from "sonner";

interface QuestionCardProps {
  question: Question;
  onAnswerSubmit: (
    answer: string,
    timeSpent?: number,
  ) => Promise<SubmitAnswerResponse>;
  className?: string;
}

export function QuestionCard({
  question,
  onAnswerSubmit,
  className,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  // Reset state when question changes
  useEffect(() => {
    setAnswer("");
    setResult(null);
    setTimeSpent(0);
  }, [question.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [question.id]); // Reset timer when question changes

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await onAnswerSubmit(answer, timeSpent);
      setResult(response);

      if (response.isCorrect) {
        toast.success(`Correct! +${response.xpEarned} XP`);

        if (response.levelUp) {
          toast.success(
            `Level up! You're now ${response.levelUp.newLevel.name}!`,
          );
        }

        if (
          response.achievementsUnlocked &&
          response.achievementsUnlocked.length > 0
        ) {
          response.achievementsUnlocked.forEach((achievement) => {
            toast.success(`Achievement unlocked: ${achievement.name}!`);
          });
        }
      } else {
        toast.error("Incorrect answer. Try again!");
      }
    } catch (error) {
      toast.error("Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case "MULTIPLE_CHOICE":
        const options = question.options as { value: string; label: string }[];
        return (
          <RadioGroup value={answer} onValueChange={setAnswer}>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer p-3 rounded border hover:bg-muted/50"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "TRUE_FALSE":
        return (
          <RadioGroup value={answer} onValueChange={setAnswer}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label
                  htmlFor="true"
                  className="flex-1 cursor-pointer p-3 rounded border hover:bg-muted/50"
                >
                  True
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label
                  htmlFor="false"
                  className="flex-1 cursor-pointer p-3 rounded border hover:bg-muted/50"
                >
                  False
                </Label>
              </div>
            </div>
          </RadioGroup>
        );

      case "FILL_BLANK":
        return (
          <Input
            type="text"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="text-center"
          />
        );

      default:
        return (
          <Input
            type="text"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Question {question.order}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatTime(timeSpent)}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Award className="w-4 h-4 text-yellow-500" />
          <span>{question.points} points</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: question.question }} />
        </div>

        {!result && (
          <div className="space-y-4">
            {renderQuestionInput()}

            <Button
              onClick={handleSubmit}
              disabled={!answer.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </Button>
          </div>
        )}

        {result && (
          <div
            className={cn(
              "p-4 rounded-lg border-2",
              result.isCorrect
                ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span
                className={cn(
                  "font-semibold",
                  result.isCorrect ? "text-green-800" : "text-red-800",
                )}
              >
                {result.isCorrect ? "Correct!" : "Incorrect"}
              </span>
            </div>

            {result.explanation && (
              <div className="text-sm mb-2">
                <strong>Explanation:</strong> {result.explanation}
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span>Points earned: {result.points}</span>
              <span>XP earned: +{result.xpEarned}</span>
            </div>

            {result.levelUp && (
              <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-950/20 rounded text-sm">
                🎉 Level up! You reached{" "}
                <strong>{result.levelUp.newLevel.name}</strong>!
              </div>
            )}

            {result.achievementsUnlocked &&
              result.achievementsUnlocked.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-950/20 rounded text-sm">
                  🏆 Achievement(s) unlocked:{" "}
                  {result.achievementsUnlocked.map((a) => a.name).join(", ")}!
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface QuizProps {
  questions: Question[];
  onQuizComplete?: (results: SubmitAnswerResponse[]) => void;
  className?: string;
}

export function Quiz({ questions, onQuizComplete, className }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<SubmitAnswerResponse[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + (results.length > currentQuestionIndex ? 1 : 0)) /
      questions.length) *
    100;

  const handleAnswerSubmit = async (
    answer: string,
    timeSpent?: number,
  ): Promise<SubmitAnswerResponse> => {
    try {
      const response = await fetch(
        `/api/learning/questions/${currentQuestion.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answer, timeSpent }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      const result: SubmitAnswerResponse = await response.json();

      // Update results
      const newResults = [...results];
      newResults[currentQuestionIndex] = result;
      setResults(newResults);

      // Auto-advance to next question after a delay
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
        }, 2000);
      } else {
        // Quiz completed
        setIsCompleted(true);
        if (onQuizComplete) {
          onQuizComplete(newResults);
        }
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const totalPoints = results.reduce((sum, result) => sum + result.points, 0);
  const totalXP = results.reduce((sum, result) => sum + result.xpEarned, 0);
  const correctAnswers = results.filter((result) => result.isCorrect).length;

  if (isCompleted) {
    return (
      <div className={cn("text-center space-y-6", className)}>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Quiz Completed! 🎉</h2>
          <p className="text-muted-foreground">
            Great job! Here are your results:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {correctAnswers}/{questions.length}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">+{totalXP}</div>
              <div className="text-sm text-muted-foreground">XP Earned</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-2 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current question */}
      <QuestionCard
        question={currentQuestion}
        onAnswerSubmit={handleAnswerSubmit}
      />
    </div>
  );
}

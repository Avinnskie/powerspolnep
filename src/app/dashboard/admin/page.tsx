"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () =>
    import("@/components/ui/rich-text-editor").then((mod) => ({
      default: mod.RichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="border border-input rounded-md min-h-[200px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    ),
  },
);
import {
  BookOpen,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Module {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  isPublished: boolean;
  xpReward?: number;
  lessons?: any[];
  _count?: {
    lessons: number;
  };
}

interface Question {
  id: string;
  question: string;
  type: string;
  correctAnswer: string;
  explanation?: string;
  points?: number;
  lesson: {
    id: string;
    title: string;
    module: {
      title: string;
    };
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [lessonContent, setLessonContent] = useState("");
  const [questionContent, setQuestionContent] = useState("");

  useEffect(() => {
    checkAdminAccess();
    fetchModules();
    fetchQuestions();
    fetchLessons();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          if (!["ADMIN", "CORE"].includes(data.user.role)) {
            toast.error("Access denied. Admin or Core privileges required.");
            router.push("/dashboard");
            return;
          }
        }
      } else {
        router.push("/login");
        return;
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/learning/modules", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setModules(data.modules);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/learning/questions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this module? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/learning/modules?id=${moduleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Module deleted successfully");
        fetchModules();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete module");
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("An error occurred while deleting the module");
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/learning/questions?id=${questionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Question deleted successfully");
        fetchQuestions();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("An error occurred while deleting the question");
    }
  };

  const fetchLessons = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/learning/lessons", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const createModule = async (formData: FormData) => {
    try {
      const token = localStorage.getItem("auth_token");
      const moduleData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        slug: (formData.get("title") as string)
          ?.toLowerCase()
          .replace(/\s+/g, "-"),
        difficulty: formData.get("difficulty") as string,
        order: modules.length + 1,
        xpReward: parseInt(formData.get("xpReward") as string) || 100,
      };

      const response = await fetch("/api/learning/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(moduleData),
      });

      if (response.ok) {
        toast.success("Module created successfully");
        setShowModuleDialog(false);
        fetchModules();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create module");
      }
    } catch (error) {
      console.error("Error creating module:", error);
      toast.error("An error occurred while creating the module");
    }
  };

  const createLesson = async (formData: FormData) => {
    try {
      const token = localStorage.getItem("auth_token");
      const lessonData = {
        title: formData.get("title") as string,
        content: lessonContent || (formData.get("content") as string),
        moduleId: formData.get("moduleId") as string,
        order: 1,
        xpReward: parseInt(formData.get("xpReward") as string) || 20,
      };

      const response = await fetch("/api/learning/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(lessonData),
      });

      if (response.ok) {
        toast.success("Lesson created successfully");
        setShowLessonDialog(false);
        setLessonContent("");
        fetchLessons();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create lesson");
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      toast.error("An error occurred while creating the lesson");
    }
  };

  const createQuestion = async (formData: FormData) => {
    try {
      const token = localStorage.getItem("auth_token");
      const questionData = {
        lessonId: formData.get("lessonId") as string,
        type: formData.get("type") as string,
        question: formData.get("question") as string,
        correctAnswer: formData.get("correctAnswer") as string,
        explanation: formData.get("explanation") as string,
        order: 1,
        points: parseInt(formData.get("points") as string) || 10,
      };

      const response = await fetch("/api/learning/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        toast.success("Question created successfully");
        setShowQuestionDialog(false);
        fetchQuestions();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create question");
      }
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("An error occurred while creating the question");
    }
  };

  const updateModule = async (formData: FormData) => {
    if (!editingModule) return;

    try {
      const token = localStorage.getItem("auth_token");
      const moduleData = {
        id: editingModule.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        difficulty: formData.get("difficulty") as string,
        xpReward: parseInt(formData.get("xpReward") as string) || 100,
        isPublished: formData.get("isPublished") === "true",
      };

      const response = await fetch("/api/learning/modules", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(moduleData),
      });

      if (response.ok) {
        toast.success("Module updated successfully");
        setShowModuleDialog(false);
        setEditingModule(null);
        fetchModules();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update module");
      }
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("An error occurred while updating the module");
    }
  };

  const updateQuestion = async (formData: FormData) => {
    if (!editingQuestion) return;

    try {
      const token = localStorage.getItem("auth_token");
      const questionData = {
        id: editingQuestion.id,
        lessonId: formData.get("lessonId") as string,
        type: formData.get("type") as string,
        question: questionContent || (formData.get("question") as string),
        correctAnswer: formData.get("correctAnswer") as string,
        explanation: formData.get("explanation") as string,
        points: parseInt(formData.get("points") as string) || 10,
      };

      const response = await fetch("/api/learning/questions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        toast.success("Question updated successfully");
        setShowQuestionDialog(false);
        setEditingQuestion(null);
        setQuestionContent("");
        fetchQuestions();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update question");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("An error occurred while updating the question");
    }
  };

  const openEditModule = (module: Module) => {
    setEditingModule(module);
    setShowModuleDialog(true);
  };

  const openEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionContent(question.question);
    setShowQuestionDialog(true);
  };

  const resetModuleDialog = () => {
    setEditingModule(null);
    setShowModuleDialog(false);
  };

  const resetQuestionDialog = () => {
    setEditingQuestion(null);
    setQuestionContent("");
    setShowQuestionDialog(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !["ADMIN", "CORE"].includes(user.role)) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage learning materials, questions, and content
          </p>
        </div>
        <Badge variant="default" className="text-sm">
          {user.role} Access
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Modules</p>
                <p className="text-2xl font-bold">{modules.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">
                  {modules.filter((m) => m.isPublished).length}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold">{questions.length}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold">
                  {modules.filter((m) => !m.isPublished).length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Module
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Lesson
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog
              open={showQuestionDialog}
              onOpenChange={setShowQuestionDialog}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Question
                </Button>
              </DialogTrigger>
            </Dialog>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => router.push("/learning")}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              View Learning Page
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Learning Modules
            </CardTitle>
            <Button size="sm" onClick={() => setShowModuleDialog(true)}>
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Module
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{module.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          module.difficulty === "BEGINNER"
                            ? "default"
                            : module.difficulty === "INTERMEDIATE"
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {module.difficulty}
                      </Badge>
                      <Badge
                        variant={module.isPublished ? "default" : "outline"}
                        className="text-xs"
                      >
                        {module.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModule(module)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteModule(module.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {modules.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No modules found. Create your first module!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Questions
            </CardTitle>
            <Button size="sm" onClick={() => setShowQuestionDialog(true)}>
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Question
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {questions.slice(0, 10).map((question) => (
                <div
                  key={question.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-2">
                      {question.question}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {question.lesson.module.title} → {question.lesson.title}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {question.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditQuestion(question)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteQuestion(question.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No questions found. Create questions for your lessons!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showModuleDialog} onOpenChange={resetModuleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingModule ? "Edit Module" : "Create New Module"}
            </DialogTitle>
          </DialogHeader>
          <form
            action={editingModule ? updateModule : createModule}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingModule?.title || ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingModule?.description || ""}
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                name="difficulty"
                defaultValue={editingModule?.difficulty || ""}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="xpReward">XP Reward</Label>
              <Input
                id="xpReward"
                name="xpReward"
                type="number"
                defaultValue={editingModule?.xpReward?.toString() || "100"}
              />
            </div>
            {editingModule && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  value="true"
                  defaultChecked={editingModule.isPublished}
                  className="h-4 w-4"
                />
                <Label htmlFor="isPublished">Published</Label>
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingModule ? "Update Module" : "Create Module"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetModuleDialog}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lesson</DialogTitle>
          </DialogHeader>
          <form action={createLesson} className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Title</Label>
              <Input id="lesson-title" name="title" required />
            </div>
            <div>
              <Label htmlFor="moduleId">Module</Label>
              <Select name="moduleId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                content={lessonContent}
                onChange={setLessonContent}
              />
            </div>
            <div>
              <Label htmlFor="lesson-xpReward">XP Reward</Label>
              <Input
                id="lesson-xpReward"
                name="xpReward"
                type="number"
                defaultValue="20"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Create Lesson
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLessonDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showQuestionDialog} onOpenChange={resetQuestionDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Create New Question"}
            </DialogTitle>
          </DialogHeader>
          <form
            action={editingQuestion ? updateQuestion : createQuestion}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="lessonId">Lesson</Label>
              <Select
                name="lessonId"
                defaultValue={editingQuestion?.lesson?.id || ""}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson: any) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.module?.title} - {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="question-type">Question Type</Label>
              <Select
                name="type"
                defaultValue={editingQuestion?.type || ""}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MULTIPLE_CHOICE">
                    Multiple Choice
                  </SelectItem>
                  <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                  <SelectItem value="FILL_BLANK">Fill in the Blank</SelectItem>
                  <SelectItem value="MATCHING">Matching</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="question">Question</Label>
              <RichTextEditor
                content={questionContent}
                onChange={setQuestionContent}
              />
            </div>
            <div>
              <Label htmlFor="correctAnswer">Correct Answer</Label>
              <Input
                id="correctAnswer"
                name="correctAnswer"
                defaultValue={editingQuestion?.correctAnswer || ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                name="explanation"
                rows={2}
                defaultValue={editingQuestion?.explanation || ""}
              />
            </div>
            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                name="points"
                type="number"
                defaultValue={editingQuestion?.points?.toString() || "10"}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingQuestion ? "Update Question" : "Create Question"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetQuestionDialog}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

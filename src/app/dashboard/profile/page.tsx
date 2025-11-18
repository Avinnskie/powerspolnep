"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Hash,
  Calendar,
  Building,
  Shield,
  QrCode,
  Award,
  Star,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  BookOpen,
  Settings,
  ChevronRight,
} from "lucide-react";
import MemberQRCode from "@/components/molecules/MemberQRCode";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  nim?: string;
  phone?: string;
  avatar?: string;
  position?: string;
  angkatan?: string;
  status: string;
  memberCode?: string;
  powersDivision?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function ProfilePage() {
  const [showQRCode, setShowQRCode] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<any>(null);

  // Fetch user profile
  useEffect(() => {
    fetchUserProfile();
    fetchUserProgress();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Get token from localStorage
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error("No authentication token found");
        toast.error("Silakan login kembali");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Failed to fetch profile:", response.status, errorData);
        toast.error(`Gagal memuat profil: ${response.status}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        console.error("Invalid response format:", data);
        toast.error("Format response tidak valid");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Terjadi kesalahan saat memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        return;
      }

      const response = await fetch("/api/learning/progress", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProgress(data.userProgress);
      }
    } catch (error) {
      console.error("Error fetching user progress:", error);
      // Don't show error toast for learning progress since it's optional
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "CORE":
        return "default";
      case "COMMITTEE":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Memuat profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">Profil tidak ditemukan</p>
            <Button onClick={fetchUserProfile}>Coba Lagi</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Profil Saya</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Kelola informasi profil dan QR code anggota POWERS
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Settings className="h-4 w-4 mr-2" />
          Edit Profil
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content - Profile Info & QR Code */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* User Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl sm:text-2xl">
                      {getInitials(user.name)}
                    </span>
                  </div>
                )}
                <div className="flex-1 w-full sm:w-auto">
                  <h3 className="text-xl sm:text-2xl font-semibold break-words">
                    {user.name}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground break-all">
                    {user.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge
                      variant={
                        user.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                    {user.memberCode && (
                      <Badge variant="outline" className="font-mono">
                        {user.memberCode}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm flex-wrap">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">Email:</span>
                    <span className="text-muted-foreground break-all">
                      {user.email}
                    </span>
                  </div>
                  {user.nim && (
                    <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm flex-wrap">
                      <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">NIM:</span>
                      <span className="text-muted-foreground">{user.nim}</span>
                    </div>
                  )}
                  {user.angkatan && (
                    <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm flex-wrap">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">Angkatan:</span>
                      <span className="text-muted-foreground">
                        {user.angkatan}
                      </span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm flex-wrap">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">Phone:</span>
                      <span className="text-muted-foreground break-all">
                        {user.phone}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {user.powersDivision && (
                    <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm flex-wrap">
                      <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">Divisi:</span>
                      <span className="text-muted-foreground break-words">
                        {user.powersDivision.name}
                      </span>
                    </div>
                  )}
                  {user.position && (
                    <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm flex-wrap">
                      <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">Posisi:</span>
                      <span className="text-muted-foreground break-words">
                        {user.position}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm flex-wrap">
                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">Role:</span>
                    <Badge
                      variant={getRoleBadgeVariant(user.role)}
                      className="text-xs"
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm flex-wrap">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">Status:</span>
                    <Badge
                      variant={
                        user.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  <span className="text-base sm:text-lg">QR Code Anggota</span>
                </div>
                <Button
                  onClick={() => setShowQRCode(!showQRCode)}
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  {showQRCode ? "Sembunyikan" : "Tampilkan"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                QR Code statis untuk absensi di event POWERS. Setiap anggota
                memiliki QR code unik yang dapat digunakan untuk check-in
                otomatis.
              </p>

              {showQRCode && (
                <div className="pt-4">
                  <MemberQRCode />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Progress Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Prestasi & Pembelajaran
                {!userProgress && (
                  <Badge variant="secondary" className="text-xs">
                    Not Started
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-xl sm:text-2xl font-bold">
                    {userProgress?.totalXp || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-xl sm:text-2xl font-bold">
                    {userProgress?.level?.number || 1}
                  </p>
                  <p className="text-xs text-muted-foreground">Current Level</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-xl sm:text-2xl font-bold">
                    {userProgress?.streak || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-xl sm:text-2xl font-bold">
                    {userProgress?.lastActiveAt
                      ? new Date(userProgress.lastActiveAt).toLocaleDateString(
                          "id-ID",
                          { month: "short", day: "numeric" },
                        )
                      : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Last Active</p>
                </div>
              </div>
              {!userProgress ? (
                <div className="text-center mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    Start learning to track your progress!
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/learning")}
                    variant="outline"
                    size="sm"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Learning
                  </Button>
                </div>
              ) : (
                <div className="text-center mt-3 sm:mt-4">
                  <Button
                    onClick={() => (window.location.href = "/learning")}
                    variant="outline"
                    size="sm"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistik Anggota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Bergabung</span>
                </div>
                <span className="text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <Separator />
              {user.memberCode && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Member Code</span>
                    </div>
                    <span className="text-sm font-mono font-bold">
                      {user.memberCode}
                    </span>
                  </div>
                  <Separator />
                </>
              )}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                    Level: {userProgress?.level?.name || "Newbie"}
                  </h4>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: userProgress
                        ? `${Math.min((userProgress.totalXp / (userProgress.level.maxXp || userProgress.level.minXp + 100)) * 100, 100)}%`
                        : "0%",
                    }}
                  ></div>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  {userProgress?.totalXp || 0} /{" "}
                  {userProgress?.level?.maxXp ||
                    userProgress?.level?.minXp + 100 ||
                    100}{" "}
                  XP
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

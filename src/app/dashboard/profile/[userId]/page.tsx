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
  Award,
  Star,
  Trophy,
  Target,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

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

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("Silakan login kembali");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error("Gagal memuat profil user");
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success && data.data) {
        setUser(data.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Terjadi kesalahan saat memuat profil");
    } finally {
      setLoading(false);
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
            <Button onClick={() => router.back()}>Kembali</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Profil Anggota</h1>
            <p className="text-muted-foreground">Informasi anggota POWERS</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Header */}
              <div className="flex items-center space-x-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {getInitials(user.name)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex gap-2 mt-2">
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
                  </div>
                </div>
              </div>

              <Separator />

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                  {user.nim && (
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">NIM:</span>
                      <span className="text-muted-foreground">{user.nim}</span>
                    </div>
                  )}
                  {user.angkatan && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Angkatan:</span>
                      <span className="text-muted-foreground">
                        {user.angkatan}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {user.powersDivision && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Divisi:</span>
                      <span className="text-muted-foreground">
                        {user.powersDivision.name}
                      </span>
                    </div>
                  )}
                  {user.position && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Posisi:</span>
                      <span className="text-muted-foreground">
                        {user.position}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Role:</span>
                    <Badge
                      variant={getRoleBadgeVariant(user.role)}
                      className="text-xs"
                    >
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gamification Preview Section */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Prestasi & Pembelajaran
                <Badge variant="secondary" className="text-xs">
                  Coming Soon
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Total Poin</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Award className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Badge</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Quest</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Pencapaian</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Stats */}
        <div className="space-y-6">
          {/* Member Stats */}
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
              {user.memberCode && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Member Code</span>
                    </div>
                    <span className="text-sm font-mono font-bold">
                      {user.memberCode}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Anda sedang melihat profil publik anggota POWERS. QR code dan
                  informasi sensitif hanya dapat dilihat oleh pemilik akun.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

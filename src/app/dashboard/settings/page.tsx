"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Shield,
  User,
  Mail,
  Camera,
  Upload,
} from "lucide-react";
import { LoaderOne } from "@/components/ui/loader";
import { Role } from "@/types/auth";

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const decoded = JSON.parse(jsonPayload);
      setCurrentUser({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        avatar: decoded.avatar,
      });

      fetchUserData(decoded.id, token);
    } catch (error) {
      console.error("Token decode error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchUserData = async (userId: string, token: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentUser((prev) => ({
          ...prev!,
          avatar: result.data.avatar,
        }));
        setAvatarPreview(result.data.avatar);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setAvatarMessage({
        type: "error",
        text: "File harus berupa gambar",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMessage({
        type: "error",
        text: "Ukuran file maksimal 2MB",
      });
      return;
    }

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarPreview(base64String);
      uploadAvatar(base64String);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (avatarData: string) => {
    setUploadingAvatar(true);
    setAvatarMessage(null);

    try {
      // Validate base64 data
      if (!avatarData || !avatarData.startsWith("data:image/")) {
        setAvatarMessage({
          type: "error",
          text: "Format gambar tidak valid",
        });
        setUploadingAvatar(false);
        return;
      }

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setAvatarMessage({
          type: "error",
          text: "Sesi telah berakhir, silakan login kembali",
        });
        setUploadingAvatar(false);
        return;
      }

      const response = await fetch(`/api/users/${currentUser?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatar: avatarData,
        }),
      });

      const result = await response.json();

      // Log untuk debugging
      console.log("Upload avatar response:", {
        status: response.status,
        ok: response.ok,
        result,
      });

      if (response.ok) {
        setAvatarMessage({
          type: "success",
          text: "Foto profil berhasil diubah",
        });
        setCurrentUser((prev) => ({
          ...prev!,
          avatar: avatarData,
        }));
      } else {
        setAvatarMessage({
          type: "error",
          text: result.message || "Gagal mengubah foto profil",
        });
        setAvatarPreview(currentUser?.avatar || null);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setAvatarMessage({
        type: "error",
        text: "Terjadi kesalahan saat mengubah foto profil",
      });
      setAvatarPreview(currentUser?.avatar || null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({
        type: "error",
        text: "Semua field harus diisi",
      });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password baru minimal 6 karakter",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Password baru dan konfirmasi tidak cocok",
      });
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Password berhasil diubah",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({
          type: "error",
          text: result.message || "Gagal mengubah password",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat mengubah password",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoaderOne />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "CORE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMMITTEE":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "RANGERS":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pengaturan Akun
          </h1>
          <p className="text-gray-600">
            Kelola informasi akun dan keamanan Anda
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="text-blue-600" size={24} />
            Informasi Akun
          </h2>

          {avatarMessage && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                avatarMessage.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {avatarMessage.type === "success" ? (
                <Check size={20} />
              ) : (
                <X size={20} />
              )}
              <span className="font-medium">{avatarMessage.text}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg">
              <div className="relative">
                {avatarPreview || currentUser.avatar ? (
                  <img
                    src={avatarPreview || currentUser.avatar || ""}
                    alt={currentUser.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-32 h-32 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-5xl font-bold text-white">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition"
                >
                  <Camera size={20} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                  Klik ikon kamera untuk mengubah foto profil
                </p>
                <p className="text-xs text-gray-500">
                  Format: JPG, PNG, GIF. Maksimal 2MB
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Nama Lengkap</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentUser.name}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRoleBadgeColor(currentUser.role)}`}
              >
                {currentUser.role}
              </span>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="text-gray-400" size={18} />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-base font-medium text-gray-900">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="text-blue-600" size={24} />
            Ganti Password
          </h2>

          {message && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <Check size={20} />
              ) : (
                <X size={20} />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Saat Ini <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password saat ini"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password baru (min. 6 karakter)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Konfirmasi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengubah Password...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Ubah Password
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Shield className="text-blue-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Tips Keamanan Password
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Gunakan minimal 6 karakter</li>
                  <li>• Kombinasikan huruf besar, kecil, angka, dan simbol</li>
                  <li>• Jangan gunakan password yang sama dengan akun lain</li>
                  <li>• Ubah password secara berkala</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Edit,
  Trash2,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Shield,
  X,
  Save,
  AlertCircle,
  Camera,
  Upload,
} from "lucide-react";
import { LoaderOne } from "@/components/ui/loader";
import { Role } from "@/types/auth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Member {
  id: string;
  email: string;
  name: string;
  role: Role;
  nim?: string | null;
  phone?: string | null;
  avatar?: string | null;
  position?: string | null;
  powersDivision?: {
    id: string;
    name: string;
  } | null;
  angkatan?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export default function MembersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [filterDivision, setFilterDivision] = useState<string>("ALL");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<
    Partial<Member> & { password?: string; powersDivisionId?: string }
  >({
    name: "",
    email: "",
    password: "",
    role: "RANGERS" as Role,
    status: "ACTIVE",
    powersDivisionId: "",
  });

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
      });
    } catch (error) {
      console.error("Token decode error:", error);
      router.push("/login");
    }

    fetchMembers();
    fetchDivisions();
  }, [router]);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setMembers(result.data);
        setFilteredMembers(result.data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/powers-divisions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setDivisions(
          result.data.map((div: any) => ({
            id: div.id,
            name: div.name,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  };

  useEffect(() => {
    let filtered = members.filter((member) => member.role !== "ADMIN");

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.nim?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterRole !== "ALL") {
      filtered = filtered.filter((member) => member.role === filterRole);
    }

    if (filterDivision !== "ALL") {
      filtered = filtered.filter(
        (member) => member.powersDivision?.name === filterDivision,
      );
    }

    setFilteredMembers(filtered);
  }, [searchTerm, filterRole, filterDivision, members]);

  const canManage =
    currentUser?.role === "ADMIN" || currentUser?.role === "CORE";
  const canDelete = currentUser?.role === "ADMIN";

  const handleEdit = (member: Member) => {
    setEditingMember({ ...member });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/users/${editingMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingMember),
      });

      if (response.ok) {
        await fetchMembers();
        setShowEditModal(false);
        setEditingMember(null);
        toast.success("Anggota berhasil diperbarui");
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal memperbarui anggota");
      }
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Gagal memperbarui anggota");
    }
  };

  const handleCreateMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.password) {
      toast.error("Nama, email, dan password harus diisi");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMember),
      });

      if (response.ok) {
        await fetchMembers();
        setShowCreateModal(false);
        setNewMember({
          name: "",
          email: "",
          password: "",
          role: "RANGERS" as Role,
          status: "ACTIVE",
          powersDivisionId: "",
        });
        toast.success("Anggota berhasil ditambahkan");
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal membuat anggota");
      }
    } catch (error) {
      console.error("Error creating member:", error);
      toast.error("Gagal membuat anggota");
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchMembers();
        setDeleteConfirm(null);
        toast.success("Anggota berhasil dihapus");
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal menghapus anggota");
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Gagal menghapus anggota");
    }
  };

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

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "ALUMNI":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const uniqueDivisions = Array.from(
    new Set(members.map((m) => m.powersDivision?.name).filter(Boolean)),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoaderOne />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Users className="text-blue-600" size={24} />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Anggota POWERS
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Daftar seluruh anggota organisasi POWERS Politeknik Negeri Pontianak
          </p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari nama, email, atau NIM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                size={20}
              />
              <Select
                value={filterRole}
                onValueChange={(value) => setFilterRole(value)}
              >
                <SelectTrigger className="w-full pl-10 pr-4 py-2.5">
                  <SelectValue placeholder="Semua Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Role</SelectItem>
                  <SelectItem value="CORE">Core</SelectItem>
                  <SelectItem value="COMMITTEE">Committee</SelectItem>
                  <SelectItem value="RANGERS">Rangers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                size={20}
              />
              <Select
                value={filterDivision}
                onValueChange={(value) => setFilterDivision(value)}
              >
                <SelectTrigger className="w-full pl-10 pr-4 py-2.5">
                  <SelectValue placeholder="Semua Divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Divisi</SelectItem>
                  {uniqueDivisions.map((division) => (
                    <SelectItem key={division} value={division as string}>
                      {division}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {canManage && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition font-medium text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <UserPlus size={18} />
                Tambah Anggota
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => router.push(`/dashboard/profile/${member.id}`)}
              className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden cursor-pointer"
            >
              <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-4 sm:p-6 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1 break-words">
                  {member.name}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(member.role)}`}
                  >
                    {member.role}
                  </span>
                  {member.status && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(member.status)}`}
                    >
                      {member.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                {member.nim && (
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <GraduationCap
                      className="text-gray-400 shrink-0"
                      size={16}
                    />
                    <span className="text-gray-700 break-all">
                      {member.nim}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Mail className="text-gray-400 shrink-0" size={16} />
                  <span className="text-gray-700 truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <Phone className="text-gray-400 shrink-0" size={16} />
                    <span className="text-gray-700 break-all">
                      {member.phone}
                    </span>
                  </div>
                )}
                {member.position && (
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <Shield className="text-gray-400 shrink-0" size={16} />
                    <span className="text-gray-700 font-semibold break-words">
                      {member.position}
                    </span>
                  </div>
                )}
                {member.powersDivision && (
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <Briefcase className="text-gray-400 shrink-0" size={16} />
                    <span className="text-gray-700 break-words">
                      {member.powersDivision.name}
                    </span>
                  </div>
                )}
                {member.angkatan && (
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <Shield className="text-gray-400 shrink-0" size={16} />
                    <span className="text-gray-700">
                      Angkatan {member.angkatan}
                    </span>
                  </div>
                )}
              </div>

              {canManage && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(member);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4 py-2 rounded-lg transition text-xs sm:text-sm font-medium"
                  >
                    <Edit size={14} className="sm:w-4 sm:h-4" />
                    Edit
                  </button>
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(member.id);
                      }}
                      className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition text-xs sm:text-sm font-medium ${
                        deleteConfirm === member.id
                          ? "bg-red-600 hover:bg-red-700 text-white flex-1"
                          : "bg-red-100 hover:bg-red-200 text-red-700"
                      }`}
                    >
                      {deleteConfirm === member.id ? (
                        <>
                          <AlertCircle size={14} className="sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">
                            Konfirmasi Hapus
                          </span>
                          <span className="sm:hidden">Hapus?</span>
                        </>
                      ) : (
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">Tidak ada anggota ditemukan</p>
          </div>
        )}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Anggota Baru</DialogTitle>
            <DialogDescription>
              Lengkapi formulir di bawah untuk menambahkan anggota baru POWERS
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMember.name || ""}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newMember.email || ""}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newMember.password || ""}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIM
                </label>
                <input
                  type="text"
                  value={newMember.nim || ""}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      nim: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telepon
                </label>
                <input
                  type="text"
                  value={newMember.phone || ""}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      phone: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={newMember.position || ""}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      position: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ketua, Wakil Ketua, Sekretaris, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Divisi
                </label>
                <Select
                  value={newMember.powersDivisionId || "none"}
                  onValueChange={(value) =>
                    setNewMember({
                      ...newMember,
                      powersDivisionId: value === "none" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Divisi (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada divisi</SelectItem>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Angkatan
                </label>
                <input
                  type="text"
                  value={newMember.angkatan || ""}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      angkatan: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={newMember.status || "ACTIVE"}
                  onValueChange={(value) =>
                    setNewMember({
                      ...newMember,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="ALUMNI">Alumni</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {currentUser?.role === "ADMIN" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <Select
                    value={newMember.role}
                    onValueChange={(value) =>
                      setNewMember({
                        ...newMember,
                        role: value as Role,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RANGERS">Rangers</SelectItem>
                      <SelectItem value="COMMITTEE">Committee</SelectItem>
                      <SelectItem value="CORE">Core</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Profil
                </label>
                <div className="flex items-center gap-4">
                  {newMember.avatar && (
                    <img
                      src={newMember.avatar}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Upload Foto (Max 2MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error("Ukuran file maksimal 2MB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewMember({
                                ...newMember,
                                avatar: reader.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewMember({
                  name: "",
                  email: "",
                  password: "",
                  role: "RANGERS" as Role,
                  status: "ACTIVE",
                  powersDivisionId: "",
                });
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleCreateMember}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium flex items-center gap-2"
            >
              <UserPlus size={18} />
              Tambah Anggota
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Anggota</DialogTitle>
            <DialogDescription>
              Perbarui informasi anggota POWERS
            </DialogDescription>
          </DialogHeader>

          {editingMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editingMember.name}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingMember.email}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIM
                  </label>
                  <input
                    type="text"
                    value={editingMember.nim || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        nim: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telepon
                  </label>
                  <input
                    type="text"
                    value={editingMember.phone || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position{" "}
                    {(editingMember.role === "CORE" ||
                      editingMember.role === "COMMITTEE") && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editingMember.position || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        position: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ketua, Wakil Ketua, Sekretaris, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Divisi
                  </label>
                  <Select
                    value={editingMember.powersDivision?.id || "none"}
                    onValueChange={(value) =>
                      setEditingMember({
                        ...editingMember,
                        powersDivision:
                          value === "none"
                            ? null
                            : divisions.find((d) => d.id === value) || null,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Divisi (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak ada divisi</SelectItem>
                      {divisions.map((division) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    value={editingMember.jabatan || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        jabatan: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Angkatan
                  </label>
                  <input
                    type="text"
                    value={editingMember.angkatan || ""}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        angkatan: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select
                    value={editingMember.status || "ACTIVE"}
                    onValueChange={(value) =>
                      setEditingMember({
                        ...editingMember,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ALUMNI">Alumni</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentUser?.role === "ADMIN" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <Select
                      value={editingMember.role}
                      onValueChange={(value) =>
                        setEditingMember({
                          ...editingMember,
                          role: value as Role,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RANGERS">Rangers</SelectItem>
                        <SelectItem value="COMMITTEE">Committee</SelectItem>
                        <SelectItem value="CORE">Core</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Profil
                  </label>
                  <div className="flex items-center gap-4">
                    {editingMember.avatar && (
                      <img
                        src={editingMember.avatar}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    )}
                    <div className="flex-1">
                      <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Upload Foto (Max 2MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error("Ukuran file maksimal 2MB");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditingMember({
                                  ...editingMember,
                                  avatar: reader.result as string,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setShowEditModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center gap-2"
            >
              <Save size={18} />
              Simpan Perubahan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Crown,
  Users,
  UserPlus,
  X,
  UserX,
  Search,
  AlertCircle,
  Save,
  UserMinus,
  Edit,
} from "lucide-react";
import { LoaderOne } from "@/components/ui/loader";
import { toast } from "sonner";
import { Role } from "@/types/auth";
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

interface PowersDivision {
  id: string;
  name: string;
  description?: string | null;
  headId?: string | null;
  head?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: Role;
  } | null;
  members: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: Role;
    status: string;
    position?: string | null;
    nim?: string | null;
    phone?: string | null;
  }[];
  _count: {
    members: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: Role;
  status: string;
  powersDivision?: {
    id: string;
    name: string;
  } | null;
}

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export default function PowersDivisionsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [divisions, setDivisions] = useState<PowersDivision[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedDivision, setSelectedDivision] =
    useState<PowersDivision | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [newDivision, setNewDivision] = useState({
    name: "",
    description: "",
    headId: "none",
  });

  const [editingDivision, setEditingDivision] = useState<{
    id: string;
    name: string;
    description: string;
    headId: string;
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
      });

      if (decoded.role !== "ADMIN" && decoded.role !== "CORE") {
        router.push("/dashboard");
        return;
      }
    } catch (error) {
      console.error("Token decode error:", error);
      router.push("/login");
    }

    fetchDivisions();
    fetchUsers();
  }, [router]);

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
        setDivisions(result.data);
      }
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(result.data.filter((user: User) => user.role !== "ADMIN"));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDivision = async () => {
    if (!newDivision.name) {
      toast.error("Nama divisi harus diisi");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/powers-divisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newDivision.name,
          description: newDivision.description || null,
          headId:
            newDivision.headId && newDivision.headId !== "none"
              ? newDivision.headId
              : null,
        }),
      });

      if (response.ok) {
        await fetchDivisions();
        await fetchUsers();
        setShowCreateModal(false);
        setNewDivision({ name: "", description: "", headId: "none" });
        toast.success("Divisi berhasil dibuat");
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal membuat divisi");
      }
    } catch (error) {
      console.error("Error creating division:", error);
      toast.error("Gagal membuat divisi");
    }
  };

  const handleEditDivision = (division: PowersDivision) => {
    setEditingDivision({
      id: division.id,
      name: division.name,
      description: division.description || "",
      headId: division.headId || "none",
    });
    setShowEditModal(true);
  };

  const handleUpdateDivision = async () => {
    if (!editingDivision) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/powers-divisions/${editingDivision.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editingDivision.name,
            description: editingDivision.description || null,
            headId:
              editingDivision.headId && editingDivision.headId !== "none"
                ? editingDivision.headId
                : null,
          }),
        },
      );

      if (response.ok) {
        await fetchDivisions();
        await fetchUsers();
        setShowEditModal(false);
        setEditingDivision(null);
        toast.success("Divisi berhasil diperbarui");
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal memperbarui divisi");
      }
    } catch (error) {
      console.error("Error updating division:", error);
      toast.error("Gagal memperbarui divisi");
    }
  };

  const handleDeleteDivision = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/powers-divisions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchDivisions();
        setDeleteConfirm(null);
        toast.success("Divisi berhasil dihapus");
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal menghapus divisi");
      }
    } catch (error) {
      console.error("Error deleting division:", error);
      toast.error("Gagal menghapus divisi");
    }
  };

  const handleAddMember = async (divisionId: string, userId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/powers-divisions/${divisionId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        },
      );

      if (response.ok) {
        await fetchDivisions();
        await fetchUsers();
        toast.success("Anggota berhasil ditambahkan");
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal menambahkan anggota");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Gagal menambahkan anggota");
    }
  };

  const handleRemoveMember = async (divisionId: string, userId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/powers-divisions/${divisionId}/members`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        },
      );

      if (response.ok) {
        await fetchDivisions();
        await fetchUsers();
        toast.success("Anggota berhasil dikeluarkan");
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal mengeluarkan anggota");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Gagal mengeluarkan anggota");
    }
  };

  const availableUsers = users.filter(
    (user) =>
      !user.powersDivision &&
      user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const availableHeads = users.filter(
    (user) =>
      (user.role === "CORE" || user.role === "COMMITTEE") &&
      user.status === "ACTIVE" &&
      (!user.powersDivision ||
        (editingDivision && user.powersDivision?.id === editingDivision.id)),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoaderOne />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Divisi POWERS</h1>
          </div>
          <p className="text-gray-600">
            Kelola divisi-divisi organisasi POWERS Politeknik Negeri Pontianak
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{divisions.length}</span>{" "}
            divisi
          </div>
          {currentUser?.role === "ADMIN" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-medium"
            >
              <Plus size={18} />
              Tambah Divisi
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {divisions.map((division) => (
            <div
              key={division.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-center">
                <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3">
                  <Building2 className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {division.name}
                </h3>
                {division.description && (
                  <p className="text-white/80 text-sm">
                    {division.description}
                  </p>
                )}
              </div>

              <div className="p-6">
                {division.head && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      {division.head.avatar ? (
                        <img
                          src={division.head.avatar}
                          alt={division.head.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Crown className="text-yellow-600" size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {division.head.name}
                      </p>
                      <p className="text-sm text-gray-600">Kepala Divisi</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <Users className="text-gray-400" size={18} />
                  <span className="text-gray-700">
                    {division._count.members} anggota
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedDivision(division);
                      setShowMembersModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                  >
                    <Users size={16} />
                    Anggota
                  </button>
                  <button
                    onClick={() => handleEditDivision(division)}
                    className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                  >
                    <Edit size={16} />
                  </button>
                  {currentUser?.role === "ADMIN" && (
                    <button
                      onClick={() => handleDeleteDivision(division.id)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition text-sm font-medium ${
                        deleteConfirm === division.id
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-red-100 hover:bg-red-200 text-red-700"
                      }`}
                    >
                      {deleteConfirm === division.id ? (
                        <AlertCircle size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {divisions.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">Belum ada divisi</p>
          </div>
        )}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Divisi Baru</DialogTitle>
            <DialogDescription>
              Buat divisi baru untuk organisasi POWERS
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Divisi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newDivision.name}
                onChange={(e) =>
                  setNewDivision({ ...newDivision, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Education"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={newDivision.description}
                onChange={(e) =>
                  setNewDivision({
                    ...newDivision,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Deskripsi divisi (opsional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kepala Divisi
              </label>
              <Select
                value={newDivision.headId}
                onValueChange={(value) =>
                  setNewDivision({ ...newDivision, headId: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Kepala Divisi (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada</SelectItem>
                  {availableHeads.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} - {user.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewDivision({ name: "", description: "", headId: "none" });
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleCreateDivision}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium flex items-center gap-2"
            >
              <Plus size={18} />
              Tambah Divisi
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Division Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Divisi</DialogTitle>
            <DialogDescription>Perbarui informasi divisi</DialogDescription>
          </DialogHeader>

          {editingDivision && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Divisi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingDivision.name}
                  onChange={(e) =>
                    setEditingDivision({
                      ...editingDivision,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={editingDivision.description}
                  onChange={(e) =>
                    setEditingDivision({
                      ...editingDivision,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kepala Divisi
                </label>
                <Select
                  value={editingDivision.headId}
                  onValueChange={(value) =>
                    setEditingDivision({ ...editingDivision, headId: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Kepala Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {availableHeads.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingDivision(null);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleUpdateDivision}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center gap-2"
            >
              <Save size={18} />
              Simpan Perubahan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members Modal */}
      <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={24} />
              Anggota Divisi {selectedDivision?.name}
            </DialogTitle>
            <DialogDescription>
              Kelola anggota divisi dan tambah anggota baru
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Members */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Anggota Saat Ini</h3>
              <div className="space-y-3">
                {selectedDivision?.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-blue-600 font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              member.role === "CORE"
                                ? "bg-blue-100 text-blue-800"
                                : member.role === "COMMITTEE"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {member.role}
                          </span>
                          {member.position && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              {member.position}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedDivision?.headId !== member.id && (
                      <button
                        onClick={() =>
                          handleRemoveMember(selectedDivision!.id, member.id)
                        }
                        className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition text-sm font-medium"
                      >
                        <UserMinus size={16} />
                        Keluarkan
                      </button>
                    )}
                  </div>
                ))}
                {selectedDivision?.members.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Belum ada anggota di divisi ini
                  </p>
                )}
              </div>
            </div>

            {/* Add New Members */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tambah Anggota</h3>
              <div className="mb-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Cari anggota..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-blue-600 font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === "CORE"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "COMMITTEE"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleAddMember(selectedDivision!.id, user.id)
                      }
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition text-sm font-medium"
                    >
                      <UserPlus size={16} />
                      Tambahkan
                    </button>
                  </div>
                ))}
                {availableUsers.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    {searchTerm
                      ? "Tidak ada anggota yang sesuai pencarian"
                      : "Semua anggota sudah tergabung dalam divisi"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setShowMembersModal(false);
                setSelectedDivision(null);
                setSearchTerm("");
              }}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-medium"
            >
              Tutup
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

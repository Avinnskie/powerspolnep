"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Calendar,
  Users,
  Settings,
  QrCode,
  Download,
  Printer,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Clock,
  MapPin,
  User,
  ArrowLeft,
} from "lucide-react";
import { LoaderOne } from "@/components/ui/loader";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Role } from "@/types/auth";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
  theme?: string;
  description?: string;
  slug: string;
  status: string;
  startAt?: string;
  endAt?: string;
  createdAt: string;
  chair: {
    id: string;
    name: string;
    email: string;
  };
  divisions: Division[];
  participants: EventParticipant[];
  sessions: EventSession[];
}

interface Division {
  id: string;
  name: string;
  head?: {
    id: string;
    name: string;
    email: string;
  };
  members: DivisionMember[];
}

interface DivisionMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface EventParticipant {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    powersDivision?: {
      name: string;
    };
  };
  hasAttended: boolean;
}

interface EventSession {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startAt?: string;
  endAt?: string;
}

interface AttendancePass {
  id: string;
  code: string;
  active: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "divisions" | "participants" | "sessions" | "passes"
  >("overview");
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showCreateDivision, setShowCreateDivision] = useState(false);
  const [showEditDivision, setShowEditDivision] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedDivisionForMember, setSelectedDivisionForMember] =
    useState<string>("");
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    location: "",
  });
  const [sessionStartDate, setSessionStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [sessionEndDate, setSessionEndDate] = useState<Date | undefined>(
    undefined,
  );

  const [newDivision, setNewDivision] = useState({
    name: "",
    headId: "",
  });

  const [newParticipant, setNewParticipant] = useState({
    userId: "",
    role: "COMMITTEE",
  });

  const [newMember, setNewMember] = useState({
    userId: "",
  });

  const [attendancePasses, setAttendancePasses] = useState<AttendancePass[]>(
    [],
  );
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

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

    if (eventId) {
      fetchEventDetail();
      fetchUsers();
      fetchAttendancePasses();
    }
  }, [router, eventId]);

  // Auto-refresh attendance data when participants tab is active
  useEffect(() => {
    if (activeTab === "participants" && eventId) {
      const interval = setInterval(() => {
        fetchEventDetail();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab, eventId]);

  const fetchEventDetail = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const result = await response.json();
        console.log("Event data:", result.data);
        console.log("Divisions:", result.data.divisions);
        if (result.data.divisions && result.data.divisions.length > 0) {
          console.log(
            "First division members:",
            result.data.divisions[0].members,
          );
        }
        setEvent(result.data);
      }
    } catch (error) {
      console.error("Error fetching event detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setAvailableUsers(result.data);
      } else {
        console.error(
          "Failed to fetch users:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAttendancePasses = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/events/${eventId}/passes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setAttendancePasses(result.data || []);

        // Generate QR codes for all passes
        const codes: Record<string, string> = {};
        for (const pass of result.data || []) {
          try {
            const qrDataUrl = await QRCode.toDataURL(pass.code, {
              width: 256,
              margin: 2,
            });
            codes[pass.id] = qrDataUrl;
          } catch (error) {
            console.error(
              `Error generating QR code for pass ${pass.id}:`,
              error,
            );
          }
        }
        setQrCodes(codes);
      }
    } catch (error) {
      console.error("Error fetching attendance passes:", error);
    }
  };

  const generateAttendancePasses = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/events/${eventId}/passes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("QR passes berhasil di-generate");
        await fetchAttendancePasses();
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal generate passes");
      }
    } catch (error) {
      console.error("Error generating passes:", error);
      toast.error("Gagal generate passes");
    }
  };

  const createSession = async () => {
    if (!newSession.title) {
      toast.error("Judul sesi wajib diisi");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const sessionData = {
        ...newSession,
        startAt: sessionStartDate?.toISOString(),
        endAt: sessionEndDate?.toISOString(),
      };
      const response = await fetch(`/api/events/${eventId}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        toast.success(`Sesi "${newSession.title}" berhasil dibuat`);
        await fetchEventDetail();
        setShowCreateSession(false);
        setNewSession({
          title: "",
          description: "",
          location: "",
        });
        setSessionStartDate(undefined);
        setSessionEndDate(undefined);
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal membuat sesi");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Gagal membuat sesi");
    }
  };

  const createDivision = async () => {
    if (!newDivision.name) {
      toast.error("Nama divisi wajib diisi");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/events/${eventId}/divisions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDivision),
      });

      if (response.ok) {
        toast.success(`Divisi "${newDivision.name}" berhasil dibuat`);
        await fetchEventDetail();
        setShowCreateDivision(false);
        setNewDivision({ name: "", headId: "" });
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal membuat divisi");
      }
    } catch (error) {
      console.error("Error creating division:", error);
      toast.error("Gagal membuat divisi");
    }
  };

  const updateDivision = async () => {
    if (!editingDivision?.name) {
      toast.error("Nama divisi wajib diisi");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/events/${eventId}/divisions/${editingDivision.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editingDivision.name,
            headId: editingDivision.head?.id || null,
          }),
        },
      );

      if (response.ok) {
        toast.success(`Divisi "${editingDivision.name}" berhasil diperbarui`);
        await fetchEventDetail();
        setShowEditDivision(false);
        setEditingDivision(null);
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal memperbarui divisi");
      }
    } catch (error) {
      console.error("Error updating division:", error);
      toast.error("Gagal memperbarui divisi");
    }
  };

  const printPasses = () => {
    const printContent = document.getElementById("qr-codes-print");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Passes - ${event?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .pass-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .pass-card { border: 2px solid #000; padding: 15px; text-align: center; page-break-inside: avoid; }
            .qr-code { margin: 10px 0; }
            .user-name { font-weight: bold; font-size: 14px; margin: 5px 0; }
            .event-name { font-size: 12px; color: #666; }
            .pass-code { font-size: 10px; font-family: monospace; margin-top: 10px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const downloadAllQRCodes = () => {
    const zip = document.createElement("a");
    // For now, just download the first QR code as an example
    if (attendancePasses.length > 0 && qrCodes[attendancePasses[0].id]) {
      zip.href = qrCodes[attendancePasses[0].id];
      zip.download = `${event?.name}_attendance_passes.png`;
      zip.click();
    }
  };

  const canManage =
    currentUser?.role === "ADMIN" || currentUser?.role === "CORE";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoaderOne />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Event tidak ditemukan
          </h1>
          <button
            onClick={() => router.push("/dashboard/events")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Kembali ke Events
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PLANNING":
        return "bg-yellow-100 text-yellow-800";
      case "ONGOING":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push("/dashboard/events")}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <Calendar className="text-blue-600" size={32} />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              {event.theme && <p className="text-gray-600">{event.theme}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(event.status)}`}
              >
                {event.status}
              </span>
              {canManage && (
                <button
                  onClick={async () => {
                    if (
                      !confirm(
                        `Hapus event "${event.name}"? Semua data divisi, anggota, dan sesi akan ikut terhapus. Tindakan ini tidak dapat dibatalkan!`,
                      )
                    )
                      return;
                    try {
                      const token = localStorage.getItem("auth_token");
                      const res = await fetch(`/api/events/${eventId}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (res.ok) {
                        toast.success("Event berhasil dihapus");
                        router.push("/dashboard/events");
                      } else {
                        const r = await res.json();
                        toast.error(r.message || "Gagal menghapus event");
                      }
                    } catch (err) {
                      console.error("Delete event error:", err);
                      toast.error("Gagal menghapus event");
                    }
                  }}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                  title="Hapus Event"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { key: "overview", label: "Overview", icon: Eye },
              { key: "divisions", label: "Divisi", icon: Users },
              { key: "participants", label: "Kehadiran", icon: UserPlus },
              { key: "sessions", label: "Agenda", icon: Clock },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition ${
                  activeTab === key
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <Users className="text-blue-600 mb-2" size={24} />
                    <p className="text-2xl font-bold text-blue-900">
                      {event.participants?.length || 0}
                    </p>
                    <p className="text-blue-700">Total Anggota</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <Users className="text-green-600 mb-2" size={24} />
                    <p className="text-2xl font-bold text-green-900">
                      {event.participants?.filter((p) => p.hasAttended)
                        .length || 0}
                    </p>
                    <p className="text-green-700">Sudah Hadir</p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <Calendar className="text-orange-600 mb-2" size={24} />
                    <p className="text-2xl font-bold text-orange-900">
                      {event.divisions?.length || 0}
                    </p>
                    <p className="text-orange-700">Divisi</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <Clock className="text-purple-600 mb-2" size={24} />
                    <p className="text-2xl font-bold text-purple-900">
                      {event.sessions?.length || 0}
                    </p>
                    <p className="text-purple-700">Agenda</p>
                  </div>
                </div>

                {/* Attendance Progress Bar */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Progress Kehadiran
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-green-500 h-4 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              event.participants?.length
                                ? (event.participants.filter(
                                    (p) => p.hasAttended,
                                  ).length /
                                    event.participants.length) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {event.participants?.length
                        ? Math.round(
                            (event.participants.filter((p) => p.hasAttended)
                              .length /
                              event.participants.length) *
                              100,
                          )
                        : 0}
                      %
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Ketua Panitia
                  </h3>
                  <div className="flex items-center gap-3">
                    <User className="text-gray-400" size={20} />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {event.chair.name}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {event.chair.email}
                      </p>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Deskripsi</h3>
                    <p className="text-gray-700">{event.description}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "divisions" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Divisi Event
                  </h2>
                  {canManage && (
                    <button
                      onClick={() => setShowCreateDivision(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
                    >
                      <Plus size={18} />
                      Tambah Divisi
                    </button>
                  )}
                </div>

                {!event.divisions || event.divisions.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">Belum ada divisi</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {event.divisions.map((division) => (
                      <div
                        key={division.id}
                        className="bg-gray-50 p-6 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-gray-900">
                            {division.name}
                          </h3>
                          {canManage && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingDivision(division);
                                  setShowEditDivision(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit Divisi"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (
                                    !confirm(
                                      `Hapus divisi "${division.name}"? Semua anggota divisi akan ikut terhapus.`,
                                    )
                                  )
                                    return;
                                  try {
                                    const token =
                                      localStorage.getItem("auth_token");
                                    const res = await fetch(
                                      `/api/events/${eventId}/divisions/${division.id}`,
                                      {
                                        method: "DELETE",
                                        headers: {
                                          Authorization: `Bearer ${token}`,
                                        },
                                      },
                                    );
                                    if (res.ok) {
                                      toast.success(
                                        `Divisi "${division.name}" berhasil dihapus`,
                                      );
                                      await fetchEventDetail();
                                    } else {
                                      const r = await res.json();
                                      toast.error(
                                        r.message || "Gagal menghapus divisi",
                                      );
                                    }
                                  } catch (err) {
                                    console.error(
                                      "Delete division error:",
                                      err,
                                    );
                                    toast.error("Gagal menghapus divisi");
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Hapus Divisi"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                        {division.head && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">
                              Kepala Divisi:
                            </p>
                            <p className="font-semibold text-gray-900">
                              {division.head.name}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">
                            {division.members?.length || 0} anggota
                          </p>
                          {canManage && (
                            <button
                              onClick={() => {
                                setSelectedDivisionForMember(division.id);
                                setShowAddMember(true);
                              }}
                              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                            >
                              <UserPlus size={14} /> Tambah Anggota
                            </button>
                          )}
                        </div>

                        {division.members && division.members.length > 0 && (
                          <div className="space-y-2">
                            {division.members.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center justify-between bg-white p-2 rounded border"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {m.user.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {m.user.email}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Anggota
                                  </p>
                                </div>
                                {canManage && (
                                  <button
                                    onClick={async () => {
                                      if (
                                        !confirm(
                                          `Hapus anggota ${m.user.name}?`,
                                        )
                                      )
                                        return;
                                      try {
                                        const token =
                                          localStorage.getItem("auth_token");
                                        const res = await fetch(
                                          `/api/events/${eventId}/divisions/${division.id}/members/${m.id}`,
                                          {
                                            method: "DELETE",
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                            },
                                          },
                                        );
                                        if (res.ok) {
                                          toast.success(
                                            `Anggota ${m.user.name} berhasil dihapus`,
                                          );
                                          await fetchEventDetail();
                                        } else {
                                          const r = await res.json();
                                          toast.error(
                                            r.message ||
                                              "Gagal menghapus anggota",
                                          );
                                        }
                                      } catch (err) {
                                        console.error(
                                          "Delete member error:",
                                          err,
                                        );
                                        toast.error("Gagal menghapus anggota");
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                    title="Hapus"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "participants" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Daftar Kehadiran
                  </h2>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-gray-600">
                      Hadir:{" "}
                      <span className="font-semibold text-green-600">
                        {event.participants?.filter((p) => p.hasAttended)
                          .length || 0}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      Total:{" "}
                      <span className="font-semibold">
                        {event.participants?.length || 0}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      Persentase:{" "}
                      <span className="font-semibold text-blue-600">
                        {event.participants?.length
                          ? Math.round(
                              (event.participants.filter((p) => p.hasAttended)
                                .length /
                                event.participants.length) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {!event.participants || event.participants.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">Tidak ada data peserta</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Peserta yang sudah absen */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-green-600" />
                        Sudah Absen (
                        {
                          event.participants.filter((p) => p.hasAttended).length
                        }{" "}
                        orang)
                      </h3>

                      {event.participants.filter((p) => p.hasAttended)
                        .length === 0 ? (
                        <p className="text-green-700 text-center py-4">
                          Belum ada yang absen
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {event.participants
                            .filter((participant) => participant.hasAttended)
                            .map((participant) => (
                              <div
                                key={participant.id}
                                className="bg-white p-4 rounded-lg border border-green-200 shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                                    {participant.user.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">
                                      {participant.user.name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {participant.user.email}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                                        ✓ Hadir
                                      </span>
                                      {participant.user.powersDivision && (
                                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                                          {participant.user.powersDivision.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Peserta yang belum absen */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-red-600" />
                        Belum Absen (
                        {
                          event.participants.filter((p) => !p.hasAttended)
                            .length
                        }{" "}
                        orang)
                      </h3>

                      {event.participants.filter((p) => !p.hasAttended)
                        .length === 0 ? (
                        <p className="text-red-700 text-center py-4">
                          Semua sudah absen! 🎉
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {event.participants
                            .filter((participant) => !participant.hasAttended)
                            .map((participant) => (
                              <div
                                key={participant.id}
                                className="bg-white p-4 rounded-lg border border-red-200 shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                                    {participant.user.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">
                                      {participant.user.name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {participant.user.email}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-800">
                                        ✗ Belum Hadir
                                      </span>
                                      {participant.user.powersDivision && (
                                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                                          {participant.user.powersDivision.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "sessions" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Agenda Event
                  </h2>
                  {canManage && (
                    <button
                      onClick={() => setShowCreateSession(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
                    >
                      <Plus size={18} />
                      Tambah Agenda
                    </button>
                  )}
                </div>

                {!event.sessions || event.sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">Belum ada agenda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {event.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="bg-gray-50 p-6 rounded-lg"
                      >
                        <h3 className="font-bold text-gray-900 mb-2">
                          {session.title}
                        </h3>
                        {session.description && (
                          <p className="text-gray-700 mb-3">
                            {session.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {session.startAt && (
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              <span>
                                {new Date(session.startAt).toLocaleString(
                                  "id-ID",
                                )}
                              </span>
                            </div>
                          )}
                          {session.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={16} />
                              <span>{session.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "passes" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    QR Code Passes
                  </h2>
                  {canManage && (
                    <div className="flex gap-2">
                      <button
                        onClick={generateAttendancePasses}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
                      >
                        <QrCode size={18} />
                        Generate Passes
                      </button>
                      {attendancePasses.length > 0 && (
                        <>
                          <button
                            onClick={printPasses}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-medium"
                          >
                            <Printer size={18} />
                            Print
                          </button>
                          <button
                            onClick={downloadAllQRCodes}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition font-medium"
                          >
                            <Download size={18} />
                            Download
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* {attendancePasses.length === 0 ? (
                  <div className="text-center py-12">
                    <QrCode className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">
                      Belum ada QR passes yang di-generate
                    </p>
                    {canManage && (
                      <p className="text-sm text-gray-500 mt-2">
                        Klik "Generate Passes" untuk membuat QR code untuk semua
                        peserta
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    id="qr-codes-print"
                    className="pass-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {attendancePasses.map((pass) => (
                      <div
                        key={pass.id}
                        className="pass-card bg-white border-2 border-gray-300 p-6 rounded-lg text-center"
                      >
                        <h3 className="user-name font-bold text-lg text-gray-900 mb-2">
                          {pass.user.name}
                        </h3>
                        <p className="event-name text-sm text-gray-600 mb-4">
                          {event.name}
                        </p>
                        <div className="qr-code flex justify-center mb-4">
                          {qrCodes[pass.id] ? (
                            <img
                              src={qrCodes[pass.id]}
                              alt={`QR Code for ${pass.user.name}`}
                              className="w-32 h-32"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded">
                              <QrCode className="text-gray-400" size={48} />
                            </div>
                          )}
                        </div>
                        <p className="pass-code text-xs text-gray-500 font-mono break-all">
                          {pass.code}
                        </p>
                      </div>
                    ))}
                  </div>
                )} */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}

      {/* Edit Division Modal */}
      <Dialog open={showEditDivision} onOpenChange={setShowEditDivision}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Divisi</DialogTitle>
            <DialogDescription>Perbarui informasi divisi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Divisi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingDivision?.name || ""}
                onChange={(e) =>
                  setEditingDivision((prev) =>
                    prev ? { ...prev, name: e.target.value } : null,
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Programming, Design, Marketing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kepala Divisi
              </label>
              <Combobox
                items={availableUsers
                  .filter((u) => u.role === "CORE" || u.role === "COMMITTEE")
                  .map((u) => ({
                    value: u.id,
                    label: `${u.name}`,
                    email: u.email,
                  }))}
                value={editingDivision?.head?.id || ""}
                onSelect={(v) => {
                  const selectedUser = availableUsers.find((u) => u.id === v);
                  setEditingDivision((prev) =>
                    prev
                      ? {
                          ...prev,
                          head: selectedUser
                            ? {
                                id: selectedUser.id,
                                name: selectedUser.name,
                                email: selectedUser.email,
                              }
                            : undefined,
                        }
                      : null,
                  );
                }}
                placeholder="Pilih kepala divisi..."
                searchPlaceholder="Cari nama atau email..."
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowEditDivision(false);
                setEditingDivision(null);
              }}
              className="px-4 py-2 rounded border"
            >
              Batal
            </button>
            <button
              onClick={updateDivision}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Perbarui
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Anggota Divisi</DialogTitle>
            <DialogDescription>
              Pilih user untuk ditambahkan ke divisi sebagai anggota
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih User
              </label>
              <Combobox
                items={availableUsers.map((u) => ({
                  value: u.id,
                  label: `${u.name}`,
                  email: u.email,
                }))}
                value={newMember.userId}
                onSelect={(v) => setNewMember({ ...newMember, userId: v })}
                placeholder="Cari nama atau email..."
                searchPlaceholder="Cari nama atau email..."
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowAddMember(false)}
              className="px-4 py-2 rounded border"
            >
              Batal
            </button>
            <button
              onClick={async () => {
                if (!selectedDivisionForMember || !newMember.userId) {
                  toast.error("User harus dipilih");
                  return;
                }
                try {
                  const token = localStorage.getItem("auth_token");
                  const res = await fetch(
                    `/api/events/${eventId}/divisions/${selectedDivisionForMember}/members`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        userId: newMember.userId,
                        role: "MEMBER",
                      }),
                    },
                  );
                  if (res.ok) {
                    toast.success("Anggota berhasil ditambahkan");
                    await fetchEventDetail();
                    setShowAddMember(false);
                    setNewMember({ userId: "" });
                  } else {
                    const r = await res.json();
                    toast.error(r.message || "Gagal menambah anggota");
                  }
                } catch (err) {
                  console.error("Add member error:", err);
                  toast.error("Gagal menambah anggota");
                }
              }}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Simpan
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateSession} onOpenChange={setShowCreateSession}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Agenda/Sesi Baru</DialogTitle>
            <DialogDescription>
              Buat agenda atau sesi untuk event ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newSession.title}
                onChange={(e) =>
                  setNewSession({ ...newSession, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Opening Ceremony"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={newSession.description}
                onChange={(e) =>
                  setNewSession({ ...newSession, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Deskripsi agenda..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi
              </label>
              <input
                type="text"
                value={newSession.location}
                onChange={(e) =>
                  setNewSession({ ...newSession, location: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Aula Utama"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mulai
                </label>
                <DateTimePicker
                  value={sessionStartDate}
                  onChange={setSessionStartDate}
                  placeholder="Pilih waktu mulai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selesai
                </label>
                <DateTimePicker
                  value={sessionEndDate}
                  onChange={setSessionEndDate}
                  placeholder="Pilih waktu selesai"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowCreateSession(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
            >
              Batal
            </button>
            <button
              onClick={createSession}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Tambah Agenda
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDivision} onOpenChange={setShowCreateDivision}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Divisi Baru</DialogTitle>
            <DialogDescription>Buat divisi untuk event ini</DialogDescription>
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
                placeholder="Contoh: Acara"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kepala Divisi
              </label>
              <Combobox
                items={availableUsers.map((user) => ({
                  value: user.id,
                  label: user.name,
                  email: user.email,
                }))}
                value={newDivision.headId}
                onSelect={(value) =>
                  setNewDivision({ ...newDivision, headId: value })
                }
                placeholder="Pilih kepala divisi"
                searchPlaceholder="Cari nama atau email..."
                emptyText="Tidak ada user ditemukan"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowCreateDivision(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
            >
              Batal
            </button>
            <button
              onClick={createDivision}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Tambah Divisi
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Plus,
  Users,
  Clock,
  MapPin,
  User,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  QrCode,
  UserPlus,
} from "lucide-react";
import { LoaderOne } from "@/components/ui/loader";
import { toast } from "sonner";
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
  _count: {
    participants: number;
    attendees: number;
    divisions: number;
    sessions: number;
  };
}

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export default function EventsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [possibleChairs, setPossibleChairs] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [newEvent, setNewEvent] = useState({
    name: "",
    theme: "",
    description: "",
    chairId: "",
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

    fetchEvents();
    fetchUsers();
  }, [router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const result = await response.json();
        setEvents(result.data);
        setFilteredEvents(result.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/users?role=CORE", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setPossibleChairs(result.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.theme?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.chair.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  }, [searchTerm, statusFilter, events]);

  const canManage =
    currentUser?.role === "ADMIN" || currentUser?.role === "CORE";

  const handleCreateEvent = async () => {
    if (!newEvent.name || !newEvent.chairId) {
      toast.error("Name dan ketua panitia wajib diisi");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const eventData = {
        ...newEvent,
        startAt: startDate?.toISOString(),
        endAt: endDate?.toISOString(),
      };
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        await fetchEvents();
        setShowCreateModal(false);
        setNewEvent({
          name: "",
          theme: "",
          description: "",
          chairId: "",
        });
        setStartDate(undefined);
        setEndDate(undefined);
        toast.success("Event berhasil dibuat");
      } else {
        const result = await response.json();
        toast.error(result.message || "Gagal membuat event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Gagal membuat event");
    }
  };

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
            <Calendar className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">
              Event Management
            </h1>
          </div>
          <p className="text-gray-600">
            Kelola seluruh program kerja dan event POWERS
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari nama event, tema, atau ketua..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                size={20}
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full pl-10 pr-4 py-2.5">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-start-3">
              {canManage && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Buat Event Baru
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Menampilkan{" "}
            <span className="font-semibold">{filteredEvents.length}</span> dari{" "}
            <span className="font-semibold">{events.length}</span> event
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/dashboard/events/${event.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer overflow-hidden"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{event.name}</h3>
                    {event.theme && (
                      <p className="text-blue-100 text-sm">{event.theme}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(event.status)}`}
                  >
                    {event.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-blue-100 text-sm">
                  <User size={16} />
                  <span>Ketua: {event.chair.name}</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {event.description && (
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {event.description}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Users className="mx-auto text-gray-400 mb-1" size={20} />
                    <p className="text-lg font-bold text-gray-900">
                      {event._count?.attendees || 0}/
                      {event._count?.participants || 0}
                    </p>
                    <p className="text-xs text-gray-600">Kehadiran</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Calendar
                      className="mx-auto text-gray-400 mb-1"
                      size={20}
                    />
                    <p className="text-lg font-bold text-gray-900">
                      {event._count?.divisions || 0}
                    </p>
                    <p className="text-xs text-gray-600">Divisi</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Clock className="mx-auto text-gray-400 mb-1" size={20} />
                    <p className="text-lg font-bold text-gray-900">
                      {event._count?.sessions || 0}
                    </p>
                    <p className="text-xs text-gray-600">Agenda</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">Tidak ada event ditemukan</p>
          </div>
        )}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat Event Baru</DialogTitle>
            <DialogDescription>
              Lengkapi informasi untuk membuat program kerja atau event baru
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Event <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newEvent.name}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: POWERS Tech Summit 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <input
                type="text"
                value={newEvent.theme}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, theme: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Menuju Era Digital"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ketua Panitia <span className="text-red-500">*</span>
              </label>
              <Combobox
                items={possibleChairs.map((user) => ({
                  value: user.id,
                  label: user.name,
                  email: user.email,
                }))}
                value={newEvent.chairId}
                onSelect={(value) =>
                  setNewEvent({ ...newEvent, chairId: value })
                }
                placeholder="Pilih ketua panitia"
                searchPlaceholder="Cari nama atau email..."
                emptyText="Tidak ada ketua panitia ditemukan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Deskripsi detail tentang event..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <DateTimePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Pilih tanggal mulai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai
                </label>
                <DateTimePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Pilih tanggal selesai"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewEvent({
                  name: "",
                  theme: "",
                  description: "",
                  chairId: "",
                });
                setStartDate(undefined);
                setEndDate(undefined);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleCreateEvent}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center gap-2"
            >
              <Plus size={18} />
              Buat Event
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

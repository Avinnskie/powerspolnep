"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Keyboard,
  History,
} from "lucide-react";
import { LoaderOne } from "@/components/ui/loader";
import QrScanner from "qr-scanner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "@/types/auth";

interface Event {
  id: string;
  name: string;
  theme?: string;
  status: string;
}

interface AttendanceRecord {
  id: string;
  checkInAt: string;
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

export default function AttendancePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [scannerActive, setScannerActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [recentAttendances, setRecentAttendances] = useState<
    AttendanceRecord[]
  >([]);
  const [scanResult, setScanResult] = useState<{
    type: "success" | "error";
    message: string;
    userName?: string;
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
    } catch (error) {
      console.error("Token decode error:", error);
      router.push("/login");
    }

    fetchEvents();
    setLoading(false);
  }, [router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const result = await response.json();
        setEvents(result.data.filter((e: Event) => e.status !== "COMPLETED"));
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const initializeScanner = async () => {
    if (!videoRef.current || !selectedEvent) return;

    try {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          handleScanResult(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        },
      );

      qrScannerRef.current = qrScanner;
      await qrScanner.start();
      setScannerActive(true);
    } catch (error) {
      console.error("Scanner initialization error:", error);
      setScanResult({
        type: "error",
        message:
          "Gagal mengaktifkan kamera. Pastikan browser memiliki akses kamera.",
      });
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
      setScannerActive(false);
    }
  };

  const handleScanResult = async (code: string) => {
    if (!selectedEvent) return;

    try {
      const response = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim(),
          eventId: selectedEvent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Fetch user info for the attendance
        const userResponse = await fetch(`/api/users/${result.data.userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        let userName = "Unknown User";
        if (userResponse.ok) {
          const userResult = await userResponse.json();
          userName = userResult.data.name;
        }

        setScanResult({
          type: "success",
          message: "Absensi berhasil dicatat",
          userName,
        });

        // Add to recent attendances
        setRecentAttendances((prev) => [
          {
            id: result.data.id,
            checkInAt: result.data.checkInAt,
            user: {
              id: result.data.userId,
              name: userName,
              email: "user@example.com",
            },
          },
          ...prev.slice(0, 9), // Keep last 10
        ]);

        // Auto-clear success message after 3 seconds
        setTimeout(() => setScanResult(null), 3000);
      } else {
        setScanResult({
          type: "error",
          message: result.message || "Kode tidak valid",
        });
        setTimeout(() => setScanResult(null), 5000);
      }
    } catch (error) {
      console.error("Scan error:", error);
      setScanResult({
        type: "error",
        message: "Terjadi kesalahan saat memproses absensi",
      });
      setTimeout(() => setScanResult(null), 5000);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    await handleScanResult(manualCode);
    setManualCode("");
  };

  const canScan = currentUser?.role === "ADMIN" || currentUser?.role === "CORE";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoaderOne />
      </div>
    );
  }

  if (!canScan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Akses Ditolak
          </h1>
          <p className="text-gray-600">
            Anda tidak memiliki izin untuk mengakses halaman absensi
          </p>
        </div>
      </div>
    );
  }

  const selectedEventData = events.find((e) => e.id === selectedEvent);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <QrCode className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">
              Absensi Scanner
            </h1>
          </div>
          <p className="text-gray-600">
            Scan barcode atau QR code untuk mencatat kehadiran
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Scanner Setup
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Event
                  </label>
                  <Select
                    value={selectedEvent}
                    onValueChange={setSelectedEvent}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name} {event.theme && `- ${event.theme}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEventData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Event Info
                    </h3>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{selectedEventData.name}</span>
                      </div>
                      {selectedEventData.theme && (
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>{selectedEventData.theme}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Scanner */}
              <div className="p-6">
                <div
                  className="relative bg-black rounded-lg overflow-hidden mb-4"
                  style={{ aspectRatio: "4/3" }}
                >
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />
                  {!scannerActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                      <div className="text-center text-white">
                        <Camera size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-semibold">
                          Kamera Tidak Aktif
                        </p>
                        <p className="text-sm opacity-75">
                          Pilih event dan sesi, lalu aktifkan scanner
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={initializeScanner}
                    disabled={!selectedEvent || scannerActive}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition font-medium"
                  >
                    <Camera size={18} />
                    Aktifkan Scanner
                  </button>
                  <button
                    onClick={stopScanner}
                    disabled={!scannerActive}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition font-medium"
                  >
                    <CameraOff size={18} />
                    Hentikan Scanner
                  </button>
                </div>

                {/* Manual Input */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mb-3"
                  >
                    <Keyboard size={16} />
                    Input Manual
                  </button>

                  {showManualInput && (
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Masukkan kode barcode"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <button
                        type="submit"
                        disabled={!selectedEvent || !manualCode.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium text-sm"
                      >
                        Submit
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Scan Result */}
            {scanResult && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  {scanResult.type === "success" ? (
                    <CheckCircle
                      className="mx-auto text-green-500 mb-3"
                      size={48}
                    />
                  ) : (
                    <XCircle className="mx-auto text-red-500 mb-3" size={48} />
                  )}
                  <h3
                    className={`text-lg font-bold mb-2 ${
                      scanResult.type === "success"
                        ? "text-green-900"
                        : "text-red-900"
                    }`}
                  >
                    {scanResult.type === "success" ? "Berhasil!" : "Gagal"}
                  </h3>
                  <p
                    className={`text-sm ${
                      scanResult.type === "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {scanResult.message}
                  </p>
                  {scanResult.userName && (
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {scanResult.userName}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recent Attendances */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <History size={20} className="text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Absensi Terbaru
                  </h3>
                </div>
                <p className="text-sm text-gray-600">Event ini</p>
              </div>
              <div className="p-6">
                {recentAttendances.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Users size={32} className="mx-auto mb-3 opacity-50" />
                    <p>Belum ada yang absen</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAttendances.map((attendance) => (
                      <div
                        key={attendance.id}
                        className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <CheckCircle size={16} className="text-green-600" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {attendance.user.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(attendance.checkInAt).toLocaleTimeString(
                              "id-ID",
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

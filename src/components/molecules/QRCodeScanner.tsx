"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CameraOff,
  Keyboard,
  Scan,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import QrScanner from "qr-scanner";

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    user: {
      name: string;
      memberCode: string;
      nim?: string;
      role: string;
      division?: string;
    };
    attendance?: {
      checkInAt: string;
      status: string;
    };
    session?: {
      title: string;
      event: string;
    };
    scannedBy?: string;
  };
}

interface QRCodeScannerProps {
  sessionId: string;
  eventId?: string;
  onScanSuccess?: (result: ScanResult) => void;
  className?: string;
}

export default function QRCodeScanner({
  sessionId,
  eventId,
  onScanSuccess,
  className,
}: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [memberCode, setMemberCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // Initialize QR Scanner
  useEffect(() => {
    if (isScanning && videoRef.current) {
      initializeScanner();
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, [isScanning]);

  const initializeScanner = async () => {
    if (!videoRef.current) return;

    try {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          handleQRScan(result.data);
        },
        {
          onDecodeError: (error) => {
            // Silently ignore decode errors
            console.log("QR decode error:", error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment",
        },
      );

      await qrScannerRef.current.start();
    } catch (error) {
      console.error("Failed to initialize QR scanner:", error);
      toast.error("Gagal mengakses kamera. Gunakan input manual.");
      setIsScanning(false);
      setManualMode(true);
    }
  };

  const handleQRScan = async (scannedCode: string) => {
    if (loading) return; // Prevent multiple scans

    // Extract member code dari QR code
    // QR code berisi member code langsung (contoh: PWR2301)
    const memberCode = scannedCode.trim();

    await performAttendanceScan(memberCode);
  };

  const handleManualScan = async () => {
    if (!memberCode.trim()) {
      toast.error("Masukkan kode anggota terlebih dahulu");
      return;
    }

    await performAttendanceScan(memberCode.trim().toUpperCase());
  };

  const performAttendanceScan = async (code: string) => {
    try {
      setLoading(true);

      const response = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberCode: code,
          sessionId,
          ...(eventId && { eventId }),
        }),
      });

      const result: ScanResult = await response.json();

      setLastResult(result);

      // Add to recent scans
      setRecentScans((prev) => [result, ...prev.slice(0, 4)]); // Keep only 5 recent

      if (result.success) {
        toast.success(result.message);
        setMemberCode(""); // Clear manual input
      } else {
        toast.error(result.message);
      }

      if (onScanSuccess) {
        onScanSuccess(result);
      }
    } catch (error) {
      console.error("Scan error:", error);
      const errorResult: ScanResult = {
        success: false,
        message: "Gagal memproses scan. Coba lagi.",
      };
      setLastResult(errorResult);
      toast.error("Gagal memproses scan");
    } finally {
      setLoading(false);
    }
  };

  const toggleScanning = () => {
    if (isScanning) {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    }
    setIsScanning(!isScanning);
    setManualMode(false);
  };

  const toggleManualMode = () => {
    if (isScanning) {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
      setIsScanning(false);
    }
    setManualMode(!manualMode);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Scanner Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Scanner Kehadiran
            </div>
            <div className="flex gap-2">
              <Button
                onClick={toggleScanning}
                variant={isScanning ? "default" : "outline"}
                size="sm"
              >
                {isScanning ? (
                  <CameraOff className="h-4 w-4" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {isScanning ? "Stop" : "Kamera"}
              </Button>
              <Button
                onClick={toggleManualMode}
                variant={manualMode ? "default" : "outline"}
                size="sm"
              >
                <Keyboard className="h-4 w-4" />
                Manual
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Scanner */}
          {isScanning && (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded-lg bg-black"
                style={{ aspectRatio: "1" }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-white border-dashed rounded-lg w-48 h-48 flex items-center justify-center">
                  <p className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                    Arahkan QR Code di sini
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Input */}
          {manualMode && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode anggota (contoh: PWR2301)"
                  value={memberCode}
                  onChange={(e) => setMemberCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleManualScan();
                    }
                  }}
                  className="font-mono"
                  disabled={loading}
                />
                <Button
                  onClick={handleManualScan}
                  disabled={loading || !memberCode.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Scan className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Masukkan kode anggota POWERS (format: PWR + 4 digit)
              </p>
            </div>
          )}

          {/* Scan Result */}
          {lastResult && (
            <div
              className={`rounded-lg p-4 border ${
                lastResult.success
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                  : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {lastResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium text-sm ${
                      lastResult.success
                        ? "text-green-900 dark:text-green-100"
                        : "text-red-900 dark:text-red-100"
                    }`}
                  >
                    {lastResult.message}
                  </p>

                  {lastResult.data?.user && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="font-medium">
                          {lastResult.data.user.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {lastResult.data.user.memberCode}
                        </Badge>
                        {lastResult.data.user.role && (
                          <Badge variant="secondary" className="text-xs">
                            {lastResult.data.user.role}
                          </Badge>
                        )}
                      </div>
                      {lastResult.data.user.division && (
                        <p className="text-xs text-muted-foreground">
                          Divisi: {lastResult.data.user.division}
                        </p>
                      )}
                      {lastResult.data.attendance?.checkInAt && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(
                              lastResult.data.attendance.checkInAt,
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scan Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentScans.map((scan, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {scan.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {scan.data?.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scan.data?.user?.memberCode}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={scan.success ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {scan.success ? "Hadir" : "Gagal"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

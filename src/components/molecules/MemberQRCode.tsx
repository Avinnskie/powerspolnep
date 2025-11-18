"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, CheckCircle, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface QRCodeData {
  memberCode: string;
  qrCodeDataURL: string;
  user: {
    name: string;
    email: string;
    nim?: string;
    angkatan?: string;
  };
}

interface MemberQRCodeProps {
  userId?: string; // Jika tidak ada, akan ambil dari user yang sedang login
  className?: string;
}

export default function MemberQRCode({ userId, className }: MemberQRCodeProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchQRCode();
  }, [userId]);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (userId) {
        // Admin generate QR untuk user lain
        response = await fetch("/api/users/qrcode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });
      } else {
        // User generate QR untuk dirinya sendiri
        response = await fetch("/api/users/qrcode");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate QR code");
      }

      const data = await response.json();
      setQrData(data);
    } catch (err) {
      console.error("Error fetching QR code:", err);
      setError(err instanceof Error ? err.message : "Failed to load QR code");
      toast.error("Gagal memuat QR code");
    } finally {
      setLoading(false);
    }
  };

  const copyMemberCode = async () => {
    if (!qrData?.memberCode) return;

    try {
      await navigator.clipboard.writeText(qrData.memberCode);
      setCopied(true);
      toast.success("Kode anggota berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Gagal menyalin kode anggota");
    }
  };

  const downloadQRCode = () => {
    if (!qrData?.qrCodeDataURL || !qrData?.user?.name) return;

    const link = document.createElement("a");
    link.download = `POWERS-${qrData.memberCode}-${qrData.user.name.replace(/\s+/g, "_")}.png`;
    link.href = qrData.qrCodeDataURL;
    link.click();

    toast.success("QR Code berhasil diunduh!");
  };

  const refreshQRCode = () => {
    fetchQRCode();
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Generating QR Code...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="text-red-500">
              <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-600 mb-2">
                Gagal memuat QR Code
              </p>
              <p className="text-xs text-muted-foreground mb-4">{error}</p>
              <Button onClick={refreshQRCode} variant="outline" size="sm">
                Coba Lagi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!qrData) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Anggota
          </div>
          <Badge variant="secondary" className="text-xs">
            {qrData.memberCode}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">{qrData.user.name}</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{qrData.user.email}</p>
            {qrData.user.nim && <p>NIM: {qrData.user.nim}</p>}
            {qrData.user.angkatan && <p>Angkatan: {qrData.user.angkatan}</p>}
          </div>
        </div>

        {/* QR Code Display */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <Image
                src={qrData.qrCodeDataURL}
                alt={`QR Code ${qrData.memberCode}`}
                width={250}
                height={250}
                className="block"
                priority
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <Badge
                variant="default"
                className="text-xs font-mono bg-black text-white"
              >
                {qrData.memberCode}
              </Badge>
            </div>
          </div>
        </div>

        {/* Member Code Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Kode Anggota</p>
              <p className="text-lg font-mono font-bold tracking-wider">
                {qrData.memberCode}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Gunakan kode ini untuk absensi manual
              </p>
            </div>
            <Button
              onClick={copyMemberCode}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={downloadQRCode} className="flex-1" variant="default">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
          <Button
            onClick={refreshQRCode}
            variant="outline"
            size="default"
            className="shrink-0"
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
            Cara Menggunakan
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Tunjukkan QR code ini kepada admin/core saat event</li>
            <li>• Admin akan scan QR code untuk mencatat kehadiran Anda</li>
            <li>
              • Alternatif: berikan kode <strong>{qrData.memberCode}</strong>{" "}
              untuk input manual
            </li>
            <li>• Simpan QR code ini di galeri untuk akses cepat</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

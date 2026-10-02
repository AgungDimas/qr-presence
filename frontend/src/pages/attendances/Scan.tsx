import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";
import {
  Camera,
  MapPin,
  Loader2,
  CheckCircle2,
  QrCode,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldCheck,
  Navigation,
  Clock3,
  UserCheck2,
} from "lucide-react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

type Status =
  | "initializing"
  | "camera-error"
  | "gps-error"
  | "scanning"
  | "processing"
  | "success"
  | "scan-error";

type ScanResult = {
  sessionTitle?: string;
  time: string;
  gps: boolean;
  message?: string;
};

/* ---------- COMPONENTS ---------- */
function ScannerFrame() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Transparent inner area */}
      <div className="absolute inset-0 bg-zinc-950/35 backdrop-blur-[2px] [mask-image:linear-gradient(#000,#000),linear-gradient(#000,#000)] [mask-composite:exclude] [mask-size:100%_100%,65%_65%] [mask-position:0_0,50%_50%] [mask-repeat:no-repeat]"></div>

      {/* Corner Markers */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] aspect-square">
        {/* Top-left */}
        <div className="absolute -left-0.5 -top-0.5 h-8 w-8 border-l-[4px] border-t-[4px] border-blue-400 rounded-tl-xl animate-corner-pulse drop-shadow-[0_0_6px_rgba(96,165,250,0.7)]"></div>
        {/* Top-right */}
        <div className="absolute -right-0.5 -top-0.5 h-8 w-8 border-r-[4px] border-t-[4px] border-blue-400 rounded-tr-xl animate-corner-pulse drop-shadow-[0_0_6px_rgba(96,165,250,0.7)]" style={{ animationDelay: "0.5s" }}></div>
        {/* Bottom-left */}
        <div className="absolute -left-0.5 -bottom-0.5 h-8 w-8 border-l-[4px] border-b-[4px] border-blue-400 rounded-bl-xl animate-corner-pulse drop-shadow-[0_0_6px_rgba(96,165,250,0.7)]" style={{ animationDelay: "1s" }}></div>
        {/* Bottom-right */}
        <div className="absolute -right-0.5 -bottom-0.5 h-8 w-8 border-r-[4px] border-b-[4px] border-blue-400 rounded-br-xl animate-corner-pulse drop-shadow-[0_0_6px_rgba(96,165,250,0.7)]" style={{ animationDelay: "1.5s" }}></div>

        {/* Moving scanner line */}
        <div className="absolute inset-x-2 top-0 overflow-hidden h-full pointer-events-none">
          <div className="relative h-full">
            <div
              className="absolute left-0 right-0 h-[3px] rounded-full animate-scanner-line"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.95) 20%, #60a5fa 50%, rgba(96,165,250,0.95) 80%, transparent 100%)",
                boxShadow:
                  "0 0 14px rgba(96, 165, 250, 0.85), 0 0 28px rgba(96, 165, 250, 0.5)",
              }}
            ></div>
          </div>
        </div>

        {/* Target hint */}
        <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-white/70 font-medium tracking-wide">
          Letakkan QR Code tepat di dalam bingkai
        </p>
      </div>
    </div>
  );
}

function StatusOverlay({
  status,
  errorMessage,
  onRetry,
  onScanAgain,
  scanResult,
}: {
  status: Status;
  errorMessage?: string;
  onRetry?: () => void;
  onScanAgain?: () => void;
  scanResult?: ScanResult | null;
}) {
  if (status === "success") {
    return (
      <div className="relative z-20 h-full w-full flex flex-col items-center justify-center p-8 animate-float-in bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl animate-pulse"></div>
          <div className="relative h-24 w-24 rounded-full bg-white border-4 border-emerald-200 flex items-center justify-center shadow-xl shadow-emerald-200/60">
            <div className="h-16 w-16 rounded-full bg-gradient-emerald flex items-center justify-center shadow-inner">
              <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.75} />
            </div>
          </div>
          <div className="absolute -right-2 -top-2 h-9 w-9 rounded-full bg-gradient-br bg-gradient-amber text-white flex items-center justify-center shadow-lg">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-emerald-900">
          Kehadiran Berhasil Tercatat!
        </h3>
        <p className="mt-2 text-emerald-700/90 text-sm max-w-sm text-center">
          Terima kasih, absensi Anda telah berhasil diverifikasi oleh sistem.
        </p>

        {scanResult && (
          <Card className="mt-6 w-full max-w-sm border-emerald-200/70 bg-white/80 backdrop-blur card-shadow-sm">
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 inline-flex items-center gap-1.5">
                  <UserCheck2 className="h-3.5 w-3.5" /> Status
                </span>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  Hadir (Present)
                </Badge>
              </div>
              <Separator className="bg-emerald-100/70" />
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" /> Waktu
                </span>
                <span className="font-semibold text-zinc-900">{scanResult.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Lokasi GPS
                </span>
                {scanResult.gps ? (
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                    <Navigation className="h-3 w-3 mr-1" /> Tercatat
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-zinc-200 bg-zinc-50 text-zinc-600">
                    Tidak tersedia
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verifikasi
                </span>
                <span className="font-medium text-emerald-700">Sistem 4-Layer ✔</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          className="mt-7 bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 px-7 font-semibold shadow-lg shadow-emerald-500/30"
          onClick={onScanAgain}
        >
          <RefreshCw className="mr-2 h-4.5 w-4.5" />
          Scan Sesi Lainnya
        </Button>
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="absolute inset-0 z-30 bg-zinc-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-white animate-float-in">
        <div className="relative">
          <Loader2 className="h-14 w-14 animate-spin text-blue-400" />
          <div className="absolute inset-0 animate-ping rounded-full border-4 border-blue-400/30"></div>
        </div>
        <div className="text-center space-y-1.5">
          <h4 className="font-semibold text-lg">Memverifikasi Data Absen...</h4>
          <p className="text-sm text-blue-200/90">
            Pastikan koneksi internet Anda tetap stabil
          </p>
        </div>
        <div className="mt-3 w-72 max-w-[80vw] space-y-2">
          {["Membaca QR UUID", "Cek status sesi", "Validasi keunikan user", "Mencatat kehadiran"].map((t, i) => (
            <div key={t} className="flex items-center gap-2.5 text-xs text-white/75">
              <div
                className={`h-4 w-4 rounded-full border ${
                  i < 3 ? "border-blue-300 text-blue-300 animate-pulse" : "border-blue-200/50 text-blue-200/50"
                } flex items-center justify-center`}
              >
                <span className={`h-2 w-2 rounded-full ${i < 3 ? "bg-blue-300 animate-pulse" : "bg-blue-200/40"}`}></span>
              </div>
              <span style={{ opacity: i < 3 ? 1 : 0.55 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "camera-error") {
    return (
      <div className="relative z-20 h-full w-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-rose-50 to-red-50 animate-float-in">
        <div className="h-20 w-20 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <Camera className="h-10 w-10" strokeWidth={2} />
        </div>
        <h3 className="text-xl font-bold text-red-900">Kamera Tidak Dapat Diakses</h3>
        <p className="mt-2 text-sm text-red-700/90 max-w-sm text-center">
          {errorMessage ||
            "Pastikan izin kamera telah diberikan di browser Anda. Aplikasi QR Presence membutuhkan kamera untuk melakukan scan."}
        </p>
        <Button
          className="mt-6 bg-red-600 hover:bg-red-700 rounded-xl h-11 px-6 shadow-md shadow-red-500/25"
          onClick={onRetry}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (status === "scan-error") {
    return (
      <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur flex flex-col items-center justify-center p-8 animate-float-in">
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-gradient-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-xl shadow-red-200/70">
            <XCircle className="h-10 w-10" strokeWidth={2.25} />
          </div>
        </div>
        <h3 className="mt-5 text-xl font-bold tracking-tight text-zinc-900">
          Absensi Gagal Dicatat
        </h3>
        <div className="mt-3 max-w-sm w-full rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700/95">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4.5 w-4.5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold mb-0.5">Alasan penolakan:</p>
              <p>{errorMessage || "QR Code tidak dikenali atau sesi sudah ditutup."}</p>
            </div>
          </div>
        </div>
        <Button
          className="mt-6 bg-zinc-900 hover:bg-zinc-950 rounded-xl h-11 px-6 shadow-md shadow-zinc-500/25"
          onClick={onScanAgain}
        >
          <QrCode className="mr-2 h-4 w-4" />
          Scan Ulang QR Code
        </Button>
      </div>
    );
  }

  if (status === "gps-error") {
    return (
      <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur flex flex-col items-center justify-center p-8 animate-float-in">
        <div className="h-20 w-20 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <MapPin className="h-10 w-10" strokeWidth={2} />
        </div>
        <h3 className="text-xl font-bold text-zinc-900">Lokasi GPS Tidak Aktif</h3>
        <p className="mt-2 text-sm text-zinc-600 max-w-sm text-center">
          {errorMessage ||
            "Kami merekomendasikan untuk mengaktifkan GPS agar lokasi absensi Anda tercatat dengan presisi."}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="rounded-xl h-11" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Aktifkan Lagi
          </Button>
          <Button className="rounded-xl h-11 bg-blue-600 hover:bg-blue-700" onClick={onScanAgain}>
            Lanjutkan Tanpa GPS
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

/* ---------- MAIN PAGE ---------- */
export default function Scan() {
  const { user } = useAuth();
  const readerRef = useRef<Html5Qrcode | null>(null);
  const scannerKeyRef = useRef(0);

  const [status, setStatus] = useState<Status>("initializing");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [cameraOn, setCameraOn] = useState(false);

  const SCANNER_AREA_ID = `qr-reader-${scannerKeyRef.current}`;

  /* ---------- GPS ---------- */
  const requestGps = () =>
    new Promise<{ lat: number; lng: number } | null>((resolve) => {
      if (!("geolocation" in navigator)) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
          setLocation(loc);
          resolve(loc);
        },
        (err) => {
          setErrorMessage(`Gagal mendapatkan lokasi: ${err.message}`);
          setStatus("gps-error");
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });

  /* ---------- CAMERA + SCAN ---------- */
  const startScanner = async () => {
    try {
      // Hentikan yang lama jika ada
      if (readerRef.current && readerRef.current.isScanning) {
        try {
          await readerRef.current.stop();
        } catch {
          /* ignore */
        }
      }

      setStatus("scanning");
      setErrorMessage(undefined);

      const html5Qr = new Html5Qrcode(SCANNER_AREA_ID);
      readerRef.current = html5Qr;

      const config = {
        fps: 12,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5Qr.start(
        { facingMode: "environment" },
        config,
        async (decodedText: string) => {
          // Dapet QR → berhenti scan & process
          try {
            if (readerRef.current?.isScanning) {
              await readerRef.current.stop().catch(() => {});
            }
          } catch {
            /* ignore */
          }
          setCameraOn(false);
          setStatus("processing");

          try {
            await api.post("/attendances/scan", {
              qr_code_data: decodedText,
              latitude: location?.lat ?? null,
              longitude: location?.lng ?? null,
            });
            setLastResult({
              time: new Date().toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "medium",
              }),
              gps: !!location,
            });
            setStatus("success");
            toast.success("Absensi berhasil dicatat! 🎉");
          } catch (err: any) {
            const data = err?.response?.data;
            let msg = "QR Code tidak valid / sesi sudah kedaluwarsa.";
            if (data?.errors) {
              const k = Object.keys(data.errors)[0];
              if (k) msg = (data.errors[k] as string[])[0] ?? msg;
            } else if (data?.message) {
              msg = data.message;
            }
            setErrorMessage(msg);
            setStatus("scan-error");
            toast.error(msg);
          }
        },
        () => {
          /* ignore per-frame decode error (qr belum ketemu) */
        }
      );
      setCameraOn(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Browser tidak dapat membuka kamera.");
      setStatus("camera-error");
      toast.error("Tidak dapat mengakses kamera");
    }
  };

  /* ---------- LIFECYCLE ---------- */
  useEffect(() => {
    // Start GPS & scanner on mount
    requestGps().finally(() => {
      startScanner();
    });

    return () => {
      if (readerRef.current?.isScanning) {
        readerRef.current.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerKeyRef.current]);

  const handleScanAgain = async () => {
    // Rotate scanner id to force fresh mount
    scannerKeyRef.current += 1;
    setLastResult(null);
    setErrorMessage(undefined);
    setCameraOn(false);
    setStatus("initializing");
    await requestGps();
    await startScanner();
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="max-w-lg mx-auto w-full space-y-6 pb-8 animate-float-in">
      {/* Page Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full">
          <QrCode className="h-3.5 w-3.5" />
          Scan Kehadiran
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Arahkan Kamera ke QR Code
        </h1>
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          Posisikan QR Code sesi absensi tepat di dalam bingkai untuk memulai verifikasi otomatis.
        </p>
      </div>

      {/* Scanner Card */}
      <Card className="relative overflow-hidden border-zinc-200/80 card-shadow-md rounded-3xl">
        {/* Top bar: Status badges */}
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between gap-2 pointer-events-none">
          <Badge
            variant="outline"
            className={`pointer-events-auto backdrop-blur ${
              !!location
                ? "bg-emerald-50/90 text-emerald-700 border-emerald-200"
                : "bg-zinc-50/90 text-zinc-600 border-zinc-200"
            }`}
          >
            <MapPin className={`h-3.5 w-3.5 mr-1 ${!!location ? "text-emerald-600" : ""}`} />
            {!!location ? "GPS Aktif" : "GPS Tidak Aktif"}
          </Badge>
          <Badge
            variant="outline"
            className={`pointer-events-auto backdrop-blur ${
              cameraOn && status === "scanning"
                ? "bg-blue-50/90 text-blue-700 border-blue-200"
                : "bg-zinc-50/90 text-zinc-600 border-zinc-200"
            }`}
          >
            <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
              cameraOn && status === "scanning"
                ? "bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                : "bg-zinc-400"
            }`} />
            <Camera className="h-3.5 w-3.5 mr-1" />
            {cameraOn && status === "scanning" ? "Kamera Aktif" : "Stand By"}
          </Badge>
        </div>

        <CardContent className="p-0">
          <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden">
            {/* Video area */}
            {status !== "camera-error" &&
              status !== "gps-error" &&
              status !== "scan-error" &&
              status !== "success" && (
                <div id={SCANNER_AREA_ID} className="w-full h-full !bg-transparent">
                  {/* html5-qrcode will inject <video> here */}
                </div>
              )}

            {/* Initializing placeholder */}
            {status === "initializing" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white/80 bg-zinc-950">
                <Loader2 className="h-10 w-10 animate-spin text-blue-400 mb-3" />
                <p className="text-sm">Menyiapkan kamera...</p>
              </div>
            )}

            {/* Overlay frame + scan line (hanya tampil saat scanning) */}
            {status === "scanning" && <ScannerFrame />}

            {/* Status overlays */}
            <StatusOverlay
              status={status}
              errorMessage={errorMessage}
              onRetry={() => {
                if (status === "gps-error") {
                  requestGps().then((loc) => {
                    if (!loc) {
                      // User pilih lanjut tanpa GPS via button lain, tapi fallback juga
                      handleScanAgain();
                    } else {
                      startScanner();
                    }
                  });
                } else {
                  startScanner();
                }
              }}
              onScanAgain={handleScanAgain}
              scanResult={lastResult}
            />
          </div>
        </CardContent>
      </Card>

      {/* User info card */}
      {user && (
        <Card className="card-shadow-sm border-zinc-200/80 rounded-2xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-br bg-gradient-blue text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-200/60">
              {user.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zinc-900 truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
            <div className="text-right">
              {user.role && (
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 capitalize">
                  {user.role}
                </Badge>
              )}
              {user.department && (
                <p className="text-xs text-zinc-500 mt-1">{user.department}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50 p-4 card-shadow-sm">
          <div className="h-9 w-9 rounded-lg bg-gradient-br bg-gradient-blue text-white flex items-center justify-center mb-2.5 shadow-sm shadow-blue-200/50">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-900">Pencahayaan Cukup</h4>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Pastikan area scan memiliki cahaya yang cukup agar QR mudah terbaca.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50 p-4 card-shadow-sm">
          <div className="h-9 w-9 rounded-lg bg-gradient-br bg-gradient-emerald text-white flex items-center justify-center mb-2.5 shadow-sm shadow-emerald-200/50">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-900">Aktifkan GPS</h4>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Lokasi GPS menjadi bukti kehadiran yang valid & sesuai radius area.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50 p-4 card-shadow-sm">
          <div className="h-9 w-9 rounded-lg bg-gradient-br bg-gradient-violet text-white flex items-center justify-center mb-2.5 shadow-sm shadow-violet-200/50">
            <Clock3 className="h-4.5 w-4.5" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-900">Tepat Waktu</h4>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Lakukan scan sebelum batas waktu sesi berakhir agar tercatat Hadir.
          </p>
        </div>
      </div>

      {/* Retry button sticky bottom */}
      {(status === "initializing" || status === "scanning") && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="rounded-xl h-10 px-5 border-zinc-200 bg-white card-shadow-sm"
            onClick={handleScanAgain}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Mulai Ulang Scanner
          </Button>
        </div>
      )}
    </div>
  );
}

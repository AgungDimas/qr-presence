import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  QrCode,
  ScanLine,
  Settings,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  CalendarCheck2,
  TrendingUp,
  Activity,
  UserCheck2,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type QuickTile = {
  label: string;
  description: string;
  icon: any;
  to: string;
  gradient: "blue" | "emerald" | "violet" | "amber";
  delay?: number;
};

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  gradient,
  delay = 0,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  gradient: "blue" | "emerald" | "violet" | "amber";
  delay?: number;
}) {
  const gradients: Record<string, string> = {
    blue: "bg-gradient-blue",
    emerald: "bg-gradient-emerald",
    violet: "bg-gradient-violet",
    amber: "bg-gradient-amber",
  };
  return (
    <Card
      className="overflow-hidden border-0 card-shadow-md card-hover animate-float-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div className={`${gradients[gradient]} w-24 flex flex-col items-center justify-center text-white p-4`}>
            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Icon className="h-5.5 w-5.5" strokeWidth={2.25} />
            </div>
          </div>
          <div className="flex-1 p-4 pl-4 space-y-1">
            <p className="text-sm font-medium text-zinc-500">{title}</p>
            <p className="text-2xl font-bold text-zinc-900 tracking-tight">
              {value}
            </p>
            {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickTile({ label, description, icon: Icon, to, gradient, delay }: QuickTile) {
  const grads: Record<string, string> = {
    blue: "from-blue-600 to-blue-500",
    emerald: "from-emerald-600 to-emerald-500",
    violet: "from-violet-600 to-violet-500",
    amber: "from-amber-500 to-orange-400",
  };
  const hoverGrades: Record<string, string> = {
    blue: "group-hover:from-blue-50 group-hover:to-blue-50/60 hover:border-blue-200",
    emerald: "group-hover:from-emerald-50 group-hover:to-emerald-50/60 hover:border-emerald-200",
    violet: "group-hover:from-violet-50 group-hover:to-violet-50/60 hover:border-violet-200",
    amber: "group-hover:from-amber-50 group-hover:to-amber-50/60 hover:border-amber-200",
  };
  return (
    <Link to={to}>
      <div
        className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-5 card-shadow-sm card-hover ${hoverGrades[gradient]}`}
        style={{ animationDelay: `${delay ?? 0}ms` }}
      >
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity from-zinc-900/[0.04] to-transparent"></div>
        <div className="relative z-10 flex items-start gap-4">
          <div
            className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${grads[gradient]} text-white shadow-lg shadow-black/10 flex items-center justify-center`}
          >
            <Icon className="h-6 w-6" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-zinc-900 tracking-tight">{label}</h3>
              <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
            <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 10) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 19) return "Selamat Sore";
  return "Selamat Malam";
}

function formatToday(d: Date) {
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function EmployeeHome() {
  const { user } = useAuth();
  const today = useMemo(() => new Date(), []);

  const avatarInitials =
    user?.name
      ?.split(" ")
      .slice(0, 2)
      .map((s) => s.charAt(0).toUpperCase())
      .join("") || "?";

  const quickTiles: QuickTile[] = [
    {
      label: "Scan Absensi",
      description: "Arahkan kamera ke QR Code sesi absensi untuk mencatat kehadiran Anda.",
      icon: ScanLine,
      to: "/scan",
      gradient: "emerald",
      delay: 60,
    },
    {
      label: "Pengaturan Akun",
      description: "Perbarui profil, ubah kata sandi, dan kelola preferensi akun Anda.",
      icon: Settings,
      to: "/settings",
      gradient: "amber",
      delay: 110,
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      {/* ===== HERO HEADER ===== */}
      <section
        className="relative overflow-hidden rounded-3xl card-shadow-md animate-float-in"
        style={{ animationDelay: "0ms" }}
      >
        <div className="absolute inset-0 bg-gradient-br bg-gradient-emerald"></div>
        <div className="absolute inset-0 bg-grid-subtle opacity-30"></div>
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute right-20 bottom-0 h-40 w-40 rounded-full bg-white/5 blur-2xl"></div>

        <div className="relative z-10 p-6 md:p-10 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl flex-1">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3.5 py-1.5 rounded-full text-xs font-medium border border-white/20">
                <Activity className="h-3.5 w-3.5" />
                <span>Beranda Karyawan</span>
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                {getGreeting()}, {user?.name?.split(" ")[0] ?? "Rekan"}
              </h1>
              <p className="mt-2 text-emerald-100 text-base md:text-lg">
                {formatToday(today)}
                <span className="mx-2 text-emerald-200/60">|</span>
                Jangan lupa catat kehadiran Anda tepat waktu.
              </p>

              {/* Status badges */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-white/10 backdrop-blur border-white/20 text-white"
                >
                  <BadgeCheck className="h-3.5 w-3.5 mr-1.5" />
                  Status: <span className="font-semibold ml-1">Aktif</span>
                </Badge>
                {user?.department && (
                  <Badge
                    variant="outline"
                    className="bg-white/10 backdrop-blur border-white/20 text-white"
                  >
                    {user.department}
                  </Badge>
                )}
                {user?.role && (
                  <Badge
                    variant="outline"
                    className="bg-white/10 backdrop-blur border-white/20 text-white capitalize"
                  >
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex md:flex-col items-center gap-4 md:items-end shrink-0">
              <div className="flex md:flex-col items-center md:items-end gap-3 pr-0 md:pr-4 border-0 md:border-r md:border-white/20">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-white/20 shadow-xl shadow-black/10">
                  <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? "User"} />
                  <AvatarFallback className="bg-white/20 backdrop-blur text-white text-lg font-bold border border-white/20">
                    {avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right md:mt-1">
                  <p className="font-semibold leading-tight">{user?.name ?? "—"}</p>
                  <p className="text-xs text-emerald-100 md:text-emerald-50/90">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Link to="/scan">
                <Button
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-emerald-50 h-12 px-6 rounded-2xl font-semibold shadow-xl shadow-black/10 card-hover"
                >
                  <ScanLine className="h-5 w-5 mr-2" />
                  Scan Absen Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STAT CARDS ===== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Hari Ini"
          value={today.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
          description="Tanggal kehadiran"
          icon={CalendarCheck2}
          gradient="blue"
          delay={60}
        />
        <StatCard
          title="Jam Saat Ini"
          value={today.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          description="Waktu server lokal"
          icon={Clock3}
          gradient="emerald"
          delay={110}
        />
        <StatCard
          title="Hadir Bulan Ini"
          value="—"
          description="Rekap kehadiran bulan berjalan"
          icon={UserCheck2}
          gradient="violet"
          delay={160}
        />
        <StatCard
          title="Ketepatan Waktu"
          value="—"
          description="Rata-rata kedatangan tepat waktu"
          icon={TrendingUp}
          gradient="amber"
          delay={210}
        />
      </section>

      {/* ===== QUICK ACTIONS ===== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-600" />
            Menu Cepat
          </h2>
          <p className="text-sm text-zinc-500">Akses fitur utama Anda dalam satu klik</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickTiles.map((t) => (
            <QuickTile key={t.label} {...t} />
          ))}
        </div>
      </section>

      {/* ===== CONTENT GRID ===== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tips Card */}
        <Card className="xl:col-span-2 border border-zinc-200/80 card-shadow-md overflow-hidden animate-float-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-5 border-b border-zinc-100 bg-zinc-50/40">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Panduan Absensi Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50 p-4 card-shadow-sm">
                <div className="h-9 w-9 rounded-lg bg-gradient-br bg-gradient-blue text-white flex items-center justify-center mb-2.5 shadow-sm shadow-blue-200/50">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">Pencahayaan Cukup</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Pastikan area scan memiliki cahaya yang cukup agar QR Code mudah terbaca oleh kamera.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50 p-4 card-shadow-sm">
                <div className="h-9 w-9 rounded-lg bg-gradient-br bg-gradient-emerald text-white flex items-center justify-center mb-2.5 shadow-sm shadow-emerald-200/50">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">Aktifkan GPS</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Lokasi GPS menjadi bukti kehadiran yang valid dan sesuai dengan radius area kantor.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50 p-4 card-shadow-sm">
                <div className="h-9 w-9 rounded-lg bg-gradient-br bg-gradient-violet text-white flex items-center justify-center mb-2.5 shadow-sm shadow-violet-200/50">
                  <Clock3 className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">Tepat Waktu</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Lakukan scan sebelum batas waktu sesi berakhir agar status tercatat sebagai Hadir.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50 p-4 card-shadow-sm">
                <div className="h-9 w-9 rounded-lg bg-gradient-br bg-gradient-amber text-white flex items-center justify-center mb-2.5 shadow-sm shadow-amber-200/50">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">Sesuai Radius Area</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  Pastikan Anda berada di dalam lokasi / area kerja yang ditentukan sebelum melakukan scan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column - info card */}
        <div className="space-y-5">
          <Card className="border-0 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 text-white card-shadow-md overflow-hidden animate-float-in" style={{ animationDelay: "60ms" }}>
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
            <CardContent className="relative p-6">
              <div className="inline-flex items-center gap-2 bg-white/20 border-0 text-white backdrop-blur rounded-full px-2.5 py-1 text-[11px] font-semibold">
                <ShieldCheck className="h-3 w-3" />
                Sistem 4-Layer
              </div>
              <h3 className="mt-3 font-bold text-xl tracking-tight leading-snug">
                Verifikasi Keaslian Absensi
              </h3>
              <p className="mt-2 text-sm text-emerald-100/95 leading-relaxed">
                Setiap scan QR Code Anda akan melewati serangkaian validasi untuk memastikan keaslian data kehadiran.
              </p>
              <div className="mt-5 space-y-2.5">
                {[
                  { t: "Validasi UUID QR Code", d: "Kode unik untuk setiap sesi absensi" },
                  { t: "Cek Status Sesi", d: "Sesi aktif & batas waktu terpenuhi" },
                  { t: "Anti Duplikat User", d: "1 user hanya bisa absen 1x per sesi" },
                  { t: "Lokasi & Device", d: "Data GPS & User Agent tercatat" },
                ].map((item, idx) => (
                  <div key={item.t} className="flex items-center gap-2.5 text-sm">
                    <div className="h-6 w-6 shrink-0 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center text-[11px] font-bold border border-white/20">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.t}</p>
                      <p className="text-xs text-emerald-100/85">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200/80 card-shadow-sm animate-float-in" style={{ animationDelay: "110ms" }}>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 px-5 py-4 border-b border-zinc-100">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Clock3 className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-semibold text-zinc-900">
                Informasi Jam Kerja
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-sm space-y-3">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-500">Senin - Jumat</span>
                <span className="font-semibold text-zinc-900 tabular-nums">08:00 - 17:00</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-500">Sabtu</span>
                <span className="font-semibold text-zinc-900 tabular-nums">08:00 - 13:00</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-500">Istirahat</span>
                <span className="font-semibold text-zinc-900 tabular-nums">12:00 - 13:00</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

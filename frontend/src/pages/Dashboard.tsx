import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  QrCode,
  ScanLine,
  Users,
  CalendarRange,
  Clock3,
  MapPin,
  Plus,
  ChevronRight,
  TrendingUp,
  Activity,
  CalendarCheck2,
  UserCheck2,
  Info,
} from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Session = {
  id: number;
  title: string;
  description: string | null;
  qr_code_data: string;
  valid_until: string;
  is_active: boolean;
  location: { latitude: number | null; longitude: number | null; radius: number | null };
  created_by: string | null;
  created_at: string;
};

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  gradient,
  trend,
  delay = 0,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  gradient: "blue" | "emerald" | "violet" | "amber" | "rose";
  trend?: string;
  delay?: number;
}) {
  const gradients: Record<string, string> = {
    blue: "bg-gradient-blue",
    emerald: "bg-gradient-emerald",
    violet: "bg-gradient-violet",
    amber: "bg-gradient-amber",
    rose: "bg-gradient-rose",
  };
  return (
    <Card
      className="overflow-hidden border-0 card-shadow-md card-hover animate-float-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div
            className={`${gradients[gradient]} w-28 flex flex-col items-center justify-center text-white p-5`}
          >
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Icon className="h-6 w-6" strokeWidth={2.25} />
            </div>
          </div>
          <div className="flex-1 p-5 pl-5 space-y-1.5">
            <p className="text-sm font-medium text-zinc-500">{title}</p>
            <p className="text-3xl font-bold text-zinc-900 tracking-tight">
              {value}
            </p>
            {description && (
              <p className="text-xs text-zinc-500 mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 pt-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
                {trend}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  label,
  description,
  icon: Icon,
  to,
  gradient,
  delay,
}: {
  label: string;
  description: string;
  icon: any;
  to: string;
  gradient: "blue" | "emerald" | "violet" | "amber";
  delay?: number;
}) {
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
        style={{ animationDelay: `${delay}ms` }}
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
              <h3 className="font-semibold text-zinc-900 tracking-tight">
                {label}
              </h3>
              <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
            <p className="mt-1 text-sm text-zinc-500 leading-relaxed">
              {description}
            </p>
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

function formatDate(d: Date) {
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getSessionStatus(s: Session): {
  label: "Aktif" | "Kedaluwarsa" | "Tidak Aktif";
  variant: "success" | "danger" | "muted";
} {
  const expired = new Date(s.valid_until) < new Date();
  if (!s.is_active) return { label: "Tidak Aktif", variant: "muted" };
  if (expired) return { label: "Kedaluwarsa", variant: "danger" };
  return { label: "Aktif", variant: "success" };
}

function StatusBadge({
  status,
}: {
  status: ReturnType<typeof getSessionStatus>;
}) {
  const base =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border";
  if (status.variant === "success")
    return (
      <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        {status.label}
      </span>
    );
  if (status.variant === "danger")
    return (
      <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        {status.label}
      </span>
    );
  return (
    <span className={`${base} bg-zinc-100 text-zinc-600 border-zinc-200`}>
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
      {status.label}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const today = useMemo(() => new Date(), []);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["attendance-sessions"],
    queryFn: async () => {
      const res = await api.get("/attendance-sessions?per_page=20");
      return res.data.data as Session[];
    },
  });

  const stats = useMemo(() => {
    const list = sessions ?? [];
    let activeCount = 0;
    let expiredCount = 0;
    list.forEach((s) => {
      const st = getSessionStatus(s);
      if (st.variant === "success") activeCount++;
      else if (st.variant === "danger") expiredCount++;
    });
    return {
      total: list.length,
      active: activeCount,
      expired: expiredCount,
    };
  }, [sessions]);

  const recentSessions = useMemo(
    () => (sessions ?? []).slice(0, 5),
    [sessions]
  );

  return (
    <div className="space-y-8">
      {/* ===== HERO HEADER ===== */}
      <section
        className="relative overflow-hidden rounded-3xl card-shadow-md animate-float-in"
        style={{ animationDelay: "0ms" }}
      >
        <div className="absolute inset-0 bg-gradient-br bg-gradient-blue"></div>
        <div className="absolute inset-0 bg-grid-subtle opacity-30"></div>
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute right-10 bottom-0 h-40 w-40 rounded-full bg-white/5 blur-2xl"></div>

        <div className="relative z-10 p-6 md:p-10 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3.5 py-1.5 rounded-full text-xs font-medium border border-white/20">
                <Activity className="h-3.5 w-3.5" />
                <span>Dashboard Overview</span>
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                {getGreeting()}, {user?.name?.split(" ")[0] ?? "Administrator"}
              </h1>
              <p className="mt-2 text-blue-100 text-base md:text-lg">
                {formatDate(today)}
                <span className="mx-2 text-blue-200/60">|</span>
                Pantau sesi absensi dan kehadiran tim dari satu tempat.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex flex-col items-end text-right gap-0.5 pr-4 border-r border-white/20">
                <p className="text-xs uppercase tracking-widest text-blue-100/90">
                  Departemen
                </p>
                <p className="font-semibold">
                  {user?.department ?? "Administrator"}
                </p>
              </div>
              <Link to="/sessions">
                <Button className="bg-white text-blue-700 hover:bg-blue-50 h-11 px-5 rounded-xl font-semibold shadow-xl shadow-black/10 card-hover">
                  <Plus className="h-4.5 w-4.5" />
                  Buat Sesi Baru
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STAT CARDS ===== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Sesi"
          value={isLoading ? "…" : stats.total}
          description="Keseluruhan sesi absensi"
          icon={CalendarCheck2}
          gradient="blue"
          delay={60}
        />
        <StatCard
          title="Sesi Aktif"
          value={isLoading ? "…" : stats.active}
          description="Sedang berjalan dan dapat discan"
          icon={UserCheck2}
          gradient="emerald"
          delay={110}
        />
        <StatCard
          title="Kedaluwarsa"
          value={isLoading ? "…" : stats.expired}
          description="Sesi sudah melewati batas waktu"
          icon={Clock3}
          gradient="amber"
          delay={160}
        />
        <StatCard
          title="Data Pegawai"
          value={isLoading ? "…" : "-"}
          description="Total pegawai terdaftar"
          icon={Users}
          gradient="violet"
          delay={210}
        />
      </section>

      {/* ===== QUICK ACTIONS ===== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-blue-600" />
            Menu Cepat
          </h2>
          <p className="text-sm text-zinc-500">
            Akses fitur utama dalam satu klik
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <QuickAction
            label="Buat Sesi Absen"
            description="Buat jadwal absen baru dan generate QR Code otomatis"
            icon={QrCode}
            to="/sessions"
            gradient="blue"
            delay={60}
          />
          <QuickAction
            label="Scan Kehadiran"
            description="Scan QR Code untuk mencatat absensi Anda"
            icon={ScanLine}
            to="/scan"
            gradient="emerald"
            delay={110}
          />
          <QuickAction
            label="Data Pegawai"
            description="Kelola akun, biodata, dan departemen pegawai"
            icon={Users}
            to="/employees"
            gradient="violet"
            delay={160}
          />
          <QuickAction
            label="Pengaturan Akun"
            description="Ubah profil, kata sandi, dan preferensi akun"
            icon={LayoutDashboard}
            to="/settings"
            gradient="amber"
            delay={210}
          />
        </div>
      </section>

      {/* ===== CONTENT GRID ===== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <Card className="xl:col-span-2 border border-zinc-200/80 card-shadow-md overflow-hidden animate-float-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-5 border-b border-zinc-100 bg-zinc-50/40">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="h-5 w-5 text-blue-600" />
              Sesi Absensi Terbaru
            </CardTitle>
            <Link to="/sessions">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Lihat Semua
                <ChevronRight className="ml-0.5 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y divide-zinc-100">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-5 flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl skeleton-shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 rounded skeleton-shimmer" />
                      <div className="h-3 w-32 rounded skeleton-shimmer" />
                    </div>
                    <div className="h-6 w-20 rounded-full skeleton-shimmer" />
                  </div>
                ))}
              </div>
            ) : recentSessions.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
                  <CalendarRange className="h-8 w-8 text-zinc-400" />
                </div>
                <h3 className="mt-4 font-semibold text-zinc-900">
                  Belum ada sesi absensi
                </h3>
                <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">
                  Buat sesi absensi pertama Anda untuk mulai mencatat
                  kehadiran tim.
                </p>
                <Link to="/sessions" className="inline-block mt-5">
                  <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10">
                    <Plus className="mr-1.5 h-4 w-4" /> Buat Sesi Pertama
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {recentSessions.map((s, i) => {
                  const status = getSessionStatus(s);
                  return (
                    <li
                      key={s.id}
                      className="group flex items-center gap-4 px-6 py-4 hover:bg-zinc-50/70 transition-colors animate-float-in"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="h-11 w-11 shrink-0 rounded-xl bg-gradient-br bg-gradient-blue text-white flex items-center justify-center shadow-md shadow-blue-200/60">
                        <QrCode className="h-5 w-5" strokeWidth={2.25} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-zinc-900 truncate">
                            {s.title}
                          </p>
                          <StatusBadge status={status} />
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {new Date(s.valid_until).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                          {s.location?.latitude && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              Geo-locked · {s.location.radius ?? 50}m
                            </span>
                          )}
                          {s.created_by && (
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {s.created_by}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-5">
          <Card className="border-0 bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 text-white card-shadow-md overflow-hidden animate-float-in" style={{ animationDelay: "60ms" }}>
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
            <CardContent className="relative p-6">
              <div className="inline-flex items-center gap-2 bg-white/20 border-0 text-white backdrop-blur rounded-full px-2.5 py-1 text-[11px] font-semibold">
                <Info className="h-3 w-3" />
                Informasi Sistem
              </div>
              <h3 className="mt-3 font-bold text-xl tracking-tight leading-snug">
                Verifikasi 4 Lapisan Keamanan
              </h3>
              <p className="mt-2 text-sm text-blue-100/95 leading-relaxed">
                Setiap scan QR melewati serangkaian validasi untuk
                memastikan keaslian data kehadiran dan mencegah duplikat
                absensi.
              </p>
              <div className="mt-5 space-y-2.5">
                {[
                  { t: "Validasi UUID QR Code", d: "Kode unik setiap sesi" },
                  { t: "Cek Status Sesi", d: "Aktif dan batas waktu" },
                  { t: "Anti Duplikat User", d: "Satu user satu kali absen" },
                  { t: "Lokasi Geo & Device", d: "GPS + User Agent dicatat" },
                ].map((item, idx) => (
                  <div key={item.t} className="flex items-center gap-2.5 text-sm">
                    <div className="h-6 w-6 shrink-0 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center text-[11px] font-bold border border-white/20">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.t}</p>
                      <p className="text-xs text-blue-100/85">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200/80 card-shadow-sm animate-float-in" style={{ animationDelay: "110ms" }}>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 px-5 py-4 border-b border-zinc-100">
              <div className="h-8 w-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                <Clock3 className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-semibold text-zinc-900">
                Aktivitas Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-zinc-100 text-sm">
                <li className="px-5 py-3.5 flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-zinc-800">
                      Sistem autentikasi token-based diperbarui
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Baru saja · Sanctum Guard diperbaiki
                    </p>
                  </div>
                </li>
                <li className="px-5 py-3.5 flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-zinc-800">
                      Halaman dashboard direvisi menjadi tampilan premium
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Hari ini · Gradient, motion, stat cards
                    </p>
                  </div>
                </li>
                <li className="px-5 py-3.5 flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-violet-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-zinc-800">
                      Scanner QR diperkuat dengan 4 state validasi
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Kemarin · Corner markers & scanline
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

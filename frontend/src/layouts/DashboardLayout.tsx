import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  QrCode,
  Settings,
  LogOut,
  Menu,
  ScanLine,
  Sparkles,
  Clock3,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import api from "@/services/api";
import toast from "react-hot-toast";

/* ---------- Helpers ---------- */
type NavItem = {
  name: string;
  href: string;
  icon: any;
  disabled?: boolean;
  badge?: string;
  badgeVariant?: "default" | "emerald" | "amber";
};

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sesi Absensi", href: "/sessions", icon: QrCode },
  { name: "Scan QR", href: "/scan", icon: ScanLine },
  {
    name: "Pegawai",
    href: "/employees",
    icon: Users,
    disabled: true,
    badge: "Segera Hadir",
    badgeVariant: "amber",
  },
  {
    name: "Pengaturan",
    href: "/settings",
    icon: Settings,
    disabled: true,
    badge: "Segera Hadir",
    badgeVariant: "amber",
  },
];

const badgeCls = (variant?: "default" | "emerald" | "amber") => {
  switch (variant) {
    case "emerald":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "amber":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    default:
      return "bg-zinc-100 text-zinc-700 border border-zinc-200";
  }
};

function SidebarContent() {
  const location = useLocation();
  return (
    <div className="flex h-full flex-col gap-4 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50">
      {/* ===== Brand Header ===== */}
      <div className="relative overflow-hidden border-b border-white/5 px-6 py-5 lg:py-[22px]">
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl"></div>
        <div className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-violet-500/10 blur-2xl"></div>
        <Link to="/dashboard" className="relative z-10 flex items-center gap-3 font-semibold">
          <div className="h-10 w-10 rounded-xl bg-gradient-br bg-gradient-blue text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <QrCode className="h-5.5 w-5.5" strokeWidth={2.25} />
          </div>
          <div className="leading-tight">
            <p className="text-lg tracking-tight">QR Presence</p>
            <p className="text-[11px] text-zinc-400 font-normal">Sistem Absensi Modern</p>
          </div>
        </Link>
      </div>

      {/* ===== Navigation ===== */}
      <div className="flex-1 overflow-auto py-2 scrollbar-hide">
        <nav className="grid items-start px-3 text-sm font-medium gap-1">
          <p className="px-3 py-2 text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">
            Menu Utama
          </p>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <div key={item.name}>
                {item.disabled ? (
                  <button
                    disabled
                    className="w-full opacity-70 group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors text-zinc-500 cursor-not-allowed"
                    title="Fitur ini segera hadir"
                  >
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 text-left truncate">{item.name}</span>
                    {item.badge && (
                      <Badge className={`h-5 px-2 text-[10px] ${badgeCls(item.badgeVariant)}`}>
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-white/20 backdrop-blur text-white"
                          : "bg-white/5 group-hover:bg-white/10 text-zinc-300 group-hover:text-white border border-white/5 group-hover:border-white/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.2} />
                    </div>
                    <span className="flex-1 truncate">{item.name}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/70 shrink-0" />}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ===== Footer mini promo card ===== */}
      <div className="px-3 pb-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 backdrop-blur">
          <Sparkles className="h-4.5 w-4.5 text-amber-300 mb-2" />
          <p className="text-xs font-semibold leading-snug">
            Sistem 4-Layer Verifikasi
          </p>
          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
            QR, Sesi Aktif, Waktu, & GPS. Data kehadiran anti duplikat.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Loading Skeleton ---------- */
function LayoutSkeleton() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr] bg-zinc-50/50">
      <div className="hidden md:block bg-zinc-950"></div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 shadow-sm">
          <div className="w-full flex-1 flex justify-end">
            <div className="h-8 w-32 rounded-full skeleton-shimmer" />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
          <div className="h-[38vh] rounded-3xl skeleton-shimmer" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 h-[420px] rounded-2xl skeleton-shimmer" />
            <div className="space-y-5">
              <div className="h-56 rounded-2xl skeleton-shimmer" />
              <div className="h-52 rounded-2xl skeleton-shimmer" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const loading = !!token && !user; // Ada token tapi user belum ke-fetch = loading

  if (loading) {
    return <LayoutSkeleton />;
  }

  // Fungsi Logout
  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
      /* ignore */
    } finally {
      logout();
      toast.success("Berhasil keluar dari akun");
      navigate("/login");
    }
  };

  const getPageTitle = () => {
    const match = navigation.find(
      (n) => !n.disabled && (location.pathname === n.href || location.pathname.startsWith(n.href + "/"))
    );
    return match?.name ?? "Dashboard";
  };

  const avatarInitials =
    user?.name
      ?.split(" ")
      .slice(0, 2)
      .map((s) => s.charAt(0).toUpperCase())
      .join("") || "?";

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr] bg-zinc-50/80">
      {/* Sidebar Desktop */}
      <div className="hidden border-r border-zinc-900/10 md:block">
        <SidebarContent />
      </div>

      <div className="flex flex-col min-w-0">
        {/* Header / Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-zinc-200/70 bg-white/80 backdrop-blur-lg px-4 lg:h-[64px] lg:px-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          {/* Hamburger Menu Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden rounded-xl h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px] border-none shadow-2xl">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          {/* Breadcrumbs / Page Title */}
          <div className="flex flex-col min-w-0 hidden sm:block">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <LayoutDashboard className="h-3 w-3" />
              <span>Menu</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-zinc-700 font-medium">{getPageTitle()}</span>
            </div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900 mt-0.5">
              {getPageTitle()}
            </h2>
          </div>

          <div className="w-full flex-1" />

          {/* Live Clock */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-full px-3.5 py-1.5">
            <Clock3 className="h-3.5 w-3.5 text-blue-500" />
            <LiveClock />
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 hidden md:block" />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-2xl h-10 px-1.5 pr-3 gap-2.5 hover:bg-zinc-100/80 data-[state=open]:bg-zinc-100/80 transition-all">
                <Avatar className="h-8 w-8 border border-zinc-200 shadow-sm">
                  <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? "User"} />
                  <AvatarFallback className="bg-gradient-br bg-gradient-blue text-white text-xs font-bold">
                    {avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start gap-0.5 leading-tight">
                  <span className="text-sm font-semibold text-zinc-900 max-w-[120px] truncate">
                    {user?.name ?? "—"}
                  </span>
                  <span className="text-[11px] text-zinc-500 capitalize">
                    {user?.role ?? "User"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl mt-1 shadow-xl shadow-zinc-900/5 border-zinc-200/80">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 via-blue-50/60 to-violet-50/60 border border-blue-100/70">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border border-white shadow-sm">
                    <AvatarImage src={user?.avatar ?? undefined} />
                    <AvatarFallback className="bg-gradient-br bg-gradient-blue text-white font-bold">
                      {avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">{user?.name ?? "Pengguna"}</p>
                    <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                    {user?.department && (
                      <Badge
                        variant="outline"
                        className="mt-1.5 h-5 px-2 text-[10px] border-blue-200 bg-white text-blue-700"
                      >
                        {user.department}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator className="my-1.5" />
              <div className="px-1 py-1">
                <div className="px-2 py-1.5 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2">
                    <p className="text-zinc-500">Role</p>
                    <p className="font-semibold text-zinc-900 capitalize mt-0.5">{user?.role ?? "—"}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-2">
                    <p className="text-zinc-500">Bergabung</p>
                    <p className="font-semibold text-zinc-900 mt-0.5">
                      {user?.joined_at
                        ? new Date(user.joined_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 rounded-xl px-3 py-2 my-0.5 gap-2.5"
                onSelect={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <LogOut className="h-4.5 w-4.5" />
                <span className="font-medium">Keluar dari Akun</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ---------- Live Clock component ---------- */
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-medium text-zinc-700 tabular-nums">
      {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
      <span className="text-zinc-400 mx-1">·</span>
      {now.toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short" })}
    </span>
  );
}

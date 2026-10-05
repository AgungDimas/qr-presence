import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  QrCode,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Zap,
  Clock3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultRouteByRole } from "@/components/RoleProtectedRoute";

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
  remember: z.boolean().optional().default(true),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const response = await api.post("/login", values);
      const loggedUser = response.data.user;
      login(response.data.access_token, loggedUser);
      toast.success("Login berhasil!");
      const landing = getDefaultRouteByRole(loggedUser?.role) || '/home';
      navigate(landing, { replace: true });
    } catch (error: any) {
      const data = error.response?.data;

      let message = "Login gagal, silakan periksa email/password";

      if (data) {
        if (data.errors && typeof data.errors === "object") {
          const firstErrorKey = Object.keys(data.errors)[0];
          if (firstErrorKey) {
            const messages = data.errors[firstErrorKey];
            if (Array.isArray(messages) && messages.length > 0) {
              message = messages[0];
            }
          }
        }

        if (
          (message === "Login gagal, silakan periksa email/password" ||
            message.startsWith("The given data")) &&
          data.message
        ) {
          message = data.message;
        }
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen w-full bg-zinc-50 md:grid md:grid-cols-2 relative overflow-hidden">
      {/* ===== DECORATIVE BG SHAPES ===== */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-200/40 blur-3xl" />

      {/* ===== LEFT SIDE: ILLUSTRATION / BRANDING ===== */}
      <div className="relative hidden md:block overflow-hidden animate-float-in">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />
        <div
          className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:22px_22px]"
          aria-hidden="true"
        />
        {/* floating circles */}
        <div className="absolute top-20 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-24 -left-14 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/3 left-10 h-24 w-24 rounded-3xl rotate-12 bg-white/10 backdrop-blur-sm" />
        <div className="absolute bottom-40 right-16 h-20 w-20 rounded-2xl -rotate-6 bg-white/10 backdrop-blur-sm" />

        <div className="relative z-10 h-full flex flex-col justify-between p-10 lg:p-14 text-white">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shadow-black/10">
              <img src="/logo2.jpeg" alt="QR Presence Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">QR Presence</p>
              <p className="text-xs text-white/70 font-medium">Enterprise Presence System</p>
            </div>
          </div>

          {/* CENTER HERO COPY */}
          <div className="space-y-7 max-w-md">
            <div>
              <h1 className="text-4xl lg:text-[2.5rem] font-bold leading-tight tracking-tight">
                Absensi Cepat, Akurat, dan Terpercaya
              </h1>
              <p className="mt-4 text-white/80 text-base leading-relaxed">
                Kelola kehadiran pegawai dalam satu platform dengan verifikasi QR Code dan lokasi
                GPS real-time.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                {
                  icon: Zap,
                  title: "Scan QR 1 Detik",
                  desc: "Cukup arahkan kamera ke kode QR, absensi langsung tercatat.",
                  tint: "bg-amber-300/20 text-amber-200",
                },
                {
                  icon: MapPin,
                  title: "GPS Radius Lock",
                  desc: "Pastikan pegawai hadir secara fisik di area kantor / titik yang ditentukan.",
                  tint: "bg-emerald-300/20 text-emerald-200",
                },
                {
                  icon: ShieldCheck,
                  title: "Anti Duplikasi",
                  desc: "UUID unik per-sesi & timestamp mencegah praktik share QR ke orang lain.",
                  tint: "bg-sky-300/20 text-sky-200",
                },
                {
                  icon: Clock3,
                  title: "Dashboard Real-time",
                  desc: "Pantau sesi absensi aktif, rekap kehadiran, dan statistik harian.",
                  tint: "bg-rose-300/20 text-rose-200",
                },
              ].map((f, i) => (
                <li
                  key={f.title}
                  className="flex gap-4 items-start animate-float-in"
                  style={{ animationDelay: `${120 + i * 70}ms` }}
                >
                  <div
                    className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${f.tint} backdrop-blur-sm border border-white/10`}
                  >
                    <f.icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm">{f.title}</p>
                    <p className="text-xs text-white/75 leading-snug">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-xs text-white/70">
              <div className="h-6 flex items-center -space-x-1.5">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 ring-2 ring-white/30" />
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 ring-2 ring-white/30" />
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 ring-2 ring-white/30" />
              </div>
              <span>
                Digunakan oleh tim HR & pegawai untuk absensi harian yang lebih terstruktur.
              </span>
            </div>
          </div>

          {/* FOOTER LEFT */}
          <div className="text-xs text-white/60 font-medium flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Sistem Online
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" /> {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE: LOGIN FORM ===== */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:px-8 animate-float-in">
        {/* Mobile-only brand */}
        <div className="md:hidden mb-8 flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/30 border border-zinc-200">
            <img src="/logo2.jpeg" alt="QR Presence Logo" className="h-full w-full object-cover" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">QR Presence</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Enterprise Presence System</p>
          </div>
        </div>

        <div className="w-full max-w-md">
          {/* LOGIN CARD */}
          <div className="rounded-[1.4rem] border border-zinc-200/80 bg-white/90 backdrop-blur-xl shadow-2xl shadow-zinc-300/50 ring-1 ring-black/[0.02] card-shadow-lg card-hover">
            <div className="px-8 pt-8 pb-4">
              <div className="space-y-1 text-center mb-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-3">
                  <ShieldCheck className="h-3 w-3" /> Secure Login
                </span>
                <h1 className="text-[1.65rem] font-bold tracking-tight text-zinc-900">
                  Selamat Datang Kembali
                </h1>
                <p className="text-sm text-zinc-500">
                  Masukkan akun Anda untuk mengakses dashboard QR Presence.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4.5">
                  {/* EMAIL */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[13px] font-semibold text-zinc-800 ml-0.5">
                          Email
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${fieldState.invalid ? "text-red-500" : "text-zinc-400 group-focus-within:text-blue-600"}`}>
                              <Mail className="h-4 w-4" />
                            </span>
                            <Input
                              placeholder="admin@qrpresence.com"
                              type="email"
                              autoComplete="email"
                              className={`h-12 rounded-xl pl-10 pr-3 bg-zinc-50/80 border border-zinc-200 text-sm transition-all duration-200 shadow-sm ${
                                fieldState.invalid
                                  ? "focus:ring-red-400 border-red-200 bg-red-50/40"
                                  : "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 focus:shadow-md"
                              }`}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs ml-0.5" />
                      </FormItem>
                    )}
                  />

                  {/* PASSWORD */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-[13px] font-semibold text-zinc-800 ml-0.5">
                            Kata Sandi
                          </FormLabel>
                          <button
                            type="button"
                            onClick={() =>
                              toast("Fitur Lupa Kata Sandi akan hadir segera", {
                                icon: "⏳",
                                className: "!text-xs !bg-zinc-100 !text-zinc-700",
                              })
                            }
                            className="text-[11px] font-bold tracking-wide uppercase text-blue-700 hover:text-blue-800 hover:underline underline-offset-2 transition-colors"
                          >
                            Lupa Password?
                          </button>
                        </div>
                        <FormControl>
                          <div className="relative group">
                            <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${fieldState.invalid ? "text-red-500" : "text-zinc-400 group-focus-within:text-blue-600"}`}>
                              <Lock className="h-4 w-4" />
                            </span>
                            <Input
                              placeholder="••••••••"
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              className={`h-12 rounded-xl pl-10 pr-12 bg-zinc-50/80 border border-zinc-200 text-sm transition-all duration-200 shadow-sm ${
                                fieldState.invalid
                                  ? "focus:ring-red-400 border-red-200 bg-red-50/40"
                                  : "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 focus:shadow-md"
                              }`}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-lg hover:bg-zinc-100/80"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs ml-0.5" />
                      </FormItem>
                    )}
                  />

                  {/* REMEMBER ME */}
                  <FormField
                    control={form.control}
                    name="remember"
                    render={({ field }) => (
                      <FormItem className="pt-1">
                        <FormControl>
                          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
                            <span className="relative inline-flex items-center">
                              <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                onBlur={field.onBlur}
                                ref={field.ref}
                              />
                              <span className="h-[18px] w-[18px] rounded-md border-2 border-zinc-300 bg-white transition-all group-hover:border-blue-400 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-500/15 flex items-center justify-center">
                                <CheckCircle2
                                  className={`h-3.5 w-3.5 text-white transition-all ${
                                    field.value ? "scale-100 opacity-100" : "scale-75 opacity-0"
                                  }`}
                                />
                              </span>
                            </span>
                            <span className="text-sm text-zinc-600 font-medium group-hover:text-zinc-800 transition-colors">
                              Ingat saya di perangkat ini
                            </span>
                          </label>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* SUBMIT BUTTON */}
                  <Button
                    type="submit"
                    className="group relative w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-indigo-500/35 font-semibold text-[0.95rem] tracking-wide transition-all duration-200 hover:-translate-y-[1px] active:translate-y-[0px] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Memproses login...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        Masuk ke Dashboard
                        <svg
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </div>

            {/* Divider text */}
            <div className="px-8 pb-2">
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-zinc-200" />
                <span className="mx-3 shrink text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  Tips Keamanan
                </span>
                <div className="flex-grow border-t border-zinc-200" />
              </div>
            </div>

            <div className="px-8 pb-8 pt-4 space-y-3">
              <div className="flex gap-3 items-start p-3 rounded-xl bg-amber-50/70 border border-amber-100 text-amber-900">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-amber-100 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-wide">
                    Lindungi Akun Anda
                  </p>
                  <ul className="list-disc pl-4 text-[11.5px] leading-relaxed text-amber-800/90 space-y-0.5">
                    <li>Jangan pernah membagikan password Anda ke siapapun</li>
                    <li>Gunakan password unik kombinasi huruf, angka & simbol</li>
                    <li>Selalu pastikan URL situs benar sebelum login</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* COPYRIGHT */}
          <p className="mt-8 text-center text-[11.5px] text-zinc-400 font-medium tracking-wide">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3 w-3" />
              {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              <span className="opacity-60">•</span>
              &copy; {year} QR Presence. All rights reserved.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

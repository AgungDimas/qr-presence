import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import {
  Settings as SettingsIcon,
  User as UserIcon,
  ShieldCheck,
  Loader2,
  Save,
  KeyRound,
  Mail,
  Building2,
  UserCircle2,
  CheckCircle2,
  Bell,
  Palette,
} from "lucide-react";

import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DepartmentOption = { id: number; name: string };

/* ---------- ZOD SCHEMAS ---------- */
const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(255),
  email: z.string().email("Format email tidak valid"),
  avatar: z.string().max(255).optional().or(z.literal("")),
  department_id: z.coerce.number().nullable().optional(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(6, "Password saat ini minimal 6 karakter"),
    password: z.string().min(6, "Password baru minimal 6 karakter").max(100),
    password_confirmation: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .superRefine((v, ctx) => {
    if (v.password !== v.password_confirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Konfirmasi password tidak sama dengan password baru",
        path: ["password_confirmation"],
      });
    }
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

/* ---------- HELPERS ---------- */
const showApiError = (e: any, fallback: string) => {
  const data = e?.response?.data;
  if (data?.errors) {
    const k = Object.keys(data.errors)[0];
    if (k) {
      const msg = (data.errors[k] as string[])[0] ?? fallback;
      toast.error(msg);
      return;
    }
  }
  if (data?.message) {
    toast.error(data.message);
    return;
  }
  toast.error(fallback);
};

const initialsOf = (n: string) =>
  n
    .split(" ")
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("") || "?";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin Sistem",
  hr: "Kepegawaian / HR",
  manager: "Manager",
  employee: "Pegawai",
};

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-rose-50 text-rose-700 border-rose-200",
  hr: "bg-violet-50 text-violet-700 border-violet-200",
  manager: "bg-amber-50 text-amber-700 border-amber-200",
  employee: "bg-blue-50 text-blue-700 border-blue-200",
};

/* ---------- MAIN ---------- */
export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const { data: departments = [] } = useQuery<DepartmentOption[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await api.get("/departments");
      return (res.data?.data as DepartmentOption[]) ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });

  /* ---- PROFILE FORM ---- */
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      avatar: user?.avatar ?? "",
      department_id: null,
    },
  });

  // Sync ke form ketika user data sudah ada
  useMemo(() => {
    if (!user) return;
    // Cari department_id yang cocok dengan user.department (name)
    let deptId: number | null = null;
    if (user.department) {
      const found = departments.find((d) => d.name === user.department);
      if (found) deptId = found.id;
    }
    profileForm.reset({
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? "",
      department_id: deptId,
    });
  }, [user, departments, profileForm]);

  /* ---- PASSWORD FORM ---- */
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  /* ---- MUTATIONS ---- */
  const profileMut = useMutation({
    mutationFn: (v: ProfileValues) =>
      api.put("/settings/profile", {
        name: v.name,
        email: v.email,
        avatar: v.avatar || null,
        department_id: v.department_id ?? null,
      }),
    onSuccess: async () => {
      await refreshUser();
      toast.success("Profil berhasil diperbarui");
    },
    onError: (e: any) => showApiError(e, "Gagal memperbarui profil"),
  });

  const passwordMut = useMutation({
    mutationFn: (v: PasswordValues) =>
      api.put("/settings/password", {
        current_password: v.current_password,
        password: v.password,
        password_confirmation: v.password_confirmation,
      }),
    onSuccess: () => {
      toast.success("Kata sandi berhasil diubah");
      passwordForm.reset({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    },
    onError: (e: any) => showApiError(e, "Gagal mengubah kata sandi"),
  });

  return (
    <div className="space-y-6 animate-float-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-2">
            <SettingsIcon className="h-3.5 w-3.5" /> Pengaturan Akun
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Pengaturan
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Atur informasi akun pribadi dan keamanan Anda.
          </p>
        </div>
        <Badge
          variant="outline"
          className="h-8 px-3 text-xs bg-white text-zinc-700 border-zinc-200 self-start sm:self-end"
        >
          {user ? `${user.email}` : "Memuat..."}
        </Badge>
      </div>

      {/* CARD IDENTITY (quick info) */}
      <Card className="border-zinc-200/80 card-shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="h-24 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:14px_14px]" />
          </div>
          <div className="px-6 pb-6 flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 relative">
            <div className="shrink-0">
              <div className="h-20 w-20 rounded-2xl bg-white shadow-xl border-4 border-white flex items-center justify-center text-zinc-900 font-bold text-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white">
                {user ? initialsOf(user.name) : "…"}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                {user?.name ?? "Memuat..."}
              </h2>
              <p className="text-sm text-zinc-500 mt-0.5 inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {user && (
                  <Badge
                    className={`px-2.5 py-1 text-xs font-semibold border ${ROLE_BADGE[user.role] ?? ROLE_BADGE.employee}`}
                  >
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {ROLE_LABEL[user.role] ?? user.role}
                  </Badge>
                )}
                {user?.department && (
                  <Badge variant="outline" className="px-2.5 py-1 text-xs border-zinc-200 bg-white text-zinc-700">
                    <Building2 className="h-3 w-3 mr-1" />
                    {user.department}
                  </Badge>
                )}
                {user?.joined_at && (
                  <Badge variant="outline" className="px-2.5 py-1 text-xs border-zinc-200 bg-white text-zinc-700">
                    Bergabung: {new Date(user.joined_at).toLocaleDateString("id-ID")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABS NAV */}
      <Card className="border-zinc-200/80 card-shadow-sm">
        <CardContent className="p-0">
          <div className="flex border-b border-zinc-200/70 bg-zinc-50/60">
            <button
              onClick={() => setActiveTab("profile")}
              className={`relative px-6 py-3.5 text-sm font-semibold transition-colors ${
                activeTab === "profile"
                  ? "text-emerald-700 bg-white"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> Profil Pribadi
              </span>
              {activeTab === "profile" && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-t bg-emerald-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`relative px-6 py-3.5 text-sm font-semibold transition-colors ${
                activeTab === "password"
                  ? "text-emerald-700 bg-white"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <KeyRound className="h-4 w-4" /> Keamanan
              </span>
              {activeTab === "password" && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-t bg-emerald-500" />
              )}
            </button>
          </div>

          <div className="p-6 md:p-8">
            {/* ============ PROFILE TAB ============ */}
            {activeTab === "profile" && (
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit((v) => profileMut.mutate(v))}
                  className="space-y-6"
                >
                  <CardHeader className="-mx-8 -mt-8 px-0 pb-6 mb-4 !p-0 space-y-1.5">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-zinc-900">
                      <UserCircle2 className="h-5 w-5 text-emerald-600" /> Informasi Pribadi
                    </CardTitle>
                    <CardDescription>
                      Ubah nama, alamat email, foto profil, dan departemen Anda.
                    </CardDescription>
                  </CardHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-medium text-zinc-800">
                            Nama Lengkap
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="h-11 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-medium text-zinc-800">Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" className="h-11 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-zinc-800">
                            URL Foto Profil
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://..."
                              className="h-11 rounded-xl"
                            />
                          </FormControl>
                          <p className="text-xs text-zinc-500 pt-1">
                            Opsional. Isi dengan URL gambar yang bisa diakses publik.
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="department_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-zinc-800">Departemen</FormLabel>
                          <FormControl>
                            <select
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(e.target.value ? Number(e.target.value) : null)
                              }
                              onBlur={field.onBlur}
                              ref={field.ref}
                              className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                            >
                              <option value="">-- Tidak ada --</option>
                              {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-1" />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                    <p className="text-xs text-zinc-500 inline-flex items-start gap-1.5 max-w-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      Perubahan akan disimpan dan secara otomatis diperbarui pada seluruh menu aplikasi.
                    </p>
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 rounded-xl shadow-md shadow-emerald-500/20"
                      disabled={profileMut.isPending || !user}
                    >
                      {profileMut.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* ============ PASSWORD TAB ============ */}
            {activeTab === "password" && (
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit((v) => passwordMut.mutate(v))}
                  className="space-y-6"
                >
                  <CardHeader className="-mx-8 -mt-8 px-0 pb-6 mb-4 !p-0 space-y-1.5">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-zinc-900">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" /> Ubah Kata Sandi
                    </CardTitle>
                    <CardDescription>
                      Jaga keamanan akun dengan mengganti kata sandi secara berkala.
                    </CardDescription>
                  </CardHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={passwordForm.control}
                      name="current_password"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-medium text-zinc-800">
                            Kata Sandi Saat Ini
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              className="h-11 rounded-xl"
                              placeholder="Masukkan password lama"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-zinc-800">
                            Kata Sandi Baru
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              className="h-11 rounded-xl"
                              placeholder="Minimal 6 karakter"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="password_confirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-zinc-800">
                            Konfirmasi Kata Sandi Baru
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              className="h-11 rounded-xl"
                              placeholder="Ulangi password baru"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50/60 p-4 text-sm text-amber-800 flex gap-3 items-start">
                    <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-amber-900">Tips Keamanan</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-xs">
                        <li>Gunakan minimal 8 karakter kombinasi huruf, angka, dan simbol</li>
                        <li>Jangan pakai kata sandi yang sama dengan akun lain</li>
                        <li>Ubah kata sandi Anda setiap 3-6 bulan sekali</li>
                      </ul>
                    </div>
                  </div>

                  <Separator className="my-1" />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                    <p className="text-xs text-zinc-500">
                      Setelah disimpan, sesi login perangkat lain akan tetap aktif.
                    </p>
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 rounded-xl shadow-md shadow-emerald-500/20"
                      disabled={passwordMut.isPending}
                    >
                      {passwordMut.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                        </>
                      ) : (
                        <>
                          <KeyRound className="mr-2 h-4 w-4" /> Ubah Kata Sandi
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* FOOTER NOTE (placeholder panels utk next iterasi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-zinc-200/80 card-shadow-sm card-hover">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Bell className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold text-zinc-900">Notifikasi</CardTitle>
                <CardDescription className="text-xs">Preferensi email & push</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="h-6 text-[11px] border-zinc-200 bg-zinc-50 text-zinc-500">
              Segera
            </Badge>
          </CardHeader>
          <CardContent className="text-xs text-zinc-500">
            Atur notifikasi absensi, pengumuman, dan peringatan batas wilayah presensi.
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 card-shadow-sm card-hover">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Palette className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold text-zinc-900">Tema Antarmuka</CardTitle>
                <CardDescription className="text-xs">Mode terang / gelap & aksen</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="h-6 text-[11px] border-zinc-200 bg-zinc-50 text-zinc-500">
              Segera
            </Badge>
          </CardHeader>
          <CardContent className="text-xs text-zinc-500">
            Kustomisasi warna tema aplikasi dan mode gelap untuk kenyamanan penggunaan.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

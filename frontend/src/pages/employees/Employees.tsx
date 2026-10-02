import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  X,
  Shield,
  Mail,
  Building2,
  AlertTriangle,
  UserPlus,
  UserCheck2,
  Filter,
  Calendar,
  CheckCircle2,
  UserX2,
} from "lucide-react";

import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ---------- TYPES ---------- */
type Role = "admin" | "hr" | "manager" | "employee";

interface Department {
  id: number;
  name: string;
  description?: string;
  users_count?: number;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  role: Role;
  department?: string | null;
  avatar?: string | null;
  joined_at?: string;
  department_id?: number | null;
}

type EmployeeFull = Employee & {
  created_at?: string;
};

/* ---------- ZOD SCHEMAS ---------- */
const roleEnum = z.enum(["admin", "hr", "manager", "employee"]);

const createSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(255),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    password_confirmation: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
    role: roleEnum.default("employee"),
    department_id: z.coerce.number().nullable().optional(),
  });

const editSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  role: z.enum(["admin", "employee", "hr", "manager"]),
  department_id: z.coerce.number().nullable().optional(),
  password: z
    .string()
    .max(100)
    .optional()
    .or(z.literal("")),
  password_confirmation: z.string().optional().or(z.literal("")),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

/* ---------- ROLE HELPERS ---------- */
const ROLES: { value: Role | "all"; label: string; badge: string }[] = [
  { value: "all", label: "Semua", badge: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  {
    value: "admin",
    label: "Admin",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    value: "hr",
    label: "HR",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    value: "manager",
    label: "Manajer",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "employee",
    label: "Pegawai",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
];

const roleBadge = (r: string) => {
  const found = ROLES.find((x) => x.value === r);
  if (found) return found;
  return ROLES[0];
};

const roleBadgeCls = (r: string) => {
  switch (r) {
    case "admin":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "hr":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "manager":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
};

const roleColors = {
  admin: "from-rose-500 to-rose-600",
  hr: "from-violet-500 to-violet-600",
  manager: "from-amber-500 to-orange-500",
  employee: "from-blue-500 to-blue-600",
};

const roleIconBg = (r: string) => {
  switch (r) {
    case "admin":
      return "bg-gradient-rose";
    case "hr":
      return "bg-gradient-violet";
    case "manager":
      return "bg-gradient-amber";
    default:
      return "bg-gradient-blue";
  }
};

/* ---------- MAIN PAGE ---------- */
export default function Employees() {
  const qc = useQueryClient();

  /* ---- STATE ---- */
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<typeof ROLES[number]["value"]>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeFull | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeFull | null>(null);

  /* ---- QUERIES ---- */
  const {
    data: employees,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", search, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("per_page", String(30));
      if (search.trim()) params.set("search", search.trim());
      if (roleFilter !== "all") params.set("role", roleFilter);
      const res = await api.get(`/users?${params.toString()}`);
      // Laravel resource collection with paginate: { data: [...], meta, links }
      // Handle 2 bentuk response agar aman
      const payload = res.data as any;
      return Array.isArray(payload)
        ? (payload as EmployeeFull[])
        : Array.isArray(payload?.data)
        ? (payload.data as EmployeeFull[])
        : [];
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await api.get("/departments");
      return (res.data?.data as Department[]) ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const list = employees ?? [];

  /* ---- SUMMARY COUNTERS ---- */
  const counters = useMemo(() => {
    const c = { total: list.length, admin: 0, hr: 0, manager: 0, employee: 0 };
    list.forEach((u) => {
      if (u.role === "admin") c.admin++;
      if (u.role === "hr") c.hr++;
      if (u.role === "manager") c.manager++;
      if (u.role === "employee") c.employee++;
    });
    return c;
  }, [list]);

  /* ---- HELPERS ---- */
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

  /* ---- FORMS ---- */
  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "employee",
      department_id: undefined as any,
    },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "employee",
      department_id: null,
      password: "",
      password_confirmation: "",
    },
  });

  // Isi edit form saat user dipilih
  useMemo(() => {
    if (!editing) return;
    editForm.reset({
      name: editing.name,
      email: editing.email,
      role: editing.role as any,
      department_id: editing.department_id ?? null,
      password: "",
      password_confirmation: "",
    });
  }, [editing, editForm]);

  /* ---- MUTATIONS ---- */
  const createMut = useMutation({
    mutationFn: (v: CreateValues) => {
      const payload: any = {
        name: v.name,
        email: v.email,
        password: v.password,
        password_confirmation: v.password_confirmation,
        role: v.role,
        department_id: v.department_id ?? null,
      };
      return api.post("/users", payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Pegawai berhasil ditambahkan");
      setCreateOpen(false);
      createForm.reset();
    },
    onError: (e: any) => showApiError(e, "Gagal menambahkan pegawai"),
  });

  const editMut = useMutation({
    mutationFn: (v: EditValues & { id: number }) => {
      const payload: any = {
        name: v.name,
        email: v.email,
        role: v.role,
        department_id: v.department_id ?? null,
      };
      if (v.password) {
        payload.password = v.password;
        payload.password_confirmation = v.password_confirmation;
      } else {
        payload.password = null;
        payload.password_confirmation = null;
      }
      return api.put(`/users/${v.id}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["me"] }); // jika mengedit diri sendiri
      toast.success("Data pegawai berhasil diperbarui");
      setEditing(null);
    },
    onError: (e: any) => showApiError(e, "Gagal memperbarui pegawai"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Pegawai berhasil dihapus");
      setDeleteTarget(null);
      // Jika kita menghapus user yang sedang diedit, tutup juga edit modal
      if (editing?.id === id) setEditing(null);
    },
    onError: (e: any) => showApiError(e, "Gagal menghapus pegawai"),
  });

  /* ---- LOADING / ERROR SKELETON ---- */
  const SkeletonRow = () => (
    <TableRow className="hover:bg-transparent">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full skeleton-shimmer" />
          <div className="space-y-2 min-w-[140px]">
            <div className="h-4 w-32 rounded skeleton-shimmer" />
            <div className="h-3 w-40 rounded skeleton-shimmer" />
          </div>
        </div>
      </TableCell>
      <TableCell><div className="h-5 w-20 rounded-full skeleton-shimmer" /></TableCell>
      <TableCell><div className="h-4 w-32 rounded skeleton-shimmer" /></TableCell>
      <TableCell><div className="h-4 w-20 rounded skeleton-shimmer" /></TableCell>
      <TableCell><div className="h-5 w-16 rounded-full skeleton-shimmer" /></TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1.5">
          <div className="h-8 w-8 rounded-lg skeleton-shimmer" />
          <div className="h-8 w-8 rounded-lg skeleton-shimmer" />
        </div>
      </TableCell>
    </TableRow>
  );

  /* ---- RENDER ---- */
  return (
    <div className="space-y-6 animate-float-in">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full mb-2">
            <Users className="h-3.5 w-3.5" /> Data Master
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Manajemen Pegawai
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Kelola akun, peran (role), dan departemen untuk seluruh pegawai.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="outline" className="h-8 px-3 text-xs border-zinc-200 bg-white text-zinc-700">
            Total Pegawai: <span className="font-bold ml-1 text-zinc-900">{counters.total}</span>
          </Badge>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700 h-10 px-4 rounded-xl shadow-lg shadow-violet-500/20">
                <UserPlus className="mr-2 h-4 w-4" /> Tambah Pegawai
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px] p-0 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 text-white">
                <DialogHeader className="text-left">
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <UserPlus className="h-5 w-5" /> Tambah Pegawai Baru
                  </DialogTitle>
                  <DialogDescription className="text-violet-100/90">
                    Sistem akan mengirim email dan password awal ke akun.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-6 max-h-[72vh] overflow-y-auto">
                <Form {...createForm}>
                  <form
                    className="space-y-4"
                    onSubmit={createForm.handleSubmit((v) => createMut.mutate(v))}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="font-medium text-zinc-800">Nama Lengkap</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-10 rounded-xl"
                                placeholder="Contoh: Andi Pratama"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="font-medium text-zinc-800">Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                className="h-10 rounded-xl"
                                placeholder="andi@perusahaan.com"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-zinc-800">Password Baru</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="h-10 rounded-xl" placeholder="Min. 6 karakter" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="password_confirmation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-zinc-800">Konfirmasi Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="h-10 rounded-xl" placeholder="Ulangi password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-zinc-800">Peran / Role</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                              >
                                <option value="admin">Admin</option>
                                <option value="hr">HR / Kepegawaian</option>
                                <option value="manager">Manager</option>
                                <option value="employee">Pegawai</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
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
                                className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
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
                    <Separator className="my-2" />
                    <DialogFooter className="gap-2 pt-1">
                      <DialogClose asChild>
                        <Button variant="outline" className="rounded-xl h-10">
                          Batal
                        </Button>
                      </DialogClose>
                      <Button
                        type="submit"
                        className="bg-violet-600 hover:bg-violet-700 rounded-xl h-10 px-6 shadow-md shadow-violet-500/20"
                        disabled={createMut.isPending}
                      >
                        {createMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {createMut.isPending ? "Menyimpan..." : "Simpan Pegawai"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ===== ROLE STATS ROW ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Admin",
            value: counters.admin,
            icon: Shield,
            gradient: "from-rose-500 to-rose-600",
          },
          {
            label: "HR",
            value: counters.hr,
            icon: Users,
            gradient: "from-violet-500 to-violet-600",
          },
          {
            label: "Manager",
            value: counters.manager,
            icon: UserCheck2,
            gradient: "from-amber-500 to-orange-500",
          },
          {
            label: "Pegawai",
            value: counters.employee,
            icon: Building2,
            gradient: "from-blue-500 to-blue-600",
          },
        ].map((s, i) => (
          <Card
            key={s.label}
            className="overflow-hidden border-zinc-200/80 card-shadow-sm card-hover animate-float-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <CardContent className="p-0">
              <div className="flex items-stretch">
                <div className={`w-20 bg-gradient-to-br ${s.gradient} text-white flex items-center justify-center`}>
                  <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                    <s.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex-1 p-4 space-y-0.5">
                  <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
                  <p className="text-2xl font-bold tracking-tight text-zinc-900">
                    {isLoading ? "…" : s.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== SEARCH + FILTER ===== */}
      <Card className="border-zinc-200/80 card-shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Cari nama / email pegawai..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-10 rounded-xl bg-zinc-50/80"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 mr-1">
              <Filter className="h-3.5 w-3.5" /> Peran:
            </div>
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRoleFilter(r.value)}
                className={`h-8 px-3 text-xs font-semibold rounded-full border transition-all ${
                  roleFilter === r.value
                    ? r.badge.replace("bg-", "bg-") + " shadow-sm ring-2 ring-offset-1 ring-zinc-200"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== TABLE ===== */}
      <Card className="border border-zinc-200/80 card-shadow-md overflow-hidden">
        <div className="rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50/80 backdrop-blur">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-12 px-4 text-zinc-700 font-semibold text-xs uppercase tracking-wider">
                  Pegawai
                </TableHead>
                <TableHead className="h-12 px-4 text-zinc-700 font-semibold text-xs uppercase tracking-wider">
                  Peran
                </TableHead>
                <TableHead className="h-12 px-4 text-zinc-700 font-semibold text-xs uppercase tracking-wider">
                  Departemen
                </TableHead>
                <TableHead className="h-12 px-4 text-zinc-700 font-semibold text-xs uppercase tracking-wider">
                  Bergabung
                </TableHead>
                <TableHead className="h-12 px-4 text-zinc-700 font-semibold text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="h-12 px-4 text-right text-zinc-700 font-semibold text-xs uppercase tracking-wider">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : error ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center py-14">
                    <AlertTriangle className="mx-auto h-10 w-10 text-red-500 mb-3" />
                    <p className="font-semibold text-zinc-900">Gagal memuat data pegawai</p>
                    <p className="text-sm text-zinc-500 mt-1">Periksa koneksi backend atau login ulang.</p>
                  </TableCell>
                </TableRow>
              ) : list.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-zinc-400" />
                    </div>
                    <p className="font-semibold text-zinc-900 text-lg">
                      {search || roleFilter !== "all"
                        ? "Tidak ada pegawai yang cocok"
                        : "Belum ada data pegawai"}
                    </p>
                    <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
                      {search || roleFilter !== "all"
                        ? "Coba hapus pencarian atau ubah filter peran."
                        : "Tambahkan pegawai pertama untuk memulai."}
                    </p>
                    {!search && roleFilter === "all" && (
                      <Button
                        className="mt-5 bg-violet-600 hover:bg-violet-700 rounded-xl h-10"
                        onClick={() => setCreateOpen(true)}
                      >
                        <UserPlus className="mr-1.5 h-4 w-4" /> Tambah Pegawai Pertama
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                list.map((u, i) => {
                  const roleCfg = ROLES.find((r) => r.value === u.role) ?? ROLES[0];
                  return (
                    <TableRow
                      key={u.id}
                      className="group animate-float-in"
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      <TableCell className="py-4 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative">
                            <div
                              className={`h-11 w-11 shrink-0 rounded-full bg-gradient-to-br ${roleIconBg(
                                u.role
                              )} text-white shadow-md flex items-center justify-center font-bold`}
                            >
                              {initialsOf(u.name)}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 truncate">{u.name}</p>
                            <p className="text-xs text-zinc-500 mt-0.5 truncate flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <Badge
                          className={`h-6 px-2.5 text-[11px] border font-semibold ${roleBadgeCls(u.role)}`}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {roleCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4">
                        {u.department ? (
                          <div className="inline-flex items-center gap-1.5 text-sm text-zinc-800">
                            <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                            {u.department}
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        {u.joined_at || u.created_at ? (
                          <div className="flex items-center gap-1.5 text-sm text-zinc-800">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                            {new Date(u.joined_at ?? u.created_at!).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Aktif
                        </span>
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <div className="flex justify-end items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          {/* EDIT */}
                          <Dialog
                            open={editing?.id === u.id}
                            onOpenChange={(o) => !o && setEditing(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg text-zinc-500 hover:text-violet-600 hover:bg-violet-50"
                                onClick={() => setEditing(u)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[560px] p-0 rounded-2xl overflow-hidden">
                              <div className="px-6 py-5 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 text-white">
                                <DialogHeader className="text-left">
                                  <DialogTitle className="flex items-center gap-2 text-xl">
                                    <Pencil className="h-5 w-5" /> Edit Data Pegawai
                                  </DialogTitle>
                                  <DialogDescription className="text-indigo-100/90">
                                    Ubah biodata, peran, departemen, dan status.
                                  </DialogDescription>
                                </DialogHeader>
                              </div>
                              <div className="p-6 max-h-[72vh] overflow-y-auto">
                                <Form {...editForm}>
                                  <form
                                    className="space-y-4"
                                    onSubmit={editForm.handleSubmit((v) =>
                                      editing && editMut.mutate({ ...v, id: editing.id })
                                    )}
                                  >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <FormField
                                        control={editForm.control}
                                        name="name"
                                        render={({ field }) => (
                                          <FormItem className="sm:col-span-2">
                                            <FormLabel className="font-medium text-zinc-800">Nama Lengkap</FormLabel>
                                            <FormControl>
                                              <Input {...field} className="h-10 rounded-xl" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
                                        name="email"
                                        render={({ field }) => (
                                          <FormItem className="sm:col-span-2">
                                            <FormLabel className="font-medium text-zinc-800">Email</FormLabel>
                                            <FormControl>
                                              <Input {...field} type="email" className="h-10 rounded-xl" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
                                        name="role"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-medium text-zinc-800">Peran / Role</FormLabel>
                                            <FormControl>
                                              <select
                                                {...field}
                                                className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                              >
                                                <option value="admin">Admin</option>
                                                <option value="hr">HR / Kepegawaian</option>
                                                <option value="manager">Manager</option>
                                                <option value="employee">Pegawai</option>
                                              </select>
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
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
                                                className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                                      <FormField
                                        control={editForm.control}
                                        name="password"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-medium text-zinc-800">Password Baru</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="password"
                                                {...field}
                                                className="h-10 rounded-xl"
                                                placeholder="Kosongkan jika tidak diubah"
                                              />
                                            </FormControl>
                                            <p className="text-xs text-zinc-500 pt-0.5">
                                              Opsional. Min. 6 karakter jika ingin diubah.
                                            </p>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
                                        name="password_confirmation"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-medium text-zinc-800">Konfirmasi Password</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="password"
                                                {...field}
                                                className="h-10 rounded-xl"
                                                placeholder="Ulangi password"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <Separator className="my-1" />
                                    <DialogFooter className="gap-2 pt-1">
                                      <DialogClose asChild>
                                        <Button variant="outline" className="rounded-xl h-10">
                                          Batal
                                        </Button>
                                      </DialogClose>
                                      <Button
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-10 px-6 shadow-md shadow-indigo-500/20"
                                        disabled={editMut.isPending}
                                      >
                                        {editMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editMut.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </Form>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* DELETE */}
                          <Dialog
                            open={deleteTarget?.id === u.id}
                            onOpenChange={(o) => !o && setDeleteTarget(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => setDeleteTarget(u)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
                              <div className="p-6">
                                <div className="mx-auto h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                                  <AlertTriangle className="h-7 w-7" />
                                </div>
                                <DialogHeader className="text-center">
                                  <DialogTitle className="text-xl">Hapus Akun Pegawai?</DialogTitle>
                                  <DialogDescription className="pt-1 text-zinc-600">
                                    Tindakan ini tidak dapat dibatalkan. Anda akan menghapus akun{" "}
                                    <span className="font-semibold text-zinc-900">
                                      {deleteTarget?.name} ({deleteTarget?.email})
                                    </span>{" "}
                                    beserta seluruh data terkait.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                                  <AlertTriangle className="h-4 w-4 shrink-0" />
                                  <span>
                                    Sistem secara otomatis menolak penghapusan akun jika itu adalah
                                    akun Anda sendiri.
                                  </span>
                                </div>
                              </div>
                              <div className="p-6 pt-0 flex flex-col-reverse sm:flex-row justify-end gap-2">
                                <DialogClose asChild>
                                  <Button variant="outline" className="h-10 rounded-xl">
                                    Batal
                                  </Button>
                                </DialogClose>
                                <Button
                                  variant="destructive"
                                  className="h-10 rounded-xl bg-red-600 hover:bg-red-700"
                                  disabled={deleteMut.isPending}
                                  onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
                                >
                                  {deleteMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  {deleteMut.isPending ? "Menghapus..." : "Hapus Permanen"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {!isLoading && list.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500 px-1">
          <p className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Menampilkan <span className="font-semibold text-zinc-900">{list.length}</span> pegawai
          </p>
          <p>Data diperbarui otomatis via TanStack Query cache.</p>
        </div>
      )}
    </div>
  );
}

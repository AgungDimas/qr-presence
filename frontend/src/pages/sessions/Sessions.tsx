import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import {
  Plus,
  QrCode,
  Trash2,
  Loader2,
  Pencil,
  Search,
  X,
  Copy,
  Download,
  CalendarRange,
  Clock3,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  Filter,
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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

/* ---------- ZOD SCHEMAS ---------- */
const sessionCreateSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(255),
  description: z.string().max(1000).optional().or(z.literal("")),
  valid_until: z.string().min(1, "Batas waktu wajib diisi"),
  radius: z.coerce.number().min(10, "Radius minimal 10 meter").default(50),
});
const sessionEditSchema = sessionCreateSchema.extend({
  is_active: z.boolean().default(true),
});
type CreateValues = z.infer<typeof sessionCreateSchema>;
type EditValues = z.infer<typeof sessionEditSchema>;

/* ---------- HELPERS ---------- */
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getSessionStatus(s: Session): {
  label: "Aktif" | "Kedaluwarsa" | "Tidak Aktif";
  variant: "success" | "danger" | "muted";
  expired: boolean;
} {
  const expired = new Date(s.valid_until) < new Date();
  if (!s.is_active) return { label: "Tidak Aktif", variant: "muted", expired: true };
  if (expired) return { label: "Kedaluwarsa", variant: "danger", expired: true };
  return { label: "Aktif", variant: "success", expired: false };
}

function StatusBadge({ status }: { status: ReturnType<typeof getSessionStatus> }) {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border";
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

/* ---------- MAIN COMPONENT ---------- */
export default function Sessions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState<Session | null>(null);
  const [editing, setEditing] = useState<Session | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Session | null>(null);

  /* ---------- QUERIES / MUTATIONS ---------- */
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ["attendance-sessions"],
    queryFn: async () => {
      const res = await api.get("/attendance-sessions?per_page=50");
      return res.data.data as Session[];
    },
  });

  const showError = (err: any, fallbackMsg: string) => {
    const data = err?.response?.data;
    if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      const msg = data.errors[firstKey][0];
      toast.error(msg);
    } else if (data?.message) {
      toast.error(data.message);
    } else {
      toast.error(fallbackMsg);
    }
  };

  const createMut = useMutation({
    mutationFn: async (v: CreateValues) => {
      const payload: any = {
        title: v.title,
        description: v.description || null,
        valid_until: v.valid_until.replace("T", " ") + ":00",
        radius: v.radius,
      };
      return api.post("/attendance-sessions", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      toast.success("Sesi absensi berhasil dibuat!");
      setCreateOpen(false);
      createForm.reset();
    },
    onError: (e: any) => showError(e, "Gagal membuat sesi"),
  });

  const editMut = useMutation({
    mutationFn: async (v: EditValues & { id: number }) => {
      const payload: any = {
        title: v.title,
        description: v.description || null,
        valid_until: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(v.valid_until)
          ? v.valid_until
          : v.valid_until.replace("T", " ") + ":00",
        radius: v.radius,
        is_active: v.is_active,
      };
      return api.put(`/attendance-sessions/${v.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      toast.success("Sesi berhasil diperbarui!");
      setEditing(null);
    },
    onError: (e: any) => showError(e, "Gagal memperbarui sesi"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/attendance-sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      toast.success("Sesi berhasil dihapus");
      setDeleteTarget(null);
    },
    onError: (e: any) => showError(e, "Gagal menghapus sesi"),
  });

  /* ---------- FORMS ---------- */
  const createForm = useForm<CreateValues>({
    resolver: zodResolver(sessionCreateSchema),
    defaultValues: { title: "", description: "", valid_until: "", radius: 50 },
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(sessionEditSchema),
    defaultValues: { title: "", description: "", valid_until: "", radius: 50, is_active: true },
  });

  // Isi form edit saat session dipilih
  useMemo(() => {
    if (!editing) return;
    editForm.reset({
      title: editing.title,
      description: editing.description ?? "",
      valid_until: editing.valid_until.replace(" ", "T").slice(0, 16),
      radius: editing.location?.radius ?? 50,
      is_active: editing.is_active,
    });
  }, [editing, editForm]);

  /* ---------- FILTERED DATA ---------- */
  const filteredSessions = useMemo(() => {
    const list = sessions ?? [];
    return list.filter((s) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${s.title} ${s.description ?? ""} ${s.created_by ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const status = getSessionStatus(s);
      if (filter === "active" && status.variant !== "success") return false;
      if (filter === "expired" && status.variant !== "danger") return false;
      return true;
    });
  }, [sessions, search, filter]);

  const counters = useMemo(() => {
    const list = sessions ?? [];
    let active = 0, expired = 0;
    list.forEach((s) => {
      const st = getSessionStatus(s);
      if (st.variant === "success") active++;
      if (st.variant === "danger") expired++;
    });
    return { total: list.length, active, expired };
  }, [sessions]);

  /* ---------- QR HELPERS ---------- */
  const copyUuid = (s: Session) => {
    navigator.clipboard.writeText(s.qr_code_data);
    toast.success("Data QR disalin ke clipboard");
  };
  const downloadQr = (s: Session) => {
    try {
      const svg = document.getElementById(`qr-svg-${s.id}`) as SVGSVGElement | null;
      if (!svg) return toast.error("Gagal mengunduh QR");
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const svg64 = btoa(unescape(encodeURIComponent(source)));
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 1024;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        const link = document.createElement("a");
        link.download = `QR_${s.title.replace(/\s+/g, "_")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("QR Code diunduh");
      };
      img.src = "data:image/svg+xml;base64," + svg64;
    } catch {
      toast.error("Gagal mengunduh QR");
    }
  };

  /* ---------- TABLE HELPERS ---------- */
  const SkeletonRow = () => (
    <TableRow className="hover:bg-transparent">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
          <div className="space-y-2">
            <div className="h-4 w-44 rounded skeleton-shimmer" />
            <div className="h-3 w-24 rounded skeleton-shimmer" />
          </div>
        </div>
      </TableCell>
      <TableCell><div className="h-4 w-20 rounded skeleton-shimmer" /></TableCell>
      <TableCell><div className="h-4 w-36 rounded skeleton-shimmer" /></TableCell>
      <TableCell><div className="h-6 w-24 rounded-full skeleton-shimmer" /></TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <div className="h-8 w-20 rounded-lg skeleton-shimmer" />
          <div className="h-8 w-8 rounded-lg skeleton-shimmer" />
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6 animate-float-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2">
            <CalendarRange className="h-3.5 w-3.5" /> Kelola Sesi Absensi
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Sesi Absensi
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Buat, kelola, dan bagikan QR Code sesi absensi kepada tim.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Badge variant="outline" className="h-8 px-3 text-xs border-zinc-200 bg-white text-zinc-700">
            Total: <span className="font-bold ml-1 text-zinc-900">{counters.total}</span>
          </Badge>
          <Badge className="h-8 px-3 text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
            Aktif: <span className="font-bold ml-1">{counters.active}</span>
          </Badge>
          <Badge className="h-8 px-3 text-xs bg-red-50 text-red-700 border-red-200">
            Kedaluwarsa: <span className="font-bold ml-1">{counters.expired}</span>
          </Badge>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-4 rounded-xl shadow-lg shadow-blue-500/20">
                <Plus className="mr-2 h-4 w-4" /> Buat Sesi Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] p-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-blue px-6 py-5 text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <QrCode className="h-5 w-5" /> Buat Sesi Absensi
                  </DialogTitle>
                  <DialogDescription className="text-blue-100/90">
                    Sistem akan otomatis menghasilkan QR Code unik (UUID) untuk sesi ini.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-6 pt-5 max-h-[70vh] overflow-y-auto">
                <Form {...createForm}>
                  <form
                    onSubmit={createForm.handleSubmit((v) => createMut.mutate(v))}
                    className="space-y-4"
                  >
                    <FormField
                      control={createForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-zinc-800">Nama Sesi</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Absen Pagi 15 Agustus 2026" {...field} className="h-10 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-zinc-800">Deskripsi (Opsional)</FormLabel>
                          <FormControl>
                            <textarea
                              rows={3}
                              placeholder="Keterangan tambahan, misal lokasi rapat, tema, dll."
                              className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="valid_until"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-zinc-800">Batas Waktu Absen</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} className="h-10 rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="radius"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium text-zinc-800">Radius Lokasi (meter)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="h-10 rounded-xl" />
                            </FormControl>
                            <p className="text-xs text-zinc-500 pt-0.5">Min. 10 m · default 50 m</p>
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
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10 px-5 shadow-md shadow-blue-500/20"
                        disabled={createMut.isPending}
                      >
                        {createMut.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {createMut.isPending ? "Menyimpan..." : "Simpan Sesi"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search + Filter */}
      <Card className="border-zinc-200/80 card-shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Cari nama sesi / deskripsi / pembuat..."
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
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 mr-1">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </div>
            {([
              { k: "all", label: "Semua" },
              { k: "active", label: "Aktif" },
              { k: "expired", label: "Kedaluwarsa" },
            ] as const).map((f) => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={`h-8 px-3 text-xs font-semibold rounded-full border transition-all ${
                  filter === f.k
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-zinc-200/80 card-shadow-md overflow-hidden">
        <div className="rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50/80 backdrop-blur">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-12 px-4 text-zinc-700 font-semibold text-xs uppercase tracking-wider">
                  Nama Sesi
                </TableHead>
                <TableHead className="h-12 px-4 text-zinc-700 font-semibold text-xs uppercase tracking-wider">
                  Pembuat
                </TableHead>
                <TableHead className="h-12 px-4 text-zinc-700 font-semibold text-xs uppercase tracking-wider">
                  Batas Waktu
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
                  <TableCell colSpan={5} className="text-center py-14">
                    <AlertTriangle className="mx-auto h-10 w-10 text-red-500 mb-3" />
                    <p className="font-semibold text-zinc-900">Gagal memuat data sesi</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      Periksa koneksi backend atau login ulang.
                    </p>
                  </TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                      <CalendarRange className="h-8 w-8 text-zinc-400" />
                    </div>
                    <p className="font-semibold text-zinc-900 text-lg">
                      {search || filter !== "all" ? "Tidak ada sesi yang cocok" : "Belum ada sesi absensi"}
                    </p>
                    <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
                      {search || filter !== "all"
                        ? "Coba hapus filter / kata kunci pencarian."
                        : "Buat sesi absensi pertama Anda untuk memulai."}
                    </p>
                    {!search && filter === "all" && (
                      <Button
                        className="mt-5 bg-blue-600 hover:bg-blue-700 rounded-xl h-10"
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus className="mr-1.5 h-4 w-4" /> Buat Sesi Pertama
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((s, i) => {
                  const status = getSessionStatus(s);
                  return (
                    <TableRow
                      key={s.id}
                      className="group animate-float-in"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <TableCell className="py-4 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center shadow-md ${
                            status.variant === "success"
                              ? "bg-gradient-emerald text-white shadow-emerald-200/60"
                              : status.variant === "danger"
                              ? "bg-gradient-amber text-white shadow-amber-200/60"
                              : "bg-gradient-slate text-white shadow-zinc-200/60"
                          }`}>
                            <QrCode className="h-5 w-5" strokeWidth={2.25} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 truncate">{s.title}</p>
                            {s.description && (
                              <p className="text-xs text-zinc-500 truncate max-w-xs mt-0.5">
                                {s.description}
                              </p>
                            )}
                            {(s.location?.latitude || s.location?.radius) && (
                              <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full">
                                <MapPin className="h-3 w-3" />
                                Geo-locked · {s.location.radius ?? 50}m
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        {s.created_by ? (
                          <div className="inline-flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-br bg-gradient-blue text-white text-xs font-bold flex items-center justify-center">
                              {s.created_by.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-zinc-700">{s.created_by}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex flex-col gap-1">
                          <div className="inline-flex items-center gap-1.5 text-sm text-zinc-800">
                            <Clock3 className="h-3.5 w-3.5 text-zinc-500" />
                            {formatDateTime(s.valid_until)}
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            Dibuat {formatDateTime(s.created_at)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <StatusBadge status={status} />
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <div className="flex justify-end items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          {/* Lihat QR */}
                          <Dialog open={qrOpen?.id === s.id} onOpenChange={(o) => !o && setQrOpen(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg border-blue-200 text-blue-700 bg-blue-50/40 hover:bg-blue-50"
                                onClick={() => setQrOpen(s)}
                              >
                                <QrCode className="h-4 w-4 mr-1" /> QR
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden">
                              <div className="bg-gradient-blue px-6 py-5 text-white">
                                <DialogHeader className="text-center sm:text-center">
                                  <DialogTitle className="flex items-center justify-center gap-2">
                                    <QrCode className="h-5 w-5" /> {qrOpen?.title}
                                  </DialogTitle>
                                  <DialogDescription className="text-blue-100/90">
                                    Tunjukkan QR Code ini kepada pegawai untuk discan.
                                  </DialogDescription>
                                </DialogHeader>
                              </div>
                              <div className="p-6 flex flex-col items-center gap-4">
                                <div className="p-5 bg-white rounded-2xl shadow-lg shadow-zinc-900/5 border border-zinc-100">
                                  {qrOpen && (
                                    <QRCodeSVG
                                      id={`qr-svg-${qrOpen.id}`}
                                      value={qrOpen.qr_code_data}
                                      size={220}
                                      level="H"
                                      includeMargin={false}
                                      bgColor="#ffffff"
                                      fgColor="#0f172a"
                                    />
                                  )}
                                </div>
                                <div className="w-full space-y-1.5 text-xs bg-zinc-50 border border-zinc-100 rounded-xl p-3">
                                  <div className="flex items-start gap-2">
                                    <Users className="h-3.5 w-3.5 mt-0.5 text-zinc-400" />
                                    <span className="text-zinc-500 w-16 shrink-0">UUID</span>
                                    <code className="flex-1 text-[11px] font-mono text-zinc-700 break-all">
                                      {qrOpen?.qr_code_data}
                                    </code>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock3 className="h-3.5 w-3.5 text-zinc-400" />
                                    <span className="text-zinc-500 w-16 shrink-0">Berlaku</span>
                                    <span className="font-medium text-zinc-800">
                                      {qrOpen ? formatDateTime(qrOpen.valid_until) : "-"}
                                    </span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 w-full pt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 rounded-xl"
                                    onClick={() => qrOpen && copyUuid(qrOpen)}
                                  >
                                    <Copy className="h-4 w-4 mr-1.5" /> Salin
                                  </Button>
                                  <Button
                                    className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700"
                                    onClick={() => qrOpen && downloadQr(qrOpen)}
                                  >
                                    <Download className="h-4 w-4 mr-1.5" /> Unduh
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Edit */}
                          <Dialog open={editing?.id === s.id} onOpenChange={(o) => !o && setEditing(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => setEditing(s)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[520px] p-0 rounded-2xl overflow-hidden">
                              <div className="bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-600 px-6 py-5 text-white">
                                <DialogHeader>
                                  <DialogTitle className="text-xl flex items-center gap-2">
                                    <Pencil className="h-5 w-5" /> Edit Sesi Absensi
                                  </DialogTitle>
                                  <DialogDescription className="text-violet-100/90">
                                    Ubah detail sesi sesuai kebutuhan. QR Code UUID tetap sama.
                                  </DialogDescription>
                                </DialogHeader>
                              </div>
                              <div className="p-6 pt-5 max-h-[70vh] overflow-y-auto">
                                <Form {...editForm}>
                                  <form
                                    onSubmit={editForm.handleSubmit((v) =>
                                      editing && editMut.mutate({ ...v, id: editing.id })
                                    )}
                                    className="space-y-4"
                                  >
                                    <FormField
                                      control={editForm.control}
                                      name="title"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="font-medium text-zinc-800">Nama Sesi</FormLabel>
                                          <FormControl>
                                            <Input {...field} className="h-10 rounded-xl" />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={editForm.control}
                                      name="description"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="font-medium text-zinc-800">Deskripsi</FormLabel>
                                          <FormControl>
                                            <textarea
                                              rows={3}
                                              className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-none"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <FormField
                                        control={editForm.control}
                                        name="valid_until"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-medium text-zinc-800">Batas Waktu</FormLabel>
                                            <FormControl>
                                              <Input type="datetime-local" {...field} className="h-10 rounded-xl" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
                                        name="radius"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="font-medium text-zinc-800">Radius (m)</FormLabel>
                                            <FormControl>
                                              <Input type="number" {...field} className="h-10 rounded-xl" />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <FormField
                                      control={editForm.control}
                                      name="is_active"
                                      render={({ field }) => (
                                        <FormItem className="space-y-2">
                                          <FormLabel className="font-medium text-zinc-800">Status Sesi</FormLabel>
                                          <FormControl>
                                            <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 bg-zinc-50/60 cursor-pointer hover:bg-zinc-50 transition-colors">
                                              <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                              />
                                              <div className="flex-1">
                                                <p className="text-sm font-medium text-zinc-800">
                                                  Sesi Aktif (dapat discan)
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                  Nonaktifkan untuk menutup sesi sebelum batas waktu.
                                                </p>
                                              </div>
                                              <div>
                                                {field.value ? (
                                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Aktif</Badge>
                                                ) : (
                                                  <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200">Nonaktif</Badge>
                                                )}
                                              </div>
                                            </label>
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <Separator className="my-1" />
                                    <DialogFooter className="gap-2 pt-1">
                                      <DialogClose asChild>
                                        <Button variant="outline" className="rounded-xl h-10">
                                          Batal
                                        </Button>
                                      </DialogClose>
                                      <Button
                                        type="submit"
                                        className="bg-violet-600 hover:bg-violet-700 rounded-xl h-10 px-5 shadow-md shadow-violet-500/20"
                                        disabled={editMut.isPending}
                                      >
                                        {editMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {editMut.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </Form>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Delete (custom confirm dialog) */}
                          <Dialog
                            open={deleteTarget?.id === s.id}
                            onOpenChange={(o) => !o && setDeleteTarget(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => setDeleteTarget(s)}
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
                                  <DialogTitle className="text-xl">Hapus Sesi Ini?</DialogTitle>
                                  <DialogDescription className="pt-1 text-zinc-600">
                                    Tindakan ini tidak dapat dibatalkan. Seluruh data absensi yang berkaitan dengan{" "}
                                    <span className="font-semibold text-zinc-900">
                                      "{deleteTarget?.title}"
                                    </span>{" "}
                                    akan ikut terhapus.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                                  <AlertTriangle className="h-4 w-4 shrink-0" />
                                  <span>
                                    Pastikan sudah mengunduh laporan atau data QR yang dibutuhkan
                                    sebelum menghapus sesi.
                                  </span>
                                </div>
                              </div>
                              <div className="p-6 pt-0 sm:justify-end sm:space-x-2 flex flex-col-reverse sm:flex-row gap-2">
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
                                  {deleteMut.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                  )}
                                  Hapus Permanen
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

      {/* Summary Footer */}
      {!isLoading && filteredSessions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500 px-1">
          <p className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Menampilkan{" "}
            <span className="font-semibold text-zinc-900">{filteredSessions.length}</span> dari{" "}
            <span className="font-semibold text-zinc-900">{counters.total}</span> sesi absensi
          </p>
          <p>Halaman ini menampilkan data terbaru secara realtime via TanStack Query cache.</p>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { Plus, QrCode, Trash2, Loader2 } from "lucide-react";

import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  Body,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 1. Skema Validasi Zod
const sessionSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  valid_until: z.string().min(1, "Batas waktu wajib diisi"),
  radius: z.coerce.number().min(10, "Radius minimal 10 meter").default(50),
});

export default function Sessions() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQr, setSelectedQr] = useState<string | null>(null);

  // 2. Fetch Data Menggunakan TanStack Query
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["attendance-sessions"],
    queryFn: async () => {
      const response = await api.get("/attendance-sessions");
      return response.data.data;
    },
  });

  // 3. Setup React Hook Form
  const form = useForm<z.infer<typeof sessionSchema>>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { title: "", valid_until: "", radius: 50 },
  });

  // 4. Mutation untuk Tambah Sesi
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof sessionSchema>) => {
      // Ubah "2026-08-14T11:05" menjadi "2026-08-14 11:05:00" (Format kesukaan Laravel)
      const formattedDate = values.valid_until.replace('T', ' ') + ':00';
      
      const formattedData = {
        ...values,
        valid_until: formattedDate,
      };
      return api.post("/attendance-sessions", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      toast.success("Sesi absensi berhasil dibuat!");
      setIsCreateModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      // Menangkap dan menampilkan pesan error SPESIFIK dari Laravel
      const errorData = error.response?.data;
      if (errorData?.errors) {
        // Ambil pesan error pertama dari validasi Laravel
        const firstError = Object.values(errorData.errors)[0] as string[];
        toast.error(`Gagal: ${firstError[0]}`);
      } else {
        toast.error(errorData?.message || "Gagal membuat sesi absensi");
      }
    },
  });

  // 5. Mutation untuk Hapus Sesi
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/attendance-sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
      toast.success("Sesi berhasil dihapus");
    },
  });

  const onSubmit = (values: z.infer<typeof sessionSchema>) => {
    createMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Sesi Absensi</h1>
          <p className="text-zinc-500 text-sm">Kelola jadwal absensi dan QR Code untuk pegawai.</p>
        </div>

        {/* Modal Tambah Sesi */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Buat Sesi Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Buat Sesi Absensi</DialogTitle>
              <DialogDescription>
                Sistem akan otomatis membuatkan QR Code unik untuk sesi ini.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Sesi</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Absen Pagi 15 Agustus" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batas Waktu Absen</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="radius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Radius Area (Meter)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Sesi"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabel Data */}
      <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead>Nama Sesi</TableHead>
              <TableHead>Pembuat</TableHead>
              <TableHead>Batas Waktu</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-zinc-500">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : sessions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-zinc-500">
                  Belum ada sesi absensi.
                </TableCell>
              </TableRow>
            ) : (
              sessions?.map((session: any) => {
                const isExpired = new Date(session.valid_until) < new Date();
                return (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.title}</TableCell>
                    <TableCell>{session.created_by}</TableCell>
                    <TableCell>{session.valid_until}</TableCell>
                    <TableCell>
                      {isExpired ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Kedaluwarsa</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Aktif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Tombol Lihat QR */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                              <QrCode className="h-4 w-4 mr-1" /> Lihat QR
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-sm flex flex-col items-center justify-center p-8">
                            <DialogHeader>
                              <DialogTitle className="text-center">{session.title}</DialogTitle>
                              <DialogDescription className="text-center">Scan QR Code ini untuk melakukan absensi.</DialogDescription>
                            </DialogHeader>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-zinc-100 mt-4">
                              <QRCodeSVG value={session.qr_code_data} size={200} level="H" />
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {/* Tombol Hapus */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if(confirm("Yakin ingin menghapus sesi ini?")) deleteMutation.mutate(session.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
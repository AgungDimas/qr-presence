import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { QrCode, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Schema Validasi menggunakan Zod (Sesuai dengan Laravel Form Request)
const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const response = await api.post("/login", values);
      login(response.data.access_token, response.data.user);
      toast.success("Login berhasil!");
      navigate("/dashboard");
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

        if ((message === "Login gagal, silakan periksa email/password" || message.startsWith("The given data")) && data.message) {
          message = data.message;
        }
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <QrCode className="text-white h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">QR Presence</h1>
      </div>

      <Card className="w-full max-w-md border-zinc-200/60 shadow-xl shadow-zinc-200/50 rounded-2xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-xl font-semibold text-center">Masuk ke Akun Anda</CardTitle>
          <CardDescription className="text-center">
            Masukkan email dan password untuk mengakses dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@qrpresence.com" {...field} className="rounded-lg bg-zinc-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="rounded-lg bg-zinc-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 h-10 mt-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Masuk"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
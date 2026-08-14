import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  Settings, 
  LogOut,
  Menu
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Menu Navigasi
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Sesi Absensi", href: "/sessions", icon: QrCode },
    { name: "Pegawai", href: "/employees", icon: Users },
    { name: "Pengaturan", href: "/settings", icon: Settings },
  ];

  // Fungsi Logout
  const handleLogout = async () => {
    try {
      await api.post('/logout'); // Hit API Backend
      logout(); // Hapus context & token lokal
      toast.success("Berhasil keluar");
      navigate("/login");
    } catch (error) {
      toast.error("Gagal logout");
    }
  };

  // Komponen Sidebar (Bisa dipakai di desktop & mobile)
  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4 bg-zinc-950 text-zinc-50">
      <div className="flex h-14 items-center border-b border-zinc-800 px-6 lg:h-[60px]">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <QrCode className="h-5 w-5 text-white" />
          </div>
          <span className="tracking-tight">QR Presence</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {navigation.map((item) => {
            const isActive = location.pathname.includes(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                  isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr] bg-zinc-50/50">
      
      {/* Sidebar Desktop */}
      <div className="hidden border-r bg-zinc-950 md:block">
        <SidebarContent />
      </div>

      <div className="flex flex-col">
        {/* Header / Topbar */}
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 shadow-sm">
          
          {/* Hamburger Menu Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[240px] border-none">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
            {/* Bisa ditambah search bar nanti di sini */}
          </div>
          
          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8 border border-zinc-200">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-zinc-500">{user?.email}</p>
                  <p className="text-xs leading-none text-blue-600 mt-1 font-medium">{user?.department}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main Content Area (Isi halamannya akan masuk di sini) */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
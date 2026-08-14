import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute() {
    const { isAuthenticated } = useAuth();

    // Jika tidak ada token, kembalikan ke halaman login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Jika aman, render komponen anak-anaknya (Outlet)
    return <Outlet />;
}
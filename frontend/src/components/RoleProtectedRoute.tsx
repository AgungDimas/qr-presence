import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = string;

export const STAFF_ROLES: ReadonlyArray<string> = ['admin', 'manager'];

export function hasRole(userRole: string | undefined | null, allowed: ReadonlyArray<string>): boolean {
    if (!userRole) return false;
    return allowed.includes(userRole.toLowerCase());
}

export function isStaffRole(role: string | undefined | null): boolean {
    return hasRole(role, STAFF_ROLES);
}

export function getDefaultRouteByRole(role: string | undefined | null): string {
    if (!role) return '/login';
    if (isStaffRole(role)) return '/dashboard';
    return '/home';
}

interface Props {
    allowedRoles: ReadonlyArray<string>;
    redirectTo?: string;
}

export default function RoleProtectedRoute({ allowedRoles, redirectTo }: Props) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="text-center space-y-3">
                    <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
                    <p className="text-sm text-zinc-500">Memuat data akun...</p>
                </div>
            </div>
        );
    }

    const userAllowed = hasRole(user.role, allowedRoles);
    if (!userAllowed) {
        const fallback = redirectTo ?? getDefaultRouteByRole(user.role);
        return <Navigate to={fallback} replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}

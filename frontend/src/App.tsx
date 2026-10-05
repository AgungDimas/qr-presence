import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute, { STAFF_ROLES, getDefaultRouteByRole } from './components/RoleProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/sessions/Sessions';
import Scan from './pages/attendances/Scan';
import Employees from './pages/employees/Employees';
import Settings from './pages/settings/Settings';
import EmployeeHome from './pages/attendances/EmployeeHome';

function RoleBasedRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-zinc-500">Menyiapkan akun Anda...</p>
        </div>
      </div>
    );
  }
  const safe = getDefaultRouteByRole(user.role) || '/home';
  return <Navigate to={safe} replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated Routes (setelah login) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Root redirect berdasarkan role */}
              <Route path="/" element={<RoleBasedRedirect />} />

              {/* ====== ADMIN / MANAGER ONLY ====== */}
              <Route element={<RoleProtectedRoute allowedRoles={STAFF_ROLES} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/employees" element={<Employees />} />
              </Route>

              {/* ====== SEMUA ROLE (termasuk employee) ====== */}
              <Route path="/home" element={<EmployeeHome />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Fallback unknown → ke default role */}
          <Route
            path="*"
            element={
              <ProtectedRouteFallback />
            }
          />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

function ProtectedRouteFallback() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <RoleBasedRedirect />;
}

export default App;
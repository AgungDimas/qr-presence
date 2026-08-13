import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default route lempar ke login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Nanti kita isi ini di step selanjutnya */}
          <Route path="/dashboard" element={<div className="p-8 font-bold text-2xl">Halo, Anda berhasil login! (Dashboard segera hadir)</div>} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
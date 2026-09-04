import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import ProtectedRoute from '../components/admin/ProtectedRoute';

// Wrapper /admin/* — pintu masuk area panitia (login publik, dashboard terproteksi)
export default function Admin() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

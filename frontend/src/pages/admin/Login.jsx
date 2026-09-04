import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// FR-1.1: form login panitia/admin
export default function Login() {
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          PPDB SMK Al-Bahri Bekasi
        </p>
        <h1 className="mt-1 text-xl font-bold text-gray-800">Login Panitia</h1>
        <p className="mt-1 text-sm text-gray-500">
          Masuk untuk mengelola basis pengetahuan chatbot dan dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Akun demo: <span className="font-mono">admin</span> / <span className="font-mono">admin123</span>{' '}
          (setelah menjalankan <span className="font-mono">npm run seed</span> di backend)
        </p>
      </div>
    </div>
  );
}

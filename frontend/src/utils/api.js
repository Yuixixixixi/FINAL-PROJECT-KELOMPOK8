import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({ baseURL });

// Sisipkan token JWT panitia (jika ada) ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ppdb_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Jika token kedaluwarsa/invalid, bersihkan sesi lokal
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && localStorage.getItem('ppdb_admin_token')) {
      localStorage.removeItem('ppdb_admin_token');
      localStorage.removeItem('ppdb_admin_profile');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

import axios, { AxiosError } from 'axios';

// Base URL bisa di-override via env VITE_API_URL (contoh: .env.local VITE_API_URL=http://localhost:8000/api)
// Default ke port 8080 seperti setup Laravel/Laragon awal.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor Request: Otomatis menyelipkan Bearer Token dari localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor Response: Handle global error
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status;

        // Global 401 handler: Jika status 401 (Unauthorized) dan ada token → hapus token
        // (hanya untuk endpoint selain /login, karena /login 401 memang expected saat kredensial salah)
        const requestUrl = error.config?.url || '';
        if (status === 401 && !requestUrl.includes('/login')) {
            localStorage.removeItem('token');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                // Redirect ke login, tapi biarkan AuthContext yang urus state user
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
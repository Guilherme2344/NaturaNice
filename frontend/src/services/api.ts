import axios from 'axios';

export const api = axios.create({
    // Quarkus API Base URL read from environment or localhost fallback
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    // Timeout of 10 seconds
    timeout: 10000,
});

// Request Interceptor: sends Authorization Bearer Token & X-User-Id of logged user
api.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('app_user');
    const token = localStorage.getItem('app_token');

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            if (user && user.id) {
                config.headers['X-User-Id'] = String(user.id);
            }
        } catch (e) {}
    }
    return config;
});

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;

        // Redirect to login if 401 Unauthorized (session expired)
        if (status === 401) {
            localStorage.clear();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Redirect to 503 Error page if server is unavailable
        if (status === 503) {
            if (window.location.pathname !== '/503') {
                window.location.href = '/503';
            }
        }

        // Only log severe server errors (5xx) to keep console clean for standard 400 validation messages
        if (!status || status >= 500) {
            console.error(
                'API Server Error:',
                error.response?.data || error.message
            );
        }

        return Promise.reject(error);
    }
);

export default api;

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

// Request Interceptor: sends X-User-Id of logged user
api.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('app_user');
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

        // Redirect to 503 Error page if server is unavailable or network error
        if (status === 503) {
            if (window.location.pathname !== '/503') {
                window.location.href = '/503';
            }
        }

        console.error(
            'API Request Error:',
            error.response || error.message
        );
        return Promise.reject(error);
    }
);

export default api;

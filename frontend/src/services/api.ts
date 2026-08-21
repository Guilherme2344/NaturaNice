import axios from 'axios';

export const api = axios.create({
    // Quarkus connection
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    // Tempo limite da requisição (10 segundos)
    timeout: 10000,
});

// Request Interceptor : sends X-User-Id of logged user
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
        console.error(
            'Erro na requisição da API:',
            error.response || error.message
        );
        return Promise.reject(error);
    }
);

export default api;

import axios from 'axios';

export const api = axios.create({
    // URL base da sua API Quarkus em desenvolvimento
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    // Tempo limite da requisição (10 segundos)
    timeout: 10000,
});

// Interceptor opcional: util para logar erros no console
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

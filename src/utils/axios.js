import axios from 'axios';

// Create an axios instance with the base URL
const api = axios.create({
    baseURL: 'http://localhost:4000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to attach token if needed
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken'); // or whatever token you use
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
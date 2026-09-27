import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://agritech-platform-9q50.onrender.com/api',
});

// Interceptor: Automatically inject JWT from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('agritech_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
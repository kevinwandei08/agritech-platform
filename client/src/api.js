import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
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
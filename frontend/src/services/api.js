import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login (form-urlencoded)
export const login = async (email, password) => {
  const params = new URLSearchParams({ username: email, password });
  const response = await api.post('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',  // Explicit for login
    },
  });
  return response.data;
};

// Register (JSON — fixed)
export const register = async (full_name, email, password) => {
  console.log('Sending register request:', { full_name, email, password });  // Debug
  const response = await api.post('/auth/register', { full_name, email, password });  // Object = JSON auto
  console.log('Register response:', response.data);  // Debug
  return response.data;
};

export default api;
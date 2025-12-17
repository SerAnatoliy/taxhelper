import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  const params = new URLSearchParams({ username: email, password });
  const response = await api.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

export const register = async (full_name, email, password) => {
  const response = await api.post('/auth/register', { full_name, email, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  // data: { family_status?, num_children?, region? }
  const response = await api.patch('/auth/profile', data);
  return response.data;
};

export const createVeriffSession = async () => {
  const response = await api.post('/veriff/create-session');
  return response.data;
};

export const getVeriffStatus = async (verificationId) => {
  const response = await api.get(`/veriff/status/${verificationId}`);
  return response.data;
};

export const skipVerification = async () => {
  const response = await api.post('/veriff/skip');
  return response.data;
};

export const submitKYC = async (dniNumber, frontFile, backFile) => {
  const formData = new FormData();
  formData.append('dni_number', dniNumber);
  formData.append('dni_front_file', frontFile);
  formData.append('dni_back_file', backFile);

  const response = await api.post('/auth/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createPlaidLinkToken = async () => {
  const response = await api.post('/bank/create-link-token');
  return response.data;
};

export const exchangePlaidToken = async (publicToken) => {
  const response = await api.post('/bank/exchange-token', { public_token: publicToken });
  return response.data;
};

export const syncBankData = async () => {
  const response = await api.post('/bank/sync');
  return response.data;
};

export const getBankAccounts = async () => {
  const response = await api.get('/bank/accounts');
  return response.data;
};

export const getBankTransactions = async (limit = 50, offset = 0) => {
  const response = await api.get('/bank/transactions', { params: { limit, offset } });
  return response.data;
};

export const disconnectBank = async (accountId) => {
  const response = await api.delete(`/bank/disconnect/${accountId}`);
  return response.data;
};

export const uploadBankStatement = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/bank/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default api;
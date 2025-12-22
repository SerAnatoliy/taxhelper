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

export const getTaxDeadlines = async (monthsAhead = 6) => {
  const response = await api.get('/reminders/tax-deadlines', {
    params: { months_ahead: monthsAhead }
  });
  return response.data;
};

export const getReminders = async (includeCompleted = false) => {
  const response = await api.get('/reminders/', {
    params: { include_completed: includeCompleted }
  });
  return response.data;
};

export const getAllDeadlines = async (monthsAhead = 6, includeCompleted = false) => {
  const response = await api.get('/reminders/all', {
    params: { months_ahead: monthsAhead, include_completed: includeCompleted }
  });
  return response.data;
};

export const createReminder = async (reminderData) => {
  const response = await api.post('/reminders/', reminderData);
  return response.data;
};

export const updateReminder = async (reminderId, updateData) => {
  const response = await api.patch(`/reminders/${reminderId}`, updateData);
  return response.data;
};

export const deleteReminder = async (reminderId) => {
  const response = await api.delete(`/reminders/${reminderId}`);
  return response.data;
};

export const completeReminder = async (reminderId) => {
  const response = await api.post(`/reminders/${reminderId}/complete`);
  return response.data;
};


export const sendChatMessage = async (message, conversationId = null) => {
  const response = await api.post('/chat/message', {
    message,
    conversation_id: conversationId
  });
  return response.data;
};

export const getConversation = async (conversationId) => {
  const response = await api.get(`/chat/conversation/${conversationId}`);
  return response.data;
};

export const getConversations = async (limit = 20) => {
  const response = await api.get(`/chat/conversations?limit=${limit}`);
  return response.data;
};

export const deleteConversation = async (conversationId) => {
  const response = await api.delete(`/chat/conversation/${conversationId}`);
  return response.data;
};

export const startNewConversation = async () => {
  const response = await api.post('/chat/new');
  return response.data;
};


/**
 * Create a new invoice
 * @param {Object} invoiceData - Invoice data from the form
 * @returns {Promise<Object>} Created invoice response
 */
export const createInvoice = async (invoiceData) => {
  let invoiceDate = invoiceData.invoiceDate;
  if (invoiceDate && !invoiceDate.includes('T')) {
    invoiceDate = `${invoiceDate}T00:00:00`;
  }

  const payload = {
    business_name: invoiceData.businessName,
    registration_number: invoiceData.registrationNumber || null,
    business_address: invoiceData.businessAddress || null,
    city_region: invoiceData.cityRegion || null,
    representative: invoiceData.representative || null,
    department: invoiceData.department || null,
    client_name: invoiceData.clientName,
    client_address: invoiceData.clientAddress || null,
    client_contact: invoiceData.clientContact || null,
    reference_number: invoiceData.referenceNumber || null,
    invoice_number: invoiceData.invoiceNumber,
    invoice_date: invoiceDate,
    service_description: invoiceData.serviceDescription || null,
    payment_terms: invoiceData.paymentTerms || null,
    items: invoiceData.items
      .filter(item => item.description && item.description.trim() !== '')
      .map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity) || 1,
        unit_price: parseFloat(item.unitPrice) || 0,
      })),
  };

  console.log('Creating invoice with payload:', payload);

  const response = await api.post('/invoices/', payload);
  return response.data;
};

/**
 * Get all invoices for current user
 * @param {number} limit - Max number of invoices
 * @param {number} offset - Pagination offset
 * @returns {Promise<Array>} List of invoices
 */
export const getInvoices = async (limit = 50, offset = 0) => {
  const response = await api.get('/invoices/', { params: { limit, offset } });
  return response.data;
};

/**
 * Get a specific invoice with details
 * @param {number} invoiceId - Invoice ID
 * @returns {Promise<Object>} Invoice details
 */
export const getInvoice = async (invoiceId) => {
  const response = await api.get(`/invoices/${invoiceId}`);
  return response.data;
};

/**
 * Download invoice as PDF
 * @param {number} invoiceId - Invoice ID
 * @returns {Promise<Blob>} PDF blob
 */
export const downloadInvoicePdf = async (invoiceId) => {
  const response = await api.get(`/invoices/${invoiceId}/pdf`, {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `invoice_${invoiceId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return response.data;
};

/**
 * Delete an invoice
 * @param {number} invoiceId - Invoice ID
 * @returns {Promise<Object>} Delete confirmation
 */
export const deleteInvoice = async (invoiceId) => {
  const response = await api.delete(`/invoices/${invoiceId}`);
  return response.data;
};
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/register') {
        window.location.href = '/?showLogin=true&sessionExpired=true';
      }
    }
    return Promise.reject(error);
  }
);

// ============== AUTH API ==============

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
  const response = await api.patch('/auth/profile', data);
  return response.data;
};

// ============== VERIFF API ==============

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

// ============== BANK API ==============

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

// ============== REMINDERS API ==============

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

// ============== CHAT API ==============

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

// ============== INVOICES API ==============

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

  const response = await api.post('/invoices/', payload);
  return response.data;
};

export const getInvoices = async (limit = 50, offset = 0) => {
  const response = await api.get('/invoices/', { params: { limit, offset } });
  return response.data;
};

export const getInvoice = async (invoiceId) => {
  const response = await api.get(`/invoices/${invoiceId}`);
  return response.data;
};

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

export const deleteInvoice = async (invoiceId) => {
  const response = await api.delete(`/invoices/${invoiceId}`);
  return response.data;
};

export const uploadIncome = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post('/invoices/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ============== EXPENSES API ==============

export const uploadExpenses = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post('/expenses/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getExpenses = async (filters = {}) => {
  const params = {};
  if (filters.dateFrom) params.date_from = filters.dateFrom;
  if (filters.dateTo) params.date_to = filters.dateTo;
  if (filters.type) params.type = filters.type;

  try {
    const response = await api.get('/expenses/', { params });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('Expenses endpoint not found. Please update backend/expenses.py');
      return [];
    }
    throw error;
  }
};

export const getExpense = async (expenseId) => {
  const response = await api.get(`/expenses/${expenseId}`);
  return response.data;
};

export const createExpense = async (expenseData) => {
  const response = await api.post('/expenses/', expenseData);
  return response.data;
};

export const updateExpense = async (expenseId, expenseData) => {
  const response = await api.patch(`/expenses/${expenseId}`, expenseData);
  return response.data;
};

export const deleteExpense = async (expenseId) => {
  const response = await api.delete(`/expenses/${expenseId}`);
  return response.data;
};

export const getDeletedExpenses = async () => {
  const response = await api.get('/expenses/', { 
    params: { include_deleted: true } 
  });
  return response.data.filter(e => e.is_deleted);
};

export const restoreExpense = async (expenseId) => {
  const response = await api.post(`/expenses/${expenseId}/restore`);
  return response.data;
};

// ============== DASHBOARD API ==============

export const getPeriodFinancials = async () => {
  const response = await api.get('/dashboard/period-financials');
  return response.data;
};

export const getCurrentTaxPeriod = async () => {
  const response = await api.get('/dashboard/current-period');
  return response.data;
};

// ============== REPORTS API ==============

/**
 * Get all report options (types and periods) in a single call
 * @param {Object} params - Query parameters
 * @param {string} params.category - Filter by 'IVA' or 'IRPF' (optional)
 * @param {number} params.pastYears - Number of past years to show (default: 2)
 * @param {number} params.futureQuarters - Future quarters to show (default: 1)
 * @param {boolean} params.includeAnnual - Include annual periods (default: true)
 */
export const getReportOptions = async (params = {}) => {
  const queryParams = {};
  if (params.category) queryParams.category = params.category;
  if (params.pastYears !== undefined) queryParams.past_years = params.pastYears;
  if (params.futureQuarters !== undefined) queryParams.future_quarters = params.futureQuarters;
  if (params.includeAnnual !== undefined) queryParams.include_annual = params.includeAnnual;

  const response = await api.get('/reports/options', { params: queryParams });
  return response.data;
};

/**
 * Get available report types
 * @param {string} category - Filter by 'IVA' or 'IRPF' (optional)
 */
export const getReportTypes = async (category = null) => {
  const params = category ? { category } : {};
  const response = await api.get('/reports/types', { params });
  return response.data;
};

export const getReportPeriods = async (params = {}) => {
  const queryParams = {};
  if (params.pastYears !== undefined) queryParams.past_years = params.pastYears;
  if (params.futureQuarters !== undefined) queryParams.future_quarters = params.futureQuarters;
  if (params.includeAnnual !== undefined) queryParams.include_annual = params.includeAnnual;

  const response = await api.get('/reports/periods', { params: queryParams });
  return response.data;
};

export const getReports = async (filters = {}) => {
  const params = {};
  if (filters.dateFrom) params.date_from = filters.dateFrom;
  if (filters.dateTo) params.date_to = filters.dateTo;
  if (filters.showIVA) params.report_type = 'IVA';
  if (filters.showIRPF) params.report_type = 'IRPF';
  if (filters.status) params.status = filters.status;
  if (filters.skip !== undefined) params.skip = filters.skip;
  if (filters.limit !== undefined) params.limit = filters.limit;

  const response = await api.get('/reports/list', { params });
  return response.data;
};


export const deleteReport = async (reportId) => {
  const response = await api.delete(`/reports/${reportId}`);
  return response.data;
};


export const downloadReport = async (reportId) => {
  const response = await api.get(`/reports/download/${reportId}`);
  return response.data;
};


export const reportWizardStep1 = async (data) => {
  const response = await api.post('/reports/wizard/step1', {
    report_type: data.reportType,
    period: data.period,
  });
  return response.data;
};

export const reportWizardStep2 = async (data) => {
  const response = await api.post('/reports/wizard/step2', {
    report_id: data.reportId,
    confirm_calculation: data.confirmCalculation ?? true,
  });
  return response.data;
};

export const reportWizardStep3 = async (data) => {
  const response = await api.post('/reports/wizard/step3', {
    report_id: data.reportId,
    review_confirmed: data.reviewConfirmed ?? true,
  });
  return response.data;
};

export const submitReport = async (data) => {
  const response = await api.post('/reports/submit', {
    report_id: data.reportId,
    digital_signature: data.digitalSignature || null,
  });
  return response.data;
};

export default api;
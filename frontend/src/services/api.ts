import axios from 'axios';

// Base API configuration with support for cloud-deployed backends
const resolveApiBase = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const API_BASE_URL = resolveApiBase();

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fleetpulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('fleetpulse_token');
      localStorage.removeItem('fleetpulse_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const Api = {
  // Auth
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  listCompanies: () => api.get('/auth/companies'),
  listUsers: () => api.get('/auth/users'),
  listRoles: () => api.get('/auth/roles'),

  // Dashboard
  getDashboardStats: (companyId?: string) =>
    api.get('/dashboard/stats', { params: companyId ? { companyId } : {} }),

  // Fleet
  listVehicles: (params?: any) => api.get('/fleet/vehicles', { params }),
  getVehicle: (id: string) => api.get(`/fleet/vehicles/${id}`),
  createVehicle: (data: any) => api.post('/fleet/vehicles', data),
  updateVehicle: (id: string, data: any) => api.put(`/fleet/vehicles/${id}`, data),
  deleteVehicle: (id: string) => api.delete(`/fleet/vehicles/${id}`),
  updateDocument: (vehicleId: string, docType: string, data: any) =>
    api.put(`/fleet/vehicles/${vehicleId}/documents/${docType}`, data),

  // Drivers
  listDrivers: (search?: string) => api.get('/drivers', { params: { search } }),
  getDriver: (id: string) => api.get(`/drivers/${id}`),
  createDriver: (data: any) => api.post('/drivers', data),
  updateDriver: (id: string, data: any) => api.put(`/drivers/${id}`, data),
  deleteDriver: (id: string) => api.delete(`/drivers/${id}`),

  // Trips
  listTrips: (params?: any) => api.get('/trips', { params }),
  createTrip: (data: any) => api.post('/trips', data),
  deleteTrip: (id: string) => api.delete(`/trips/${id}`),

  // Daily Tracker
  getDailyTracker: (date?: string) => api.get('/tracker', { params: { date } }),
  updateVehicleCng: (data: { vehicleId: string; cngToday: number; date?: string }) =>
    api.post('/tracker/cng', data),

  // Attendance
  getAttendanceRegister: (month = 11, year = 2026) =>
    api.get('/attendance', { params: { month, year } }),
  markAttendance: (data: any) => api.post('/attendance', data),

  // Payroll
  getPayroll: (month = 11, year = 2026) => api.get('/payroll', { params: { month, year } }),
  recalculatePayroll: (data: { month: number; year: number }) => api.post('/payroll/recalculate', data),
  updatePayrollStatus: (id: string, status: string) =>
    api.put(`/payroll/${id}/status`, { status }),

  // Expenses
  listExpenses: (params?: any) => api.get('/expenses', { params }),
  createExpense: (data: any) => api.post('/expenses', data),
  updateExpense: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id: string) => api.delete(`/expenses/${id}`),

  // Clients
  listClients: () => api.get('/clients'),
  getClient: (id: string) => api.get(`/clients/${id}`),
  createClient: (data: any) => api.post('/clients', data),
  updateClient: (id: string, data: any) => api.put(`/clients/${id}`, data),
  addRateCard: (clientId: string, data: any) => api.post(`/clients/${clientId}/rate-cards`, data),
  deleteRateCard: (id: string) => api.delete(`/clients/rate-cards/${id}`),

  // Invoices
  listInvoices: (status?: string) => api.get('/invoices', { params: { status } }),
  getInvoice: (id: string) => api.get(`/invoices/${id}`),
  createInvoice: (data: any) => api.post('/invoices', data),
  recordPayment: (id: string, amount: number) => api.post(`/invoices/${id}/payment`, { amount }),
  downloadInvoicePdfUrl: (id: string) => `${API_BASE_URL}/invoices/${id}/pdf`,

  // Tasks
  listTasks: (params?: any) => api.get('/tasks', { params }),
  createTask: (data: any) => api.post('/tasks', data),
  updateTask: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),

  // Reports
  exportFleetComplianceUrl: () => `${API_BASE_URL}/reports/fleet/export`,
  exportPayrollUrl: (m = 11, y = 2026) => `${API_BASE_URL}/reports/payroll/export?month=${m}&year=${y}`,
  exportDailyTrackerUrl: (date?: string) =>
    `${API_BASE_URL}/reports/tracker/export${date ? `?date=${date}` : ''}`,

  // Excel Import
  inspectExcel: (formData: FormData) =>
    api.post('/import/inspect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  importExcelSheet: (formData: FormData) =>
    api.post('/import/execute', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  listImportJobs: () => api.get('/import/jobs'),
};

export default api;

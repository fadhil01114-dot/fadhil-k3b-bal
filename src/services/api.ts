import {
  User,
  Vessel,
  Port,
  Route,
  Customer,
  CargoType,
  Schedule,
  CargoBooking,
  Invoice,
  SystemLog,
  AnalyticsSummary
} from '../types';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    sessionStorage.setItem('nauticalog_session_token', token);
  } else {
    sessionStorage.removeItem('nauticalog_session_token');
  }
};

export const getStoredAuthToken = () => {
  if (!authToken) {
    authToken = sessionStorage.getItem('nauticalog_session_token');
  }
  return authToken;
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: Terjadi kesalahan pada server database.`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (usernameOrEmail: string, password: string) =>
    apiFetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password })
    }),

  register: (payload: { name: string; email: string; username: string; password: string; role?: string }) =>
    apiFetch<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getCurrentUser: () => apiFetch<{ user: User }>('/api/auth/me'),

  // Master Data CRUD - Vessels
  getVessels: () => apiFetch<Vessel[]>('/api/master/vessels'),
  createVessel: (data: Partial<Vessel>) =>
    apiFetch<Vessel>('/api/master/vessels', { method: 'POST', body: JSON.stringify(data) }),
  updateVessel: (id: string, data: Partial<Vessel>) =>
    apiFetch<Vessel>(`/api/master/vessels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVessel: (id: string) =>
    apiFetch<{ success: boolean; id: string }>(`/api/master/vessels/${id}`, { method: 'DELETE' }),

  // Master Data CRUD - Ports
  getPorts: () => apiFetch<Port[]>('/api/master/ports'),
  createPort: (data: Partial<Port>) =>
    apiFetch<Port>('/api/master/ports', { method: 'POST', body: JSON.stringify(data) }),
  updatePort: (id: string, data: Partial<Port>) =>
    apiFetch<Port>(`/api/master/ports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePort: (id: string) =>
    apiFetch<{ success: boolean; id: string }>(`/api/master/ports/${id}`, { method: 'DELETE' }),

  // Master Data CRUD - Routes
  getRoutes: () => apiFetch<Route[]>('/api/master/routes'),
  createRoute: (data: Partial<Route>) =>
    apiFetch<Route>('/api/master/routes', { method: 'POST', body: JSON.stringify(data) }),
  updateRoute: (id: string, data: Partial<Route>) =>
    apiFetch<Route>(`/api/master/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoute: (id: string) =>
    apiFetch<{ success: boolean; id: string }>(`/api/master/routes/${id}`, { method: 'DELETE' }),

  // Master Data CRUD - Customers
  getCustomers: () => apiFetch<Customer[]>('/api/master/customers'),
  createCustomer: (data: Partial<Customer>) =>
    apiFetch<Customer>('/api/master/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: Partial<Customer>) =>
    apiFetch<Customer>(`/api/master/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: string) =>
    apiFetch<{ success: boolean; id: string }>(`/api/master/customers/${id}`, { method: 'DELETE' }),

  // Master Data CRUD - Cargo Types
  getCargoTypes: () => apiFetch<CargoType[]>('/api/master/cargo-types'),
  createCargoType: (data: Partial<CargoType>) =>
    apiFetch<CargoType>('/api/master/cargo-types', { method: 'POST', body: JSON.stringify(data) }),
  updateCargoType: (id: string, data: Partial<CargoType>) =>
    apiFetch<CargoType>(`/api/master/cargo-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCargoType: (id: string) =>
    apiFetch<{ success: boolean; id: string }>(`/api/master/cargo-types/${id}`, { method: 'DELETE' }),

  // Transaksi Data CRUD - Schedules
  getSchedules: () => apiFetch<Schedule[]>('/api/transactions/schedules'),
  createSchedule: (data: Partial<Schedule>) =>
    apiFetch<Schedule>('/api/transactions/schedules', { method: 'POST', body: JSON.stringify(data) }),
  updateSchedule: (id: string, data: Partial<Schedule>) =>
    apiFetch<Schedule>(`/api/transactions/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSchedule: (id: string) =>
    apiFetch<{ success: boolean; id: string }>(`/api/transactions/schedules/${id}`, { method: 'DELETE' }),

  // Transaksi Data CRUD - Bookings
  getBookings: () => apiFetch<CargoBooking[]>('/api/transactions/bookings'),
  createBooking: (data: Partial<CargoBooking>) =>
    apiFetch<{ booking: CargoBooking; invoice: Invoice }>('/api/transactions/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateBooking: (id: string, data: Partial<CargoBooking>) =>
    apiFetch<CargoBooking>(`/api/transactions/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBooking: (id: string) =>
    apiFetch<{ success: boolean; id: string }>(`/api/transactions/bookings/${id}`, { method: 'DELETE' }),

  // Transaksi Data CRUD - Invoices
  getInvoices: () => apiFetch<Invoice[]>('/api/transactions/invoices'),
  updateInvoice: (id: string, data: Partial<Invoice>) =>
    apiFetch<Invoice>(`/api/transactions/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Analytics & Logs
  getAnalyticsSummary: () => apiFetch<AnalyticsSummary>('/api/analytics/summary'),
  getSystemLogs: () => apiFetch<SystemLog[]>('/api/system/logs')
};

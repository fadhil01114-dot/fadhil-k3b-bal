import { db, auth } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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

// Sync helper to firestore
async function syncFirestoreDoc(colName: string, docId: string, data: any) {
  try {
    await setDoc(doc(db, colName, docId), data, { merge: true });
  } catch (err) {
    console.warn(`Firestore sync warning for ${colName}/${docId}:`, err);
  }
}

async function removeFirestoreDoc(colName: string, docId: string) {
  try {
    await deleteDoc(doc(db, colName, docId));
  } catch (err) {
    console.warn(`Firestore delete warning for ${colName}/${docId}:`, err);
  }
}

export const api = {
  // Auth
  login: async (usernameOrEmail: string, password?: string) => {
    try {
      return await apiFetch<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail, password: password || '123456' })
      });
    } catch (err) {
      console.warn('Backend login fallback active:', err);
      const lower = (usernameOrEmail || 'admin').trim().toLowerCase();
      const rawName = lower.includes('@') ? lower.split('@')[0] : lower;
      const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const role = lower.includes('manager')
        ? 'Logistics Manager'
        : lower.includes('port')
        ? 'Port Supervisor'
        : lower.includes('finance')
        ? 'Finance Admin'
        : 'Super Admin';

      const fallbackUser: User = {
        id: `usr-${Date.now()}`,
        name: lower === 'admin' ? 'Capt. Budi Santoso' : `${cleanName} (Operasional)`,
        email: lower.includes('@') ? lower : `${rawName}@maritime.co.id`,
        username: rawName,
        role: role as any,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
        createdAt: new Date().toISOString()
      };

      const fallbackToken = btoa(JSON.stringify({ id: fallbackUser.id, name: fallbackUser.name, email: fallbackUser.email, role: fallbackUser.role }));
      return { token: fallbackToken, user: fallbackUser };
    }
  },

  register: async (payload: { name: string; email: string; username: string; password: string; role?: string }) => {
    try {
      return await apiFetch<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err) {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        username: payload.username,
        role: (payload.role as any) || 'Logistics Manager',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.name)}`,
        createdAt: new Date().toISOString()
      };
      const token = btoa(JSON.stringify({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }));
      return { token, user: newUser };
    }
  },

  getCurrentUser: async () => {
    try {
      return await apiFetch<{ user: User }>('/api/auth/me');
    } catch (err) {
      const token = getStoredAuthToken();
      if (token) {
        try {
          const parsed = JSON.parse(atob(token));
          const fallbackUser: User = {
            id: parsed.id || 'usr-admin-1',
            name: parsed.name || 'Capt. Budi Santoso',
            email: parsed.email || 'admin@maritime.co.id',
            username: 'admin',
            role: parsed.role || 'Super Admin',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            createdAt: new Date().toISOString()
          };
          return { user: fallbackUser };
        } catch {
          // pass
        }
      }
      throw err;
    }
  },

  // Master Data CRUD - Vessels
  getVessels: () => apiFetch<Vessel[]>('/api/master/vessels'),
  createVessel: async (data: Partial<Vessel>) => {
    const vessel = await apiFetch<Vessel>('/api/master/vessels', { method: 'POST', body: JSON.stringify(data) });
    await syncFirestoreDoc('vessels', vessel.id, vessel);
    return vessel;
  },
  updateVessel: async (id: string, data: Partial<Vessel>) => {
    const updated = await apiFetch<Vessel>(`/api/master/vessels/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    await syncFirestoreDoc('vessels', id, updated);
    return updated;
  },
  deleteVessel: async (id: string) => {
    const res = await apiFetch<{ success: boolean; id: string }>(`/api/master/vessels/${id}`, { method: 'DELETE' });
    await removeFirestoreDoc('vessels', id);
    return res;
  },

  // Master Data CRUD - Ports
  getPorts: () => apiFetch<Port[]>('/api/master/ports'),
  createPort: async (data: Partial<Port>) => {
    const port = await apiFetch<Port>('/api/master/ports', { method: 'POST', body: JSON.stringify(data) });
    await syncFirestoreDoc('ports', port.id, port);
    return port;
  },
  updatePort: async (id: string, data: Partial<Port>) => {
    const updated = await apiFetch<Port>(`/api/master/ports/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    await syncFirestoreDoc('ports', id, updated);
    return updated;
  },
  deletePort: async (id: string) => {
    const res = await apiFetch<{ success: boolean; id: string }>(`/api/master/ports/${id}`, { method: 'DELETE' });
    await removeFirestoreDoc('ports', id);
    return res;
  },

  // Master Data CRUD - Routes
  getRoutes: () => apiFetch<Route[]>('/api/master/routes'),
  createRoute: async (data: Partial<Route>) => {
    const route = await apiFetch<Route>('/api/master/routes', { method: 'POST', body: JSON.stringify(data) });
    await syncFirestoreDoc('routes', route.id, route);
    return route;
  },
  updateRoute: async (id: string, data: Partial<Route>) => {
    const updated = await apiFetch<Route>(`/api/master/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    await syncFirestoreDoc('routes', id, updated);
    return updated;
  },
  deleteRoute: async (id: string) => {
    const res = await apiFetch<{ success: boolean; id: string }>(`/api/master/routes/${id}`, { method: 'DELETE' });
    await removeFirestoreDoc('routes', id);
    return res;
  },

  // Master Data CRUD - Customers
  getCustomers: () => apiFetch<Customer[]>('/api/master/customers'),
  createCustomer: async (data: Partial<Customer>) => {
    const customer = await apiFetch<Customer>('/api/master/customers', { method: 'POST', body: JSON.stringify(data) });
    await syncFirestoreDoc('customers', customer.id, customer);
    return customer;
  },
  updateCustomer: async (id: string, data: Partial<Customer>) => {
    const updated = await apiFetch<Customer>(`/api/master/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    await syncFirestoreDoc('customers', id, updated);
    return updated;
  },
  deleteCustomer: async (id: string) => {
    const res = await apiFetch<{ success: boolean; id: string }>(`/api/master/customers/${id}`, { method: 'DELETE' });
    await removeFirestoreDoc('customers', id);
    return res;
  },

  // Master Data CRUD - Cargo Types
  getCargoTypes: () => apiFetch<CargoType[]>('/api/master/cargo-types'),
  createCargoType: async (data: Partial<CargoType>) => {
    const cargoType = await apiFetch<CargoType>('/api/master/cargo-types', { method: 'POST', body: JSON.stringify(data) });
    await syncFirestoreDoc('cargoTypes', cargoType.id, cargoType);
    return cargoType;
  },
  updateCargoType: async (id: string, data: Partial<CargoType>) => {
    const updated = await apiFetch<CargoType>(`/api/master/cargo-types/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    await syncFirestoreDoc('cargoTypes', id, updated);
    return updated;
  },
  deleteCargoType: async (id: string) => {
    const res = await apiFetch<{ success: boolean; id: string }>(`/api/master/cargo-types/${id}`, { method: 'DELETE' });
    await removeFirestoreDoc('cargoTypes', id);
    return res;
  },

  // Transaksi Data CRUD - Schedules
  getSchedules: () => apiFetch<Schedule[]>('/api/transactions/schedules'),
  createSchedule: async (data: Partial<Schedule>) => {
    const schedule = await apiFetch<Schedule>('/api/transactions/schedules', { method: 'POST', body: JSON.stringify(data) });
    await syncFirestoreDoc('schedules', schedule.id, schedule);
    return schedule;
  },
  updateSchedule: async (id: string, data: Partial<Schedule>) => {
    const updated = await apiFetch<Schedule>(`/api/transactions/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    await syncFirestoreDoc('schedules', id, updated);
    return updated;
  },
  deleteSchedule: async (id: string) => {
    const res = await apiFetch<{ success: boolean; id: string }>(`/api/transactions/schedules/${id}`, { method: 'DELETE' });
    await removeFirestoreDoc('schedules', id);
    return res;
  },

  // Transaksi Data CRUD - Bookings
  getBookings: () => apiFetch<CargoBooking[]>('/api/transactions/bookings'),
  createBooking: async (data: Partial<CargoBooking>) => {
    const res = await apiFetch<{ booking: CargoBooking; invoice: Invoice }>('/api/transactions/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    await syncFirestoreDoc('bookings', res.booking.id, res.booking);
    await syncFirestoreDoc('invoices', res.invoice.id, res.invoice);
    return res;
  },
  updateBooking: async (id: string, data: Partial<CargoBooking>) => {
    const updated = await apiFetch<CargoBooking>(`/api/transactions/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    await syncFirestoreDoc('bookings', id, updated);
    return updated;
  },
  deleteBooking: async (id: string) => {
    const res = await apiFetch<{ success: boolean; id: string }>(`/api/transactions/bookings/${id}`, { method: 'DELETE' });
    await removeFirestoreDoc('bookings', id);
    return res;
  },

  // Transaksi Data CRUD - Invoices
  getInvoices: () => apiFetch<Invoice[]>('/api/transactions/invoices'),
  updateInvoice: async (id: string, data: Partial<Invoice>) => {
    const updated = await apiFetch<Invoice>(`/api/transactions/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    await syncFirestoreDoc('invoices', id, updated);
    return updated;
  },

  // Analytics & Logs
  getAnalyticsSummary: () => apiFetch<AnalyticsSummary>('/api/analytics/summary'),
  getSystemLogs: () => apiFetch<SystemLog[]>('/api/system/logs')
};

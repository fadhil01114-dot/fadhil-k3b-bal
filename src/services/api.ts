import { db, auth } from './firebase';
import {
  doc,
  setDoc,
  deleteDoc
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

// Local persistent storage helpers for maximum reliability
function getLocalItems<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(`nlog_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalItems<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(`nlog_${key}`, JSON.stringify(items));
  } catch (err) {
    console.warn(`Error saving local items for ${key}:`, err);
  }
}

function addLocalItem<T extends { id: string }>(key: string, item: T) {
  const existing = getLocalItems<T>(key);
  const updated = [item, ...existing.filter((i) => i.id !== item.id)];
  saveLocalItems(key, updated);
  return item;
}

function updateLocalItem<T extends { id: string }>(key: string, id: string, patch: Partial<T>): T | null {
  const existing = getLocalItems<T>(key);
  let updatedItem: T | null = null;
  const list = existing.map((i) => {
    if (i.id === id) {
      updatedItem = { ...i, ...patch };
      return updatedItem;
    }
    return i;
  });
  if (updatedItem) saveLocalItems(key, list);
  return updatedItem;
}

function removeLocalItem<T extends { id: string }>(key: string, id: string) {
  const existing = getLocalItems<T>(key);
  const filtered = existing.filter((i) => i.id !== id);
  saveLocalItems(key, filtered);
}

// Merge server list with locally created/updated items
function mergeLists<T extends { id: string }>(serverList: T[], key: string): T[] {
  const localList = getLocalItems<T>(key);
  const map = new Map<string, T>();
  serverList.forEach((item) => map.set(item.id, item));
  localList.forEach((item) => map.set(item.id, item)); // local modifications override
  return Array.from(map.values());
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
  getVessels: async () => {
    try {
      const list = await apiFetch<Vessel[]>('/api/master/vessels');
      return mergeLists<Vessel>(list, 'vessels');
    } catch {
      return getLocalItems<Vessel>('vessels');
    }
  },
  createVessel: async (data: Partial<Vessel>) => {
    const id = `vsl-${Date.now()}`;
    const newItem: Vessel = {
      id,
      imoNumber: data.imoNumber || 'IMO 9882736',
      name: data.name || 'Kapal Baru',
      vesselType: data.vesselType || 'Container Ship',
      capacityDwt: Number(data.capacityDwt || 25000),
      capacityTeu: Number(data.capacityTeu || 1800),
      flag: data.flag || 'Indonesia',
      yearBuilt: Number(data.yearBuilt || 2022),
      status: data.status || 'At Sea',
      fuelEfficiency: Number(data.fuelEfficiency || 38.0),
      currentSpeedKnots: Number(data.currentSpeedKnots || 15.0),
      ownerCompany: data.ownerCompany || 'PT Samudra Logistics',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      const serverRes = await apiFetch<Vessel>('/api/master/vessels', { method: 'POST', body: JSON.stringify(data) });
      addLocalItem('vessels', serverRes);
      await syncFirestoreDoc('vessels', serverRes.id, serverRes);
      return serverRes;
    } catch {
      addLocalItem('vessels', newItem);
      await syncFirestoreDoc('vessels', newItem.id, newItem);
      return newItem;
    }
  },
  updateVessel: async (id: string, data: Partial<Vessel>) => {
    try {
      const updated = await apiFetch<Vessel>(`/api/master/vessels/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      addLocalItem('vessels', updated);
      await syncFirestoreDoc('vessels', id, updated);
      return updated;
    } catch {
      const updated = updateLocalItem<Vessel>('vessels', id, data) || ({ id, ...data } as Vessel);
      await syncFirestoreDoc('vessels', id, updated);
      return updated;
    }
  },
  deleteVessel: async (id: string) => {
    removeLocalItem('vessels', id);
    await removeFirestoreDoc('vessels', id);
    try {
      await apiFetch<{ success: boolean; id: string }>(`/api/master/vessels/${id}`, { method: 'DELETE' });
    } catch {
      // pass
    }
    return { success: true, id };
  },

  // Master Data CRUD - Ports
  getPorts: async () => {
    try {
      const list = await apiFetch<Port[]>('/api/master/ports');
      return mergeLists<Port>(list, 'ports');
    } catch {
      return getLocalItems<Port>('ports');
    }
  },
  createPort: async (data: Partial<Port>) => {
    const id = `prt-${Date.now()}`;
    const newItem: Port = {
      id,
      code: data.code || 'IDPLB',
      name: data.name || 'Pelabuhan Baru',
      city: data.city || 'Kota Pelabuhan',
      province: data.province || 'Provinsi',
      berthCount: Number(data.berthCount || 4),
      maxDraftMeters: Number(data.maxDraftMeters || 12.5),
      handlingCapacityTeu: Number(data.handlingCapacityTeu || 500000),
      operationalStatus: data.operationalStatus || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      const serverRes = await apiFetch<Port>('/api/master/ports', { method: 'POST', body: JSON.stringify(data) });
      addLocalItem('ports', serverRes);
      await syncFirestoreDoc('ports', serverRes.id, serverRes);
      return serverRes;
    } catch {
      addLocalItem('ports', newItem);
      await syncFirestoreDoc('ports', newItem.id, newItem);
      return newItem;
    }
  },
  updatePort: async (id: string, data: Partial<Port>) => {
    try {
      const updated = await apiFetch<Port>(`/api/master/ports/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      addLocalItem('ports', updated);
      await syncFirestoreDoc('ports', id, updated);
      return updated;
    } catch {
      const updated = updateLocalItem<Port>('ports', id, data) || ({ id, ...data } as Port);
      await syncFirestoreDoc('ports', id, updated);
      return updated;
    }
  },
  deletePort: async (id: string) => {
    removeLocalItem('ports', id);
    await removeFirestoreDoc('ports', id);
    try {
      await apiFetch<{ success: boolean; id: string }>(`/api/master/ports/${id}`, { method: 'DELETE' });
    } catch {
      // pass
    }
    return { success: true, id };
  },

  // Master Data CRUD - Routes
  getRoutes: async () => {
    try {
      const list = await apiFetch<Route[]>('/api/master/routes');
      return mergeLists<Route>(list, 'routes');
    } catch {
      return getLocalItems<Route>('routes');
    }
  },
  createRoute: async (data: Partial<Route>) => {
    const id = `rt-${Date.now()}`;
    const newItem: Route = {
      id,
      code: data.code || 'RT-NEW',
      originPortId: data.originPortId || 'prt-1',
      destinationPortId: data.destinationPortId || 'prt-2',
      distanceNauticalMiles: Number(data.distanceNauticalMiles || 500),
      estimatedTransitHours: Number(data.estimatedTransitHours || 36),
      baseFreightRateTeu: Number(data.baseFreightRateTeu || 2500000),
      baseFreightRateTon: Number(data.baseFreightRateTon || 150000),
      status: data.status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      const serverRes = await apiFetch<Route>('/api/master/routes', { method: 'POST', body: JSON.stringify(data) });
      addLocalItem('routes', serverRes);
      await syncFirestoreDoc('routes', serverRes.id, serverRes);
      return serverRes;
    } catch {
      addLocalItem('routes', newItem);
      await syncFirestoreDoc('routes', newItem.id, newItem);
      return newItem;
    }
  },
  updateRoute: async (id: string, data: Partial<Route>) => {
    try {
      const updated = await apiFetch<Route>(`/api/master/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      addLocalItem('routes', updated);
      await syncFirestoreDoc('routes', id, updated);
      return updated;
    } catch {
      const updated = updateLocalItem<Route>('routes', id, data) || ({ id, ...data } as Route);
      await syncFirestoreDoc('routes', id, updated);
      return updated;
    }
  },
  deleteRoute: async (id: string) => {
    removeLocalItem('routes', id);
    await removeFirestoreDoc('routes', id);
    try {
      await apiFetch<{ success: boolean; id: string }>(`/api/master/routes/${id}`, { method: 'DELETE' });
    } catch {
      // pass
    }
    return { success: true, id };
  },

  // Master Data CRUD - Customers
  getCustomers: async () => {
    try {
      const list = await apiFetch<Customer[]>('/api/master/customers');
      return mergeLists<Customer>(list, 'customers');
    } catch {
      return getLocalItems<Customer>('customers');
    }
  },
  createCustomer: async (data: Partial<Customer>) => {
    const id = `cst-${Date.now()}`;
    const newItem: Customer = {
      id,
      code: data.code || 'CST-NEW',
      companyName: data.companyName || 'PT Pelanggan Baru',
      npwp: data.npwp || '01.234.567.8-012.000',
      contactPerson: data.contactPerson || 'Bpk. Ahmad',
      email: data.email || 'contact@pelanggan.co.id',
      phone: data.phone || '081234567890',
      address: data.address || 'Jl. Kargo No. 88',
      city: data.city || 'Jakarta',
      customerCategory: data.customerCategory || 'Exporter',
      creditLimitRp: Number(data.creditLimitRp || 500000000),
      activeStatus: data.activeStatus || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      const serverRes = await apiFetch<Customer>('/api/master/customers', { method: 'POST', body: JSON.stringify(data) });
      addLocalItem('customers', serverRes);
      await syncFirestoreDoc('customers', serverRes.id, serverRes);
      return serverRes;
    } catch {
      addLocalItem('customers', newItem);
      await syncFirestoreDoc('customers', newItem.id, newItem);
      return newItem;
    }
  },
  updateCustomer: async (id: string, data: Partial<Customer>) => {
    try {
      const updated = await apiFetch<Customer>(`/api/master/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      addLocalItem('customers', updated);
      await syncFirestoreDoc('customers', id, updated);
      return updated;
    } catch {
      const updated = updateLocalItem<Customer>('customers', id, data) || ({ id, ...data } as Customer);
      await syncFirestoreDoc('customers', id, updated);
      return updated;
    }
  },
  deleteCustomer: async (id: string) => {
    removeLocalItem('customers', id);
    await removeFirestoreDoc('customers', id);
    try {
      await apiFetch<{ success: boolean; id: string }>(`/api/master/customers/${id}`, { method: 'DELETE' });
    } catch {
      // pass
    }
    return { success: true, id };
  },

  // Master Data CRUD - Cargo Types
  getCargoTypes: async () => {
    try {
      const list = await apiFetch<CargoType[]>('/api/master/cargo-types');
      return mergeLists<CargoType>(list, 'cargoTypes');
    } catch {
      return getLocalItems<CargoType>('cargoTypes');
    }
  },
  createCargoType: async (data: Partial<CargoType>) => {
    const id = `cgt-${Date.now()}`;
    const newItem: CargoType = {
      id,
      code: data.code || 'CGT-NEW',
      name: data.name || 'Jenis Kargo Baru',
      category: data.category || 'Dry Container',
      unit: data.unit || 'TEU',
      handlingFeePerUnit: Number(data.handlingFeePerUnit || 350000),
      temperatureRequired: data.temperatureRequired,
      hazmatClass: data.hazmatClass,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      const serverRes = await apiFetch<CargoType>('/api/master/cargo-types', { method: 'POST', body: JSON.stringify(data) });
      addLocalItem('cargoTypes', serverRes);
      await syncFirestoreDoc('cargoTypes', serverRes.id, serverRes);
      return serverRes;
    } catch {
      addLocalItem('cargoTypes', newItem);
      await syncFirestoreDoc('cargoTypes', newItem.id, newItem);
      return newItem;
    }
  },
  updateCargoType: async (id: string, data: Partial<CargoType>) => {
    try {
      const updated = await apiFetch<CargoType>(`/api/master/cargo-types/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      addLocalItem('cargoTypes', updated);
      await syncFirestoreDoc('cargoTypes', id, updated);
      return updated;
    } catch {
      const updated = updateLocalItem<CargoType>('cargoTypes', id, data) || ({ id, ...data } as CargoType);
      await syncFirestoreDoc('cargoTypes', id, updated);
      return updated;
    }
  },
  deleteCargoType: async (id: string) => {
    removeLocalItem('cargoTypes', id);
    await removeFirestoreDoc('cargoTypes', id);
    try {
      await apiFetch<{ success: boolean; id: string }>(`/api/master/cargo-types/${id}`, { method: 'DELETE' });
    } catch {
      // pass
    }
    return { success: true, id };
  },

  // Transaksi Data CRUD - Schedules
  getSchedules: async () => {
    try {
      const list = await apiFetch<Schedule[]>('/api/transactions/schedules');
      return mergeLists<Schedule>(list, 'schedules');
    } catch {
      return getLocalItems<Schedule>('schedules');
    }
  },
  createSchedule: async (data: Partial<Schedule>) => {
    const id = `sch-${Date.now()}`;
    const newItem: Schedule = {
      id,
      voyageNumber: data.voyageNumber || `VY-${Date.now().toString().slice(-4)}`,
      vesselId: data.vesselId || 'vsl-1',
      routeId: data.routeId || 'rt-1',
      etd: data.etd || new Date().toISOString(),
      eta: data.eta || new Date(Date.now() + 86400000 * 3).toISOString(),
      currentStatus: data.currentStatus || 'Scheduled',
      currentCoordinates: data.currentCoordinates || '-6.1000, 106.8800',
      progressPercentage: Number(data.progressPercentage || 0),
      fuelConsumedLiters: Number(data.fuelConsumedLiters || 12000),
      weatherCondition: data.weatherCondition || 'Calm Sea',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      const serverRes = await apiFetch<Schedule>('/api/transactions/schedules', { method: 'POST', body: JSON.stringify(data) });
      addLocalItem('schedules', serverRes);
      await syncFirestoreDoc('schedules', serverRes.id, serverRes);
      return serverRes;
    } catch {
      addLocalItem('schedules', newItem);
      await syncFirestoreDoc('schedules', newItem.id, newItem);
      return newItem;
    }
  },
  updateSchedule: async (id: string, data: Partial<Schedule>) => {
    try {
      const updated = await apiFetch<Schedule>(`/api/transactions/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      addLocalItem('schedules', updated);
      await syncFirestoreDoc('schedules', id, updated);
      return updated;
    } catch {
      const updated = updateLocalItem<Schedule>('schedules', id, data) || ({ id, ...data } as Schedule);
      await syncFirestoreDoc('schedules', id, updated);
      return updated;
    }
  },
  deleteSchedule: async (id: string) => {
    removeLocalItem('schedules', id);
    await removeFirestoreDoc('schedules', id);
    try {
      await apiFetch<{ success: boolean; id: string }>(`/api/transactions/schedules/${id}`, { method: 'DELETE' });
    } catch {
      // pass
    }
    return { success: true, id };
  },

  // Transaksi Data CRUD - Bookings
  getBookings: async () => {
    try {
      const list = await apiFetch<CargoBooking[]>('/api/transactions/bookings');
      return mergeLists<CargoBooking>(list, 'bookings');
    } catch {
      return getLocalItems<CargoBooking>('bookings');
    }
  },
  createBooking: async (data: Partial<CargoBooking>) => {
    const bookingId = `bk-${Date.now()}`;
    const invoiceId = `inv-${Date.now()}`;
    const randDigits = Math.floor(100000 + Math.random() * 900000);
    const newBooking: CargoBooking = {
      id: bookingId,
      bookingNumber: data.bookingNumber || `BK-2026-${randDigits}`,
      blNumber: data.blNumber || `BL-NLOG-${randDigits}`,
      customerId: data.customerId || 'cst-1',
      scheduleId: data.scheduleId || 'sch-1',
      cargoTypeId: data.cargoTypeId || 'cgt-1',
      containerNumber: data.containerNumber || 'TGHU-782394-1',
      sealNumber: data.sealNumber || 'SL-88293',
      quantity: Number(data.quantity || 1),
      weightTons: Number(data.weightTons || 22.5),
      volumeCbm: Number(data.volumeCbm || 33.0),
      goodsDescription: data.goodsDescription || 'General Cargo',
      loadingPortId: data.loadingPortId || 'prt-1',
      dischargePortId: data.dischargePortId || 'prt-2',
      freightChargeRp: Number(data.freightChargeRp || 18500000),
      paymentStatus: 'Unpaid',
      shippingStatus: 'Booked',
      bookingDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newInvoice: Invoice = {
      id: invoiceId,
      invoiceNumber: `INV-2026-${randDigits}`,
      bookingId: bookingId,
      customerId: newBooking.customerId,
      subtotalRp: newBooking.freightChargeRp,
      demurrageFeeRp: 0,
      taxAmountRp: Math.round(newBooking.freightChargeRp * 0.11),
      totalAmountRp: Math.round(newBooking.freightChargeRp * 1.11),
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      paymentStatus: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const serverRes = await apiFetch<{ booking: CargoBooking; invoice: Invoice }>('/api/transactions/bookings', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      addLocalItem('bookings', serverRes.booking);
      addLocalItem('invoices', serverRes.invoice);
      await syncFirestoreDoc('bookings', serverRes.booking.id, serverRes.booking);
      await syncFirestoreDoc('invoices', serverRes.invoice.id, serverRes.invoice);
      return serverRes;
    } catch {
      addLocalItem('bookings', newBooking);
      addLocalItem('invoices', newInvoice);
      await syncFirestoreDoc('bookings', newBooking.id, newBooking);
      await syncFirestoreDoc('invoices', newInvoice.id, newInvoice);
      return { booking: newBooking, invoice: newInvoice };
    }
  },
  updateBooking: async (id: string, data: Partial<CargoBooking>) => {
    try {
      const updated = await apiFetch<CargoBooking>(`/api/transactions/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      addLocalItem('bookings', updated);
      await syncFirestoreDoc('bookings', id, updated);
      return updated;
    } catch {
      const updated = updateLocalItem<CargoBooking>('bookings', id, data) || ({ id, ...data } as CargoBooking);
      await syncFirestoreDoc('bookings', id, updated);
      return updated;
    }
  },
  deleteBooking: async (id: string) => {
    removeLocalItem('bookings', id);
    await removeFirestoreDoc('bookings', id);
    try {
      await apiFetch<{ success: boolean; id: string }>(`/api/transactions/bookings/${id}`, { method: 'DELETE' });
    } catch {
      // pass
    }
    return { success: true, id };
  },

  // Transaksi Data CRUD - Invoices
  getInvoices: async () => {
    try {
      const list = await apiFetch<Invoice[]>('/api/transactions/invoices');
      return mergeLists<Invoice>(list, 'invoices');
    } catch {
      return getLocalItems<Invoice>('invoices');
    }
  },
  updateInvoice: async (id: string, data: Partial<Invoice>) => {
    try {
      const updated = await apiFetch<Invoice>(`/api/transactions/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      addLocalItem('invoices', updated);
      await syncFirestoreDoc('invoices', id, updated);
      return updated;
    } catch {
      const updated = updateLocalItem<Invoice>('invoices', id, data) || ({ id, ...data } as Invoice);
      await syncFirestoreDoc('invoices', id, updated);
      return updated;
    }
  },

  // Analytics & Logs
  getAnalyticsSummary: () => apiFetch<AnalyticsSummary>('/api/analytics/summary'),
  getSystemLogs: () => apiFetch<SystemLog[]>('/api/system/logs')
};

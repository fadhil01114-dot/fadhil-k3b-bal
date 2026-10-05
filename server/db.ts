import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  passwordHash: string; // Plain text or hash for demo
  role: 'Super Admin' | 'Logistics Manager' | 'Port Supervisor' | 'Finance Admin';
  avatar?: string;
  createdAt: string;
}

export interface Vessel {
  id: string;
  imoNumber: string;
  name: string;
  vesselType: 'Container Ship' | 'Bulk Carrier' | 'Tanker' | 'Ro-Ro Cargo';
  capacityDwt: number;
  capacityTeu: number;
  flag: string;
  yearBuilt: number;
  status: 'At Sea' | 'In Transit' | 'At Berth' | 'In Anchorage' | 'Under Maintenance';
  fuelEfficiency: number; // Liters per Nautical Mile
  currentSpeedKnots: number;
  ownerCompany: string;
  createdAt: string;
  updatedAt: string;
}

export interface Port {
  id: string;
  code: string;
  name: string;
  city: string;
  province: string;
  berthCount: number;
  maxDraftMeters: number;
  handlingCapacityTeu: number;
  operationalStatus: 'Active' | 'High Traffic' | 'Maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  code: string;
  originPortId: string;
  destinationPortId: string;
  distanceNauticalMiles: number;
  estimatedTransitHours: number;
  baseFreightRateTeu: number;
  baseFreightRateTon: number;
  status: 'Active' | 'Suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  code: string;
  companyName: string;
  npwp: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  customerCategory: 'Exporter' | 'Importer' | 'Freight Forwarder' | 'Manufacturer';
  creditLimitRp: number;
  activeStatus: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CargoType {
  id: string;
  code: string;
  name: string;
  category: 'Dry Container' | 'Reefer Container' | 'Hazardous HAZMAT' | 'General Bulk' | 'Liquid Bulk';
  unit: 'TEU' | 'Metric Ton' | 'CBM';
  handlingFeePerUnit: number;
  temperatureRequired?: string;
  hazmatClass?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  voyageNumber: string;
  vesselId: string;
  routeId: string;
  etd: string; // Estimated Time of Departure
  atd?: string; // Actual Time of Departure
  eta: string; // Estimated Time of Arrival
  ata?: string; // Actual Time of Arrival
  currentStatus: 'Scheduled' | 'Loading' | 'In Transit' | 'Arrived' | 'Delayed';
  currentCoordinates: string;
  progressPercentage: number;
  weatherCondition: 'Calm Sea' | 'Moderate Waves' | 'Rough Sea' | 'Storm Warning';
  delayReason?: string;
  fuelConsumedLiters: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CargoBooking {
  id: string;
  bookingNumber: string;
  blNumber: string; // Bill of Lading
  customerId: string;
  scheduleId: string;
  cargoTypeId: string;
  containerNumber: string;
  sealNumber: string;
  quantity: number;
  weightTons: number;
  volumeCbm: number;
  goodsDescription: string;
  loadingPortId: string;
  dischargePortId: string;
  freightChargeRp: number;
  paymentStatus: 'Unpaid' | 'Invoiced' | 'Paid';
  shippingStatus: 'Booked' | 'Loaded at Port' | 'In Transit' | 'Discharged' | 'Delivered';
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  customerId: string;
  subtotalRp: number;
  demurrageFeeRp: number;
  taxAmountRp: number;
  totalAmountRp: number;
  issueDate: string;
  dueDate: string;
  paymentStatus: 'Pending' | 'Paid' | 'Overdue';
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface DatabaseSchema {
  users: User[];
  vessels: Vessel[];
  ports: Port[];
  routes: Route[];
  customers: Customer[];
  cargoTypes: CargoType[];
  schedules: Schedule[];
  bookings: CargoBooking[];
  invoices: Invoice[];
  logs: SystemLog[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'database.json');

// Initial seed data
const initialData: DatabaseSchema = {
  users: [
    {
      id: 'usr-admin-1',
      name: 'Capt. Budi Santoso',
      email: 'admin@maritime.co.id',
      username: 'admin',
      passwordHash: 'admin123',
      role: 'Super Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'usr-mgr-1',
      name: 'Siti Rahmawati, M.T.',
      email: 'manager@maritime.co.id',
      username: 'manager',
      passwordHash: 'manager123',
      role: 'Logistics Manager',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      createdAt: '2026-01-05T09:30:00.000Z'
    },
    {
      id: 'usr-port-1',
      name: 'Ahmad Hidayat',
      email: 'port.oper@maritime.co.id',
      username: 'portoper',
      passwordHash: 'port123',
      role: 'Port Supervisor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: '2026-01-10T11:00:00.000Z'
    }
  ],
  vessels: [
    {
      id: 'vsl-1',
      imoNumber: 'IMO 9821405',
      name: 'KM Nusantara Express IV',
      vesselType: 'Container Ship',
      capacityDwt: 28500,
      capacityTeu: 1850,
      flag: 'Indonesia',
      yearBuilt: 2020,
      status: 'In Transit',
      fuelEfficiency: 38.5,
      currentSpeedKnots: 16.8,
      ownerCompany: 'PT Pelayaran Samudra Nusantara',
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z'
    },
    {
      id: 'vsl-2',
      imoNumber: 'IMO 9745120',
      name: 'MV Samudra Jaya 08',
      vesselType: 'Container Ship',
      capacityDwt: 32000,
      capacityTeu: 2200,
      flag: 'Indonesia',
      yearBuilt: 2019,
      status: 'At Berth',
      fuelEfficiency: 42.0,
      currentSpeedKnots: 0.0,
      ownerCompany: 'PT Salam Pacific Indonesia Lines',
      createdAt: '2026-01-12T08:00:00.000Z',
      updatedAt: '2026-10-02T12:00:00.000Z'
    },
    {
      id: 'vsl-3',
      imoNumber: 'IMO 9612849',
      name: 'KM Meratus Flame',
      vesselType: 'Bulk Carrier',
      capacityDwt: 45000,
      capacityTeu: 0,
      flag: 'Indonesia',
      yearBuilt: 2018,
      status: 'In Transit',
      fuelEfficiency: 48.2,
      currentSpeedKnots: 14.2,
      ownerCompany: 'PT Meratus Line',
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-10-03T09:00:00.000Z'
    },
    {
      id: 'vsl-4',
      imoNumber: 'IMO 9901823',
      name: 'KM Temas Transpor 02',
      vesselType: 'Ro-Ro Cargo',
      capacityDwt: 15000,
      capacityTeu: 850,
      flag: 'Indonesia',
      yearBuilt: 2021,
      status: 'In Anchorage',
      fuelEfficiency: 29.5,
      currentSpeedKnots: 0.5,
      ownerCompany: 'PT Temas Line Tbk',
      createdAt: '2026-02-01T08:00:00.000Z',
      updatedAt: '2026-10-04T15:00:00.000Z'
    },
    {
      id: 'vsl-5',
      imoNumber: 'IMO 9523011',
      name: 'MT Bahari Tanker I',
      vesselType: 'Tanker',
      capacityDwt: 52000,
      capacityTeu: 0,
      flag: 'Indonesia',
      yearBuilt: 2017,
      status: 'Under Maintenance',
      fuelEfficiency: 52.0,
      currentSpeedKnots: 0.0,
      ownerCompany: 'PT Pertamina International Shipping',
      createdAt: '2026-02-10T08:00:00.000Z',
      updatedAt: '2026-10-05T01:00:00.000Z'
    }
  ],
  ports: [
    {
      id: 'prt-1',
      code: 'IDTPP',
      name: 'Pelabuhan Tanjung Priok',
      city: 'Jakarta Utara',
      province: 'DKI Jakarta',
      berthCount: 16,
      maxDraftMeters: 14.5,
      handlingCapacityTeu: 7500000,
      operationalStatus: 'High Traffic',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'prt-2',
      code: 'IDSUB',
      name: 'Pelabuhan Tanjung Perak',
      city: 'Surabaya',
      province: 'Jawa Timur',
      berthCount: 12,
      maxDraftMeters: 12.0,
      handlingCapacityTeu: 3800000,
      operationalStatus: 'Active',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'prt-3',
      code: 'IDMAK',
      name: 'Pelabuhan Soekarno-Hatta Makassar',
      city: 'Makassar',
      province: 'Sulawesi Selatan',
      berthCount: 8,
      maxDraftMeters: 11.5,
      handlingCapacityTeu: 2100000,
      operationalStatus: 'Active',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'prt-4',
      code: 'IDBLW',
      name: 'Pelabuhan Belawan',
      city: 'Medan',
      province: 'Sumatera Utara',
      berthCount: 10,
      maxDraftMeters: 11.0,
      handlingCapacityTeu: 1800000,
      operationalStatus: 'Active',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'prt-5',
      code: 'IDBTG',
      name: 'Pelabuhan Bitung Hub',
      city: 'Bitung',
      province: 'Sulawesi Utara',
      berthCount: 6,
      maxDraftMeters: 13.0,
      handlingCapacityTeu: 950000,
      operationalStatus: 'Maintenance',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    }
  ],
  routes: [
    {
      id: 'rt-1',
      code: 'RT-JKT-SBY',
      originPortId: 'prt-1',
      destinationPortId: 'prt-2',
      distanceNauticalMiles: 410,
      estimatedTransitHours: 28,
      baseFreightRateTeu: 4500000,
      baseFreightRateTon: 220000,
      status: 'Active',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'rt-2',
      code: 'RT-SBY-MKS',
      originPortId: 'prt-2',
      destinationPortId: 'prt-3',
      distanceNauticalMiles: 480,
      estimatedTransitHours: 32,
      baseFreightRateTeu: 6200000,
      baseFreightRateTon: 280000,
      status: 'Active',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'rt-3',
      code: 'RT-JKT-BLW',
      originPortId: 'prt-1',
      destinationPortId: 'prt-4',
      distanceNauticalMiles: 820,
      estimatedTransitHours: 52,
      baseFreightRateTeu: 8900000,
      baseFreightRateTon: 410000,
      status: 'Active',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'rt-4',
      code: 'RT-MKS-BTG',
      originPortId: 'prt-3',
      destinationPortId: 'prt-5',
      distanceNauticalMiles: 590,
      estimatedTransitHours: 40,
      baseFreightRateTeu: 7100000,
      baseFreightRateTon: 340000,
      status: 'Active',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    }
  ],
  customers: [
    {
      id: 'cst-1',
      code: 'CST-2026-001',
      companyName: 'PT Indofood Sukses Makmur Tbk',
      npwp: '01.348.910.2-014.000',
      contactPerson: 'Bpk. Hendra Wijaya',
      email: 'logistics@indofood.co.id',
      phone: '+62 21 5795 8822',
      address: 'Indofood Tower Lt. 22, Jend. Sudirman, Jakarta',
      city: 'Jakarta Selatan',
      customerCategory: 'Manufacturer',
      creditLimitRp: 1500000000,
      activeStatus: 'Active',
      createdAt: '2026-01-05T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'cst-2',
      code: 'CST-2026-002',
      companyName: 'PT Astra Otoparts Cargo',
      npwp: '01.122.384.5-092.000',
      contactPerson: 'Ibu Ratna Pertiwi',
      email: 'ratna@astra-otoparts.co.id',
      phone: '+62 21 460 3888',
      address: 'Kawasan Industri Pulogadung, Jakarta Timur',
      city: 'Jakarta Timur',
      customerCategory: 'Exporter',
      creditLimitRp: 2500000000,
      activeStatus: 'Active',
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'cst-3',
      code: 'CST-2026-003',
      companyName: 'CV Agro Nusantara Makmur',
      npwp: '31.902.112.4-612.000',
      contactPerson: 'Bpk. Bambang Sutrisno',
      email: 'bambang@agronusantara.com',
      phone: '+62 31 849 1029',
      address: 'Jl. Rungkut Industri III No. 45',
      city: 'Surabaya',
      customerCategory: 'Freight Forwarder',
      creditLimitRp: 800000000,
      activeStatus: 'Active',
      createdAt: '2026-02-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'cst-4',
      code: 'CST-2026-004',
      companyName: 'PT Sinar Mas Agribusiness',
      npwp: '01.559.882.1-018.000',
      contactPerson: 'Bpk. Denny Kurniawan',
      email: 'denny.k@sinarmas-agri.com',
      phone: '+62 21 318 8000',
      address: 'Sinar Mas Land Plaza, Thamrin',
      city: 'Jakarta Pusat',
      customerCategory: 'Exporter',
      creditLimitRp: 5000000000,
      activeStatus: 'Active',
      createdAt: '2026-02-15T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    }
  ],
  cargoTypes: [
    {
      id: 'crg-1',
      code: 'CRG-DRY-20',
      name: 'Dry Container 20ft (General)',
      category: 'Dry Container',
      unit: 'TEU',
      handlingFeePerUnit: 750000,
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'crg-2',
      code: 'CRG-DRY-40',
      name: 'Dry Container 40ft High Cube',
      category: 'Dry Container',
      unit: 'TEU',
      handlingFeePerUnit: 1250000,
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'crg-3',
      code: 'CRG-REF-40',
      name: 'Reefer Container 40ft (Refrigerated)',
      category: 'Reefer Container',
      unit: 'TEU',
      handlingFeePerUnit: 2400000,
      temperatureRequired: '-18°C s/d -22°C',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'crg-4',
      code: 'CRG-HAZ-20',
      name: 'Hazardous Cargo Container (HAZMAT)',
      category: 'Hazardous HAZMAT',
      unit: 'TEU',
      handlingFeePerUnit: 3500000,
      hazmatClass: 'Class 3 Flammable Liquid',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'crg-5',
      code: 'CRG-BLK-GEN',
      name: 'Break Bulk General Cargo',
      category: 'General Bulk',
      unit: 'Metric Ton',
      handlingFeePerUnit: 85000,
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-10-01T08:00:00.000Z'
    }
  ],
  schedules: [
    {
      id: 'sch-1',
      voyageNumber: 'VY-2026-088',
      vesselId: 'vsl-1',
      routeId: 'rt-1',
      etd: '2026-10-04T06:00:00.000Z',
      atd: '2026-10-04T06:30:00.000Z',
      eta: '2026-10-05T10:30:00.000Z',
      currentStatus: 'In Transit',
      currentCoordinates: '05°45\'S 108°12\'E (Laut Jawa Dekat Indramayu)',
      progressPercentage: 72,
      weatherCondition: 'Calm Sea',
      fuelConsumedLiters: 11200,
      notes: 'Kecepatan stabil 16.8 knot. Perkiraan bersandar jam 10:30 di Dermaga Jamrud Surabaya.',
      createdAt: '2026-09-25T08:00:00.000Z',
      updatedAt: '2026-10-05T02:00:00.000Z'
    },
    {
      id: 'sch-2',
      voyageNumber: 'VY-2026-089',
      vesselId: 'vsl-2',
      routeId: 'rt-2',
      etd: '2026-10-05T14:00:00.000Z',
      eta: '2026-10-06T22:00:00.000Z',
      currentStatus: 'Loading',
      currentCoordinates: 'Dermaga Mirah Pelabuhan Tanjung Perak Surabaya',
      progressPercentage: 35,
      weatherCondition: 'Calm Sea',
      fuelConsumedLiters: 850,
      notes: 'Sedang muat 120 TEU kargo Indofood & Sinar Mas.',
      createdAt: '2026-09-28T08:00:00.000Z',
      updatedAt: '2026-10-05T01:30:00.000Z'
    },
    {
      id: 'sch-3',
      voyageNumber: 'VY-2026-090',
      vesselId: 'vsl-3',
      routeId: 'rt-3',
      etd: '2026-10-02T10:00:00.000Z',
      atd: '2026-10-02T11:15:00.000Z',
      eta: '2026-10-04T15:00:00.000Z',
      ata: '2026-10-04T16:20:00.000Z',
      currentStatus: 'Arrived',
      currentCoordinates: 'Pelabuhan Belawan Dermaga 102 Medan',
      progressPercentage: 100,
      weatherCondition: 'Moderate Waves',
      delayReason: 'Antrean gelombang pasang di Selat Malaka',
      fuelConsumedLiters: 24500,
      notes: 'Bongkar kargo curah kering selesai tanpa insiden.',
      createdAt: '2026-09-20T08:00:00.000Z',
      updatedAt: '2026-10-04T17:00:00.000Z'
    },
    {
      id: 'sch-4',
      voyageNumber: 'VY-2026-091',
      vesselId: 'vsl-4',
      routeId: 'rt-4',
      etd: '2026-10-06T08:00:00.000Z',
      eta: '2026-10-08T00:00:00.000Z',
      currentStatus: 'Scheduled',
      currentCoordinates: 'Pelabuhan Soekarno Hatta Makassar',
      progressPercentage: 0,
      weatherCondition: 'Calm Sea',
      fuelConsumedLiters: 0,
      notes: 'Penyiapan dokumen manifest kargo & pas jalan kapal.',
      createdAt: '2026-10-01T08:00:00.000Z',
      updatedAt: '2026-10-05T00:00:00.000Z'
    }
  ],
  bookings: [
    {
      id: 'bkg-1',
      bookingNumber: 'BK-2026-101',
      blNumber: 'BL-NLOG-88201',
      customerId: 'cst-1',
      scheduleId: 'sch-1',
      cargoTypeId: 'crg-1',
      containerNumber: 'TGHU-849201-2',
      sealNumber: 'SL-993821',
      quantity: 4,
      weightTons: 68.5,
      volumeCbm: 128.0,
      goodsDescription: 'Mie Instan & Bumbu Olahan Kemasan Export Quality',
      loadingPortId: 'prt-1',
      dischargePortId: 'prt-2',
      freightChargeRp: 18000000,
      paymentStatus: 'Paid',
      shippingStatus: 'In Transit',
      bookingDate: '2026-09-30T10:00:00.000Z',
      createdAt: '2026-09-30T10:00:00.000Z',
      updatedAt: '2026-10-04T08:00:00.000Z'
    },
    {
      id: 'bkg-2',
      bookingNumber: 'BK-2026-102',
      blNumber: 'BL-NLOG-88202',
      customerId: 'cst-2',
      scheduleId: 'sch-1',
      cargoTypeId: 'crg-2',
      containerNumber: 'AMFU-492102-9',
      sealNumber: 'SL-884102',
      quantity: 2,
      weightTons: 42.0,
      volumeCbm: 152.0,
      goodsDescription: 'Suku Cadang Otomotif & Komponen Rem Kendaraan',
      loadingPortId: 'prt-1',
      dischargePortId: 'prt-2',
      freightChargeRp: 12500000,
      paymentStatus: 'Invoiced',
      shippingStatus: 'In Transit',
      bookingDate: '2026-10-01T11:30:00.000Z',
      createdAt: '2026-10-01T11:30:00.000Z',
      updatedAt: '2026-10-04T08:00:00.000Z'
    },
    {
      id: 'bkg-3',
      bookingNumber: 'BK-2026-103',
      blNumber: 'BL-NLOG-88203',
      customerId: 'cst-3',
      scheduleId: 'sch-2',
      cargoTypeId: 'crg-3',
      containerNumber: 'CRXU-902184-0',
      sealNumber: 'SL-772910',
      quantity: 3,
      weightTons: 54.0,
      volumeCbm: 180.0,
      goodsDescription: 'Ikan Beku & Olahan Sea Food Frozen -18C',
      loadingPortId: 'prt-2',
      dischargePortId: 'prt-3',
      freightChargeRp: 25800000,
      paymentStatus: 'Paid',
      shippingStatus: 'Loaded at Port',
      bookingDate: '2026-10-02T14:15:00.000Z',
      createdAt: '2026-10-02T14:15:00.000Z',
      updatedAt: '2026-10-05T01:00:00.000Z'
    },
    {
      id: 'bkg-4',
      bookingNumber: 'BK-2026-104',
      blNumber: 'BL-NLOG-88204',
      customerId: 'cst-4',
      scheduleId: 'sch-3',
      cargoTypeId: 'crg-5',
      containerNumber: 'BULK-NLOG-09',
      sealNumber: 'SL-009281',
      quantity: 1200,
      weightTons: 1200.0,
      volumeCbm: 1800.0,
      goodsDescription: 'Minyak Kelapa Sawit Mentah CPO Curah',
      loadingPortId: 'prt-1',
      dischargePortId: 'prt-4',
      freightChargeRp: 492000000,
      paymentStatus: 'Paid',
      shippingStatus: 'Delivered',
      bookingDate: '2026-09-22T09:00:00.000Z',
      createdAt: '2026-09-22T09:00:00.000Z',
      updatedAt: '2026-10-04T18:00:00.000Z'
    }
  ],
  invoices: [
    {
      id: 'inv-1',
      invoiceNumber: 'INV-2026-0041',
      bookingId: 'bkg-1',
      customerId: 'cst-1',
      subtotalRp: 18000000,
      demurrageFeeRp: 0,
      taxAmountRp: 1980000,
      totalAmountRp: 19980000,
      issueDate: '2026-09-30T11:00:00.000Z',
      dueDate: '2026-10-30T23:59:59.000Z',
      paymentStatus: 'Paid',
      paymentMethod: 'Bank Transfer Mandiri Virtual Account',
      paidAt: '2026-10-01T09:15:00.000Z',
      createdAt: '2026-09-30T11:00:00.000Z',
      updatedAt: '2026-10-01T09:15:00.000Z'
    },
    {
      id: 'inv-2',
      invoiceNumber: 'INV-2026-0042',
      bookingId: 'bkg-2',
      customerId: 'cst-2',
      subtotalRp: 12500000,
      demurrageFeeRp: 500000,
      taxAmountRp: 1430000,
      totalAmountRp: 14430000,
      issueDate: '2026-10-01T12:00:00.000Z',
      dueDate: '2026-10-15T23:59:59.000Z',
      paymentStatus: 'Pending',
      createdAt: '2026-10-01T12:00:00.000Z',
      updatedAt: '2026-10-01T12:00:00.000Z'
    },
    {
      id: 'inv-3',
      invoiceNumber: 'INV-2026-0043',
      bookingId: 'bkg-3',
      customerId: 'cst-3',
      subtotalRp: 25800000,
      demurrageFeeRp: 0,
      taxAmountRp: 2838000,
      totalAmountRp: 28638000,
      issueDate: '2026-10-02T15:00:00.000Z',
      dueDate: '2026-10-17T23:59:59.000Z',
      paymentStatus: 'Paid',
      paymentMethod: 'BCA Escrow Settlement',
      paidAt: '2026-10-03T14:20:00.000Z',
      createdAt: '2026-10-02T15:00:00.000Z',
      updatedAt: '2026-10-03T14:20:00.000Z'
    }
  ],
  logs: [
    {
      id: 'log-1',
      userId: 'usr-admin-1',
      userName: 'Capt. Budi Santoso',
      action: 'SYSTEM_BOOTSTRAP',
      details: 'Inisialisasi Database Real NauticaLog Angkutan Laut',
      timestamp: '2026-10-05T02:00:00.000Z'
    }
  ]
};

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadData();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DB_DIR)) {
      try {
        fs.mkdirSync(DB_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data dir:', err);
      }
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading DB, using initial data:', err);
    }
    // Save initial data if not exists
    this.saveData(initialData);
    return initialData;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save DB to file:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    return this.data[collection];
  }

  public findById<K extends keyof DatabaseSchema>(collection: K, id: string) {
    const items = this.data[collection] as Array<{ id: string }>;
    return items.find((item) => item.id === id);
  }

  public insert<K extends keyof DatabaseSchema>(collection: K, item: any): any {
    const newItem = {
      ...item,
      id: item.id || `${collection.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    (this.data[collection] as any[]).unshift(newItem);
    this.saveData(this.data);
    return newItem;
  }

  public update<K extends keyof DatabaseSchema>(collection: K, id: string, patch: any): any | null {
    const items = this.data[collection] as any[];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...patch,
      updatedAt: new Date().toISOString()
    };
    this.saveData(this.data);
    return items[index];
  }

  public delete<K extends keyof DatabaseSchema>(collection: K, id: string): boolean {
    const items = this.data[collection] as any[];
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;

    items.splice(index, 1);
    this.saveData(this.data);
    return true;
  }

  public addLog(userId: string, userName: string, action: string, details: string) {
    const log: SystemLog = {
      id: `log-${Date.now()}`,
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.logs.unshift(log);
    // Keep max 200 logs
    if (this.data.logs.length > 200) {
      this.data.logs = this.data.logs.slice(0, 200);
    }
    this.saveData(this.data);
    return log;
  }
}

export const dbInstance = new Database();

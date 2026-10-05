export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
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
  fuelEfficiency: number; // Liters/NM
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
  etd: string;
  atd?: string;
  eta: string;
  ata?: string;
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
  blNumber: string;
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

export interface AnalyticsSummary {
  totalVessels: number;
  activeVessels: number;
  totalCargoTons: number;
  totalCargoTeu: number;
  totalRevenue: number;
  pendingRevenue: number;
  onTimePercentage: number;
  completedSchedules: number;
  delayedSchedules: number;
  totalPorts: number;
  activeBookingsCount: number;
}

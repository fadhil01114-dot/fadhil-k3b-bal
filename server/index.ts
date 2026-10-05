import express, { Request, Response } from 'express';
import cors from 'cors';
import { dbInstance } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Helper authentication middleware / token simple generator
function generateToken(user: any) {
  return Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role, time: Date.now() })).toString('base64');
}

function parseToken(authHeader?: string) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const raw = Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString('utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---------------- AUTH ROUTES ----------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail) {
    return res.status(400).json({ error: 'Username atau Email wajib diisi.' });
  }

  const users = dbInstance.get('users');
  const lowerInput = usernameOrEmail.trim().toLowerCase();
  
  // Find exact match by email or username
  let user = users.find(
    (u) => u.email.toLowerCase() === lowerInput || u.username.toLowerCase() === lowerInput
  );

  // If user doesn't exist, create a new active account automatically so ANY user can log in!
  if (!user) {
    const rawName = lowerInput.includes('@') ? lowerInput.split('@')[0] : lowerInput;
    const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    
    user = dbInstance.insert('users', {
      name: `${cleanName} (Operasional)`,
      email: lowerInput.includes('@') ? lowerInput : `${lowerInput}@maritime.co.id`,
      username: rawName,
      passwordHash: password || '123456',
      role: lowerInput.includes('manager') ? 'Logistics Manager' : lowerInput.includes('port') ? 'Port Supervisor' : lowerInput.includes('finance') ? 'Finance Admin' : 'Super Admin',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`
    });
  }

  const token = generateToken(user);
  dbInstance.addLog((user as any).id, (user as any).name, 'USER_LOGIN', `Login sukses sebagai ${(user as any).role}`);

  const { passwordHash, ...userWithoutPass } = user as any;
  return res.json({
    token,
    user: userWithoutPass
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, username, password, role } = req.body;
  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: 'Data registrasi tidak lengkap.' });
  }

  const users = dbInstance.get('users');
  const existing = users.find((u) => u.email === email || u.username === username);
  if (existing) {
    return res.status(400).json({ error: 'Email atau Username sudah terdaftar di sistem.' });
  }

  const newUser = dbInstance.insert('users', {
    name,
    email,
    username,
    passwordHash: password,
    role: role || 'Logistics Manager',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  });

  dbInstance.addLog(newUser.id, newUser.name, 'USER_REGISTER', `Registrasi akun pengguna baru (${newUser.role})`);
  const token = generateToken(newUser);
  const { passwordHash, ...userWithoutPass } = newUser;

  return res.status(201).json({
    token,
    user: userWithoutPass
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  if (!payload) {
    return res.status(401).json({ error: 'Sesi berakhir atau token tidak valid.' });
  }
  const user = dbInstance.findById('users', payload.id) as any;
  if (!user) {
    return res.status(401).json({ error: 'Pengguna tidak ditemukan.' });
  }
  const { passwordHash, ...userWithoutPass } = user;
  return res.json({ user: userWithoutPass });
});

// ---------------- MASTER DATA ROUTES ----------------

// 1. Vessels
app.get('/api/master/vessels', (req: Request, res: Response) => {
  return res.json(dbInstance.get('vessels'));
});

app.post('/api/master/vessels', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const vessel = dbInstance.insert('vessels', req.body);
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'CREATE_VESSEL', `Tambah Kapal Baru: ${vessel.name} (${vessel.imoNumber})`);
  return res.status(201).json(vessel);
});

app.put('/api/master/vessels/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const updated = dbInstance.update('vessels', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Kapal tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'UPDATE_VESSEL', `Update Kapal ID: ${req.params.id}`);
  return res.json(updated);
});

app.delete('/api/master/vessels/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const success = dbInstance.delete('vessels', req.params.id);
  if (!success) return res.status(404).json({ error: 'Kapal tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'DELETE_VESSEL', `Hapus Kapal ID: ${req.params.id}`);
  return res.json({ success: true, id: req.params.id });
});

// 2. Ports
app.get('/api/master/ports', (req: Request, res: Response) => {
  return res.json(dbInstance.get('ports'));
});

app.post('/api/master/ports', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const port = dbInstance.insert('ports', req.body);
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'CREATE_PORT', `Tambah Pelabuhan: ${port.name} (${port.code})`);
  return res.status(201).json(port);
});

app.put('/api/master/ports/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const updated = dbInstance.update('ports', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Pelabuhan tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'UPDATE_PORT', `Update Pelabuhan ID: ${req.params.id}`);
  return res.json(updated);
});

app.delete('/api/master/ports/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const success = dbInstance.delete('ports', req.params.id);
  if (!success) return res.status(404).json({ error: 'Pelabuhan tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'DELETE_PORT', `Hapus Pelabuhan ID: ${req.params.id}`);
  return res.json({ success: true, id: req.params.id });
});

// 3. Routes
app.get('/api/master/routes', (req: Request, res: Response) => {
  return res.json(dbInstance.get('routes'));
});

app.post('/api/master/routes', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const route = dbInstance.insert('routes', req.body);
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'CREATE_ROUTE', `Tambah Rute Pelayaran: ${route.code}`);
  return res.status(201).json(route);
});

app.put('/api/master/routes/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const updated = dbInstance.update('routes', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Rute tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'UPDATE_ROUTE', `Update Rute ID: ${req.params.id}`);
  return res.json(updated);
});

app.delete('/api/master/routes/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const success = dbInstance.delete('routes', req.params.id);
  if (!success) return res.status(404).json({ error: 'Rute tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'DELETE_ROUTE', `Hapus Rute ID: ${req.params.id}`);
  return res.json({ success: true, id: req.params.id });
});

// 4. Customers
app.get('/api/master/customers', (req: Request, res: Response) => {
  return res.json(dbInstance.get('customers'));
});

app.post('/api/master/customers', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const customer = dbInstance.insert('customers', req.body);
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'CREATE_CUSTOMER', `Tambah Pelanggan: ${customer.companyName}`);
  return res.status(201).json(customer);
});

app.put('/api/master/customers/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const updated = dbInstance.update('customers', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'UPDATE_CUSTOMER', `Update Pelanggan ID: ${req.params.id}`);
  return res.json(updated);
});

app.delete('/api/master/customers/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const success = dbInstance.delete('customers', req.params.id);
  if (!success) return res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'DELETE_CUSTOMER', `Hapus Pelanggan ID: ${req.params.id}`);
  return res.json({ success: true, id: req.params.id });
});

// 5. Cargo Types
app.get('/api/master/cargo-types', (req: Request, res: Response) => {
  return res.json(dbInstance.get('cargoTypes'));
});

app.post('/api/master/cargo-types', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const cargoType = dbInstance.insert('cargoTypes', req.body);
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'CREATE_CARGO_TYPE', `Tambah Jenis Kargo: ${cargoType.name}`);
  return res.status(201).json(cargoType);
});

app.put('/api/master/cargo-types/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const updated = dbInstance.update('cargoTypes', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Jenis kargo tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'UPDATE_CARGO_TYPE', `Update Jenis Kargo ID: ${req.params.id}`);
  return res.json(updated);
});

app.delete('/api/master/cargo-types/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const success = dbInstance.delete('cargoTypes', req.params.id);
  if (!success) return res.status(404).json({ error: 'Jenis kargo tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'DELETE_CARGO_TYPE', `Hapus Jenis Kargo ID: ${req.params.id}`);
  return res.json({ success: true, id: req.params.id });
});

// ---------------- TRANSAKSI DATA ROUTES ----------------

// 1. Schedules & Vessel Tracking
app.get('/api/transactions/schedules', (req: Request, res: Response) => {
  return res.json(dbInstance.get('schedules'));
});

app.post('/api/transactions/schedules', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const schedule = dbInstance.insert('schedules', req.body);
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'CREATE_SCHEDULE', `Buat Jadwal Pelayaran ${schedule.voyageNumber}`);
  return res.status(201).json(schedule);
});

app.put('/api/transactions/schedules/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const updated = dbInstance.update('schedules', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'UPDATE_SCHEDULE', `Update Jadwal Pelayaran ${updated.voyageNumber}`);
  return res.json(updated);
});

app.delete('/api/transactions/schedules/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const success = dbInstance.delete('schedules', req.params.id);
  if (!success) return res.status(404).json({ error: 'Jadwal tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'DELETE_SCHEDULE', `Hapus Jadwal Pelayaran ID: ${req.params.id}`);
  return res.json({ success: true, id: req.params.id });
});

// 2. Cargo Bookings & Manifest
app.get('/api/transactions/bookings', (req: Request, res: Response) => {
  return res.json(dbInstance.get('bookings'));
});

app.post('/api/transactions/bookings', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const bookingData = {
    ...req.body,
    bookingNumber: req.body.bookingNumber || `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
    blNumber: req.body.blNumber || `BL-NLOG-${Math.floor(80000 + Math.random() * 10000)}`
  };
  const booking = dbInstance.insert('bookings', bookingData);
  
  // Automatically generate invoice for booking
  const subtotal = booking.freightChargeRp || 10000000;
  const tax = Math.round(subtotal * 0.11);
  const invoice = dbInstance.insert('invoices', {
    invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    bookingId: booking.id,
    customerId: booking.customerId,
    subtotalRp: subtotal,
    demurrageFeeRp: 0,
    taxAmountRp: tax,
    totalAmountRp: subtotal + tax,
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: 'Pending'
  });

  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'CREATE_BOOKING', `Pemesanan Kargo Baru ${booking.bookingNumber} (${booking.blNumber}) & Invoice ${invoice.invoiceNumber}`);
  return res.status(201).json({ booking, invoice });
});

app.put('/api/transactions/bookings/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const updated = dbInstance.update('bookings', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Kargo booking tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'UPDATE_BOOKING', `Update Kargo Booking ${updated.bookingNumber}`);
  return res.json(updated);
});

app.delete('/api/transactions/bookings/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const success = dbInstance.delete('bookings', req.params.id);
  if (!success) return res.status(404).json({ error: 'Kargo booking tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'DELETE_BOOKING', `Hapus Kargo Booking ID: ${req.params.id}`);
  return res.json({ success: true, id: req.params.id });
});

// 3. Invoices
app.get('/api/transactions/invoices', (req: Request, res: Response) => {
  return res.json(dbInstance.get('invoices'));
});

app.put('/api/transactions/invoices/:id', (req: Request, res: Response) => {
  const payload = parseToken(req.headers.authorization);
  const updated = dbInstance.update('invoices', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Invoice tidak ditemukan' });
  dbInstance.addLog(payload?.id || 'system', payload?.email || 'Admin', 'UPDATE_INVOICE', `Update Invoice ${updated.invoiceNumber}`);
  return res.json(updated);
});

// ---------------- ANALYTICS & REPORTS ----------------
app.get('/api/analytics/summary', (req: Request, res: Response) => {
  const vessels = dbInstance.get('vessels');
  const schedules = dbInstance.get('schedules');
  const bookings = dbInstance.get('bookings');
  const invoices = dbInstance.get('invoices');
  const ports = dbInstance.get('ports');

  const totalVessels = vessels.length;
  const activeVessels = vessels.filter((v) => v.status === 'In Transit' || v.status === 'At Berth').length;
  
  const totalCargoTons = bookings.reduce((acc, b) => acc + (b.weightTons || 0), 0);
  const totalCargoTeu = bookings.reduce((acc, b) => acc + (b.quantity || 0), 0);
  
  const totalRevenue = invoices.filter((i) => i.paymentStatus === 'Paid').reduce((acc, i) => acc + (i.totalAmountRp || 0), 0);
  const pendingRevenue = invoices.filter((i) => i.paymentStatus === 'Pending').reduce((acc, i) => acc + (i.totalAmountRp || 0), 0);

  const completedSchedules = schedules.filter((s) => s.currentStatus === 'Arrived').length;
  const delayedSchedules = schedules.filter((s) => s.delayReason && s.delayReason !== 'None').length;
  const onTimePercentage = schedules.length > 0 ? Math.round(((schedules.length - delayedSchedules) / schedules.length) * 100) : 100;

  return res.json({
    totalVessels,
    activeVessels,
    totalCargoTons,
    totalCargoTeu,
    totalRevenue,
    pendingRevenue,
    onTimePercentage,
    completedSchedules,
    delayedSchedules,
    totalPorts: ports.length,
    activeBookingsCount: bookings.length
  });
});

app.get('/api/system/logs', (req: Request, res: Response) => {
  return res.json(dbInstance.get('logs'));
});

export default app;

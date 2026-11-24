import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Local JSON storage helper for dual-sync resilience (falls back to /tmp if app root is read-only)
const SEED_DATA_DIR = path.resolve(__dirname, 'data');
function resolveWritableDataDir(): string {
  try {
    if (!fs.existsSync(SEED_DATA_DIR)) {
      fs.mkdirSync(SEED_DATA_DIR, { recursive: true });
    }
    fs.accessSync(SEED_DATA_DIR, fs.constants.W_OK);
    return SEED_DATA_DIR;
  } catch {
    const tmpDir = path.join(os.tmpdir(), 'ola-continental-data');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    // Seed read-only baked files (like admin-auth.json / reviews.json) into writable tmpDir
    try {
      if (fs.existsSync(SEED_DATA_DIR)) {
        for (const entry of fs.readdirSync(SEED_DATA_DIR)) {
          const src = path.join(SEED_DATA_DIR, entry);
          const dst = path.join(tmpDir, entry);
          if (!fs.existsSync(dst) && fs.statSync(src).isFile()) {
            fs.copyFileSync(src, dst);
          }
        }
      }
    } catch {
      // ignore seed copy errors
    }
    return tmpDir;
  }
}

const DATA_DIR = resolveWritableDataDir();

const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const VIEWINGS_FILE = path.join(DATA_DIR, 'viewings.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const CONSTRUCTIONS_FILE = path.join(DATA_DIR, 'constructions.json');
const ADMIN_AUTH_FILE = path.join(DATA_DIR, 'admin-auth.json');
const SESSION_SECRET_FILE = path.join(DATA_DIR, 'session-secret.key');
const HERO_VIDEO_FILE = path.join(DATA_DIR, 'hero-video.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch {
  // ignore
}

app.use('/uploads', express.static(UPLOADS_DIR));

function readJsonFile<T>(filePath: string, defaultVal: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultVal;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initial seed reviews
const initialReviews = [
  {
    id: 'rev-1',
    propertyId: 'grand-olukoko-duplex',
    clientName: 'Dr. T. Adeleke',
    rating: 5,
    inspectionDate: 'October 2026',
    comment: 'Conducted a physical walkthrough on Tuesday inspection day with Engineer Samuel Aleji. Boundary beacons and ministry survey coordinates chart perfectly behind LAUTECH hospital. Very solid construction.',
    verified: true,
  },
  {
    id: 'rev-2',
    propertyId: 'lautech-student-hostel-16',
    clientName: 'Engr. K. Balogun (Diaspora Investor)',
    rating: 5,
    inspectionDate: 'September 2026',
    comment: 'Closed via WhatsApp live video verification and registered deed verification. The 16 rooms are fully occupied with steady rent rolls near Adenike campus gates. Outstanding professionalism.',
    verified: true,
  },
  {
    id: 'rev-3',
    propertyId: 'mushin-commercial-income',
    clientName: 'Chief M. Babatunde',
    rating: 5,
    inspectionDate: 'August 2026',
    comment: 'Genuine title search confirmed at Lagos registry. Active commercial ground tenants in Mushin generating immediate cashflow. Transparent agency transaction.',
    verified: true,
  },
  {
    id: 'rev-4',
    propertyId: 'odo-oba-farmland',
    clientName: 'Alhaja F. Yusuff',
    rating: 5,
    inspectionDate: 'August 2026',
    comment: 'The natural perennial stream gives uninterrupted all-year irrigation. Baale lineage verification was conducted in person with zero family disputes. Highly trustworthy firm.',
    verified: true,
  }
];

if (!fs.existsSync(REVIEWS_FILE)) {
  writeJsonFile(REVIEWS_FILE, initialReviews);
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    company: 'Ola Continental Properties & Associates',
    established: 2006,
    geminiEnabled: Boolean(ai),
    firebaseConfigured: fs.existsSync(path.resolve(__dirname, 'firebase-applet-config.json')),
    timestamp: new Date().toISOString(),
  });
});

// =========================================================================
// SECURE OWNER ADMIN AUTHENTICATION, COOKIES & SESSION TOKENS
// =========================================================================
const OWNER_GOOGLE_EMAIL = 'olacontinental625@gmail.com';
const ADMIN_COOKIE_NAME = 'oc_admin_session';
const CUSTOMER_COOKIE_NAME = 'oc_customer_session';

function loadOrCreateSessionSecret(): string {
  const envSecret = process.env.SESSION_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) return envSecret;
  try {
    if (fs.existsSync(SESSION_SECRET_FILE)) {
      const stored = fs.readFileSync(SESSION_SECRET_FILE, 'utf-8').trim();
      if (stored.length >= 32) return stored;
    }
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(SESSION_SECRET_FILE, generated, { encoding: 'utf-8', mode: 0o600 });
    return generated;
  } catch {
    return crypto.randomBytes(32).toString('hex');
  }
}

const SESSION_SECRET = loadOrCreateSessionSecret();

function parseCookies(req: express.Request): Record<string, string> {
  const raw = req.headers.cookie;
  if (!raw) return {};
  const result: Record<string, string> = {};
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      result[key] = decodeURIComponent(val);
    } catch {
      result[key] = val;
    }
  }
  return result;
}

function isHttpsRequest(req: express.Request): boolean {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  return req.secure || forwardedProto.includes('https');
}

function setSignedCookie(
  req: express.Request,
  res: express.Response,
  name: string,
  value: string,
  maxAgeSeconds: number
) {
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    isHttpsRequest(req) ? 'SameSite=None; Secure' : 'SameSite=Lax',
  ];
  res.append('Set-Cookie', attrs.join('; '));
}

function clearSignedCookie(req: express.Request, res: express.Response, name: string) {
  const attrs = [
    `${name}=`,
    'HttpOnly',
    'Path=/',
    'Max-Age=0',
    isHttpsRequest(req) ? 'SameSite=None; Secure' : 'SameSite=Lax',
  ];
  res.append('Set-Cookie', attrs.join('; '));
}

interface AdminAuthRecord {
  salt: string;
  hash: string;
  createdAt: string;
  updatedAt?: string;
}

function getEnvAdminPasscode(): string | null {
  const val = process.env.ADMIN_PASSCODE?.trim();
  return val && val.length >= 4 ? val : null;
}

function readStoredAdminAuth(): AdminAuthRecord | null {
  if (!fs.existsSync(ADMIN_AUTH_FILE)) return null;
  const parsed = readJsonFile<AdminAuthRecord | null>(ADMIN_AUTH_FILE, null);
  if (parsed && parsed.salt && parsed.hash) return parsed;
  return null;
}

function verifyPasscodeConstantTime(inputPasscode: string): boolean {
  const envPasscode = getEnvAdminPasscode();
  if (envPasscode) {
    const a = crypto.createHash('sha256').update(inputPasscode).digest();
    const b = crypto.createHash('sha256').update(envPasscode).digest();
    return crypto.timingSafeEqual(a, b);
  }
  const stored = readStoredAdminAuth();
  if (!stored) return false;
  const derived = crypto.scryptSync(inputPasscode, stored.salt, 64);
  const storedBuf = Buffer.from(stored.hash, 'hex');
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

function createAdminToken(authMethod: 'passcode' | 'google' = 'passcode'): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'owner-admin',
      method: authMethod,
      iat: Date.now(),
      exp: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded.role !== 'owner-admin' || typeof decoded.exp !== 'number') return false;
    return decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function extractAdminToken(req: express.Request): string | undefined {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req);
  return cookies[ADMIN_COOKIE_NAME];
}

function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = extractAdminToken(req);
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Owner admin authentication is required.' });
  }
  next();
}

function createCustomerToken(customerId: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'customer',
      customerId,
      iat: Date.now(),
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyCustomerToken(token: string | undefined): string | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded.role !== 'customer' || !decoded.customerId || typeof decoded.exp !== 'number') return null;
    if (decoded.exp <= Date.now()) return null;
    return String(decoded.customerId);
  } catch {
    return null;
  }
}

app.get('/api/admin/status', (req, res) => {
  const envConfigured = Boolean(getEnvAdminPasscode());
  const storedConfigured = Boolean(readStoredAdminAuth());
  const configured = envConfigured || storedConfigured;
  res.json({
    configured,
    setupRequired: !configured,
    source: envConfigured ? 'env' : storedConfigured ? 'setup' : 'unconfigured',
  });
});

app.get('/api/admin/me', (req, res) => {
  const token = extractAdminToken(req);
  if (token && verifyAdminToken(token)) {
    return res.json({ authenticated: true, token });
  }
  return res.json({ authenticated: false });
});

app.post('/api/admin/setup', (req, res) => {
  if (getEnvAdminPasscode() || readStoredAdminAuth()) {
    return res.status(409).json({ error: 'Owner admin passcode is already configured. Please sign in.' });
  }

  const rawPasscode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
  if (rawPasscode.length < 6 || rawPasscode.length > 128) {
    return res.status(400).json({ error: 'Owner passcode must be between 6 and 128 characters.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(rawPasscode, salt, 64).toString('hex');
  const record: AdminAuthRecord = {
    salt,
    hash,
    createdAt: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(record, null, 2), { encoding: 'utf-8', flag: 'wx' });
  } catch {
    return res.status(409).json({ error: 'Owner admin passcode was already claimed.' });
  }

  const token = createAdminToken('passcode');
  setSignedCookie(req, res, ADMIN_COOKIE_NAME, token, 12 * 60 * 60);
  return res.status(201).json({ success: true, token });
});

app.post('/api/admin/login', (req, res) => {
  const configured = Boolean(getEnvAdminPasscode() || readStoredAdminAuth());
  if (!configured) {
    return res.status(400).json({ error: 'Owner admin passcode is not configured yet. Please complete first-time setup.' });
  }

  const rawPasscode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
  if (!rawPasscode || !verifyPasscodeConstantTime(rawPasscode)) {
    return res.status(401).json({ error: 'Invalid owner admin passcode.' });
  }

  const token = createAdminToken('passcode');
  setSignedCookie(req, res, ADMIN_COOKIE_NAME, token, 12 * 60 * 60);
  return res.json({ success: true, token });
});

app.post('/api/admin/google-login', async (req, res) => {
  const idToken = typeof req.body?.idToken === 'string' ? req.body.idToken.trim() : '';
  if (!idToken) {
    return res.status(400).json({ error: 'Firebase ID token is required.' });
  }

  try {
    const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (!fs.existsSync(firebaseConfigPath)) {
      return res.status(500).json({ error: 'Firebase project configuration is missing.' });
    }
    const firebaseCfg = readJsonFile<{ apiKey?: string; projectId?: string }>(firebaseConfigPath, {});
    if (!firebaseCfg.apiKey) {
      return res.status(500).json({ error: 'Firebase API key missing from project configuration.' });
    }

    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseCfg.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!verifyRes.ok) {
      return res.status(401).json({ error: 'Could not verify Google owner session token.' });
    }

    const lookupData = (await verifyRes.json()) as {
      users?: Array<{ email?: string; emailVerified?: boolean; localId?: string }>;
    };
    const user = lookupData.users?.[0];
    const email = String(user?.email || '').toLowerCase();
    const verified = Boolean(user?.emailVerified);

    if (email !== OWNER_GOOGLE_EMAIL || !verified) {
      return res.status(403).json({
        error: `Google sign-in is restricted to verified owner account (${OWNER_GOOGLE_EMAIL}).`,
      });
    }

    const token = createAdminToken('google');
    setSignedCookie(req, res, ADMIN_COOKIE_NAME, token, 12 * 60 * 60);
    return res.json({ success: true, token, email });
  } catch (err) {
    console.error('Google admin login verification error:', err);
    return res.status(500).json({ error: 'Failed to verify Google owner login.' });
  }
});

app.post('/api/admin/change-passcode', requireAdminAuth, (req, res) => {
  const newPasscode = typeof req.body?.newPasscode === 'string' ? req.body.newPasscode.trim() : '';
  if (newPasscode.length < 6 || newPasscode.length > 128) {
    return res.status(400).json({ error: 'New owner passcode must be between 6 and 128 characters.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(newPasscode, salt, 64).toString('hex');
  const existing = readStoredAdminAuth();
  const record: AdminAuthRecord = {
    salt,
    hash,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeJsonFile(ADMIN_AUTH_FILE, record);
  const token = createAdminToken('passcode');
  setSignedCookie(req, res, ADMIN_COOKIE_NAME, token, 12 * 60 * 60);
  return res.json({ success: true, token });
});

app.post('/api/admin/logout', (req, res) => {
  clearSignedCookie(req, res, ADMIN_COOKIE_NAME);
  return res.json({ success: true });
});

// =========================================================================
// CUSTOMER REGISTRATION, RETURNING SIGN-IN & PROTECTED ADMIN DIRECTORY
// =========================================================================
interface ValidCustomerPayload {
  fullName: string;
  phone: string;
  email: string;
  whatsapp: string;
}

function validateCustomerFields(body: any): { valid: true; data: ValidCustomerPayload } | { valid: false; error: string } {
  const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const whatsapp = typeof body?.whatsapp === 'string' ? body.whatsapp.trim() : '';

  if (fullName.length < 2 || fullName.length > 120) {
    return { valid: false, error: 'Full Name is required (2–120 characters).' };
  }
  if (phone.length < 5 || phone.length > 40) {
    return { valid: false, error: 'Phone Number is required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) {
    return { valid: false, error: 'A valid Email Address is required.' };
  }
  if (whatsapp.length < 5 || whatsapp.length > 40) {
    return { valid: false, error: 'WhatsApp Number is required.' };
  }

  return { valid: true, data: { fullName, phone, email, whatsapp } };
}

function normalizePhoneDigits(val: unknown): string {
  return String(val || '').replace(/[^0-9]/g, '');
}

app.post('/api/customers', (req, res) => {
  const check = validateCustomerFields(req.body);
  if (check.valid === false) {
    return res.status(400).json({ error: check.error });
  }

  const sourceRaw = typeof req.body?.source === 'string' ? req.body.source.trim().slice(0, 80) : 'Customer Sign Up';
  const customers = readJsonFile<any[]>(CUSTOMERS_FILE, []);
  const nowIso = new Date().toISOString();

  const existingIndex = customers.findIndex(
    (c) =>
      String(c.email || '').toLowerCase() === check.data.email.toLowerCase() &&
      normalizePhoneDigits(c.phone) === normalizePhoneDigits(check.data.phone)
  );

  if (existingIndex >= 0) {
    const updated = {
      ...customers[existingIndex],
      fullName: check.data.fullName,
      phone: check.data.phone,
      email: check.data.email,
      whatsapp: check.data.whatsapp,
      source: sourceRaw || customers[existingIndex].source,
      status: customers[existingIndex].status || 'Active',
    };
    customers[existingIndex] = updated;
    writeJsonFile(CUSTOMERS_FILE, customers);
    const token = createCustomerToken(updated.id);
    setSignedCookie(req, res, CUSTOMER_COOKIE_NAME, token, 30 * 24 * 60 * 60);
    return res.status(200).json({ success: true, customer: updated });
  }

  const newCustomer = {
    id: `cust-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    fullName: check.data.fullName,
    phone: check.data.phone,
    email: check.data.email,
    whatsapp: check.data.whatsapp,
    source: sourceRaw,
    status: 'Active',
    createdAt: nowIso,
  };

  customers.unshift(newCustomer);
  writeJsonFile(CUSTOMERS_FILE, customers);
  const token = createCustomerToken(newCustomer.id);
  setSignedCookie(req, res, CUSTOMER_COOKIE_NAME, token, 30 * 24 * 60 * 60);
  return res.status(201).json({ success: true, customer: newCustomer });
});

app.post('/api/customers/login', (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const phoneInput = normalizePhoneDigits(req.body?.phone);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter the Email Address you registered with.' });
  }
  if (phoneInput.length < 5) {
    return res.status(400).json({ error: 'Please enter the Phone Number you registered with.' });
  }

  const customers = readJsonFile<any[]>(CUSTOMERS_FILE, []);
  const matched = customers.find((c) => {
    const storedEmail = String(c.email || '').trim().toLowerCase();
    if (storedEmail !== email) return false;
    const storedPhone = normalizePhoneDigits(c.phone);
    if (!storedPhone) return false;
    if (storedPhone === phoneInput) return true;
    // Match last 10 digits if international prefix formatting differs (e.g. 0803... vs +234803...)
    return storedPhone.length >= 9 && phoneInput.length >= 9 && storedPhone.slice(-9) === phoneInput.slice(-9);
  });

  if (!matched) {
    return res.status(404).json({
      error: 'No existing customer profile matched that Email Address and Phone Number. Please sign up below.',
    });
  }

  const token = createCustomerToken(matched.id);
  setSignedCookie(req, res, CUSTOMER_COOKIE_NAME, token, 30 * 24 * 60 * 60);
  return res.json({ success: true, customer: matched });
});

app.get('/api/customers/me', (req, res) => {
  const cookies = parseCookies(req);
  const customerId = verifyCustomerToken(cookies[CUSTOMER_COOKIE_NAME]);
  if (!customerId) {
    return res.json({ authenticated: false, customer: null });
  }
  const customers = readJsonFile<any[]>(CUSTOMERS_FILE, []);
  const found = customers.find((c) => c.id === customerId);
  if (!found) {
    clearSignedCookie(req, res, CUSTOMER_COOKIE_NAME);
    return res.json({ authenticated: false, customer: null });
  }
  return res.json({ authenticated: true, customer: found });
});

app.post('/api/customers/logout', (req, res) => {
  clearSignedCookie(req, res, CUSTOMER_COOKIE_NAME);
  return res.json({ success: true });
});

app.get('/api/customers', requireAdminAuth, (req, res) => {
  const customers = readJsonFile<any[]>(CUSTOMERS_FILE, []);
  const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  const filtered = q
    ? customers.filter((c) =>
        [c.fullName, c.phone, c.email, c.whatsapp, c.source, c.status]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q))
      )
    : customers;
  res.json({ customers: filtered });
});

app.patch('/api/customers/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const status = typeof req.body?.status === 'string' ? req.body.status.trim().slice(0, 40) : '';
  if (!status) {
    return res.status(400).json({ error: 'Valid status is required.' });
  }
  const customers = readJsonFile<any[]>(CUSTOMERS_FILE, []);
  const idx = customers.findIndex((c) => c.id === id);
  if (idx < 0) {
    return res.status(404).json({ error: 'Customer not found.' });
  }
  customers[idx] = { ...customers[idx], status };
  writeJsonFile(CUSTOMERS_FILE, customers);
  return res.json({ success: true, customer: customers[idx] });
});

app.delete('/api/customers/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const customers = readJsonFile<any[]>(CUSTOMERS_FILE, []);
  const next = customers.filter((c) => c.id !== id);
  if (next.length === customers.length) {
    return res.status(404).json({ error: 'Customer not found.' });
  }
  writeJsonFile(CUSTOMERS_FILE, next);
  return res.json({ success: true });
});

function sanitizeCsvCell(val: unknown): string {
  const str = String(val ?? '');
  const neutralized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${neutralized.replace(/"/g, '""')}"`;
}

app.get('/api/customers/export', requireAdminAuth, (req, res) => {
  const customers = readJsonFile<any[]>(CUSTOMERS_FILE, []);
  const headers = ['Full Name', 'Phone Number', 'Email Address', 'WhatsApp Number', 'Status', 'Source', 'Registered At'];
  const rows = customers.map((c) =>
    [c.fullName, c.phone, c.email, c.whatsapp, c.status || 'Active', c.source, c.createdAt].map(sanitizeCsvCell).join(',')
  );
  const csv = [headers.map(sanitizeCsvCell).join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ola-continental-customers.csv"');
  res.send(csv);
});

// =========================================================================
// CONVERSATIONAL AI ENGINE (NIGERIA & DIASPORA ALL-SECTOR CONCIERGE)
// =========================================================================
function generateWarmConversationalReply(userMsg: string, customerName?: string): string {
  const lower = userMsg.toLowerCase();
  const greetingName = customerName ? ` ${customerName}` : '';

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('good evening') || lower.includes('e kaabo')) {
    return `E kaabo${greetingName}! Warm greetings from Ola Continental Properties & Associates.

We serve private homeowners, families, business owners, and investors across Nigeria as well as Nigerians and partners in the diaspora (UK, USA, Canada, Europe, and worldwide).

How may we assist your real estate or building goals today? Whether you are seeking residential duplexes and bungalows, commercial complexes in Mushin Lagos, ongoing or finished construction services, titled residential or agricultural farmland in Ogbomoso, or campus accommodation, you have our full attention.`;
  }

  if (lower.includes('hostel') || lower.includes('student') || lower.includes('adenike') || lower.includes('lodge') || lower.includes('campus')) {
    return `Student accommodation near LAUTECH (Adenike and Under G) is one of our active investment lines alongside residential homes, commercial buildings, and farmland.

For income investors inside Nigeria or in the diaspora:
• **LAUTECH Multi-Unit Student Hostel Facility (16 self-contained rooms)** in Adenike near the campus gate, valued at ₦75,000,000 with an industrial borehole, prepaid submeters, and verified rent roll.
• Annual rental yield typically averages 13%–15% per academic session.

Would you like me to arrange an on-site inspection or a live WhatsApp video walkthrough with Engineer Samuel Aleji (+234 803 384 8107)?`;
  }

  if (lower.includes('mushin') || lower.includes('lagos') || lower.includes('commercial') || lower.includes('warehouse') || lower.includes('shop')) {
    return `Ola Continental actively manages and brokers commercial and mixed-use assets in Lagos State as well as Ogbomoso!

Our featured Lagos commercial holding is the **Mushin Commercial & Warehouse Logistics Asset** (₦48,000,000) along the Mushin Commercial Corridor, featuring:
• 6 high-footfall streetfront retail outlets
• 4 two-bedroom upper residential flats generating ongoing rental income
• Verified Lagos State registered survey and clear conveyance deed

We also offer **2 Acres of Commercial Land along the Aroje / Ilorin Expressway** (₦32,000,000) suitable for warehouses, logistics yards, or service stations. Would you like the full dossier or an inspection?`;
  }

  if (lower.includes('duplex') || lower.includes('olukoko') || lower.includes('hospital') || lower.includes('bungalow') || lower.includes('house') || lower.includes('home') || lower.includes('residential')) {
    return `We help families and executives across Nigeria and abroad acquire solid, move-in-ready residential properties as well as build custom homes from foundation to handover.

Featured Residential Listings:
1. **The Grand Olukoko Executive Duplex (4-Bedroom Detached)** behind LAUTECH Teaching Hospital — ₦68,000,000. Ensuite rooms, interlocked compound, stamped concrete driveway, and charted title.
2. **Crown View 3-Bedroom Modern Bungalow** in Under G axis — ₦42,000,000.
3. **Serviced 2-Bedroom Flat** along Olukoko Street — ₦1,800,000/year.

You can also view our completed residential works and ongoing building sites on the **Constructions** page. Which option aligns best with your plan?`;
  }

  if (lower.includes('construct') || lower.includes('build') || lower.includes('site') || lower.includes('civil') || lower.includes('renovat') || lower.includes('quote')) {
    return `Engineer Samuel Aleji leads our Civil Engineering & Building Construction division, executing projects for clients resident in Nigeria and Nigerians living outside Nigeria who need reliable remote supervision.

• **Ongoing & Turnkey Constructions:** Custom residential duplexes, modern bungalows, commercial plazas, perimeter fencing, drainage, and institutional blocks built to BS 8110 structural standards.
• **Transparent Milestone Reporting:** Clients in the diaspora and across Nigeria receive stage-by-stage bills of quantities, live site video updates, and physical inspection verifications.

Visit our **Constructions** page to inspect active building works and finished properties, or ask me for a tailored estimate for your plot!`;
  }

  if (lower.includes('farm') || lower.includes('odo-oba') || lower.includes('agriculture') || lower.includes('crop') || lower.includes('land')) {
    return `Whether you want residential building plots, commercial highway acreage, or fertile agricultural estates in Nigeria, every parcel we present undergoes strict cadastral and lineage verification.

• **5-Hectare Odo-Oba Agricultural Development Tract** — ₦18,500,000. Borders a perennial natural stream for year-round irrigation and features fertile loamy soil with verified Baale lineage documentation.
• **2 Acres Commercial Expressway Land (Aroje / Ilorin Road)** — ₦32,000,000. Ideal for warehousing, industrial use, or logistics.
• **Serviced Residential Plots** across Hospital Axis, Under G, and Takie.

Let me know your preferred location or acreage and we can guide your next step.`;
  }

  if (lower.includes('survey') || lower.includes('verify') || lower.includes('title') || lower.includes('beacon') || lower.includes('diaspora') || lower.includes('outside nigeria') || lower.includes('abroad') || lower.includes('uk') || lower.includes('us') || lower.includes('safe')) {
    return `Serving clients both inside Nigeria and in the diaspora outside Nigeria (UK, USA, Canada, Europe, and beyond) safely is central to our reputation.

Our 4-Tier Verification & Diaspora Protocol:
1. **Cadastral Survey Charting:** Every beacon coordinate is charted at the Ministry of Lands / Surveyor General’s Office (Agodi Secretariat Ibadan & Alausa Lagos) to guarantee zero government acquisition.
2. **Root-of-Title Verification:** Engineer Samuel Aleji personally verifies customary lineage and deeds before any commitment.
3. **Physical Ground & Civil Engineering Audit:** We locate every boundary beacon on site and inspect structural integrity.
4. **Live 4K WhatsApp Walkthroughs & Courier Dispatch:** Clients outside Nigeria can join Tuesday inspections live via video call, review digital scans, and receive original deeds via insured international courier.`;
  }

  if (lower.includes('fee') || lower.includes('commission') || lower.includes('price') || lower.includes('cost') || lower.includes('legal')) {
    return `We operate with complete transparency for both local Nigerian and international diaspora clients:

• **Agency Commission:** 5% of the agreed transaction value.
• **Legal Documentation & Deed Preparation:** 5% (handled by a certified NBA Solicitor).
• **Cadastral Survey Charting:** Official government/surveyor registry charges depending on parcel acreage and corridor.

There are no hidden fees for Tuesday site inspections or initial guidance.`;
  }

  if (lower.includes('tuesday') || lower.includes('inspection') || lower.includes('viewing') || lower.includes('visit') || lower.includes('appointment')) {
    return `Every Tuesday is our dedicated **Field Inspection & Construction Walkthrough Day**!

On Tuesdays, Engineer Samuel Aleji and our survey/engineering team host physical tours in Nigeria as well as live 4K WhatsApp video inspections for clients outside Nigeria across Ogbomoso and Lagos corridors.

You can use **Schedule Viewing** in the top bar anytime or reach Engineer Samuel Aleji directly on WhatsApp at **+234 803 384 8107**.`;
  }

  return `Thank you${greetingName} for consulting with Ola Continental Properties & Associates (RC: 203356 · CAC BN: 3189204).

We serve homeowners, businesses, and investors both across Nigeria and outside Nigeria in the diaspora across our core website divisions:
• **Residential Homes & Executive Duplexes** (Hospital Axis, Under G & custom estates)
• **Civil Construction & Finished Properties** (Custom builds & completed developments)
• **Lagos & Highway Commercial Real Estate** (Mushin retail/warehouses & Aroje corridor)
• **Verified Land & Farmland Estates** (Odo-Oba stream-fed tracts & surveyed plots)
• **Campus Rental Investments** (LAUTECH Adenike multi-unit hostels)

Tell me which property type, construction service, or corridor you would like to explore, or reach Engineer Samuel Aleji directly on WhatsApp at **+234 803 384 8107**.`;
}

// AI Assistant Chat Proxy (Requires registered customer profile)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, customerProfile } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    let activeCustomerProfile = customerProfile;
    if (!activeCustomerProfile) {
      const cookies = parseCookies(req);
      const cid = verifyCustomerToken(cookies[CUSTOMER_COOKIE_NAME]);
      if (cid) {
        const customers = readJsonFile<any[]>(CUSTOMERS_FILE, []);
        activeCustomerProfile = customers.find((c) => c.id === cid) || null;
      }
    }

    const customerCheck = validateCustomerFields(activeCustomerProfile);
    if (customerCheck.valid === false) {
      return res.status(403).json({
        error: 'Please complete the Customer Sign-Up form (Full Name, Phone, Email, and WhatsApp Number) before consulting Ola AI.',
      });
    }
    const customer = customerCheck.data;

    const systemInstruction = `You are Ola AI Concierge, the warm, knowledgeable, and transparent real estate and construction consultant for Ola Continental Properties & Associates (RC: 203356 · CAC BN: 3189204).
Headquarters: No. 2, Olukoko Street, Behind LAUTECH Teaching Hospital, Ogbomoso, Oyo State, Nigeria.
Principal Consultant & Civil Engineer: Engineer Samuel Aleji (+234 803 384 8107).

Active Signed-In Client Context:
- Full Name: ${customer.fullName}
- Phone: ${customer.phone}
- Email: ${customer.email}
- WhatsApp: ${customer.whatsapp}
Address ${customer.fullName} warmly by name when helpful, and tailor your answers specifically to what they need on the website.

Crucial Positioning Rules:
- Ola Continental is NOT solely for student housing. Explicitly welcome and serve ALL clients BOTH inside Nigeria (Ogbomoso, Lagos, Ibadan, Abuja, nationwide) AND outside Nigeria in the diaspora (UK, USA, Canada, Europe, Middle East, and worldwide).
- Cover the full spectrum of offerings equally:
  1. Residential homes, executive duplexes (e.g., Grand Olukoko 4-Bed Executive Duplex at ₦68M), modern bungalows (Crown View 3-Bed Bungalow at ₦42M), and serviced apartments.
  2. Commercial real estate & logistics hubs (e.g., Mushin Commercial & Warehouse Logistics Asset in Lagos at ₦48M, Aroje Expressway 2 Acres Commercial Land at ₦32M).
  3. Turnkey Civil Engineering & Building Construction (ongoing construction projects and finished properties on the Constructions page — custom home builds, structural oversight, remote diaspora milestone reporting).
  4. Verified Land & Agricultural Farmland (e.g., Odo-Oba 5-Hectare Perennial Stream Farmland at ₦18.5M, titled residential/industrial plots).
  5. High-yield Campus Investments (e.g., LAUTECH 16-Unit Student Hostel in Adenike at ₦75M) when asked about hostel ROI.
- Emphasize our 4-Tier Verification Protocol: Oyo State / Lagos State cadastral survey charting, zero government acquisition, physical beacon verification, root-of-title checks, and live 4K WhatsApp video inspections for diaspora buyers outside Nigeria.
- Transparent Fee Breakdown: 5% agency commission + 5% NBA solicitor deed preparation + official cadastral charting charges.
- Website Sections You Can Guide Clients To: Verified Properties, Constructions (Ongoing & Finished), Operating Corridors, Verification & Due Diligence, Blogs, and Schedule Viewing (Tuesday field tour day or diaspora video walkthrough).
- Do NOT repeatedly mention any year of establishment in greetings. Maintain a respectful, accurate, zero-hype tone.`;

    if (ai) {
      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro'];
      let modelSuccess = false;
      let modelReply = '';

      for (const modelName of modelsToTry) {
        try {
          const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

          if (Array.isArray(history)) {
            for (const item of history.slice(-6)) {
              if (item.sender === 'user') {
                contents.push({ role: 'user', parts: [{ text: item.text }] });
              } else if (item.sender === 'assistant' || item.sender === 'bot') {
                contents.push({ role: 'model', parts: [{ text: item.text }] });
              }
            }
          }

          contents.push({ role: 'user', parts: [{ text: message }] });

          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          if (response.text) {
            modelReply = response.text;
            modelSuccess = true;
            break;
          }
        } catch {
          continue;
        }
      }

      if (modelSuccess && modelReply) {
        return res.json({ reply: modelReply, source: 'gemini' });
      }
    }

    const warmReply = generateWarmConversationalReply(message, customer.fullName);
    return res.json({ reply: warmReply, source: 'conversational-engine' });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    const warmReply = generateWarmConversationalReply(req.body?.message || 'hello', req.body?.customerProfile?.fullName);
    return res.json({ reply: warmReply, source: 'conversational-engine' });
  }
});

// Leads API (Protected read/edit/delete for owner admin; public create for client inquiries)
app.get('/api/leads', requireAdminAuth, (req, res) => {
  const leads = readJsonFile<any[]>(LEADS_FILE, []);
  res.json({ leads });
});

app.post('/api/leads', async (req, res) => {
  const { name, phone, email, purpose, propertyType, corridor, budget, message, source } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required' });
  }

  const leads = readJsonFile<any[]>(LEADS_FILE, []);
  const newLead = {
    id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name,
    phone,
    email: email || '',
    purpose: purpose || 'Buy',
    propertyType: propertyType || 'Any',
    corridor: corridor || 'Ogbomoso',
    budget: budget || '',
    message: message || '',
    source: source || 'Ola AI Assistant',
    createdAt: new Date().toISOString(),
    status: 'New Inquiry',
  };

  leads.unshift(newLead);
  writeJsonFile(LEADS_FILE, leads);

  res.status(201).json({
    success: true,
    lead: newLead,
  });
});

app.patch('/api/leads/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const status = typeof req.body?.status === 'string' ? req.body.status.trim().slice(0, 40) : '';
  if (!status) return res.status(400).json({ error: 'Status is required.' });
  const leads = readJsonFile<any[]>(LEADS_FILE, []);
  const idx = leads.findIndex((l) => l.id === id);
  if (idx < 0) return res.status(404).json({ error: 'Lead not found.' });
  leads[idx] = { ...leads[idx], status };
  writeJsonFile(LEADS_FILE, leads);
  res.json({ success: true, lead: leads[idx] });
});

app.delete('/api/leads/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const leads = readJsonFile<any[]>(LEADS_FILE, []);
  const next = leads.filter((l) => l.id !== id);
  if (next.length === leads.length) return res.status(404).json({ error: 'Lead not found.' });
  writeJsonFile(LEADS_FILE, next);
  res.json({ success: true });
});

// Viewing Appointments API (Protected read/edit/delete for owner admin)
app.get('/api/viewings', requireAdminAuth, (req, res) => {
  const viewings = readJsonFile<any[]>(VIEWINGS_FILE, []);
  res.json({ viewings });
});

app.post('/api/viewings', (req, res) => {
  const { propertyId, propertyTitle, clientName, phone, email, preferredDate, inspectionType, notes } = req.body;
  if (!clientName || !phone || !preferredDate) {
    return res.status(400).json({ error: 'Client name, phone, and preferred date are required' });
  }

  const viewings = readJsonFile<any[]>(VIEWINGS_FILE, []);
  const newViewing = {
    id: `view-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    propertyId: propertyId || 'general',
    propertyTitle: propertyTitle || 'General Property Consultation',
    clientName,
    phone,
    email: email || '',
    preferredDate,
    inspectionType: inspectionType || 'Physical On-Site (Tuesday / Scheduled)',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    status: 'Confirmed',
  };

  viewings.unshift(newViewing);
  writeJsonFile(VIEWINGS_FILE, viewings);

  res.status(201).json({ success: true, viewing: newViewing });
});

app.patch('/api/viewings/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const status = typeof req.body?.status === 'string' ? req.body.status.trim().slice(0, 40) : '';
  if (!status) return res.status(400).json({ error: 'Status is required.' });
  const viewings = readJsonFile<any[]>(VIEWINGS_FILE, []);
  const idx = viewings.findIndex((v) => v.id === id);
  if (idx < 0) return res.status(404).json({ error: 'Viewing appointment not found.' });
  viewings[idx] = { ...viewings[idx], status };
  writeJsonFile(VIEWINGS_FILE, viewings);
  res.json({ success: true, viewing: viewings[idx] });
});

app.delete('/api/viewings/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const viewings = readJsonFile<any[]>(VIEWINGS_FILE, []);
  const next = viewings.filter((v) => v.id !== id);
  if (next.length === viewings.length) return res.status(404).json({ error: 'Viewing appointment not found.' });
  writeJsonFile(VIEWINGS_FILE, next);
  res.json({ success: true });
});

// Reviews API
app.get('/api/reviews', (req, res) => {
  const reviews = readJsonFile<any[]>(REVIEWS_FILE, initialReviews);
  res.json({ reviews });
});

app.post('/api/reviews', (req, res) => {
  const { propertyId, clientName, rating, inspectionDate, comment } = req.body;
  if (!clientName || !rating || !comment) {
    return res.status(400).json({ error: 'Client name, rating, and comment are required' });
  }

  const reviews = readJsonFile<any[]>(REVIEWS_FILE, initialReviews);
  const newReview = {
    id: `rev-${Date.now()}`,
    propertyId: propertyId || 'general',
    clientName,
    rating: Number(rating) || 5,
    inspectionDate: inspectionDate || 'Recent Inspection',
    comment,
    verified: true,
  };

  reviews.unshift(newReview);
  writeJsonFile(REVIEWS_FILE, reviews);

  res.status(201).json({ success: true, review: newReview });
});

app.delete('/api/reviews/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const reviews = readJsonFile<any[]>(REVIEWS_FILE, initialReviews);
  const next = reviews.filter((r) => r.id !== id);
  if (next.length === reviews.length) return res.status(404).json({ error: 'Review not found.' });
  writeJsonFile(REVIEWS_FILE, next);
  res.json({ success: true });
});

// Blogs API (Read, Publish & Delete Editorial Insights)
app.get('/api/blogs', (req, res) => {
  const blogs = readJsonFile<any[]>(BLOGS_FILE, []);
  res.json({ blogs });
});

app.post('/api/blogs', requireAdminAuth, (req, res) => {
  const {
    id,
    title,
    excerpt,
    content,
    category = 'Market Intelligence',
    author = 'Engr. Samuel Aleji',
    authorRole = 'Principal Consultant & Civil Engineer',
    corridorTag = 'Ogbomoso & Lagos',
    coverImage = '/assets/aistudio/IMG-20261031-WA0089_fc7755dc.jpg',
    tags = [],
  } = req.body;

  if (!title || !excerpt || !content) {
    return res.status(400).json({ error: 'Title, excerpt, and article content are required' });
  }

  const contentArray = Array.isArray(content)
    ? content
    : String(content)
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

  const wordCount = contentArray.join(' ').split(/\s+/).length;
  const readMinutes = Math.max(2, Math.ceil(wordCount / 180));

  const blogs = readJsonFile<any[]>(BLOGS_FILE, []);
  const newBlog = {
    id: typeof id === 'string' && id.trim() ? id.trim() : `blog-${Date.now()}`,
    title: String(title).trim(),
    excerpt: String(excerpt).trim(),
    content: contentArray,
    category,
    author,
    authorRole,
    publishedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    readTime: `${readMinutes} min read`,
    coverImage,
    corridorTag,
    featured: false,
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString(),
  };

  blogs.unshift(newBlog);
  writeJsonFile(BLOGS_FILE, blogs);

  res.status(201).json({ success: true, blog: newBlog });
});

app.delete('/api/blogs/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const blogs = readJsonFile<any[]>(BLOGS_FILE, []);
  const next = blogs.filter((b) => b.id !== id);
  if (next.length === blogs.length) return res.status(404).json({ error: 'Blog article not found.' });
  writeJsonFile(BLOGS_FILE, next);
  res.json({ success: true });
});

// Contacts API (Protected read/edit/delete for owner admin)
app.get('/api/contacts', requireAdminAuth, (req, res) => {
  const contacts = readJsonFile<any[]>(CONTACTS_FILE, []);
  res.json({ contacts });
});

app.post('/api/contacts', (req, res) => {
  const { name, phone, email, serviceType, corridor, budget, message } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const contacts = readJsonFile<any[]>(CONTACTS_FILE, []);
  const newContact = {
    id: `contact-${Date.now()}`,
    name,
    phone,
    email: email || '',
    serviceType: serviceType || 'General Inquiry',
    corridor: corridor || 'Ogbomoso / Lagos',
    budget: budget || 'On Request',
    message: message || '',
    createdAt: new Date().toISOString(),
    status: 'Pending Review',
  };

  contacts.unshift(newContact);
  writeJsonFile(CONTACTS_FILE, contacts);

  res.status(201).json({ success: true, contact: newContact });
});

app.patch('/api/contacts/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const status = typeof req.body?.status === 'string' ? req.body.status.trim().slice(0, 40) : '';
  if (!status) return res.status(400).json({ error: 'Status is required.' });
  const contacts = readJsonFile<any[]>(CONTACTS_FILE, []);
  const idx = contacts.findIndex((c) => c.id === id);
  if (idx < 0) return res.status(404).json({ error: 'Contact inquiry not found.' });
  contacts[idx] = { ...contacts[idx], status };
  writeJsonFile(CONTACTS_FILE, contacts);
  res.json({ success: true, contact: contacts[idx] });
});

app.delete('/api/contacts/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const contacts = readJsonFile<any[]>(CONTACTS_FILE, []);
  const next = contacts.filter((c) => c.id !== id);
  if (next.length === contacts.length) return res.status(404).json({ error: 'Contact inquiry not found.' });
  writeJsonFile(CONTACTS_FILE, next);
  res.json({ success: true });
});

// =========================================================================
// DYNAMIC PROPERTIES & CONSTRUCTIONS MANAGEMENT API (Non-Static Live Site)
// =========================================================================
app.get('/api/properties', (req, res) => {
  const properties = readJsonFile<any[]>(PROPERTIES_FILE, []);
  res.json({ properties });
});

app.post('/api/properties', requireAdminAuth, (req, res) => {
  const body = req.body || {};
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const priceDisplay = typeof body.priceDisplay === 'string' ? body.priceDisplay.trim() : '';
  const corridor = typeof body.corridor === 'string' ? body.corridor.trim() : '';
  if (title.length < 2 || !priceDisplay || !corridor) {
    return res.status(400).json({ error: 'Title, price display, and corridor are required.' });
  }

  const numericPrice = Number(body.price) || Number(priceDisplay.replace(/[^0-9]/g, '')) || 0;
  const properties = readJsonFile<any[]>(PROPERTIES_FILE, []);
  const id =
    typeof body.id === 'string' && body.id.trim()
      ? body.id.trim().replace(/[^a-zA-Z0-9_-]/g, '')
      : `prop-${Date.now()}`;

  const defaultImg =
    typeof body.featuredImage === 'string' && body.featuredImage.trim()
      ? body.featuredImage.trim()
      : '/assets/aistudio/IMG-20261031-WA0095_6a943e17.jpg';

  const newProperty = {
    id,
    title,
    shortDescription: typeof body.shortDescription === 'string' && body.shortDescription.trim()
      ? body.shortDescription.trim()
      : `${title} verified by Engineer Samuel Aleji in ${corridor}.`,
    fullDescription: typeof body.fullDescription === 'string' && body.fullDescription.trim()
      ? body.fullDescription.trim()
      : `${title} located in ${corridor}, fully verified with cadastral survey coordinates and transparent root-of-title checks.`,
    purpose: body.purpose || 'Buy',
    type: body.type || 'House',
    corridor,
    address: typeof body.address === 'string' && body.address.trim() ? body.address.trim() : corridor,
    price: numericPrice,
    priceDisplay,
    landSize: typeof body.landSize === 'string' && body.landSize.trim() ? body.landSize.trim() : '650 sqm',
    titleType: typeof body.titleType === 'string' && body.titleType.trim() ? body.titleType.trim() : 'Registered Survey & Deed of Assignment',
    beaconCoordinates: typeof body.beaconCoordinates === 'string' && body.beaconCoordinates.trim() ? body.beaconCoordinates.trim() : 'Verified On-Site Beacon',
    images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [defaultImg],
    featuredImage: defaultImg,
    amenities: Array.isArray(body.amenities) && body.amenities.length > 0
      ? body.amenities
      : ['Cadastral Survey Charted', 'Root-of-Title Verified', 'Tuesday Physical & Video Tour'],
    dueDiligenceNotes: Array.isArray(body.dueDiligenceNotes) && body.dueDiligenceNotes.length > 0
      ? body.dueDiligenceNotes
      : ['Verified free of government acquisition by Engineer Samuel Aleji.'],
    legalFeeEstimated: Math.round(numericPrice * 0.05),
    agencyFee: Math.round(numericPrice * 0.05),
    cadastralChartingEstimated: 250000,
    status: body.status || 'Available',
    inspectionSchedule: 'Tuesdays (Dedicated Field Day) & By Appointment',
    suitableFor: Array.isArray(body.suitableFor) && body.suitableFor.length > 0
      ? body.suitableFor
      : ['Buyers in Nigeria', 'Diaspora Investors Outside Nigeria'],
  };

  const idx = properties.findIndex((p) => p.id === id);
  if (idx >= 0) {
    properties[idx] = { ...properties[idx], ...newProperty };
  } else {
    properties.unshift(newProperty);
  }
  writeJsonFile(PROPERTIES_FILE, properties);
  res.status(201).json({ success: true, property: newProperty });
});

app.patch('/api/properties/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const status = typeof req.body?.status === 'string' ? req.body.status.trim() : '';
  const priceDisplay = typeof req.body?.priceDisplay === 'string' ? req.body.priceDisplay.trim() : '';
  const properties = readJsonFile<any[]>(PROPERTIES_FILE, []);
  const idx = properties.findIndex((p) => p.id === id);

  if (idx >= 0) {
    if (status) properties[idx].status = status;
    if (priceDisplay) properties[idx].priceDisplay = priceDisplay;
    properties[idx].updatedAt = new Date().toISOString();
    writeJsonFile(PROPERTIES_FILE, properties);
    return res.json({ success: true, property: properties[idx] });
  }

  // Record a status/price override for a built-in seed property
  const overrideRecord: any = {
    id,
    isOverride: true,
    updatedAt: new Date().toISOString(),
  };
  if (status) overrideRecord.status = status;
  if (priceDisplay) overrideRecord.priceDisplay = priceDisplay;
  properties.unshift(overrideRecord);
  writeJsonFile(PROPERTIES_FILE, properties);
  return res.json({ success: true, property: overrideRecord });
});

app.delete('/api/properties/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const properties = readJsonFile<any[]>(PROPERTIES_FILE, []);
  const next = properties.filter((p) => p.id !== id);
  writeJsonFile(PROPERTIES_FILE, next);
  res.json({ success: true });
});

app.get('/api/constructions', (req, res) => {
  const constructions = readJsonFile<any[]>(CONSTRUCTIONS_FILE, []);
  res.json({ constructions });
});

app.post('/api/constructions', requireAdminAuth, (req, res) => {
  const body = req.body || {};
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const location = typeof body.location === 'string' ? body.location.trim() : '';
  if (title.length < 2 || location.length < 2) {
    return res.status(400).json({ error: 'Project title and location are required.' });
  }

  const category = body.category === 'finished' ? 'finished' : 'ongoing';
  const constructions = readJsonFile<any[]>(CONSTRUCTIONS_FILE, []);
  const newProject = {
    id: typeof body.id === 'string' && body.id.trim()
      ? body.id.trim().replace(/[^a-zA-Z0-9_-]/g, '')
      : `proj-${Date.now()}`,
    title,
    category,
    location,
    phaseOrType: typeof body.phaseOrType === 'string' && body.phaseOrType.trim()
      ? body.phaseOrType.trim()
      : category === 'finished' ? 'Completed Turnkey Delivery' : 'Active Structural Works',
    specs: typeof body.specs === 'string' && body.specs.trim()
      ? body.specs.trim()
      : 'BS 8110 Structural Engineering Standard',
    completionLabel: typeof body.completionLabel === 'string' && body.completionLabel.trim()
      ? body.completionLabel.trim()
      : category === 'finished' ? '100%' : '50%',
    image: typeof body.image === 'string' && body.image.trim()
      ? body.image.trim()
      : '/assets/aistudio/IMG-20261031-WA0089_fc7755dc.jpg',
    description: typeof body.description === 'string' && body.description.trim()
      ? body.description.trim()
      : `${title} in ${location} under direct civil engineering supervision by Engineer Samuel Aleji.`,
    createdAt: new Date().toISOString(),
  };

  constructions.unshift(newProject);
  writeJsonFile(CONSTRUCTIONS_FILE, constructions);
  res.status(201).json({ success: true, construction: newProject });
});

app.patch('/api/constructions/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const constructions = readJsonFile<any[]>(CONSTRUCTIONS_FILE, []);
  const idx = constructions.findIndex((c) => c.id === id);
  if (idx < 0) return res.status(404).json({ error: 'Construction project not found.' });
  const body = req.body || {};
  if (body.category === 'ongoing' || body.category === 'finished') {
    constructions[idx].category = body.category;
  }
  if (typeof body.completionLabel === 'string' && body.completionLabel.trim()) {
    constructions[idx].completionLabel = body.completionLabel.trim();
  }
  if (typeof body.phaseOrType === 'string' && body.phaseOrType.trim()) {
    constructions[idx].phaseOrType = body.phaseOrType.trim();
  }
  writeJsonFile(CONSTRUCTIONS_FILE, constructions);
  res.json({ success: true, construction: constructions[idx] });
});

app.delete('/api/constructions/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const constructions = readJsonFile<any[]>(CONSTRUCTIONS_FILE, []);
  const next = constructions.filter((c) => c.id !== id);
  if (next.length === constructions.length) {
    return res.status(404).json({ error: 'Construction project not found.' });
  }
  writeJsonFile(CONSTRUCTIONS_FILE, next);
  res.json({ success: true });
});

// Hero Video Upload & Persistence API
app.get('/api/hero-video', (req, res) => {
  const meta = readJsonFile<{ videoUrl: string | null; fileName?: string; updatedAt?: string }>(
    HERO_VIDEO_FILE,
    { videoUrl: null }
  );

  if (meta.videoUrl && meta.videoUrl.startsWith('/uploads/')) {
    const filename = path.basename(meta.videoUrl);
    if (!fs.existsSync(path.join(UPLOADS_DIR, filename))) {
      return res.json({ videoUrl: null });
    }
  }

  res.json(meta);
});

app.post(
  '/api/hero-video',
  express.raw({ type: ['video/*', 'application/octet-stream'], limit: '250mb' }),
  (req, res) => {
    try {
      const buffer = req.body as Buffer;
      if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
        return res.status(400).json({ error: 'Valid video file payload is required' });
      }

      const rawName = String(req.headers['x-file-name'] || 'showcase-video.mp4');
      const safeBaseName = path.basename(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
      const extMatch = safeBaseName.match(/\.(mp4|webm|mov|m4v|ogg)$/i);
      const ext = extMatch ? extMatch[0].toLowerCase() : '.mp4';

      // Clean up previous uploaded video files to keep disk usage compact
      const prevMeta = readJsonFile<{ videoUrl?: string | null }>(HERO_VIDEO_FILE, {});
      if (prevMeta.videoUrl && prevMeta.videoUrl.startsWith('/uploads/')) {
        const oldPath = path.join(UPLOADS_DIR, path.basename(prevMeta.videoUrl));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const savedFilename = `hero-video-${Date.now()}${ext}`;
      const targetPath = path.join(UPLOADS_DIR, savedFilename);
      fs.writeFileSync(targetPath, buffer);

      const newMeta = {
        videoUrl: `/uploads/${savedFilename}`,
        fileName: safeBaseName,
        updatedAt: new Date().toISOString(),
      };
      writeJsonFile(HERO_VIDEO_FILE, newMeta);

      return res.status(201).json({ success: true, ...newMeta });
    } catch (err) {
      console.error('Error uploading hero video:', err);
      return res.status(500).json({ error: 'Failed to store uploaded video' });
    }
  }
);

app.delete('/api/hero-video', (req, res) => {
  try {
    const prevMeta = readJsonFile<{ videoUrl?: string | null }>(HERO_VIDEO_FILE, {});
    if (prevMeta.videoUrl && prevMeta.videoUrl.startsWith('/uploads/')) {
      const oldPath = path.join(UPLOADS_DIR, path.basename(prevMeta.videoUrl));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    writeJsonFile(HERO_VIDEO_FILE, { videoUrl: null });
    res.json({ success: true, videoUrl: null });
  } catch (err) {
    console.error('Error resetting hero video:', err);
    res.status(500).json({ error: 'Failed to reset video' });
  }
});

// Vite middleware integration in development, static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ola Continental Server running on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer();

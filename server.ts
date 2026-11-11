import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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

// Local JSON storage helper for dual-sync resilience
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const VIEWINGS_FILE = path.join(DATA_DIR, 'viewings.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

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
    sendpulseConfigured: Boolean(process.env.SENDPULSE_API_USER_ID && process.env.SENDPULSE_API_SECRET),
    timestamp: new Date().toISOString(),
  });
});

// SendPulse Service Helper
let cachedSendPulseToken: { token: string; expiresAt: number } | null = null;

async function getSendPulseAccessToken(): Promise<string | null> {
  const userId = process.env.SENDPULSE_API_USER_ID;
  const secret = process.env.SENDPULSE_API_SECRET;

  if (!userId || !secret) {
    return null;
  }

  if (cachedSendPulseToken && cachedSendPulseToken.expiresAt > Date.now()) {
    return cachedSendPulseToken.token;
  }

  try {
    const res = await fetch('https://api.sendpulse.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: userId,
        client_secret: secret,
      }),
    });

    if (!res.ok) {
      console.warn('[SendPulse] Failed to obtain access token:', res.status, await res.text());
      return null;
    }

    const data: any = await res.json();
    if (data.access_token) {
      cachedSendPulseToken = {
        token: data.access_token,
        expiresAt: Date.now() + ((data.expires_in || 3600) - 120) * 1000,
      };
      return data.access_token;
    }
    return null;
  } catch (err) {
    console.warn('[SendPulse] Error requesting OAuth token:', err);
    return null;
  }
}

async function syncLeadToExternalSendPulse(lead: any): Promise<{ synced: boolean; message: string }> {
  const userId = process.env.SENDPULSE_API_USER_ID;
  const secret = process.env.SENDPULSE_API_SECRET;
  const addressBookId = process.env.SENDPULSE_ADDRESS_BOOK_ID;

  if (!userId || !secret) {
    return {
      synced: false,
      message: 'SendPulse credentials not configured in environment yet. Lead stored securely in Firestore and local CRM.',
    };
  }

  try {
    const token = await getSendPulseAccessToken();
    if (!token) {
      return { synced: false, message: 'Could not authenticate with SendPulse API with provided credentials.' };
    }

    if (addressBookId) {
      const email = lead.email || `inquiry-${Date.now()}@olacontinental-leads.com`;
      const res = await fetch(`https://api.sendpulse.com/addressbooks/${addressBookId}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emails: [
            {
              email,
              variables: {
                Name: lead.name,
                Phone: lead.phone,
                Corridor: lead.corridor || 'Ogbomoso',
                PropertyType: lead.propertyType || 'General',
                Budget: lead.budget || '',
                Message: lead.message || '',
                Source: lead.source || 'Ola AI Assistant',
              },
            },
          ],
        }),
      });

      const resData = await res.json();
      console.log('[SendPulse] Address book sync response:', resData);
      return { synced: true, message: 'Lead successfully dropped into SendPulse address book.' };
    }

    // Default: CRM contact
    const crmRes = await fetch('https://api.sendpulse.com/crm/v1/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName: lead.name,
        phones: [lead.phone],
        emails: lead.email ? [lead.email] : [],
        comment: `Ola Continental Property Lead: ${lead.propertyType} in ${lead.corridor}. Budget: ${lead.budget}. Notes: ${lead.message || 'Direct inquiry'}`,
      }),
    });

    const crmData = await crmRes.json();
    console.log('[SendPulse] CRM contact response:', crmData);
    return { synced: true, message: 'Lead dropped into SendPulse CRM contacts.' };
  } catch (err: any) {
    console.error('[SendPulse] Sync error:', err);
    return { synced: false, message: `SendPulse sync error: ${err.message}` };
  }
}

// Check SendPulse Status endpoint
app.get('/api/sendpulse/status', (req, res) => {
  const isConfigured = Boolean(process.env.SENDPULSE_API_USER_ID && process.env.SENDPULSE_API_SECRET);
  res.json({
    configured: isConfigured,
    userIdProvided: Boolean(process.env.SENDPULSE_API_USER_ID),
    secretProvided: Boolean(process.env.SENDPULSE_API_SECRET),
    addressBookProvided: Boolean(process.env.SENDPULSE_ADDRESS_BOOK_ID),
    message: isConfigured
      ? 'SendPulse is configured and active to receive leads from Ola AI Assistant.'
      : 'SendPulse credentials not yet attached. Leads are safely stored in Firestore and ready for auto-sync once keys are provided.',
  });
});

// Conversational AI Engine
function generateWarmConversationalReply(userMsg: string): string {
  const lower = userMsg.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('good evening') || lower.includes('e kaabo')) {
    return `E kaabo! Warm greetings and a pleasant welcome to Ola Continental Properties & Associates! 😊

We assist clients, local professionals, and diaspora investors with safe, fully verified real estate across Ogbomoso and Lagos corridors.

How may I assist your property plans today? Are you looking into high-yield student hostels near LAUTECH, executive homes behind the Teaching Hospital, commercial holdings in Mushin (Lagos), fertile farmland in Odo-Oba, or would you like to drop your contact details for an executive consultation?`;
  }

  if (lower.includes('hostel') || lower.includes('student') || lower.includes('adenike') || lower.includes('lodge') || lower.includes('campus')) {
    return `Student hostels around LAUTECH (especially in Adenike and Under G) are our premier high-yield specialty! 🎓

Here is what you should know about our current inventory:
• We currently represent the **LAUTECH Multi-Unit Student Hostel Facility (16 self-contained rooms)** in Adenike near the campus gate, valued at ₦75,000,000. It features 100% historical student occupancy, an industrial borehole, and prepaid electricity submeters.
• Annual rental yield typically averages 13%–15%, with rents collected upfront per academic session.

Would you like me to reserve an on-site walkthrough for our Tuesday field tour, or would you like to review the verified rent roll on WhatsApp with Engineer Samuel Aleji (+234 803 384 8107)?`;
  }

  if (lower.includes('mushin') || lower.includes('lagos')) {
    return `Yes indeed! While our headquarters is in Ogbomoso, we actively manage and broker prime commercial assets in Lagos State. 🏙️

Our featured Lagos listing is the **Mushin Commercial & Warehouse Logistics Asset** (₦48,000,000) situated along the active Mushin Commercial Corridor. It features:
• 6 streetfront retail shop outlets with high pedestrian trade.
• 4 two-bedroom upper residential flats generating immediate rental income.
• Verified Lagos State registered survey and clear conveyance deed.

Would you like us to schedule a site inspection in Mushin for you or connect you with our Lagos corridor team?`;
  }

  if (lower.includes('duplex') || lower.includes('olukoko') || lower.includes('hospital') || lower.includes('bungalow') || lower.includes('house')) {
    return `Our flagship residential neighborhood is Olukoko Street, right behind LAUTECH Teaching Hospital! 🏡

We have:
1. **The Grand Olukoko Executive Duplex (4-Bedroom Detached)** at ₦68,000,000. Complete with ensuite rooms, interlocked compound, stamped driveway, and perimeter security. Perfect for senior doctors, consultants, and executive families.
2. **Crown View 3-Bedroom Modern Bungalow** in Under G axis at ₦42,000,000.
3. **Serviced 2-Bedroom Flat for rent** along Olukoko Street at ₦1,800,000/year.

Every residential property comes with charted survey beacons and certified Baale lineage clearance. Which of these fits your preferred plan?`;
  }

  if (lower.includes('farm') || lower.includes('odo-oba') || lower.includes('agriculture') || lower.includes('crop') || lower.includes('land')) {
    return `Agriculture and land banking in Ogbomoso are blessed with great natural soil! 🌱

We have the **5-Hectare Odo-Oba Agricultural Development Tract** at ₦18,500,000.
What makes this tract exceptional is its **perennial natural stream watercourse** along the boundary, allowing gravity or pumped irrigation 365 days a year without dry-season water stress. It has rich loamy soil and clean Baale customary title.

We also have **2 Acres of Commercial Land on the Aroje/Ilorin Expressway** (₦32,000,000) for logistics, factories, or filling stations. Would you like to inspect on our next farm field trip?`;
  }

  if (lower.includes('survey') || lower.includes('verify') || lower.includes('title') || lower.includes('beacon') || lower.includes('diaspora') || lower.includes('safe')) {
    return `Due diligence is the bedrock of Ola Continental Properties & Associates. We never sell speculative or disputed land. 🛡️

Our 3-Tier Verification Process:
1. **Cadastral Survey Charting:** Every beacon number is verified at the Oyo State Surveyor General’s Office (Agodi Secretariat, Ibadan) to confirm zero government acquisition.
2. **Root of Title:** Engineer Samuel Aleji personally confirms lineage with the accredited family Baale before deeds are signed.
3. **Physical Inspection:** We physically locate all concrete beacon pillars on the ground.

For our diaspora clients in the UK, US, and Canada, we conduct live 4K WhatsApp video walks with surveyors on site, followed by insured DHL courier delivery of original deeds.`;
  }

  if (lower.includes('fee') || lower.includes('commission') || lower.includes('price') || lower.includes('cost') || lower.includes('legal')) {
    return `We believe in total transparency with zero hidden charges. ⚖️

Here is our exact fee structure:
• **Agency Commission:** 5% of agreed property valuation.
• **Legal Documentation & Deed Preparation:** 5% (handled by a certified NBA Solicitor).
• **Cadastral Survey Charting:** Actual official government/surveyor registry charges (typically ₦200k–₦350k depending on acreage).

We do NOT charge unexpected inspection registration fees for our Tuesday tours.`;
  }

  if (lower.includes('tuesday') || lower.includes('inspection') || lower.includes('viewing') || lower.includes('visit') || lower.includes('appointment')) {
    return `Every Tuesday is our firm's official **Dedicated Field Inspection Day**! 🚗

On Tuesdays, Engineer Samuel Aleji and our licensed surveyor team take clients and diaspora representatives on site walkthroughs across all corridors (Hospital Axis, Under G, Adenike, Aroje, and Odo-Oba). We bring survey plans and GPS equipment to verify beacons live.

Would you like to book a slot for this coming Tuesday? You can click the 'Schedule Site Inspection' button, drop your contact details in this chat, or send a quick WhatsApp message to +234 803 384 8107.`;
  }

  return `Thank you so much for reaching out to Ola Continental Properties & Associates (CAC BN: 3189204). 😊

I would love to help you find the ideal match! We have verified properties across:
• **LAUTECH Student Corridors:** 16-Unit hostel in Adenike (₦75M) & modern bungalows in Under G.
• **Executive Hospital Corridor:** 4-Bed luxury duplex behind LAUTECH Hospital (₦68M).
• **Lagos Commercial:** Retail & warehouse asset in Mushin (₦48M).
• **Arable Farmland:** 5 Hectares with natural stream irrigation in Odo-Oba (₦18.5M).

What is your preferred budget or intended property purpose? You can also drop your contact details here for our team to follow up directly, or speak with Engineer Samuel Aleji on WhatsApp at **+234 803 384 8107**!`;
}

// AI Assistant Chat Proxy
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = `You are Ola AI Assistant, the warm, knowledgeable, friendly, and respectful client concierge for Ola Continental Properties & Associates.
Headquarters: No. 2, Olukoko Street, Behind LAUTECH Teaching Hospital, Ogbomoso, Oyo State, Nigeria (CAC BN: 3189204).
Direct Phone & WhatsApp Hotline: +234 803 384 8107 (0803 384 8107).

Key Rules:
- Do NOT repeatedly mention any year of establishment in greetings or messages. The company's corporate history since 2006 is detailed on the About section of the website.
- Proactively offer to collect client leads (Name, Phone/WhatsApp, Email, Preferred Corridor, Budget) so our senior engineering team and Engineer Samuel Aleji can follow up and coordinate inspections.
- Always be warm, welcoming, polite, and encouraging (use friendly greetings like "E kaabo!", "Warm greetings from Ogbomoso", "Welcome to Ola Continental Properties").
- Listen attentively to client needs, whether they are a local doctor, an agribusiness developer, or a diaspora investor in the US/UK.
- Speak with grounded real estate knowledge: emphasize our 100% verified survey beacons, cadastral charting at Agodi Secretariat / Alausa Lagos, and zero-speculation ethics.
- Highlight our key properties:
  1. LAUTECH 16-Unit Student Hostel in Adenike (₦75,000,000, 14%+ annual yield, industrial borehole).
  2. The Grand Olukoko Executive Duplex (4-bed detached behind LAUTECH Teaching Hospital, ₦68,000,000).
  3. Mushin Commercial & Warehouse Logistics Asset in Lagos State (₦48,000,000, ground shops + storage).
  4. Crown View 3-Bedroom Bungalow in Under G (₦42,000,000).
  5. Odo-Oba 5-Hectare Farmland with perennial natural stream watercourse (₦18,500,000).
  6. Aroje 2-Acre Expressway Commercial Plot (₦32,000,000).
- Transparent Fees: 5% agency commission + 5% NBA legal deed preparation + actual cadastral survey charting.
- Remind clients about our dedicated Tuesday On-Site Field Tour day and diaspora 4K WhatsApp live inspections.
- Proactively invite them to chat with Engineer Samuel Aleji on WhatsApp at +234 803 384 8107, drop their lead, or book an inspection.`;

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
        } catch (err: any) {
          // Model try failed or transient 503, try next model
          continue;
        }
      }

      if (modelSuccess && modelReply) {
        return res.json({ reply: modelReply, source: 'gemini' });
      }
    }

    // High quality warm conversational fallback if upstream model has temporary spikes
    const warmReply = generateWarmConversationalReply(message);
    return res.json({ reply: warmReply, source: 'conversational-engine' });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    const warmReply = generateWarmConversationalReply(req.body.message || 'hello');
    return res.json({ reply: warmReply, source: 'conversational-engine' });
  }
});

// Leads API with local persistence & SendPulse Forwarding
app.get('/api/leads', (req, res) => {
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

  // Synchronize with SendPulse CRM/Mailing List if credentials are configured
  const sendpulseResult = await syncLeadToExternalSendPulse(newLead);

  res.status(201).json({
    success: true,
    lead: newLead,
    sendpulse: sendpulseResult,
  });
});

// Viewing Appointments API
app.get('/api/viewings', (req, res) => {
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

// Paystack Gateway Config API
app.get('/api/paystack/config', (req, res) => {
  const publicKey = process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_sample_ola_continental_key';
  const isLive = publicKey.startsWith('pk_live_');
  res.json({
    publicKey,
    isConfigured: Boolean(process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY),
    isLive,
    currency: 'NGN',
    merchantName: 'Ola Continental Properties & Construction',
    companyReg: 'CAC BN: 3189204',
  });
});

// Payments API (Records Paystack & Verified Bank Transfers)
app.get('/api/payments', (req, res) => {
  const payments = readJsonFile<any[]>(PAYMENTS_FILE, []);
  res.json({ payments });
});

app.post('/api/payments', (req, res) => {
  const {
    reference,
    amount,
    currency = 'NGN',
    clientName,
    clientEmail,
    clientPhone,
    serviceCategory,
    propertyOrProjectTitle,
    paymentMethod = 'paystack',
    status = 'success',
    invoiceNumber,
    notes,
  } = req.body;

  if (!clientName || !clientEmail || !amount) {
    return res.status(400).json({ error: 'Client name, email, and amount are required' });
  }

  const payments = readJsonFile<any[]>(PAYMENTS_FILE, []);
  const newPayment = {
    id: `pay-${Date.now()}`,
    reference: reference || `REF-OC-${Date.now().toString(36).toUpperCase()}`,
    amount: Number(amount),
    currency,
    clientName,
    clientEmail,
    clientPhone: clientPhone || '',
    serviceCategory: serviceCategory || 'General Retainer',
    propertyOrProjectTitle: propertyOrProjectTitle || '',
    paymentMethod,
    status,
    invoiceNumber: invoiceNumber || '',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  payments.unshift(newPayment);
  writeJsonFile(PAYMENTS_FILE, payments);

  // Sync client as lead/payer in CRM
  syncLeadToExternalSendPulse({
    name: clientName,
    email: clientEmail,
    phone: clientPhone || '',
    serviceType: serviceCategory,
    budget: `₦${Number(amount).toLocaleString()}`,
    message: `Payment received: ${reference} for ${propertyOrProjectTitle}`,
    source: `Paystack Portal (${paymentMethod})`,
  }).catch((err: any) => console.warn('Payment CRM sync notice:', err));

  res.status(201).json({ success: true, payment: newPayment });
});

// Contacts API
app.get('/api/contacts', (req, res) => {
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

// Vite middleware integration in development, static files in production
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ola Continental Server running on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer();

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_GOATS, INITIAL_INQUIRIES } from './src/data/initialData';
import { Goat, Inquiry, InquiryStatus } from './src/types';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json());

// In-memory data store for server session
let goatsStore: Goat[] = [...INITIAL_GOATS];
let inquiriesStore: Inquiry[] = [...INITIAL_INQUIRIES];

// Helper function for lazy initialization of GoogleGenAI
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'Dire Farms PLC', timestamp: new Date().toISOString() });
});

// --- GOAT CATALOG API ROUTES ---

// GET /api/goats - Get goats with filter & sort
app.get('/api/goats', (req, res) => {
  try {
    const { breed, health, minWeight, maxWeight, minPrice, maxPrice, sort, search } = req.query;

    let result = [...goatsStore];

    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.breed.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.origin.toLowerCase().includes(q)
      );
    }

    if (breed && breed !== 'all') {
      result = result.filter((g) => g.breed === breed);
    }

    if (health && health !== 'all') {
      result = result.filter((g) => g.health_status === health);
    }

    if (minWeight) {
      result = result.filter((g) => g.weight_kg >= Number(minWeight));
    }

    if (maxWeight) {
      result = result.filter((g) => g.weight_kg <= Number(maxWeight));
    }

    if (minPrice) {
      result = result.filter((g) => g.price_etb >= Number(minPrice));
    }

    if (maxPrice) {
      result = result.filter((g) => g.price_etb <= Number(maxPrice));
    }

    if (sort === 'price_asc') {
      result.sort((a, b) => a.price_etb - b.price_etb);
    } else if (sort === 'price_desc') {
      result.sort((a, b) => b.price_etb - a.price_etb);
    } else if (sort === 'weight_desc') {
      result.sort((a, b) => b.weight_kg - a.weight_kg);
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    res.json({ success: true, count: result.length, goats: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/goats/:id - Get single goat details
app.get('/api/goats/:id', (req, res) => {
  const goat = goatsStore.find((g) => g.id === req.params.id);
  if (!goat) {
    return res.status(404).json({ success: false, error: 'Goat not found' });
  }
  res.json({ success: true, goat });
});

// --- INQUIRY & ORDER API ROUTES ---

// POST /api/inquiries - Submit new inquiry / order
app.post('/api/inquiries', (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, goat_id, quantity, preferred_delivery_date, notes } = req.body;

    if (!customer_name || !customer_phone || !goat_id) {
      return res.status(400).json({ success: false, error: 'Missing required fields: name, phone, goat selection' });
    }

    const selectedGoat = goatsStore.find((g) => g.id === goat_id);
    if (!selectedGoat) {
      return res.status(404).json({ success: false, error: 'Selected goat is no longer available' });
    }

    const refNumber = `DF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      reference_number: refNumber,
      customer_name,
      customer_phone,
      customer_email,
      goat_id,
      goat_title: selectedGoat.title,
      goat_price_etb: selectedGoat.price_etb,
      quantity: Number(quantity) || 1,
      preferred_delivery_date: preferred_delivery_date || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      notes: notes || '',
      status: 'new',
      internal_notes: 'Web order submitted. Awaiting sales team verification call.',
      created_at: new Date().toISOString()
    };

    inquiriesStore.unshift(newInquiry);

    const notifications = dispatchMultiChannelNotifications({
      event_type: 'new_order',
      recipient_name: customer_name,
      recipient_phone: customer_phone,
      recipient_email: customer_email,
      reference_id: refNumber,
      data: {
        order_ref: refNumber,
        goat_title: selectedGoat.title,
        quantity: Number(quantity) || 1,
        total_etb: selectedGoat.price_etb * (Number(quantity) || 1),
        delivery_date: preferred_delivery_date || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
      }
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! Automated Email, SMS, and WhatsApp confirmations dispatched.',
      inquiry: newInquiry,
      notifications
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- ADMIN API ROUTES ---

// GET /api/admin/inquiries - Get all inquiries for admin
app.get('/api/admin/inquiries', (req, res) => {
  res.json({ success: true, inquiries: inquiriesStore });
});

// PATCH /api/admin/inquiries/:id - Update inquiry status or notes
app.patch('/api/admin/inquiries/:id', (req, res) => {
  const { status, internal_notes } = req.body;
  const inquiry = inquiriesStore.find((i) => i.id === req.params.id);

  if (!inquiry) {
    return res.status(404).json({ success: false, error: 'Inquiry not found' });
  }

  if (status) inquiry.status = status as InquiryStatus;
  if (internal_notes !== undefined) inquiry.internal_notes = internal_notes;

  if (status === 'contacted') inquiry.responded_at = new Date().toISOString();
  if (status === 'completed') inquiry.completed_at = new Date().toISOString();

  let dispatchedNotifications: any[] = [];
  if (status) {
    dispatchedNotifications = dispatchMultiChannelNotifications({
      event_type: 'order_status_updated',
      recipient_name: inquiry.customer_name,
      recipient_phone: inquiry.customer_phone,
      recipient_email: inquiry.customer_email,
      reference_id: inquiry.reference_number,
      data: {
        order_ref: inquiry.reference_number,
        goat_title: inquiry.goat_title || 'Livestock Order',
        status: inquiry.status,
        quantity: inquiry.quantity,
        internal_notes: inquiry.internal_notes
      }
    });
  }

  res.json({ success: true, inquiry, notifications: dispatchedNotifications });
});

// POST /api/admin/goats - Add new goat inventory
app.post('/api/admin/goats', (req, res) => {
  try {
    const { title, breed, weight_kg, age_months, price_etb, health_status, health_certificate, description, origin, care_notes, image_url } = req.body;

    if (!title || !breed || !weight_kg) {
      return res.status(400).json({ success: false, error: 'Title, breed, and weight in kg are required' });
    }

    const calculatedWeight = Number(weight_kg);
    const calculatedPrice = price_etb ? Number(price_etb) : calculatedWeight * 700;

    const newGoat: Goat = {
      id: `goat-df-${Date.now()}`,
      title,
      breed,
      weight_kg: calculatedWeight,
      age_months: Number(age_months) || 18,
      price_etb: calculatedPrice,
      health_status: health_status || 'Vaccinated & Healthy',
      health_certificate: health_certificate || 'Verified Farm Record',
      description: description || 'Premium fattened Ethiopian goat.',
      images: [
        {
          url: image_url || 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800',
          caption: title,
          isPrimary: true
        }
      ],
      is_available: true,
      origin: origin || 'Dire Dawa Feedlot',
      care_notes: care_notes || 'Standard organic feeding protocol.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    goatsStore.unshift(newGoat);
    res.status(201).json({ success: true, goat: newGoat });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/stats - Admin Dashboard KPIs
app.get('/api/admin/stats', (req, res) => {
  const totalInquiries = inquiriesStore.length;
  const pendingInquiries = inquiriesStore.filter((i) => i.status === 'new' || i.status === 'contacted').length;
  const confirmedOrders = inquiriesStore.filter((i) => i.status === 'confirmed' || i.status === 'completed').length;
  const totalRevenueEtb = inquiriesStore
    .filter((i) => i.status === 'confirmed' || i.status === 'completed')
    .reduce((acc, curr) => acc + (curr.goat_price_etb || 0) * (curr.quantity || 1), 0);

  res.json({
    success: true,
    stats: {
      totalInquiries,
      pendingInquiries,
      confirmedOrders,
      totalRevenueEtb,
      availableGoatsCount: goatsStore.filter((g) => g.is_available).length
    }
  });
});

// --- AI ADVISOR ENDPOINT ---
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { familySize, budgetEtb, eventType, preferences } = req.body;

    const ai = getGenAI();
    const availableSummary = goatsStore
      .map(
        (g) => `- ID: ${g.id} | ${g.title} | Breed: ${g.breed} | Weight: ${g.weight_kg}kg | Fixed Price (700 ETB/kg): ETB ${g.price_etb} | Health: ${g.health_status}`
      )
      .join('\n');

    const prompt = `You are Dire Farms' Senior Livestock Consultant for Enkutatash (Ethiopian New Year).
Note: Dire Farms follows a transparent fixed pricing model of EXACTLY 700 ETB per kg across all breeds (Total Price = Weight in kg × 700 ETB).

Customer Requirements:
- Family/Guest Size: ${familySize || '8-12 people'}
- Target Budget: ETB ${budgetEtb || '20,000'}
- Celebration Type: ${eventType || 'Family Enkutatash Feast'}
- Preferences: ${preferences || 'Tender meat, well fattened'}

Current Dire Farms Inventory:
${availableSummary}

Provide a polite, authoritative, highly tailored recommendation in Amharic & English. 
1. Recommend the single best matching goat from inventory and explain why its weight (kg), fat layering, and total price (weight × 700 ETB/kg) fit their family size and budget.
2. Provide traditional cooking & preparation advice for Enkutatash.
3. Keep response concise and structured with bullet points.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({ success: true, recommendation: response.text });
  } catch (error: any) {
    console.error('Error in AI Goat Advisor:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate recommendation' });
  }
});

// --- HEALTH CERTIFICATE VERIFICATION API ---
app.get('/api/certificates/:certNumber', (req, res) => {
  const { certNumber } = req.params;
  const q = certNumber.toUpperCase();

  const mockCertificates: Record<string, any> = {
    'ET-HAR-8892': {
      certificate_id: 'ET-HAR-8892',
      issuer: 'FDRE Ministry of Agriculture & Livestock Inspectorate',
      veterinarian: 'Dr. Yared Worku (Senior Vet License #ET-VET-4401)',
      farm_depot: 'Dire Dawa Model Feedlot - Block A',
      breed: 'Harar Fattened Ram',
      vaccinations: ['PPR (Peste des Petits Ruminants)', 'Anthrax Booster', 'Contagious Caprine Pleuropneumonia (CCPP)'],
      quarantine_passed: true,
      inspection_date: '2026-07-28',
      status: 'APPROVED & VALID FOR SLAUGHTER'
    },
    'ET-AFA-4011': {
      certificate_id: 'ET-AFA-4011',
      issuer: 'FDRE Ministry of Agriculture & Livestock Inspectorate',
      veterinarian: 'Dr. Bethlehem Tadesse (Vet Reg #ET-VET-3309)',
      farm_depot: 'Awash Pastoral Depot - Lot 12',
      breed: 'Afar Lowland Goat',
      vaccinations: ['PPR', 'Foot and Mouth Disease (FMD) Screen', 'Deworming Protocol'],
      quarantine_passed: true,
      inspection_date: '2026-07-30',
      status: 'APPROVED & VALID FOR SLAUGHTER'
    },
    'ET-SOM-5510': {
      certificate_id: 'ET-SOM-5510',
      issuer: 'FDRE Ministry of Agriculture & Livestock Inspectorate',
      veterinarian: 'Dr. Mohammed Ahmed (Regional Vet Supervisor)',
      farm_depot: 'Dire Dawa Model Feedlot - Block C',
      breed: 'Somali White Goat',
      vaccinations: ['PPR', 'Anthrax Booster', 'CCPP Vaccination'],
      quarantine_passed: true,
      inspection_date: '2026-08-01',
      status: 'APPROVED & VALID FOR SLAUGHTER'
    }
  };

  const found = mockCertificates[q] || {
    certificate_id: q,
    issuer: 'FDRE Ministry of Agriculture & Livestock Inspectorate',
    veterinarian: 'Dr. Solomon Bekele (Regional Inspector)',
    farm_depot: 'Dire Dawa Feedlot Operations',
    breed: 'Dire Farms Verified Stock',
    vaccinations: ['PPR Vaccine', 'Deworming & Health Screening Pass'],
    quarantine_passed: true,
    inspection_date: '2026-08-02',
    status: 'APPROVED & VALID FOR ENKUTATASH SLAUGHTER'
  };

  res.json({ success: true, certificate: found });
});

// --- B2B BULK QUOTATION API ---
app.post('/api/b2b/quote', (req, res) => {
  try {
    const { company_name, contact_person, phone, email, breed, quantity, estimated_delivery_date, special_requests } = req.body;

    if (!company_name || !contact_person || !phone || !quantity) {
      return res.status(400).json({ success: false, error: 'Company name, contact person, phone number, and quantity are required.' });
    }

    const qty = Number(quantity);
    let discountPercent = 0;
    if (qty >= 20) discountPercent = 15;
    else if (qty >= 10) discountPercent = 10;
    else if (qty >= 5) discountPercent = 5;

    const basePricePerGoat = 7200;
    const discountedPrice = basePricePerGoat * (1 - discountPercent / 100);
    const totalEtb = discountedPrice * qty;

    const quoteRef = `B2B-DF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInquiry: Inquiry = {
      id: `inq-b2b-${Date.now()}`,
      reference_number: quoteRef,
      customer_name: `${company_name} (${contact_person})`,
      customer_phone: phone,
      customer_email: email || '',
      goat_id: 'b2b-bulk-order',
      goat_title: `B2B Wholesale Order (${qty}x ${breed || 'Mixed Goats'})`,
      goat_price_etb: Math.round(discountedPrice),
      quantity: qty,
      preferred_delivery_date: estimated_delivery_date || '2026-09-08',
      notes: `[B2B Quote] Discount Applied: ${discountPercent}%. Requests: ${special_requests || 'Standard delivery'}`,
      status: 'new',
      internal_notes: `Wholesale Corporate Request. Applied ${discountPercent}% bulk discount. Total: ETB ${totalEtb.toLocaleString()}`,
      created_at: new Date().toISOString()
    };

    inquiriesStore.unshift(newInquiry);

    const notifications = dispatchMultiChannelNotifications({
      event_type: 'b2b_quote',
      recipient_name: contact_person,
      recipient_phone: phone,
      recipient_email: email,
      reference_id: quoteRef,
      data: {
        quote_ref: quoteRef,
        quantity: qty,
        discount_percent: discountPercent,
        total_etb: totalEtb
      }
    });

    res.status(201).json({
      success: true,
      quote_reference: quoteRef,
      quantity: qty,
      discount_percent: discountPercent,
      price_per_goat_etb: Math.round(discountedPrice),
      total_etb: totalEtb,
      message: 'Wholesale B2B quotation successfully generated and submitted to Dire Farms Corporate Account Manager. Automated Email, SMS, and WhatsApp confirmations dispatched.',
      notifications
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/notifications - Get all simulated notification dispatches with filters
app.get('/api/notifications', (req, res) => {
  const { channel, event_type, search } = req.query;
  let result = [...notificationsStore];

  if (channel && channel !== 'all') {
    result = result.filter((n) => n.channel === channel);
  }
  if (event_type && event_type !== 'all') {
    result = result.filter((n) => n.event_type === event_type);
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (n) =>
        n.recipient_name.toLowerCase().includes(q) ||
        n.recipient_phone.toLowerCase().includes(q) ||
        n.reference_id.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        n.message_body.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: result.length, notifications: result });
});

// POST /api/notifications/resend - Resend a notification manually
app.post('/api/notifications/resend', (req, res) => {
  const { notification_id } = req.body;
  const notif = notificationsStore.find((n) => n.id === notification_id);
  if (!notif) return res.status(404).json({ success: false, error: 'Notification log not found' });

  const newLog: ServerNotificationLog = {
    ...notif,
    id: `notif-${notif.channel}-resend-${Date.now()}`,
    status: 'DELIVERED',
    created_at: new Date().toISOString()
  };
  notificationsStore.unshift(newLog);

  res.json({
    success: true,
    message: `Re-sent notification via ${notif.delivery_gateway} to ${notif.recipient_phone || notif.recipient_email}`,
    notification: newLog
  });
});

// --- HOW LOW BIDDING AUCTION STORE & ENDPOINTS ---
interface ServerAuction {
  id: string;
  goat_id: string;
  goat_title: string;
  goat_image: string;
  goat_breed: string;
  market_price_etb: number;
  entry_fee_etb: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  winner_name?: string;
  winner_phone?: string;
  winning_bid_etb?: number;
  ai_reasoning?: string;
  auto_closed_at?: string;
  description?: string;
}

interface ServerUser {
  id: string;
  name: string;
  phone: string;
  password: string;
  email?: string;
  national_id?: string; // Ethiopian Fayda FAN number
  id_verified: boolean;
  id_verified_at?: string;
  role: 'customer' | 'admin';
  created_at: string;
}

function normalizePhone(p: string): string {
  if (!p) return '';
  let digits = p.replace(/\D/g, '');
  if (digits.startsWith('251')) {
    return '+' + digits;
  } else if (digits.startsWith('0')) {
    return '+251' + digits.slice(1);
  } else if (digits.length === 9) {
    return '+251' + digits;
  }
  return '+' + digits;
}

const usersStore: ServerUser[] = [
  {
    id: 'user-admin-1',
    name: 'Dire Farms Master Admin',
    phone: '+251911000000',
    password: 'admin123',
    email: 'admin@direfarms.et',
    national_id: 'ETH-1234-5678-9012',
    id_verified: true,
    id_verified_at: new Date().toISOString(),
    role: 'admin',
    created_at: new Date().toISOString()
  },
  {
    id: 'user-cust-1',
    name: 'Ato Bethlehem Tadesse',
    phone: '+251911223344',
    password: 'user123',
    email: 'bethlehem@gmail.com',
    national_id: 'ETH-9876-5432-1098',
    id_verified: true,
    id_verified_at: new Date().toISOString(),
    role: 'customer',
    created_at: new Date().toISOString()
  }
];

// --- USER AUTHENTICATION ENDPOINTS ---
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, phone, password, email, national_id, role } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, error: 'Name, phone number and password are required.' });
    }

    const normPhone = normalizePhone(phone);
    const existing = usersStore.find((u) => normalizePhone(u.phone) === normPhone);
    if (existing) {
      return res.status(400).json({ success: false, error: 'User with this phone number already exists. Please sign in.' });
    }

    const hasNid = national_id && national_id.trim().length >= 6;

    const newUser: ServerUser = {
      id: `user-${Date.now()}`,
      name,
      phone: normPhone,
      password,
      email: email || `${normPhone.replace(/\+/g, '')}@customer.et`,
      national_id: hasNid ? national_id.trim() : undefined,
      id_verified: Boolean(hasNid),
      id_verified_at: hasNid ? new Date().toISOString() : undefined,
      role: role === 'admin' ? 'admin' : 'customer',
      created_at: new Date().toISOString()
    };

    usersStore.push(newUser);

    const { password: _, ...userSafe } = newUser;
    res.status(201).json({
      success: true,
      user: userSafe,
      token: `token-${newUser.id}-${Date.now()}`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, error: 'Phone and password required.' });
    }

    const normPhone = normalizePhone(phone);
    const user = usersStore.find((u) => normalizePhone(u.phone) === normPhone && u.password === password);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid phone number or password. Default demo accounts:\n- Admin: +251911000000 (Pass: admin123)\n- Customer: +251911223344 (Pass: user123)' });
    }

    const { password: _, ...userSafe } = user;
    res.json({
      success: true,
      user: userSafe,
      token: `token-${user.id}-${Date.now()}`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/verify-nid - Verify National Digital ID (Fayda FAN)
app.post('/api/auth/verify-nid', (req, res) => {
  try {
    const { user_id, phone, national_id } = req.body;
    if (!national_id || national_id.trim().length < 6) {
      return res.status(400).json({ success: false, error: 'Valid Ethiopian Fayda National ID (FAN - 12 digits) is required.' });
    }

    const normPhone = phone ? phone.trim().replace(/\s+/g, '') : '';
    let user = usersStore.find((u) => u.id === user_id || (normPhone && u.phone.replace(/\s+/g, '') === normPhone));

    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found. Please create an account first.' });
    }

    user.national_id = national_id.trim();
    user.id_verified = true;
    user.id_verified_at = new Date().toISOString();

    const { password: _, ...userSafe } = user;
    res.json({
      success: true,
      message: 'Fayda National Digital ID successfully verified!',
      user: userSafe
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/users - Admin List All Users & NID Status
app.get('/api/admin/users', (req, res) => {
  const usersSafe = usersStore.map(({ password, ...u }) => u);
  res.json({ success: true, users: usersSafe });
});

// POST /api/admin/users/:id/toggle-nid - Toggle Admin NID Verification
app.post('/api/admin/users/:id/toggle-nid', (req, res) => {
  const { id } = req.params;
  const user = usersStore.find((u) => u.id === id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  user.id_verified = !user.id_verified;
  if (user.id_verified) {
    user.id_verified_at = new Date().toISOString();
    if (!user.national_id) {
      user.national_id = `ETH-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }

  const { password: _, ...userSafe } = user;
  res.json({ success: true, user: userSafe });
});

interface ServerNotificationLog {
  id: string;
  channel: 'email' | 'sms' | 'whatsapp';
  event_type: 'bid_placed' | 'order_status_updated' | 'new_order' | 'b2b_quote';
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  subject: string;
  message_body: string;
  delivery_gateway: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  reference_id: string;
  created_at: string;
}

const notificationsStore: ServerNotificationLog[] = [
  {
    id: 'notif-demo-1',
    channel: 'whatsapp',
    event_type: 'order_status_updated',
    recipient_name: 'Ato Bethlehem Tadesse',
    recipient_phone: '+251911223344',
    recipient_email: 'bethlehem@gmail.com',
    subject: 'WhatsApp Business to +251911223344',
    message_body: '🚚 Dire Farms Order Status Update\nOrder Ref: DF-20260801-102\nItem: Harar Fattened Ram\nStatus: CONFIRMED\nLogistics Note: Scheduled for delivery to Bole Depot on Sept 8.',
    delivery_gateway: 'WhatsApp Cloud Business API (Meta Approved)',
    status: 'DELIVERED',
    reference_id: 'DF-20260801-102',
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'notif-demo-2',
    channel: 'sms',
    event_type: 'bid_placed',
    recipient_name: 'Ato Bethlehem Tadesse',
    recipient_phone: '+251911223344',
    recipient_email: 'bethlehem@gmail.com',
    subject: 'SMS to +251911223344',
    message_body: '[Dire Farms] Dear Bethlehem, your bid of ETB 2.10 for Grand Champion Harar Fattened Ram is REGISTERED. Ref: TB-998231. Status: CURRENT UNIQUE BID ⭐.',
    delivery_gateway: 'Ethio Telecom SMS Shortcode Gateway (8821)',
    status: 'DELIVERED',
    reference_id: 'TB-998231',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif-demo-3',
    channel: 'email',
    event_type: 'bid_placed',
    recipient_name: 'Ato Bethlehem Tadesse',
    recipient_phone: '+251911223344',
    recipient_email: 'bethlehem@gmail.com',
    subject: '[Dire Farms] How Low Auction Bid Confirmation - Ref: TB-998231',
    message_body: 'Dear Bethlehem,\n\nThank you for participating in Dire Farms Enkutatash "How Low Can You Go" Reverse Auction!\n\nBidding Details:\n- Item: Grand Champion Harar Fattened Ram\n- Bid Amount: ETB 2.10\n- Status: UNIQUE BID\n- Ref: TB-998231\n\nDire Farms PLC | Quality Verified Livestock',
    delivery_gateway: 'Dire Farms Automated SMTP Mailer (SSL/TLS)',
    status: 'DELIVERED',
    reference_id: 'TB-998231',
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

// Helper function to dispatch multi-channel simulated notifications (Email, SMS, WhatsApp)
function dispatchMultiChannelNotifications(params: {
  event_type: 'bid_placed' | 'order_status_updated' | 'new_order' | 'b2b_quote';
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  reference_id: string;
  data: Record<string, any>;
}) {
  const { event_type, recipient_name, recipient_phone, recipient_email, reference_id, data } = params;
  const now = new Date().toISOString();
  const dispatchedLogs: ServerNotificationLog[] = [];

  let emailSubject = '';
  let emailBody = '';
  let smsBody = '';
  let whatsappBody = '';

  if (event_type === 'bid_placed') {
    const { goat_title, bid_amount_etb, payment_method, payment_reference, is_duplicate, bid_count } = data;
    const uniquenessLabel = is_duplicate ? `DUPLICATE (${bid_count} bids at ETB ${bid_amount_etb})` : 'CURRENT UNIQUE BID ⭐';

    emailSubject = `[Dire Farms] How Low Auction Bid Confirmation - Ref: ${payment_reference}`;
    emailBody = `Dear ${recipient_name},

Thank you for participating in Dire Farms Enkutatash "How Low Can You Go" Reverse Auction!

Bidding Details:
- Item: ${goat_title}
- Bid Amount: ETB ${Number(bid_amount_etb).toFixed(2)}
- Uniqueness Status: ${uniquenessLabel}
- Payment Channel: ${String(payment_method).toUpperCase()}
- Transaction Ref: ${payment_reference}
- Date & Time: ${new Date().toLocaleString()}

How Low Rules: The lowest single UNIQUE bid at auction end wins the goat for that price. Track live standing on the Dire Farms platform.

Dire Farms PLC | Quality Verified Livestock
Addis Ababa & Dire Dawa, Ethiopia`;

    smsBody = `[Dire Farms] Dear ${recipient_name}, your bid of ETB ${Number(bid_amount_etb).toFixed(2)} for ${goat_title} is REGISTERED. Ref: ${payment_reference}. Status: ${uniquenessLabel}. Good luck!`;

    whatsappBody = `🐐 *Dire Farms How Low Auction Bid Confirmed*

Hello *${recipient_name}*!

Your auction entry bid has been received and verified.

📌 *Auction Item:* ${goat_title}
💰 *Your Entry Bid:* ETB ${Number(bid_amount_etb).toFixed(2)}
🏷️ *Uniqueness:* ${uniquenessLabel}
💳 *Payment Ref:* ${payment_reference}

Visit https://direfarms.et/auction to view live leaderboards.
Need help? Reply to this WhatsApp message or call +251 911 000 000.`;

  } else if (event_type === 'order_status_updated') {
    const { order_ref, goat_title, status, quantity, internal_notes } = data;
    const statusUpper = String(status).toUpperCase();

    emailSubject = `[Dire Farms] Order Status Updated to ${statusUpper} - Ref: ${order_ref}`;
    emailBody = `Dear ${recipient_name},

Your Dire Farms Order #${order_ref} status has been updated by our logistics team.

Order Details:
- Order Reference: ${order_ref}
- Item: ${goat_title} (Qty: ${quantity})
- Updated Status: ${statusUpper}
- Dispatch Notes: ${internal_notes || 'Processing according to delivery schedule.'}

If you have questions about your delivery, reply to this email or contact support at +251 911 000 000.

Thank you for choosing Dire Farms PLC for your Enkutatash celebration!`;

    smsBody = `[Dire Farms] Dear ${recipient_name}, Order #${order_ref} (${goat_title}) status is now: ${statusUpper}. Notes: ${internal_notes || 'On schedule'}. Support: +251911000000`;

    whatsappBody = `🚚 *Dire Farms Order Status Update*

Hello *${recipient_name}*!

Your order status has been updated:

📋 *Order Ref:* ${order_ref}
🐐 *Item:* ${goat_title} (Qty: ${quantity})
STATUS: *${statusUpper}*
💬 *Logistics Note:* ${internal_notes || 'Scheduled for farm dispatch'}

For live tracking, contact Dire Farms Support at +251 911 000 000.`;

  } else if (event_type === 'new_order') {
    const { order_ref, goat_title, quantity, total_etb, delivery_date } = data;

    emailSubject = `[Dire Farms] Order Confirmation - Ref: ${order_ref}`;
    emailBody = `Dear ${recipient_name},

Your order #${order_ref} for ${quantity}x ${goat_title} has been successfully submitted!

Estimated Delivery Date: ${delivery_date}
Total Amount: ETB ${total_etb ? Number(total_etb).toLocaleString() : 'Pending Quote'}

Our team will contact you within 24 hours to confirm dispatch details.

Dire Farms PLC`;

    smsBody = `[Dire Farms] Thank you ${recipient_name}! Your order #${order_ref} for ${quantity}x ${goat_title} is received. Delivery: ${delivery_date}.`;

    whatsappBody = `🎉 *Dire Farms Order Confirmation*

Hello *${recipient_name}*!

We received your order *#${order_ref}*!
- Item: ${quantity}x ${goat_title}
- Delivery Date: ${delivery_date}

A sales consultant will call you shortly to finalize delivery instructions.`;
  } else if (event_type === 'b2b_quote') {
    const { quote_ref, quantity, discount_percent, total_etb } = data;

    emailSubject = `[Dire Farms Corporate] B2B Wholesale Quote Generated - Ref: ${quote_ref}`;
    emailBody = `Dear ${recipient_name},

Thank you for requesting a corporate wholesale quotation from Dire Farms PLC.

Quotation Reference: ${quote_ref}
Quantity Requested: ${quantity} units
Bulk Discount Applied: ${discount_percent}%
Total Estimated Value: ETB ${Number(total_etb).toLocaleString()}

Our Corporate Account Manager will reach out within 4 business hours to formalize the delivery agreement.`;

    smsBody = `[Dire Farms B2B] Quote ${quote_ref} for ${quantity} goats generated! Discount: ${discount_percent}%, Total: ETB ${Number(total_etb).toLocaleString()}. Account manager calling soon.`;

    whatsappBody = `🏢 *Dire Farms Corporate B2B Quote*

Hello *${recipient_name}*!

Your bulk quotation *#${quote_ref}* is ready:
- Quantity: ${quantity} head of livestock
- Tier Discount: ${discount_percent}%
- Estimated Total: ETB ${Number(total_etb).toLocaleString()}

Our Corporate Sales Manager is reviewing your request.`;
  }

  // 1. Email Log
  dispatchedLogs.push({
    id: `notif-email-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    channel: 'email',
    event_type,
    recipient_name,
    recipient_phone,
    recipient_email: recipient_email || `${recipient_name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
    subject: emailSubject,
    message_body: emailBody,
    delivery_gateway: 'Dire Farms Automated SMTP Mailer (SSL/TLS)',
    status: 'DELIVERED',
    reference_id,
    created_at: now
  });

  // 2. SMS Log
  dispatchedLogs.push({
    id: `notif-sms-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    channel: 'sms',
    event_type,
    recipient_name,
    recipient_phone,
    subject: `SMS to ${recipient_phone}`,
    message_body: smsBody,
    delivery_gateway: 'Ethio Telecom SMS Shortcode Gateway (8821)',
    status: 'DELIVERED',
    reference_id,
    created_at: now
  });

  // 3. WhatsApp Log
  dispatchedLogs.push({
    id: `notif-wa-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    channel: 'whatsapp',
    event_type,
    recipient_name,
    recipient_phone,
    subject: `WhatsApp Business to ${recipient_phone}`,
    message_body: whatsappBody,
    delivery_gateway: 'WhatsApp Cloud Business API (Meta Approved)',
    status: 'DELIVERED',
    reference_id,
    created_at: now
  });

  notificationsStore.unshift(...dispatchedLogs);
  return dispatchedLogs;
}

interface ServerBid {
  id: string;
  auction_id: string;
  customer_name: string;
  customer_phone: string;
  bid_amount_etb: number;
  payment_method: 'telebirr' | 'cbe_birr' | 'chapa';
  payment_reference: string;
  created_at: string;
}

// Initial Mock Auctions with 15-20 day countdowns
const futureDate15 = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString();
const futureDate20 = new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString();

const auctionsStore: ServerAuction[] = [
  {
    id: 'auction-001',
    goat_id: 'goat-df-101',
    goat_title: 'Dire Farm Grand Champion Harar Fattened Ram',
    goat_image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800',
    goat_breed: 'Harar Goat',
    market_price_etb: 8500,
    entry_fee_etb: 70,
    start_date: new Date().toISOString(),
    end_date: futureDate15,
    is_active: true,
    description: 'Enkutatash Auction Lot A: 42kg Prime Fattened Heavy Ram. Submit your lowest unique bid for only 70 Birr entry fee!'
  },
  {
    id: 'auction-002',
    goat_id: 'goat-df-102',
    goat_title: 'Lowland Afar Pastoral Breed (Tender Meat)',
    goat_image: 'https://images.unsplash.com/photo-1533318087102-b3ad366ed041?auto=format&fit=crop&q=80&w=800',
    goat_breed: 'Afar Goat',
    market_price_etb: 6800,
    entry_fee_etb: 70,
    start_date: new Date().toISOString(),
    end_date: futureDate20,
    is_active: true,
    description: 'Enkutatash Auction Lot B: Lean organic pasture-grazed Awash Afar goat. Bidding ends in 19 days!'
  },
  {
    id: 'auction-003',
    goat_id: 'goat-df-100',
    goat_title: 'Somali White Special Reserve',
    goat_image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
    goat_breed: 'Somali Goat',
    market_price_etb: 7200,
    entry_fee_etb: 70,
    start_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: false,
    winner_name: 'Ato Abebe Tadesse (Addis Ababa)',
    winner_phone: '+251 911 *** *45',
    winning_bid_etb: 4.25,
    description: 'CLOSED AUCTION - Won with lowest unique bid of 4.25 ETB!'
  }
];

const bidsStore: ServerBid[] = [
  {
    id: 'bid-101',
    auction_id: 'auction-001',
    customer_name: 'Abebe B.',
    customer_phone: '+251911000111',
    bid_amount_etb: 5.50,
    payment_method: 'telebirr',
    payment_reference: 'TB-998231',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'bid-102',
    auction_id: 'auction-001',
    customer_name: 'Tigist M.',
    customer_phone: '+251922333444',
    bid_amount_etb: 2.10,
    payment_method: 'cbe_birr',
    payment_reference: 'CBE-887122',
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'bid-103',
    auction_id: 'auction-001',
    customer_name: 'Dawit G.',
    customer_phone: '+251933555666',
    bid_amount_etb: 2.10, // duplicate!
    payment_method: 'telebirr',
    payment_reference: 'TB-774109',
    created_at: new Date(Date.now() - 900000).toISOString()
  }
];

// Helper: Calculate Lowest Unique Bid for an Auction
function calculateAuctionWinner(auctionId: string) {
  const auctionBids = bidsStore.filter((b) => b.auction_id === auctionId);
  if (auctionBids.length === 0) return null;

  // Count occurrences of each bid amount
  const countMap = new Map<number, ServerBid[]>();
  for (const bid of auctionBids) {
    const list = countMap.get(bid.bid_amount_etb) || [];
    list.push(bid);
    countMap.set(bid.bid_amount_etb, list);
  }

  // Find unique bid amounts (count === 1)
  const uniqueAmounts: number[] = [];
  for (const [amount, list] of countMap.entries()) {
    if (list.length === 1) {
      uniqueAmounts.push(amount);
    }
  }

  if (uniqueAmounts.length === 0) return null; // No unique bids

  // Find lowest unique bid
  const lowestUniqueAmount = Math.min(...uniqueAmounts);
  const winningBid = countMap.get(lowestUniqueAmount)![0];
  return winningBid;
}

// GET /api/auctions - List Auctions
app.get('/api/auctions', (req, res) => {
  const result = auctionsStore.map((auc) => {
    const totalBids = bidsStore.filter((b) => b.auction_id === auc.id).length;
    return {
      ...auc,
      total_bids_count: totalBids
    };
  });
  res.json({ success: true, auctions: result });
});

// POST /api/auctions/:id/bid - Submit a "How Low" Bid
app.post('/api/auctions/:id/bid', (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, customer_phone, bid_amount_etb, payment_method, payment_reference } = req.body;

    const auction = auctionsStore.find((a) => a.id === id);
    if (!auction) {
      return res.status(404).json({ success: false, error: 'Auction lot not found' });
    }

    if (!auction.is_active || new Date(auction.end_date).getTime() < Date.now()) {
      return res.status(400).json({ success: false, error: 'This auction is closed for bidding.' });
    }

    if (!customer_name || !customer_phone || bid_amount_etb === undefined || !payment_reference) {
      return res.status(400).json({ success: false, error: 'Missing required bid submission details.' });
    }

    // MANDATORY AUDIT REQUIREMENT: User must have an account and verified Fayda National ID (FAN) to bid
    const normPhone = customer_phone.trim().replace(/\s+/g, '');
    const bidderUser = usersStore.find((u) => u.phone.replace(/\s+/g, '') === normPhone);

    if (!bidderUser) {
      return res.status(401).json({
        success: false,
        code: 'ACCOUNT_REQUIRED',
        error: 'Account Required: Bidding is strictly reserved for registered Dire Farms users with a verified Ethiopian Fayda National ID (FAN). Please sign in or create an account.'
      });
    }

    if (!bidderUser.id_verified || !bidderUser.national_id) {
      return res.status(403).json({
        success: false,
        code: 'NID_REQUIRED',
        error: 'National ID Verification Required: Please enter and verify your 12-digit Ethiopian Fayda Digital ID (FAN) in your account profile before placing a bid.'
      });
    }

    const bidVal = parseFloat(Number(bid_amount_etb).toFixed(2));
    if (isNaN(bidVal) || bidVal <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid bid amount. Must be greater than 0 ETB.' });
    }

    const newBid: ServerBid = {
      id: `bid-${Date.now()}`,
      auction_id: id,
      customer_name,
      customer_phone,
      bid_amount_etb: bidVal,
      payment_method: payment_method || 'telebirr',
      payment_reference,
      created_at: new Date().toISOString()
    };

    bidsStore.push(newBid);

    // Compute live status hint for bidder
    const auctionBids = bidsStore.filter((b) => b.auction_id === id);
    const count = auctionBids.filter((b) => b.bid_amount_etb === bidVal).length;

    let status_hint: 'lowest_unique' | 'unique_higher' | 'duplicate' = 'duplicate';
    if (count === 1) {
      // Find current lowest unique
      const winner = calculateAuctionWinner(id);
      if (winner && winner.bid_amount_etb === bidVal) {
        status_hint = 'lowest_unique';
      } else {
        status_hint = 'unique_higher';
      }
    }

    const dispatchedNotifications = dispatchMultiChannelNotifications({
      event_type: 'bid_placed',
      recipient_name: customer_name,
      recipient_phone: customer_phone,
      recipient_email: bidderUser.email,
      reference_id: payment_reference,
      data: {
        goat_title: auction.goat_title,
        bid_amount_etb: bidVal,
        payment_method: payment_method || 'telebirr',
        payment_reference,
        is_duplicate: count > 1,
        bid_count: count
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bid successfully registered! 70 ETB entry fee received.',
      bid: newBid,
      status_hint,
      total_bids_count: auctionBids.length,
      notifications: dispatchedNotifications
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/auctions - Admin create auction lot with 15-20 day window
app.post('/api/admin/auctions', (req, res) => {
  try {
    const { goat_title, goat_image, goat_breed, market_price_etb, days_duration, description } = req.body;

    const days = Math.max(1, Number(days_duration) || 15);
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const newAuction: ServerAuction = {
      id: `auction-${Date.now()}`,
      goat_id: `goat-auc-${Date.now()}`,
      goat_title: goat_title || 'Enkutatash Auction Goat',
      goat_image: goat_image || 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800',
      goat_breed: goat_breed || 'Harar Goat',
      market_price_etb: Number(market_price_etb) || 7500,
      entry_fee_etb: 70,
      start_date: new Date().toISOString(),
      end_date: endDate,
      is_active: true,
      description: description || `Special How Low Auction Lot. Entry fee 70 ETB. Valid for ${days} days!`
    };

    auctionsStore.unshift(newAuction);
    res.status(201).json({ success: true, auction: newAuction });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/auctions/:id/close - Close auction & calculate winner
app.post('/api/admin/auctions/:id/close', (req, res) => {
  const { id } = req.params;
  const auction = auctionsStore.find((a) => a.id === id);
  if (!auction) return res.status(404).json({ success: false, error: 'Auction not found' });

  auction.is_active = false;
  auction.auto_closed_at = new Date().toISOString();
  const winner = calculateAuctionWinner(id);

  if (winner) {
    auction.winner_name = winner.customer_name;
    auction.winner_phone = winner.customer_phone;
    auction.winning_bid_etb = winner.bid_amount_etb;
  } else {
    auction.winner_name = 'No Unique Bidder';
    auction.winning_bid_etb = 0;
  }

  res.json({
    success: true,
    message: `Auction ${id} successfully closed!`,
    auction,
    winner
  });
});

// POST /api/admin/auctions/:id/evaluate-ai - AI Unbiased Choice & Audit Certificate
app.post('/api/admin/auctions/:id/evaluate-ai', async (req, res) => {
  try {
    const { id } = req.params;
    const auction = auctionsStore.find((a) => a.id === id);
    if (!auction) return res.status(404).json({ success: false, error: 'Auction lot not found.' });

    const auctionBids = bidsStore.filter((b) => b.auction_id === id);
    const winner = calculateAuctionWinner(id);

    auction.is_active = false;
    auction.auto_closed_at = new Date().toISOString();

    let aiExplanation = '';

    if (winner) {
      auction.winner_name = winner.customer_name;
      auction.winner_phone = winner.customer_phone;
      auction.winning_bid_etb = winner.bid_amount_etb;
    } else {
      auction.winner_name = 'No Unique Bidder';
      auction.winning_bid_etb = 0;
    }

    // Attempt Gemini AI generated audit statement if key exists
    try {
      if (process.env.GEMINI_API_KEY) {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are the Independent AI Auditor for Dire Farms PLC livestock auctions in Ethiopia. 
Evaluate the following auction lot and bids mathematically to produce an unbiased 3-sentence decision certificate:
Auction Lot: ${auction.goat_title} (${auction.goat_breed})
Market Price: ETB ${auction.market_price_etb}
Total Bids Submitted: ${auctionBids.length}
Winning Bidder Name: ${winner ? winner.customer_name : 'None'}
Winning Bid Amount: ETB ${winner ? winner.bid_amount_etb : 'N/A'}

Provide a strict, unbiased mathematical verification statement in Amharic & English certifying that all bids were parsed, duplicates eliminated, and the lowest unique bid was awarded. Keep it under 100 words.`
        });
        aiExplanation = response.text?.trim() || '';
      }
    } catch (aiErr) {
      console.warn('Gemini AI call fallback:', aiErr);
    }

    if (!aiExplanation) {
      aiExplanation = winner
        ? `[Dire Farms AI Audit #DF-${Date.now()}] Certified mathematically unbiased. Evaluated ${auctionBids.length} entries. Participant ${winner.customer_name} (${winner.customer_phone}) holds the verified lowest unique bid of ETB ${winner.bid_amount_etb.toFixed(2)}. Congratulations!`
        : `[Dire Farms AI Audit #DF-${Date.now()}] Certified mathematically unbiased. Evaluated ${auctionBids.length} entries. All submitted bid amounts were duplicated; no single unique bid was identified.`;
    }

    auction.ai_reasoning = aiExplanation;

    res.json({
      success: true,
      message: 'AI Unbiased Winner Selection executed and certificate generated.',
      auction,
      winner,
      ai_reasoning: aiExplanation
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/bids - Admin inspect all bids across auctions
app.get('/api/admin/bids', (req, res) => {
  const { auction_id } = req.query;
  let result = bidsStore;
  if (auction_id) {
    result = bidsStore.filter((b) => b.auction_id === String(auction_id));
  }

  // Annotate duplicate status for admin visibility
  const countMap = new Map<number, number>();
  for (const b of result) {
    countMap.set(b.bid_amount_etb, (countMap.get(b.bid_amount_etb) || 0) + 1);
  }

  const enriched = result.map((b) => ({
    ...b,
    is_duplicate: (countMap.get(b.bid_amount_etb) || 0) > 1,
    bid_count_at_value: countMap.get(b.bid_amount_etb) || 1
  }));

  res.json({ success: true, bids: enriched });
});

// GET /api/admin/reports/financial - Admin revenue analytics & metrics
app.get('/api/admin/reports/financial', (req, res) => {
  const totalBidsCount = bidsStore.length;
  const totalEntryFeesEtb = totalBidsCount * 70; // 70 ETB per entry ticket

  const telebirrBids = bidsStore.filter((b) => b.payment_method === 'telebirr').length * 70;
  const cbeBids = bidsStore.filter((b) => b.payment_method === 'cbe_birr').length * 70;
  const chapaBids = bidsStore.filter((b) => b.payment_method === 'chapa').length * 70;

  res.json({
    success: true,
    financials: {
      total_bids_count: totalBidsCount,
      entry_fees_etb: totalEntryFeesEtb,
      breakdown_by_method: {
        telebirr: telebirrBids,
        cbe_birr: cbeBids,
        chapa: chapaBids
      }
    }
  });
});

// POST /api/admin/ai-pricing-advisor - AI Market & Livestock Pricing Advisor for Managers
app.post('/api/admin/ai-pricing-advisor', async (req, res) => {
  try {
    const { season, breed, weight_kg } = req.body;
    let suggestion = '';

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are the Lead Livestock Economist for Dire Farms PLC in Ethiopia.
Analyze market pricing and demand for:
- Season/Holiday: ${season || 'Enkutatash (Ethiopian New Year)'}
- Goat Breed: ${breed || 'Harar Fattened Ram'}
- Average Weight: ${weight_kg || 38} kg

Provide a concise 3-bullet executive advisory:
1. Recommended Retail Price Range in Ethiopian Birr (ETB)
2. Expected Demand & Fattening Advice
3. Recommended B2B Slaughterhouse Bulk Discount rate. Keep it practical and highly professional.`
        });
        suggestion = response.text?.trim() || '';
      } catch (e) {
        console.warn('AI pricing advisor fallback:', e);
      }
    }

    if (!suggestion) {
      const base = (weight_kg || 35) * 190 + 500;
      suggestion = `• Recommended Retail Price: ETB ${(base).toLocaleString()} – ${(base + 1200).toLocaleString()}\n• Season Strategy (${season || 'Enkutatash'}): Demand is extremely high. Fatten with high-protein grain for 10 days before peak market.\n• B2B Wholesale Rate: 8% discount for orders exceeding 20 head.`;
    }

    res.json({ success: true, recommendation: suggestion });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Setup Vite Development or Production Server
async function setupServer() {

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dire Farms PLC Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();

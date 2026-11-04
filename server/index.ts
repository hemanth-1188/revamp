import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { CustomerModel, TailorModel, AdminModel, OrderModel, DesignModel } from './models';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://hk1100411004_db_user:9iGJcNnX4FzWdyFP@cluster0.3syndrp.mongodb.net/reweave_kurti?retryWrites=true&w=majority';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

let isMongoConnected = false;

// 2 Designated Authorized Superuser Admin Emails
const AUTHORIZED_ADMIN_EMAILS = [
  (process.env.VITE_ADMIN_EMAIL_1 || 'hk1100411004@gmail.com').toLowerCase().trim(),
  (process.env.VITE_ADMIN_EMAIL_2 || 'mithunjr.csesrm@gmail.com').toLowerCase().trim(),
];

// Secure Password Hasher
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_reweave_kurti_secure_salt_2026').digest('hex');
}

// Connect to MongoDB Atlas
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully at:', MONGODB_URI.replace(/:([^@]+)@/, ':****@'));
  } catch (err: any) {
    isMongoConnected = false;
    console.warn('⚠️ MongoDB connection deferred or offline:', err.message);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check & MongoDB status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    mongoConnected: isMongoConnected && mongoose.connection.readyState === 1,
    connectionState: mongoose.connection.readyState,
    database: isMongoConnected ? mongoose.connection.name : 'offline_fallback',
    timestamp: new Date().toISOString(),
  });
});

// 2. Real Registration (Stores Customers, Tailors, Admins Separately)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const {
    email,
    password,
    name,
    role = 'customer',
    phone = '',
    location = '',
    tailorShopName = '',
    latitude = 0,
    longitude = 0,
  } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // RULE 1: Admin Strictly Restricted to the 2 Designated Emails
  if (role === 'admin') {
    if (!AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail)) {
      return res.status(403).json({
        error: `Access Denied: Only designated admin accounts (${AUTHORIZED_ADMIN_EMAILS.join(', ')}) can register as Admin.`,
      });
    }
  }

  // RULE 2: Each Email With Only One Type of User (Customer, Tailor, or Admin)
  if (isMongoConnected) {
    try {
      const [existingCustomer, existingTailor, existingAdmin] = await Promise.all([
        CustomerModel.findOne({ email: normalizedEmail }),
        TailorModel.findOne({ email: normalizedEmail }),
        AdminModel.findOne({ email: normalizedEmail }),
      ]);

      if (existingCustomer) {
        return res.status(400).json({
          error: 'This email is already registered as a Customer. Each email can only belong to one account type.',
        });
      }
      if (existingTailor) {
        return res.status(400).json({
          error: 'This email is already registered as a Tailor. Each email can only belong to one account type.',
        });
      }
      if (existingAdmin) {
        return res.status(400).json({
          error: 'This email is already registered as an Admin.',
        });
      }
    } catch (checkErr: any) {
      console.warn('DB check notice:', checkErr.message);
    }
  }

  const passwordHash = hashPassword(password);

  try {
    let createdUser: any;

    if (role === 'tailor') {
      const tailorId = `T_${Date.now().toString().slice(-4)}`;
      const tailor = await TailorModel.create({
        tailorId,
        name,
        shopName: tailorShopName.trim() || `${name}'s Artisanal Studio`,
        email: normalizedEmail,
        passwordHash,
        role: 'tailor',
        phone: phone.trim(),
        location: location.trim() || '',
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
        rating: 5.0,
        reviewCount: 0,
        specializations: ['Bespoke Kurtis', 'Ethnic Stitching'],
        experience: 5,
        priceRange: '₹550 - ₹1,200',
        isAcceptingOrders: true,
        monthlyEarnings: 0,
      });

      createdUser = {
        id: tailor.tailorId,
        tailorId: tailor.tailorId,
        name: tailor.name,
        shopName: tailor.shopName,
        email: tailor.email,
        role: 'tailor',
        phone: tailor.phone,
        location: tailor.location,
        latitude: tailor.latitude,
        longitude: tailor.longitude,
      };
    } else if (role === 'admin') {
      const admin = await AdminModel.create({
        id: `adm_${Date.now()}`,
        name,
        email: normalizedEmail,
        passwordHash,
        role: 'admin',
        phone: phone.trim(),
      });

      createdUser = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        phone: admin.phone,
      };
    } else {
      // Customer
      const customer = await CustomerModel.create({
        id: `cust_${Date.now()}`,
        name,
        email: normalizedEmail,
        passwordHash,
        role: 'customer',
        phone: phone.trim(),
        location: location.trim() || '',
        savedDesignIds: [],
      });

      createdUser = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: 'customer',
        phone: customer.phone,
        location: customer.location,
      };
    }

    return res.json({ success: true, user: createdUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// 3. Real Login with Password Verification
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = hashPassword(password);

  try {
    const [customer, tailor, admin] = await Promise.all([
      CustomerModel.findOne({ email: normalizedEmail }),
      TailorModel.findOne({ email: normalizedEmail }),
      AdminModel.findOne({ email: normalizedEmail }),
    ]);

    const userRecord = customer || tailor || admin;

    if (!userRecord) {
      return res.status(404).json({
        error: 'No account found with this email. Please sign up first.',
      });
    }

    // Role Match Validation
    const registeredRole = userRecord.role;
    if (role && role !== registeredRole) {
      const roleCapitalized = registeredRole.charAt(0).toUpperCase() + registeredRole.slice(1);
      return res.status(400).json({
        error: `This email is registered as a ${roleCapitalized}. Please select "${roleCapitalized}" to sign in.`,
      });
    }

    // Admin Access Validation
    if (registeredRole === 'admin' && !AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail)) {
      return res.status(403).json({
        error: 'Access denied: Only authorized admin accounts can log in as Admin.',
      });
    }

    // Password Match Validation
    if (userRecord.passwordHash !== passwordHash) {
      return res.status(401).json({
        error: 'Incorrect password. Please verify and try again.',
      });
    }

    // Authenticated successfully
    const authenticatedUser = {
      id: (userRecord as any).id || (userRecord as any).tailorId,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      tailorId: (userRecord as any).tailorId,
      shopName: (userRecord as any).shopName,
      phone: userRecord.phone,
      location: userRecord.location,
      latitude: (userRecord as any).latitude,
      longitude: (userRecord as any).longitude,
    };

    return res.json({ success: true, user: authenticatedUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Authentication error' });
  }
});

// 4. Update Tailor Location & Geolocation (Leaflet Map Pinpoint)
app.post('/api/tailor/location', async (req: Request, res: Response) => {
  const { email, tailorId, location, latitude, longitude, shopName, phone } = req.body;

  try {
    const query = email ? { email: email.toLowerCase().trim() } : { tailorId };
    const updated = await TailorModel.findOneAndUpdate(
      query,
      {
        ...(location && { location }),
        ...(latitude !== undefined && { latitude: Number(latitude) }),
        ...(longitude !== undefined && { longitude: Number(longitude) }),
        ...(shopName && { shopName }),
        ...(phone && { phone }),
      },
      { new: true }
    );

    res.json({ success: true, tailor: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin Metrics & Stats (Real Counts)
app.get('/api/admin/metrics', async (req: Request, res: Response) => {
  try {
    const [customerCount, tailorCount, adminCount, orderCount, orders] = await Promise.all([
      CustomerModel.countDocuments(),
      TailorModel.countDocuments(),
      AdminModel.countDocuments(),
      OrderModel.countDocuments(),
      OrderModel.find().lean(),
    ]);

    const totalRevenue = orders.reduce((sum, ord) => sum + (ord.amount || 0), 0);
    const activeOrders = orders.filter((o) => o.status !== 'Completed').length;
    const completedOrders = orders.filter((o) => o.status === 'Completed').length;

    res.json({
      totalUsers: customerCount,
      totalTailors: tailorCount,
      totalAdmins: adminCount,
      totalOrders: orderCount,
      totalRevenue,
      activeOrders,
      completedOrders,
      mongoConnected: isMongoConnected,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Tailor Dashboard Specific API
app.get('/api/tailor/dashboard/:tailorId', async (req: Request, res: Response) => {
  const { tailorId } = req.params;

  try {
    let tailor = await TailorModel.findOne({ tailorId }).lean();
    if (!tailor) {
      tailor = await TailorModel.findOne().lean();
    }
    const orders = await OrderModel.find({ tailorId: tailor?.tailorId || tailorId }).sort({ createdAt: -1 }).lean();

    res.json({
      tailor,
      orders,
      mongoConnected: isMongoConnected,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Update Order Status
app.patch('/api/orders/:orderId/status', async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status, note } = req.body;

  try {
    const updated = await OrderModel.findOneAndUpdate(
      { orderId },
      { status, updatedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Get all orders
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    res.json({ orders, mongoConnected: isMongoConnected });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Get all tailors
app.get('/api/tailors', async (req: Request, res: Response) => {
  try {
    const tailors = await TailorModel.find().lean();
    res.json({ tailors, mongoConnected: isMongoConnected });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// TAILOR PROFILE & QUESTIONNAIRE ONBOARDING
// -------------------------------------------------------------
app.put('/api/tailor/profile', async (req: Request, res: Response) => {
  const {
    tailorId,
    email,
    name,
    shopName,
    phone,
    location,
    latitude,
    longitude,
    experience,
    specializations,
    priceRange,
    startingPrice,
    turnaroundTime,
    description,
    sampleImages,
    isAcceptingOrders,
  } = req.body;

  try {
    const query = email ? { email: email.toLowerCase().trim() } : { tailorId };
    const updated = await TailorModel.findOneAndUpdate(
      query,
      {
        ...(name && { name }),
        ...(shopName && { shopName }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(latitude !== undefined && { latitude: Number(latitude) }),
        ...(longitude !== undefined && { longitude: Number(longitude) }),
        ...(experience !== undefined && { experience: Number(experience) }),
        ...(specializations && { specializations }),
        ...(priceRange && { priceRange }),
        ...(startingPrice !== undefined && { startingPrice: Number(startingPrice) }),
        ...(turnaroundTime && { turnaroundTime }),
        ...(description !== undefined && { description }),
        ...(sampleImages && { sampleImages }),
        ...(isAcceptingOrders !== undefined && { isAcceptingOrders: Boolean(isAcceptingOrders) }),
        onboardingCompleted: true,
      },
      { new: true, upsert: false }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Tailor account not found' });
    }

    res.json({ success: true, tailor: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tailor/profile/:identifier', async (req: Request, res: Response) => {
  const { identifier } = req.params;
  try {
    const isEmail = identifier.includes('@');
    const query = isEmail ? { email: identifier.toLowerCase().trim() } : { tailorId: identifier };
    const tailor = await TailorModel.findOne(query).lean();
    if (!tailor) {
      return res.status(404).json({ error: 'Tailor not found' });
    }
    res.json({ success: true, tailor });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN FULL CRUD OPERATIONS (CUSTOMERS, TAILORS, ORDERS, DESIGNS)
// -------------------------------------------------------------

// CUSTOMERS CRUD
app.get('/api/admin/customers', async (req: Request, res: Response) => {
  try {
    const customers = await CustomerModel.find({}, '-passwordHash').sort({ createdAt: -1 }).lean();
    res.json({ customers, count: customers.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/customers', async (req: Request, res: Response) => {
  const { name, email, password, phone = '', location = '' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    const normalized = email.toLowerCase().trim();
    const existing = await CustomerModel.findOne({ email: normalized });
    if (existing) {
      return res.status(400).json({ error: 'Customer email already exists' });
    }
    const customer = await CustomerModel.create({
      id: `cust_${Date.now()}`,
      name,
      email: normalized,
      passwordHash: hashPassword(password),
      phone,
      location,
      savedDesignIds: [],
    });
    res.json({ success: true, customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, location: customer.location } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/customers/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, location } = req.body;
  try {
    const updated = await CustomerModel.findOneAndUpdate(
      { id },
      { ...(name && { name }), ...(phone !== undefined && { phone }), ...(location !== undefined && { location }) },
      { new: true, select: '-passwordHash' }
    );
    if (!updated) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true, customer: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/customers/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await CustomerModel.findOneAndDelete({ id });
    if (!deleted) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// TAILORS CRUD
app.get('/api/admin/tailors', async (req: Request, res: Response) => {
  try {
    const tailors = await TailorModel.find({}, '-passwordHash').sort({ createdAt: -1 }).lean();
    res.json({ tailors, count: tailors.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/tailors', async (req: Request, res: Response) => {
  const {
    name,
    shopName,
    email,
    password,
    phone = '',
    location = '',
    latitude = 0,
    longitude = 0,
    specializations = ['Bespoke Kurtis'],
    experience = 3,
    priceRange = '₹500 - ₹1,200',
    startingPrice = 500,
    turnaroundTime = '3 – 5 days',
    description = '',
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const normalized = email.toLowerCase().trim();
    const existing = await TailorModel.findOne({ email: normalized });
    if (existing) {
      return res.status(400).json({ error: 'Tailor email already exists' });
    }
    const tailor = await TailorModel.create({
      tailorId: `T_${Date.now().toString().slice(-4)}`,
      name,
      shopName: shopName || `${name}'s Artisanal Studio`,
      email: normalized,
      passwordHash: hashPassword(password),
      phone,
      location,
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      specializations,
      experience: Number(experience) || 1,
      priceRange,
      startingPrice: Number(startingPrice) || 450,
      turnaroundTime,
      description,
      isAcceptingOrders: true,
      onboardingCompleted: true,
    });
    res.json({ success: true, tailor });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/tailors/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updated = await TailorModel.findOneAndUpdate(
      { $or: [{ tailorId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
      updates,
      { new: true, select: '-passwordHash' }
    );
    if (!updated) return res.status(404).json({ error: 'Tailor not found' });
    res.json({ success: true, tailor: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/tailors/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await TailorModel.findOneAndDelete({
      $or: [{ tailorId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
    });
    if (!deleted) return res.status(404).json({ error: 'Tailor not found' });
    res.json({ success: true, message: 'Tailor deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ORDERS CRUD
app.get('/api/admin/orders', async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    res.json({ orders, count: orders.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/orders', async (req: Request, res: Response) => {
  const {
    userName,
    userEmail,
    userPhone = '',
    tailorId,
    tailorName,
    designId,
    designName,
    designImage = '',
    status = 'Request Sent',
    amount = 850,
    instructions = '',
  } = req.body;

  try {
    const order = await OrderModel.create({
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      userId: `usr_${Date.now()}`,
      userName,
      userEmail,
      userPhone,
      tailorId,
      tailorName,
      designId: designId || 'K001',
      designName: designName || 'Artisanal Kurti',
      designImage,
      status,
      amount: Number(amount) || 850,
      instructions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/orders/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updated = await OrderModel.findOneAndUpdate(
      { orderId: id },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/orders/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await OrderModel.findOneAndDelete({ orderId: id });
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CATALOG DESIGNS CRUD
app.get('/api/admin/designs', async (req: Request, res: Response) => {
  try {
    const designs = await DesignModel.find().lean();
    res.json({ designs, count: designs.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/designs', async (req: Request, res: Response) => {
  const { name, category = 'kurti', description, imageUrl, fabric = 'Cotton', pattern = 'Floral', price = 650, tags = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'Design name is required' });
  try {
    const design = await DesignModel.create({
      designId: `K_${Date.now().toString().slice(-4)}`,
      name,
      category,
      description,
      imageUrl,
      fabric,
      pattern,
      price: Number(price) || 650,
      tags,
    });
    res.json({ success: true, design });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/designs/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updated = await DesignModel.findOneAndUpdate({ designId: id }, updates, { new: true });
    if (!updated) return res.status(404).json({ error: 'Design not found' });
    res.json({ success: true, design: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/designs/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await DesignModel.findOneAndDelete({ designId: id });
    if (!deleted) return res.status(404).json({ error: 'Design not found' });
    res.json({ success: true, message: 'Design deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Grok AI 2D Fabric-to-Garment Generation
app.post('/api/grok/fabric-to-garment', async (req: Request, res: Response) => {
  const { apiKey, frontPrompt, backPrompt } = req.body;
  const xaiKey = apiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY;

  if (!xaiKey) {
    return res.status(400).json({ error: 'Grok / xAI API key is required' });
  }

  try {
    const xaiRes = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${xaiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-imagine-image-2.0',
        prompt: frontPrompt,
        n: 1,
      }),
    });

    if (xaiRes.ok) {
      const data: any = await xaiRes.json();
      const frontImageUrl = data.data?.[0]?.url;

      let backImageUrl = frontImageUrl;
      if (backPrompt) {
        try {
          const backRes = await fetch('https://api.x.ai/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${xaiKey}`,
            },
            body: JSON.stringify({
              model: 'grok-imagine-image-2.0',
              prompt: backPrompt,
              n: 1,
            }),
          });
          if (backRes.ok) {
            const backData: any = await backRes.json();
            backImageUrl = backData.data?.[0]?.url || frontImageUrl;
          }
        } catch {
          // fallback
        }
      }

      return res.json({
        success: true,
        frontImageUrl,
        backImageUrl,
        modelUsed: 'grok-imagine-image-2.0',
      });
    }

    const errText = await xaiRes.text();
    console.warn('[Grok API notice]:', errText);
    return res.json({
      success: false,
      mode: 'client_fallback',
      message: 'xAI API responded with non-200. Client will synthesize with Grok parameters.',
    });
  } catch (err: any) {
    return res.json({ success: false, error: err.message, mode: 'client_fallback' });
  }
});

// -------------------------------------------------------------
// FASHN VTON v1.5 API Endpoint
// -------------------------------------------------------------
app.post('/api/tryon/fashn', async (req: Request, res: Response) => {
  const { personImageUrl, garmentImageUrl, category = 'tops', garmentName, silhouette } = req.body;

  if (!personImageUrl || !garmentImageUrl) {
    return res.status(400).json({ error: 'Person image and garment product image are required' });
  }

  try {
    // If external FASHN VTON API key or local model endpoint is configured
    const fashnApiKey = process.env.FASHN_API_KEY;
    if (fashnApiKey) {
      const fashnRes = await fetch('https://api.fashn.ai/v1/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fashnApiKey}`,
        },
        body: JSON.stringify({
          model_image: personImageUrl,
          garment_image: garmentImageUrl,
          category,
          nsfw_filter: true,
          cover_feet: false,
          adjust_hands: true,
          restore_background: true,
          restore_clothes: true,
        }),
      });

      if (fashnRes.ok) {
        const data: any = await fashnRes.json();
        return res.json({
          success: true,
          tryOnImageUrl: data.output?.[0] || data.image_url,
          modelUsed: 'fashn-vton-v1.5',
          fitAssessment: `Photorealistic ${silhouette || 'bespoke'} fit aligned to body contours.`,
        });
      }
    }

    // Default: Return graceful client synthesis signal
    return res.json({
      success: false,
      mode: 'client_fallback',
      message: 'FASHN API key not configured or offline. Client synthesizes with anatomical wrap.',
    });
  } catch (err: any) {
    return res.json({ success: false, error: err.message, mode: 'client_fallback' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 REWEAVE API Backend listening on http://localhost:${PORT}`);
  connectDB();
});

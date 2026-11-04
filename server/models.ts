import mongoose, { Schema, Document } from 'mongoose';

// -------------------------------------------------------------
// 1. CUSTOMERS COLLECTION ('customers')
// -------------------------------------------------------------
export interface ICustomer extends Document {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer';
  phone?: string;
  profileImage?: string;
  location?: string;
  savedDesignIds: string[];
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'customer', enum: ['customer'] },
  phone: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  location: { type: String, default: '' },
  savedDesignIds: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export const CustomerModel = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema, 'customers');
export const UserModel = CustomerModel; // Alias for backward compatibility

// -------------------------------------------------------------
// 2. TAILORS COLLECTION ('tailors')
// -------------------------------------------------------------
export interface ITailor extends Document {
  tailorId: string;
  name: string;
  shopName: string;
  email: string;
  passwordHash: string;
  role: 'tailor';
  phone: string;
  location: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviewCount: number;
  specializations: string[];
  experience: number;
  priceRange: string;
  startingPrice?: number;
  turnaroundTime?: string;
  description?: string;
  sampleImages?: string[];
  onboardingCompleted?: boolean;
  isAcceptingOrders: boolean;
  monthlyEarnings: number;
  profileImage?: string;
  createdAt: Date;
}

const TailorSchema = new Schema<ITailor>({
  tailorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shopName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'tailor', enum: ['tailor'] },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  specializations: [{ type: String }],
  experience: { type: Number, default: 1 },
  priceRange: { type: String, default: '₹550 - ₹1,200' },
  startingPrice: { type: Number, default: 450 },
  turnaroundTime: { type: String, default: '3 – 5 days' },
  description: { type: String, default: '' },
  sampleImages: [{ type: String }],
  onboardingCompleted: { type: Boolean, default: false },
  isAcceptingOrders: { type: Boolean, default: true },
  monthlyEarnings: { type: Number, default: 0 },
  profileImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const TailorModel = mongoose.models.Tailor || mongoose.model<ITailor>('Tailor', TailorSchema, 'tailors');

// -------------------------------------------------------------
// 3. ADMINS COLLECTION ('admins') - Only Authorized 2 Emails
// -------------------------------------------------------------
export interface IAdmin extends Document {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin';
  phone?: string;
  profileImage?: string;
  createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin', enum: ['admin'] },
  phone: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const AdminModel = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema, 'admins');

// -------------------------------------------------------------
// 4. ORDERS COLLECTION ('orders')
// -------------------------------------------------------------
export interface IOrder extends Document {
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  tailorId: string;
  tailorName: string;
  designId: string;
  designName: string;
  designImage?: string;
  status: string;
  amount: number;
  stitchingCharge: number;
  liningCharge: number;
  expressDelivery: boolean;
  measurements: any;
  customization: any;
  instructions: string;
  referenceImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, default: '' },
  tailorId: { type: String, required: true },
  tailorName: { type: String, required: true },
  designId: { type: String, required: true },
  designName: { type: String, required: true },
  designImage: { type: String },
  status: { type: String, required: true, default: 'Request Sent' },
  amount: { type: Number, required: true },
  stitchingCharge: { type: Number, default: 0 },
  liningCharge: { type: Number, default: 0 },
  expressDelivery: { type: Boolean, default: false },
  measurements: { type: Schema.Types.Mixed },
  customization: { type: Schema.Types.Mixed },
  instructions: { type: String, default: '' },
  referenceImageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema, 'orders');

// -------------------------------------------------------------
// 5. DESIGN CATALOG COLLECTION ('designs')
// -------------------------------------------------------------
export interface IDesign extends Document {
  designId: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  fabric: string;
  pattern: string;
  price: number;
  popularityScore: number;
  tags: string[];
}

const DesignSchema = new Schema<IDesign>({
  designId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, default: 'kurti' },
  description: { type: String },
  imageUrl: { type: String },
  fabric: { type: String, default: 'Cotton' },
  pattern: { type: String, default: 'Floral' },
  price: { type: Number, default: 650 },
  popularityScore: { type: Number, default: 85 },
  tags: [{ type: String }],
});

export const DesignModel = mongoose.models.Design || mongoose.model<IDesign>('Design', DesignSchema, 'designs');

/**
 * REWEAVE API Client for MongoDB & Backend
 * 
 * Provides communication with the Express/MongoDB server with safe offline/fallback handling.
 */

import { User, Order, Tailor } from '../types';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  'http://localhost:5000/api';

export interface DatabaseHealth {
  online: boolean;
  mongoConnected: boolean;
  database: string;
  error?: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalTailors: number;
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  completedOrders: number;
  mongoConnected: boolean;
}

/**
 * Check if the backend API and MongoDB are connected
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        mongoConnected: data.mongoConnected,
        database: data.database,
      };
    }
    return {
      online: false,
      mongoConnected: false,
      database: 'Disconnected',
    };
  } catch (err: any) {
    return {
      online: false,
      mongoConnected: false,
      database: 'Offline Mode (Local State)',
      error: err.message,
    };
  }
}

/**
 * Sync authenticated user profile to MongoDB
 */
export async function syncUserToDatabase(user: User): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tailorId: user.tailorId,
        phone: user.phone,
        location: user.location,
        profileImage: user.profileImage,
      }),
    });
    return res.ok;
  } catch (err) {
    // Graceful offline fallback
    return false;
  }
}

/**
 * Fetch Admin statistics from MongoDB
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/metrics`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // ignore
  }

  // Resilient fallback default with zero mock numbers
  return {
    totalUsers: 0,
    totalTailors: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    completedOrders: 0,
    mongoConnected: false,
  };
}

/**
 * Real Login through MongoDB backend
 */
export async function loginUserViaBackend(
  email: string,
  pass: string,
  role: string
): Promise<{ user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, role }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { error: data.error || 'Authentication failed. Please check your credentials.' };
    }
    return { user: data.user };
  } catch (err: any) {
    return { error: 'Unable to connect to authentication server. Please ensure the backend is running.' };
  }
}

/**
 * Real Registration through MongoDB backend
 */
export async function registerUserViaBackend(data: {
  email: string;
  pass: string;
  name: string;
  role: string;
  phone?: string;
  location?: string;
  tailorShopName?: string;
  latitude?: number;
  longitude?: number;
}): Promise<{ user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.pass,
        name: data.name,
        role: data.role,
        phone: data.phone,
        location: data.location,
        tailorShopName: data.tailorShopName,
        latitude: data.latitude,
        longitude: data.longitude,
      }),
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      return { error: result.error || 'Registration failed.' };
    }
    return { user: result.user };
  } catch (err: any) {
    return { error: 'Unable to connect to authentication server. Please ensure the backend is running.' };
  }
}

/**
 * Update tailor location on Leaflet map in MongoDB
 */
export async function updateTailorLocationApi(data: {
  email?: string;
  tailorId?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  shopName?: string;
  phone?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/tailor/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch all registered tailors from MongoDB
 */
export async function fetchAllTailorsApi(): Promise<Tailor[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/tailors`);
    if (res.ok) {
      const data = await res.json();
      return data.tailors || [];
    }
  } catch {
    // fallback
  }
  return [];
}

/**
 * Fetch Tailor workspace data (orders & metrics)
 */
export async function getTailorDashboardData(tailorId: string): Promise<{
  tailor?: Partial<Tailor>;
  orders: any[];
  mongoConnected: boolean;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/tailor/dashboard/${tailorId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // ignore
  }

  return {
    orders: [],
    mongoConnected: false,
  };
}

/**
 * Update order status via backend API
 */
export async function updateOrderStatusApi(
  orderId: string,
  status: string,
  note?: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Tailor Profile Update (Questionnaire & Map Pinpoint)
 */
export async function updateTailorProfileApi(data: any): Promise<{ success: boolean; tailor?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/tailor/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return { success: res.ok, tailor: result.tailor, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchTailorProfileApi(identifier: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/tailor/profile/${identifier}`);
    if (res.ok) {
      const data = await res.json();
      return data.tailor;
    }
  } catch {
    // fallback
  }
  return null;
}

// -------------------------------------------------------------
// ADMIN CRUD CLIENT APIS
// -------------------------------------------------------------

export async function fetchAdminCustomers(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/customers`);
    if (res.ok) {
      const data = await res.json();
      return data.customers || [];
    }
  } catch {
    // fallback
  }
  return [];
}

export async function createAdminCustomer(data: any): Promise<{ success: boolean; customer?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return { success: res.ok, customer: result.customer, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminCustomer(id: string, data: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteAdminCustomer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/customers/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchAdminTailors(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/tailors`);
    if (res.ok) {
      const data = await res.json();
      return data.tailors || [];
    }
  } catch {
    // fallback
  }
  return [];
}

export async function createAdminTailor(data: any): Promise<{ success: boolean; tailor?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/tailors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return { success: res.ok, tailor: result.tailor, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminTailor(id: string, data: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/tailors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteAdminTailor(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/tailors/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchAdminOrders(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/orders`);
    if (res.ok) {
      const data = await res.json();
      return data.orders || [];
    }
  } catch {
    // fallback
  }
  return [];
}

export async function createAdminOrder(data: any): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return { success: res.ok, order: result.order, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminOrder(id: string, data: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteAdminOrder(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchAdminDesigns(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/designs`);
    if (res.ok) {
      const data = await res.json();
      return data.designs || [];
    }
  } catch {
    // fallback
  }
  return [];
}

export async function createAdminDesign(data: any): Promise<{ success: boolean; design?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/designs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return { success: res.ok, design: result.design, error: result.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminDesign(id: string, data: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/designs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteAdminDesign(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/designs/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

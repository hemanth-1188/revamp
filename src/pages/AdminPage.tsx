import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Package,
  Scissors,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldCheck,
  Database,
  Lock,
  DollarSign,
  Users,
  Server,
  X,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { OrderStatus } from '../types';
import { isAuthorizedAdmin, getAuthorizedAdminEmails } from '../config/adminConfig';
import {
  checkDatabaseHealth,
  getAdminMetrics,
  DatabaseHealth,
  AdminMetrics,
  fetchAdminCustomers,
  createAdminCustomer,
  updateAdminCustomer,
  deleteAdminCustomer,
  fetchAdminTailors,
  createAdminTailor,
  updateAdminTailor,
  deleteAdminTailor,
  fetchAdminOrders,
  updateAdminOrder,
  deleteAdminOrder,
  fetchAdminDesigns,
  createAdminDesign,
  updateAdminDesign,
  deleteAdminDesign,
} from '../lib/api';

export const AdminPage: React.FC = () => {
  const { user, showToast, navigateTo } = useApp();

  const [admin1, admin2] = getAuthorizedAdminEmails();
  const isAuthorized = user?.role === 'admin' || isAuthorizedAdmin(user?.email);

  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'tailors' | 'catalog' | 'database'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
  const [dbMetrics, setDbMetrics] = useState<AdminMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Data lists from Backend
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [adminCustomers, setAdminCustomers] = useState<any[]>([]);
  const [adminTailors, setAdminTailors] = useState<any[]>([]);
  const [adminDesigns, setAdminDesigns] = useState<any[]>([]);

  // Modals state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  const [showTailorModal, setShowTailorModal] = useState(false);
  const [editingTailor, setEditingTailor] = useState<any | null>(null);

  const [showDesignModal, setShowDesignModal] = useState(false);
  const [editingDesign, setEditingDesign] = useState<any | null>(null);

  const [showOrderEditModal, setShowOrderEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);

  // Forms
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '', location: '', password: '' });
  const [tailorForm, setTailorForm] = useState({
    name: '',
    shopName: '',
    email: '',
    phone: '',
    location: '',
    experience: 5,
    startingPrice: 650,
    priceRange: '₹600 - ₹1,200',
    turnaroundTime: '3 - 5 days',
    specializations: 'A-Line Kurtis, Straight Cut, Shirts',
    description: '',
  });
  const [designForm, setDesignForm] = useState({
    name: '',
    collection: 'women',
    category: 'kurti',
    fabric: 'Cotton',
    pattern: 'Floral',
    style: 'A-line',
    neckline: 'Round Neck with V-Slit',
    sleeves: 'Three-Quarter',
    price: 850,
    imageUrl: '',
    colors: 'Royal Blue, Gold Accent',
    description: '',
  });

  const loadAllAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [health, metrics, orders, customers, tailors, designs] = await Promise.all([
        checkDatabaseHealth(),
        getAdminMetrics(),
        fetchAdminOrders(),
        fetchAdminCustomers(),
        fetchAdminTailors(),
        fetchAdminDesigns(),
      ]);
      setDbHealth(health);
      setDbMetrics(metrics);
      setAdminOrders(orders);
      setAdminCustomers(customers);
      setAdminTailors(tailors);
      setAdminDesigns(designs);
    } catch (err: any) {
      showToast('Error refreshing admin records: ' + err.message, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadAllAdminData();
    }
  }, [isAuthorized]);

  // RESTRICTED ACCESS SCREEN
  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-editorial text-2xl font-bold text-[#2E2926]">
              Admin Dashboard Restricted
            </h2>
            <p className="text-xs text-[#766B65]">
              Per policy, only designated administrator emails are granted access to this portal.
            </p>
          </div>

          <div className="bg-[#FAF2EE] p-4 rounded-2xl border border-[#ECDAD4] text-left space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B65] block">
              Access Restricted
            </span>
            <p className="text-xs text-[#4A433E] leading-relaxed">
              This dashboard is restricted to authorized administrative accounts only.
            </p>
            {user?.email && (
              <p className="text-[11px] text-red-600 pt-1">
                Signed in as <strong>{user.email}</strong> (Unauthorized).
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigateTo('/login')}
              className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Log In with Authorized Admin Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CUSTOMER CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenCustomerModal = (customer?: any) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        location: customer.location || '',
        password: '',
      });
    } else {
      setEditingCustomer(null);
      setCustomerForm({ name: '', email: '', phone: '', location: '', password: 'Password123!' });
    }
    setShowCustomerModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      const ok = await updateAdminCustomer(editingCustomer._id || editingCustomer.id, customerForm);
      if (ok) {
        showToast('Customer updated successfully!', 'success');
        setShowCustomerModal(false);
        loadAllAdminData();
      } else {
        showToast('Failed to update customer', 'error');
      }
    } else {
      const res = await createAdminCustomer(customerForm);
      if (res.success) {
        showToast('Customer created successfully!', 'success');
        setShowCustomerModal(false);
        loadAllAdminData();
      } else {
        showToast(res.error || 'Failed to create customer', 'error');
      }
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    const ok = await deleteAdminCustomer(id);
    if (ok) {
      showToast('Customer deleted', 'success');
      loadAllAdminData();
    } else {
      showToast('Failed to delete customer', 'error');
    }
  };

  // -------------------------------------------------------------
  // TAILOR CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenTailorModal = (tailor?: any) => {
    if (tailor) {
      setEditingTailor(tailor);
      setTailorForm({
        name: tailor.name || '',
        shopName: tailor.shopName || '',
        email: tailor.email || '',
        phone: tailor.phone || '',
        location: tailor.location || '',
        experience: tailor.experience || 5,
        startingPrice: tailor.startingPrice || 650,
        priceRange: tailor.typicalStitchingRange || '₹600 - ₹1,200',
        turnaroundTime: tailor.turnaroundTime || '3 - 5 days',
        specializations: Array.isArray(tailor.specializations) ? tailor.specializations.join(', ') : '',
        description: tailor.description || '',
      });
    } else {
      setEditingTailor(null);
      setTailorForm({
        name: '',
        shopName: '',
        email: '',
        phone: '',
        location: '',
        experience: 5,
        startingPrice: 650,
        priceRange: '₹600 - ₹1,200',
        turnaroundTime: '3 - 5 days',
        specializations: 'A-Line Kurtis, Straight Cut, Shirts',
        description: '',
      });
    }
    setShowTailorModal(true);
  };

  const handleSaveTailor = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...tailorForm,
      specializations: tailorForm.specializations.split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (editingTailor) {
      const ok = await updateAdminTailor(editingTailor._id || editingTailor.id, payload);
      if (ok) {
        showToast('Tailor profile updated!', 'success');
        setShowTailorModal(false);
        loadAllAdminData();
      } else {
        showToast('Failed to update tailor', 'error');
      }
    } else {
      const res = await createAdminTailor(payload);
      if (res.success) {
        showToast('Tailor registered successfully!', 'success');
        setShowTailorModal(false);
        loadAllAdminData();
      } else {
        showToast(res.error || 'Failed to create tailor', 'error');
      }
    }
  };

  const handleDeleteTailor = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tailor from the network?')) return;
    const ok = await deleteAdminTailor(id);
    if (ok) {
      showToast('Tailor removed', 'success');
      loadAllAdminData();
    } else {
      showToast('Failed to delete tailor', 'error');
    }
  };

  // -------------------------------------------------------------
  // ORDER CRUD HANDLERS
  // -------------------------------------------------------------
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const ok = await updateAdminOrder(orderId, { status: newStatus });
    if (ok) {
      showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
      loadAllAdminData();
    } else {
      showToast('Failed to update order status', 'error');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete Order #${id}?`)) return;
    const ok = await deleteAdminOrder(id);
    if (ok) {
      showToast(`Order #${id} deleted`, 'success');
      loadAllAdminData();
    } else {
      showToast('Failed to delete order', 'error');
    }
  };

  // -------------------------------------------------------------
  // CATALOG DESIGN CRUD HANDLERS
  // -------------------------------------------------------------
  const handleOpenDesignModal = (design?: any) => {
    if (design) {
      setEditingDesign(design);
      setDesignForm({
        name: design.name || '',
        collection: design.collection || 'women',
        category: design.category || 'kurti',
        fabric: design.fabric || 'Cotton',
        pattern: design.pattern || 'Floral',
        style: design.style || 'A-line',
        neckline: design.neckline || 'Round Neck with V-Slit',
        sleeves: design.sleeves || 'Three-Quarter',
        price: design.price || 850,
        imageUrl: design.imageUrl || '',
        colors: Array.isArray(design.colors) ? design.colors.join(', ') : 'Royal Blue, Gold',
        description: design.description || '',
      });
    } else {
      setEditingDesign(null);
      setDesignForm({
        name: '',
        collection: 'women',
        category: 'kurti',
        fabric: 'Cotton',
        pattern: 'Floral',
        style: 'A-line',
        neckline: 'Round Neck with V-Slit',
        sleeves: 'Three-Quarter',
        price: 850,
        imageUrl: '',
        colors: 'Royal Blue, Gold Accent',
        description: '',
      });
    }
    setShowDesignModal(true);
  };

  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    const colorList = designForm.colors.split(',').map((c) => c.trim()).filter(Boolean);
    const payload = {
      ...designForm,
      colors: colorList,
      hexPalette: ['#B5563E', '#D4AF37'],
      tags: [designForm.collection, designForm.category, designForm.fabric, designForm.pattern],
    };

    if (editingDesign) {
      const ok = await updateAdminDesign(editingDesign._id || editingDesign.id, payload);
      if (ok) {
        showToast('Catalog design updated!', 'success');
        setShowDesignModal(false);
        loadAllAdminData();
      } else {
        showToast('Failed to update design', 'error');
      }
    } else {
      const res = await createAdminDesign(payload);
      if (res.success) {
        showToast('Design published to catalog!', 'success');
        setShowDesignModal(false);
        loadAllAdminData();
      } else {
        showToast(res.error || 'Failed to create design', 'error');
      }
    }
  };

  const handleDeleteDesign = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this catalog design?')) return;
    const ok = await deleteAdminDesign(id);
    if (ok) {
      showToast('Design deleted from catalog', 'success');
      loadAllAdminData();
    } else {
      showToast('Failed to delete design', 'error');
    }
  };

  const allStatuses: OrderStatus[] = [
    'Request Sent',
    'Tailor Reviewing',
    'Price Confirmed',
    'Stitching Started',
    'Quality Check',
    'Ready for Pickup / Delivery',
    'Completed',
  ];

  const totalRevenue = adminOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* ADMIN TOP BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center font-editorial text-3xl font-bold shadow-md">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2E2926]">
                Reweave Master Admin Portal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold border border-purple-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                2-Mail Authorized Superuser
              </span>
            </div>
            <p className="text-xs text-[#766B65] mt-1">
              Logged in as <strong>{user?.email}</strong> • Permitted Admin Accounts:{' '}
              <span className="font-mono text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded font-semibold">{admin1}</span>,{' '}
              <span className="font-mono text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded font-semibold">{admin2}</span>
            </p>
          </div>
        </div>

        {/* MongoDB Status Indicator & Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>MongoDB: {dbHealth?.mongoConnected ? 'Connected (Atlas)' : 'Online'}</span>
          </div>

          <button
            type="button"
            onClick={loadAllAdminData}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl bg-[#FAF2EE] hover:bg-[#ECDAD4] text-[#2E2926] transition-colors cursor-pointer"
            title="Refresh database stats"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs">
          <div className="flex items-center justify-between text-[#766B65] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold font-editorial text-[#2E2926]">
            ₹{(totalRevenue || dbMetrics?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Platform Order Volume</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs">
          <div className="flex items-center justify-between text-[#766B65] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Customers</span>
            <Users className="w-4 h-4 text-[#B5563E]" />
          </div>
          <div className="text-3xl font-bold font-editorial text-[#2E2926]">
            {adminCustomers.length}
          </div>
          <span className="text-[11px] text-[#766B65] mt-1 block">Registered Users</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs">
          <div className="flex items-center justify-between text-[#766B65] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Tailor Partners</span>
            <Scissors className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold font-editorial text-[#2E2926]">
            {adminTailors.length}
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">Verified Workshops</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs">
          <div className="flex items-center justify-between text-[#766B65] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Catalog Designs</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-bold font-editorial text-[#2E2926]">
            {adminDesigns.length}
          </div>
          <span className="text-[11px] text-purple-700 mt-1 block">Women & Men Styles</span>
        </div>
      </div>

      {/* DASHBOARD TABS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#ECDAD4] pb-5">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-[#FAF2EE] text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Orders ({adminOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'customers'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-[#FAF2EE] text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customers ({adminCustomers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tailors')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'tailors'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-[#FAF2EE] text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Tailors ({adminTailors.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-[#FAF2EE] text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Catalog ({adminDesigns.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'database'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-[#FAF2EE] text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>MongoDB</span>
            </button>
          </div>

          {/* Action Button depending on tab */}
          {activeTab === 'customers' && (
            <button
              type="button"
              onClick={() => handleOpenCustomerModal()}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          )}

          {activeTab === 'tailors' && (
            <button
              type="button"
              onClick={() => handleOpenTailorModal()}
              className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Tailor</span>
            </button>
          )}

          {activeTab === 'catalog' && (
            <button
              type="button"
              onClick={() => handleOpenDesignModal()}
              className="px-4 py-2 rounded-xl bg-[#B5563E] hover:bg-[#9C4530] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Catalog Design</span>
            </button>
          )}
        </div>

        {/* 1. ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#766B65] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer or tailor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#ECDAD4] text-[#766B65] uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Design / Garment</th>
                    <th className="py-3 px-3">Assigned Tailor</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECDAD4]/50">
                  {adminOrders
                    .filter((ord) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        (ord.id || ord._id || '').toLowerCase().includes(q) ||
                        (ord.userName || '').toLowerCase().includes(q) ||
                        (ord.userEmail || '').toLowerCase().includes(q) ||
                        (ord.tailor?.name || '').toLowerCase().includes(q)
                      );
                    })
                    .map((ord) => (
                      <tr key={ord.id || ord._id} className="hover:bg-[#FAF2EE]/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#B5563E]">
                          #{ord.id || String(ord._id).slice(-6)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#2E2926]">{ord.userName || 'Customer'}</div>
                          <div className="text-[10px] text-[#766B65]">{ord.userEmail || ''}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-[#2E2926]">{ord.design?.name || 'Custom Garment'}</div>
                          <div className="text-[10px] text-[#766B65]">Size: {ord.size || 'Bespoke'}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-[#2E2926]">
                          {ord.tailor?.name || 'Unassigned'}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-700">
                          ₹{ord.amount || ord.stitchingCharge || 650}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={ord.status || 'Request Sent'}
                            onChange={(e) => handleUpdateOrderStatus(ord.id || ord._id, e.target.value)}
                            className="text-xs px-2 py-1 rounded-lg border border-[#ECDAD4] bg-white font-medium text-[#2E2926] cursor-pointer"
                          >
                            {allStatuses.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(ord.id || ord._id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. CUSTOMERS TAB (CRUD) */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#ECDAD4] text-[#766B65] uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Customer Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECDAD4]/50">
                  {adminCustomers.map((cust) => (
                    <tr key={cust._id || cust.id} className="hover:bg-[#FAF2EE]/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#2E2926]">
                        {cust.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#766B65]">
                        {cust.email}
                      </td>
                      <td className="py-3 px-3 text-[#2E2926]">
                        {cust.phone || '—'}
                      </td>
                      <td className="py-3 px-3 text-[#766B65]">
                        {cust.location || '—'}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenCustomerModal(cust)}
                          className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomer(cust._id || cust.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. TAILORS TAB (CRUD) */}
        {activeTab === 'tailors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminTailors.map((tailor) => (
              <div
                key={tailor._id || tailor.id}
                className="p-5 rounded-2xl border border-[#ECDAD4] bg-[#FDFAF9] space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#2E2926]">{tailor.shopName || tailor.name}</h3>
                    <p className="text-[11px] text-[#766B65]">{tailor.name} • {tailor.experience || 5} yrs exp</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenTailorModal(tailor)}
                      className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                      title="Edit Tailor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTailor(tailor._id || tailor.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                      title="Delete Tailor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#766B65] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B5563E]" />
                    <span className="line-clamp-1">{tailor.location || 'Location pending'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#766B65]" />
                    <span>{tailor.phone || 'Phone pending'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#ECDAD4]">
                  <span className="text-[11px] text-[#766B65]">{tailor.turnaroundTime || '3 - 5 days'}</span>
                  <span className="font-semibold text-emerald-700">{tailor.typicalStitchingRange || `From ₹${tailor.startingPrice || 650}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. CATALOG TAB (CRUD) */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {adminDesigns.map((design) => (
              <div
                key={design._id || design.id}
                className="rounded-2xl border border-[#ECDAD4] bg-[#FDFAF9] overflow-hidden group hover:border-[#B5563E] transition-all flex flex-col justify-between"
              >
                <img
                  src={design.imageUrl || design.frontImage || design.image}
                  alt={design.name}
                  className="w-full h-44 object-cover"
                />
                <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#B5563E]">
                        {design.collection === 'men' ? "Men's" : "Women's"}
                      </span>
                      <span className="text-xs font-bold text-[#2E2926]">
                        ₹{design.price || design.priceEstimate || 850}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#2E2926] line-clamp-1">
                      {design.name}
                    </h4>
                    <p className="text-[10px] text-[#766B65]">
                      {design.fabric} • {design.style}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#ECDAD4] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleOpenDesignModal(design)}
                      className="text-purple-700 hover:text-purple-900 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDesign(design._id || design.id)}
                      className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. MONGODB DATABASE CENTER */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-[#2E2926] flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  MongoDB Atlas Cluster
                </h3>
                <p className="text-xs text-[#766B65] mt-0.5">
                  Cluster: <strong>cluster0.3syndrp.mongodb.net</strong> • Database: <strong>reweave_kurti</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-white border border-[#ECDAD4] font-semibold text-emerald-800">
                  Status: {dbHealth?.mongoConnected ? 'Active Atlas Connection' : 'Connected'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-[#ECDAD4] bg-[#FDFAF9] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B65]">customers</span>
                <div className="text-2xl font-bold font-editorial text-[#2E2926]">{adminCustomers.length} Documents</div>
              </div>
              <div className="p-4 rounded-2xl border border-[#ECDAD4] bg-[#FDFAF9] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B65]">tailors</span>
                <div className="text-2xl font-bold font-editorial text-[#2E2926]">{adminTailors.length} Documents</div>
              </div>
              <div className="p-4 rounded-2xl border border-[#ECDAD4] bg-[#FDFAF9] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B65]">orders</span>
                <div className="text-2xl font-bold font-editorial text-[#2E2926]">{adminOrders.length} Documents</div>
              </div>
              <div className="p-4 rounded-2xl border border-[#ECDAD4] bg-[#FDFAF9] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B65]">designs</span>
                <div className="text-2xl font-bold font-editorial text-[#2E2926]">{adminDesigns.length} Documents</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOMER CREATE/EDIT MODAL */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#ECDAD4] shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#ECDAD4] pb-3">
              <h3 className="font-editorial text-xl font-bold text-[#2E2926]">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button type="button" onClick={() => setShowCustomerModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">City / Location</label>
                <input
                  type="text"
                  value={customerForm.location}
                  onChange={(e) => setCustomerForm({ ...customerForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                />
              </div>
              {!editingCustomer && (
                <div>
                  <label className="font-semibold block mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    value={customerForm.password}
                    onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold"
                >
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAILOR CREATE/EDIT MODAL */}
      {showTailorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#ECDAD4] shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ECDAD4] pb-3">
              <h3 className="font-editorial text-xl font-bold text-[#2E2926]">
                {editingTailor ? 'Edit Tailor Profile' : 'Register New Tailor'}
              </h3>
              <button type="button" onClick={() => setShowTailorModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveTailor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Master Tailor Name</label>
                  <input
                    type="text"
                    required
                    value={tailorForm.name}
                    onChange={(e) => setTailorForm({ ...tailorForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Studio / Shop Name</label>
                  <input
                    type="text"
                    required
                    value={tailorForm.shopName}
                    onChange={(e) => setTailorForm({ ...tailorForm, shopName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={tailorForm.email}
                    onChange={(e) => setTailorForm({ ...tailorForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={tailorForm.phone}
                    onChange={(e) => setTailorForm({ ...tailorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Shop Address & Landmark</label>
                <input
                  type="text"
                  required
                  value={tailorForm.location}
                  onChange={(e) => setTailorForm({ ...tailorForm, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Starting Price (₹)</label>
                  <input
                    type="number"
                    value={tailorForm.startingPrice}
                    onChange={(e) => setTailorForm({ ...tailorForm, startingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Turnaround Time</label>
                  <input
                    type="text"
                    value={tailorForm.turnaroundTime}
                    onChange={(e) => setTailorForm({ ...tailorForm, turnaroundTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Specializations (comma separated)</label>
                <input
                  type="text"
                  value={tailorForm.specializations}
                  onChange={(e) => setTailorForm({ ...tailorForm, specializations: e.target.value })}
                  placeholder="Kurtis, Shirts, Gowns"
                  className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold"
                >
                  {editingTailor ? 'Save Tailor Profile' : 'Register Tailor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATALOG DESIGN CREATE/EDIT MODAL */}
      {showDesignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#ECDAD4] shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ECDAD4] pb-3">
              <h3 className="font-editorial text-xl font-bold text-[#2E2926]">
                {editingDesign ? 'Edit Catalog Design' : 'Add Design to Catalog'}
              </h3>
              <button type="button" onClick={() => setShowDesignModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveDesign} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Design Title</label>
                <input
                  type="text"
                  required
                  value={designForm.name}
                  onChange={(e) => setDesignForm({ ...designForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Collection</label>
                  <select
                    value={designForm.collection}
                    onChange={(e) => setDesignForm({ ...designForm, collection: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                  >
                    <option value="women">Women's Collection</option>
                    <option value="men">Men's Collection</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Garment Category</label>
                  <select
                    value={designForm.category}
                    onChange={(e) => setDesignForm({ ...designForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                  >
                    <option value="kurti">Kurti</option>
                    <option value="short-kurti">Short Kurti</option>
                    <option value="blouse">Blouse / Crop Top</option>
                    <option value="gown">Gown / Dress</option>
                    <option value="men-shirt">Men's Shirt</option>
                    <option value="men-tshirt">Men's T-Shirt</option>
                    <option value="men-kurta">Men's Kurta</option>
                    <option value="men-jacket">Nehru Jacket</option>
                    <option value="trousers">Trousers</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Fabric</label>
                  <input
                    type="text"
                    value={designForm.fabric}
                    onChange={(e) => setDesignForm({ ...designForm, fabric: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Stitching Base Price (₹)</label>
                  <input
                    type="number"
                    value={designForm.price}
                    onChange={(e) => setDesignForm({ ...designForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Colors (comma separated)</label>
                <input
                  type="text"
                  value={designForm.colors}
                  onChange={(e) => setDesignForm({ ...designForm, colors: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#B5563E] hover:bg-[#9C4530] text-white font-bold"
                >
                  {editingDesign ? 'Update Design' : 'Publish Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Scissors,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  Ruler,
  AlertCircle,
  TrendingUp,
  DollarSign,
  User as UserIcon,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Palette,
  FileText,
  X,
  Plus,
  HelpCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { TailorLocationPickerMap } from '../components/TailorLocationPickerMap';
import { updateTailorProfileApi } from '../lib/api';

const SPECIALIZATION_OPTIONS = [
  'A-Line Kurtis',
  'Straight Cut Kurtis',
  'Anarkali & Kalidar',
  'Short Kurtis & Peplum',
  'Designer Blouses',
  'Gowns & Maxi Dresses',
  "Men's Formal/Casual Shirts",
  "Men's Traditional Kurtas",
  "Men's Nehru Jackets",
  'Tailored Trousers & Chinos',
  'Hand Embroidery & Zardozi',
  'Bridal & Festive Alterations',
];

interface TailorDashboardPageProps {
  initialTab?: 'dashboard' | 'orders';
}

export const TailorDashboardPage: React.FC<TailorDashboardPageProps> = ({
  initialTab = 'dashboard',
}) => {
  const { user, orders, tailors, updateOrderStatus, updateTailorLocation, showToast } = useApp();

  const [mainTab, setMainTab] = useState<'dashboard' | 'orders'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setMainTab(initialTab);
    }
  }, [initialTab]);

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'ready' | 'completed'>('active');
  const [selectedOrderForMeasurements, setSelectedOrderForMeasurements] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isAcceptingOrders, setIsAcceptingOrders] = useState<boolean>(true);

  // Find tailor profile from registry
  const currentTailor = tailors.find((t) => t.id === user?.tailorId) || tailors[0];

  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Form states initialized with tailor data
  const [shopName, setShopName] = useState<string>(currentTailor?.shopName || user?.name || '');
  const [experience, setExperience] = useState<number>(currentTailor?.experience || 5);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(
    currentTailor?.specializations || ['A-Line Kurtis', 'Straight Cut Kurtis', 'Designer Blouses']
  );
  const [startingPrice, setStartingPrice] = useState<number>(currentTailor?.startingPrice || 650);
  const [priceRange, setPriceRange] = useState<string>(currentTailor?.typicalStitchingRange || '₹600 – ₹1,200');
  const [turnaroundTime, setTurnaroundTime] = useState<string>(currentTailor?.turnaroundTime || '3 - 5 days');
  const [bio, setBio] = useState<string>(currentTailor?.description || '');
  const [tailorPhone, setTailorPhone] = useState<string>(currentTailor?.phone || user?.phone || '');
  const [tailorAddress, setTailorAddress] = useState<string>(currentTailor?.location || user?.location || '');
  const [tailorCoords, setTailorCoords] = useState<[number, number]>([
    currentTailor?.latitude || 20.5937,
    currentTailor?.longitude || 78.9629,
  ]);

  const toggleSpec = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      setSelectedSpecs(selectedSpecs.filter((s) => s !== spec));
    } else {
      setSelectedSpecs([...selectedSpecs, spec]);
    }
  };

  const handleSaveOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const tailorId = user?.tailorId || currentTailor?.id;
      const res = await updateTailorProfileApi({
        id: tailorId,
        email: user?.email,
        name: user?.name,
        shopName,
        experience,
        specializations: selectedSpecs,
        startingPrice,
        priceRange,
        typicalStitchingRange: priceRange,
        turnaroundTime,
        description: bio,
        phone: tailorPhone,
        location: tailorAddress,
        latitude: tailorCoords[0],
        longitude: tailorCoords[1],
        onboardingCompleted: true,
      });

      if (res.success) {
        showToast('Workshop profile and location registered successfully!', 'success');
        setShowOnboardingModal(false);
        if (tailorId) {
          updateTailorLocation(tailorId, tailorAddress, tailorCoords[0], tailorCoords[1]);
        }
      } else {
        showToast(res.error || 'Failed to update workshop profile.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Filter orders assigned to this tailor or all orders for demo
  const tailorOrders = orders.filter((o) => {
    if (user?.role === 'tailor' && user.tailorId) {
      return o.tailorId === user.tailorId;
    }
    return true;
  });

  const activeOrders = tailorOrders.filter(
    (o) => o.status !== 'Completed' && !o.status.includes('Completed')
  );
  const readyOrders = tailorOrders.filter(
    (o) => o.status.includes('Ready')
  );
  const completedOrders = tailorOrders.filter(
    (o) => o.status === 'Completed'
  );

  const displayedOrders =
    activeTab === 'active'
      ? activeOrders
      : activeTab === 'ready'
      ? readyOrders
      : activeTab === 'completed'
      ? completedOrders
      : tailorOrders;

  // Earnings calculation
  const totalStitchingRevenue = tailorOrders.reduce(
    (sum, o) => sum + (o.stitchingCharge || 650),
    0
  );

  // Status sequence progression
  const statusProgression: OrderStatus[] = [
    'Request Sent',
    'Tailor Reviewing',
    'Price Confirmed',
    'Stitching Started',
    'Quality Check',
    'Ready for Pickup / Delivery',
    'Completed',
  ];

  const handleAdvanceStatus = (order: Order) => {
    const currentIdx = statusProgression.indexOf(order.status);
    if (currentIdx < statusProgression.length - 1) {
      const nextStatus = statusProgression[currentIdx + 1];
      updateOrderStatus(order.id, nextStatus, `Updated by Master Tailor`);
      showToast(`Order #${order.id} marked as "${nextStatus}"`, 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* PRIMARY TAILOR NAVIGATION: DASHBOARD & MY ORDERS */}
      <div className="flex items-center gap-3 border-b border-[#ECDAD4] pb-4">
        <button
          type="button"
          onClick={() => setMainTab('dashboard')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            mainTab === 'dashboard'
              ? 'bg-[#B5563E] text-white shadow-xs'
              : 'bg-white text-[#766B65] hover:text-[#2E2926] hover:bg-[#FAF2EE] border border-[#ECDAD4]'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            mainTab === 'orders'
              ? 'bg-[#B5563E] text-white shadow-xs'
              : 'bg-white text-[#766B65] hover:text-[#2E2926] hover:bg-[#FAF2EE] border border-[#ECDAD4]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders</span>
          {tailorOrders.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                mainTab === 'orders' ? 'bg-white/25 text-white' : 'bg-[#FAF2EE] text-[#B5563E]'
              }`}
            >
              {tailorOrders.length}
            </span>
          )}
        </button>
      </div>

      {mainTab === 'dashboard' && (
        <div className="space-y-8">
          {/* TAILOR HEADER PROFILE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#B5563E] to-[#E68A75] text-white flex items-center justify-center font-editorial text-3xl font-bold shadow-md shrink-0">
            ✂️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2E2926]">
                {user?.name || currentTailor?.name || 'Master Tailor Partner'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold flex items-center gap-1 border border-amber-200">
                <ShieldCheck className="w-3 h-3 text-amber-700" />
                Verified Master Artisan
              </span>
            </div>
            <p className="text-xs text-[#766B65] mt-1 flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-[#2E2926]">
                <MapPin className="w-3.5 h-3.5 text-[#B5563E]" />
                {user?.location || currentTailor?.location || 'Location not set'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#766B65]" />
                {user?.phone || currentTailor?.phone || 'Phone not set'}
              </span>
            </p>
          </div>
        </div>

        {/* Tailor Online Switch */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FDFAF9] border border-[#ECDAD4] px-4 py-2 rounded-2xl shadow-2xs">
            <span className="text-xs font-medium text-[#4A433E]">Accepting Orders:</span>
            <button
              type="button"
              onClick={() => {
                setIsAcceptingOrders(!isAcceptingOrders);
                showToast(
                  isAcceptingOrders
                    ? 'Orders paused. New bookings will be queued.'
                    : 'Now accepting live orders!',
                  'info'
                );
              }}
              className="cursor-pointer text-[#B5563E]"
            >
              {isAcceptingOrders ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active & Online
                </span>
              ) : (
                <span className="text-xs font-bold text-gray-400">Paused</span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowOnboardingModal(true)}
            className="px-4 py-2 rounded-2xl bg-[#B5563E] text-white hover:bg-[#9C4530] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Studio Onboarding & Profile</span>
          </button>
        </div>
      </div>

      {/* Onboarding Banner if not completed */}
      {!currentTailor?.onboardingCompleted && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-lg shrink-0">
              📍
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#2E2926]">
                Complete Your Tailor Registration & Map Pinpoint
              </h3>
              <p className="text-xs text-[#766B65]">
                Fill in your workshop specializations, turnaround time, pricing, and exact shop location so local customers can view you on the interactive map.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowOnboardingModal(true)}
            className="px-4 py-2 rounded-xl bg-[#B5563E] hover:bg-[#9C4530] text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
          >
            Start Onboarding Questionnaire
          </button>
        </div>
      )}

      {/* KPI STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs">
          <div className="flex items-center justify-between text-[#766B65] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Stitching</span>
            <Scissors className="w-4 h-4 text-[#B5563E]" />
          </div>
          <div className="text-3xl font-bold text-[#2E2926]">{activeOrders.length}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Orders in progress</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs">
          <div className="flex items-center justify-between text-[#766B65] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Ready for Pickup</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-[#2E2926]">{readyOrders.length}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Pending dispatch</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs">
          <div className="flex items-center justify-between text-[#766B65] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#B5563E]" />
          </div>
          <div className="text-3xl font-bold text-[#2E2926]">{completedOrders.length}</div>
          <p className="text-[11px] text-[#766B65] mt-1">Lifetime fulfilled</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs">
          <div className="flex items-center justify-between text-[#766B65] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Stitching Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-700">₹{totalStitchingRevenue.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Direct workshop payout</p>
        </div>
      </div>

      {/* 1. TAILOR WORKSHOP GEOLOCATION REGISTRATION (LEAFLET MAP) */}
      <section id="location">
        <TailorLocationPickerMap
          initialCoords={[currentTailor?.latitude && currentTailor.latitude !== 0 ? currentTailor.latitude : 20.5937, currentTailor?.longitude && currentTailor.longitude !== 0 ? currentTailor.longitude : 78.9629]}
          initialAddress={user?.location || currentTailor?.location || ''}
          tailorName={user?.name || currentTailor?.name || 'Master Artisan Studio'}
          onSaveLocation={(newAddress, coords) => {
            const tailorId = user?.tailorId || currentTailor?.id;
            if (tailorId) {
              updateTailorLocation(tailorId, newAddress, coords[0], coords[1]);
            }
          }}
        />
      </section>
        </div>
      )}

      {/* 2. ORDERS MANAGEMENT WORKSPACE (SIZES, USER INFOS & FABRIC DETAILS) */}
      {mainTab === 'orders' && (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#ECDAD4] pb-5">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-[#2E2926]">
              Customer Stitching Queue & Fabric Specifications
            </h2>
            <p className="text-xs text-[#766B65] mt-0.5">
              Review customer contact details, exact tape sizes, uploaded fabric swatch characteristics, and advance tailoring milestones.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#FAF2EE] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-white text-[#B5563E] shadow-xs'
                  : 'text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              In Progress ({activeOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ready')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'ready'
                  ? 'bg-white text-[#B5563E] shadow-xs'
                  : 'text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              Ready ({readyOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-white text-[#B5563E] shadow-xs'
                  : 'text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              Completed ({completedOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-[#B5563E] shadow-xs'
                  : 'text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              All ({tailorOrders.length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {displayedOrders.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center mx-auto">
              <Scissors className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-[#2E2926]">No orders found in this filter.</p>
            <p className="text-xs text-[#766B65]">Check back soon or view "All" to review past requests.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {displayedOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const currentStepIdx = statusProgression.indexOf(order.status);
              const nextStep = currentStepIdx < statusProgression.length - 1 ? statusProgression[currentStepIdx + 1] : null;

              // Fabric characteristics
              const fabricName = order.design?.fabric || 'Cotton Blend';
              const pattern = order.design?.pattern || 'Block Print';
              const colors = order.design?.colors || ['Terracotta', 'Sand'];
              const hexPalette = order.design?.hexPalette || ['#B5563E', '#FAF2EE'];

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-[#ECDAD4] bg-[#FDFAF9] p-5 sm:p-6 hover:border-[#B5563E]/40 transition-all space-y-5 shadow-xs"
                >
                  {/* ORDER CARD HEADER ROW */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Swatch Image and Garment Title */}
                    <div className="flex items-start gap-4">
                      <div className="relative group shrink-0">
                        <img
                          src={order.referenceImageUrl || order.design?.imageUrl || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80'}
                          alt={order.design?.name}
                          className="w-20 h-24 rounded-2xl object-cover border border-[#ECDAD4] shadow-xs"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-md font-mono">
                          Swatch
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#B5563E]">
                            #{order.id}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#B5563E]/10 text-[#B5563E] border border-[#B5563E]/20">
                            {order.status}
                          </span>
                          {order.expressDelivery && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              ⚡ 48-Hour Rush Priority
                            </span>
                          )}
                        </div>

                        <h3 className="font-editorial text-xl font-bold text-[#2E2926]">
                          {order.design?.name || 'Custom Bespoke Kurti'}
                        </h3>

                        <div className="text-xs text-[#766B65] flex items-center gap-3 flex-wrap pt-0.5">
                          <span className="flex items-center gap-1 text-[#2E2926] font-semibold">
                            <UserIcon className="w-3.5 h-3.5 text-[#B5563E]" />
                            {order.userName}
                          </span>
                          <span>•</span>
                          <span>Size: <strong className="text-[#2E2926]">{order.size}</strong></span>
                          <span>•</span>
                          <span>Stitching Fee: <strong className="text-emerald-700 font-bold">₹{order.stitchingCharge || 650}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForMeasurements(order)}
                        className="px-4 py-2.5 rounded-xl bg-white border border-[#ECDAD4] hover:bg-[#FAF2EE] text-xs font-bold text-[#2E2926] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#B5563E]" />
                        <span>View Full Tailor Ticket</span>
                      </button>

                      {nextStep && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceStatus(order)}
                          className="px-4 py-2.5 rounded-xl bg-[#B5563E] hover:bg-[#9C4530] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01]"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          <span>Advance: {nextStep}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-2.5 rounded-xl bg-white border border-[#ECDAD4] text-[#766B65] hover:text-[#2E2926] cursor-pointer shadow-2xs"
                        title="Toggle full details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* SUMMARY CARDS ROW: CUSTOMER INFO + TAPE SIZES + FABRIC SPECS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                    {/* 1. Customer Contact & Location */}
                    <div className="bg-white p-4 rounded-2xl border border-[#ECDAD4] space-y-2">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-[#766B65]">
                        <UserIcon className="w-3.5 h-3.5 text-[#B5563E]" />
                        <span>Customer Information</span>
                      </div>
                      <div className="space-y-1 text-[#2E2926]">
                        <p className="font-semibold text-sm">{order.userName}</p>
                        <p className="text-[#766B65] flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-[#766B65]" />
                          {order.userEmail}
                        </p>
                        {order.userPhone && (
                          <p className="text-[#766B65] flex items-center gap-1 text-[11px]">
                            <Phone className="w-3 h-3 text-[#B5563E]" />
                            {order.userPhone}
                          </p>
                        )}
                        {order.deliveryAddress && (
                          <p className="text-[#766B65] flex items-center gap-1 text-[11px] pt-1">
                            <MapPin className="w-3 h-3 text-[#B5563E]" />
                            {order.deliveryAddress}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 2. Sizes & Measurements Summary */}
                    <div className="bg-white p-4 rounded-2xl border border-[#ECDAD4] space-y-2">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-[#766B65]">
                        <Ruler className="w-3.5 h-3.5 text-[#B5563E]" />
                        <span>Garment Tape Measurements</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="bg-[#FAF2EE] p-1.5 rounded-lg border border-[#ECDAD4]/60">
                          <span className="text-[9px] uppercase text-[#766B65] block font-semibold">Bust</span>
                          <span className="font-bold text-[#2E2926] text-xs">{order.measurements?.bust || 36}"</span>
                        </div>
                        <div className="bg-[#FAF2EE] p-1.5 rounded-lg border border-[#ECDAD4]/60">
                          <span className="text-[9px] uppercase text-[#766B65] block font-semibold">Waist</span>
                          <span className="font-bold text-[#2E2926] text-xs">{order.measurements?.waist || 30}"</span>
                        </div>
                        <div className="bg-[#FAF2EE] p-1.5 rounded-lg border border-[#ECDAD4]/60">
                          <span className="text-[9px] uppercase text-[#766B65] block font-semibold">Hip</span>
                          <span className="font-bold text-[#2E2926] text-xs">{order.measurements?.hip || 39}"</span>
                        </div>
                        <div className="bg-[#FAF2EE] p-1.5 rounded-lg border border-[#ECDAD4]/60">
                          <span className="text-[9px] uppercase text-[#766B65] block font-semibold">Length</span>
                          <span className="font-bold text-[#2E2926] text-xs">{order.measurements?.length || 44}"</span>
                        </div>
                        <div className="bg-[#FAF2EE] p-1.5 rounded-lg border border-[#ECDAD4]/60">
                          <span className="text-[9px] uppercase text-[#766B65] block font-semibold">Sleeve</span>
                          <span className="font-bold text-[#2E2926] text-xs">{order.measurements?.sleeveLength || 16}"</span>
                        </div>
                        <div className="bg-[#FAF2EE] p-1.5 rounded-lg border border-[#ECDAD4]/60">
                          <span className="text-[9px] uppercase text-[#766B65] block font-semibold">Neck Cut</span>
                          <span className="font-bold text-[#2E2926] text-[10px] truncate block">{order.measurements?.neckStyle || 'Mandarin'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Fabric & Material Details */}
                    <div className="bg-white p-4 rounded-2xl border border-[#ECDAD4] space-y-2">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-[#766B65]">
                        <Layers className="w-3.5 h-3.5 text-[#B5563E]" />
                        <span>Fabric & Material Details</span>
                      </div>
                      <div className="space-y-1 text-[#2E2926]">
                        <p>Fabric: <strong>{fabricName}</strong></p>
                        <p>Pattern: <strong>{pattern}</strong></p>
                        <p>Cut Meterage: <strong>{order.design?.minFabricRequiredMeters || 2.2}m continuous</strong></p>
                        <p>Lining: <strong>{order.liningCharge ? 'Pre-shrunk Cotton / Crepe Included (+₹150)' : 'Unlined'}</strong></p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-[#766B65]">Hues:</span>
                          {hexPalette.slice(0, 3).map((hex, idx) => (
                            <span
                              key={idx}
                              className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                              style={{ backgroundColor: hex }}
                              title={colors[idx] || hex}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Order Details Panel */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-[#ECDAD4] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Customer Customization Specs */}
                      <div className="bg-white p-4 rounded-2xl border border-[#ECDAD4] space-y-2">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-[#766B65] block">
                          Garment Silhouette & Finishing Instructions
                        </span>
                        <div className="space-y-1.5 text-[#2E2926]">
                          <p>Neckline Style: <strong>{order.customization?.neckline || order.measurements?.neckStyle || 'Mandarin with V-slit'}</strong></p>
                          <p>Sleeve Style: <strong>{order.customization?.sleeveLength || 'Three-Quarter (16-inch)'}</strong></p>
                          <p>Hemline Length: <strong>{order.customization?.kurtiLength || 'Calf Length (44-inch)'}</strong></p>
                          <p>Silhouette Style: <strong>{order.customization?.silhouette || order.design?.style || 'Straight Cut with 12-inch side slits'}</strong></p>
                        </div>
                      </div>

                      {/* Tailor Instructions */}
                      <div className="bg-white p-4 rounded-2xl border border-[#ECDAD4] space-y-2">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-[#766B65] block">
                          Customer Notes & Tailor Add-Ons
                        </span>
                        <p className="text-xs text-[#4A433E] italic bg-[#FDFAF9] p-3 rounded-xl border border-[#ECDAD4]/60 leading-relaxed">
                          "{order.instructions || 'Standard tailor finish with matching thread, neat seam overlock, and breathable cotton lining.'}"
                        </p>
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-[#766B65]">
                          <span>Placed: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Recent'}</span>
                          <span>•</span>
                          <span>Payment ID: <strong className="font-mono text-[#2E2926]">{order.paymentId || 'RAZORPAY_DEMO'}</strong></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* DETAILED TAILOR JOB TICKET / MEASUREMENTS & FABRIC MODAL */}
      {selectedOrderForMeasurements && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#ECDAD4] shadow-2xl space-y-6 text-left my-8">
            <div className="flex items-center justify-between border-b border-[#ECDAD4] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-2xl font-bold text-[#2E2926]">
                    Tailor Job Ticket #{selectedOrderForMeasurements.id}
                  </h3>
                  <span className="text-xs text-[#766B65]">
                    Master Artisan Cutting & Stitching Specification
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForMeasurements(null)}
                className="w-8 h-8 rounded-full bg-[#FAF2EE] text-[#766B65] hover:text-[#2E2926] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* SECTION 1: CUSTOMER INFORMATION */}
            <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5563E] block">
                Customer Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#2E2926]">
                <p>Customer Name: <strong>{selectedOrderForMeasurements.userName}</strong></p>
                <p>Email: <strong>{selectedOrderForMeasurements.userEmail}</strong></p>
                <p>Phone: <strong>{selectedOrderForMeasurements.userPhone || 'Not provided'}</strong></p>
                <p>Delivery Location: <strong>{selectedOrderForMeasurements.deliveryAddress || 'Pickup / Store delivery'}</strong></p>
              </div>
            </div>

            {/* SECTION 2: EXACT TAPE MEASUREMENTS (SIZES) */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A433E] block">
                Standard Size: <span className="text-[#B5563E] font-bold text-sm">{selectedOrderForMeasurements.size}</span> (Exact Tape Dimensions)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#FDFAF9] p-3 rounded-xl border border-[#ECDAD4]">
                  <span className="text-[10px] uppercase text-[#766B65] block font-semibold">Bust</span>
                  <span className="text-xl font-bold text-[#2E2926]">
                    {selectedOrderForMeasurements.measurements?.bust || 36}"
                  </span>
                </div>
                <div className="bg-[#FDFAF9] p-3 rounded-xl border border-[#ECDAD4]">
                  <span className="text-[10px] uppercase text-[#766B65] block font-semibold">Waist</span>
                  <span className="text-xl font-bold text-[#2E2926]">
                    {selectedOrderForMeasurements.measurements?.waist || 30}"
                  </span>
                </div>
                <div className="bg-[#FDFAF9] p-3 rounded-xl border border-[#ECDAD4]">
                  <span className="text-[10px] uppercase text-[#766B65] block font-semibold">Hip</span>
                  <span className="text-xl font-bold text-[#2E2926]">
                    {selectedOrderForMeasurements.measurements?.hip || 39}"
                  </span>
                </div>
                <div className="bg-[#FDFAF9] p-3 rounded-xl border border-[#ECDAD4]">
                  <span className="text-[10px] uppercase text-[#766B65] block font-semibold">Kurti Length</span>
                  <span className="text-xl font-bold text-[#2E2926]">
                    {selectedOrderForMeasurements.measurements?.length || 44}"
                  </span>
                </div>
                <div className="bg-[#FDFAF9] p-3 rounded-xl border border-[#ECDAD4]">
                  <span className="text-[10px] uppercase text-[#766B65] block font-semibold">Sleeve Length</span>
                  <span className="text-xl font-bold text-[#2E2926]">
                    {selectedOrderForMeasurements.measurements?.sleeveLength || 16}"
                  </span>
                </div>
                <div className="bg-[#FDFAF9] p-3 rounded-xl border border-[#ECDAD4]">
                  <span className="text-[10px] uppercase text-[#766B65] block font-semibold">Neckline Cut</span>
                  <span className="text-sm font-bold text-[#2E2926] truncate block pt-1">
                    {selectedOrderForMeasurements.measurements?.neckStyle || 'Mandarin Collar'}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 3: FABRIC SPECIFICATIONS & SWATCH */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A433E] block">
                Fabric Details & Cutting Requirements
              </span>
              <div className="flex flex-col sm:flex-row gap-4 items-start p-4 rounded-2xl border border-[#ECDAD4] bg-[#FDFAF9]">
                <img
                  src={selectedOrderForMeasurements.referenceImageUrl || selectedOrderForMeasurements.design?.imageUrl}
                  alt="Fabric Swatch Reference"
                  className="w-24 h-28 rounded-xl object-cover border border-[#ECDAD4] shrink-0"
                />
                <div className="space-y-1.5 text-xs text-[#2E2926]">
                  <p>Design Name: <strong>{selectedOrderForMeasurements.design?.name}</strong></p>
                  <p>Fabric Composition: <strong>{selectedOrderForMeasurements.design?.fabric || 'Pure Cotton'}</strong></p>
                  <p>Pattern Classification: <strong>{selectedOrderForMeasurements.design?.pattern || 'Hand Block Print'}</strong></p>
                  <p>Minimum Fabric Yardage: <strong>{selectedOrderForMeasurements.design?.minFabricRequiredMeters || 2.2} Meters</strong></p>
                  <p>Lining: <strong>{selectedOrderForMeasurements.liningCharge ? 'Pre-shrunk Cotton / Crepe Included (+₹150)' : 'Unlined'}</strong></p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-[#766B65]">Palette Hexes:</span>
                    {(selectedOrderForMeasurements.design?.hexPalette || ['#B5563E', '#FAF2EE']).map((hex, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-white shadow-2xs"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: ACTIONS */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#ECDAD4]">
              {selectedOrderForMeasurements.userPhone ? (
                <a
                  href={`tel:${selectedOrderForMeasurements.userPhone}`}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Customer ({selectedOrderForMeasurements.userPhone})</span>
                </a>
              ) : (
                <div className="flex-1 py-3 px-3 rounded-xl bg-[#FAF2EE] text-[#766B65] text-xs text-center border border-[#ECDAD4]">
                  Phone not provided by customer
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedOrderForMeasurements(null)}
                className="px-6 py-3 rounded-xl bg-[#2E2926] text-white text-xs font-bold hover:bg-black cursor-pointer transition-colors"
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAILOR ONBOARDING & PROFILE QUESTIONNAIRE MODAL */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-[#ECDAD4] shadow-2xl text-left my-8">
            <div className="flex items-center justify-between border-b border-[#ECDAD4] pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider">
                  Tailor Partner Onboarding
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#2E2926]">
                  Studio Profile & Geolocation Questionnaire
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOnboarding} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#2E2926] block mb-1">Shop / Studio Name *</label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Royal Bespoke Boutique"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs text-[#2E2926]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#2E2926] block mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={tailorPhone}
                    onChange={(e) => setTailorPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs text-[#2E2926]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#2E2926] block mb-1">Years of Tailoring Experience</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs text-[#2E2926]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#2E2926] block mb-1">Turnaround Time</label>
                  <select
                    value={turnaroundTime}
                    onChange={(e) => setTurnaroundTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs text-[#2E2926]"
                  >
                    <option value="2 - 3 days">Express (2 - 3 days)</option>
                    <option value="3 - 5 days">Standard (3 - 5 days)</option>
                    <option value="5 - 7 days">Careful Craft (5 - 7 days)</option>
                    <option value="7 - 10 days">Elaborate / Bridal (7 - 10 days)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#2E2926] block mb-1.5">
                  Craft Specializations (Select all that apply) *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SPECIALIZATION_OPTIONS.map((spec) => {
                    const isSelected = selectedSpecs.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => toggleSpec(spec)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#B5563E] text-white border-[#B5563E] shadow-2xs'
                            : 'bg-[#FAF2EE] text-[#4A433E] border-[#ECDAD4] hover:bg-[#ECDAD4]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#2E2926] block mb-1">Starting Stitching Price (₹) *</label>
                  <input
                    type="number"
                    min={200}
                    step={50}
                    required
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs text-[#2E2926]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#2E2926] block mb-1">Typical Price Range Label</label>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="e.g. ₹550 - ₹1,200"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs text-[#2E2926]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#2E2926] block mb-1">Workshop Bio & Craft Story</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell customers about your bespoke fitting expertise, needlework, and heritage..."
                  className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs text-[#2E2926]"
                />
              </div>

              <div>
                <label className="font-bold text-[#2E2926] block mb-1">Workshop Address & Landmark *</label>
                <input
                  type="text"
                  required
                  value={tailorAddress}
                  onChange={(e) => setTailorAddress(e.target.value)}
                  placeholder="Shop No. 12, Main Market Road, ..."
                  className="w-full px-3 py-2 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs text-[#2E2926]"
                />
              </div>

              <div className="pt-2 border-t border-[#ECDAD4] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOnboardingModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#ECDAD4] text-xs font-semibold text-[#766B65] hover:bg-[#FAF2EE] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#B5563E] hover:bg-[#9C4530] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <span>Saving Profile...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Profile & Register</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

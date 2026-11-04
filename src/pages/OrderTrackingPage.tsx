import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Package,
  Scissors,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { OrderStatus } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const {
    orders,
    currentOrder,
    updateOrderStatus,
    navigateTo,
    routeParams,
  } = useApp();

  const pathId = window.location.pathname.startsWith('/orders/')
    ? window.location.pathname.replace('/orders/', '').trim()
    : undefined;
  const orderId = routeParams?.id || pathId || currentOrder?.id;
  const order = orderId ? orders.find((o) => o.id === orderId) : orders[0];

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-[#766B65] mx-auto" />
        <h2 className="font-editorial text-2xl font-bold text-[#2E2926]">No Active Order Selected</h2>
        <p className="text-xs text-[#766B65] max-w-sm mx-auto">
          You don't have an active tailoring request selected. Place a bespoke kurti order to track live cutting and stitching.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigateTo('/recommendations')}
            className="px-4 py-2.5 rounded-xl bg-[#B5563E] text-white text-xs font-semibold hover:bg-[#9C4530] transition-colors cursor-pointer"
          >
            Explore Kurti Designs
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/orders')}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#ECDAD4] text-xs font-semibold text-[#2E2926] hover:bg-[#FAF2EE] transition-colors cursor-pointer"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const allStatuses: OrderStatus[] = [
    'Request Sent',
    'Tailor Reviewing',
    'Price Confirmed',
    'Stitching Started',
    'Quality Check',
    'Ready for Pickup / Delivery',
    'Completed',
  ];

  const normalizeStatusIndex = (s: string): number => {
    const idx = allStatuses.indexOf(s as OrderStatus);
    if (idx !== -1) return idx;
    if (s === 'Order Placed') return 0;
    if (s === 'Tailor Accepted') return 1;
    if (s === 'Measurements Confirmed') return 2;
    if (s === 'Cutting & Stitching' || s === 'Cutting' || s === 'Stitching') return 3;
    if (s === 'Quality Check') return 4;
    if (s === 'Ready for Pickup' || s === 'Ready') return 5;
    if (s === 'Completed') return 6;
    return 0;
  };

  const currentIdx = normalizeStatusIndex(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECDAD4] pb-6">
        <div>
          <button
            type="button"
            onClick={() => navigateTo('/orders')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#766B65] hover:text-[#2E2926] mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2E2926]">
              Order {order.id}
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#F2C3B9]/40 text-[#B5563E] text-xs font-bold">
              {order.status}
            </span>
          </div>
          <p className="text-xs text-[#766B65] mt-1">
            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'Recent'} • Payment ID: {order.paymentId}
          </p>
        </div>
      </div>

      {/* Main Order Card + Status Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Milestone Timeline */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#ECDAD4] pb-3">
            <h3 className="font-editorial text-2xl font-bold text-[#2E2926]">
              Stitching Progress Timeline
            </h3>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Est. Completion: {order.estimatedDelivery}
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#ECDAD4]">
            {order.statusTimeline.map((item, idx) => {
              const itemIdx = normalizeStatusIndex(item.status);
              const isDone = itemIdx <= currentIdx;
              const isCurrent = item.status === order.status;

              return (
                <div key={idx} className="relative text-left">
                  {/* Circle Indicator */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isDone
                        ? 'bg-[#B5563E] text-white ring-4 ring-[#F2C3B9]/40'
                        : 'bg-white border-2 border-[#ECDAD4] text-[#766B65]'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          isCurrent ? 'text-[#B5563E]' : isDone ? 'text-[#2E2926]' : 'text-[#766B65]'
                        }`}
                      >
                        {item.status}
                      </h4>
                      {item.timestamp && (
                        <span className="text-[11px] text-[#766B65] bg-[#FAF2EE] px-2 py-0.5 rounded-md">
                          {item.timestamp}
                        </span>
                      )}
                    </div>
                    {item.note ? (
                      <p className="text-xs text-[#766B65] mt-1">{item.note}</p>
                    ) : (
                      <p className="text-xs text-[#766B65] mt-1">
                        {isDone ? 'Completed' : 'Pending tailor action'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order Summary & Tailor Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Design Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#ECDAD4] shadow-xs flex items-center gap-4">
            <img
              src={order.design.imageUrl}
              alt={order.design.name}
              className="w-20 h-24 rounded-2xl object-cover border border-[#ECDAD4]"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-[#B5563E] font-bold">
                Tailoring Cut
              </span>
              <h4 className="font-editorial text-lg font-bold text-[#2E2926] truncate">
                {order.design.name}
              </h4>
              <p className="text-xs text-[#766B65]">{order.design.fabric} • Size {order.size}</p>
              <div className="text-xs font-bold text-[#B5563E] mt-1">
                Quote: {order.estimatedCost || `₹${order.amount}`}
              </div>
            </div>
          </div>

          {/* Customization Preferences if provided */}
          {order.customization && (
            <div className="bg-white rounded-3xl p-5 border border-[#ECDAD4] shadow-xs space-y-2 text-xs">
              <span className="font-bold text-[#2E2926] uppercase tracking-wider block">
                Personalized Specifications:
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-[#FAF2EE] p-2 rounded-xl">
                  <span className="text-[10px] text-[#766B65] block">Sleeve Length</span>
                  <span className="font-semibold text-[#2E2926]">{order.customization.sleeveLength}</span>
                </div>
                <div className="bg-[#FAF2EE] p-2 rounded-xl">
                  <span className="text-[10px] text-[#766B65] block">Neckline</span>
                  <span className="font-semibold text-[#2E2926]">{order.customization.neckline}</span>
                </div>
                <div className="bg-[#FAF2EE] p-2 rounded-xl">
                  <span className="text-[10px] text-[#766B65] block">Kurti Length</span>
                  <span className="font-semibold text-[#2E2926]">{order.customization.kurtiLength}</span>
                </div>
                <div className="bg-[#FAF2EE] p-2 rounded-xl">
                  <span className="text-[10px] text-[#766B65] block">Silhouette</span>
                  <span className="font-semibold text-[#2E2926]">{order.customization.silhouette}</span>
                </div>
              </div>
              {order.customization.addOns && order.customization.addOns.length > 0 && (
                <div className="pt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[#766B65]">Add-ons:</span>
                  {order.customization.addOns.map((add, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F2C3B9]/30 text-[#B5563E] font-medium">
                      {add}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tailor Info Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#ECDAD4] shadow-xs space-y-3">
            <span className="text-xs font-bold text-[#4A433E] uppercase tracking-wider block">
              Assigned Master Tailor:
            </span>
            <div className="flex items-center gap-3">
              <img
                src={order.tailor.profileImage}
                alt={order.tailor.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#ECDAD4]"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#2E2926]">{order.tailor.name}</h4>
                <p className="text-[11px] text-[#766B65] truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#B5563E]" />
                  <span>{order.tailor.location}</span>
                </p>
                <p className="text-[11px] text-[#B5563E] flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" />
                  <span>{order.tailor.phone}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Measurements Card */}
          <div className="bg-[#FAF2EE] rounded-3xl p-5 border border-[#ECDAD4] space-y-3 text-xs">
            <span className="font-bold text-[#2E2926] uppercase tracking-wider block">
              Submitted Measurements (Inches):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-2 rounded-xl border border-[#ECDAD4]">
                <span className="text-[10px] text-[#766B65] block">Bust</span>
                <span className="font-bold text-[#2E2926]">{order.measurements.bust}"</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#ECDAD4]">
                <span className="text-[10px] text-[#766B65] block">Waist</span>
                <span className="font-bold text-[#2E2926]">{order.measurements.waist}"</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#ECDAD4]">
                <span className="text-[10px] text-[#766B65] block">Hip</span>
                <span className="font-bold text-[#2E2926]">{order.measurements.hip}"</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#ECDAD4]">
                <span className="text-[10px] text-[#766B65] block">Length</span>
                <span className="font-bold text-[#2E2926]">{order.measurements.length}"</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#ECDAD4]">
                <span className="text-[10px] text-[#766B65] block">Sleeve</span>
                <span className="font-bold text-[#2E2926]">{order.measurements.sleeveLength}"</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#ECDAD4]">
                <span className="text-[10px] text-[#766B65] block">Size</span>
                <span className="font-bold text-[#2E2926]">{order.size}</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[11px] text-[#766B65] block font-semibold">Neck Style:</span>
              <p className="text-xs text-[#2E2926]">{order.measurements.neckStyle}</p>
            </div>

            {order.instructions && (
              <div className="pt-1 border-t border-[#ECDAD4]">
                <span className="text-[11px] text-[#766B65] block font-semibold">Special Notes:</span>
                <p className="text-xs text-[#2E2926] italic">"{order.instructions}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

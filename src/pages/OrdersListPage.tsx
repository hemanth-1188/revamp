import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Package,
  Scissors,
  ArrowRight,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const OrdersListPage: React.FC = () => {
  const { orders, navigateTo } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECDAD4] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B5563E]/10 text-[#B5563E] text-xs font-bold mb-2">
            <Package className="w-3.5 h-3.5" />
            Tailoring Orders
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#2E2926]">
            My Stitching Orders
          </h1>
          <p className="text-sm text-[#766B65] mt-1">
            Track real-time progress of your custom ethnic kurtis from master cutting to final fitting check.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('/recommendations')}
          className="px-5 py-2.5 rounded-xl bg-[#B5563E] text-white text-xs font-semibold hover:bg-[#9C4530] transition-colors shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Custom Order</span>
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#ECDAD4] space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#2E2926]">
            No Orders Placed Yet
          </h3>
          <p className="text-xs text-[#766B65] leading-relaxed">
            Upload a kurti photo, discover matching styles, and connect with a verified neighborhood tailor to begin your first order.
          </p>
          <button
            type="button"
            onClick={() => navigateTo('/upload')}
            className="px-6 py-3 rounded-xl bg-[#B5563E] text-white text-xs font-semibold hover:bg-[#9C4530] transition-colors shadow-xs"
          >
            Upload Inspiration Swatch
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigateTo(`/orders/${order.id}`)}
              className="bg-white rounded-3xl p-6 border border-[#ECDAD4] hover:border-[#B5563E] hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
            >
              {/* Design Image & Title */}
              <div className="flex items-center gap-4">
                <img
                  src={order.design.imageUrl}
                  alt={order.design.name}
                  className="w-20 h-24 rounded-2xl object-cover border border-[#ECDAD4] group-hover:scale-105 transition-transform"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#766B65]">{order.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF2EE] text-[#B5563E] text-[10px] font-bold border border-[#ECDAD4]">
                      {order.status}
                    </span>
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-[#2E2926] group-hover:text-[#B5563E] transition-colors">
                    {order.design.name}
                  </h3>
                  <p className="text-xs text-[#766B65]">
                    Tailor: <strong className="text-[#2E2926]">{order.tailor.name}</strong> • {order.tailor.location.split(',')[0]}
                  </p>
                  <p className="text-[11px] text-[#766B65]">
                    Size: {order.size} • Quote: {order.estimatedCost || `₹${order.amount}`}
                  </p>
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-[#ECDAD4] gap-2">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-[#766B65] block">Estimated Delivery</span>
                  <span className="text-xs font-bold text-[#2E2926] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#B5563E]" />
                    {order.estimatedDelivery}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#B5563E] group-hover:translate-x-1 transition-transform">
                  <span>Track Progress</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

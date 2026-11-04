import React from 'react';
import { useApp } from '../context/AppContext';
import { CustomerLocationMap } from '../components/CustomerLocationMap';
import {
  Upload,
  Sparkles,
  Heart,
  Scissors,
  Package,
  ArrowRight,
  Clock,
  Eye,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Flame,
  Wand2,
  Zap,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    user,
    catalog,
    recommendations,
    savedDesignIds,
    toggleSaveDesign,
    tailors,
    orders,
    currentOrder,
    navigateTo,
    setSelectedDesign,
    setSelectedTailor,
    updateUserLocation,
  } = useApp();

  // Filter saved designs
  const savedDesigns = catalog.filter((d) => savedDesignIds.includes(d.id));

  // Determine greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Fashion Enthusiast';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      {/* GREETING & INTRO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#ECDAD4] pb-6">
        <div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#2E2926] tracking-tight">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-sm text-[#766B65] mt-1 font-light">
            Let's turn your inspiration into something you can wear.
          </p>
        </div>

        {/* User Quick Info */}
        {user && (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#ECDAD4] shadow-2xs">
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border border-[#ECDAD4]"
              referrerPolicy="no-referrer"
            />
            <div className="text-xs">
              <p className="font-bold text-[#2E2926]">{user.name}</p>
              <p className="text-[#766B65] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#B5563E]" />
                {user.location}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* STATS OVERVIEW CARDS WITH DASHBOARD AI REVAMP ICON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#766B65]">Saved Designs</span>
            <div className="text-2xl font-bold text-[#2E2926] mt-1">{savedDesignIds.length}</div>
            <p className="text-[11px] text-[#B5563E] mt-0.5">Ready for stitching</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F2C3B9]/30 text-[#B5563E] flex items-center justify-center">
            <Heart className="w-6 h-6 fill-[#B5563E]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#766B65]">Stitching Orders</span>
            <div className="text-2xl font-bold text-[#2E2926] mt-1">{orders.length}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              {orders.filter((o) => o.status !== 'Completed').length} active in tailoring
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F2C3B9]/30 text-[#B5563E] flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#766B65]">Recommended Styles</span>
            <div className="text-2xl font-bold text-[#2E2926] mt-1">{recommendations.length}</div>
            <p className="text-[11px] text-[#766B65] mt-0.5">Matched from your swatch</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F2C3B9]/30 text-[#B5563E] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* CARD 4: NEIGHBORHOOD TAILORS DIRECTORY */}
        <div
          onClick={() => navigateTo('/tailors')}
          className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#B5563E] transition-all group"
        >
          <div>
            <span className="text-xs font-semibold text-[#766B65]">Master Tailors</span>
            <div className="text-2xl font-bold text-[#2E2926] mt-1">{tailors.length}</div>
            <p className="text-[11px] text-[#B5563E] mt-0.5 group-hover:underline">Explore map & hire →</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F2C3B9]/30 text-[#B5563E] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Scissors className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FEATURE CARDS ROW: UPLOAD INSPIRATION & TAILOR MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Standard AI Vision Swatch Upload */}
        <div className="bg-gradient-to-br from-[#FAF2EE] via-[#F8EDE9] to-[#F2C3B9]/30 rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B5563E]/15 text-[#B5563E] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              AI Computer Vision
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2E2926]">
              Have a design in mind?
            </h2>
            <p className="text-xs text-[#4A433E] leading-relaxed">
              Upload a kurti or fabric photo and discover similar styles. Extract dominant colors and classify ethnic patterns in seconds.
            </p>
          </div>
          <div className="pt-6 relative z-10">
            <button
              type="button"
              onClick={() => navigateTo('/upload')}
              className="px-5 py-3 rounded-xl bg-[#B5563E] text-white text-xs font-semibold hover:bg-[#9C4530] transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Inspiration</span>
            </button>
          </div>
          {/* Decorative background element */}
          <div className="hidden sm:block absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-[#F2C3B9]/40 blur-2xl pointer-events-none" />
        </div>

        {/* Card 2: HYPERLOCAL TAILOR MAP & 3D STUDIO */}
        <div className="bg-gradient-to-br from-[#2E2926] via-[#3D3633] to-[#4A433E] rounded-3xl p-6 sm:p-8 border border-[#2E2926] text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              Leaflet Geospatial Engine
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
              Connect With Neighborhood Master Tailors
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              Locate verified artisan boutiques near your location, filter by fabric specialty (Chanderi, Silk, Cotton), check transparent stitching quotes, and track your custom orders.
            </p>
          </div>
          <div className="pt-6 relative z-10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('/tailors')}
              className="px-5 py-3 rounded-xl bg-[#B5563E] hover:bg-[#9C4530] text-white font-bold text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Scissors className="w-4 h-4" />
              <span>Explore Tailors Map</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('/preview')}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>3D Fitting Room</span>
            </button>
          </div>
          {/* Decorative ambient background */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-[#B5563E]/40 blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* ACTIVE ORDER BANNER (IF ANY) */}
      {currentOrder && (
        <div className="bg-white rounded-3xl p-6 border border-[#ECDAD4] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECDAD4] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B5563E]/10 text-[#B5563E] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider">
                  Active Stitching Order
                </span>
                <h3 className="font-editorial text-xl font-bold text-[#2E2926]">
                  {currentOrder.design.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#F2C3B9]/40 text-[#B5563E] text-xs font-semibold">
                {currentOrder.status}
              </span>
              <button
                type="button"
                onClick={() => navigateTo(`/orders/${currentOrder.id}`)}
                className="px-4 py-2 rounded-xl bg-[#2E2926] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                Track Live Order
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#766B65]">Assigned Tailor</span>
              <p className="font-semibold text-[#2E2926] mt-0.5">{currentOrder.tailor.name}</p>
            </div>
            <div>
              <span className="text-[#766B65]">Size & Cut</span>
              <p className="font-semibold text-[#2E2926] mt-0.5">{currentOrder.size} ({currentOrder.design.style})</p>
            </div>
            <div>
              <span className="text-[#766B65]">Estimated Completion</span>
              <p className="font-semibold text-[#2E2926] mt-0.5">{currentOrder.estimatedDelivery}</p>
            </div>
            <div>
              <span className="text-[#766B65]">Order Reference</span>
              <p className="font-semibold text-[#2E2926] mt-0.5">{currentOrder.id}</p>
            </div>
          </div>
        </div>
      )}

      {/* RECENT RECOMMENDATIONS ROW */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-2xl font-bold text-[#2E2926]">
              Recent Recommendations
            </h3>
            <p className="text-xs text-[#766B65]">Styles curated to match your uploaded inspiration</p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/recommendations')}
            className="text-xs font-semibold text-[#B5563E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({recommendations.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recommendations.slice(0, 4).map((design) => {
            const isSaved = savedDesignIds.includes(design.id);
            return (
              <div
                key={design.id}
                className="bg-white rounded-2xl border border-[#ECDAD4] overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="relative h-64 overflow-hidden bg-[#FAF2EE]">
                  <img
                    src={design.imageUrl}
                    alt={design.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#B5563E] border border-[#ECDAD4]">
                    {design.matchScore}% Match
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveDesign(design.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-[#ECDAD4] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isSaved ? 'text-[#B5563E] fill-[#B5563E]' : 'text-[#766B65]'
                      }`}
                    />
                  </button>

                  <div className="absolute bottom-2 left-2 right-2 flex gap-1.5">
                    {design.hexPalette.map((hex, i) => (
                      <span
                        key={i}
                        className="w-3 h-3 rounded-full border border-white shadow-2xs"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-4 space-y-2 text-left">
                  <div className="text-[11px] font-medium text-[#766B65] uppercase tracking-wider">
                    {design.fabric} • {design.style}
                  </div>
                  <h4 className="font-editorial text-lg font-bold text-[#2E2926] leading-tight line-clamp-1">
                    {design.name}
                  </h4>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-[#2E2926]">
                      Est. ₹{design.priceEstimate}
                    </span>
                    <span className="text-[11px] text-[#766B65]">
                      {design.availableTailorCount} tailors nearby
                    </span>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDesign(design);
                        navigateTo(`/preview/${design.id}`);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-[#FAF2EE] text-[#B5563E] hover:bg-[#F2C3B9]/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>3D Fit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDesign(design);
                        navigateTo(`/design/${design.id}`);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-[#2E2926] text-white hover:bg-black text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SAVED DESIGNS SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-2xl font-bold text-[#2E2926]">
              Saved Designs ({savedDesigns.length})
            </h3>
            <p className="text-xs text-[#766B65]">Kurtis you bookmarked to stitch</p>
          </div>
        </div>

        {savedDesigns.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#ECDAD4]">
            <Heart className="w-8 h-8 text-[#B5563E]/40 mx-auto mb-2" />
            <p className="text-xs text-[#766B65]">No designs saved yet. Browse recommendations to bookmark styles!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {savedDesigns.slice(0, 3).map((design) => (
              <div
                key={design.id}
                onClick={() => {
                  setSelectedDesign(design);
                  navigateTo(`/design/${design.id}`);
                }}
                className="bg-white rounded-2xl p-3 border border-[#ECDAD4] hover:border-[#B5563E] transition-all flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={design.imageUrl}
                  alt={design.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#2E2926] group-hover:text-[#B5563E] transition-colors truncate">
                    {design.name}
                  </h4>
                  <p className="text-[11px] text-[#766B65]">{design.fabric} • {design.style}</p>
                  <span className="text-[11px] font-bold text-[#B5563E]">Est. ₹{design.priceEstimate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LEAFLET GEOSPATIAL ENGINE & LIVE LOCATION ACCESS */}
      <CustomerLocationMap
        user={user}
        tailors={tailors}
        onUpdateLocation={(newAddress, lat, lng) => updateUserLocation(newAddress, lat, lng)}
        onSelectTailor={(tailor) => setSelectedTailor(tailor)}
        onProceedToOrder={(tailor) => {
          setSelectedTailor(tailor);
          navigateTo('/order');
        }}
      />

      {/* NEARBY TAILORS SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-editorial text-2xl font-bold text-[#2E2926]">
              Verified Neighborhood Tailors
            </h3>
            <p className="text-xs text-[#766B65]">Skilled artisans registered near your location</p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/tailors')}
            className="text-xs font-semibold text-[#B5563E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Tailor Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tailors.slice(0, 3).map((tailor) => (
            <div
              key={tailor.id}
              onClick={() => {
                setSelectedTailor(tailor);
                navigateTo(`/tailors/${tailor.id}`);
              }}
              className="bg-white rounded-2xl p-4 border border-[#ECDAD4] hover:border-[#B5563E] hover:shadow-xs transition-all cursor-pointer group text-left"
            >
              <div className="flex items-start gap-3">
                <img
                  src={tailor.profileImage}
                  alt={tailor.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#ECDAD4]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#2E2926] group-hover:text-[#B5563E] transition-colors truncate">
                      {tailor.name}
                    </h4>
                    <span className="text-xs font-semibold text-[#2E2926]">
                      ★ {tailor.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#766B65] truncate">{tailor.location.split(',')[0]}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className="text-[#B5563E] font-medium">{tailor.distance} km</span>
                    <span>•</span>
                    <span className="text-[#4A433E]">{tailor.priceRange}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

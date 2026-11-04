import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Eye,
  Scissors,
  Heart,
  ArrowLeft,
  Share2,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { KurtiDesign } from '../types';
import { FashnTryOnModal } from '../components/FashnTryOnModal';

export const DesignDetailPage: React.FC = () => {
  const {
    catalog,
    recommendations,
    selectedDesign,
    setSelectedDesign,
    savedDesignIds,
    toggleSaveDesign,
    navigateTo,
    routeParams,
    showToast,
  } = useApp();

  // Find design either from recommendations, catalog, or selectedDesign
  const designId = routeParams?.id || selectedDesign?.id;
  const design =
    (recommendations && recommendations.find((d) => d.id === designId)) ||
    (catalog && catalog.find((d) => d.id === designId)) ||
    selectedDesign ||
    catalog[0];

  const [activeColor, setActiveColor] = useState(design.hexPalette[0] || '#B5563E');
  const [selectedView, setSelectedView] = useState<'front' | 'back' | 'side'>('front');
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const isSaved = savedDesignIds.includes(design.id);

  const activeImageUrl = useMemo(() => {
    if (selectedView === 'back' && design.backImage) return design.backImage;
    if (selectedView === 'side') {
      const sideImg = (design as any).sideImage;
      if (sideImg) return sideImg;
    }
    return design.frontImage || design.imageUrl;
  }, [selectedView, design]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Design link copied to clipboard!', 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigateTo('/recommendations')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#766B65] hover:text-[#2E2926] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Recommendations</span>
      </button>

      {/* Main Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Large Editorial Image & View Angle Toggles */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl p-3 border border-[#ECDAD4] shadow-md overflow-hidden relative group">
            <div className="h-[520px] rounded-2xl overflow-hidden bg-[#FAF2EE]">
              <img
                src={activeImageUrl}
                alt={`${design.name} - ${selectedView} view`}
                className="w-full h-full object-cover transition-all duration-500"
              />
            </div>

            {/* Match score chip */}
            {design.matchScore && (
              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#ECDAD4] text-xs font-bold text-[#B5563E] shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{design.matchScore}% Match With Your Fabric</span>
              </div>
            )}

            {/* Favorite & Share */}
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSaveDesign(design.id)}
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-[#ECDAD4] flex items-center justify-center hover:scale-110 transition-transform shadow-xs cursor-pointer"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isSaved ? 'text-[#B5563E] fill-[#B5563E]' : 'text-[#766B65]'
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-[#ECDAD4] flex items-center justify-center hover:scale-110 transition-transform shadow-xs cursor-pointer text-[#766B65] hover:text-[#2E2926]"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Angle Selector Tabs */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-white/20">
              {(['front', 'back', 'side'] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setSelectedView(view)}
                  className={`px-3.5 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    selectedView === view
                      ? 'bg-white text-[#2E2926] shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {view} Angle
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Specifications & CTA */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#B5563E] uppercase tracking-wider">
              <span>{design.collection === 'men' ? "Men's Collection" : "Women's Collection"}</span>
              <span>•</span>
              <span>{design.fabric}</span>
              <span>•</span>
              <span>{design.style}</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#2E2926] leading-tight">
              {design.name}
            </h1>
            <p className="text-sm text-[#766B65] leading-relaxed font-light">
              {design.description}
            </p>
          </div>

          {/* Pricing & Tailor readiness */}
          <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#766B65] block">Estimated Stitching Cost</span>
              <div className="text-2xl font-bold text-[#2E2926]">₹{design.priceEstimate || design.price || 850}</div>
              <span className="text-[11px] text-[#766B65]">Excludes raw fabric • Includes bespoke fitting</span>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                {design.availableTailorCount} Tailors Available
              </span>
              <p className="text-[11px] text-[#766B65] mt-1">Ready for custom sizing</p>
            </div>
          </div>

          {/* Color Palette Swatches */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#4A433E] uppercase tracking-wider block">
              Detected Fabric Color Palette:
            </span>
            <div className="flex items-center gap-3">
              {design.hexPalette.map((hex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveColor(hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    activeColor === hex
                      ? 'border-[#B5563E] bg-white shadow-xs scale-105'
                      : 'border-[#ECDAD4] bg-[#FDFAF9]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white shadow-2xs"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-xs font-medium text-[#2E2926]">
                    {design.colors[i] || hex}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Style Specifications */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#4A433E] uppercase tracking-wider block">
              Style Specifications:
            </span>
            <div className="flex flex-wrap gap-2">
              {design.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-white border border-[#ECDAD4] text-xs text-[#4A433E]"
                >
                  {tag}
                </span>
              ))}
              <span className="px-3 py-1 rounded-lg bg-[#FAF2EE] text-[#B5563E] text-xs font-semibold border border-[#ECDAD4]">
                Occasion: {design.occasion}
              </span>
            </div>
          </div>

          {/* Primary Action CTAs */}
          <div className="pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. CUSTOMIZE IN 3D */}
              <button
                type="button"
                onClick={() => {
                  setSelectedDesign(design);
                  navigateTo(`/preview/${design.id}`);
                }}
                className="py-3.5 px-4 rounded-xl bg-[#2E2926] text-white hover:bg-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Eye className="w-4 h-4 text-[#D4AF37]" />
                <span>Customize in 3D</span>
              </button>

              {/* 2. TRY ON ME */}
              <button
                type="button"
                onClick={() => setIsTryOnOpen(true)}
                className="py-3.5 px-4 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Try On Me</span>
              </button>
            </div>

            {/* Find Nearby Tailors */}
            <button
              type="button"
              onClick={() => {
                setSelectedDesign(design);
                navigateTo('/tailors');
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-[#B5563E] text-white hover:bg-[#9C4530] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Scissors className="w-4 h-4" />
              <span>Connect With Neighborhood Tailors</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-[#766B65] text-center">
              Guaranteed stitch turnaround within 4–7 days with verified local neighborhood tailors.
            </p>
          </div>
        </div>
      </div>

      {/* FASHN Virtual Try-On Modal */}
      {isTryOnOpen && (
        <FashnTryOnModal
          isOpen={isTryOnOpen}
          onClose={() => setIsTryOnOpen(false)}
          garmentImageUrl={activeImageUrl}
          garmentName={design.name}
          category={
            design.category === 'trousers'
              ? 'bottoms'
              : design.category === 'gown' ||
                design.category === 'anarkali' ||
                (design.silhouette && design.silhouette.toLowerCase().includes('anarkali'))
              ? 'one-pieces'
              : 'tops'
          }
        />
      )}
    </div>
  );
};

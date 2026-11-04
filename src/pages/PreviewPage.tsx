import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ThreeMannequin, ThreeMannequinHandle } from '../components/ThreeMannequin';
import {
  ArrowLeft,
  Scissors,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  Eye,
  Layers,
  Ruler,
  Compass,
  Zap,
  RefreshCw,
  Camera,
} from 'lucide-react';
import { generateGrokGarment2D } from '../lib/grokService';
import { FashnTryOnModal } from '../components/FashnTryOnModal';

export const PreviewPage: React.FC = () => {
  const {
    catalog,
    recommendations,
    selectedDesign,
    setSelectedDesign,
    navigateTo,
    routeParams,
    uploadedImage,
    showToast,
  } = useApp();

  const mannequinRef = useRef<ThreeMannequinHandle>(null);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [tryOnImage, setTryOnImage] = useState<string>('');

  // Keep selected design context safely from recommendations or catalog
  const designId = routeParams?.id || selectedDesign?.id;
  const design =
    (recommendations && recommendations.find((d) => d.id === designId)) ||
    (catalog && catalog.find((d) => d.id === designId)) ||
    selectedDesign ||
    catalog[0];

  const [activeColor, setActiveColor] = useState(design.hexPalette[0] || '#B5563E');
  const [activeView, setActiveView] = useState<'front' | 'back' | 'side' | 'free'>('front');
  const [activeTab, setActiveTab] = useState<'3d' | 'reference2d'>('3d');

  // Grok 2D Garment Generation State
  const [frontImageUrl, setFrontImageUrl] = useState<string>(design.frontImage || design.imageUrl);
  const [backImageUrl, setBackImageUrl] = useState<string>(design.backImage || design.frontImage || design.imageUrl);
  const [isGeneratingGrok2D, setIsGeneratingGrok2D] = useState(false);
  const [grok2DSuccess, setGrok2DSuccess] = useState(false);

  const handleOpenTryOn = () => {
    let snap = null;
    if (activeTab === '3d' && mannequinRef.current) {
      snap = mannequinRef.current.takeSnapshot();
    }
    const garmentToUse = snap || frontImageUrl || design.frontImage || design.imageUrl;
    setTryOnImage(garmentToUse);
    setIsTryOnOpen(true);
  };

  const handleCaptureSnapshot = () => {
    if (mannequinRef.current) {
      const snap = mannequinRef.current.takeSnapshot();
      if (snap) {
        const link = document.createElement('a');
        link.download = `${design.name.replace(/\s+/g, '_')}_3D_Studio.jpg`;
        link.href = snap;
        link.click();
        showToast('3D Studio snapshot downloaded!', 'success');
      }
    }
  };

  const handleGenerateGrok2D = async () => {
    setIsGeneratingGrok2D(true);
    try {
      const res = await generateGrokGarment2D({
        fabricImageUrl: uploadedImage || design.designSpecification?.fabricImageUrl,
        garmentType: design.category === 'short-kurti' ? 'Short Kurti' : 'Kurti',
        silhouette: design.silhouette || design.style || 'A-line',
        pattern: design.pattern,
        primaryColor: activeColor,
        neckline: design.neckline,
        sleeves: design.sleeves,
        length: design.length,
        accentColors: design.hexPalette,
      });

      setFrontImageUrl(res.frontImageUrl);
      setBackImageUrl(res.backImageUrl);
      setGrok2DSuccess(true);
      showToast('2D Garment views generated with Grok AI!', 'success');
    } catch (err: any) {
      showToast(`Grok generation: ${err.message}`, 'error');
    } finally {
      setIsGeneratingGrok2D(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECDAD4] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo(`/design/${design.id}`)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#766B65] hover:text-[#2E2926] p-2 rounded-xl bg-white border border-[#ECDAD4] hover:bg-[#FAF2EE] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Design</span>
          </button>

          <div>
            <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider">
              3D Virtual Fitting Room
            </span>
            <h1 className="font-editorial text-2xl font-bold text-[#2E2926]">
              {design.name}
            </h1>
          </div>
        </div>

        {/* View Toggle Tabs & Virtual Try-On Launcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-[#FAF2EE] p-1 rounded-2xl border border-[#ECDAD4] flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('3d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === '3d'
                  ? 'bg-white text-[#B5563E] shadow-xs'
                  : 'text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D Mannequin Stage</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reference2d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'reference2d'
                  ? 'bg-white text-[#B5563E] shadow-xs'
                  : 'text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Fabric to Garment (Grok AI)</span>
            </button>
          </div>

          {activeTab === '3d' && (
            <button
              type="button"
              onClick={handleCaptureSnapshot}
              className="px-3 py-2 rounded-xl bg-white border border-[#ECDAD4] hover:bg-[#FAF2EE] text-xs font-bold text-[#2E2926] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Download High-Resolution Studio Snapshot"
            >
              <Camera className="w-3.5 h-3.5 text-[#B5563E]" />
              <span>Snapshot</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenTryOn}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Try On Me</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Studio / 2D Reference + Design Specification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive 3D Mannequin OR Front/Back Reference Images */}
        <div className="lg:col-span-8 space-y-4">
          {activeTab === '3d' ? (
            <div className="h-[580px] rounded-3xl overflow-hidden shadow-sm">
              <ThreeMannequin
                ref={mannequinRef}
                design={design}
                fabricImage={uploadedImage || design.designSpecification?.fabricImageUrl}
                customColor={activeColor}
                onColorChange={(hex) => setActiveColor(hex)}
                activeView={activeView}
                onViewChange={(v) => setActiveView(v)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Grok 2D Generation Control Header */}
              <div className="bg-gradient-to-r from-[#FAF2EE] via-[#F8EDE9] to-[#F2C3B9]/20 p-4 rounded-3xl border border-[#ECDAD4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-1.5 text-[#B5563E] text-xs font-bold">
                    <Zap className="w-3.5 h-3.5 fill-[#B5563E]" />
                    <span>Grok AI 2D Fabric-to-Garment Engine</span>
                  </div>
                  <p className="text-xs text-[#766B65] mt-0.5">
                    Synthesizes photorealistic front and back catalog flat-lays from your detected fabric swatch and specs.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateGrok2D}
                  disabled={isGeneratingGrok2D}
                  className="px-4 py-2.5 rounded-xl bg-[#B5563E] hover:bg-[#9C4530] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                >
                  {isGeneratingGrok2D ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating with Grok...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Regenerate with Grok AI</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front Reference */}
                <div className="bg-white p-4 rounded-3xl border border-[#ECDAD4] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#B5563E] uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#B5563E]" />
                      Front View (2D Garment)
                    </span>
                    <span className="text-[11px] font-semibold text-[#766B65] bg-[#FAF2EE] px-2.5 py-0.5 rounded-full border border-[#ECDAD4]">
                      {design.neckline || 'Round with Slit'}
                    </span>
                  </div>
                  <div className="h-[460px] rounded-2xl overflow-hidden bg-[#FAF2EE] relative group">
                    <img
                      src={frontImageUrl}
                      alt={`${design.name} Front View`}
                      className="w-full h-full object-cover"
                    />
                    {grok2DSuccess && (
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                        ⚡ Grok AI Synthesized
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#766B65] leading-relaxed">
                    <strong className="text-[#2E2926]">Front Details:</strong> Tailored with {design.neckline}, placket button placement, and structured chest darts.
                  </div>
                </div>

                {/* Back Reference */}
                <div className="bg-white p-4 rounded-3xl border border-[#ECDAD4] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#B5563E] uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#B5563E]" />
                      Back View (2D Garment)
                    </span>
                    <span className="text-[11px] font-semibold text-[#766B65] bg-[#FAF2EE] px-2.5 py-0.5 rounded-full border border-[#ECDAD4]">
                      Back Cut & Dori Tie
                    </span>
                  </div>
                  <div className="h-[460px] rounded-2xl overflow-hidden bg-[#FAF2EE] relative group">
                    <img
                      src={backImageUrl}
                      alt={`${design.name} Back View`}
                      className="w-full h-full object-cover"
                    />
                    {grok2DSuccess && (
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                        ⚡ Grok AI Synthesized
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#766B65] leading-relaxed">
                    <strong className="text-[#2E2926]">Back Details:</strong> Clean back contour with matching pattern continuity, concealed back zipper/dori latkan ties, and high shoulder seam alignment.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Camera Quick Control Strip below 3D */}
          {activeTab === '3d' && (
            <div className="p-3 bg-white rounded-2xl border border-[#ECDAD4] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#766B65]">
                <Info className="w-4 h-4 text-[#B5563E]" />
                <span>Quick Camera Angles:</span>
              </div>
              <div className="flex items-center gap-2">
                {(['front', 'back', 'side'] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setActiveView(view)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                      activeView === view
                        ? 'bg-[#B5563E] text-white shadow-xs'
                        : 'bg-[#FAF2EE] text-[#2E2926] hover:bg-[#F2C3B9]/30'
                    }`}
                  >
                    {view} Angle
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-[#766B65]">
                Drape simulation rendered in WebGL
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Tailoring Specs & Direct Next Action */}
        <div className="lg:col-span-4 space-y-5">
          {/* Garment Details & Tailoring Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-[#ECDAD4] shadow-xs space-y-4">
            <div className="border-b border-[#ECDAD4] pb-3">
              <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider">
                Pattern & Fit Specifications
              </span>
              <h2 className="font-editorial text-xl font-bold text-[#2E2926] mt-0.5">
                Tailoring Instructions
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF2EE]">
                <span className="text-[#766B65] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#B5563E]" />
                  Silhouette:
                </span>
                <span className="font-bold text-[#2E2926]">{design.style || design.silhouette}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF2EE]">
                <span className="text-[#766B65]">Neckline (Front):</span>
                <span className="font-bold text-[#2E2926]">{design.neckline || 'Round with Slit'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF2EE]">
                <span className="text-[#766B65]">Back Neck Cut:</span>
                <span className="font-bold text-[#2E2926]">Keyhole with Latkan Ties</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF2EE]">
                <span className="text-[#766B65]">Sleeve Style:</span>
                <span className="font-bold text-[#2E2926]">{design.sleeves || 'Three-Quarter'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF2EE]">
                <span className="text-[#766B65]">Garment Length:</span>
                <span className="font-bold text-[#2E2926]">{design.length || 'Calf Length (44")'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF2EE]">
                <span className="text-[#766B65]">Recommended Fabric:</span>
                <span className="font-bold text-[#2E2926]">{design.fabric}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF2EE]">
                <span className="text-[#766B65]">Inner Lining:</span>
                <span className="font-bold text-[#2E2926]">Pure Mulmul Cotton Included</span>
              </div>
            </div>

            {/* Special Instructions */}
            {design.specialInstructions && (
              <div className="p-3 rounded-2xl bg-[#FFF8F5] border border-[#F2C3B9] text-xs space-y-1">
                <span className="font-bold text-[#B5563E] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Master Tailor Note:
                </span>
                <p className="text-[#766B65] leading-relaxed">
                  {design.specialInstructions}
                </p>
              </div>
            )}

            {/* Color Palette Switcher */}
            <div className="pt-2 border-t border-[#ECDAD4] space-y-2">
              <label className="text-xs font-bold text-[#2E2926] uppercase tracking-wider block">
                Active Fabric Palette:
              </label>
              <div className="flex flex-wrap gap-2">
                {design.hexPalette.map((hex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveColor(hex)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      activeColor === hex
                        ? 'border-[#B5563E] bg-[#F2C3B9]/30 font-bold text-[#2E2926]'
                        : 'border-[#ECDAD4] bg-[#FDFAF9] text-[#766B65]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: hex }}
                    />
                    <span>{design.colors[idx] || hex}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Tailor Connection Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#ECDAD4] shadow-xs space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#766B65]">Estimated Stitching</span>
                <div className="text-2xl font-bold text-[#2E2926]">
                  ₹{design.priceEstimate || design.price || 650}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {design.availableTailorCount || 7} Tailors Ready
              </span>
            </div>

            {/* Direct Flow CTAs */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleOpenTryOn}
                className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Virtual Try-On (FASHN AI)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDesign(design);
                  navigateTo('/tailors');
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#B5563E] text-white hover:bg-[#9C4530] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <Scissors className="w-4 h-4" />
                <span>Connect with Nearby Tailor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDesign(design);
                  navigateTo('/order/new');
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#FAF2EE] text-[#B5563E] hover:bg-[#F2C3B9]/30 border border-[#ECDAD4] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Direct Custom Sizing & Booking</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#766B65] pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free alteration guarantee included with all partner boutiques.</span>
            </div>
          </div>
        </div>
      </div>

      {/* FASHN Virtual Try-On Modal */}
      {isTryOnOpen && (
        <FashnTryOnModal
          isOpen={isTryOnOpen}
          onClose={() => setIsTryOnOpen(false)}
          garmentImageUrl={tryOnImage}
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

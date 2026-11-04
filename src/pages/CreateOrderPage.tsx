import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Scissors,
  Ruler,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Upload,
  ArrowRight,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Measurements, Tailor, KurtiDesign } from '../types';

export const CreateOrderPage: React.FC = () => {
  const {
    user,
    catalog,
    tailors,
    selectedDesign,
    selectedTailor,
    setSelectedDesign,
    setSelectedTailor,
    createOrder,
    navigateTo,
    showToast,
    userPreferences,
  } = useApp();

  const fallbackDesign: KurtiDesign = {
    id: 'K001',
    name: 'Bespoke Custom Garment',
    category: 'kurti',
    description: 'Custom made-to-measure tailored garment.',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    frontImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    backImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    colors: ['Terracotta'],
    hexPalette: ['#B5563E'],
    pattern: 'Solid',
    fabric: 'Cotton',
    occasion: 'Casual',
    style: 'A-line',
    neckline: 'Round Neck',
    sleeves: 'Three-Quarter',
    length: 'Calf Length',
    silhouette: 'A-line',
    price: 650,
    priceEstimate: 650,
    popularityScore: 90,
    tags: ['Custom', 'Cotton'],
    availableTailorCount: 1,
  };

  const fallbackTailor: Tailor = {
    id: 'T_ASSIGNED',
    name: 'Assigned Master Tailor',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    location: user?.location || 'Verified Artisan Workshop',
    latitude: 20.5937,
    longitude: 78.9629,
    rating: 5.0,
    reviewCount: 0,
    specializations: ['Bespoke Kurtis'],
    experience: 8,
    priceRange: '₹550 - ₹1,200',
    typicalStitchingRange: 'Typical stitching range: ₹550 – ₹1,200',
    startingPrice: 550,
    distance: 1.0,
    availability: 'Available this week',
    turnaroundTime: '3 – 5 days',
    customizationTypes: ['Custom sleeves', 'Pockets'],
    description: 'Bespoke tailoring with verified finishing.',
    phone: '',
    sampleImages: [],
  };

  const activeDesign = selectedDesign || (catalog && catalog.length > 0 ? catalog[0] : fallbackDesign);
  const activeTailor = selectedTailor || (tailors && tailors.length > 0 ? tailors[0] : fallbackTailor);

  // Form State
  const [size, setSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Custom'>('M');
  const [bust, setBust] = useState<number>(36);
  const [waist, setWaist] = useState<number>(30);
  const [hip, setHip] = useState<number>(39);
  const [length, setLength] = useState<number>(44);
  const [sleeveLength, setSleeveLength] = useState<number>(16);
  const [neckStyle, setNeckStyle] = useState<string>(
    userPreferences?.neckline ? `${userPreferences.neckline} Neckline` : 'Round Neck with Keyhole & Wooden Button'
  );
  const [instructions, setInstructions] = useState<string>(
    userPreferences?.addOns?.length
      ? `Preferences: ${userPreferences.addOns.join(', ')}`
      : ''
  );
  const [includeLining, setIncludeLining] = useState<boolean>(true);
  const [expressDelivery, setExpressDelivery] = useState<boolean>(false);
  const [referenceSlipUrl, setReferenceSlipUrl] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Pricing calculations
  const baseStitch = activeTailor?.startingPrice || 550;
  const liningFee = includeLining ? 150 : 0;
  const expressFee = expressDelivery ? 150 : 0;
  const totalAmount = baseStitch + liningFee + expressFee;

  // Handle standard size presets
  const handleSizeChange = (newSize: typeof size) => {
    setSize(newSize);
    if (newSize === 'XS') { setBust(32); setWaist(26); setHip(35); setLength(42); }
    else if (newSize === 'S') { setBust(34); setWaist(28); setHip(37); setLength(43); }
    else if (newSize === 'M') { setBust(36); setWaist(30); setHip(39); setLength(44); }
    else if (newSize === 'L') { setBust(38); setWaist(32); setHip(42); setLength(44); }
    else if (newSize === 'XL') { setBust(40); setWaist(34); setHip(44); setLength(45); }
    else if (newSize === 'XXL') { setBust(42); setWaist(36); setHip(46); setLength(45); }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    try {
      // Simulate Razorpay checkout abstraction
      await new Promise((r) => setTimeout(r, 1200));

      const measurements: Measurements = {
        size,
        bust,
        waist,
        hip,
        length,
        sleeveLength,
        neckStyle,
      };

      const newOrder = await createOrder({
        design: activeDesign,
        tailor: activeTailor,
        size,
        measurements,
        instructions,
        amount: totalAmount,
        stitchingCharge: baseStitch,
        liningCharge: liningFee,
        expressDelivery,
        referenceImageUrl: referenceSlipUrl || activeDesign.imageUrl,
        customization: userPreferences || undefined,
        estimatedCost: `₹${totalAmount} – ₹${totalAmount + 200}`,
      });

      // Confetti burst on successful order placement!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#B5563E', '#F2C3B9', '#2E2926'],
        });
      } catch {}

      navigateTo(`/orders/${newOrder.id}`);
    } catch (err) {
      console.error(err);
      showToast('Order placement failed. Please retry.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B5563E]/10 text-[#B5563E] text-xs font-bold">
          <Scissors className="w-3.5 h-3.5" />
          Step 4: Custom Made-To-Measure Order
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#2E2926]">
          Place Stitching Order
        </h1>
        <p className="text-sm text-[#766B65]">
          Submit your measurements and instructions. Your selected tailor will review before cutting.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Design, Tailor, Measurements */}
        <div className="lg:col-span-8 space-y-6">
          {/* Selected Design & Tailor Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#ECDAD4] shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Design Pick */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4]">
              <img
                src={activeDesign.imageUrl}
                alt={activeDesign.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[#B5563E] font-bold uppercase tracking-wider block">
                  Design Selected
                </span>
                <h4 className="text-xs font-bold text-[#2E2926] truncate">{activeDesign.name}</h4>
                <p className="text-[11px] text-[#766B65]">{activeDesign.fabric} • {activeDesign.style}</p>
              </div>
            </div>

            {/* Tailor Pick */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4]">
              <img
                src={activeTailor.profileImage}
                alt={activeTailor.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[#B5563E] font-bold uppercase tracking-wider block">
                  Assigned Tailor
                </span>
                <h4 className="text-xs font-bold text-[#2E2926] truncate">{activeTailor.name}</h4>
                <p className="text-[11px] text-[#766B65]">★ {activeTailor.rating} • {activeTailor.distance} km</p>
              </div>
            </div>
          </div>

          {/* Measurements Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-[#ECDAD4] pb-4">
              <Ruler className="w-5 h-5 text-[#B5563E]" />
              <div>
                <h3 className="font-editorial text-2xl font-bold text-[#2E2926]">
                  Body Measurements (Inches)
                </h3>
                <p className="text-xs text-[#766B65]">Select a standard Indian size or customize specific values</p>
              </div>
            </div>

            {/* Standard Size Selector Chips */}
            <div>
              <label className="text-xs font-bold text-[#2E2926] uppercase tracking-wider block mb-2">
                Quick Size Preset:
              </label>
              <div className="flex flex-wrap gap-2">
                {(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleSizeChange(sz)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      size === sz
                        ? 'bg-[#B5563E] text-white shadow-xs'
                        : 'bg-[#FAF2EE] text-[#4A433E] hover:bg-[#F2C3B9]/30 border border-[#ECDAD4]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-[#4A433E] block mb-1">Bust (inches)</label>
                <input
                  type="number"
                  value={bust}
                  onChange={(e) => {
                    setBust(Number(e.target.value));
                    setSize('Custom');
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] font-bold text-[#2E2926]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#4A433E] block mb-1">Waist (inches)</label>
                <input
                  type="number"
                  value={waist}
                  onChange={(e) => {
                    setWaist(Number(e.target.value));
                    setSize('Custom');
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] font-bold text-[#2E2926]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#4A433E] block mb-1">Hip (inches)</label>
                <input
                  type="number"
                  value={hip}
                  onChange={(e) => {
                    setHip(Number(e.target.value));
                    setSize('Custom');
                  }}
                  className="w-full p-2.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] font-bold text-[#2E2926]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#4A433E] block mb-1">Kurti Length (inches)</label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] font-bold text-[#2E2926]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#4A433E] block mb-1">Sleeve Length (inches)</label>
                <input
                  type="number"
                  value={sleeveLength}
                  onChange={(e) => setSleeveLength(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] font-bold text-[#2E2926]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#4A433E] block mb-1">Neck Style Pattern</label>
                <select
                  value={neckStyle}
                  onChange={(e) => setNeckStyle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs font-semibold text-[#2E2926]"
                >
                  <option value="Round Neck with Keyhole & Wooden Button">Round with Keyhole</option>
                  <option value="Mandarin / Chinese Collar with Front Slit">Mandarin Collar</option>
                  <option value="Angrakha Overlap with Tassel Ties">Angrakha Overlap</option>
                  <option value="V-Neck with Contrast Piping">V-Neck with Piping</option>
                  <option value="Boat Neck with Zari Lace">Boat Neck</option>
                </select>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="font-semibold text-[#4A433E] block mb-1 text-xs">
                Custom Tailoring Instructions:
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="E.g. Please keep the sleeves slightly loose, add right side pocket, etc."
                className="w-full p-3 text-xs rounded-xl border border-[#ECDAD4] bg-[#FDFAF9]"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Cost Breakdown & Payment Abstraction */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#ECDAD4] shadow-md space-y-5">
            <h3 className="font-editorial text-2xl font-bold text-[#2E2926]">
              Order Summary
            </h3>

            {/* Checkboxes for addons */}
            <div className="space-y-3 pt-2 border-t border-[#ECDAD4] text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#FDFAF9] border border-[#ECDAD4] cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeLining}
                    onChange={(e) => setIncludeLining(e.target.checked)}
                    className="rounded text-[#B5563E] focus:ring-[#B5563E]"
                  />
                  <span>Attach Pure Cotton Inner Lining</span>
                </div>
                <span className="font-bold text-[#2E2926]">+₹150</span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#FDFAF9] border border-[#ECDAD4] cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={expressDelivery}
                    onChange={(e) => setExpressDelivery(e.target.checked)}
                    className="rounded text-[#B5563E] focus:ring-[#B5563E]"
                  />
                  <span>Express 3-Day Turnaround</span>
                </div>
                <span className="font-bold text-[#2E2926]">+₹150</span>
              </label>
            </div>

            {/* Detailed Line Items */}
            <div className="space-y-2 pt-3 border-t border-[#ECDAD4] text-xs">
              <div className="flex justify-between text-[#766B65]">
                <span>Base Master Tailoring:</span>
                <span className="font-bold text-[#2E2926]">₹{baseStitch}</span>
              </div>
              {includeLining && (
                <div className="flex justify-between text-[#766B65]">
                  <span>Cotton Lining Material & Stitch:</span>
                  <span className="font-bold text-[#2E2926]">₹{liningFee}</span>
                </div>
              )}
              {expressDelivery && (
                <div className="flex justify-between text-[#766B65]">
                  <span>Express Priority Queue:</span>
                  <span className="font-bold text-[#2E2926]">₹{expressFee}</span>
                </div>
              )}
              <div className="flex justify-between text-[#766B65]">
                <span>Fitting Check & Alteration Warranty:</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>

              <div className="pt-3 border-t border-[#ECDAD4] flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#2E2926]">Total Stitching Cost:</span>
                <span className="text-2xl font-bold text-[#B5563E]">₹{totalAmount}</span>
              </div>
            </div>

            {/* Payment Gateway Box */}
            <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#B5563E]/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#B5563E] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  Secure Payment Gateway
                </span>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">
                  Verified Checkout
                </span>
              </div>
              <p className="text-[11px] text-[#766B65] leading-tight">
                Direct tailor payment processing with 100% order protection and tracking.
              </p>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isProcessingPayment}
              className="w-full py-4 rounded-2xl bg-[#B5563E] text-white text-sm font-bold hover:bg-[#9C4530] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <span>Sending Stitching Request...</span>
              ) : (
                <>
                  <span>Send Stitching Request (Est. ₹{totalAmount})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#766B65]">
              <ShieldCheck className="w-4 h-4 text-[#B5563E]" />
              <span>100% Secure Made-to-Measure Guarantee</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

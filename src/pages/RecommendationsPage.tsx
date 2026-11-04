import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Filter,
  Eye,
  Heart,
  ArrowUpDown,
  Upload,
  ChevronRight,
  CheckCircle2,
  Check,
  AlertTriangle,
  HelpCircle,
  Scissors,
  ArrowRight,
  RefreshCw,
  Ruler,
} from 'lucide-react';
import { CustomizationPreferences, KurtiDesign, FabricQuantity, InputType } from '../types';
import { KURTI_CATALOG } from '../data/mockData';
import { getFabricSuitabilityAssessment } from '../lib/aiService';
import { FashnTryOnModal } from '../components/FashnTryOnModal';

const FABRIC_QUANTITY_PRESETS: {
  category: 'unknown' | 'small' | 'standard' | 'large' | 'saree';
  meters?: number;
  label: string;
  sublabel: string;
}[] = [
  {
    category: 'unknown',
    label: 'Unmeasured / Not specified',
    sublabel: 'Versatile kurti cuts (~1.5 – 2.5m)',
  },
  {
    category: 'small',
    meters: 1.2,
    label: 'Small piece (< 1.5m)',
    sublabel: 'Remnant • Blouse • Short Kurti',
  },
  {
    category: 'standard',
    meters: 2.2,
    label: 'Standard kurti cut (1.8 – 2.5m)',
    sublabel: 'Straight Cut & A-line Kurtis',
  },
  {
    category: 'large',
    meters: 3.5,
    label: 'Large cut (3.0 – 4.5m)',
    sublabel: 'Flared Anarkali & Kurti Sets',
  },
  {
    category: 'saree',
    meters: 5.5,
    label: 'Saree length (5.5m+)',
    sublabel: 'Continuous saree yardage',
  },
];

export const RecommendationsPage: React.FC = () => {
  const {
    catalog,
    uploadedImage,
    analysisResult,
    userPreferences,
    setUserPreferences,
    savedDesignIds,
    toggleSaveDesign,
    setSelectedDesign,
    navigateTo,
    updateFabricQuantity,
    updateInputTypeOverride,
  } = useApp();

  // Personalization state
  const [hasCompletedPersonalization, setHasCompletedPersonalization] = useState<boolean>(() => {
    return !!localStorage.getItem('reweave_has_personalized');
  });
  const [showPersonalizeForm, setShowPersonalizeForm] = useState<boolean>(() => {
    return !localStorage.getItem('reweave_has_personalized');
  });

  // Questionnaire form states
  const [sleevePref, setSleevePref] = useState<string>(userPreferences?.sleeveLength || 'Three-quarter');
  const [lengthPref, setLengthPref] = useState<string>(userPreferences?.kurtiLength || 'Calf Length');
  const [necklinePref, setNecklinePref] = useState<string>(userPreferences?.neckline || 'Round Neck with V-Slit');
  const [fitPref, setFitPref] = useState<string>(userPreferences?.silhouette || 'Straight Cut');
  const [addOnsPref, setAddOnsPref] = useState<string[]>(
    userPreferences?.customPockets ? ['Side Pockets'] : ['Side Pockets', 'Side Slits']
  );
  const [occasionPref, setOccasionPref] = useState<string>(userPreferences?.occasion || 'Daily / Casual');

  // Filter & Sorting state for Recommendations
  const [collectionTab, setCollectionTab] = useState<'all' | 'women' | 'men'>('all');
  const [categoryTab, setCategoryTab] = useState<'all' | 'kurti' | 'short-kurti'>('all');
  const [selectedPattern, setSelectedPattern] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'match' | 'popular' | 'trending'>('match');
  const [tryOnDesign, setTryOnDesign] = useState<KurtiDesign | null>(null);

  // Input Type Identification
  const inputType: InputType = analysisResult?.inputType || 'fabric_only';
  const isFabricOnly = inputType === 'fabric_only';
  const isFinishedGarment = inputType === 'finished_garment';
  const isUnclear = inputType === 'unclear';

  // Save fit questionnaire
  const handleSavePersonalization = () => {
    const newPrefs: CustomizationPreferences = {
      sleeveLength: sleevePref,
      kurtiLength: lengthPref,
      neckline: necklinePref,
      silhouette: fitPref,
      occasion: occasionPref,
      customPockets: addOnsPref.includes('Side Pockets'),
    };
    setUserPreferences(newPrefs);
    localStorage.setItem('reweave_preferences', JSON.stringify(newPrefs));
    localStorage.setItem('reweave_has_personalized', 'true');
    setHasCompletedPersonalization(true);
    setShowPersonalizeForm(false);

    setTimeout(() => {
      const el = document.getElementById('recommendations-results-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  // Run Fabric-Aware Assessment
  const assessment = useMemo(() => {
    const baseCatalog = catalog && catalog.length > 0 ? catalog : KURTI_CATALOG;
    const activePrefs = userPreferences || {
      sleeveLength: sleevePref,
      kurtiLength: lengthPref,
      neckline: necklinePref,
      silhouette: fitPref,
      occasion: occasionPref,
    };

    return getFabricSuitabilityAssessment(
      baseCatalog,
      analysisResult,
      activePrefs,
      {
        collection: collectionTab,
        category: categoryTab,
        pattern: selectedPattern,
        color: selectedColor,
        style: selectedStyle,
        sortBy,
      },
      uploadedImage
    );
  }, [
    catalog,
    analysisResult,
    userPreferences,
    sleevePref,
    lengthPref,
    necklinePref,
    fitPref,
    occasionPref,
    collectionTab,
    categoryTab,
    selectedPattern,
    selectedColor,
    selectedStyle,
    sortBy,
    uploadedImage,
  ]);

  const { recommendedDesigns, avoidedDesigns, fabricQuantityLabel } = assessment;

  // Filter options for dropdowns
  const patternOptions = ['All', 'Floral', 'Geometric', 'Block Print', 'Solid', 'Stripes', 'Embroidered', 'Traditional'];
  const colorOptions = ['All', 'Blush Pink', 'Indigo Blue', 'Mustard Yellow', 'Sage Green', 'Terracotta', 'Off White', 'Navy Blue', 'Olive Green'];
  const styleOptions = ['All', 'A-line', 'Straight Cut', 'Anarkali', 'Flared', 'Asymmetric', 'Angrakha'];

  // Graceful fallback if user visits /recommendations directly with no image
  if (!uploadedImage && !analysisResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center mx-auto shadow-xs">
          <Upload className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-editorial text-3xl font-bold text-[#2E2926]">
            No analysis found. Upload an image to begin.
          </h2>
          <p className="text-sm text-[#766B65] max-w-md mx-auto">
            Upload your unstitched fabric or kurti inspiration photograph to start our AI visual analysis.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo('/upload')}
          className="px-6 py-3.5 rounded-2xl bg-[#B5563E] text-white text-sm font-bold hover:bg-[#9C4530] transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      {/* 0. UNCLEAR / AMBIGUOUS IMAGE NOTIFICATION (DO NOT GUESS RULE) */}
      {isUnclear && (
        <div className="p-6 rounded-3xl bg-amber-50/90 border-2 border-amber-200 text-left space-y-3 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  Input Classification Ambiguity
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#2E2926]">
                  Unable to determine whether this is fabric or a finished garment
                </h3>
              </div>
              <p className="text-xs text-[#766B65] leading-relaxed max-w-2xl">
                The uploaded photograph contains close-cropped patterns or flat textile cues where garment boundaries are ambiguous. Per our bespoke tailoring principles, <strong>we do not guess</strong>. Please clarify what you uploaded so we can recommend physically feasible designs:
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => updateInputTypeOverride('fabric_only')}
                  className="px-4 py-2.5 rounded-xl bg-[#B5563E] text-white text-xs font-bold hover:bg-[#9C4530] transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>It is Unstitched Fabric</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateInputTypeOverride('finished_garment')}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#ECDAD4] text-[#2E2926] text-xs font-bold hover:bg-[#FAF2EE] transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <span>It is a Finished Garment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP SECTION: FABRIC ANALYSIS vs GARMENT ANALYSIS */}
      <section
        id="analysis-summary-section"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECDAD4] pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {isFabricOnly ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fabric detected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Finished Garment detected</span>
                </span>
              )}
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2E2926]">
              {isFabricOnly ? 'Fabric Analysis' : 'Garment Analysis'}
            </h1>
            <p className="text-xs text-[#766B65]">
              {isFabricOnly
                ? 'We analyzed your unstitched fabric colors, craft patterns, weave texture, and yardage compatibility.'
                : 'We extracted colors, patterns, silhouette, and garment attributes from your uploaded reference.'}
            </p>
          </div>

          {/* Header Action Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* User Override Toggle */}
            <button
              type="button"
              onClick={() => updateInputTypeOverride(isFabricOnly ? 'finished_garment' : 'fabric_only')}
              className="px-3 py-2 rounded-xl bg-[#FAF2EE] hover:bg-[#ECDAD4] text-[#766B65] hover:text-[#2E2926] text-[11px] font-semibold transition-colors cursor-pointer"
              title="Change classification if the AI misidentified this photo"
            >
              {isFabricOnly ? 'Switch to Garment Mode' : 'Switch to Fabric Mode'}
            </button>

            <button
              type="button"
              onClick={() => navigateTo('/upload')}
              className="px-4 py-2.5 rounded-xl bg-[#B5563E] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#9C4530] transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Another Image</span>
            </button>
          </div>
        </div>

        {/* Analysis Body: Uploaded Image Preview + Detected Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Uploaded Image Box */}
          <div className="md:col-span-4 space-y-2">
            <span className="text-[11px] font-bold text-[#766B65] uppercase tracking-wider block">
              Uploaded Photograph
            </span>
            <div className="w-full h-72 rounded-2xl overflow-hidden bg-[#FAF2EE] border-2 border-[#ECDAD4] relative group shadow-xs">
              <img
                src={analysisResult?.originalImage || uploadedImage || ''}
                alt="Uploaded Inspiration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[11px] px-3 py-1.5 rounded-xl flex items-center justify-between">
                <span>{isFabricOnly ? 'Unstitched Textile' : 'Garment Reference'}</span>
                <span className="text-emerald-400 font-semibold">
                  {analysisResult?.confidenceScore || 94}% confidence
                </span>
              </div>
            </div>
          </div>

          {/* Specification Cards */}
          <div className="md:col-span-8 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#B5563E] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isFabricOnly ? 'Fabric Specifications Detected' : 'Garment Features Detected'}</span>
            </h3>

            {isFabricOnly ? (
              /* FABRIC-ONLY ANALYSIS GRID (NEVER SHOWS GARMENT SILHOUETTE, NECKLINE, OR SLEEVES) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* 1. Input Type */}
                <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] space-y-1">
                  <span className="text-[10px] font-bold text-[#766B65] uppercase tracking-wider block">
                    Input Type
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-emerald-700">Fabric detected</p>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                      {analysisResult?.inputTypeConfidence || 'High'} confidence
                    </span>
                  </div>
                  <p className="text-[11px] text-[#766B65]">
                    Material piece detected; no pre-existing garment cut assumed.
                  </p>
                </div>

                {/* 2. Color Palette */}
                <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] space-y-2">
                  <span className="text-[10px] font-bold text-[#766B65] uppercase tracking-wider block">
                    Dominant Colors
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult?.dominantColors?.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-[#ECDAD4] shadow-2xs"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-bold text-[#2E2926] text-[11px]">{color.name}</span>
                        <span className="text-[10px] text-[#766B65]">({color.percentage}%)</span>
                      </div>
                    )) || <span className="text-[#766B65]">Dusty Rose, Sage Green, Blush Pink</span>}
                  </div>
                </div>

                {/* 3. Pattern & Motifs */}
                <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] space-y-1">
                  <span className="text-[10px] font-bold text-[#766B65] uppercase tracking-wider block">
                    Pattern & Print
                  </span>
                  <p className="text-base font-bold text-[#2E2926]">
                    {analysisResult?.pattern || 'Floral / Handblock Print'}
                  </p>
                  <p className="text-[11px] text-[#766B65]">
                    Classification confidence: {analysisResult?.patternConfidence || 'High'}
                  </p>
                </div>

                {/* 4. Texture & Weave */}
                <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] space-y-1">
                  <span className="text-[10px] font-bold text-[#766B65] uppercase tracking-wider block">
                    Texture & Surface
                  </span>
                  <p className="text-base font-bold text-[#2E2926]">
                    {analysisResult?.texture || 'Handloom slub weave'}
                  </p>
                  <p className="text-[11px] text-[#766B65]">
                    Natural grain structure suitable for tailored drape.
                  </p>
                </div>

                {/* 5. Material Characteristics (with uncertainty handling) */}
                <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] space-y-1">
                  <span className="text-[10px] font-bold text-[#766B65] uppercase tracking-wider block">
                    Material Characteristics
                  </span>
                  <p className="text-sm font-bold text-[#2E2926]">
                    {analysisResult?.materialConfidence === 'unable_to_determine'
                      ? 'Material cannot be determined confidently from this image'
                      : analysisResult?.materialIdentified ||
                        analysisResult?.apparentCharacteristics?.weight ||
                        'Medium-weight breathable woven cotton'}
                  </p>
                  <p className="text-[11px] text-[#766B65]">
                    Inferred from optical texture; physical hand-feel confirmed with tailor.
                  </p>
                </div>

                {/* 6. Available Fabric Quantity & Dimensions (INTERACTIVE SWITCHER) */}
                <div className="p-4 rounded-2xl bg-[#FFF2ED] border border-[#ECDAD4] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#B5563E] uppercase tracking-wider block">
                      Fabric Quantity / Dimensions
                    </span>
                    <Ruler className="w-3.5 h-3.5 text-[#B5563E]" />
                  </div>

                  <select
                    value={
                      analysisResult?.fabricQuantity?.category ||
                      (analysisResult?.fabricQuantity?.meters && analysisResult.fabricQuantity.meters < 1.6
                        ? 'small'
                        : analysisResult?.fabricQuantity?.meters && analysisResult.fabricQuantity.meters > 5.0
                        ? 'saree'
                        : 'standard')
                    }
                    onChange={(e) => {
                      const selected = FABRIC_QUANTITY_PRESETS.find((p) => p.category === e.target.value);
                      if (selected) {
                        updateFabricQuantity({
                          category: selected.category,
                          meters: selected.meters,
                          label: selected.label,
                          userProvided: true,
                        });
                      }
                    }}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-[#ECDAD4] bg-white text-xs font-semibold text-[#2E2926] focus:outline-hidden"
                  >
                    {FABRIC_QUANTITY_PRESETS.map((p) => (
                      <option key={p.category} value={p.category}>
                        {p.label} — {p.sublabel}
                      </option>
                    ))}
                  </select>

                  <p className="text-[11px] text-[#766B65]">
                    Active: <strong className="text-[#2E2926]">{fabricQuantityLabel}</strong>. Tailoring cuts update dynamically to this yardage.
                  </p>
                </div>
              </div>
            ) : (
              /* FINISHED GARMENT ANALYSIS GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] space-y-1">
                  <span className="text-[10px] font-bold text-[#766B65] uppercase tracking-wider block">
                    Input Type
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-blue-700">Finished Garment</p>
                  </div>
                  <p className="text-[11px] text-[#766B65]">
                    Full stitched garment reference recognized.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] space-y-2">
                  <span className="text-[10px] font-bold text-[#766B65] uppercase tracking-wider block">
                    Dominant Colors
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult?.dominantColors?.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-[#ECDAD4]"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-bold text-[#2E2926] text-[11px]">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] space-y-1">
                  <span className="text-[10px] font-bold text-[#766B65] uppercase tracking-wider block">
                    Garment Silhouette
                  </span>
                  <p className="text-base font-bold text-[#2E2926]">
                    {analysisResult?.style || 'Straight Cut Kurti'}
                  </p>
                  <p className="text-[11px] text-[#766B65]">
                    {analysisResult?.estimatedNeckline || 'Round Neck with V-Slit'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] space-y-1">
                  <span className="text-[10px] font-bold text-[#766B65] uppercase tracking-wider block">
                    Pattern & Sleeves
                  </span>
                  <p className="text-base font-bold text-[#2E2926]">
                    {analysisResult?.pattern || 'Floral'} • {analysisResult?.sleeveType || 'Three-Quarter Sleeves'}
                  </p>
                  <p className="text-[11px] text-[#766B65]">
                    Reference style matches our bespoke kurti patterns.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. PERSONALIZATION QUESTIONNAIRE SECTION */}
      <section
        id="personalize-section"
        className="bg-[#FAF2EE] rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECDAD4]/70 pb-4">
          <div>
            <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider">
              Step 2: Custom Fit & Silhouette
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2E2926] mt-0.5">
              Let's Personalize Your Bespoke Fit
            </h2>
            <p className="text-xs text-[#766B65]">
              Choose your sleeve length, kurti cut, and neckline so our tailors craft your custom fit.
            </p>
          </div>

          {hasCompletedPersonalization && (
            <button
              type="button"
              onClick={() => setShowPersonalizeForm((prev) => !prev)}
              className="px-4 py-2 rounded-xl bg-white border border-[#ECDAD4] text-xs font-bold text-[#B5563E] hover:bg-[#FFF2ED] transition-colors self-start sm:self-auto cursor-pointer"
            >
              {showPersonalizeForm ? 'Collapse Questionnaire' : 'Edit Fit Preferences'}
            </button>
          )}
        </div>

        {showPersonalizeForm ? (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Question 1: Sleeve Length */}
              <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#ECDAD4]">
                <label className="font-bold text-[#2E2926] text-xs block">
                  1. What sleeve length do you prefer?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Three-quarter', 'Short Sleeves', 'Sleeveless', 'Full Length'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSleevePref(opt)}
                      className={`p-2 rounded-xl border text-left font-medium transition-colors cursor-pointer ${
                        sleevePref === opt
                          ? 'bg-[#B5563E] text-white border-[#B5563E]'
                          : 'bg-[#FAF2EE] text-[#2E2926] border-[#ECDAD4] hover:bg-[#ECDAD4]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Kurti Length */}
              <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#ECDAD4]">
                <label className="font-bold text-[#2E2926] text-xs block">
                  2. What kurti length do you prefer?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Short (Hip Length)', 'Knee Length', 'Calf Length', 'Ankle Length'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setLengthPref(opt)}
                      className={`p-2 rounded-xl border text-left font-medium transition-colors cursor-pointer ${
                        lengthPref === opt
                          ? 'bg-[#B5563E] text-white border-[#B5563E]'
                          : 'bg-[#FAF2EE] text-[#2E2926] border-[#ECDAD4] hover:bg-[#ECDAD4]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Neckline */}
              <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#ECDAD4]">
                <label className="font-bold text-[#2E2926] text-xs block">
                  3. What neckline do you prefer?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Round Neck with V-Slit', 'Mandarin Collar', 'V-Neck Placket', 'Boat Neck', 'Keyhole Neck'].map(
                    (opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setNecklinePref(opt)}
                        className={`p-2 rounded-xl border text-left font-medium transition-colors cursor-pointer ${
                          necklinePref === opt
                            ? 'bg-[#B5563E] text-white border-[#B5563E]'
                            : 'bg-[#FAF2EE] text-[#2E2926] border-[#ECDAD4] hover:bg-[#ECDAD4]'
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Question 4: Fit */}
              <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#ECDAD4]">
                <label className="font-bold text-[#2E2926] text-xs block">
                  4. What fit do you prefer?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Straight Cut', 'A-line', 'Flared / Peplum', 'Anarkali', 'Relaxed'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFitPref(opt)}
                      className={`p-2 rounded-xl border text-left font-medium transition-colors cursor-pointer ${
                        fitPref === opt
                          ? 'bg-[#B5563E] text-white border-[#B5563E]'
                          : 'bg-[#FAF2EE] text-[#2E2926] border-[#ECDAD4] hover:bg-[#ECDAD4]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 5: Add-ons */}
              <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#ECDAD4]">
                <label className="font-bold text-[#2E2926] text-xs block">
                  5. Any add-ons?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Side Pockets', 'Side Slits', 'Cotton Lining', 'Wooden Buttons', 'Gota Piping'].map((opt) => {
                    const isSelected = addOnsPref.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setAddOnsPref((prev) =>
                            isSelected ? prev.filter((item) => item !== opt) : [...prev, opt]
                          );
                        }}
                        className={`p-2 rounded-xl border text-left font-medium transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#B5563E] text-white border-[#B5563E]'
                            : 'bg-[#FAF2EE] text-[#2E2926] border-[#ECDAD4] hover:bg-[#ECDAD4]'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 6: Occasion */}
              <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#ECDAD4]">
                <label className="font-bold text-[#2E2926] text-xs block">
                  6. Occasion?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Daily / Casual', 'Office / Formal', 'Festive Celebrations', 'College / Fusion'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setOccasionPref(opt)}
                      className={`p-2 rounded-xl border text-left font-medium transition-colors cursor-pointer ${
                        occasionPref === opt
                          ? 'bg-[#B5563E] text-white border-[#B5563E]'
                          : 'bg-[#FAF2EE] text-[#2E2926] border-[#ECDAD4] hover:bg-[#ECDAD4]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleSavePersonalization}
                className="px-8 py-3.5 rounded-2xl bg-[#B5563E] text-white text-sm font-bold hover:bg-[#9C4530] transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save Fit Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[#766B65]">Active Preferences:</span>
            <span className="bg-white px-3 py-1 rounded-xl border border-[#ECDAD4] font-medium">
              Sleeve: {sleevePref}
            </span>
            <span className="bg-white px-3 py-1 rounded-xl border border-[#ECDAD4] font-medium">
              Length: {lengthPref}
            </span>
            <span className="bg-white px-3 py-1 rounded-xl border border-[#ECDAD4] font-medium">
              Neck: {necklinePref}
            </span>
            <span className="bg-white px-3 py-1 rounded-xl border border-[#ECDAD4] font-medium">
              Fit: {fitPref}
            </span>
            <span className="bg-white px-3 py-1 rounded-xl border border-[#ECDAD4] font-medium">
              Occasion: {occasionPref}
            </span>
          </div>
        )}
      </section>

      {/* 3. RECOMMENDATIONS SECTION */}
      <section id="recommendations-results-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2ED] text-[#B5563E] text-xs font-bold mb-1.5 border border-[#ECDAD4]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isFabricOnly ? 'Compatible with Fabric Dimensions' : 'Ranked by Color Palette & Pattern'}
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2E2926]">
              {isFabricOnly ? 'Suitable Garment Ideas for This Fabric' : 'Personalized Kurti Recommendations'}
            </h2>
            <p className="text-xs text-[#766B65]">
              {isFabricOnly
                ? `Curated kurti and garment concepts physically compatible with this fabric pattern, weight, and yardage (${fabricQuantityLabel}).`
                : 'Showing exclusively bespoke kurtis and short kurtis matching your reference.'}
            </p>
          </div>

          {/* Collection & Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Collection Filter */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-[#ECDAD4]">
              <button
                type="button"
                onClick={() => setCollectionTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  collectionTab === 'all'
                    ? 'bg-[#2E2926] text-white shadow-xs'
                    : 'text-[#766B65] hover:text-[#2E2926]'
                }`}
              >
                All Collections
              </button>
              <button
                type="button"
                onClick={() => setCollectionTab('women')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  collectionTab === 'women'
                    ? 'bg-[#B5563E] text-white shadow-xs'
                    : 'text-[#766B65] hover:text-[#2E2926]'
                }`}
              >
                Women's
              </button>
              <button
                type="button"
                onClick={() => setCollectionTab('men')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  collectionTab === 'men'
                    ? 'bg-[#B5563E] text-white shadow-xs'
                    : 'text-[#766B65] hover:text-[#2E2926]'
                }`}
              >
                Men's
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-[#ECDAD4]">
              <button
                type="button"
                onClick={() => setCategoryTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryTab === 'all'
                    ? 'bg-[#FAF2EE] text-[#B5563E] border border-[#ECDAD4]'
                    : 'text-[#766B65] hover:text-[#2E2926]'
                }`}
              >
                All Garments
              </button>
              <button
                type="button"
                onClick={() => setCategoryTab('kurti')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryTab === 'kurti'
                    ? 'bg-[#FAF2EE] text-[#B5563E] border border-[#ECDAD4]'
                    : 'text-[#766B65] hover:text-[#2E2926]'
                }`}
              >
                Kurti
              </button>
              <button
                type="button"
                onClick={() => setCategoryTab('short-kurti')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryTab === 'short-kurti'
                    ? 'bg-[#FAF2EE] text-[#B5563E] border border-[#ECDAD4]'
                    : 'text-[#766B65] hover:text-[#2E2926]'
                }`}
              >
                Short Kurti
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Sort Controls */}
        <div className="bg-white rounded-2xl p-4 border border-[#ECDAD4] shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2E2926]">
              <Filter className="w-4 h-4 text-[#B5563E]" />
              <span>Refine Garment Suggestions:</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#766B65]" />
              <span className="text-[#766B65] font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs font-semibold text-[#2E2926] focus:outline-hidden"
              >
                <option value="match">Best Match (Color + Pattern + Yardage)</option>
                <option value="popular">Most Popular Kurti Cuts</option>
                <option value="trending">Trending Designs</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#ECDAD4]/60 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-[#766B65] block mb-1">Kurti Pattern</label>
              <select
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs text-[#2E2926]"
              >
                {patternOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#766B65] block mb-1">Dominant Color</label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs text-[#2E2926]"
              >
                {colorOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-[#766B65] block mb-1">Silhouette</label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs text-[#2E2926]"
              >
                {styleOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* RESULTS GRID: RECOMMENDED DESIGNS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedDesigns.map((design) => {
            const isSaved = savedDesignIds.includes(design.id);

            return (
              <div
                key={design.id}
                className="bg-white rounded-3xl border border-[#ECDAD4] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group text-left"
              >
                {/* Image & Badges */}
                <div className="relative h-72 overflow-hidden bg-[#FAF2EE]">
                  <img
                    src={design.imageUrl}
                    alt={design.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2E2926]/90 text-white backdrop-blur-md shadow-xs">
                        {design.category === 'short-kurti' ? 'Short Kurti' : 'Kurti'}
                      </span>
                      {design.badge && (
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs backdrop-blur-md ${
                            design.badge === 'Best Match'
                              ? 'bg-[#B5563E] text-white'
                              : design.badge === 'Highly Similar'
                              ? 'bg-amber-600 text-white'
                              : 'bg-white/90 text-[#2E2926] border border-[#ECDAD4]'
                          }`}
                        >
                          {design.badge} ({design.matchScore}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bookmark Heart */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveDesign(design.id);
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-[#ECDAD4] flex items-center justify-center hover:scale-110 transition-transform shadow-xs cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isSaved ? 'text-[#B5563E] fill-[#B5563E]' : 'text-[#766B65]'
                      }`}
                    />
                  </button>

                  {/* Bottom Color Swatches */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-xl text-white text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {design.hexPalette.map((hex, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-white"
                          style={{ backgroundColor: hex }}
                          title={design.colors[i]}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium text-white/90">
                      Match: {design.matchScore}%
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3.5 text-left flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <div className="text-[11px] font-semibold text-[#766B65] uppercase tracking-wider mb-1">
                        {design.fabric} • {design.style} • {design.length}
                      </div>
                      <h3 className="font-editorial text-xl font-bold text-[#2E2926] leading-tight group-hover:text-[#B5563E] transition-colors">
                        {design.name}
                      </h3>
                    </div>

                    {/* 1. WHY IT SUITS THIS FABRIC (EXPLICIT PHYSICAL RATIONALE) */}
                    <div className="p-3 rounded-2xl bg-[#FFF5F2] border border-[#ECDAD4] space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B5563E]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isFabricOnly ? 'Why it suits this fabric:' : 'Why this matches:'}</span>
                      </div>
                      <p className="text-xs text-[#2E2926] font-medium leading-relaxed">
                        {design.fabricSuitabilityNote ||
                          (design.matchReasons && design.matchReasons[0]) ||
                          'The continuous pattern layout and fabric weight complement this silhouette.'}
                      </p>
                    </div>

                    {/* 2. APPROXIMATE SUITABILITY BASED ON AVAILABLE MATERIAL */}
                    <div className="flex items-center justify-between text-[11px] bg-[#FAF2EE] px-3 py-2 rounded-xl border border-[#ECDAD4]">
                      <span className="text-[#766B65] font-medium">Min. Fabric Required:</span>
                      <span className="font-bold text-[#2E2926]">
                        ~{design.minFabricRequiredMeters || (design.category === 'short-kurti' ? 1.4 : 2.2)} meters
                      </span>
                    </div>

                    {/* 3. CUSTOMIZATION POSSIBILITIES */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#766B65] uppercase tracking-wider block">
                        Customization Possibilities:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(design.customizationPossibilities && design.customizationPossibilities.length > 0
                          ? design.customizationPossibilities
                          : ['Custom sleeve length', 'Contrast neckline piping', 'Side slits with gota lace']
                        ).map((possibility, pIdx) => (
                          <span
                            key={pIdx}
                            className="text-[10px] bg-white border border-[#ECDAD4] text-[#4A433E] px-2 py-0.5 rounded-md font-medium"
                          >
                            + {possibility}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-[#766B65] line-clamp-2 leading-relaxed font-light">
                      {design.description}
                    </p>
                  </div>

                  {/* Tailoring Availability & Action Buttons */}
                  <div className="pt-2 border-t border-[#ECDAD4] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#766B65] block">Custom Tailoring</span>
                        <span className="text-xs font-semibold text-[#2E2926]">Bespoke Stitching</span>
                      </div>
                      <span className="text-xs text-[#B5563E] font-semibold">
                        {design.availableTailorCount} tailors available
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDesign(design);
                          navigateTo(`/preview/${design.id}`);
                        }}
                        className="py-2.5 px-2 rounded-xl bg-[#FAF2EE] text-[#B5563E] hover:bg-[#ECDAD4] text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Customize in 3D Studio"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>3D Fit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTryOnDesign(design)}
                        className="py-2.5 px-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="AI Virtual Try-On with FASHN v1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Try On</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDesign(design);
                          navigateTo(`/design/${design.id}`);
                        }}
                        className="py-2.5 px-2 rounded-xl bg-[#B5563E] text-white hover:bg-[#9C4530] text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Request Tailoring"
                      >
                        <span>Tailor</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. AVOID / NOT SUITABLE FOR THIS CUT SECTION (PHYSICAL YARDAGE CONSTRAINTS) */}
      {isFabricOnly && avoidedDesigns.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200/80 shadow-xs space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold mb-1 border border-rose-200">
                <span>Physical Yardage & Craft Constraints</span>
              </div>
              <h3 className="font-editorial text-2xl font-bold text-[#2E2926]">
                Avoid / Not Recommended for This Cut
              </h3>
              <p className="text-xs text-[#766B65]">
                Based on available fabric yardage (<strong>{fabricQuantityLabel}</strong>), these silhouettes cannot be physically tailored from this piece without acquiring additional yardage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {avoidedDesigns.map((avoided, idx) => (
              <div
                key={idx}
                className="bg-[#FAF2EE]/50 rounded-2xl p-4 border border-[#ECDAD4] space-y-2 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#2E2926]">{avoided.designName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100/70 text-rose-800 border border-rose-200 shrink-0">
                    Requires {avoided.requiredMeters}
                  </span>
                </div>
                <p className="text-xs text-[#766B65] leading-relaxed">
                  {avoided.reason}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FASHN Virtual Try-On Modal */}
      {tryOnDesign && (
        <FashnTryOnModal
          isOpen={!!tryOnDesign}
          onClose={() => setTryOnDesign(null)}
          garmentImageUrl={tryOnDesign.imageUrl}
          garmentName={tryOnDesign.name}
          category={
            tryOnDesign.category === 'trousers'
              ? 'bottoms'
              : tryOnDesign.category === 'gown' ||
                tryOnDesign.category === 'anarkali' ||
                (tryOnDesign.silhouette && tryOnDesign.silhouette.toLowerCase().includes('anarkali'))
              ? 'one-pieces'
              : 'tops'
          }
        />
      )}
    </div>
  );
};

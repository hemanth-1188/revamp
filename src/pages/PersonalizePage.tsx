import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomizationPreferences } from '../types';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Palette,
  Layers,
  Scissors,
  HelpCircle,
  Shirt,
  Info,
} from 'lucide-react';

export const PersonalizePage: React.FC = () => {
  const {
    analysisResult,
    uploadedImage,
    userPreferences,
    setUserPreferences,
    navigateTo,
    showToast,
  } = useApp();

  const [step, setStep] = useState<number>(1);

  // Initial local state from existing preferences or smart defaults
  const [sleeveLength, setSleeveLength] = useState<string>(
    userPreferences?.sleeveLength || 'Three-quarter'
  );
  const [kurtiLength, setKurtiLength] = useState<string>(
    userPreferences?.kurtiLength || 'Calf length'
  );
  const [neckline, setNeckline] = useState<string>(
    userPreferences?.neckline || 'Keep similar to uploaded design'
  );
  const [silhouette, setSilhouette] = useState<string>(
    userPreferences?.silhouette || (analysisResult?.silhouette === 'Straight Cut' ? 'Straight' : 'A-line')
  );
  const [addOns, setAddOns] = useState<string[]>(
    userPreferences?.addOns && userPreferences.addOns.length > 0
      ? userPreferences.addOns
      : ['Pockets', 'Side slits']
  );
  const [fabric, setFabric] = useState<string>(
    userPreferences?.fabric || 'Cotton'
  );
  const [occasion, setOccasion] = useState<string>(
    userPreferences?.occasion || 'Daily wear'
  );

  const detectedPattern = analysisResult?.pattern || 'Handblock Print';
  const detectedFabric = analysisResult?.likelyFabric || analysisResult?.fabricRecommendation || 'Cotton';

  // Toggle multi-select add-ons
  const toggleAddOn = (item: string) => {
    if (item === 'Minimal / no add-ons') {
      setAddOns(['Minimal / no add-ons']);
      return;
    }
    const filtered = addOns.filter((a) => a !== 'Minimal / no add-ons');
    if (filtered.includes(item)) {
      const next = filtered.filter((a) => a !== item);
      setAddOns(next.length > 0 ? next : ['Minimal / no add-ons']);
    } else {
      setAddOns([...filtered, item]);
    }
  };

  const handleComplete = () => {
    const preferences: CustomizationPreferences = {
      sleeveLength,
      kurtiLength,
      neckline,
      silhouette,
      addOns,
      fabric,
      occasion,
    };
    setUserPreferences(preferences);
    showToast('Personalized fit saved! Generating tailored kurti recommendations...', 'success');
    navigateTo('/recommendations');
  };

  const nextStep = () => {
    if (step < 7) {
      setStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      navigateTo('/upload');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Top Breadcrumb & Step Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECDAD4] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider bg-[#FFF2ED] px-2.5 py-0.5 rounded-full border border-[#ECDAD4]">
              Step 2 of 4: Personalization
            </span>
            <span className="text-xs text-[#766B65]">Question {step} of 7</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2E2926] mt-1">
            Personalize Your Kurti Requirements
          </h1>
          <p className="text-xs text-[#766B65] mt-0.5">
            Tailor the exact sleeve, length, and neckline so our master tailors craft your ideal fit.
          </p>
        </div>

        {/* Progress Pill Indicator */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setStep(num)}
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                num === step
                  ? 'bg-[#B5563E] text-white shadow-xs scale-105'
                  : num < step
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[#FAF2EE] text-[#766B65] hover:bg-[#ECDAD4]'
              }`}
            >
              {num < step ? <Check className="w-3.5 h-3.5" /> : num}
            </button>
          ))}
        </div>
      </div>

      {/* Detected Image Context Banner */}
      {uploadedImage && (
        <div className="p-4 bg-white rounded-2xl border border-[#ECDAD4] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#ECDAD4] shrink-0 bg-[#FAF2EE]">
              <img
                src={uploadedImage}
                alt="Uploaded inspiration swatch"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2E2926]">Uploaded Inspiration</span>
                <span className="text-[10px] font-bold bg-[#FAF2EE] text-[#B5563E] px-2 py-0.5 rounded-md border border-[#ECDAD4]">
                  {detectedPattern}
                </span>
              </div>
              <p className="text-[11px] text-[#766B65] mt-0.5">
                AI extracted {analysisResult?.dominantColors?.length || 4} dominant colors & pattern
              </p>
            </div>
          </div>

          {/* Color palette chips */}
          {analysisResult?.dominantColors && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#766B65] mr-1 hidden sm:inline">Palette:</span>
              {analysisResult.dominantColors.slice(0, 4).map((c, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border border-white shadow-2xs"
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name} (${c.percentage}%)`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Step Cards */}
      <div className="bg-white rounded-3xl border border-[#ECDAD4] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Step 1: Sleeve Length */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider">
                Question 1 of 7
              </span>
              <h2 className="text-xl font-bold text-[#2E2926] mt-0.5">
                What sleeve length do you prefer?
              </h2>
              <p className="text-xs text-[#766B65] mt-0.5">
                Choose the sleeve style you find most comfortable for daily movement.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
              {[
                { label: 'Sleeveless', desc: 'Summer ready with clean armhole binding' },
                { label: 'Short sleeve', desc: '4–6 inches above elbow with neat hem' },
                { label: 'Elbow length', desc: 'Just touching the elbow crease' },
                { label: 'Three-quarter', desc: 'Most popular (15–17"), elegant bracelet length' },
                { label: 'Full sleeve', desc: 'Wrist length (21–23") with optional cuff buttons' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSleeveLength(item.label)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    sleeveLength === item.label
                      ? 'border-[#B5563E] bg-[#FFF8F5] ring-2 ring-[#B5563E]/30'
                      : 'border-[#ECDAD4] bg-[#FDFAF9] hover:bg-white hover:border-[#B5563E]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2E2926]">{item.label}</span>
                    {sleeveLength === item.label && (
                      <Check className="w-4 h-4 text-[#B5563E]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#766B65] mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Kurti Length */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider">
                Question 2 of 7
              </span>
              <h2 className="text-xl font-bold text-[#2E2926] mt-0.5">
                What garment length works best for you?
              </h2>
              <p className="text-xs text-[#766B65] mt-0.5">
                Select your preferred hemline drop relative to the body.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {[
                { label: 'Short', desc: 'Hip to upper thigh (30–34"), great with jeans or palazzos' },
                { label: 'Knee length', desc: 'Hits right at the knee (38–40"), versatile daily fit' },
                { label: 'Calf length', desc: 'Classic midi length (43–45"), traditional silhouette' },
                { label: 'Long', desc: 'Ankle skimming (48–52"), regal flared / anarkali look' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setKurtiLength(item.label)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    kurtiLength === item.label
                      ? 'border-[#B5563E] bg-[#FFF8F5] ring-2 ring-[#B5563E]/30'
                      : 'border-[#ECDAD4] bg-[#FDFAF9] hover:bg-white hover:border-[#B5563E]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2E2926]">{item.label}</span>
                    {kurtiLength === item.label && (
                      <Check className="w-4 h-4 text-[#B5563E]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#766B65] mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Neckline */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider">
                Question 3 of 7
              </span>
              <h2 className="text-xl font-bold text-[#2E2926] mt-0.5">
                Which neckline style would you like?
              </h2>
              <p className="text-xs text-[#766B65] mt-0.5">
                The neckline frames the face and defines the formal feel of the kurti.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
              {[
                { label: 'Keep similar to uploaded design', desc: 'Preserves the motif alignment from your image' },
                { label: 'Round', desc: 'Timeless round with optional front keyhole slit' },
                { label: 'V-neck', desc: 'Flattering vertical neck contour for layering' },
                { label: 'Square', desc: 'Structured geometric cut highlighting jewelry' },
                { label: 'Boat', desc: 'Wide horizontal boat neck skimming collarbones' },
                { label: 'Collar', desc: 'Mandarin / Chinese collar with button placket' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setNeckline(item.label)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    neckline === item.label
                      ? 'border-[#B5563E] bg-[#FFF8F5] ring-2 ring-[#B5563E]/30'
                      : 'border-[#ECDAD4] bg-[#FDFAF9] hover:bg-white hover:border-[#B5563E]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2E2926]">{item.label}</span>
                    {neckline === item.label && (
                      <Check className="w-4 h-4 text-[#B5563E]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#766B65] mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Fit / Silhouette */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider">
                Question 4 of 7
              </span>
              <h2 className="text-xl font-bold text-[#2E2926] mt-0.5">
                Which silhouette or fit do you prefer?
              </h2>
              <p className="text-xs text-[#766B65] mt-0.5">
                Our tailors draft the paper pattern according to this body contour.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
              {[
                { label: 'Straight', desc: 'Classic parallel side seams with side vents' },
                { label: 'A-line', desc: 'Gently flares from waist down to hem' },
                { label: 'Flared', desc: 'Generous multi-panel flare with graceful drape' },
                { label: 'Relaxed', desc: 'Loose, airy anti-fit silhouette for maximum ease' },
                { label: 'Fitted', desc: 'Dart-tailored bust and waist contour' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSilhouette(item.label)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    silhouette === item.label
                      ? 'border-[#B5563E] bg-[#FFF8F5] ring-2 ring-[#B5563E]/30'
                      : 'border-[#ECDAD4] bg-[#FDFAF9] hover:bg-white hover:border-[#B5563E]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2E2926]">{item.label}</span>
                    {silhouette === item.label && (
                      <Check className="w-4 h-4 text-[#B5563E]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#766B65] mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Add-ons / Details (Multi-select) */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider">
                  Question 5 of 7 (Multi-Select)
                </span>
                <h2 className="text-xl font-bold text-[#2E2926] mt-0.5">
                  Select any tailoring add-ons or functional details:
                </h2>
                <p className="text-xs text-[#766B65] mt-0.5">
                  You may select multiple embellishments and pocket options.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
              {[
                { label: 'Pockets', desc: 'Concealed deep side seam pocket for phone/keys' },
                { label: 'Side slits', desc: 'Reinforced 12–14" side vents for easy movement' },
                { label: 'Embroidery', desc: 'Subtle thread or zari border detailing' },
                { label: 'Lace', desc: 'Cotton crochet or gota lace trimming on hem & cuffs' },
                { label: 'Buttons', desc: 'Handcrafted fabric potli or wooden buttons' },
                { label: 'Contrast border', desc: 'Contrasting solid piping along neck and sleeve' },
                { label: 'Minimal / no add-ons', desc: 'Clean, unadorned contemporary finish' },
              ].map((item) => {
                const isSelected = addOns.includes(item.label);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => toggleAddOn(item.label)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#B5563E] bg-[#FFF8F5] ring-2 ring-[#B5563E]/30'
                        : 'border-[#ECDAD4] bg-[#FDFAF9] hover:bg-white hover:border-[#B5563E]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#2E2926]">{item.label}</span>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#B5563E] border-[#B5563E] text-white'
                            : 'border-[#ECDAD4] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-[#766B65] mt-1">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Fabric Preference */}
        {step === 6 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider">
                Question 6 of 7
              </span>
              <h2 className="text-xl font-bold text-[#2E2926] mt-0.5">
                Confirm your fabric preference:
              </h2>
              <p className="text-xs text-[#766B65] mt-0.5">
                Select your preferred textile feel. Tailors will adjust needle gauge and lining accordingly.
              </p>
            </div>

            {/* AI Detected Fabric Hint */}
            <div className="p-3.5 rounded-2xl bg-[#FFF8F5] border border-[#F2C3B9] flex items-center gap-3 text-xs">
              <Sparkles className="w-4 h-4 text-[#B5563E] shrink-0" />
              <div className="text-[#2E2926]">
                <strong>AI Vision Hint:</strong> Uploaded fabric appears to be{' '}
                <span className="text-[#B5563E] font-bold capitalize">likely {detectedFabric}</span>.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
              {[
                { label: 'Cotton', desc: '100% natural, breathable, pre-shrunk daily staple' },
                { label: 'Cotton blend', desc: 'Wrinkle-resistant with slight sheen' },
                { label: 'Rayon', desc: 'Silky smooth drape with fluid movement' },
                { label: 'Linen', desc: 'Textured luxury slub weave, ultra-breathable' },
                { label: 'Georgette', desc: 'Lightweight translucent drape (lining needed)' },
                { label: 'Silk blend', desc: 'Lustrous festive handfeel with zari warmth' },
                { label: 'Not sure — suggest for me', desc: 'Let our algorithm & tailor recommend the optimal base' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setFabric(item.label)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    fabric === item.label
                      ? 'border-[#B5563E] bg-[#FFF8F5] ring-2 ring-[#B5563E]/30'
                      : 'border-[#ECDAD4] bg-[#FDFAF9] hover:bg-white hover:border-[#B5563E]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2E2926]">{item.label}</span>
                    {fabric === item.label && (
                      <Check className="w-4 h-4 text-[#B5563E]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#766B65] mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Occasion / Wear */}
        {step === 7 && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#B5563E] uppercase tracking-wider">
                Question 7 of 7
              </span>
              <h2 className="text-xl font-bold text-[#2E2926] mt-0.5">
                What occasion is this kurti intended for?
              </h2>
              <p className="text-xs text-[#766B65] mt-0.5">
                Helps us recommend designs with appropriate motif density and lining weights.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
              {[
                { label: 'Daily wear', desc: 'Durable seams, pocket ease, effortless washability' },
                { label: 'College / work', desc: 'Refined collars, professional straight cuts' },
                { label: 'Casual outing', desc: 'Breezy silhouettes with contemporary print touches' },
                { label: 'Festive', desc: 'Gota borders, dori ties, and rich jewel palettes' },
                { label: 'Party', desc: 'Statement necks, flared silhouettes, modern cuts' },
                { label: 'Special occasion', desc: 'Artisanal couture, zari embellishments, silk bases' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setOccasion(item.label)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    occasion === item.label
                      ? 'border-[#B5563E] bg-[#FFF8F5] ring-2 ring-[#B5563E]/30'
                      : 'border-[#ECDAD4] bg-[#FDFAF9] hover:bg-white hover:border-[#B5563E]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2E2926]">{item.label}</span>
                    {occasion === item.label && (
                      <Check className="w-4 h-4 text-[#B5563E]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#766B65] mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="pt-6 border-t border-[#ECDAD4] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#ECDAD4] text-xs font-bold text-[#766B65] hover:text-[#2E2926] bg-[#FAF2EE] hover:bg-[#ECDAD4] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Back to Upload' : 'Previous Step'}</span>
          </button>

          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B5563E] text-white hover:bg-[#9C4530] text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <span>{step === 7 ? 'Generate Kurti Recommendations' : 'Continue to Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

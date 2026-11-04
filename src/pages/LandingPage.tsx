import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Upload,
  Scissors,
  Eye,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Layers,
  Palette,
  Clock,
  MapPin,
  Shirt,
} from 'lucide-react';
import { KurtiDesign } from '../types';

export const LandingPage: React.FC = () => {
  const { navigateTo, runUploadAndAnalyze, setSelectedDesign, catalog } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedExampleCategory, setSelectedExampleCategory] = useState<'all' | 'kurti' | 'short-kurti'>('all');
  const [dragActive, setDragActive] = useState(false);

  // File upload directly from Landing Page
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        await runUploadAndAnalyze(dataUrl, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Strictly filter only genuine Kurti and Short Kurti designs for visual showcase
  const inspirationExamples: KurtiDesign[] = catalog
    .filter((d) => {
      if (d.category !== 'kurti' && d.category !== 'short-kurti') return false;
      const lower = (d.name || '').toLowerCase();
      return !lower.includes('saree') && !lower.includes('gown') && !lower.includes('lehenga') && !lower.includes('blouse');
    })
    .filter((d) => {
      if (selectedExampleCategory === 'all') return true;
      return d.category === selectedExampleCategory;
    })
    .slice(0, 6);

  return (
    <div className="space-y-20 pb-16">
      {/* Hidden file input for one-click upload anywhere on landing */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Narrative */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#2E2926] leading-[1.08]">
                Turn the design you love <br />
                <span className="italic font-normal text-[#B5563E]">into a kurti made for you.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#766B65] max-w-2xl leading-relaxed font-light">
                REWEAVE analyzes your colors and patterns, understands your preferences, helps you discover relevant kurti designs, and connects your final design with tailoring.
              </p>

              {/* Primary CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-7 py-3.5 rounded-2xl bg-[#B5563E] text-white text-sm font-bold hover:bg-[#9C4530] transition-all shadow-md hover:shadow-lg flex items-center gap-2 group cursor-pointer hover:scale-[1.02]"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Kurti or Fabric Image</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('/recommendations')}
                  className="px-6 py-3.5 rounded-2xl bg-white border border-[#ECDAD4] text-[#2E2926] text-sm font-semibold hover:bg-[#FAF2EE] hover:border-[#B5563E] transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#B5563E]" />
                  <span>Discover Kurti Designs</span>
                </button>
              </div>

              {/* Quick Feature Stats */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#ECDAD4] max-w-lg">
                <div>
                  <div className="text-xl font-bold text-[#2E2926]">Kurti & Short Kurti</div>
                  <div className="text-xs text-[#766B65]">Dedicated Cuts</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#2E2926]">360° View</div>
                  <div className="text-xs text-[#766B65]">3D Virtual Fitting</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#2E2926]">Master Tailors</div>
                  <div className="text-xs text-[#766B65]">Direct Stitching</div>
                </div>
              </div>
            </div>

            {/* Right Hero: Direct Upload Dropzone & Flow Demonstration */}
            <div className="lg:col-span-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`bg-white rounded-3xl p-6 sm:p-8 border-2 border-dashed transition-all cursor-pointer shadow-lg text-center space-y-5 relative group ${
                  dragActive
                    ? 'border-[#B5563E] bg-[#FFF2ED] scale-[1.02]'
                    : 'border-[#ECDAD4] hover:border-[#B5563E] hover:bg-[#FDFAF9]'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-editorial text-2xl font-bold text-[#2E2926]">
                    Upload Your Kurti or Fabric Image
                  </h3>
                  <p className="text-xs text-[#766B65] max-w-xs mx-auto leading-relaxed">
                    Drag and drop your fabric photograph or screenshot here, or click to browse.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] text-left text-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#B5563E] font-bold text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant AI Analysis Pipeline</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#766B65]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Color Palette Extraction</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Motif & Pattern Analysis</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Custom Fit Questionnaire</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Kurti Match Scoring</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 rounded-xl bg-[#B5563E] text-white text-xs font-bold hover:bg-[#9C4530] transition-colors shadow-xs"
                >
                  Select Photo to Analyze
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW REWEAVE WORKS (5 CLEAR STEPS AS REQUESTED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B5563E]">
            Seamless Tailoring Journey
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2E2926]">
            How REWEAVE Works
          </h2>
          <p className="text-xs sm:text-sm text-[#766B65]">
            Bridging your fabric inspirations with neighborhood tailoring craft in 5 intuitive steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Step 01 */}
          <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs text-left group hover:border-[#B5563E] transition-all">
            <div className="text-xs font-bold text-[#B5563E] tracking-widest uppercase mb-2">01 — Upload</div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#2E2926] mb-1.5">Upload Image</h3>
            <p className="text-xs text-[#766B65] leading-relaxed">
              Upload a kurti or fabric you like.
            </p>
          </div>

          {/* Step 02 */}
          <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs text-left group hover:border-[#B5563E] transition-all">
            <div className="text-xs font-bold text-[#B5563E] tracking-widest uppercase mb-2">02 — Analyze</div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#2E2926] mb-1.5">Analyze</h3>
            <p className="text-xs text-[#766B65] leading-relaxed">
              AI identifies colors and patterns.
            </p>
          </div>

          {/* Step 03 */}
          <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs text-left group hover:border-[#B5563E] transition-all">
            <div className="text-xs font-bold text-[#B5563E] tracking-widest uppercase mb-2">03 — Personalize</div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#2E2926] mb-1.5">Personalize</h3>
            <p className="text-xs text-[#766B65] leading-relaxed">
              Tell us how you want your kurti.
            </p>
          </div>

          {/* Step 04 */}
          <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs text-left group hover:border-[#B5563E] transition-all">
            <div className="text-xs font-bold text-[#B5563E] tracking-widest uppercase mb-2">04 — Visualize</div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#2E2926] mb-1.5">Visualize 3D Fit</h3>
            <p className="text-xs text-[#766B65] leading-relaxed">
              Interactive 3D mannequin fit preview with realistic silhouette drape and styling.
            </p>
          </div>

          {/* Step 05 */}
          <div className="bg-white rounded-2xl p-5 border border-[#ECDAD4] shadow-xs text-left group hover:border-[#B5563E] transition-all">
            <div className="text-xs font-bold text-[#B5563E] tracking-widest uppercase mb-2">05 — Connect</div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#2E2926] mb-1.5">Connect</h3>
            <p className="text-xs text-[#766B65] leading-relaxed">
              Share the design with a tailor and place a stitching request.
            </p>
          </div>
        </div>
      </section>

      {/* KURTI INSPIRATION (STRICTLY KURTI & SHORT KURTI ONLY) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="text-left space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B5563E]">
              Authentic Indian Garment Silhouettes
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2E2926]">
              Kurti Inspiration
            </h2>
            <p className="text-xs sm:text-sm text-[#766B65]">
              Handpicked regular kurtis and contemporary short kurtis designed for bespoke tailoring.
            </p>
          </div>

          {/* Kurti Category Filter Tabs */}
          <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-[#ECDAD4] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedExampleCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedExampleCategory === 'all'
                  ? 'bg-[#B5563E] text-white shadow-xs'
                  : 'text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              All Kurtis
            </button>
            <button
              type="button"
              onClick={() => setSelectedExampleCategory('kurti')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedExampleCategory === 'kurti'
                  ? 'bg-[#B5563E] text-white shadow-xs'
                  : 'text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              Kurti
            </button>
            <button
              type="button"
              onClick={() => setSelectedExampleCategory('short-kurti')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedExampleCategory === 'short-kurti'
                  ? 'bg-[#B5563E] text-white shadow-xs'
                  : 'text-[#766B65] hover:text-[#2E2926]'
              }`}
            >
              Short Kurti
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {inspirationExamples.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-[#ECDAD4] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group text-left"
            >
              {/* Image with Kurti category badge */}
              <div className="relative h-72 overflow-hidden bg-[#FAF2EE]">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Explicit Category Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#2E2926]/90 text-white backdrop-blur-md shadow-xs">
                    {item.category === 'short-kurti' ? 'Short Kurti' : 'Kurti'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 text-[#B5563E] backdrop-blur-md border border-[#ECDAD4]">
                    {item.style}
                  </span>
                </div>

                {/* Color dots */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-xl text-white text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {item.hexPalette.map((hex, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white"
                        style={{ backgroundColor: hex }}
                        title={item.colors[i]}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-white/90">{item.fabric}</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 space-y-3">
                <div>
                  <div className="text-[11px] font-semibold text-[#766B65] uppercase tracking-wider mb-1">
                    {item.fabric} • {item.length}
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-[#2E2926] leading-tight group-hover:text-[#B5563E] transition-colors">
                    {item.name}
                  </h3>
                </div>

                <p className="text-xs text-[#766B65] line-clamp-2 leading-relaxed font-light">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#ECDAD4]">
                  <div>
                    <span className="text-[10px] text-[#766B65] block">Tailoring from</span>
                    <span className="text-xs font-bold text-[#2E2926]">₹550</span>
                  </div>
                  <span className="text-xs font-semibold text-[#B5563E]">
                    {item.availableTailorCount} tailors available
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDesign(item);
                      navigateTo(`/preview/${item.id}`);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#FAF2EE] text-[#B5563E] hover:bg-[#ECDAD4] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>3D Fit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDesign(item);
                      navigateTo(`/design/${item.id}`);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#B5563E] text-white hover:bg-[#9C4530] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Tailor Request</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigateTo('/recommendations')}
            className="px-6 py-3 rounded-xl bg-white border border-[#ECDAD4] text-xs font-bold text-[#2E2926] hover:bg-[#FAF2EE] transition-colors inline-flex items-center gap-2"
          >
            <span>View All Curated Kurti Silhouettes ({catalog.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* WHY REWEAVE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#ECDAD4] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#B5563E]">
                Made To Measure
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2E2926]">
                Why REWEAVE?
              </h2>
              <p className="text-xs sm:text-sm text-[#766B65] leading-relaxed">
                Standard off-the-rack fashion sizes rarely fit diverse Indian silhouettes comfortably. REWEAVE pairs computer-vision fabric recognition with verified local master tailors, giving you a custom kurti engineered to your exact fit preferences.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 rounded-xl bg-[#B5563E] text-white text-xs font-bold hover:bg-[#9C4530] transition-colors cursor-pointer"
                >
                  Upload Your Image to Begin
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4]/60 space-y-1">
                <div className="flex items-center gap-2 text-[#B5563E] font-bold text-xs">
                  <Palette className="w-4 h-4" />
                  <span>Color & Pattern AI Retrieval</span>
                </div>
                <p className="text-xs text-[#766B65]">
                  Extracts dominant hues and pattern geometry from your fabric swatch to recommend harmonious kurti cuts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4]/60 space-y-1">
                <div className="flex items-center gap-2 text-[#B5563E] font-bold text-xs">
                  <Scissors className="w-4 h-4" />
                  <span>Tailor Precision Specs</span>
                </div>
                <p className="text-xs text-[#766B65]">
                  Generates standardized neckline depths, sleeve lengths, and ease allowances for the master tailor.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4]/60 space-y-1">
                <div className="flex items-center gap-2 text-[#B5563E] font-bold text-xs">
                  <Eye className="w-4 h-4" />
                  <span>3D Mannequin Visualization</span>
                </div>
                <p className="text-xs text-[#766B65]">
                  Rotate the garment 360° to evaluate hem drop, side slit height, and neckline drape before cutting.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4]/60 space-y-1">
                <div className="flex items-center gap-2 text-[#B5563E] font-bold text-xs">
                  <MapPin className="w-4 h-4" />
                  <span>Verified Neighborhood Tailors</span>
                </div>
                <p className="text-xs text-[#766B65]">
                  Directly connect with top-rated boutique tailors with upfront pricing and milestone order tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

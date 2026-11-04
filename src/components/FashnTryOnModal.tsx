import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Camera,
  CheckCircle2,
  RefreshCw,
  Scissors,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { KurtiDesign } from '../types';
import { runFashnVirtualTryOn, FashnTryOnResult } from '../lib/fashnVtonService';
import { useApp } from '../context/AppContext';

interface FashnTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: KurtiDesign;
  garmentImageUrl?: string;
}

const SAMPLE_MODELS = [
  {
    name: 'Model Priya (Portrait)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Model Ananya (Full Pose)',
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80',
  },
  {
    name: 'Model Rahul (Men\'s Portrait)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
  },
];

export const FashnTryOnModal: React.FC<FashnTryOnModalProps> = ({
  isOpen,
  onClose,
  design,
  garmentImageUrl,
}) => {
  const { navigateTo, setSelectedDesign, setSelectedTailor, tailors } = useApp();

  const [personImage, setPersonImage] = useState<string>(SAMPLE_MODELS[0].url);
  const [activeGarmentImage, setActiveGarmentImage] = useState<string>(
    garmentImageUrl || design.frontImage || design.imageUrl
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [tryOnResult, setTryOnResult] = useState<FashnTryOnResult | null>(null);

  if (!isOpen) return null;

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPersonImage(reader.result);
          setTryOnResult(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunTryOn = async () => {
    setIsRunning(true);
    setTryOnResult(null);

    // Determine category for FASHN VTON v1.5
    const catText = `${design.category} ${design.silhouette} ${design.name}`.toLowerCase();
    const category: 'tops' | 'bottoms' | 'one-pieces' = catText.includes('trouser') || catText.includes('pant')
      ? 'bottoms'
      : catText.includes('gown') || catText.includes('dress') || catText.includes('anarkali')
      ? 'one-pieces'
      : 'tops';

    try {
      const result = await runFashnVirtualTryOn({
        personImageUrl: personImage,
        garmentImageUrl: activeGarmentImage,
        category,
        garmentName: design.name,
        silhouette: design.silhouette || design.style,
        onProgress: (stage) => setCurrentStage(stage),
      });
      setTryOnResult(result);
    } catch (err: any) {
      alert('Virtual Try-On error: ' + err.message);
    } finally {
      setIsRunning(false);
      setCurrentStage('');
    }
  };

  const handleBookWithTailor = () => {
    setSelectedDesign(design);
    onClose();
    navigateTo('/tailors');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#ECDAD4] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-left">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#ECDAD4] flex items-center justify-between bg-[#FDFAF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B5563E] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-xl font-bold text-[#2E2926]">
                  AI Virtual Try-On Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  FASHN VTON v1.5
                </span>
              </div>
              <p className="text-xs text-[#766B65]">
                {design.name} • {design.fabric} {design.silhouette}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#766B65] hover:text-[#2E2926] hover:bg-[#FAF2EE] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main 2-Column or Result View */}
          {!tryOnResult ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left: Selected Garment Product */}
              <div className="md:col-span-6 space-y-3">
                <span className="text-xs font-bold text-[#4A433E] uppercase tracking-wider block">
                  1. Selected Garment Product:
                </span>
                <div className="h-80 rounded-2xl overflow-hidden bg-[#FAF2EE] border border-[#ECDAD4] relative group">
                  <img
                    src={activeGarmentImage}
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-md p-2 rounded-xl border border-[#ECDAD4] text-[11px] font-semibold text-[#2E2926] flex items-center justify-between">
                    <span>{design.name}</span>
                    <span className="text-[#B5563E] font-bold">₹{design.priceEstimate}</span>
                  </div>
                </div>
              </div>

              {/* Right: User Photo Selection */}
              <div className="md:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4A433E] uppercase tracking-wider block">
                    2. Select Model or Upload Photo:
                  </span>
                  <label className="text-xs font-bold text-[#B5563E] hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Mine</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="h-80 rounded-2xl overflow-hidden bg-[#FAF2EE] border border-[#ECDAD4] relative">
                  <img
                    src={personImage}
                    alt="Person portrait"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full font-medium backdrop-blur-xs">
                    Target Portrait
                  </div>
                </div>

                {/* Sample Models Selection Carousel */}
                <div className="flex items-center gap-2 pt-1">
                  {SAMPLE_MODELS.map((mod, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPersonImage(mod.url)}
                      className={`flex-1 py-1.5 px-2 rounded-xl border text-[10px] font-semibold truncate transition-all cursor-pointer ${
                        personImage === mod.url
                          ? 'bg-[#B5563E] text-white border-[#B5563E] shadow-2xs'
                          : 'bg-[#FAF2EE] text-[#4A433E] border-[#ECDAD4] hover:bg-white'
                      }`}
                    >
                      {mod.name.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Result Screen */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 h-[420px] rounded-3xl overflow-hidden border border-[#ECDAD4] bg-[#FAF2EE] shadow-md relative">
                  <img
                    src={tryOnResult.tryOnImageUrl}
                    alt="Virtual Try-On Result"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full border border-[#ECDAD4] text-xs font-bold text-emerald-800 shadow-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Synthesized with FASHN VTON v1.5</span>
                  </div>
                </div>

                {/* Analysis & Details */}
                <div className="md:col-span-5 space-y-4 text-left">
                  <div className="p-4 rounded-2xl bg-[#FFF5F2] border border-[#ECDAD4] space-y-1.5">
                    <span className="text-[10px] font-bold text-[#B5563E] uppercase tracking-wider block">
                      Anatomical Fit Assessment:
                    </span>
                    <p className="text-xs text-[#2E2926] leading-relaxed font-medium">
                      {tryOnResult.fitAssessment}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#766B65] uppercase tracking-wider block">
                      Tailoring Fit Highlights:
                    </span>
                    <ul className="space-y-1 text-xs text-[#4A433E]">
                      {tryOnResult.tailoringNotes.map((note, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#B5563E] font-bold">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF2EE] border border-[#ECDAD4] flex items-center justify-between text-xs">
                    <span className="text-[#766B65]">Inference Speed:</span>
                    <span className="font-mono font-bold text-[#2E2926]">
                      {tryOnResult.inferenceSeconds}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 sm:p-6 border-t border-[#ECDAD4] bg-[#FDFAF9] flex flex-col sm:flex-row items-center justify-between gap-3">
          {isRunning ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B5563E]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{currentStage || 'Synthesizing with FASHN VTON v1.5...'}</span>
            </div>
          ) : !tryOnResult ? (
            <>
              <p className="text-xs text-[#766B65]">
                Combines your portrait with the tailored garment product for realistic drape preview.
              </p>
              <button
                type="button"
                onClick={handleRunTryOn}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#B5563E] hover:bg-[#9C4530] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Virtual Try-On</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setTryOnResult(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#ECDAD4] bg-white text-[#2E2926] text-xs font-semibold hover:bg-[#FAF2EE] transition-colors cursor-pointer"
              >
                Try Another Model / Photo
              </button>
              <button
                type="button"
                onClick={handleBookWithTailor}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#B5563E] hover:bg-[#9C4530] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Scissors className="w-4 h-4" />
                <span>Connect With Tailor to Stitch</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


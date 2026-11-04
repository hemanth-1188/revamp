import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Upload,
  Sparkles,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileImage,
  ArrowRight,
  Info,
} from 'lucide-react';

export const UploadPage: React.FC = () => {
  const {
    uploadedImage,
    analysisResult,
    isAnalyzing,
    analysisStage,
    runUploadAndAnalyze,
    resetUpload,
    navigateTo,
    showToast,
  } = useApp();

  const [previewUrl, setPreviewUrl] = useState<string | null>(uploadedImage || null);
  const [fileName, setFileName] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [inputTypeChoice, setInputTypeChoice] = useState<'auto' | 'fabric_only' | 'finished_garment'>('auto');
  const [fabricQuantityCategory, setFabricQuantityCategory] = useState<'unknown' | 'small' | 'standard' | 'large' | 'saree'>('unknown');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a JPG, PNG, or WEBP image file.', 'error');
      return;
    }

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10 MB limit.', 'error');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const getSelectedFabricQuantity = (): import('../types').FabricQuantity => {
    switch (fabricQuantityCategory) {
      case 'small':
        return { category: 'small', meters: 1.2, label: 'Small piece (< 1.5m • blouse / short kurti)', userProvided: true };
      case 'standard':
        return { category: 'standard', meters: 2.2, label: 'Standard kurti cut (1.8 - 2.5m)', userProvided: true };
      case 'large':
        return { category: 'large', meters: 3.5, label: 'Large cut (3.0 - 4.5m)', userProvided: true };
      case 'saree':
        return { category: 'saree', meters: 5.5, label: 'Saree length (5.5m+)', userProvided: true };
      case 'unknown':
      default:
        return { category: 'unknown', label: 'Unmeasured / Not specified', userProvided: false };
    }
  };

  const handleStartAnalysis = async () => {
    if (!previewUrl) return;
    await runUploadAndAnalyze(previewUrl, fileName, {
      declaredInputType: inputTypeChoice === 'auto' ? undefined : inputTypeChoice,
      fabricQuantity: getSelectedFabricQuantity(),
    });
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileName('');
    resetUpload();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* Page Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B5563E]/10 text-[#B5563E] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          AI Pattern & Color Extraction
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#2E2926]">
          Upload Your Kurti Inspiration
        </h1>
        <p className="text-sm text-[#766B65]">
          Upload a clear photo of a kurti, fabric, print, or outfit you like. Our AI will analyze the colors and patterns to find matching designs.
        </p>
      </div>

      {/* MAIN UPLOAD ZONE */}
      {!previewUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-[#B5563E] bg-[#F2C3B9]/30 scale-[1.01]'
              : 'border-[#ECDAD4] hover:border-[#B5563E] bg-white'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="font-editorial text-xl font-bold text-[#2E2926] mb-1">
            Drag & drop your kurti or fabric photo here
          </h3>
          <p className="text-xs text-[#766B65] max-w-sm mx-auto mb-4">
            Supports JPG, JPEG, PNG, or WEBP up to 10 MB.
          </p>

          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-[#B5563E] text-white text-xs font-semibold hover:bg-[#9C4530] transition-colors shadow-xs"
          >
            Browse Files from Device
          </button>
        </div>
      ) : (
        /* IMAGE PREVIEW & ACTION CARD */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] shadow-md space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Image Preview Box */}
            <div className="w-full md:w-80 h-80 rounded-2xl overflow-hidden bg-[#FAF2EE] border border-[#ECDAD4] relative shrink-0">
              <img
                src={previewUrl}
                alt="Uploaded Kurti Inspiration"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-600 hover:bg-rose-50 border border-[#ECDAD4] shadow-xs cursor-pointer transition-transform hover:scale-105"
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Analysis Progress / Trigger Panel */}
            <div className="flex-1 space-y-5 text-left w-full">
              <div>
                <span className="text-xs font-bold text-[#B5563E] uppercase tracking-wider">
                  Image Ready
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#2E2926] mt-0.5">
                  Analyze Kurti Design
                </h3>
                <p className="text-xs text-[#766B65] mt-1 leading-relaxed">
                  The AI pipeline will run K-means color clustering in LAB space and zero-shot pattern classification against our curated database.
                </p>
              </div>

              {/* Progress State while Analyzing */}
              {isAnalyzing ? (
                <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] space-y-3 animate-pulse">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-[#B5563E]">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#B5563E]" />
                    <span>AI Processing in progress...</span>
                  </div>
                  <p className="text-xs font-medium text-[#2E2926]">
                    {analysisStage || 'Extracting features...'}
                  </p>
                  <div className="w-full bg-[#ECDAD4] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#B5563E] h-2 rounded-full animate-[shimmer_2s_infinite] w-3/4"></div>
                  </div>
                  <p className="text-[11px] text-[#766B65]">
                    Approx. 2 seconds • Preparing feature vectors
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Optional Input Type & Fabric Dimensions Helper */}
                  <div className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4] space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-[#2E2926] block mb-1">
                        What does this photo represent? (Optional hint)
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'auto', label: 'Auto-detect (AI)' },
                          { id: 'fabric_only', label: 'Fabric Only' },
                          { id: 'finished_garment', label: 'Finished Garment' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setInputTypeChoice(opt.id as any)}
                            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer text-center ${
                              inputTypeChoice === opt.id
                                ? 'bg-[#B5563E] text-white border-[#B5563E] shadow-2xs'
                                : 'bg-white text-[#2E2926] border-[#ECDAD4] hover:bg-[#ECDAD4]/50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {inputTypeChoice !== 'finished_garment' && (
                      <div className="pt-2 border-t border-[#ECDAD4]/70">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#2E2926]">
                            Available Fabric Yardage (Optional):
                          </span>
                          <span className="text-[10px] text-[#766B65]">Calibrates suitable cuts</span>
                        </div>
                        <select
                          value={fabricQuantityCategory}
                          onChange={(e) => setFabricQuantityCategory(e.target.value as any)}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#ECDAD4] bg-white text-xs text-[#2E2926] font-medium focus:outline-hidden"
                        >
                          <option value="unknown">Unmeasured / Not specified (AI will suggest versatile kurti cuts)</option>
                          <option value="small">Small piece (&lt; 1.5m • Remnant / Blouse / Short Kurti)</option>
                          <option value="standard">Standard kurti cut (1.8 – 2.5m • Straight or A-Line Kurti)</option>
                          <option value="large">Large cut (3.0 – 4.5m • Flared Anarkali / Kurti Set)</option>
                          <option value="saree">Saree length (5.5m+ continuous yardage)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleStartAnalysis}
                      disabled={isAnalyzing}
                      className="px-6 py-3 rounded-xl bg-[#B5563E] text-white text-xs font-semibold hover:bg-[#9C4530] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Design</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={isAnalyzing}
                      className="px-4 py-3 rounded-xl bg-white border border-[#ECDAD4] text-xs font-semibold text-[#766B65] hover:text-[#2E2926] transition-colors cursor-pointer"
                    >
                      Upload Another Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

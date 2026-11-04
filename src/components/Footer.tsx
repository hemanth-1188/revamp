import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <footer className="bg-[#FAF2EE] border-t border-[#ECDAD4] mt-20 pt-14 pb-20 md:pb-12 text-[#4A433E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#B5563E] text-white flex items-center justify-center font-editorial text-xl font-bold">
                R
              </div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-[#2E2926]">
                REWEAVE
              </span>
            </div>
            <p className="text-xs text-[#766B65] leading-relaxed">
              Bridging the gap between ethnic fashion inspiration and local tailor artistry through computer vision and 3D visualization.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B5563E]/10 text-[#B5563E] text-[11px] font-semibold">
                <Sparkles className="w-3 h-3" />
                AI-Powered Kurti Retrieval System
              </span>
            </div>
          </div>

          {/* Col 2: Platform Journey */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E2926] mb-3">
              User Journey
            </h4>
            <ul className="space-y-2 text-xs text-[#766B65]">
              <li>
                <button type="button" onClick={() => navigateTo('/upload')} className="hover:text-[#B5563E] cursor-pointer">
                  1. Upload Fabric Inspiration
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('/recommendations')} className="hover:text-[#B5563E] cursor-pointer">
                  2. AI Pattern & Color Matching
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('/recommendations')} className="hover:text-[#B5563E] cursor-pointer">
                  3. 3D Mannequin Fit Preview
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('/tailors')} className="hover:text-[#B5563E] cursor-pointer">
                  4. Geo-Ranked Tailor Discovery
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('/orders')} className="hover:text-[#B5563E] cursor-pointer">
                  5. Stitching Order & Live Tracking
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Technical Architecture */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E2926] mb-3">
              AI & Engineering
            </h4>
            <ul className="space-y-2 text-xs text-[#766B65]">
              <li>• K-Means Clustering (LAB/HSV Dominant Colors)</li>
              <li>• Zero-Shot CLIP Pattern Classifier (Prompt Tuning)</li>
              <li>• Feature-Based Cosine Retrieval Ranking</li>
              <li>• Three.js Interactive Mannequin Visualizer</li>
              <li>• Grok AI 2D Garment Image Synthesis</li>
              <li>• Leaflet & OpenStreetMap Geolocation Index</li>
              <li>• Secure Payment Gateway Integration</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#ECDAD4] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#766B65]">
          <p>© 2026 REWEAVE Platform. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[11px]">
            Designed with <Heart className="w-3 h-3 text-[#B5563E] fill-[#B5563E]" /> for Indian Ethnic Fashion
          </div>
        </div>
      </div>
    </footer>
  );
};

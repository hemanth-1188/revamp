import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TailorMap } from '../components/TailorMap';
import {
  Scissors,
  MapPin,
  Star,
  Clock,
  Filter,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Phone,
  Eye,
} from 'lucide-react';
import { Tailor } from '../types';

export const TailorDiscoveryPage: React.FC = () => {
  const {
    tailors,
    selectedDesign,
    selectedTailor,
    setSelectedTailor,
    navigateTo,
  } = useApp();

  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'distance'>('match');
  const [activeTailor, setActiveTailor] = useState<Tailor | null>(selectedTailor || tailors[0]);

  // Rank tailors using the formula from specs:
  // tailorScore = 0.35 * specializationMatch + 0.30 * ratingScore + 0.20 * availabilityScore + 0.15 * distanceScore
  const scoredTailors = tailors
    .filter((t) => t.distance <= maxDistance)
    .map((tailor) => {
      let specMatch = 0.5;
      const reasons: string[] = [];

      if (selectedDesign) {
        const queryTerms = [
          selectedDesign.fabric,
          selectedDesign.style,
          selectedDesign.pattern,
          `${selectedDesign.fabric} Kurtis`,
          `${selectedDesign.style} Kurtis`,
        ];

        const matches = tailor.specializations.filter((s) =>
          queryTerms.some((q) => s.toLowerCase().includes(q.toLowerCase()) || q.toLowerCase().includes(s.toLowerCase()))
        );

        if (matches.length > 0) {
          specMatch = Math.min(1.0, 0.65 + matches.length * 0.2);
          reasons.push(`Specializes in ${matches[0]}`);
        } else {
          specMatch = 0.45;
        }
      } else {
        reasons.push('Expert master artisan in ethnic wear');
      }

      const ratingScore = Math.max(0, (tailor.rating - 3.5) / 1.5);
      reasons.push(`${tailor.rating} ★ rated (${tailor.reviewCount} reviews)`);

      const availScore =
        tailor.availability === 'Available this week' ? 1.0 : tailor.availability === 'Next week' ? 0.7 : 0.3;

      const distScore = Math.max(0, (10 - tailor.distance) / 10);
      reasons.push(`${tailor.distance} km away in ${tailor.location.split(',')[0]}`);

      const rankScore = Math.round(
        (0.35 * specMatch + 0.30 * ratingScore + 0.20 * availScore + 0.15 * distScore) * 100
      );

      return {
        ...tailor,
        rankScore,
        rankReasons: reasons.slice(0, 3),
      };
    })
    .sort((a, b) => {
      if (sortBy === 'match') return (b.rankScore || 0) - (a.rankScore || 0);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'distance') return a.distance - b.distance;
      return 0;
    });

  const handleSelectTailor = (tailor: Tailor) => {
    setActiveTailor(tailor);
    setSelectedTailor(tailor);
  };

  const handleProceedToOrder = (tailor: Tailor) => {
    setSelectedTailor(tailor);
    navigateTo('/order');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Page Heading & Design Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECDAD4] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B5563E]/10 text-[#B5563E] text-xs font-bold mb-2">
            <Scissors className="w-3.5 h-3.5" />
            Verified Master Tailors • OpenStreetMap
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#2E2926]">
            Find Your Local Tailor
          </h1>
          <p className="text-sm text-[#766B65] mt-1">
            Connect with neighborhood tailors who specialize in handblock prints, bias seams, and custom ethnic cuts.
          </p>
        </div>

        {selectedDesign && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#ECDAD4] shadow-xs">
            <img
              src={selectedDesign.imageUrl}
              alt={selectedDesign.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="text-xs">
              <span className="text-[#B5563E] font-semibold block">Matching for:</span>
              <p className="font-bold text-[#2E2926] truncate max-w-[180px]">{selectedDesign.name}</p>
              <span className="text-[10px] text-[#766B65]">{selectedDesign.style} • {selectedDesign.fabric}</span>
            </div>
          </div>
        )}
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white rounded-2xl p-4 border border-[#ECDAD4] shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Distance Range Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#766B65]">Distance Range:</span>
          {[2, 5, 10].map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => setMaxDistance(km)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                maxDistance === km
                  ? 'bg-[#B5563E] text-white shadow-xs'
                  : 'bg-[#FAF2EE] text-[#766B65] hover:bg-[#F2C3B9]/30'
              }`}
            >
              Within {km} km
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#766B65] font-semibold">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] font-semibold text-[#2E2926] focus:outline-hidden focus:ring-1 focus:ring-[#B5563E]"
          >
            <option value="match">Recommended for this Design</option>
            <option value="rating">Highest Rated (★)</option>
            <option value="distance">Nearest Distance</option>
          </select>
        </div>
      </div>

      {/* MAP + TAILORS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive OpenStreetMap with Pins */}
        <div className="lg:col-span-6 h-[480px] lg:h-[700px] sticky top-24">
          <TailorMap
            tailors={scoredTailors}
            selectedTailorId={activeTailor?.id}
            onSelectTailor={handleSelectTailor}
          />
        </div>

        {/* Right: Tailor Cards List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#766B65]">
            <span>Showing {scoredTailors.length} registered artisan tailors</span>
            <span>Sorted by {sortBy === 'match' ? 'Recommendation Rank' : sortBy}</span>
          </div>

          <div className="space-y-4">
            {scoredTailors.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-[#ECDAD4] text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center mx-auto">
                  <Scissors className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#2E2926]">No Registered Tailors Found</h3>
                <p className="text-xs text-[#766B65] max-w-sm mx-auto">
                  No tailors found within {maxDistance} km. Tailors can register their shop and pinpoint their exact geolocation on the map via the Tailor Dashboard.
                </p>
              </div>
            ) : (
              scoredTailors.map((tailor) => {
              const isSelected = activeTailor?.id === tailor.id;

              return (
                <div
                  key={tailor.id}
                  onClick={() => handleSelectTailor(tailor)}
                  className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-[#B5563E] shadow-md ring-2 ring-[#B5563E]/20 bg-[#FDFAF9]'
                      : 'border-[#ECDAD4] hover:border-[#B5563E] shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={tailor.profileImage}
                      alt={tailor.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-[#ECDAD4] shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-editorial text-xl font-bold text-[#2E2926] truncate">
                          {tailor.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-[#FAF2EE] px-2 py-0.5 rounded-md text-xs font-bold text-[#2E2926]">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{tailor.rating}</span>
                          <span className="text-[10px] text-[#766B65]">({tailor.reviewCount})</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#766B65] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#B5563E]" />
                        <span>{tailor.location}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs mt-2 font-medium">
                        <span className="text-[#B5563E] font-bold">{tailor.distance} km away</span>
                        <span>•</span>
                        <span className="text-[#2E2926] font-semibold">{tailor.priceRange}</span>
                        <span>•</span>
                        <span className={`text-[11px] font-semibold ${
                          tailor.availability === 'Available this week'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}>
                          {tailor.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Reasons Pill Box (Mandated by Spec) */}
                  {tailor.rankReasons && (
                    <div className="mt-3.5 p-3 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4]/80 space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-[#B5563E] uppercase tracking-wider block">
                        Recommended for this design:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tailor.rankReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-white text-[#4A433E] font-medium px-2 py-0.5 rounded-md border border-[#ECDAD4]"
                          >
                            ✓ {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specializations Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tailor.specializations.map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] bg-[#FDFAF9] text-[#766B65] px-2.5 py-0.5 rounded-lg border border-[#ECDAD4]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-[#ECDAD4] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTailor(tailor);
                        navigateTo(`/tailors/${tailor.id}`);
                      }}
                      className="px-4 py-2 rounded-xl bg-white border border-[#ECDAD4] hover:border-[#B5563E] text-xs font-semibold text-[#2E2926] transition-colors cursor-pointer"
                    >
                      View Profile & Reviews
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProceedToOrder(tailor);
                      }}
                      className="px-5 py-2 rounded-xl bg-[#B5563E] text-white hover:bg-[#9C4530] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Select Tailor</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

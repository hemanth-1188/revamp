import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Star,
  MapPin,
  Clock,
  Scissors,
  ArrowLeft,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  Calendar,
  X,
  Send,
} from 'lucide-react';
import { REVIEWS } from '../data/mockData';

export const TailorDetailPage: React.FC = () => {
  const {
    tailors,
    selectedTailor,
    setSelectedTailor,
    selectedDesign,
    navigateTo,
    routeParams,
    showToast,
  } = useApp();

  const tailorId = routeParams?.id || selectedTailor?.id;
  const tailor = tailors.find((t) => t.id === tailorId) || tailors[0];

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  if (!tailor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FAF2EE] text-[#B5563E] flex items-center justify-center mx-auto">
          <Scissors className="w-8 h-8" />
        </div>
        <h2 className="font-editorial text-2xl font-bold text-[#2E2926]">Tailor Profile Not Found</h2>
        <p className="text-sm text-[#766B65]">
          No tailor profile is registered or selected yet. Tailors can register their shop and location from the tailor portal.
        </p>
        <button
          type="button"
          onClick={() => navigateTo('/tailors')}
          className="px-5 py-2.5 rounded-xl bg-[#B5563E] text-white text-xs font-bold hover:bg-[#9C4530] transition-colors cursor-pointer"
        >
          Back to Tailor Directory
        </button>
      </div>
    );
  }

  // Relevant reviews
  const tailorReviews = REVIEWS.filter((r) => r.tailorId === tailor.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      setMessageModalOpen(false);
      showToast(`Inquiry sent to ${tailor.name}! They will reply via SMS/WhatsApp.`, 'success');
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Top back navigation */}
      <button
        type="button"
        onClick={() => navigateTo('/tailors')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#766B65] hover:text-[#2E2926] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tailor Directory</span>
      </button>

      {/* Main Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <img
            src={tailor.profileImage}
            alt={tailor.name}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-[#ECDAD4] shadow-xs"
          />

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2E2926]">
                  {tailor.name}
                </h1>
                <p className="text-xs text-[#766B65] flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#B5563E]" />
                  <span>{tailor.location}</span>
                  <span>•</span>
                  <span className="text-[#B5563E] font-semibold">{tailor.distance} km from your location</span>
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#FAF2EE] px-3.5 py-1.5 rounded-xl border border-[#ECDAD4]">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-[#2E2926]">{tailor.rating}</span>
                <span className="text-xs text-[#766B65]">({tailor.reviewCount} reviews)</span>
              </div>
            </div>

            <p className="text-xs text-[#4A433E] leading-relaxed">
              {tailor.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FDFAF9] border border-[#ECDAD4]">
                <span className="text-[10px] text-[#766B65] block">Experience</span>
                <span className="font-bold text-[#2E2926]">{tailor.experience} Years Craft</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FDFAF9] border border-[#ECDAD4]">
                <span className="text-[10px] text-[#766B65] block">Starting Stitch Price</span>
                <span className="font-bold text-[#B5563E]">{tailor.priceRange}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FDFAF9] border border-[#ECDAD4]">
                <span className="text-[10px] text-[#766B65] block">Turnaround Time</span>
                <span className="font-bold text-[#2E2926]">4–6 Working Days</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FDFAF9] border border-[#ECDAD4]">
                <span className="text-[10px] text-[#766B65] block">Availability</span>
                <span className="font-bold text-emerald-700">{tailor.availability}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedTailor(tailor);
                  navigateTo('/order');
                }}
                className="px-6 py-3 rounded-xl bg-[#B5563E] text-white text-xs font-bold hover:bg-[#9C4530] transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Scissors className="w-4 h-4" />
                <span>Choose this Tailor for Stitching</span>
              </button>

              <button
                type="button"
                onClick={() => setMessageModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-white border border-[#ECDAD4] hover:bg-[#FAF2EE] text-xs font-semibold text-[#2E2926] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#B5563E]" />
                <span>Send Message / Inquiry</span>
              </button>

              <div className="text-xs text-[#766B65] flex items-center gap-1.5 ml-auto">
                <Phone className="w-3.5 h-3.5 text-[#B5563E]" />
                <span>{tailor.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SPECIALIZATIONS & SAMPLE WORK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Tailor Portfolio */}
          <div className="bg-white rounded-3xl p-6 border border-[#ECDAD4] shadow-xs space-y-4">
            <h3 className="font-editorial text-2xl font-bold text-[#2E2926]">
              Bespoke Tailoring Portfolio
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {tailor.sampleImages.map((imgUrl, idx) => (
                <div key={idx} className="h-56 rounded-2xl overflow-hidden bg-[#FAF2EE] border border-[#ECDAD4]">
                  <img
                    src={imgUrl}
                    alt={`Portfolio work ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="bg-white rounded-3xl p-6 border border-[#ECDAD4] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-2xl font-bold text-[#2E2926]">
                Customer Reviews ({tailorReviews.length > 0 ? tailorReviews.length : 3})
              </h3>
              <span className="text-xs text-[#B5563E] font-semibold">100% Verified Fittings</span>
            </div>

            <div className="space-y-3">
              {tailorReviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-[#FAF2EE] border border-[#ECDAD4]/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2E2926]">{rev.userName}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      {'★'.repeat(Math.round(rev.rating))}
                      <span className="text-[#766B65] text-[11px] ml-1">{rev.createdAt}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#4A433E] leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Master Craftsmanship Badge */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white p-6 rounded-3xl border border-[#ECDAD4] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#B5563E] font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Tailoring Quality Guarantee</span>
            </div>
            <ul className="text-xs text-[#766B65] space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B5563E] shrink-0 mt-0.5" />
                <span>French seams & interlock edge finishes prevent fraying on pure cotton.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B5563E] shrink-0 mt-0.5" />
                <span>Includes 2-inch side seam margins for effortless future resizing.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B5563E] shrink-0 mt-0.5" />
                <span>Complimentary alteration check within 7 days of pickup.</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => {
                setSelectedTailor(tailor);
                navigateTo('/order');
              }}
              className="w-full py-3 rounded-xl bg-[#B5563E] text-white text-xs font-bold hover:bg-[#9C4530] transition-colors cursor-pointer"
            >
              Continue to Stitching Order
            </button>
          </div>
        </div>
      </div>

      {/* MESSAGE / INQUIRY MODAL */}
      {messageModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-[#ECDAD4] shadow-2xl max-w-md w-full space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#ECDAD4] pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#B5563E]" />
                <h3 className="text-sm font-bold text-[#2E2926]">Contact {tailor.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setMessageModalOpen(false)}
                className="p-1 rounded-lg text-[#766B65] hover:bg-[#FAF2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#766B65] block mb-1">
                  Your Message or Fabric Question:
                </label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] focus:outline-hidden focus:ring-1 focus:ring-[#B5563E]"
                  required
                />
              </div>

              <div className="text-[11px] text-[#766B65]">
                {tailor.name} typically responds in under 30 minutes during shop hours (10 AM – 8 PM).
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMessageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#766B65] hover:bg-[#FAF2EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingMessage}
                  className="px-5 py-2 rounded-xl bg-[#B5563E] text-white text-xs font-semibold hover:bg-[#9C4530] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingMessage ? 'Sending...' : 'Send Inquiry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  LocateFixed,
  CheckCircle2,
  Scissors,
  ArrowRight,
  Star,
  Clock,
  Compass,
} from 'lucide-react';
import { Tailor, User } from '../types';

interface CustomerLocationMapProps {
  user: User | null;
  tailors: Tailor[];
  onUpdateLocation: (newAddress: string, lat: number, lng: number) => void;
  onSelectTailor: (tailor: Tailor) => void;
  onProceedToOrder: (tailor: Tailor) => void;
}

// Haversine formula to compute distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const CustomerLocationMap: React.FC<CustomerLocationMapProps> = ({
  user,
  tailors,
  onUpdateLocation,
  onSelectTailor,
  onProceedToOrder,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tailorMarkersRef = useRef<L.Marker[]>([]);

  // Default coords (Bangalore or user's coords)
  const initialLat = user?.latitude || 12.9716;
  const initialLng = user?.longitude || 77.5946;

  const [coords, setCoords] = useState<[number, number]>([initialLat, initialLng]);
  const [addressInput, setAddressInput] = useState<string>(user?.location || 'Indiranagar, Bengaluru');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [selectedTailor, setSelectedTailor] = useState<Tailor | null>(tailors[0] || null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: coords,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Customer Location Pin Icon (pulsing terracotta pin)
      const customerPinIcon = L.divIcon({
        className: 'customer-pin-marker',
        html: `
          <div style="
            background: #B5563E;
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 14px rgba(181, 86, 62, 0.45);
            white-space: nowrap;
          ">
            <span>📍</span>
            <span>Your Location</span>
          </div>
        `,
        iconSize: [120, 32],
        iconAnchor: [60, 16],
      });

      const userMarker = L.marker(coords, {
        icon: customerPinIcon,
        draggable: true,
      }).addTo(map);

      userMarker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        const newCoords: [number, number] = [newLatLng.lat, newLatLng.lng];
        setCoords(newCoords);
        reverseGeocode(newCoords[0], newCoords[1]);
      });

      // Click on map to set your location
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        userMarker.setLatLng([lat, lng]);
        const newCoords: [number, number] = [lat, lng];
        setCoords(newCoords);
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      userMarkerRef.current = userMarker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tailor pins whenever tailors or selectedTailor changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old tailor markers
    tailorMarkersRef.current.forEach((m) => m.remove());
    tailorMarkersRef.current = [];

    tailors.forEach((tailor) => {
      const isSelected = selectedTailor?.id === tailor.id;
      const tailorLat = tailor.latitude && tailor.latitude !== 0 ? tailor.latitude : coords[0] + (Math.random() - 0.5) * 0.04;
      const tailorLng = tailor.longitude && tailor.longitude !== 0 ? tailor.longitude : coords[1] + (Math.random() - 0.5) * 0.04;

      const dynamicDistance = calculateDistanceKm(coords[0], coords[1], tailorLat, tailorLng);

      const tailorIcon = L.divIcon({
        className: 'dashboard-tailor-pin',
        html: `
          <div style="
            background: ${isSelected ? '#B5563E' : '#2E2926'};
            color: #ffffff;
            padding: 5px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 5px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            cursor: pointer;
            transform: scale(${isSelected ? '1.12' : '1.0'});
            transition: transform 0.15s ease-in-out;
            white-space: nowrap;
          ">
            <span>✂️</span>
            <span>${tailor.name.split(' ')[0]}</span>
            <span style="background: rgba(255,255,255,0.25); padding: 1px 4px; border-radius: 4px; font-size: 10px;">
              ${dynamicDistance}km
            </span>
          </div>
        `,
        iconSize: [130, 32],
        iconAnchor: [65, 16],
      });

      const marker = L.marker([tailorLat, tailorLng], { icon: tailorIcon })
        .addTo(map)
        .on('click', () => {
          setSelectedTailor(tailor);
          onSelectTailor(tailor);
        });

      tailorMarkersRef.current.push(marker);
    });
  }, [tailors, selectedTailor, coords]);

  // Reverse geocode via OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const displayName =
          data.address?.suburb ||
          data.address?.neighbourhood ||
          data.address?.residential ||
          data.address?.city ||
          data.address?.town ||
          data.address?.county ||
          data.display_name?.split(',').slice(0, 2).join(',') ||
          `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        setAddressInput(displayName);
        onUpdateLocation(displayName, lat, lng);
        setStatusMessage(`Location updated to ${displayName}`);
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddressInput(fallback);
      onUpdateLocation(fallback, lat, lng);
    }
  };

  // Browser GPS Geolocation Handler
  const handleAccessGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setStatusMessage('Accessing your device GPS location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newCoords: [number, number] = [lat, lng];

        setCoords(newCoords);
        if (mapInstanceRef.current && userMarkerRef.current) {
          mapInstanceRef.current.setView(newCoords, 14);
          userMarkerRef.current.setLatLng(newCoords);
        }

        reverseGeocode(lat, lng);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        console.warn('GPS location access error:', error.message);
        setStatusMessage('Could not acquire GPS. You can type your location or click on the map.');
        setTimeout(() => setStatusMessage(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Handle Manual Location Save ("proceed with their own")
  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;

    onUpdateLocation(addressInput.trim(), coords[0], coords[1]);
    setStatusMessage(`Saved location: ${addressInput.trim()}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] shadow-sm space-y-6 text-left">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECDAD4] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B5563E]/10 text-[#B5563E] text-xs font-bold mb-1.5">
            <Compass className="w-3.5 h-3.5" />
            Hyperlocal Tailor Geospatial Hub
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2E2926]">
            Locate Master Tailors Near You
          </h2>
          <p className="text-xs text-[#766B65] mt-1">
            Let Leaflet access your live GPS or proceed with your own custom location to discover verified artisanal boutiques.
          </p>
        </div>

        {/* Live GPS Access Button */}
        <button
          type="button"
          onClick={handleAccessGPS}
          disabled={isLocating}
          className="px-4 py-2.5 rounded-2xl bg-[#B5563E] hover:bg-[#9C4530] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Accessing GPS...' : 'Access My Live Location'}</span>
        </button>
      </div>

      {/* Manual Input Form & Quick Help ("proceed with their own") */}
      <form onSubmit={handleManualLocationSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <MapPin className="w-4 h-4 text-[#B5563E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Enter your area, street, or city (e.g. Indiranagar, Bengaluru)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs font-semibold text-[#2E2926] focus:outline-none focus:ring-2 focus:ring-[#B5563E]/30"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#2E2926] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          Set My Location
        </button>
      </form>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Embedded Leaflet Map */}
      <div className="relative rounded-2xl overflow-hidden border border-[#ECDAD4] shadow-xs">
        <div ref={mapContainerRef} className="h-72 sm:h-96 w-full z-10" />

        <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#ECDAD4] shadow-xs text-[11px] font-semibold text-[#4A433E]">
          📍 Click map or drag pin to adjust
        </div>
      </div>

      {/* Selected Tailor Preview Card & Proceed to Booking CTA */}
      {selectedTailor && (
        <div className="bg-[#FAF2EE] p-5 rounded-2xl border border-[#ECDAD4] flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              src={selectedTailor.profileImage}
              alt={selectedTailor.name}
              className="w-16 h-16 rounded-2xl object-cover border border-[#ECDAD4] shadow-xs"
            />
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-editorial text-xl font-bold text-[#2E2926]">
                  {selectedTailor.name}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-white text-[#B5563E] border border-[#ECDAD4] text-[10px] font-bold">
                  ★ {selectedTailor.rating} ({selectedTailor.reviewCount || 12} reviews)
                </span>
              </div>
              <p className="text-xs text-[#766B65]">
                {selectedTailor.location} • <strong className="text-[#B5563E]">{selectedTailor.distance} km away</strong>
              </p>
              <div className="flex items-center gap-2 text-[11px] text-[#4A433E] flex-wrap">
                <span>Starts at ₹{selectedTailor.startingPrice || 550}</span>
                <span>•</span>
                <span>Turnaround: {selectedTailor.turnaroundTime || '3 - 5 days'}</span>
                <span>•</span>
                <span className="text-[#B5563E] font-medium">
                  {selectedTailor.specializations.slice(0, 2).join(', ')}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onProceedToOrder(selectedTailor)}
            className="px-6 py-3.5 rounded-xl bg-[#B5563E] hover:bg-[#9C4530] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Scissors className="w-4 h-4" />
            <span>Proceed with this Tailor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

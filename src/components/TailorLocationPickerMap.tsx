import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, CheckCircle2, LocateFixed } from 'lucide-react';

interface TailorLocationPickerMapProps {
  initialCoords?: [number, number];
  initialAddress?: string;
  tailorName?: string;
  onSaveLocation: (address: string, coords: [number, number]) => void;
}

export const TailorLocationPickerMap: React.FC<TailorLocationPickerMapProps> = ({
  initialCoords = [20.5937, 78.9629], // Center default until tailor pins or detects GPS
  initialAddress = '',
  tailorName = 'My Boutique & Workshop',
  onSaveLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [coords, setCoords] = useState<[number, number]>(initialCoords);
  const [address, setAddress] = useState<string>(initialAddress);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: coords,
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Tailor Workshop Pin Icon
      const tailorPinIcon = L.divIcon({
        className: 'tailor-picker-pin',
        html: `
          <div style="
            background: #B5563E;
            color: #ffffff;
            padding: 8px 12px;
            border-radius: 14px;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 14px rgba(181, 86, 62, 0.4);
            cursor: grab;
            white-space: nowrap;
          ">
            <span>✂️</span>
            <span>${tailorName.split(' ')[0]} (Shop Location)</span>
          </div>
        `,
        iconSize: [160, 36],
        iconAnchor: [80, 18],
      });

      // Draggable marker
      const marker = L.marker(coords, {
        icon: tailorPinIcon,
        draggable: true,
      }).addTo(map);

      // Handle marker drag
      marker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        setCoords([newLatLng.lat, newLatLng.lng]);
        setSavedSuccess(false);
      });

      // Handle map click to reposition marker
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords([lat, lng]);
        setSavedSuccess(false);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      // Map cleanup if container unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position when coords state changes
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng(coords);
      mapInstanceRef.current.panTo(coords);
    }
  }, [coords]);

  // Use browser Geolocation to detect current position
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCoords(newCoords);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(newCoords, 15);
        }
        setIsLocating(false);
        setSavedSuccess(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setIsLocating(false);
        alert('Could not retrieve GPS location. Please click on the map to set your location.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSave = () => {
    onSaveLocation(address.trim(), coords);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECDAD4] shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECDAD4] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B5563E]/10 text-[#B5563E] text-xs font-bold mb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Leaflet Geolocation Engine
          </div>
          <h2 className="font-editorial text-2xl font-bold text-[#2E2926]">
            Register & Pin Your Workshop Location
          </h2>
          <p className="text-xs text-[#766B65]">
            Click anywhere on the map or drag your marker to set your exact workshop pin. Customers nearby will discover your boutique based on this registered geolocation.
          </p>
        </div>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="px-4 py-2.5 rounded-xl bg-[#FAF2EE] hover:bg-[#ECDAD4] text-xs font-bold text-[#2E2926] border border-[#ECDAD4] transition-all flex items-center gap-2 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <LocateFixed className={`w-4 h-4 text-[#B5563E] ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Detecting GPS...' : 'Use My Current GPS Location'}</span>
        </button>
      </div>

      {/* Interactive Leaflet Map Viewport */}
      <div className="h-[360px] sm:h-[400px] rounded-2xl overflow-hidden border border-[#ECDAD4] shadow-xs relative">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating coordinates indicator badge */}
        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#ECDAD4] text-[11px] font-mono font-bold text-[#2E2926] shadow-sm pointer-events-none">
          Lat: {coords[0].toFixed(5)}, Lng: {coords[1].toFixed(5)}
        </div>
      </div>

      {/* Workshop Address & Save Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-8 space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4A433E]">
            Shop / Boutique Street Address & Landmark
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#B5563E] absolute left-3.5 top-3" />
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setSavedSuccess(false);
              }}
              placeholder="e.g. Shop #12, Market Main Road, Near City Center"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ECDAD4] bg-[#FDFAF9] text-xs text-[#2E2926] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#B5563E]/40"
            />
          </div>
        </div>

        <div className="md:col-span-4">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 px-4 rounded-xl bg-[#B5563E] hover:bg-[#9C4530] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Location Registered Live!</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Save & Register Location</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


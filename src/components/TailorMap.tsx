import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Tailor } from '../types';

interface TailorMapProps {
  tailors: Tailor[];
  selectedTailorId?: string;
  onSelectTailor: (tailor: Tailor) => void;
  userCoords?: [number, number];
}

export const TailorMap: React.FC<TailorMapProps> = ({
  tailors,
  selectedTailorId,
  onSelectTailor,
  userCoords = [12.9716, 77.5946], // Bangalore center coordinates
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.955, 77.62],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add User Location Pulse Marker
    const userIcon = L.divIcon({
      className: 'user-pin',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background: #B5563E;
          border: 3px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 0 0 6px rgba(181, 86, 62, 0.25);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const userMarker = L.marker(userCoords as L.LatLngTuple, { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>Your Current Location</b>');
    markersRef.current.push(userMarker);

    // Add Tailor Markers
    tailors.forEach((tailor) => {
      const isSelected = tailor.id === selectedTailorId;

      const tailorIcon = L.divIcon({
        className: 'custom-tailor-pin',
        html: `
          <div style="
            background: ${isSelected ? '#B5563E' : '#2E2926'};
            color: #ffffff;
            padding: 6px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.18);
            transform: scale(${isSelected ? '1.15' : '1.0'});
            transition: all 0.2s;
            white-space: nowrap;
          ">
            <span>✂️</span>
            <span>${tailor.name.split(' ')[0]}</span>
            <span style="background: rgba(255,255,255,0.25); padding: 1px 4px; border-radius: 4px; font-size: 10px;">★ ${tailor.rating}</span>
          </div>
        `,
        iconSize: [120, 36],
        iconAnchor: [60, 18],
      });

      const marker = L.marker([tailor.latitude, tailor.longitude], { icon: tailorIcon })
        .addTo(map)
        .on('click', () => {
          onSelectTailor(tailor);
        });

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
          <h4 style="font-size: 14px; font-weight: 700; color: #2E2926; margin: 0 0 4px 0;">${tailor.name}</h4>
          <p style="font-size: 12px; color: #766B65; margin: 0 0 6px 0;">${tailor.location}</p>
          <div style="font-size: 12px; font-weight: 600; color: #B5563E; margin-bottom: 8px;">
            ${tailor.distance} km away • ${tailor.priceRange}
          </div>
          <div style="font-size: 11px; color: #555; margin-bottom: 8px;">
            ${tailor.specializations.slice(0, 3).join(' • ')}
          </div>
        </div>
      `;

      const btn = document.createElement('button');
      btn.innerText = 'Select Tailor';
      btn.style.width = '100%';
      btn.style.padding = '6px 12px';
      btn.style.background = '#B5563E';
      btn.style.color = '#ffffff';
      btn.style.border = 'none';
      btn.style.borderRadius = '8px';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '12px';
      btn.onclick = () => onSelectTailor(tailor);
      popupContent.appendChild(btn);

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);

      if (isSelected) {
        map.setView([tailor.latitude, tailor.longitude], 13);
        marker.openPopup();
      }
    });

    return () => {
      // Cleanup on unmount
    };
  }, [tailors, selectedTailorId, userCoords]);

  return (
    <div className="w-full h-full min-h-[380px] relative rounded-2xl overflow-hidden border border-[#ECDAD4] shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#ECDAD4] text-xs font-semibold text-[#2E2926] shadow-sm z-[1000] flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#B5563E]"></span>
        OpenStreetMap • {tailors.length} Verified Tailors
      </div>
    </div>
  );
};

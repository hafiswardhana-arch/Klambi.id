'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatDistance } from '@/lib/geo';

export interface MapPartner {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  color: string;
}

export interface MapUserPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

interface PartnerMapProps {
  partners: MapPartner[];
  user: MapUserPosition | null;
  /** Fallback reference point when the user's location is unknown. */
  fallbackCenter: { lat: number; lng: number };
  /** Include the user in the visible area (false when they are far away from every partner). */
  includeUserInView: boolean;
  onSelectPartner: (id: string) => void;
}

// Standard OpenStreetMap tiles: free with attribution, no API key.
// For heavy production traffic, move to a provider with an SLA (MapTiler, Stadia, etc.).
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

function partnerIcon(p: MapPartner) {
  return L.divIcon({
    className: 'klambi-map-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 30],
    html: `
      <span class="flex flex-col items-center">
        <span class="w-7 h-7 rounded-full border-[2.5px] border-white shadow-md flex items-center justify-center" style="background:${p.color}">
          <span class="w-2 h-2 rounded-full bg-white"></span>
        </span>
        <span class="mt-0.5 px-1.5 rounded-full bg-white/95 shadow-sm text-[0.625rem] leading-4 font-semibold text-gray-800 whitespace-nowrap">${escapeHtml(
          formatDistance(p.distanceKm)
        )}</span>
      </span>`,
  });
}

const userIcon = L.divIcon({
  className: 'klambi-map-marker',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: `
    <span class="relative flex w-[22px] h-[22px] items-center justify-center">
      <span class="absolute inset-0 rounded-full bg-blue-500/40 animate-ping motion-reduce:animate-none"></span>
      <span class="relative w-4 h-4 rounded-full bg-blue-600 border-[2.5px] border-white shadow-md"></span>
    </span>`,
});

export default function PartnerMap({ partners, user, fallbackCenter, includeUserInView, onSelectPartner }: PartnerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelectPartner);
  onSelectRef.current = onSelectPartner;
  const fitRef = useRef<() => void>(() => undefined);

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [fallbackCenter.lat, fallbackCenter.lng],
      zoom: 13,
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    map.attributionControl.setPrefix(false);
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Leaflet measures its container on init; re-measure and re-fit whenever its size settles/changes.
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
      fitRef.current();
    });
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw markers and fit the view whenever partners or the user position change.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const points: L.LatLngExpression[] = [];

    partners.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: partnerIcon(p),
        title: `${p.name}, ${formatDistance(p.distanceKm)}`,
        alt: p.name,
        keyboard: true,
        riseOnHover: true,
      });
      marker.on('click', () => onSelectRef.current(p.id));
      marker.on('keypress', (e: L.LeafletKeyboardEvent) => {
        if (e.originalEvent.key === 'Enter' || e.originalEvent.key === ' ') onSelectRef.current(p.id);
      });
      marker.addTo(layer);
      points.push([p.lat, p.lng]);
    });

    if (user) {
      if (user.accuracy > 0 && user.accuracy < 1500) {
        L.circle([user.lat, user.lng], {
          radius: user.accuracy,
          color: '#2563EB',
          weight: 1,
          fillColor: '#3B82F6',
          fillOpacity: 0.12,
          interactive: false,
        }).addTo(layer);
      }
      L.marker([user.lat, user.lng], { icon: userIcon, title: 'Lokasimu', keyboard: false, zIndexOffset: 1000 }).addTo(layer);
      if (includeUserInView) points.push([user.lat, user.lng]);
    }

    fitRef.current = () => {
      if (points.length > 1) {
        // Extra top padding keeps pins clear of the "mitra aktif" pill and locate button.
        map.fitBounds(L.latLngBounds(points), {
          paddingTopLeft: [28, 52],
          paddingBottomRight: [28, 18],
          maxZoom: 15,
        });
      } else if (points.length === 1) {
        map.setView(points[0], 15);
      } else {
        map.setView([fallbackCenter.lat, fallbackCenter.lng], 13);
      }
    };
    map.invalidateSize();
    fitRef.current();
  }, [partners, user, includeUserInView, fallbackCenter.lat, fallbackCenter.lng]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      role="region"
      aria-label="Peta mitra jasa di sekitarmu. Pilih penanda untuk melihat detail mitra."
    />
  );
}

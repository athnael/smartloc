"use client";

import { useEffect, useRef } from "react";
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, Navigation } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { formatScore } from "@/lib/utils";
import type { RankingResult } from "@/lib/types";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export function LocationMap({ results, selectedId, onSelect }: {
  results: RankingResult[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  if (apiKey) return <GoogleLocationMap results={results} selectedId={selectedId} onSelect={onSelect} />;
  return <ManadoOpenStreetMap results={results} selectedId={selectedId} onSelect={onSelect} />;
}

function GoogleLocationMap({ results, selectedId, onSelect }: {
  results: RankingResult[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const { isLoaded } = useJsApiLoader({ id: "smartloc-google-map", googleMapsApiKey: apiKey });
  const selected = results.find((item) => item.alternative.id === selectedId);
  if (!isLoaded) return <div className="grid h-[480px] place-items-center rounded-2xl bg-mist text-sm text-ink/50">Memuat peta…</div>;

  return (
    <GoogleMap
      mapContainerClassName="relative z-0 h-[480px] w-full rounded-2xl"
      center={{ lat: 1.488, lng: 124.85 }}
      zoom={12}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
    >
      {results.map((item) => (
        <MarkerF
          key={item.alternative.id}
          position={{ lat: item.alternative.latitude, lng: item.alternative.longitude }}
          label={{ text: String(item.rank), color: "white", fontWeight: "700" }}
          onClick={() => onSelect(item.alternative.id)}
        />
      ))}
      {selected ? (
        <InfoWindowF
          position={{ lat: selected.alternative.latitude, lng: selected.alternative.longitude }}
          onCloseClick={() => onSelect("")}
        >
          <div className="max-w-[240px] overflow-hidden rounded-xl p-1 font-sans">
            <img src={selected.alternative.photoUrl} alt={selected.alternative.name} style={{ width: "220px", height: "110px", objectFit: "cover", borderRadius: "12px", marginBottom: "8px" }} />
            <strong>{selected.alternative.name}</strong>
            <p>{selected.alternative.address}</p>
            <p>Skor {formatScore(selected.score)}</p>
          </div>
        </InfoWindowF>
      ) : null}
    </GoogleMap>
  );
}

function ManadoOpenStreetMap({ results, selectedId, onSelect }: {
  results: RankingResult[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Record<string, import("leaflet").Marker>>({});

  useEffect(() => {
    let cancelled = false;
    async function createMap() {
      if (!mapElement.current || mapRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !mapElement.current) return;
      const map = L.map(mapElement.current, { zoomControl: true, attributionControl: true })
        .setView([1.486, 124.849], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19
      }).addTo(map);
      mapRef.current = map;
      const bounds: [number, number][] = [];
      results.forEach((item) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#FF6B00;color:white;border:4px solid white;font:800 12px Manrope;box-shadow:0 5px 15px rgba(74,35,0,.3)">${item.rank}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        const marker = L.marker([item.alternative.latitude, item.alternative.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="width:230px">
              <img src="${escapeHtml(item.alternative.photoUrl)}" alt="${escapeHtml(item.alternative.name)}" style="width:100%;height:110px;object-fit:cover;border-radius:12px;margin-bottom:8px" />
              <strong>${escapeHtml(item.alternative.name)}</strong><br/>
              <span>${escapeHtml(item.alternative.address)}</span><br/>
              <b>Skor ${formatScore(item.score)}</b>
            </div>
          `);
        marker.on("click", () => onSelect(item.alternative.id));
        markersRef.current[item.alternative.id] = marker;
        bounds.push([item.alternative.latitude, item.alternative.longitude]);
      });
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [45, 45] });
    }
    createMap();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, [results, onSelect]);

  useEffect(() => {
    const selected = results.find((item) => item.alternative.id === selectedId);
    const marker = selectedId ? markersRef.current[selectedId] : undefined;
    if (selected && marker && mapRef.current) {
      mapRef.current.flyTo([selected.alternative.latitude, selected.alternative.longitude], 14, { duration: .6 });
      marker.openPopup();
    }
  }, [selectedId, results]);

  return (
    <div className="relative z-0 h-[480px] overflow-hidden rounded-2xl border border-orange-200 bg-mist">
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-[10px] font-bold text-ocean shadow-sm backdrop-blur">
        <Navigation className="h-3.5 w-3.5 text-sea" /> Peta Kota Manado
      </div>
      <div className="absolute right-4 top-4 z-20">
        <Badge variant="land">OpenStreetMap</Badge>
      </div>
      <div ref={mapElement} className="relative z-0 h-full w-full" aria-label="Peta interaktif Kota Manado" />
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { BuildingSummary as Building } from "@/lib/catalog";

export default function BuildingMap({ buildings }: { buildings: Building[] }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    if (!container.current || map.current) return;
    map.current = new maplibregl.Map({
      container: container.current,
      style: process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://demotiles.maplibre.org/style.json",
      center: [-73.995, 40.72],
      zoom: 10.5,
      attributionControl: false
    });
    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    buildings.forEach((building) => {
      const marker = document.createElement("a");
      marker.className = "map-marker";
      marker.href = `/buildings/${building.slug}`;
      marker.setAttribute("aria-label", building.name);
      marker.innerHTML = `<span>${building.name}</span>`;
      new maplibregl.Marker({ element: marker }).setLngLat(building.coordinates).addTo(map.current!);
    });
    return () => { map.current?.remove(); map.current = null; };
  }, [buildings]);

  return <div ref={container} className="map-container" aria-label="Map of verified buildings" />;
}

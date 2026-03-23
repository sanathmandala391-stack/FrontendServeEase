import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Create icons safely outside component to avoid recreating on each render
const providerIcon = L.divIcon({
  className: "",
  html: `<div style="width:40px;height:40px;background:#22c55e;border-radius:50% 50% 50% 0;transform:rotate(-45deg) translate(-50%,-50%);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:18px;">🛵</div></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const customerIcon = L.divIcon({
  className: "",
  html: `<div style="width:40px;height:40px;background:#ef4444;border-radius:50% 50% 50% 0;transform:rotate(-45deg) translate(-50%,-50%);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:18px;">🏠</div></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

// ✅ Replace YOUR_OPENROUTESERVICE_API_KEY with your key from openrouteservice.org
const ORS_API_KEY = "YOUR_OPENROUTESERVICE_API_KEY";

export const LiveTrackingMap = ({ providerLocation, customerLocation, bookingId }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const providerMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const lastRouteKeyRef = useRef(null);

  // ✅ Init map once
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([providerLocation.lat, providerLocation.lng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);

    // Provider marker
    providerMarkerRef.current = L.marker(
      [providerLocation.lat, providerLocation.lng],
      { icon: providerIcon }
    ).addTo(map).bindPopup("<b>🛵 Provider</b><br>On the way!").openPopup();

    // Customer marker
    if (customerLocation) {
      customerMarkerRef.current = L.marker(
        [customerLocation.lat, customerLocation.lng],
        { icon: customerIcon }
      ).addTo(map).bindPopup("<b>🏠 Your Location</b>");
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ✅ Draw road route using OpenRouteService (with straight line fallback)
  const drawRoute = async (fromLat, fromLng, toLat, toLng) => {
    const routeKey = fromLat.toFixed(3) + "," + fromLng.toFixed(3);
    if (lastRouteKeyRef.current === routeKey) return;
    lastRouteKeyRef.current = routeKey;

    if (!mapInstanceRef.current) return;

    // Remove old route
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // Try ORS API first
    if (ORS_API_KEY !== "YOUR_OPENROUTESERVICE_API_KEY") {
      try {
        const res = await fetch(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: ORS_API_KEY
            },
            body: JSON.stringify({
              coordinates: [[fromLng, fromLat], [toLng, toLat]]
            })
          }
        );
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          routeLayerRef.current = L.geoJSON(data, {
            style: { color: "#22c55e", weight: 6, opacity: 1, lineJoin: "round", lineCap: "round" }
          }).addTo(mapInstanceRef.current);
          mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60], maxZoom: 15 });
          return;
        }
      } catch (err) {
        console.log("ORS route failed, using straight line");
      }
    }

    // ✅ Fallback: straight dashed line (no API key needed)
    routeLayerRef.current = L.polyline(
      [[fromLat, fromLng], [toLat, toLng]],
      { color: "#22c55e", weight: 5, opacity: 0.9, dashArray: "12, 8" }
    ).addTo(mapInstanceRef.current);
    mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60] });
  };

  // ✅ Update provider marker when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !providerLocation) return;

    const newLatLng = L.latLng(providerLocation.lat, providerLocation.lng);

    if (providerMarkerRef.current) {
      providerMarkerRef.current.setLatLng(newLatLng);
    }

    if (customerLocation) {
      drawRoute(providerLocation.lat, providerLocation.lng, customerLocation.lat, customerLocation.lng);
    } else {
      mapInstanceRef.current.setView(newLatLng, 15);
    }
  }, [providerLocation]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "300px",
          borderRadius: "0 0 12px 12px",
          border: "2px solid #22c55e",
          borderTop: "none",
          zIndex: 0
        }}
      />
      <div style={{
        position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
        background: "white", borderRadius: 20, padding: "6px 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)", display: "flex", gap: 16,
        fontSize: 12, fontWeight: "bold", zIndex: 1000, whiteSpace: "nowrap"
      }}>
        <span style={{ color: "#22c55e" }}>🛵 Provider</span>
        <span style={{ color: "#ef4444" }}>🏠 You</span>
      </div>
    </div>
  );
};

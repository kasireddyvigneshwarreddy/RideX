import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface InteractiveMapProps {
  pickupLocation?: { lat: number; lng: number; title?: string } | null;
  destLocation?: { lat: number; lng: number; title?: string } | null;
  routeCoordinates?: [number, number][];
  driverLocation?: { lat: number; lng: number; name?: string } | null;
  showNearbyDrivers?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  heightClass?: string;
}

// Nearby sample demo vehicles in Bangalore center
const SAMPLE_NEARBY_VEHICLES = [
  { id: 'v1', type: 'BIKE', lat: 12.9730, lng: 77.5970, angle: 45 },
  { id: 'v2', type: 'BIKE', lat: 12.9690, lng: 77.5920, angle: 120 },
  { id: 'v3', type: 'AUTO', lat: 12.9745, lng: 77.5900, angle: 90 },
  { id: 'v4', type: 'AUTO', lat: 12.9660, lng: 77.6010, angle: 210 },
  { id: 'v5', type: 'CAB_ECONOMY', lat: 12.9780, lng: 77.5990, angle: 300 },
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pickupLocation,
  destLocation,
  routeCoordinates = [],
  driverLocation,
  showNearbyDrivers = true,
  onLocationSelect,
  heightClass = 'h-[360px] sm:h-[460px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // SVG Custom Icons
  const createPickupIcon = () =>
    L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background-color: #10B981; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); border: 3px solid white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });

  const createDestIcon = () =>
    L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background-color: #EF4444; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4); border: 3px solid white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });

  const createDriverIcon = (type: string = 'BIKE') =>
    L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background-color: #151515; border: 2.5px solid #FFD500; color: #FFD500; width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.35);">
          ${
            type === 'BIKE'
              ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD500" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`
              : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD500" stroke-width="2"><rect x="3" y="11" width="18" height="9" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
          }
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: MG Road, Bengaluru
    const initialLat = pickupLocation?.lat || 12.9716;
    const initialLng = pickupLocation?.lng || 77.5946;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap Carto tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Map click handler
    if (onLocationSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markers = markersLayerRef.current;
    if (!map || !markers) return;

    markers.clearLayers();

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const boundsPoints: [number, number][] = [];

    // 1. Pickup Marker
    if (pickupLocation) {
      const pMarker = L.marker([pickupLocation.lat, pickupLocation.lng], {
        icon: createPickupIcon(),
      }).bindPopup(`<b>Pickup Location</b><br/>${pickupLocation.title || 'Pickup Spot'}`);
      markers.addLayer(pMarker);
      boundsPoints.push([pickupLocation.lat, pickupLocation.lng]);
    }

    // 2. Destination Marker
    if (destLocation) {
      const dMarker = L.marker([destLocation.lat, destLocation.lng], {
        icon: createDestIcon(),
      }).bindPopup(`<b>Drop Destination</b><br/>${destLocation.title || 'Destination'}`);
      markers.addLayer(dMarker);
      boundsPoints.push([destLocation.lat, destLocation.lng]);
    }

    // 3. Driver Marker
    if (driverLocation) {
      const drMarker = L.marker([driverLocation.lat, driverLocation.lng], {
        icon: createDriverIcon('BIKE'),
      }).bindPopup(`<b>Captain on way</b><br/>${driverLocation.name || 'Your RideX Captain'}`);
      markers.addLayer(drMarker);
      boundsPoints.push([driverLocation.lat, driverLocation.lng]);
    }

    // 4. Nearby Vehicles (Demo Mode)
    if (showNearbyDrivers && !driverLocation && !destLocation) {
      SAMPLE_NEARBY_VEHICLES.forEach((v) => {
        const vMarker = L.marker([v.lat, v.lng], {
          icon: createDriverIcon(v.type),
        }).bindPopup(`<b>Nearby ${v.type}</b><br/>Available in ~2-4 mins`);
        markers.addLayer(vMarker);
      });
    }

    // 5. Draw Polyline
    if (routeCoordinates && routeCoordinates.length > 0) {
      const polyline = L.polyline(routeCoordinates, {
        color: '#151515',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
      routeLayerRef.current = polyline;

      // Fit map to route bounds
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    } else if (boundsPoints.length > 1) {
      map.fitBounds(boundsPoints, { padding: [60, 60] });
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 14);
    }
  }, [pickupLocation, destLocation, routeCoordinates, driverLocation, showNearbyDrivers]);

  // Handle Current Location Request
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 1.5 });
        }
        if (onLocationSelect) {
          onLocationSelect(latitude, longitude);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission denied. You can select locations on the map or type your address.');
        } else {
          setGeoError('Could not determine your location. Please check your network or GPS.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-theme-border shadow-subtle`}>
      {/* Map DOM Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Control Buttons Overlay */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={locating}
          className="p-2.5 rounded-xl bg-theme-surface/95 border border-theme-border text-theme-text shadow-elevated hover:bg-theme-surface hover:text-theme-primary transition-all flex items-center justify-center"
          title="Use current GPS location"
        >
          {locating ? (
            <RefreshCw className="w-5 h-5 animate-spin text-theme-primary" />
          ) : (
            <Crosshair className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Demo Mode Badge */}
      <div className="absolute bottom-4 left-4 z-20 px-3 py-1 rounded-full bg-theme-surface/90 backdrop-blur-md border border-theme-border text-[11px] font-bold text-theme-text flex items-center gap-1.5 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-theme-primary animate-ping" />
        <span>OpenStreetMap + OSRM Live</span>
      </div>

      {/* Error alert banner */}
      {geoError && (
        <div className="absolute top-4 left-4 right-16 z-20 p-3 rounded-xl bg-red-500/90 text-white text-xs font-semibold backdrop-blur-md flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{geoError}</span>
          </div>
          <button onClick={() => setGeoError(null)} className="ml-2 font-bold hover:underline">
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][]; // [lat, lng]
  isDemoOrFallback: boolean;
  provider: string;
}

// Haversine formula calculation with Indian city tortuosity correction
function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineDistance = R * c;

  // Indian urban road network tortuosity factor (typically 1.32x - 1.40x straight-line distance)
  const urbanTortuosity = 1.35;
  return parseFloat((straightLineDistance * urbanTortuosity).toFixed(2));
}

export async function getRouteEstimate(
  pickupLat: number,
  pickupLng: number,
  destLat: number,
  destLng: number
): Promise<RouteResult> {
  const osrmBase = process.env.OSRM_ROUTING_URL || 'https://router.project-osrm.org';
  const url = `${osrmBase}/route/v1/driving/${pickupLng},${pickupLat};${destLng},${destLat}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RideX-India-Mobility/1.0' },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = (await response.json()) as {
        code: string;
        routes: Array<{
          distance: number; // in meters
          duration: number; // in seconds
          geometry: {
            coordinates: [number, number][]; // [lng, lat]
          };
        }>;
      };

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = parseFloat((route.distance / 1000).toFixed(2));
        const durationMinutes = Math.max(1, Math.round(route.duration / 60));
        
        // Convert [lng, lat] to [lat, lng] for Leaflet
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );

        return {
          distanceKm: distanceKm || 1.0,
          durationMinutes: durationMinutes || 5,
          coordinates,
          isDemoOrFallback: false,
          provider: 'OSRM Live Routing Engine',
        };
      }
    }
  } catch (error) {
    // Graceful fallback to haversine + route interpolation
  }

  // Fallback calculation
  const distanceKm = calculateHaversineDistanceKm(pickupLat, pickupLng, destLat, destLng);
  // Average city traffic speed ~ 22 km/h + 3 min buffer for signals/traffic
  const durationMinutes = Math.max(4, Math.round((distanceKm / 22) * 60) + 3);

  // Generate intermediate points for a smooth map polyline
  const intermediateSteps = 8;
  const coordinates: [number, number][] = [];
  for (let i = 0; i <= intermediateSteps; i++) {
    const ratio = i / intermediateSteps;
    const lat = pickupLat + (destLat - pickupLat) * ratio;
    const lng = pickupLng + (destLng - pickupLng) * ratio;
    coordinates.push([lat, lng]);
  }

  return {
    distanceKm: Math.max(0.5, distanceKm),
    durationMinutes,
    coordinates,
    isDemoOrFallback: true,
    provider: 'Urban Road Estimation Model (Demo Fallback)',
  };
}

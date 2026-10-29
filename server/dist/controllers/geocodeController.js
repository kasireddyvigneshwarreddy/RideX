"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchLocations = searchLocations;
exports.getPopularLocations = getPopularLocations;
exports.reverseGeocode = reverseGeocode;
const POPULAR_INDIAN_HUBS = [
    {
        id: 'blr-koramangala',
        title: 'Koramangala 5th Block',
        address: 'Koramangala 5th Block, Jyoti Nivas College Rd, Bengaluru, Karnataka 560095',
        lat: 12.9352,
        lng: 77.6245,
        type: 'Commercial Hub',
    },
    {
        id: 'blr-indiranagar',
        title: 'Indiranagar 100 Feet Road',
        address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
        lat: 12.9719,
        lng: 77.6412,
        type: 'Shopping & Dining',
    },
    {
        id: 'blr-mgroad',
        title: 'MG Road Metro Station',
        address: 'Mahatma Gandhi Rd, Ashok Nagar, Bengaluru, Karnataka 560001',
        lat: 12.9756,
        lng: 77.6066,
        type: 'Metro Station',
    },
    {
        id: 'blr-hsr',
        title: 'HSR Layout Sector 1',
        address: '27th Main Rd, Sector 1, HSR Layout, Bengaluru, Karnataka 560102',
        lat: 12.9121,
        lng: 77.6446,
        type: 'Residential & Tech',
    },
    {
        id: 'blr-bellandur',
        title: 'Embassy TechVillage Bellandur',
        address: 'Outer Ring Rd, Devarabisanahalli, Bellandur, Bengaluru, Karnataka 560103',
        lat: 12.9260,
        lng: 77.6897,
        type: 'Tech Park',
    },
    {
        id: 'blr-whitefield',
        title: 'ITPB Whitefield',
        address: 'International Tech Park, Whitefield Main Rd, Bengaluru, Karnataka 560066',
        lat: 12.9863,
        lng: 77.7380,
        type: 'Tech Park',
    },
    {
        id: 'blr-airport',
        title: 'Kempegowda International Airport (BLR)',
        address: 'KIAL Rd, Devanahalli, Bengaluru, Karnataka 560300',
        lat: 13.1986,
        lng: 77.7066,
        type: 'Airport',
    },
    {
        id: 'blr-majestic',
        title: 'Majestic KSR Bengaluru Railway Station',
        address: 'Kempegowda, Sevashrama, Bengaluru, Karnataka 560023',
        lat: 12.9781,
        lng: 77.5694,
        type: 'Transit Terminal',
    },
    {
        id: 'delhi-cybercity',
        title: 'DLF Cyber City Gurugram',
        address: 'Cyber City, DLF Phase 2, Sector 24, Gurugram, Haryana 122002',
        lat: 28.4950,
        lng: 77.0895,
        type: 'Business Hub',
    },
    {
        id: 'mumbai-bkc',
        title: 'Bandra Kurla Complex (BKC)',
        address: 'G Block BKC, Bandra East, Mumbai, Maharashtra 400051',
        lat: 19.0660,
        lng: 77.8683,
        type: 'Financial District',
    },
];
async function searchLocations(req, res) {
    const query = (req.query.q || '').trim().toLowerCase();
    if (!query) {
        res.json({
            success: true,
            locations: POPULAR_INDIAN_HUBS.slice(0, 5),
        });
        return;
    }
    // 1. Filter local hubs first for instant zero-latency responses
    const localMatches = POPULAR_INDIAN_HUBS.filter((h) => h.title.toLowerCase().includes(query) || h.address.toLowerCase().includes(query));
    // 2. Fetch live Nominatim geocoding if query has >= 3 chars
    let externalResults = [];
    if (query.length >= 3) {
        try {
            const nominatimBase = process.env.NOMINATIM_GEOCODE_URL || 'https://nominatim.openstreetmap.org';
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);
            const url = `${nominatimBase}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`;
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'RideX-India-Mobility/1.0',
                    'Accept-Language': 'en-IN,en',
                },
            });
            clearTimeout(timeout);
            if (response.ok) {
                const data = (await response.json());
                externalResults = data.map((item) => {
                    const parts = item.display_name.split(',');
                    const title = parts[0]?.trim() || query;
                    return {
                        id: `osm-${item.place_id}`,
                        title,
                        address: item.display_name,
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lon),
                        type: item.type || 'Location',
                    };
                });
            }
        }
        catch {
            // Ignore network errors and return local matches
        }
    }
    // Combine and deduplicate
    const combined = [...localMatches, ...externalResults];
    const seen = new Set();
    const unique = combined.filter((item) => {
        const key = `${item.lat.toFixed(4)},${item.lng.toFixed(4)}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
    res.json({
        success: true,
        locations: unique.slice(0, 8),
    });
}
function getPopularLocations(_req, res) {
    res.json({
        success: true,
        locations: POPULAR_INDIAN_HUBS,
    });
}
async function reverseGeocode(req, res) {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ success: false, message: 'Invalid latitude or longitude' });
        return;
    }
    // Find nearest local hub if within ~2km
    let nearest = POPULAR_INDIAN_HUBS[0];
    let minDistance = 999999;
    for (const hub of POPULAR_INDIAN_HUBS) {
        const d = Math.hypot(hub.lat - lat, hub.lng - lng);
        if (d < minDistance) {
            minDistance = d;
            nearest = hub;
        }
    }
    res.json({
        success: true,
        location: {
            title: minDistance < 0.05 ? nearest.title : 'Current Location',
            address: minDistance < 0.05 ? nearest.address : `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}, Bengaluru, Karnataka`,
            lat,
            lng,
        },
    });
}

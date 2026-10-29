import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Leaflet for testing environment (jsdom does not have full DOM canvas/SVG layout)
vi.mock('leaflet', () => {
  return {
    default: {
      map: vi.fn(() => ({
        setView: vi.fn(),
        remove: vi.fn(),
        on: vi.fn(),
        flyTo: vi.fn(),
        fitBounds: vi.fn(),
      })),
      tileLayer: vi.fn(() => ({
        addTo: vi.fn(),
      })),
      marker: vi.fn(() => ({
        bindPopup: vi.fn().mockReturnThis(),
        addTo: vi.fn(),
      })),
      polyline: vi.fn(() => ({
        addTo: vi.fn(),
        getBounds: vi.fn(() => ({})),
      })),
      layerGroup: vi.fn(() => ({
        addTo: vi.fn(),
        clearLayers: vi.fn(),
        addLayer: vi.fn(),
      })),
      divIcon: vi.fn(() => ({})),
      control: {
        zoom: vi.fn(() => ({
          addTo: vi.fn(),
        })),
      },
    },
  };
});

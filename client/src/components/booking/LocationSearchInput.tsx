import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Building, Home, Briefcase, Dumbbell, Clock } from 'lucide-react';
import { geocodeApi } from '../../services/api';
import { SavedAddress } from '../../types';

interface LocationResult {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  type?: string;
}

interface LocationSearchInputProps {
  label: string;
  placeholder: string;
  value: string;
  isPickup?: boolean;
  savedAddresses?: SavedAddress[];
  onSelect: (location: LocationResult) => void;
  onClear: () => void;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  label,
  placeholder,
  value,
  isPickup = true,
  savedAddresses = [],
  onSelect,
  onClear,
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal input value if prop updates externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!isOpen || query.trim().length === 0) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await geocodeApi.search(query.trim());
        if (res.success && res.locations) {
          setResults(res.locations);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleOpenDropdown = async () => {
    setIsOpen(true);
    if (results.length === 0) {
      try {
        const res = await geocodeApi.popular();
        if (res.success && res.locations) {
          setResults(res.locations);
        }
      } catch {
        // Ignore
      }
    }
  };

  const handleSelect = (item: LocationResult) => {
    setQuery(item.title);
    setIsOpen(false);
    onSelect(item);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    onClear();
  };

  const getSavedIcon = (labelType: string) => {
    switch (labelType) {
      case 'HOME':
        return <Home className="w-3.5 h-3.5 text-blue-500" />;
      case 'WORK':
        return <Briefcase className="w-3.5 h-3.5 text-amber-500" />;
      case 'GYM':
        return <Dumbbell className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Building className="w-3.5 h-3.5 text-theme-text-muted" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-theme-text-muted flex items-center gap-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isPickup ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-red-500 ring-2 ring-red-500/20'
            }`}
          />
          {label}
        </label>
      </div>

      {/* Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-theme-text-muted">
          {isPickup ? (
            <MapPin className="w-5 h-5 text-emerald-500" />
          ) : (
            <Search className="w-5 h-5 text-red-500" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleOpenDropdown}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 rounded-2xl border border-theme-border bg-theme-surface text-theme-text font-medium text-sm focus:outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-all placeholder:text-theme-text-muted/60"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Saved Addresses quick pills */}
      {savedAddresses.length > 0 && !isOpen && (
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
          {savedAddresses.map((sa) => (
            <button
              key={sa.id}
              type="button"
              onClick={() =>
                handleSelect({
                  id: sa.id,
                  title: sa.title,
                  address: sa.address,
                  lat: sa.lat,
                  lng: sa.lng,
                })
              }
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-theme-surface border border-theme-border text-[11px] font-semibold text-theme-text hover:border-theme-primary transition-colors"
            >
              {getSavedIcon(sa.label)}
              <span>{sa.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-theme-surface border border-theme-border shadow-elevated z-50 overflow-hidden max-h-72 overflow-y-auto">
          {loading && (
            <div className="p-3 text-center text-xs text-theme-text-muted animate-pulse">
              Searching locations...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-4 text-center text-xs text-theme-text-muted">
              No matching Indian locations found. Try searching for "Koramangala", "Indiranagar", or "MG Road".
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-theme-text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" /> Recommended Locations
              </div>

              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-theme-surface-hover flex items-start gap-3 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-theme-surface-hover border border-theme-border flex items-center justify-center shrink-0 text-theme-primary group-hover:bg-theme-primary group-hover:text-theme-secondary transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-theme-text truncate">{item.title}</p>
                    <p className="text-[11px] text-theme-text-muted truncate mt-0.5">
                      {item.address}
                    </p>
                  </div>
                  {item.type && (
                    <span className="text-[10px] font-medium text-theme-text-muted/80 bg-theme-surface-hover px-1.5 py-0.5 rounded shrink-0">
                      {item.type}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

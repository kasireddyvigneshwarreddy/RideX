import React from 'react';
import { Bike, Zap, Car, ShieldCheck, Users, Clock, Tag } from 'lucide-react';
import { FareEstimate, RideCategory } from '../../types';

interface RideTypeSelectorProps {
  fares: FareEstimate[];
  selectedCategory: RideCategory;
  onSelectCategory: (category: RideCategory) => void;
  loading?: boolean;
}

export const RideTypeSelector: React.FC<RideTypeSelectorProps> = ({
  fares,
  selectedCategory,
  onSelectCategory,
  loading = false,
}) => {
  const getCategoryIcon = (category: RideCategory) => {
    switch (category) {
      case 'BIKE':
        return <Bike className="w-6 h-6" />;
      case 'AUTO':
        return <Zap className="w-6 h-6" />;
      case 'CAB_ECONOMY':
        return <Car className="w-6 h-6" />;
      case 'CAB_PREMIUM':
        return <ShieldCheck className="w-6 h-6" />;
      default:
        return <Car className="w-6 h-6" />;
    }
  };

  const getCategoryETA = (category: RideCategory) => {
    switch (category) {
      case 'BIKE':
        return '2 mins away';
      case 'AUTO':
        return '3 mins away';
      case 'CAB_ECONOMY':
        return '5 mins away';
      case 'CAB_PREMIUM':
        return '4 mins away';
      default:
        return '3 mins away';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-theme-surface border border-theme-border animate-pulse p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-theme-border" />
              <div className="space-y-2">
                <div className="w-24 h-4 bg-theme-border rounded" />
                <div className="w-32 h-3 bg-theme-border rounded" />
              </div>
            </div>
            <div className="w-16 h-6 bg-theme-border rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
          Available Ride Types ({fares.length})
        </label>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          Standard Indian Rupee Fares
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {fares.map((item) => {
          const isSelected = selectedCategory === item.category;

          return (
            <button
              key={item.category}
              type="button"
              onClick={() => onSelectCategory(item.category)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between relative group ${
                isSelected
                  ? 'border-theme-primary bg-theme-surface shadow-subtle ring-2 ring-theme-primary/40'
                  : 'border-theme-border bg-theme-surface hover:bg-theme-surface-hover hover:border-theme-text-muted/40'
              }`}
            >
              {/* Left Side: Icon & Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-theme-secondary text-theme-primary'
                      : 'bg-theme-surface-hover text-theme-text-muted group-hover:text-theme-text'
                  }`}
                >
                  {getCategoryIcon(item.category)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-theme-text truncate">
                      {item.displayName}
                    </h3>
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-theme-text-muted bg-theme-surface-hover px-1.5 py-0.5 rounded">
                      <Users className="w-3 h-3" /> {item.capacity}
                    </span>
                  </div>

                  <p className="text-xs text-theme-text-muted mt-0.5 line-clamp-1">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {getCategoryETA(item.category)}
                    </span>
                    {item.savingsRupees > 0 && (
                      <span className="text-amber-600 font-bold flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.2 rounded">
                        <Tag className="w-2.5 h-2.5" /> Save ₹{item.savingsRupees}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Fare Display in Rupees */}
              <div className="text-right shrink-0 pl-3">
                <div className="text-base font-black text-theme-text">
                  ₹{item.totalFareRupees.toFixed(2)}
                </div>
                {item.savingsRupees > 0 && (
                  <div className="text-xs text-theme-text-muted line-through">
                    ₹{(item.totalFareRupees + item.savingsRupees).toFixed(2)}
                  </div>
                )}
                <div className="text-[10px] text-theme-text-muted/80 uppercase font-semibold">
                  Est. Fare
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

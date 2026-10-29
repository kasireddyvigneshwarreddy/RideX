import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Tag, Sparkles, ArrowRight, Check, Zap, Bike, Car } from 'lucide-react';
import { couponsApi } from '../services/api';
import { Coupon } from '../types';

export const OffersPage: React.FC = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    couponsApi
      .getCoupons()
      .then((res) => {
        if (res.success && res.coupons) {
          setCoupons(res.coupons);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
            Commute & Save
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-theme-text">
            RideX Offers & Commute Passes
          </h1>
          <p className="text-sm text-theme-text-muted">
            Enjoy exclusive discounts, daily commute passes, and referral rewards in your city.
          </p>
        </div>

        {/* Active Coupons Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black font-display text-theme-text">
              Active City Coupons
            </h2>
            <span className="text-xs text-theme-text-muted">Tap to copy code</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle flex flex-col justify-between space-y-5 relative group hover:border-theme-primary/50 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-theme-primary-light text-theme-secondary">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% OFF`
                        : `Flat ₹${c.discountValue / 100} OFF`}
                    </span>
                    <Gift className="w-5 h-5 text-theme-primary" />
                  </div>
                  <h3 className="text-base font-bold text-theme-text">{c.description}</h3>
                  <p className="text-xs text-theme-text-muted">
                    Min ride fare: ₹{c.minOrderRupees} • Valid until {new Date(c.validUntil).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 border-t border-theme-border flex items-center justify-between">
                  <span className="font-mono text-xs font-black tracking-wider px-3 py-1.5 rounded-xl bg-theme-surface-hover border border-dashed border-theme-border text-theme-text">
                    {c.code}
                  </span>
                  <button
                    onClick={() => handleCopy(c.code)}
                    className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
                  >
                    {copiedCode === c.code ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <span>Copy Code</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Commute Pass Section */}
        <div className="p-8 rounded-3xl bg-theme-surface border border-theme-border shadow-elevated space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
              Frequent Flyer Plans
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-theme-text mt-1">
              RideX Daily Commute Passes
            </h2>
            <p className="text-xs text-theme-text-muted">
              Prepaid passes designed for office commuters traveling the same route daily.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: '5-Day Bike Taxi Pass',
                trips: '10 Rides Included',
                price: '₹349',
                savings: 'Save ₹150 vs standard fare',
                icon: <Bike className="w-6 h-6 text-theme-primary" />,
              },
              {
                title: 'Monthly Auto Pass',
                trips: '40 Rides Included',
                price: '₹1,499',
                savings: 'Guaranteed zero surge pricing',
                icon: <Zap className="w-6 h-6 text-amber-500" />,
              },
              {
                title: 'Prime Cab Executive',
                trips: '20 Rides Included',
                price: '₹2,999',
                savings: 'Top rated sedan captains & AC',
                icon: <Car className="w-6 h-6 text-blue-500" />,
              },
            ].map((pass, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-theme-border bg-theme-bg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-theme-surface border border-theme-border flex items-center justify-center">
                    {pass.icon}
                  </div>
                  <h3 className="text-sm font-bold text-theme-text">{pass.title}</h3>
                  <div className="text-xs text-theme-text-muted">{pass.trips}</div>
                  <div className="text-xl font-black text-theme-text">{pass.price}</div>
                  <p className="text-[11px] text-emerald-600 font-semibold">{pass.savings}</p>
                </div>

                <button
                  onClick={() => navigate('/book')}
                  className="w-full py-2.5 rounded-xl bg-theme-secondary text-white font-bold text-xs hover:bg-black transition-colors"
                >
                  Activate Pass
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

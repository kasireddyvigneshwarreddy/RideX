import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Bike,
  Zap,
  ShieldCheck,
  Star,
  Receipt,
  RotateCcw,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ridesApi } from '../services/api';
import { Ride } from '../types';
import { useAuth } from '../context/AuthContext';

export const RideHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const res = await ridesApi.getRides({
        status: filter === 'ALL' ? undefined : filter,
      });
      if (res.success && res.rides) {
        setRides(res.rides);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRides();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, filter]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BIKE':
        return <Bike className="w-5 h-5 text-theme-primary" />;
      case 'AUTO':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'CAB_ECONOMY':
        return <Car className="w-5 h-5 text-blue-500" />;
      case 'CAB_PREMIUM':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black font-display text-theme-text">Your Ride History</h1>
            <p className="text-xs text-theme-text-muted">
              View past bookings, receipts, and captain ratings.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-theme-surface border border-theme-border text-xs font-bold">
            {['ALL', 'COMPLETED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  filter === tab
                    ? 'bg-theme-secondary text-theme-primary shadow-xs'
                    : 'text-theme-text-muted hover:text-theme-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-sm text-theme-text-muted animate-pulse">
            Loading your ride history...
          </div>
        ) : rides.length === 0 ? (
          <div className="p-16 rounded-3xl bg-theme-surface border border-theme-border text-center space-y-3">
            <Car className="w-12 h-12 text-theme-text-muted mx-auto stroke-1" />
            <h3 className="text-base font-bold text-theme-text">No rides found in history</h3>
            <p className="text-xs text-theme-text-muted max-w-sm mx-auto">
              You haven't completed any rides with this filter. Book your first bike taxi or cab!
            </p>
            <button
              onClick={() => navigate('/book')}
              className="px-6 py-2.5 rounded-xl bg-theme-primary text-theme-secondary font-bold text-xs hover:bg-theme-primary-hover shadow-sm"
            >
              Book a Ride Now
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {rides.map((ride) => (
              <div
                key={ride.id}
                className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-theme-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-theme-surface-hover border border-theme-border flex items-center justify-center shrink-0">
                    {getCategoryIcon(ride.category)}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-theme-text">
                        {ride.bookingCode}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          ride.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ride.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ride.status}
                      </span>
                      <span className="text-[11px] text-theme-text-muted">
                        {new Date(ride.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs text-theme-text font-medium space-y-1">
                      <p className="truncate">
                        <span className="font-bold text-emerald-600 mr-1.5">Pickup:</span>
                        {ride.pickupAddress}
                      </p>
                      <p className="truncate">
                        <span className="font-bold text-red-500 mr-1.5">Drop:</span>
                        {ride.destAddress}
                      </p>
                    </div>

                    {ride.driver && (
                      <p className="text-[11px] text-theme-text-muted">
                        Captain: {ride.driver.user?.name} • {ride.driver.vehicle?.model} ({ride.driver.vehicle?.plateNumber})
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-theme-border shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-black text-theme-text">
                      ₹{(ride.totalFarePaise / 100).toFixed(2)}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-theme-text-muted">
                      {ride.paymentMethod}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/ride/${ride.id}`)}
                    className="mt-2 text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
                  >
                    <span>View Trip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

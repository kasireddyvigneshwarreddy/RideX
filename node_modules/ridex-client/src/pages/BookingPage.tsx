import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Navigation,
  Clock,
  ShieldCheck,
  Tag,
  CreditCard,
  Banknote,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { LocationSearchInput } from '../components/booking/LocationSearchInput';
import { RideTypeSelector } from '../components/booking/RideTypeSelector';
import { RideCategory, FareEstimate, PaymentMethod } from '../types';
import { ridesApi, couponsApi, addressesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Form locations from query params or defaults
  const [pickup, setPickup] = useState<{ lat: number; lng: number; title: string } | null>(() => {
    const lat = searchParams.get('pickupLat');
    const lng = searchParams.get('pickupLng');
    const title = searchParams.get('pickupTitle');
    if (lat && lng) {
      return { lat: parseFloat(lat), lng: parseFloat(lng), title: title || 'Selected Pickup' };
    }
    return { lat: 12.9716, lng: 77.5946, title: 'MG Road Metro Station, Bengaluru' };
  });

  const [destination, setDestination] = useState<{ lat: number; lng: number; title: string } | null>(() => {
    const lat = searchParams.get('destLat');
    const lng = searchParams.get('destLng');
    const title = searchParams.get('destTitle');
    if (lat && lng) {
      return { lat: parseFloat(lat), lng: parseFloat(lng), title: title || 'Selected Destination' };
    }
    return { lat: 12.9352, lng: 77.6245, title: 'Koramangala 5th Block, Bengaluru' };
  });

  const [category, setCategory] = useState<RideCategory>(
    (searchParams.get('category') as RideCategory) || 'BIKE'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountRupees: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [fares, setFares] = useState<FareEstimate[]>([]);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [loadingFares, setLoadingFares] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  // Fetch saved addresses
  useEffect(() => {
    if (isAuthenticated) {
      addressesApi
        .getAll()
        .then((res) => {
          if (res.success && res.addresses) setSavedAddresses(res.addresses);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Recalculate Fares whenever coordinates or coupon change
  useEffect(() => {
    if (pickup && destination) {
      setLoadingFares(true);
      setErrorBanner(null);

      ridesApi
        .estimateFare({
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          destLat: destination.lat,
          destLng: destination.lng,
          couponCode: appliedCoupon?.code,
        })
        .then((res) => {
          if (res.success) {
            setFares(res.fares || []);
            setRouteInfo(res.route || null);
          }
        })
        .catch((err) => {
          setErrorBanner(err.message || 'Failed to estimate fare');
        })
        .finally(() => setLoadingFares(false));
    }
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng, appliedCoupon?.code]);

  // Apply Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponError(null);
    const selectedFare = fares.find((f) => f.category === category);
    const fareAmountPaise = selectedFare?.totalFarePaise || 5000;

    try {
      const res = await couponsApi.validate(couponCode.trim(), fareAmountPaise);
      if (res.success && res.coupon) {
        setAppliedCoupon({
          code: res.coupon.code,
          discountRupees: res.coupon.discountRupees,
        });
        setCouponCode('');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Submit Ride Booking
  const handleConfirmRide = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/book');
      return;
    }

    if (!pickup || !destination) {
      setErrorBanner('Please select both pickup and destination locations.');
      return;
    }

    setBookingLoading(true);
    setErrorBanner(null);

    try {
      const res = await ridesApi.createRide({
        pickupAddress: pickup.title,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        destAddress: destination.title,
        destLat: destination.lat,
        destLng: destination.lng,
        category,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      });

      if (res.success && res.ride) {
        navigate(`/ride/${res.ride.id}`);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to confirm ride booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const currentFare = fares.find((f) => f.category === category);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back and Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-surface-hover text-theme-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black font-display text-theme-text">Book Your Ride</h1>
            <p className="text-xs text-theme-text-muted">
              Select origin, destination, vehicle, and confirm your booking.
            </p>
          </div>
        </div>

        {errorBanner && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Booking Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 1 & 2: Address Inputs */}
            <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
              <LocationSearchInput
                label="Pickup Spot"
                placeholder="Where should captain pick you up?"
                value={pickup?.title || ''}
                isPickup={true}
                savedAddresses={savedAddresses}
                onSelect={(loc) => setPickup({ lat: loc.lat, lng: loc.lng, title: loc.title })}
                onClear={() => setPickup(null)}
              />

              <LocationSearchInput
                label="Destination"
                placeholder="Where are you heading?"
                value={destination?.title || ''}
                isPickup={false}
                savedAddresses={savedAddresses}
                onSelect={(loc) => setDestination({ lat: loc.lat, lng: loc.lng, title: loc.title })}
                onClear={() => setDestination(null)}
              />

              {routeInfo && (
                <div className="p-3 rounded-2xl bg-theme-surface-hover/70 border border-theme-border flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-theme-text">
                    <Navigation className="w-4 h-4 text-theme-primary" /> {routeInfo.distanceKm} km
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <Clock className="w-4 h-4" /> ~{routeInfo.durationMinutes} mins commute
                  </span>
                </div>
              )}
            </div>

            {/* Step 3, 4, 5: Vehicle Category Selector */}
            <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle">
              <RideTypeSelector
                fares={fares}
                selectedCategory={category}
                onSelectCategory={(cat) => setCategory(cat)}
                loading={loadingFares}
              />
            </div>

            {/* Step 6: Payment Method & Coupons */}
            <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
                Payment Option
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-theme-primary bg-theme-primary-light text-theme-secondary font-bold ring-2 ring-theme-primary/30'
                      : 'border-theme-border bg-theme-surface hover:bg-theme-surface-hover text-theme-text-muted'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-theme-text">Cash on Arrival</div>
                    <div className="text-[10px] text-theme-text-muted">Pay driver directly</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY_DEMO')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === 'RAZORPAY_DEMO'
                      ? 'border-theme-primary bg-theme-primary-light text-theme-secondary font-bold ring-2 ring-theme-primary/30'
                      : 'border-theme-border bg-theme-surface hover:bg-theme-surface-hover text-theme-text-muted'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-xs font-bold text-theme-text">Razorpay Demo</div>
                    <div className="text-[10px] text-theme-text-muted">Simulated Cards / UPI</div>
                  </div>
                </button>
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-theme-border">
                {appliedCoupon ? (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-800">
                        Coupon {appliedCoupon.code} applied (Saved ₹{appliedCoupon.discountRupees})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-red-500 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter Promo Code (e.g. RIDEX50)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-theme-text text-xs uppercase font-bold focus:outline-none focus:border-theme-primary"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-theme-secondary text-white font-bold text-xs hover:bg-black transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{couponError}</p>
                )}
              </div>
            </div>

            {/* Step 7 & 8: Review & Confirm Booking */}
            <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-elevated space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-theme-text-muted">
                  <span>Base & Distance Fare</span>
                  <span>₹{currentFare ? (currentFare.baseFareRupees + (currentFare.distanceFarePaise / 100)).toFixed(2) : '45.00'}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{appliedCoupon.discountRupees.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-theme-text-muted">
                  <span>GST & Municipal Surcharge</span>
                  <span>Included</span>
                </div>
                <div className="pt-2 border-t border-theme-border flex justify-between items-baseline">
                  <span className="text-sm font-bold text-theme-text">Total Upfront Fare</span>
                  <span className="text-2xl font-black text-theme-text">
                    ₹{currentFare ? currentFare.totalFareRupees.toFixed(2) : '45.00'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmRide}
                disabled={bookingLoading || loadingFares}
                className="w-full py-4 rounded-2xl bg-theme-primary text-theme-secondary font-black text-base hover:bg-theme-primary-hover shadow-subtle flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {bookingLoading ? (
                  <span>Requesting Nearby Captains...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm & Book {currentFare?.displayName || 'Ride'}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-theme-text-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero cancellation fee within first 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Route Map */}
          <div className="lg:col-span-7 sticky top-24">
            <InteractiveMap
              pickupLocation={pickup}
              destLocation={destination}
              routeCoordinates={routeInfo?.coordinates || []}
              showNearbyDrivers={true}
              heightClass="h-[480px] sm:h-[620px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

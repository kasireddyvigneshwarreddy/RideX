import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bike,
  Zap,
  Car,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  Shield,
  CheckCircle2,
  Gift,
  Star,
  ChevronDown,
  Navigation,
  Compass,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { LocationSearchInput } from '../components/booking/LocationSearchInput';
import { RideCategory, FareEstimate } from '../types';
import { ridesApi, couponsApi } from '../services/api';

const POPULAR_ROUTES = [
  {
    from: 'Indiranagar 100 Feet Rd',
    to: 'Koramangala 5th Block',
    fromLat: 12.9719,
    fromLng: 77.6412,
    toLat: 12.9352,
    toLng: 77.6245,
    distanceKm: 5.8,
    bikeFareRupees: 65,
    timeMins: 18,
  },
  {
    from: 'Embassy TechVillage Bellandur',
    to: 'HSR Layout Sector 1',
    fromLat: 12.9260,
    fromLng: 77.6897,
    toLat: 12.9121,
    toLng: 77.6446,
    distanceKm: 6.2,
    bikeFareRupees: 68,
    timeMins: 20,
  },
  {
    from: 'MG Road Metro Station',
    to: 'Majestic Railway Station',
    fromLat: 12.9756,
    fromLng: 77.6066,
    toLat: 12.9781,
    toLng: 77.5694,
    distanceKm: 4.5,
    bikeFareRupees: 55,
    timeMins: 15,
  },
  {
    from: 'ITPB Whitefield',
    to: 'Phoenix Marketcity Mahadevapura',
    fromLat: 12.9863,
    fromLng: 77.7380,
    toLat: 12.9972,
    toLng: 77.6974,
    distanceKm: 5.1,
    bikeFareRupees: 60,
    timeMins: 16,
  },
];

const FAQS = [
  {
    q: 'How does RideX Bike Taxi work in India?',
    a: 'RideX pairs you with a nearby verified Captain riding a two-wheeler. Once booked, you share a 4-digit OTP with your captain, wear a provided sanitized helmet, and zip past Bangalore traffic quickly and affordably.',
  },
  {
    q: 'Are the fares fixed or metered?',
    a: 'Every RideX fare is fixed and transparent upfront before you confirm. There is zero meter haggling or surprise extra charges. What you see is what you pay in Indian Rupees (₹).',
  },
  {
    q: 'What safety features does RideX offer for women and solo riders?',
    a: 'All RideX captains undergo comprehensive background and document verification. Every ride includes live GPS tracking, 24x7 SOS emergency button, trip-sharing with family, and active emergency escalation desks.',
  },
  {
    q: 'Can I pay via UPI or Cash on delivery?',
    a: 'Yes! You can pay cash directly to the captain at the end of the ride, or pay online seamlessly via Razorpay sandbox card/UPI simulator in demo mode.',
  },
  {
    q: 'How can I become a RideX Captain?',
    a: 'Anyone with a valid driving license, commercial vehicle / two-wheeler registration, and Aadhaar card can sign up through our Captain Portal. We offer daily payouts and industry-leading platform commissions.',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Booking widget state
  const [pickup, setPickup] = useState<{ lat: number; lng: number; title: string } | null>({
    lat: 12.9716,
    lng: 77.5946,
    title: 'MG Road Metro Station, Bengaluru',
  });
  const [destination, setDestination] = useState<{ lat: number; lng: number; title: string } | null>({
    lat: 12.9352,
    lng: 77.6245,
    title: 'Koramangala 5th Block, Bengaluru',
  });
  const [category, setCategory] = useState<RideCategory>('BIKE');
  const [fares, setFares] = useState<FareEstimate[]>([]);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [loadingFares, setLoadingFares] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Fetch initial fare estimate
  useEffect(() => {
    if (pickup && destination) {
      setLoadingFares(true);
      ridesApi
        .estimateFare({
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          destLat: destination.lat,
          destLng: destination.lng,
        })
        .then((res) => {
          if (res.success) {
            setFares(res.fares || []);
            setRouteInfo(res.route || null);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingFares(false));
    }
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng]);

  const handlePopularRouteSelect = (route: typeof POPULAR_ROUTES[0]) => {
    setPickup({ lat: route.fromLat, lng: route.fromLng, title: route.from });
    setDestination({ lat: route.toLat, lng: route.toLng, title: route.to });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookNow = () => {
    const params = new URLSearchParams();
    if (pickup) {
      params.append('pickupLat', String(pickup.lat));
      params.append('pickupLng', String(pickup.lng));
      params.append('pickupTitle', pickup.title);
    }
    if (destination) {
      params.append('destLat', String(destination.lat));
      params.append('destLng', String(destination.lng));
      params.append('destTitle', destination.title);
    }
    params.append('category', category);
    navigate(`/book?${params.toString()}`);
  };

  const selectedFare = fares.find((f) => f.category === category);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 pb-16 sm:pb-24 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-theme-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Value Proposition & Booking Panel */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-theme-surface border border-theme-border text-xs font-bold text-theme-text shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Over 50,000+ Active Captains in Bengaluru</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-theme-text leading-[1.08]">
                  Your City. <br />
                  <span className="text-theme-primary underline decoration-theme-primary/30">Your Ride.</span> Your Way.
                </h1>
                <p className="text-base sm:text-lg text-theme-text-muted leading-relaxed max-w-xl">
                  Beat peak-hour gridlock on a bike taxi or travel comfortably in an auto and cab. Guaranteed upfront rupee fares, zero cancellations, and instant doorstep pickup.
                </p>
              </div>

              {/* Interactive Booking Card inside Hero */}
              <div className="p-5 sm:p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-elevated space-y-4">
                <div className="space-y-3">
                  <LocationSearchInput
                    label="Pickup Location"
                    placeholder="Where are you right now?"
                    value={pickup?.title || ''}
                    isPickup={true}
                    onSelect={(loc) => setPickup({ lat: loc.lat, lng: loc.lng, title: loc.title })}
                    onClear={() => setPickup(null)}
                  />

                  <LocationSearchInput
                    label="Drop Destination"
                    placeholder="Enter your destination in Bengaluru"
                    value={destination?.title || ''}
                    isPickup={false}
                    onSelect={(loc) =>
                      setDestination({ lat: loc.lat, lng: loc.lng, title: loc.title })
                    }
                    onClear={() => setDestination(null)}
                  />
                </div>

                {/* Ride category selector pill row */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
                      Ride Category
                    </span>
                    {routeInfo && (
                      <span className="text-xs font-semibold text-theme-text flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-theme-primary" /> {routeInfo.distanceKm} km • ~{routeInfo.durationMinutes} mins
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { cat: 'BIKE' as RideCategory, name: 'Bike Taxi', icon: <Bike className="w-4 h-4" /> },
                      { cat: 'AUTO' as RideCategory, name: 'Auto', icon: <Zap className="w-4 h-4" /> },
                      { cat: 'CAB_ECONOMY' as RideCategory, name: 'Cab Mini', icon: <Car className="w-4 h-4" /> },
                      { cat: 'CAB_PREMIUM' as RideCategory, name: 'Prime', icon: <ShieldCheck className="w-4 h-4" /> },
                    ].map((item) => {
                      const fareItem = fares.find((f) => f.category === item.cat);
                      const isSelected = category === item.cat;
                      return (
                        <button
                          key={item.cat}
                          type="button"
                          onClick={() => setCategory(item.cat)}
                          className={`p-2 sm:p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'border-theme-primary bg-theme-primary-light text-theme-secondary font-bold shadow-xs ring-2 ring-theme-primary/30'
                              : 'border-theme-border bg-theme-surface hover:bg-theme-surface-hover text-theme-text-muted'
                          }`}
                        >
                          <div className={isSelected ? 'text-theme-secondary' : 'text-theme-primary'}>
                            {item.icon}
                          </div>
                          <span className="text-[11px] truncate w-full">{item.name}</span>
                          <span className="text-xs font-black">
                            {fareItem ? `₹${fareItem.totalFareRupees.toFixed(0)}` : '...'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fare Summary & CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-theme-border">
                  <div>
                    <span className="text-xs text-theme-text-muted">Estimated Upfront Fare</span>
                    <div className="text-2xl font-black text-theme-text flex items-baseline gap-1">
                      ₹{selectedFare ? selectedFare.totalFareRupees.toFixed(2) : '45.00'}
                      <span className="text-[11px] font-normal text-theme-text-muted">incl. taxes</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleBookNow}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-theme-primary text-theme-secondary font-bold text-sm hover:bg-theme-primary-hover shadow-subtle flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                  >
                    <span>Proceed to Book</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Map Preview */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative">
                <InteractiveMap
                  pickupLocation={pickup}
                  destLocation={destination}
                  routeCoordinates={routeInfo?.coordinates || []}
                  showNearbyDrivers={true}
                  heightClass="h-[420px] sm:h-[480px]"
                />

                {/* Map Floating Card */}
                <div className="absolute top-4 left-4 z-20 p-3 rounded-2xl bg-theme-surface/95 backdrop-blur-md border border-theme-border shadow-elevated max-w-xs hidden sm:block">
                  <div className="flex items-center gap-2 text-xs font-bold text-theme-text">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Real-time Fleet Telemetry</span>
                  </div>
                  <p className="text-[11px] text-theme-text-muted mt-1">
                    Live road traffic and captain locations updated every 5 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR COMMUTE ROUTES */}
      <section className="py-12 bg-theme-surface border-y border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
                Instant City Commutes
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-theme-text mt-1">
                Popular Bengaluru Routes
              </h2>
            </div>
            <p className="text-xs text-theme-text-muted max-w-md">
              Tap any popular route to instantly load origin, destination, and calculated rupee fares.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POPULAR_ROUTES.map((route, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePopularRouteSelect(route)}
                className="p-4 rounded-2xl border border-theme-border bg-theme-bg hover:border-theme-primary hover:shadow-subtle transition-all text-left flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-theme-text truncate">{route.from}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-bold text-theme-text truncate">{route.to}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-theme-border flex items-center justify-between">
                  <div className="text-xs text-theme-text-muted">
                    {route.distanceKm} km • ~{route.timeMins} min
                  </div>
                  <div className="text-sm font-black text-theme-text group-hover:text-theme-primary transition-colors">
                    ₹{route.bikeFareRupees}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
              Simple 4-Step Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-theme-text">
              How RideX Gets You Moving
            </h2>
            <p className="text-sm text-theme-text-muted">
              Designed for daily commuters in bustling Indian metro hubs. Quick, reliable, and straightforward.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Set Pickup & Drop',
                desc: 'Type your destination or tap popular landmarks. Our routing engine predicts arrival times and road conditions.',
                icon: <MapPin className="w-6 h-6 text-emerald-500" />,
              },
              {
                step: '02',
                title: 'Choose Vehicle Type',
                desc: 'Pick Bike Taxi for solo speed, Auto for guaranteed no-meter haggling, or AC Mini & Prime Sedan for quiet comfort.',
                icon: <Bike className="w-6 h-6 text-theme-primary" />,
              },
              {
                step: '03',
                title: 'Meet Captain with OTP',
                desc: 'Verify the vehicle plate number and share your secure 4-digit OTP. Wear your sanitized helmet provided by captain.',
                icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
              },
              {
                step: '04',
                title: 'Arrive & Pay Your Way',
                desc: 'Pay cash on arrival or complete transaction digitally through Razorpay UPI / Cards with instant receipt generation.',
                icon: <CheckCircle2 className="w-6 h-6 text-purple-500" />,
              },
            ].map((stepItem) => (
              <div
                key={stepItem.step}
                className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle relative group hover:-translate-y-1 transition-transform"
              >
                <div className="text-3xl font-black text-theme-text-muted/30 font-display mb-4">
                  {stepItem.step}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-theme-surface-hover border border-theme-border flex items-center justify-center mb-4">
                  {stepItem.icon}
                </div>
                <h3 className="text-base font-bold text-theme-text mb-2">{stepItem.title}</h3>
                <p className="text-xs text-theme-text-muted leading-relaxed">{stepItem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SAFETY & CAPTAIN VERIFICATION */}
      <section className="py-16 sm:py-24 bg-theme-surface border-y border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Safety First Protocol
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-display text-theme-text leading-tight">
                Every Single Captain is Background Verified.
              </h2>
              <p className="text-sm text-theme-text-muted leading-relaxed">
                Your safety is our non-negotiable priority. From document validation to live emergency assistance, we keep every kilometer protected.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  {
                    title: 'Aadhaar & DL Verification',
                    desc: 'Every captain profile requires approved driving license, RC book, and identity proof.',
                  },
                  {
                    title: 'Sanitized Helmets',
                    desc: 'Clean, ISI-marked safety helmets provided on all two-wheeler taxi rides.',
                  },
                  {
                    title: '24x7 SOS Desk',
                    desc: 'Instant in-app emergency alert notifying trusted contacts and local police hotline.',
                  },
                  {
                    title: 'Live Trip Sharing',
                    desc: 'Share live GPS tracking link with friends and family with a single click.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-theme-border bg-theme-bg space-y-1.5">
                    <h4 className="text-xs font-bold text-theme-text flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-theme-text-muted leading-normal">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-theme-secondary text-white shadow-elevated space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-theme-primary text-theme-secondary flex items-center justify-center font-black text-xl">
                      X
                    </div>
                    <div>
                      <h3 className="font-bold text-base">RideX Safety Guarantee</h3>
                      <p className="text-xs text-gray-400">Standard operating procedure</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                    Active 24x7
                  </span>
                </div>

                <div className="space-y-3 border-y border-white/10 py-5 text-xs text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Emergency Police Hotline:</span>
                    <span className="font-bold text-white">Dial 112 / 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>RideX Incident Support:</span>
                    <span className="font-bold text-theme-primary">1800-RIDEX-247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Third Party Ride Insurance:</span>
                    <span className="font-bold text-emerald-400">Covered up to ₹5,00,000</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/safety')}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-theme-primary" />
                  <span>Visit RideX Safety Center</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROMO OFFERS & REFERRALS */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
                Exclusive Commute Savings
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-theme-text mt-1">
                Active Promo Codes & Passes
              </h2>
            </div>
            <button
              onClick={() => navigate('/offers')}
              className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
            >
              View all offers <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                code: 'RIDEX50',
                title: '50% OFF First 3 Rides',
                desc: 'Maximum discount ₹50 on any Bike Taxi or Auto ride in Bangalore.',
                badge: 'Popular',
              },
              {
                code: 'FIRSTFREE',
                title: 'Flat ₹60 Welcome Credit',
                desc: 'Use on your first city ride across cabs or auto with zero minimum booking.',
                badge: 'New User',
              },
              {
                code: 'RAPIDPASS',
                title: '20% OFF Office Hours',
                desc: 'Valid Monday to Friday between 8 AM - 11 AM & 5 PM - 8 PM on Cabs.',
                badge: 'Commuter',
              },
            ].map((coupon, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle flex flex-col justify-between relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-theme-primary-light text-theme-secondary">
                      {coupon.badge}
                    </span>
                    <Gift className="w-4 h-4 text-theme-primary" />
                  </div>
                  <h3 className="text-base font-bold text-theme-text">{coupon.title}</h3>
                  <p className="text-xs text-theme-text-muted">{coupon.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-theme-border flex items-center justify-between">
                  <span className="font-mono text-xs font-black tracking-wider px-3 py-1 rounded-lg bg-theme-surface-hover border border-dashed border-theme-border text-theme-text">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(coupon.code);
                      alert(`Coupon ${coupon.code} copied!`);
                    }}
                    className="text-xs font-bold text-theme-primary hover:underline"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-16 sm:py-24 bg-theme-surface border-y border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
              Trusted by Urban Commuters
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-theme-text">
              Real Stories from the City
            </h2>
            <p className="text-xs text-theme-text-muted">
              Sample verified rider reviews from Bengaluru and Hyderabad metro areas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Pooja Iyer',
                role: 'Product Designer, Bellandur',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120',
                review:
                  'Outer Ring Road traffic used to take 50 minutes every evening. With RideX Bike Taxi, I reach HSR Layout in under 20 minutes! Upfront fare was exact.',
                rating: 5,
              },
              {
                name: 'Karthik Rao',
                role: 'Software Engineer, Indiranagar',
                avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120',
                review:
                  'No meter haggling with autos anymore. The captain arrived within 3 minutes and was polite. The app interface is super snappy.',
                rating: 5,
              },
              {
                name: 'Ananya Deshmukh',
                role: 'Management Consultant, MG Road',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
                review:
                  'Safety features like emergency contact sharing and sanitized helmets make it my go-to choice for late evening city travel.',
                rating: 5,
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-theme-bg border border-theme-border shadow-subtle flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-theme-text leading-relaxed italic">
                    "{t.review}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-theme-border flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-theme-border"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-theme-text">{t.name}</h4>
                    <p className="text-[10px] text-theme-text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
              Got Questions?
            </span>
            <h2 className="text-3xl font-black font-display text-theme-text">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-theme-border bg-theme-surface overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm text-theme-text hover:bg-theme-surface-hover transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-theme-primary' : 'text-theme-text-muted'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-theme-text-muted leading-relaxed border-t border-theme-border pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. DRIVER RECRUITMENT CTA BANNER */}
      <section className="py-12 bg-theme-primary text-theme-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
                Own a Bike, Auto, or Cab? Drive with RideX.
              </h3>
              <p className="text-sm font-semibold opacity-90">
                Earn up to ₹35,000+ monthly with flexible hours and instant daily payouts.
              </p>
            </div>
            <button
              onClick={() => navigate('/driver')}
              className="px-6 py-3.5 rounded-2xl bg-theme-secondary text-white font-bold text-sm hover:bg-black transition-all shadow-elevated flex items-center gap-2 shrink-0 transform active:scale-95"
            >
              <span>Join as Captain</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

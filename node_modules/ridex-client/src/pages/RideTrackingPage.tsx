import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone,
  MessageSquare,
  ShieldAlert,
  Share2,
  X,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Car,
  Bike,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Download,
} from 'lucide-react';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { Ride, RideStatus } from '../types';
import { ridesApi, driverApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STEPS: { status: RideStatus; label: string; desc: string }[] = [
  { status: 'SEARCHING', label: 'Searching', desc: 'Looking for nearby captains' },
  { status: 'DRIVER_ASSIGNED', label: 'Assigned', desc: 'Captain accepted your ride' },
  { status: 'DRIVER_ARRIVING', label: 'Arriving', desc: 'Captain is on the way to pickup' },
  { status: 'ARRIVED', label: 'Arrived', desc: 'Captain has arrived at your spot' },
  { status: 'IN_PROGRESS', label: 'On Trip', desc: 'Trip in progress with OTP verified' },
  { status: 'COMPLETED', label: 'Completed', desc: 'Arrived safely at destination' },
];

export const RideTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [showSosModal, setShowSosModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Rating state
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['On-time', 'Polite Captain']);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Polling / Socket fetch
  const fetchRide = async () => {
    if (!id) return;
    try {
      const res = await ridesApi.getRideById(id);
      if (res.success && res.ride) {
        setRide(res.ride);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
    const interval = setInterval(fetchRide, 4000);
    return () => clearInterval(interval);
  }, [id]);

  // Demo status progression helper
  const handleSimulateNextStatus = async () => {
    if (!ride) return;
    const currentStatus = ride.status;

    let nextStatus: RideStatus = 'DRIVER_ASSIGNED';
    if (currentStatus === 'REQUESTED' || currentStatus === 'SEARCHING') {
      nextStatus = 'DRIVER_ASSIGNED';
    } else if (currentStatus === 'DRIVER_ASSIGNED') {
      nextStatus = 'DRIVER_ARRIVING';
    } else if (currentStatus === 'DRIVER_ARRIVING') {
      nextStatus = 'ARRIVED';
    } else if (currentStatus === 'ARRIVED') {
      nextStatus = 'IN_PROGRESS';
    } else if (currentStatus === 'IN_PROGRESS') {
      nextStatus = 'COMPLETED';
    }

    try {
      await driverApi.updateStatus(ride.id, {
        status: nextStatus,
        otp: ride.otp,
        note: `Simulated transition to ${nextStatus}`,
      });
      fetchRide();
    } catch {
      // In case user is not logged in as this driver, directly update state for demo presentation
      setRide((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  const handleCancelRide = async () => {
    if (!ride) return;
    try {
      await ridesApi.cancelRide(ride.id, cancelReason);
      setShowCancelModal(false);
      fetchRide();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel ride');
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ride) return;
    try {
      await ridesApi.rateRide(ride.id, {
        score: ratingScore,
        feedback: ratingFeedback,
        tags: selectedTags.join(','),
      });
      setRatingSubmitted(true);
      fetchRide();
    } catch (err: any) {
      alert(err.message || 'Failed to submit rating');
    }
  };

  const handleOpenReceipt = async () => {
    if (!ride) return;
    try {
      const res = await ridesApi.getReceipt(ride.id);
      if (res.success && res.receipt) {
        setReceiptData(res.receipt);
        setShowReceiptModal(true);
      }
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-theme-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-bold text-theme-text">Connecting to Live Telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center p-4">
        <div className="p-8 rounded-3xl bg-theme-surface border border-theme-border text-center max-w-md space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-theme-text">Ride Not Found</h2>
          <p className="text-xs text-theme-text-muted">{error || 'Unable to locate booking ID.'}</p>
          <button
            onClick={() => navigate('/book')}
            className="px-6 py-2.5 rounded-xl bg-theme-primary text-theme-secondary font-bold text-xs"
          >
            Book New Ride
          </button>
        </div>
      </div>
    );
  }

  // Simulated driver coordinates (moving near pickup)
  const driverCoordinates =
    ride.status === 'IN_PROGRESS'
      ? {
          lat: ride.destLat - (ride.destLat - ride.pickupLat) * 0.4,
          lng: ride.destLng - (ride.destLng - ride.pickupLng) * 0.4,
          name: ride.driver?.user?.name || 'Captain',
        }
      : ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED'
      ? {
          lat: ride.pickupLat + 0.003,
          lng: ride.pickupLng + 0.003,
          name: ride.driver?.user?.name || 'Captain',
        }
      : null;

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-theme-secondary text-theme-primary flex items-center justify-center font-black text-xl">
              X
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-display text-theme-text">
                  Trip • {ride.bookingCode}
                </h1>
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-theme-primary-light text-theme-secondary">
                  {ride.category.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-theme-text-muted">
                Booked on {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Quick Demo Progression Bar */}
          <div className="flex items-center gap-2">
            {ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED' && (
              <button
                type="button"
                onClick={handleSimulateNextStatus}
                className="px-3.5 py-2 rounded-xl bg-theme-secondary text-theme-primary font-bold text-xs hover:bg-black transition-colors flex items-center gap-1.5 shadow-sm"
                title="Advance to next ride state for testing"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulate Next Step</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowSosModal(true)}
              className="px-3.5 py-2 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Safety SOS</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Ride Tracking Details & Captain Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Status Progress Timeline */}
            <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-theme-text-muted">
                    Ride Status
                  </span>
                  <h2 className="text-lg font-black text-theme-text">
                    {ride.status.replace(/_/g, ' ')}
                  </h2>
                </div>

                {/* 4-digit OTP Badge */}
                {ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED' && (
                  <div className="p-2.5 rounded-2xl bg-theme-primary-light border border-theme-primary/40 text-center">
                    <span className="text-[10px] font-bold text-theme-secondary uppercase block">
                      Start OTP
                    </span>
                    <span className="text-xl font-black font-mono text-theme-secondary tracking-widest">
                      {ride.otp}
                    </span>
                  </div>
                )}
              </div>

              {/* Stepper Dots */}
              <div className="relative pl-6 space-y-5 border-l-2 border-theme-border my-2">
                {STATUS_STEPS.map((step) => {
                  const stepIndex = STATUS_STEPS.findIndex((s) => s.status === step.status);
                  const currentIndex = STATUS_STEPS.findIndex((s) => s.status === ride.status);
                  const isDone = currentIndex >= stepIndex;
                  const isCurrent = ride.status === step.status;

                  return (
                    <div key={step.status} className="relative">
                      <div
                        className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 transition-colors ${
                          isDone
                            ? 'bg-theme-primary border-theme-secondary'
                            : 'bg-theme-surface border-theme-border'
                        }`}
                      />
                      <div>
                        <div
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-theme-primary font-black'
                              : isDone
                              ? 'text-theme-text'
                              : 'text-theme-text-muted'
                          }`}
                        >
                          {step.label}
                        </div>
                        <p className="text-[11px] text-theme-text-muted">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Captain Details Card (if assigned) */}
            {ride.driver ? (
              <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
                    Assigned Captain
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={
                      ride.driver.user?.avatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                    }
                    alt={ride.driver.user?.name || 'Captain'}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-theme-primary shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-theme-text truncate">
                      {ride.driver.user?.name || 'Captain Rajesh Kumar'}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-theme-text-muted">
                      <span className="flex items-center gap-0.5 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {ride.driver.rating || 4.9}
                      </span>
                      <span>• {ride.driver.totalRides || 384} trips completed</span>
                    </div>
                    {ride.driver.vehicle && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="font-mono text-xs font-black uppercase px-2 py-0.5 rounded bg-theme-surface-hover border border-theme-border text-theme-text">
                          {ride.driver.vehicle.plateNumber}
                        </span>
                        <span className="text-xs text-theme-text-muted truncate">
                          {ride.driver.vehicle.make} {ride.driver.vehicle.model}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Captain Buttons */}
                {ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowContactModal(true)}
                      className="py-2.5 rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-surface-hover text-theme-text font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span>Call Captain</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContactModal(true)}
                      className="py-2.5 rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-surface-hover text-theme-text font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span>Chat</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-theme-primary border-t-transparent animate-spin mx-auto" />
                <h3 className="text-sm font-bold text-theme-text">Finding your nearest Captain...</h3>
                <p className="text-xs text-theme-text-muted">
                  Sending request to verified 2-wheelers and drivers nearby.
                </p>
              </div>
            )}

            {/* Trip Details Card */}
            <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
                  Trip Route & Fare
                </span>
                <span className="text-xs font-bold text-theme-text">
                  ₹{(ride.totalFarePaise / 100).toFixed(2)} ({ride.paymentMethod})
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-theme-text-muted">Pickup</span>
                    <p className="text-xs font-semibold text-theme-text leading-tight">{ride.pickupAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-theme-text-muted">Drop</span>
                    <p className="text-xs font-semibold text-theme-text leading-tight">{ride.destAddress}</p>
                  </div>
                </div>
              </div>

              {/* Ride Completed Summary & Receipt / Rating */}
              {ride.status === 'COMPLETED' && (
                <div className="pt-4 border-t border-theme-border space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="text-sm font-black">You have arrived safely!</h4>
                    <p className="text-xs">
                      Paid ₹{(ride.totalFarePaise / 100).toFixed(2)} via {ride.paymentMethod}.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleOpenReceipt}
                      className="flex-1 py-2.5 rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-surface-hover text-theme-text font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>View Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/book')}
                      className="flex-1 py-2.5 rounded-xl bg-theme-primary text-theme-secondary font-bold text-xs hover:bg-theme-primary-hover transition-colors"
                    >
                      Book Another
                    </button>
                  </div>

                  {/* Rating Section if not yet rated */}
                  {!ride.rating && !ratingSubmitted && (
                    <form onSubmit={handleRatingSubmit} className="pt-3 border-t border-theme-border space-y-3">
                      <h4 className="text-xs font-bold text-theme-text">Rate your Captain</h4>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRatingScore(s)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                s <= ratingScore ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {['On-time', 'Clean Helmet', 'Polite Captain', 'Smooth Ride', 'Safe Driving'].map((tag) => {
                          const isTagSelected = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setSelectedTags(
                                  isTagSelected
                                    ? selectedTags.filter((t) => t !== tag)
                                    : [...selectedTags, tag]
                                );
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                                isTagSelected
                                  ? 'border-theme-primary bg-theme-primary-light text-theme-secondary'
                                  : 'border-theme-border bg-theme-surface text-theme-text-muted'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>

                      <input
                        type="text"
                        value={ratingFeedback}
                        onChange={(e) => setRatingFeedback(e.target.value)}
                        placeholder="Write a feedback note (optional)..."
                        className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-text focus:outline-none focus:border-theme-primary"
                      />

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-theme-secondary text-white font-bold text-xs hover:bg-black transition-colors"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Cancel ride button */}
              {ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED' && (
                <div className="pt-2 border-t border-theme-border">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Cancel Ride
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Interactive Tracking Map */}
          <div className="lg:col-span-7 sticky top-24">
            <InteractiveMap
              pickupLocation={{ lat: ride.pickupLat, lng: ride.pickupLng, title: ride.pickupAddress }}
              destLocation={{ lat: ride.destLat, lng: ride.destLng, title: ride.destAddress }}
              driverLocation={driverCoordinates}
              showNearbyDrivers={false}
              heightClass="h-[480px] sm:h-[620px]"
            />
          </div>
        </div>
      </div>

      {/* Cancel Ride Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-theme-surface border border-theme-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-theme-text">Cancel Ride?</h3>
              <button onClick={() => setShowCancelModal(false)}>
                <X className="w-5 h-5 text-theme-text-muted" />
              </button>
            </div>
            <p className="text-xs text-theme-text-muted">
              Are you sure you want to cancel? No cancellation fee is charged if cancelled within 2 minutes of booking.
            </p>

            <div className="space-y-2">
              {[
                'Change of plans',
                'Expected shorter pickup time',
                'Driver asked to cancel',
                'Booked by mistake',
                'Other reason',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setCancelReason(reason)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-colors ${
                    cancelReason === reason
                      ? 'border-theme-primary bg-theme-primary-light text-theme-secondary font-bold'
                      : 'border-theme-border bg-theme-surface text-theme-text'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-theme-border text-xs font-bold text-theme-text"
              >
                Keep Ride
              </button>
              <button
                type="button"
                onClick={handleCancelRide}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safety SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-theme-surface border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-500">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-base font-black">RideX Safety Assistance</h3>
              </div>
              <button onClick={() => setShowSosModal(false)}>
                <X className="w-5 h-5 text-theme-text-muted" />
              </button>
            </div>

            <p className="text-xs text-theme-text-muted leading-relaxed">
              If you feel unsafe or there is an emergency, use these immediate escalation hotlines:
            </p>

            <div className="space-y-2.5">
              <a
                href="tel:112"
                className="p-3.5 rounded-2xl bg-red-500 text-white font-bold text-xs flex items-center justify-between shadow-sm"
              >
                <span>🚨 Call National Police Emergency (112)</span>
                <Phone className="w-4 h-4" />
              </a>

              <a
                href="tel:1800247000"
                className="p-3.5 rounded-2xl bg-theme-secondary text-theme-primary font-bold text-xs flex items-center justify-between border border-theme-border shadow-sm"
              >
                <span>📞 RideX 24x7 Safety Response Desk</span>
                <Phone className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Live trip tracking link copied to clipboard! Share it with family.');
                }}
                className="w-full p-3.5 rounded-2xl border border-theme-border bg-theme-surface hover:bg-theme-surface-hover text-theme-text font-bold text-xs flex items-center justify-between"
              >
                <span>🔗 Share Live GPS Trip with Family</span>
                <Share2 className="w-4 h-4 text-theme-primary" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-theme-surface border border-theme-border rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Phone className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-theme-text">Calling Captain {ride.driver?.user?.name || 'Rajesh'}</h3>
            <p className="text-xs text-theme-text-muted">
              Demo Phone Masking Active: Connecting via simulated encrypted gateway (+91 80 4000 8921).
            </p>
            <div className="p-3 rounded-2xl bg-theme-surface-hover border border-theme-border text-xs font-mono">
              Vehicle: {ride.driver?.vehicle?.plateNumber || 'KA-01-EQ-4421'}
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 rounded-xl bg-theme-secondary text-white font-bold text-xs"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-theme-surface border border-theme-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <div>
                <h3 className="text-base font-black font-display text-theme-text">Trip Receipt</h3>
                <p className="text-[10px] font-mono text-theme-text-muted">{receiptData.receiptNumber}</p>
              </div>
              <button onClick={() => setShowReceiptModal(false)}>
                <X className="w-5 h-5 text-theme-text-muted" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-theme-border">
                <span className="text-theme-text-muted">Booking Code</span>
                <span className="font-bold text-theme-text">{receiptData.bookingCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-theme-border">
                <span className="text-theme-text-muted">Captain</span>
                <span className="font-bold text-theme-text">{receiptData.driverName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-theme-border">
                <span className="text-theme-text-muted">Vehicle Details</span>
                <span className="font-bold text-theme-text">{receiptData.vehicleDetails}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-theme-border">
                <span className="text-theme-text-muted">Distance Travelled</span>
                <span className="font-bold text-theme-text">{receiptData.distanceKm} km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-theme-border">
                <span className="text-theme-text-muted">Base Fare</span>
                <span>₹{receiptData.fareBreakdown.baseFareRupees}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-theme-border">
                <span className="text-theme-text-muted">Distance Fare</span>
                <span>₹{receiptData.fareBreakdown.distanceFareRupees}</span>
              </div>
              {parseFloat(receiptData.fareBreakdown.discountRupees) > 0 && (
                <div className="flex justify-between py-1 border-b border-theme-border text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{receiptData.fareBreakdown.discountRupees}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-sm font-black text-theme-text">
                <span>Total Amount Paid</span>
                <span>₹{receiptData.fareBreakdown.totalFareRupees}</span>
              </div>
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full py-3 rounded-xl bg-theme-primary text-theme-secondary font-bold text-xs"
            >
              Print / Save PDF Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

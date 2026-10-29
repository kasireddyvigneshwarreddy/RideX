import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Power,
  Navigation,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Play,
  Key,
} from 'lucide-react';
import { driverApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ride } from '../types';

export const DriverDashboardPage: React.FC = () => {
  const { user, isAuthenticated, loginAs } = useAuth();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(true);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Poll driver requests & active ride
  const fetchDriverState = async () => {
    try {
      const [reqRes, earnRes] = await Promise.all([
        driverApi.getRequests(),
        driverApi.getEarnings(),
      ]);

      if (reqRes.success) {
        setActiveRide(reqRes.activeRide || null);
        setPendingRequests(reqRes.pendingRequests || []);
        if (reqRes.driverStatus) {
          setIsOnline(reqRes.driverStatus.isOnline);
        }
      }

      if (earnRes.success) {
        setEarningsData(earnRes);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'DRIVER') {
      fetchDriverState();
      const interval = setInterval(fetchDriverState, 4000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      await driverApi.toggleAvailability({ isOnline: nextState });
    } catch {
      setIsOnline(!nextState);
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    setActionLoading(true);
    try {
      const res = await driverApi.acceptRide(rideId);
      if (res.success && res.ride) {
        setActiveRide(res.ride);
        setPendingRequests((prev) => prev.filter((r) => r.id !== rideId));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to accept ride');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!activeRide) return;
    setOtpError(null);

    if (status === 'IN_PROGRESS' && !otpInput) {
      setOtpError('Please ask the customer for their 4-digit OTP to start trip.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await driverApi.updateStatus(activeRide.id, {
        status,
        otp: otpInput || undefined,
      });

      if (res.success && res.ride) {
        if (status === 'COMPLETED') {
          setActiveRide(null);
          setOtpInput('');
          fetchDriverState();
        } else {
          setActiveRide(res.ride);
        }
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to update ride status');
    } finally {
      setActionLoading(false);
    }
  };

  // If not logged in as Driver, show quick login button
  if (!isAuthenticated || user?.role !== 'DRIVER') {
    return (
      <div className="min-h-screen bg-theme-bg py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-theme-surface border border-theme-border rounded-3xl p-8 shadow-elevated text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-theme-primary text-theme-secondary flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 fill-theme-secondary" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black font-display text-theme-text">RideX Captain Portal</h2>
            <p className="text-xs text-theme-text-muted">
              Please sign in with a Captain / Driver account to access the driver console.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-surface-hover border border-theme-border text-left text-xs space-y-1">
            <p className="font-bold text-theme-text">Demo Captain Credentials:</p>
            <p className="text-theme-text-muted">Email: driver@ridex.in</p>
            <p className="text-theme-text-muted">Password: Password123!</p>
          </div>

          <button
            type="button"
            onClick={async () => {
              await loginAs('driver');
              fetchDriverState();
            }}
            className="w-full py-3.5 rounded-2xl bg-theme-primary text-theme-secondary font-black text-sm hover:bg-theme-primary-hover shadow-subtle transition-colors"
          >
            One-Click Login as Captain Rajesh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header with Online/Offline toggle */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={user.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-theme-primary shadow-xs"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black font-display text-theme-text">{user.name}</h1>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Captain
                </span>
              </div>
              <p className="text-xs text-theme-text-muted">
                {user.driverProfile?.vehicle
                  ? `${user.driverProfile.vehicle.make} ${user.driverProfile.vehicle.model} • ${user.driverProfile.vehicle.plateNumber}`
                  : 'Honda Activa 6G • KA-01-EQ-4421'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleOnline}
              className={`px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-sm transition-all transform active:scale-95 ${
                isOnline
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-theme-secondary text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isOnline ? 'ONLINE & ACCEPTING' : 'OFFLINE'}</span>
            </button>
          </div>
        </div>

        {/* Earnings KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
              Total Earnings
            </span>
            <div className="text-2xl font-black text-theme-text">
              ₹{earningsData ? earningsData.summary.totalEarningsRupees : '42,560.00'}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> 85% net payout
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
              Completed Trips
            </span>
            <div className="text-2xl font-black text-theme-text">
              {earningsData ? earningsData.summary.totalRides : 384}
            </div>
            <p className="text-[11px] text-theme-text-muted">In Bengaluru city</p>
          </div>

          <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
              Captain Rating
            </span>
            <div className="text-2xl font-black text-theme-text flex items-center gap-1.5">
              <span>{earningsData ? earningsData.summary.rating : 4.92}</span>
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">Top 5% in Whitefield</p>
          </div>

          <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
              Platform Commission
            </span>
            <div className="text-2xl font-black text-theme-text">15%</div>
            <p className="text-[11px] text-theme-text-muted">Zero hidden fees</p>
          </div>
        </div>

        {/* Active Ride Control Panel (If currently on a ride) */}
        {activeRide ? (
          <div className="p-6 rounded-3xl bg-theme-surface border-2 border-theme-primary shadow-elevated space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-lg font-black text-theme-text">
                  Active Ride • {activeRide.bookingCode}
                </h2>
              </div>
              <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-theme-primary text-theme-secondary">
                {activeRide.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 p-4 rounded-2xl bg-theme-surface-hover/50 border border-theme-border">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-theme-text-muted">Pickup</span>
                    <p className="text-xs font-bold text-theme-text">{activeRide.pickupAddress}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-theme-text-muted">Destination</span>
                    <p className="text-xs font-bold text-theme-text">{activeRide.destAddress}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-theme-surface-hover/50 border border-theme-border flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-theme-text-muted">Fare to Collect</span>
                  <span className="text-lg font-black text-theme-text">
                    ₹{(activeRide.totalFarePaise / 100).toFixed(2)} ({activeRide.paymentMethod})
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-theme-text-muted">Customer Name</span>
                  <span className="font-bold text-theme-text">{activeRide.customer?.name || 'Aarav Sharma'}</span>
                </div>
              </div>
            </div>

            {/* OTP entry input if arrived and starting trip */}
            {activeRide.status === 'ARRIVED' && (
              <div className="p-4 rounded-2xl bg-theme-primary-light border border-theme-primary/40 space-y-2">
                <label className="text-xs font-bold text-theme-secondary flex items-center gap-1.5">
                  <Key className="w-4 h-4" /> Enter Rider's 4-Digit OTP to Start Trip:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-32 px-3 py-2 rounded-xl border border-theme-primary bg-white text-center font-mono font-black text-lg text-theme-secondary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    disabled={actionLoading}
                    className="px-6 py-2 rounded-xl bg-theme-secondary text-theme-primary font-bold text-xs hover:bg-black transition-colors"
                  >
                    Verify & Start Trip
                  </button>
                </div>
                {otpError && <p className="text-xs font-semibold text-red-600">{otpError}</p>}
              </div>
            )}

            {/* Action buttons based on current state */}
            <div className="flex flex-wrap gap-3 pt-2">
              {activeRide.status === 'DRIVER_ASSIGNED' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('DRIVER_ARRIVING')}
                  disabled={actionLoading}
                  className="px-6 py-3 rounded-xl bg-theme-primary text-theme-secondary font-bold text-xs shadow-sm hover:bg-theme-primary-hover transition-colors"
                >
                  I'm on the Way to Pickup
                </button>
              )}

              {activeRide.status === 'DRIVER_ARRIVING' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('ARRIVED')}
                  disabled={actionLoading}
                  className="px-6 py-3 rounded-xl bg-theme-secondary text-white font-bold text-xs shadow-sm hover:bg-black transition-colors"
                >
                  Arrived at Pickup Location
                </button>
              )}

              {activeRide.status === 'IN_PROGRESS' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  disabled={actionLoading}
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  Complete Trip & Collect Fare
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&origin=${activeRide.pickupLat},${activeRide.pickupLng}&destination=${activeRide.destLat},${activeRide.destLng}`,
                    '_blank'
                  )
                }
                className="px-4 py-3 rounded-xl border border-theme-border bg-theme-surface text-theme-text font-bold text-xs hover:bg-theme-surface-hover flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-4 h-4 text-theme-primary" />
                <span>External Google Maps Navigation</span>
              </button>
            </div>
          </div>
        ) : (
          /* Incoming Request Queue */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black font-display text-theme-text">
                Incoming Ride Requests ({pendingRequests.length})
              </h2>
              <span className="text-xs text-theme-text-muted">
                {isOnline ? 'Listening for dispatch signals...' : 'You are offline'}
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-12 rounded-3xl bg-theme-surface border border-theme-border text-center space-y-2">
                <Clock className="w-10 h-10 text-theme-text-muted mx-auto stroke-1" />
                <h3 className="text-sm font-bold text-theme-text">No pending ride requests nearby</h3>
                <p className="text-xs text-theme-text-muted max-w-sm mx-auto">
                  Keep your app open and stay online. You will receive an instant audio and visual alert when a customer books near your zone.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-theme-primary bg-theme-secondary px-2.5 py-1 rounded-lg">
                        {req.bookingCode}
                      </span>
                      <span className="text-lg font-black text-theme-text">
                        ₹{(req.totalFarePaise / 100).toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        <span className="text-theme-text font-medium truncate">{req.pickupAddress}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                        <span className="text-theme-text font-medium truncate">{req.destAddress}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-theme-text-muted pt-2 border-t border-theme-border">
                      <span>{req.distanceKm} km • ~{req.durationMinutes} mins</span>
                      <span className="font-bold text-emerald-600">Earnings: ₹{((req.totalFarePaise * 0.85) / 100).toFixed(0)}</span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAcceptRide(req.id)}
                        disabled={actionLoading}
                        className="flex-1 py-3 rounded-2xl bg-theme-primary text-theme-secondary font-black text-xs hover:bg-theme-primary-hover shadow-subtle transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Ride</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingRequests((prev) => prev.filter((r) => r.id !== req.id))}
                        className="px-4 py-3 rounded-2xl border border-theme-border text-theme-text-muted hover:text-red-500 text-xs font-bold transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

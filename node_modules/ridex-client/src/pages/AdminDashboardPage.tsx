import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Car,
  TrendingUp,
  CreditCard,
  FileText,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Sliders,
  LifeBuoy,
  RefreshCw,
  Eye,
  Plus,
} from 'lucide-react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated, loginAs } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'fares' | 'coupons' | 'tickets' | 'users'>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [fareRules, setFareRules] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New coupon modal state
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderPaise: 4000,
    maxDiscountPaise: 5000,
    validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, driversRes, faresRes, ticketsRes, usersRes] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getDrivers(),
        adminApi.getFareRules(),
        adminApi.getSupportTickets(),
        adminApi.getUsers(),
      ]);

      if (analyticsRes.success) {
        setMetrics(analyticsRes.metrics);
        setCategoryBreakdown(analyticsRes.categoryBreakdown || []);
        setRecentLogs(analyticsRes.recentActivityLogs || []);
      }
      if (driversRes.success) setDrivers(driversRes.drivers || []);
      if (faresRes.success) setFareRules(faresRes.rules || []);
      if (ticketsRes.success) setSupportTickets(ticketsRes.tickets || []);
      if (usersRes.success) setUsersList(usersRes.users || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  const handleVerifyDriver = async (driverId: string, isVerified: boolean) => {
    try {
      await adminApi.verifyDriver(driverId, {
        isVerified,
        notes: isVerified ? 'Verified by Admin' : 'Rejected: Resubmission required',
      });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Verification update failed');
    }
  };

  const handleUpdateFare = async (ruleId: string, surgeMultiplier: number) => {
    try {
      await adminApi.updateFareRule(ruleId, { surgeMultiplier });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Fare update failed');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createCoupon(newCoupon);
      setShowCouponModal(false);
      alert(`Coupon ${newCoupon.code} created successfully!`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Coupon creation failed');
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await adminApi.updateSupportTicket(ticketId, {
        status,
        adminNotes: `Resolved by ${user?.name || 'Admin'}`,
      });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Ticket update failed');
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-theme-bg py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-theme-surface border border-theme-border rounded-3xl p-8 shadow-elevated text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black font-display text-theme-text">RideX Operations Console</h2>
            <p className="text-xs text-theme-text-muted">
              Restricted to verified administrators with role level authorization.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-surface-hover border border-theme-border text-left text-xs space-y-1">
            <p className="font-bold text-theme-text">Demo Admin Credentials:</p>
            <p className="text-theme-text-muted">Email: admin@ridex.in</p>
            <p className="text-theme-text-muted">Password: AdminPass123!</p>
          </div>

          <button
            type="button"
            onClick={async () => {
              await loginAs('admin');
              fetchAdminData();
            }}
            className="w-full py-3.5 rounded-2xl bg-theme-primary text-theme-secondary font-black text-sm hover:bg-theme-primary-hover shadow-subtle transition-colors"
          >
            One-Click Login as Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Admin Header */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-theme-secondary text-theme-primary flex items-center justify-center font-black text-2xl">
              X
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black font-display text-theme-text">RideX Command Center</h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  Bengaluru Ops
                </span>
              </div>
              <p className="text-xs text-theme-text-muted">
                Fleet management, dynamic fare rules, compliance verification & audits.
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            className="px-4 py-2.5 rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-surface-hover text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-theme-border no-scrollbar text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview & Analytics', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'drivers', label: `Driver Verification (${drivers.filter((d) => !d.isVerified).length} Pending)`, icon: <Car className="w-4 h-4" /> },
            { id: 'fares', label: 'Fare Rules & Pricing', icon: <Sliders className="w-4 h-4" /> },
            { id: 'coupons', label: 'Promotions & Coupons', icon: <Tag className="w-4 h-4" /> },
            { id: 'tickets', label: `Support Desk (${supportTickets.filter((t) => t.status === 'OPEN').length})`, icon: <LifeBuoy className="w-4 h-4" /> },
            { id: 'users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 rounded-2xl shrink-0 flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-theme-surface text-theme-primary font-black border border-theme-border shadow-xs'
                  : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
                  Gross Platform GMV
                </span>
                <div className="text-2xl font-black text-theme-text">
                  ₹{metrics ? metrics.totalRevenueRupees : '48,000.00'}
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold">100% processed</p>
              </div>

              <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
                  Platform Commission (15%)
                </span>
                <div className="text-2xl font-black text-emerald-600">
                  ₹{metrics ? metrics.platformCommissionRupees : '7,200.00'}
                </div>
                <p className="text-[11px] text-theme-text-muted">Net RideX earnings</p>
              </div>

              <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
                  Total Bookings
                </span>
                <div className="text-2xl font-black text-theme-text">
                  {metrics ? metrics.totalRides : 0}
                </div>
                <p className="text-[11px] text-theme-text-muted">
                  {metrics ? metrics.completedRides : 0} completed • {metrics ? metrics.cancelledRides : 0} cancelled
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
                  Registered Drivers
                </span>
                <div className="text-2xl font-black text-theme-text">
                  {metrics ? metrics.totalDrivers : 0}
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold">
                  {metrics ? metrics.verifiedDrivers : 0} verified captains
                </p>
              </div>
            </div>

            {/* Category breakdown visual bars */}
            <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-theme-text">Bookings by Ride Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {['BIKE', 'AUTO', 'CAB_ECONOMY', 'CAB_PREMIUM'].map((cat) => {
                  const count = categoryBreakdown.find((c) => c.category === cat)?.count || 0;
                  return (
                    <div key={cat} className="p-4 rounded-2xl bg-theme-surface-hover border border-theme-border space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-theme-text">{cat.replace('_', ' ')}</span>
                        <span className="text-theme-primary">{count} rides</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-theme-border overflow-hidden">
                        <div
                          className="h-full bg-theme-primary"
                          style={{ width: `${Math.min(100, Math.max(15, count * 20))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent audit activity logs */}
            <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-3">
              <h3 className="text-sm font-bold text-theme-text">Operational Audit Logs</h3>
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-theme-surface-hover/50 border border-theme-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-theme-text">{log.action}</span>
                      <span className="text-theme-text-muted ml-2">by {log.user?.name || 'System'}</span>
                    </div>
                    <span className="text-[10px] text-theme-text-muted">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DRIVER VERIFICATION */}
        {activeTab === 'drivers' && (
          <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
            <h3 className="text-base font-bold text-theme-text">Captain Verification Queue</h3>
            <div className="space-y-3">
              {drivers.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl border border-theme-border bg-theme-bg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={d.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-theme-border"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-theme-text">{d.user?.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            d.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {d.isVerified ? 'Verified' : 'Pending Review'}
                        </span>
                      </div>
                      <p className="text-xs text-theme-text-muted">
                        License: {d.licenseNumber} • Vehicle: {d.vehicle?.make} {d.vehicle?.model} ({d.vehicle?.plateNumber})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!d.isVerified ? (
                      <button
                        onClick={() => handleVerifyDriver(d.id, true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Documents</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerifyDriver(d.id, false)}
                        className="px-4 py-2 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Revoke Verification</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FARE RULES */}
        {activeTab === 'fares' && (
          <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
            <h3 className="text-base font-bold text-theme-text">Configurable Pricing Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fareRules.map((rule) => (
                <div key={rule.id} className="p-5 rounded-2xl border border-theme-border bg-theme-bg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-theme-text">{rule.displayName}</h4>
                    <span className="text-xs font-mono font-bold text-theme-primary">
                      Surge: {rule.surgeMultiplier}x
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-theme-surface border border-theme-border">
                      <span className="text-theme-text-muted text-[10px] block">Base Fare</span>
                      <span className="font-bold text-theme-text">₹{(rule.baseFarePaise / 100).toFixed(0)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-theme-surface border border-theme-border">
                      <span className="text-theme-text-muted text-[10px] block">Per Km Rate</span>
                      <span className="font-bold text-theme-text">₹{(rule.perKmRatePaise / 100).toFixed(0)}/km</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-theme-surface border border-theme-border">
                      <span className="text-theme-text-muted text-[10px] block">Min Fare</span>
                      <span className="font-bold text-theme-text">₹{(rule.minFarePaise / 100).toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-theme-border">
                    <span className="text-xs text-theme-text-muted">Adjust Surge:</span>
                    <button
                      onClick={() => handleUpdateFare(rule.id, 1.0)}
                      className="px-2.5 py-1 rounded-lg border text-xs font-bold hover:bg-theme-surface-hover"
                    >
                      1.0x (Normal)
                    </button>
                    <button
                      onClick={() => handleUpdateFare(rule.id, 1.25)}
                      className="px-2.5 py-1 rounded-lg border text-xs font-bold hover:bg-theme-surface-hover text-amber-600"
                    >
                      1.25x (Peak)
                    </button>
                    <button
                      onClick={() => handleUpdateFare(rule.id, 1.5)}
                      className="px-2.5 py-1 rounded-lg border text-xs font-bold hover:bg-theme-surface-hover text-red-500"
                    >
                      1.5x (Rain)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-theme-text">Promotional Coupons</h3>
              <button
                onClick={() => setShowCouponModal(true)}
                className="px-4 py-2 rounded-xl bg-theme-primary text-theme-secondary font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { code: 'RIDEX50', discount: '50% up to ₹50', uses: '142 / 10000' },
                { code: 'FIRSTFREE', discount: 'Flat ₹60 OFF', uses: '67 / 5000' },
                { code: 'RAPIDPASS', discount: '20% up to ₹100', uses: '31 / 2000' },
              ].map((c) => (
                <div key={c.code} className="p-4 rounded-2xl border border-theme-border bg-theme-bg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm font-black text-theme-primary bg-theme-secondary px-2.5 py-0.5 rounded">
                      {c.code}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs font-bold text-theme-text">{c.discount}</p>
                  <p className="text-[11px] text-theme-text-muted">Redemptions: {c.uses}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SUPPORT TICKETS */}
        {activeTab === 'tickets' && (
          <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
            <h3 className="text-base font-bold text-theme-text">In-App Support Desk</h3>
            <div className="space-y-3">
              {supportTickets.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl border border-theme-border bg-theme-bg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-theme-text">{t.subject}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-theme-surface-hover text-theme-text-muted">
                        {t.category}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-theme-text-muted leading-relaxed">{t.message}</p>
                  <div className="pt-2 flex items-center justify-between text-xs text-theme-text-muted border-t border-theme-border">
                    <span>User: {t.user?.name} ({t.user?.phone})</span>
                    {t.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleUpdateTicketStatus(t.id, 'RESOLVED')}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
            <h3 className="text-base font-bold text-theme-text">Registered Accounts</h3>
            <div className="space-y-2">
              {usersList.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl border border-theme-border bg-theme-bg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-theme-text">{u.name}</span>
                    <span className="text-theme-text-muted ml-2">({u.email})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-theme-text-muted">{u.phone}</span>
                    <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-theme-primary-light text-theme-secondary">
                      {u.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCoupon}
            className="w-full max-w-md bg-theme-surface border border-theme-border rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-theme-text">Create New Promo Code</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-theme-text-muted block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MONSOON40"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-surface font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text-muted block mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder="e.g. 40% OFF on all Auto rides"
                  className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-theme-text-muted block mb-1">Discount %</label>
                  <input
                    type="number"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-surface"
                  />
                </div>
                <div>
                  <label className="font-bold text-theme-text-muted block mb-1">Max Cap (Paise)</label>
                  <input
                    type="number"
                    value={newCoupon.maxDiscountPaise}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscountPaise: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl border border-theme-border bg-theme-surface"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-theme-border font-bold text-xs text-theme-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-theme-primary text-theme-secondary font-bold text-xs"
              >
                Create Promo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

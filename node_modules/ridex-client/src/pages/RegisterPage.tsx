import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Lock, Bike, Car, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState<'CUSTOMER' | 'DRIVER'>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91');
  const [password, setPassword] = useState('');

  // Driver fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState<'BIKE' | 'AUTO' | 'CAB_ECONOMY'>('BIKE');
  const [plateNumber, setPlateNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
        ...(role === 'DRIVER'
          ? {
              licenseNumber,
              vehicleCategory,
              vehiclePlateNumber: plateNumber,
            }
          : {}),
      });

      if (role === 'DRIVER') {
        navigate('/driver');
      } else {
        navigate('/book');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-theme-text-muted hover:text-theme-text"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="p-8 rounded-3xl bg-theme-surface border border-theme-border shadow-elevated space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black font-display text-theme-text">Join RideX India</h1>
            <p className="text-xs text-theme-text-muted">
              Choose your account type and start commuting or earning.
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-theme-surface-hover border border-theme-border text-xs font-bold">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`py-2 rounded-xl transition-all ${
                role === 'CUSTOMER'
                  ? 'bg-theme-surface text-theme-text shadow-xs font-black'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              Passenger / Rider
            </button>
            <button
              type="button"
              onClick={() => setRole('DRIVER')}
              className={`py-2 rounded-xl transition-all ${
                role === 'DRIVER'
                  ? 'bg-theme-primary text-theme-secondary shadow-xs font-black'
                  : 'text-theme-text-muted hover:text-theme-text'
              }`}
            >
              Captain / Partner
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-theme-text-muted block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-theme-text text-sm font-medium focus:outline-none focus:border-theme-primary"
              />
            </div>

            <div>
              <label className="font-bold text-theme-text-muted block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-theme-text text-sm font-medium focus:outline-none focus:border-theme-primary"
              />
            </div>

            <div>
              <label className="font-bold text-theme-text-muted block mb-1">Phone Number (+91...)</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-theme-text text-sm font-medium focus:outline-none focus:border-theme-primary"
              />
            </div>

            <div>
              <label className="font-bold text-theme-text-muted block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-theme-text text-sm font-medium focus:outline-none focus:border-theme-primary"
              />
            </div>

            {role === 'DRIVER' && (
              <div className="pt-2 border-t border-theme-border space-y-3">
                <span className="font-bold text-theme-primary uppercase tracking-wider block">
                  Captain Vehicle Details
                </span>

                <div>
                  <label className="font-bold text-theme-text-muted block mb-1">Driving License No.</label>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="KA-01-2023-009871"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-theme-text font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-theme-text-muted block mb-1">Vehicle Category</label>
                    <select
                      value={vehicleCategory}
                      onChange={(e) => setVehicleCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-theme-text font-bold"
                    >
                      <option value="BIKE">Bike Taxi</option>
                      <option value="AUTO">Auto Rickshaw</option>
                      <option value="CAB_ECONOMY">Cab Mini</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-theme-text-muted block mb-1">Plate Number</label>
                    <input
                      type="text"
                      required
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                      placeholder="KA-01-AB-1234"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-theme-text font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-2xl bg-theme-primary text-theme-secondary font-black text-sm hover:bg-theme-primary-hover shadow-subtle transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="text-center text-xs text-theme-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-theme-primary hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

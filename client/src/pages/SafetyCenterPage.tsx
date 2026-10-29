import React, { useState } from 'react';
import {
  ShieldCheck,
  Phone,
  Share2,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Heart,
  Users,
} from 'lucide-react';

export const SafetyCenterPage: React.FC = () => {
  const [trustedNumber, setTrustedNumber] = useState('');
  const [savedNumber, setSavedNumber] = useState(
    localStorage.getItem('ridex_trusted_contact') || '+91 98765 00000'
  );
  const [copied, setCopied] = useState(false);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (trustedNumber) {
      localStorage.setItem('ridex_trusted_contact', trustedNumber);
      setSavedNumber(trustedNumber);
      setTrustedNumber('');
      alert('Emergency trusted contact saved successfully!');
    }
  };

  const handleShareTrip = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-theme-text">
            RideX Safety Center
          </h1>
          <p className="text-sm text-theme-text-muted leading-relaxed">
            Your safety and peace of mind on Indian city roads is our top commitment. Learn about our verification standards, insurance coverage, and live emergency tools.
          </p>
        </div>

        {/* Emergency Escalation Section */}
        <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/30 space-y-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <h2 className="text-base font-black">Official Emergency Escalation Numbers</h2>
              <p className="text-xs text-red-700/80">
                Direct access to Indian civil and police helplines.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="tel:112"
              className="p-4 rounded-2xl bg-theme-surface border border-red-200 text-theme-text hover:border-red-500 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-red-600">National Emergency</div>
                <div className="text-xl font-black">112</div>
              </div>
              <Phone className="w-5 h-5 text-red-500" />
            </a>

            <a
              href="tel:1090"
              className="p-4 rounded-2xl bg-theme-surface border border-red-200 text-theme-text hover:border-red-500 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-pink-600">Women's Safety Helpline</div>
                <div className="text-xl font-black">1090</div>
              </div>
              <Phone className="w-5 h-5 text-pink-500" />
            </a>

            <a
              href="tel:1800247000"
              className="p-4 rounded-2xl bg-theme-surface border border-red-200 text-theme-text hover:border-red-500 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-theme-primary">RideX 24x7 Safety Desk</div>
                <div className="text-xl font-black">1800-RIDEX</div>
              </div>
              <Phone className="w-5 h-5 text-theme-primary" />
            </a>
          </div>
        </div>

        {/* Live Trip Sharing & Trusted Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trusted Contact Box */}
          <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-theme-primary" />
              <h3 className="text-base font-bold text-theme-text">Emergency Trusted Contact</h3>
            </div>
            <p className="text-xs text-theme-text-muted leading-relaxed">
              Save a trusted family member or friend's mobile number. During an active trip, your live GPS link can be dispatched instantly.
            </p>

            <div className="p-3.5 rounded-2xl bg-theme-surface-hover border border-theme-border flex items-center justify-between text-xs">
              <span className="text-theme-text-muted">Current Contact:</span>
              <span className="font-mono font-bold text-theme-text">{savedNumber}</span>
            </div>

            <form onSubmit={handleSaveContact} className="flex gap-2">
              <input
                type="tel"
                value={trustedNumber}
                onChange={(e) => setTrustedNumber(e.target.value)}
                placeholder="+91..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-text focus:outline-none focus:border-theme-primary"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-theme-secondary text-white font-bold text-xs hover:bg-black transition-colors"
              >
                Update
              </button>
            </form>
          </div>

          {/* Live Trip Share Box */}
          <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
            <div className="flex items-center gap-2.5">
              <Share2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-theme-text">Trip Telemetry Sharing</h3>
            </div>
            <p className="text-xs text-theme-text-muted leading-relaxed">
              Anyone with your private tracking URL can view captain details, vehicle plate number, and real-time map route without needing an app.
            </p>

            <button
              type="button"
              onClick={handleShareTrip}
              className="w-full py-3.5 rounded-xl bg-theme-primary text-theme-secondary font-black text-xs hover:bg-theme-primary-hover shadow-subtle transition-all flex items-center justify-center gap-2"
            >
              <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Ride Sharing Link'}</span>
            </button>
          </div>
        </div>

        {/* Verification & Standards Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-black font-display text-theme-text">
            RideX 4-Pillar Safety Standards
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Rigorous Captain Screening',
                desc: 'Government-issued Driving License, RC Book, Commercial Badge, and police verification check before first ride.',
              },
              {
                title: 'Mandatory Sanitized Helmets',
                desc: 'Every bike taxi ride includes an ISI-certified sanitized safety helmet for the passenger.',
              },
              {
                title: 'Secure OTP Authorization',
                desc: 'Drivers cannot initiate the ride without verifying your unique 4-digit OTP shown in the RideX app.',
              },
              {
                title: 'Comprehensive Ride Insurance',
                desc: 'Every active passenger and captain is covered under group personal accident insurance during the trip.',
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <h3 className="text-sm font-bold text-theme-text">{pillar.title}</h3>
                </div>
                <p className="text-xs text-theme-text-muted leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

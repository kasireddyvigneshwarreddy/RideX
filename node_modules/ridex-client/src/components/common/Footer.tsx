import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, ArrowUpRight, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-theme-surface border-t border-theme-border text-theme-text transition-colors mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-theme-secondary flex items-center justify-center border-2 border-theme-primary">
                <span className="font-display font-black text-xl text-theme-primary">X</span>
              </div>
              <span className="font-display font-black text-2xl tracking-tight text-theme-text">
                Ride<span className="text-theme-primary">X</span>
              </span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-theme-primary text-theme-secondary">
                India
              </span>
            </Link>

            <p className="text-sm text-theme-text-muted leading-relaxed max-w-sm">
              India's fastest bike taxi, auto, and cab booking ecosystem. Transparent rupee pricing, instant doorstep pickups, zero meter haggling, and verified captains.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-emerald-600">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Ride Insured & 24x7 Safety Emergency Desk</span>
            </div>

            <div className="flex items-center gap-4 pt-1 text-xs text-theme-text-muted">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-theme-primary" /> 1800-RIDEX-247
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-theme-primary" /> support@ridex.in
              </span>
            </div>
          </div>

          {/* Ride Options */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-4">
              Ride Options
            </h4>
            <ul className="space-y-2.5 text-sm text-theme-text">
              <li>
                <Link to="/book?category=BIKE" className="hover:text-theme-primary transition-colors flex items-center gap-1">
                  RideX Bike Taxi <ArrowUpRight className="w-3 h-3 text-theme-text-muted" />
                </Link>
              </li>
              <li>
                <Link to="/book?category=AUTO" className="hover:text-theme-primary transition-colors flex items-center gap-1">
                  RideX Auto Rickshaw <ArrowUpRight className="w-3 h-3 text-theme-text-muted" />
                </Link>
              </li>
              <li>
                <Link to="/book?category=CAB_ECONOMY" className="hover:text-theme-primary transition-colors flex items-center gap-1">
                  RideX Cab Mini <ArrowUpRight className="w-3 h-3 text-theme-text-muted" />
                </Link>
              </li>
              <li>
                <Link to="/book?category=CAB_PREMIUM" className="hover:text-theme-primary transition-colors flex items-center gap-1">
                  RideX Prime Sedan <ArrowUpRight className="w-3 h-3 text-theme-text-muted" />
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-theme-primary transition-colors">
                  Daily Commute Passes
                </Link>
              </li>
            </ul>
          </div>

          {/* Captain & Partner */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-4">
              Captains & Partners
            </h4>
            <ul className="space-y-2.5 text-sm text-theme-text">
              <li>
                <Link to="/driver" className="hover:text-theme-primary transition-colors font-bold text-theme-primary">
                  Become a RideX Captain
                </Link>
              </li>
              <li>
                <Link to="/driver" className="hover:text-theme-primary transition-colors">
                  Captain Earnings & Bonus
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-theme-primary transition-colors">
                  Captain Safety Standards
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-theme-primary transition-colors">
                  Referral Rewards Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Operating Hubs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-4">
              Top Cities
            </h4>
            <ul className="space-y-2 text-xs text-theme-text-muted">
              <li>Bengaluru (HQ)</li>
              <li>Hyderabad</li>
              <li>Mumbai & Pune</li>
              <li>Delhi NCR & Gurugram</li>
              <li>Chennai</li>
              <li>Kolkata</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-10 border-t border-theme-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-theme-text-muted">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} RideX Mobility Technologies India Pvt Ltd. Made with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>for urban commuters.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">
              Demo Environment Active
            </span>
            <Link to="/safety" className="hover:text-theme-text">Privacy Policy</Link>
            <Link to="/safety" className="hover:text-theme-text">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

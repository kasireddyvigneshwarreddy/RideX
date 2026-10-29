import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Palette,
  Bell,
  User,
  LogOut,
  Shield,
  Zap,
  Car,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications, unreadCount = 0 }) => {
  const { user, isAuthenticated, logout, loginAs } = useAuth();
  const { setIsSettingsOpen, currentThemeMeta } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDemoSwitch = async (role: 'customer' | 'driver' | 'admin') => {
    setDemoDropdownOpen(false);
    await loginAs(role);
    if (role === 'driver') navigate('/driver');
    else if (role === 'admin') navigate('/admin');
    else navigate('/book');
  };

  const navLinks = [
    { label: 'Book Ride', path: '/book' },
    { label: 'Safety', path: '/safety' },
    { label: 'Offers', path: '/offers' },
    { label: 'Drive with Us', path: '/driver' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-theme-surface/95 backdrop-blur-md border-b border-theme-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-theme-secondary flex items-center justify-center border-2 border-theme-primary shadow-sm group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-xl text-theme-primary">X</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-2xl tracking-tight text-theme-text">
                  Ride<span className="text-theme-primary">X</span>
                </span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-theme-primary text-theme-secondary tracking-wider">
                  India
                </span>
              </div>
              <p className="text-[10px] font-medium text-theme-text-muted -mt-1 hidden sm:block">
                City Bike Taxi & Cabs
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-theme-text bg-theme-surface-hover font-bold border border-theme-border'
                      : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-lg text-sm font-bold text-theme-primary bg-theme-secondary transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-full bg-theme-primary-light text-theme-secondary border border-theme-primary/30 hover:bg-theme-primary/20 transition-colors shadow-sm"
                title="Switch demo role instantly"
              >
                <Sparkles className="w-3.5 h-3.5 text-theme-primary" />
                <span className="hidden sm:inline">Demo:</span>
                <span className="uppercase text-[11px] font-extrabold">
                  {user ? user.role : 'Guest'}
                </span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-theme-surface border border-theme-border shadow-elevated p-2 z-50">
                  <div className="text-[10px] font-bold text-theme-text-muted uppercase px-2 py-1">
                    Instant Demo Logins
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('customer')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-theme-surface-hover flex items-center justify-between"
                  >
                    <span>👤 Customer (Aarav)</span>
                    <span className="text-[10px] text-theme-text-muted">₹50 off</span>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('driver')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-theme-surface-hover flex items-center justify-between"
                  >
                    <span>🛵 Captain (Rajesh)</span>
                    <span className="text-[10px] text-theme-primary font-bold">Driver</span>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('admin')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-theme-surface-hover flex items-center justify-between"
                  >
                    <span>⚡ Admin (RideX Ops)</span>
                    <span className="text-[10px] text-emerald-500 font-bold">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {/* Theme Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover transition-colors"
              title={`Change Theme (Current: ${currentThemeMeta.name})`}
            >
              <Palette className="w-5 h-5 text-theme-primary" />
            </button>

            {/* Notification Bell */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            )}

            {/* User Dropdown or Sign In */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-theme-surface-hover transition-colors border border-theme-border"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover border border-theme-primary"
                  />
                  <span className="hidden lg:inline text-xs font-bold text-theme-text max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-theme-text-muted" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-theme-surface border border-theme-border shadow-elevated p-2 z-50">
                    <div className="px-3 py-2 border-b border-theme-border mb-1">
                      <p className="text-sm font-bold text-theme-text truncate">{user.name}</p>
                      <p className="text-xs text-theme-text-muted truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-theme-primary-light text-theme-secondary">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-theme-text hover:bg-theme-surface-hover"
                    >
                      <User className="w-4 h-4 text-theme-primary" />
                      <span>My Profile & Addresses</span>
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-theme-text hover:bg-theme-surface-hover"
                    >
                      <Car className="w-4 h-4 text-theme-primary" />
                      <span>Ride History & Receipts</span>
                    </Link>

                    {user.role === 'DRIVER' && (
                      <Link
                        to="/driver"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-theme-surface-hover"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Driver Captain Console</span>
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-theme-surface-hover"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full mt-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-theme-text hover:text-theme-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/book"
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-theme-primary text-theme-secondary hover:bg-theme-primary-hover shadow-sm transition-all transform active:scale-95"
                >
                  Get a Ride
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-theme-surface border-b border-theme-border px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-theme-text hover:bg-theme-surface-hover"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-bold text-theme-primary bg-theme-secondary"
            >
              Admin Panel
            </Link>
          )}
          {!isAuthenticated && (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-theme-border font-bold text-sm text-theme-text"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-theme-primary text-theme-secondary font-bold text-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

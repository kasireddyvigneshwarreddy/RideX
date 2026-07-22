import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link2, LayoutDashboard, User, LogOut, Sun, Moon, Rocket } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Link2 className="logo-icon" />
          <span>Shorty</span>
        </Link>

        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/profile"
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                <User size={18} />
                <span>Profile</span>
              </Link>
            </>
          ) : null}
        </div>

        <div className="navbar-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-primary btn-icon">
                <Rocket size={16} />
                <span>Go Live</span>
              </Link>
              <div className="user-profile-menu">
                <span className="user-name">Hi, {user?.name}</span>
                <button onClick={handleLogout} className="logout-btn" title="Logout">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/dashboard" className="btn btn-primary btn-icon">
                <Rocket size={16} />
                <span>Go Live</span>
              </Link>
              {location.pathname !== '/login' && (
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
              )}
              {location.pathname !== '/register' && (
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

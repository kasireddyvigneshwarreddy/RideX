import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ThemeDrawer } from './components/common/ThemeDrawer';
import { NotificationDrawer } from './components/common/NotificationDrawer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { BookingPage } from './pages/BookingPage';
import { RideTrackingPage } from './pages/RideTrackingPage';
import { DriverDashboardPage } from './pages/DriverDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { RideHistoryPage } from './pages/RideHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SafetyCenterPage } from './pages/SafetyCenterPage';
import { OffersPage } from './pages/OffersPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const App: React.FC = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-theme-bg text-theme-text font-sans antialiased transition-colors">
            {/* Global Navbar */}
            <Navbar
              onOpenNotifications={() => setIsNotificationOpen(true)}
              unreadCount={unreadCount}
            />

            {/* Main Page Content */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/book" element={<BookingPage />} />
                <Route path="/ride/:id" element={<RideTrackingPage />} />
                <Route path="/driver" element={<DriverDashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/history" element={<RideHistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/safety" element={<SafetyCenterPage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />

            {/* Settings & Theme Drawer */}
            <ThemeDrawer />

            {/* Notifications Drawer */}
            <NotificationDrawer
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              onNotificationsChanged={() => setUnreadCount(0)}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

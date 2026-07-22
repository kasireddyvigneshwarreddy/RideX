import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { Navbar } from '../components/Navbar';
import { User, Lock, AlertTriangle, ShieldAlert, Key } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.put('/user/profile/password', { currentPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      showToast(message, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await api.delete('/user/profile');
      showToast('Account deleted successfully. We hope to see you again!', 'success');
      logout();
      navigate('/register');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete account';
      showToast(message, 'error');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="dashboard-container">
        <header className="dashboard-header">
          <h1>Account Profile</h1>
          <p>Manage your account settings and credentials</p>
        </header>

        <div className="profile-grid">
          {/* Details & Password Card */}
          <div className="profile-main-card">
            <div className="profile-details-section">
              <div className="profile-avatar-large">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="profile-details-info">
                <h3>{user?.name}</h3>
                <span className="profile-email">{user?.email}</span>
              </div>
            </div>

            <hr className="profile-divider" />

            <h3 className="section-title">Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-grid">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" size={18} />
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" size={18} />
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-icon" disabled={isChangingPassword}>
                <Key size={16} />
                <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>

          {/* Danger Zone Card */}
          <div className="profile-side-card danger-zone-card">
            <div className="danger-zone-header">
              <ShieldAlert className="danger-icon" size={24} />
              <h3>Danger Zone</h3>
            </div>
            <p className="danger-desc">
              Once you delete your account, there is no going back. All your shortened links and analytics will be permanently removed.
            </p>
            
            {showDeleteConfirm ? (
              <div className="delete-confirm-box">
                <p className="confirm-warning">
                  <AlertTriangle size={16} /> Are you absolutely sure?
                </p>
                <div className="confirm-actions">
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeletingAccount}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? 'Deleting...' : 'Yes, Delete Account'}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="btn btn-danger btn-block" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete My Account
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Phone,
  Mail,
  Home,
  Briefcase,
  Dumbbell,
  MapPin,
  Gift,
  Share2,
  Trash2,
  Plus,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi, addressesApi } from '../services/api';
import { SavedAddress } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [updating, setUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New address form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState<'HOME' | 'WORK' | 'GYM' | 'OTHER'>('HOME');
  const [newTitle, setNewTitle] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const fetchAddresses = async () => {
    try {
      const res = await addressesApi.getAll();
      if (res.success && res.addresses) {
        setSavedAddresses(res.addresses);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      fetchAddresses();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSaveSuccess(false);
    try {
      await authApi.updateProfile({ name, phone });
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addressesApi.add({
        label: newLabel,
        title: newTitle || `${newLabel} Location`,
        address: newAddress,
        lat: 12.9716, // Bangalore default
        lng: 77.5946,
        isFavorite: true,
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewAddress('');
      fetchAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await addressesApi.delete(id);
      fetchAddresses();
    } catch {
      // Ignore
    }
  };

  const getAddressIcon = (label: string) => {
    switch (label) {
      case 'HOME':
        return <Home className="w-4 h-4 text-blue-500" />;
      case 'WORK':
        return <Briefcase className="w-4 h-4 text-amber-500" />;
      case 'GYM':
        return <Dumbbell className="w-4 h-4 text-red-500" />;
      default:
        return <MapPin className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black font-display text-theme-text">My Account & Saved Places</h1>
          <p className="text-xs text-theme-text-muted">
            Manage your personal profile, frequent commute addresses, and referral rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Profile Card */}
          <div className="md:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-5">
              <div className="text-center space-y-3">
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  }
                  alt={user?.name}
                  className="w-20 h-20 rounded-3xl object-cover border-2 border-theme-primary mx-auto shadow-sm"
                />
                <div>
                  <h2 className="text-lg font-bold text-theme-text">{user?.name}</h2>
                  <p className="text-xs text-theme-text-muted">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-theme-primary-light text-theme-secondary">
                    {user?.role} Account
                  </span>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-theme-text-muted block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-theme-text font-medium focus:outline-none focus:border-theme-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-theme-text-muted block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-theme-text font-medium focus:outline-none focus:border-theme-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-3 rounded-xl bg-theme-secondary text-white font-bold text-xs hover:bg-black transition-colors flex items-center justify-center gap-1.5"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Changes Saved!</span>
                    </>
                  ) : updating ? (
                    <span>Saving...</span>
                  ) : (
                    <span>Save Profile Updates</span>
                  )}
                </button>
              </form>
            </div>

            {/* Referral Rewards Box */}
            <div className="p-6 rounded-3xl bg-theme-secondary text-white shadow-elevated space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
                  Refer & Earn ₹150
                </span>
                <Gift className="w-5 h-5 text-theme-primary" />
              </div>
              <p className="text-xs text-gray-300">
                Share your referral code with friends. They get ₹50 off and you earn ₹50 credit per completed ride!
              </p>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
                <span className="font-mono text-sm font-black tracking-widest text-theme-primary">
                  {user?.referralCode || 'AARAV99'}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user?.referralCode || 'AARAV99');
                    alert('Referral code copied to clipboard!');
                  }}
                  className="text-xs font-bold text-white hover:underline flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Saved Places Management */}
          <div className="md:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-theme-text">Saved Commute Places</h3>
                  <p className="text-xs text-theme-text-muted">
                    Quick shortcuts for faster pickup and destination entry.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-theme-primary text-theme-secondary font-bold text-xs hover:bg-theme-primary-hover flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Place</span>
                </button>
              </div>

              <div className="space-y-3">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-2xl border border-theme-border bg-theme-bg flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-theme-surface border border-theme-border flex items-center justify-center shrink-0">
                        {getAddressIcon(addr.label)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-theme-text">{addr.title}</h4>
                          <span className="text-[10px] font-bold uppercase text-theme-text-muted bg-theme-surface px-1.5 py-0.5 rounded border border-theme-border">
                            {addr.label}
                          </span>
                        </div>
                        <p className="text-xs text-theme-text-muted truncate mt-0.5 max-w-sm">
                          {addr.address}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-2 rounded-lg text-theme-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form
            onSubmit={handleAddAddress}
            className="w-full max-w-md bg-theme-surface border border-theme-border rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-theme-text">Save New Address</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-theme-text-muted block mb-1">Tag Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['HOME', 'WORK', 'GYM', 'OTHER'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setNewLabel(l)}
                      className={`py-2 rounded-xl border text-center font-bold text-xs ${
                        newLabel === l
                          ? 'border-theme-primary bg-theme-primary-light text-theme-secondary'
                          : 'border-theme-border bg-theme-surface text-theme-text-muted'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-theme-text-muted block mb-1">Custom Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. My Flat (Brigade Gateway)"
                  className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-theme-text"
                />
              </div>

              <div>
                <label className="font-bold text-theme-text-muted block mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. 26/1 Dr Rajkumar Rd, Malleshwaram, Bengaluru"
                  className="w-full px-3 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-theme-text"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-theme-border text-xs font-bold text-theme-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-theme-primary text-theme-secondary font-bold text-xs"
              >
                Save Place
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

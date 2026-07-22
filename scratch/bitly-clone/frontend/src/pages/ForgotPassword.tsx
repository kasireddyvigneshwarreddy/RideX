import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/Navbar';
import { Mail, ArrowLeft, Key } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      showToast('Reset code generated successfully! Please check backend console output.', 'success');
      navigate('/reset-password');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset code';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Forgot Password</h2>
            <p>Enter your email address and we'll print a 6-digit verification code to the server logs.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-icon" disabled={isSubmitting}>
              <Key size={18} />
              <span>{isSubmitting ? 'Sending...' : 'Get Reset Code'}</span>
            </button>
          </form>

          <div className="auth-footer-links">
            <Link to="/login" className="back-link">
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

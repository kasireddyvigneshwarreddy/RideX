import React, { useState } from 'react';
import api from '../api/axios';
import { getApiErrorMessage } from '../api/getApiErrorMessage';
import { useToast } from '../context/ToastContext';
import { Link, Calendar, Hash, Type } from 'lucide-react';

interface UrlShortenerFormProps {
  onSuccess: () => void;
}

export const UrlShortenerForm: React.FC<UrlShortenerFormProps> = ({ onSuccess }) => {
  const [longUrl, setLongUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) {
      showToast('Please enter a destination URL', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        longUrl,
        title: title || undefined,
        customAlias: customAlias || undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      };

      // Call custom alias endpoint if customAlias is specified, otherwise regular shorten
      const endpoint = customAlias ? '/url/custom' : '/url/shorten';
      await api.post(endpoint, payload);

      showToast('URL shortened successfully!', 'success');
      
      // Clear form fields
      setLongUrl('');
      setTitle('');
      setCustomAlias('');
      setExpiryDate('');
      setShowAdvanced(false);
      
      // Refresh URL list
      onSuccess();
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to shorten URL'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shortener-form-card">
      <h2 className="form-title">Shorten a New Link</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="longUrl">Destination URL</label>
          <div className="input-with-icon">
            <Link className="input-icon" size={18} />
            <input
              type="url"
              id="longUrl"
              placeholder="https://example.com/very-long-link-path-to-shorten"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="toggle-advanced-wrapper">
          <button
            type="button"
            className="toggle-advanced-btn"
            onClick={() => setShowAdvanced((prev) => !prev)}
          >
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (Alias, Expiry, Title)'}
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-options-grid">
            <div className="form-group">
              <label htmlFor="title">Custom Title</label>
              <div className="input-with-icon">
                <Type className="input-icon" size={18} />
                <input
                  type="text"
                  id="title"
                  placeholder="My Social Link"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="customAlias">Custom Alias</label>
              <div className="input-with-icon">
                <Hash className="input-icon" size={18} />
                <input
                  type="text"
                  id="customAlias"
                  placeholder="custom-name"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate">Expiration Date (Optional)</label>
              <div className="input-with-icon">
                <Calendar className="input-icon" size={18} />
                <input
                  type="datetime-local"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'Shortening...' : 'Shorten Link'}
        </button>
      </form>
    </div>
  );
};

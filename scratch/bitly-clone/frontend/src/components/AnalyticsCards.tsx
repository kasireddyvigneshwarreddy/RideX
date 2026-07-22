import React from 'react';
import { Link2, MousePointerClick, TrendingUp, CheckCircle } from 'lucide-react';

interface LinkDetails {
  id: number;
  longUrl: string;
  shortCode: string;
  shortUrl: string;
  title: string;
  clickCount: number;
  isActive: boolean;
  expiryDate: string | null;
}

interface AnalyticsCardsProps {
  links: LinkDetails[];
}

export const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ links }) => {
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);

  const mostPopular = links.reduce((popular, current) => {
    if (!popular) return current;
    return current.clickCount > popular.clickCount ? current : popular;
  }, null as LinkDetails | null);

  const activeLinks = links.filter((link) => {
    if (!link.isActive) return false;
    if (link.expiryDate) {
      return new Date(link.expiryDate) > new Date();
    }
    return true;
  }).length;

  return (
    <div className="analytics-cards-grid">
      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-icon-wrapper icon-links">
            <Link2 size={22} />
          </div>
          <span className="stat-card-title">Total Links</span>
        </div>
        <div className="stat-card-value">{totalLinks}</div>
        <div className="stat-card-desc">Shortened in your account</div>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-icon-wrapper icon-clicks">
            <MousePointerClick size={22} />
          </div>
          <span className="stat-card-title">Total Clicks</span>
        </div>
        <div className="stat-card-value">{totalClicks}</div>
        <div className="stat-card-desc">Across all active codes</div>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-icon-wrapper icon-active">
            <CheckCircle size={22} />
          </div>
          <span className="stat-card-title">Active Links</span>
        </div>
        <div className="stat-card-value">{activeLinks}</div>
        <div className="stat-card-desc">Available for redirection</div>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-icon-wrapper icon-popular">
            <TrendingUp size={22} />
          </div>
          <span className="stat-card-title">Most Popular</span>
        </div>
        <div className="stat-card-value-small">
          {mostPopular && mostPopular.clickCount > 0 ? (
            <>
              <div className="popular-link-title" title={mostPopular.title}>
                {mostPopular.title}
              </div>
              <div className="popular-link-clicks">{mostPopular.clickCount} clicks</div>
            </>
          ) : (
            <div className="no-clicks-desc">No clicks recorded yet</div>
          )}
        </div>
        <div className="stat-card-desc">Top performing link</div>
      </div>
    </div>
  );
};

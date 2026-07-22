import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { Navbar } from '../components/Navbar';
import { AnalyticsCards } from '../components/AnalyticsCards';
import { UrlShortenerForm } from '../components/UrlShortenerForm';
import { QrCodeModal } from '../components/QrCodeModal';
import { 
  Search, Copy, QrCode, Trash2, Edit3, ChevronDown, 
  ChevronUp, BarChart2, Calendar, Globe, Monitor, Compass, AlertCircle, Check
} from 'lucide-react';

interface LinkDetails {
  id: number;
  longUrl: string;
  shortCode: string;
  shortUrl: string;
  title: string;
  clickCount: number;
  isActive: boolean;
  expiryDate: string | null;
  createdAt: string;
}

interface AnalyticsData {
  clickCount: number;
  browserStats: Record<String, number>;
  deviceStats: Record<String, number>;
  countryStats: Record<String, number>;
  creationDate: string;
  expiryDate: string | null;
  lastClicked: string | null;
}

export const Dashboard: React.FC = () => {
  const [links, setLinks] = useState<LinkDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'clickCount'>('createdAt');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Expanding & Analytics
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [analyticsData, setAnalyticsData] = useState<Record<number, AnalyticsData>>({});
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  // QR Modal
  const [qrModalUrl, setQrModalUrl] = useState('');
  const [qrModalTitle, setQrModalTitle] = useState('');
  const [isQrOpen, setIsQrOpen] = useState(false);

  // Editing Link
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState('');

  // Copy success indicator map
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { showToast } = useToast();

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/url/my-links');
      setLinks(response.data);
    } catch (error) {
      showToast('Failed to retrieve shortened links', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCopy = (id: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this short URL?')) return;
    try {
      await api.delete(`/url/${id}`);
      showToast('URL deleted successfully', 'success');
      fetchLinks();
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      showToast('Failed to delete URL', 'error');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editUrl) return;
    try {
      await api.put(`/url/${id}`, { longUrl: editUrl });
      showToast('Destination URL updated successfully', 'success');
      setEditingId(null);
      setEditUrl('');
      fetchLinks();
    } catch (error: any) {
      const message = error.response?.data?.longUrl || 'Failed to update URL';
      showToast(message, 'error');
    }
  };

  const toggleExpand = async (id: number, shortCode: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);
    if (!analyticsData[id]) {
      setIsAnalyticsLoading(true);
      try {
        const response = await api.get(`/analytics/${shortCode}`);
        setAnalyticsData((prev) => ({ ...prev, [id]: response.data }));
      } catch (error) {
        showToast('Failed to load link analytics', 'error');
      } finally {
        setIsAnalyticsLoading(false);
      }
    }
  };

  const triggerQrModal = (url: string, title: string) => {
    setQrModalUrl(url);
    setQrModalTitle(title);
    setIsQrOpen(true);
  };

  const startEdit = (id: number, currentUrl: string) => {
    setEditingId(id);
    setEditUrl(currentUrl);
  };

  // Filter and Sort URLs
  const filteredLinks = links
    .filter(
      (link) =>
        link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.longUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'clickCount') {
        return b.clickCount - a.clickCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Pagination calculation
  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage);
  const currentItems = filteredLinks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedId(null);
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="dashboard-container">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Create short links, configure custom aliases, and view live click analytics</p>
        </header>

        {/* Top summary widgets */}
        <AnalyticsCards links={links} />

        {/* Creation widget */}
        <UrlShortenerForm onSuccess={fetchLinks} />

        {/* URL Table and List Section */}
        <div className="table-card">
          <div className="table-card-header">
            <h3>My Links</h3>
            
            {/* Search & Sort Panel */}
            <div className="table-filters">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              <div className="sort-box">
                <select value={sortBy} onChange={(e: any) => setSortBy(e.target.value)}>
                  <option value="createdAt">Newest First</option>
                  <option value="clickCount">Most Clicked</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="table-loader-wrapper">
              <div className="loader"></div>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={40} />
              <p>No links found matching your search.</p>
            </div>
          ) : (
            <div className="url-list">
              {currentItems.map((link) => {
                const isExpanded = expandedId === link.id;
                const isEditing = editingId === link.id;
                const details = analyticsData[link.id];

                return (
                  <div key={link.id} className={`url-item-row ${isExpanded ? 'expanded' : ''}`}>
                    <div className="url-row-summary">
                      <div className="url-main-info">
                        <span className="url-title-label">{link.title}</span>
                        <div className="url-links-group">
                          <a 
                            href={link.shortUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="short-link-href"
                          >
                            {link.shortUrl}
                          </a>
                          
                          {isEditing ? (
                            <div className="inline-edit-box">
                              <input
                                type="url"
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                className="inline-edit-input"
                              />
                              <button onClick={() => handleUpdate(link.id)} className="btn btn-primary btn-xs">Save</button>
                              <button onClick={() => setEditingId(null)} className="btn btn-secondary btn-xs">Cancel</button>
                            </div>
                          ) : (
                            <span className="original-link-txt" title={link.longUrl}>{link.longUrl}</span>
                          )}
                        </div>
                      </div>

                      <div className="url-meta-metrics">
                        <div className="clicks-badge">
                          <strong>{link.clickCount}</strong> Clicks
                        </div>
                        
                        <div className="url-row-actions">
                          <button 
                            className="action-btn" 
                            onClick={() => handleCopy(link.id, link.shortUrl)}
                            title="Copy link"
                          >
                            {copiedId === link.id ? <Check size={18} style={{ color: 'var(--color-success)' }} /> : <Copy size={18} />}
                          </button>
                          
                          <button 
                            className="action-btn" 
                            onClick={() => triggerQrModal(link.shortUrl, link.title)}
                            title="QR Code"
                          >
                            <QrCode size={18} />
                          </button>

                          <button 
                            className="action-btn" 
                            onClick={() => startEdit(link.id, link.longUrl)}
                            title="Edit URL"
                          >
                            <Edit3 size={18} />
                          </button>

                          <button 
                            className="action-btn action-danger" 
                            onClick={() => handleDelete(link.id)}
                            title="Delete URL"
                          >
                            <Trash2 size={18} />
                          </button>

                          <button 
                            className="action-btn expand-toggle-btn"
                            onClick={() => toggleExpand(link.id, link.shortCode)}
                            title={isExpanded ? "Hide Analytics" : "Show Analytics"}
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Analytics Section */}
                    {isExpanded && (
                      <div className="analytics-details-panel">
                        <h4 className="panel-title">
                          <BarChart2 size={16} />
                          <span>Link Click Analytics</span>
                        </h4>

                        {isAnalyticsLoading && !details ? (
                          <div className="panel-loader-wrapper">
                            <div className="loader loader-sm"></div>
                          </div>
                        ) : details ? (
                          <div className="analytics-details-grid">
                            
                            {/* System Meta details */}
                            <div className="analytics-meta-stats">
                              <div className="meta-stat-item">
                                <Calendar size={16} />
                                <div>
                                  <span className="meta-label">Created At</span>
                                  <span className="meta-val">{new Date(details.creationDate).toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="meta-stat-item">
                                <Calendar size={16} />
                                <div>
                                  <span className="meta-label">Expiration</span>
                                  <span className="meta-val">
                                    {details.expiryDate ? new Date(details.expiryDate).toLocaleString() : 'Never'}
                                  </span>
                                </div>
                              </div>
                              <div className="meta-stat-item">
                                <Calendar size={16} />
                                <div>
                                  <span className="meta-label">Last Clicked</span>
                                  <span className="meta-val">
                                    {details.lastClicked ? new Date(details.lastClicked).toLocaleString() : 'No clicks yet'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Charts & Group breakdown maps */}
                            <div className="analytics-breakdowns">
                              {/* Browsers */}
                              <div className="breakdown-column">
                                <div className="breakdown-header">
                                  <Compass size={16} />
                                  <span>Browsers</span>
                                </div>
                                <div className="breakdown-list">
                                  {Object.keys(details.browserStats).length === 0 ? (
                                    <div className="no-data-txt">No browser logs yet</div>
                                  ) : (
                                    Object.entries(details.browserStats).map(([key, val]) => (
                                      <div key={key} className="stat-row">
                                        <span className="stat-label-txt">{key}</span>
                                        <span className="stat-val-count">{val}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Devices */}
                              <div className="breakdown-column">
                                <div className="breakdown-header">
                                  <Monitor size={16} />
                                  <span>Devices</span>
                                </div>
                                <div className="breakdown-list">
                                  {Object.keys(details.deviceStats).length === 0 ? (
                                    <div className="no-data-txt">No device logs yet</div>
                                  ) : (
                                    Object.entries(details.deviceStats).map(([key, val]) => (
                                      <div key={key} className="stat-row">
                                        <span className="stat-label-txt">{key}</span>
                                        <span className="stat-val-count">{val}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Countries */}
                              <div className="breakdown-column">
                                <div className="breakdown-header">
                                  <Globe size={16} />
                                  <span>Countries</span>
                                </div>
                                <div className="breakdown-list">
                                  {Object.keys(details.countryStats).length === 0 ? (
                                    <div className="no-data-txt">No location logs yet</div>
                                  ) : (
                                    Object.entries(details.countryStats).map(([key, val]) => (
                                      <div key={key} className="stat-row">
                                        <span className="stat-label-txt">{key}</span>
                                        <span className="stat-val-count">{val}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                            </div>
                          </div>
                        ) : (
                          <div className="panel-error-txt">Failed to fetch click analytics details.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {/* QR overlay modal */}
      <QrCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        shortUrl={qrModalUrl}
        title={qrModalTitle}
      />
    </div>
  );
};

import React from 'react';
import { X, Download, Copy } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  title: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, shortUrl, title }) => {
  const { showToast } = useToast();
  if (!isOpen) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shortUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortUrl);
    showToast('Copied short URL to clipboard!', 'success');
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('QR Code download started', 'success');
    } catch (error) {
      showToast('Failed to download QR code', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>QR Code for {title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-desc">Scan the QR code below to access the link directly.</p>
          
          <div className="qr-image-container">
            <img src={qrCodeUrl} alt={`QR Code for ${title}`} className="qr-image" />
          </div>

          <div className="qr-link-box">
            <span className="qr-link-text">{shortUrl}</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-icon" onClick={handleCopyLink}>
            <Copy size={16} />
            <span>Copy URL</span>
          </button>
          <button className="btn btn-primary btn-icon" onClick={handleDownload}>
            <Download size={16} />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};

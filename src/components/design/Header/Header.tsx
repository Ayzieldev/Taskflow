import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useMobile } from '@/hooks/useMobile';
import DownloadModal from '@/components/design/DownloadModal/DownloadModal';
import './Header.scss';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isMobile, showInstallPrompt, installApp, isInstalled } = useMobile();
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleDownload = () => {
    setShowDownloadModal(true);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          <Link to="/" className="header__logo">
            <img 
              src={theme === 'light' ? '/Images/light-mode-logo.png' : '/Images/dark-mode-logo.png'}
              alt="Goal Tracker"
              className="header__logo-img"
            />
          </Link>
          
          {/* Desktop Actions */}
          <div className="header__actions">
            <button
              className="header__action-btn"
              onClick={handleDownload}
            >
              {isMobile && isInstalled ? '📱 Installed' : '📥 Download'}
            </button>
            
            <button
              className="header__theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </div>
      
      <DownloadModal 
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </header>
  );
};

export default Header; 
import React from 'react';
import { useElectron, isElectronApp } from '@/hooks/useElectron';
import { useTheme } from '@/context/ThemeContext';
import './DesktopHeader.scss';

const DesktopHeader: React.FC = () => {
  const { minimizeApp, toggleMaximize, quitApp } = useElectron();
  const { theme } = useTheme();

  if (!isElectronApp()) {
    return null; // Don't render on web
  }

  return (
    <div className="desktop-header">
      <div className="desktop-header__title">
        <img 
          src={theme === 'light' ? '/Images/light-mode-logo.png' : '/Images/dark-mode-logo.png'}
          alt="Goal Tracker"
          className="desktop-header__logo"
        />
        <span className="desktop-header__text">Goal Tracker</span>
      </div>
      
      <div className="desktop-header__controls">
        <button
          className="desktop-header__control-btn desktop-header__control-btn--minimize"
          onClick={minimizeApp}
          title="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="2" y="5" width="8" height="2" fill="currentColor" />
          </svg>
        </button>
        
        <button
          className="desktop-header__control-btn desktop-header__control-btn--maximize"
          onClick={toggleMaximize}
          title="Maximize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        
        <button
          className="desktop-header__control-btn desktop-header__control-btn--close"
          onClick={quitApp}
          title="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DesktopHeader;

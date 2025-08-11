import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import './MobileInstallPrompt.scss';

const MobileInstallPrompt: React.FC = () => {
  const { isMobile, showInstallPrompt, installApp } = useMobile();

  // Only render on mobile devices
  if (!isMobile || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="mobile-install-prompt">
      <div className="mobile-install-prompt__content">
        <div className="mobile-install-prompt__icon">📱</div>
        <h3 className="mobile-install-prompt__title">Install Goal Tracker</h3>
        <p className="mobile-install-prompt__description">
          Add to your home screen for quick access and offline functionality
        </p>
        <div className="mobile-install-prompt__actions">
          <button 
            className="mobile-install-prompt__btn mobile-install-prompt__btn--primary"
            onClick={installApp}
          >
            Install App
          </button>
          <button className="mobile-install-prompt__btn mobile-install-prompt__btn--secondary">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileInstallPrompt;

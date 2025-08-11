import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import './DownloadModal.scss';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const { isMobile, installApp, isInstalled, showInstallPrompt } = useMobile();

  if (!isOpen) return null;

  const handleInstall = async () => {
    try {
      await installApp();
      onClose();
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const getInstallInstructions = () => {
    if (isMobile) {
      if (isInstalled) {
        return {
          title: '🎉 Already Installed!',
          message: 'Goal Tracker is already installed on your device. You can find it on your home screen.',
          action: null
        };
      } else if (showInstallPrompt) {
        return {
          title: '📱 Install Goal Tracker',
          message: 'Add Goal Tracker to your home screen for quick access and offline functionality.',
          action: 'Install Now'
        };
      } else {
        return {
          title: '📱 Manual Installation',
          message: 'To install Goal Tracker:\n\n1. Tap the share button in your browser\n2. Select "Add to Home Screen"\n3. Tap "Add" to install',
          action: null
        };
      }
    } else {
      return {
        title: '📱 Mobile Installation',
        message: 'Goal Tracker works best on mobile devices. To install:\n\n1. Open this website on your phone\n2. Look for "Add to Home Screen" option\n3. Follow the installation prompts',
        action: null
      };
    }
  };

  const instructions = getInstallInstructions();

  return (
    <div className="download-modal-overlay" onClick={onClose}>
      <div className="download-modal" onClick={(e) => e.stopPropagation()}>
        <div className="download-modal__header">
          <h2>{instructions.title}</h2>
          <button className="download-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="download-modal__content">
          <div className="download-modal__icon">
            📱
          </div>
          
          <div className="download-modal__message">
            {instructions.message.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
          
          {instructions.action && (
            <button 
              className="download-modal__install-btn"
              onClick={handleInstall}
            >
              {instructions.action}
            </button>
          )}
          
          <div className="download-modal__features">
            <h3>✨ Features</h3>
            <ul>
              <li>📱 Works offline</li>
              <li>🎯 Track goals & tasks</li>
              <li>📊 Progress visualization</li>
              <li>🎁 Reward system</li>
              <li>📅 Daily & weekly tasks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;

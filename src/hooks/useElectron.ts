import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Check if running in Electron (can be called outside of React components)
export const isElectronApp = () => {
  return window.electronAPI !== undefined;
};

export const useElectron = () => {
  const navigate = useNavigate();

  // Check if running in Electron
  const isElectron = useCallback(() => {
    return isElectronApp();
  }, []);

  // Get app information
  const getAppVersion = useCallback(async () => {
    if (isElectron()) {
      return await window.electronAPI.getAppVersion();
    }
    return 'Web Version';
  }, [isElectron]);

  const getAppName = useCallback(async () => {
    if (isElectron()) {
      return await window.electronAPI.getAppName();
    }
    return 'Goal Tracker';
  }, [isElectron]);

  // Window controls
  const quitApp = useCallback(async () => {
    if (isElectron()) {
      await window.electronAPI.quitApp();
    }
  }, [isElectron]);

  const minimizeApp = useCallback(async () => {
    if (isElectron()) {
      await window.electronAPI.minimizeApp();
    }
  }, [isElectron]);

  const toggleMaximize = useCallback(async () => {
    if (isElectron()) {
      await window.electronAPI.toggleMaximize();
    }
  }, [isElectron]);

  // Handle menu events
  useEffect(() => {
    if (!isElectron()) return;

    // Menu event handlers
    const handleNewGoal = () => {
      navigate('/goal-creation');
    };

    const handleExportData = () => {
      // TODO: Implement data export functionality
      console.log('Export data requested');
    };

    const handleAbout = () => {
      // TODO: Show about dialog
      console.log('About requested');
    };

    // Set up event listeners
    window.electronAPI.onMenuNewGoal(handleNewGoal);
    window.electronAPI.onMenuExportData(handleExportData);
    window.electronAPI.onMenuAbout(handleAbout);

    // Cleanup
    return () => {
      window.electronAPI.removeAllListeners('menu-new-goal');
      window.electronAPI.removeAllListeners('menu-export-data');
      window.electronAPI.removeAllListeners('menu-about');
    };
  }, [isElectron, navigate]);

  return {
    isElectron: isElectron(),
    getAppVersion,
    getAppName,
    quitApp,
    minimizeApp,
    toggleMaximize
  };
};

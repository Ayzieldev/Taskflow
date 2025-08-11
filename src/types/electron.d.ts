declare global {
  interface Window {
    electronAPI: {
      // App information
      getAppVersion: () => Promise<string>;
      getAppName: () => Promise<string>;
      
      // Window controls
      quitApp: () => Promise<void>;
      minimizeApp: () => Promise<void>;
      toggleMaximize: () => Promise<void>;
      
      // Menu events
      onMenuNewGoal: (callback: () => void) => void;
      onMenuExportData: (callback: () => void) => void;
      onMenuAbout: (callback: () => void) => void;
      
      // Remove listeners
      removeAllListeners: (channel: string) => void;
    };
    process: {
      platform: string;
      env: {
        NODE_ENV: string;
      };
    };
  }
}

export {};
